import axios from 'axios'


// Create a pre-configured axios instance with the base API URL and credentials support
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true, // send cookies (access/refresh tokens) with every request
    headers: {
        "Content-Type": "application/json",
    },
})

let isRefreshing = false

// Queue of callbacks waiting for the token refresh to complete
let refreshSubscribers: ((error?: any) => void)[] = []

const handleLogout = () => {
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'
    }
}

// Adds a callback to the queue to be called once the token is refreshed or failed
const subscribeTokenRefresh = (callback: (error?: any) => void) => {
    refreshSubscribers.push(callback)
}

// Calls all queued callbacks after a successful token refresh or failure, then clears the queue
const onRefreshed = (error?: any) => {
    refreshSubscribers.forEach((callback) => callback(error))
    refreshSubscribers = []
}

// Request interceptor — passes requests through unchanged (placeholder for future auth header injection)
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

// Response interceptor — handles 401 Unauthorized errors by attempting a token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        const isRefreshRequest = originalRequest.url?.includes('/api/refresh-token')
        const isAuthRequest = originalRequest.url?.includes('/login') || originalRequest.url?.includes('/registration')
        const isAuthPage = typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup')

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isAuthRequest && !isAuthPage) {
            // If a refresh is already in progress, queue this request to retry after refresh
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh((err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(axiosInstance(originalRequest))
                        }
                    })
                })
            }

            isRefreshing = true
            originalRequest._retry = true // mark so we don't retry infinitely

            try {
                // Attempt to get a new access token using the refresh token cookie
                await axiosInstance.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`, 
                    {},
                    { withCredentials: true }
                )

                isRefreshing = false
                onRefreshed() // notify all queued requests to retry (success)
                return axiosInstance(originalRequest) // retry the original request
            } catch(err) {
                // Refresh failed — clear state, notify subscribers, and handle logout
                isRefreshing = false
                onRefreshed(err) // notify all queued requests that refresh failed
                handleLogout()
                return Promise.reject(err)
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
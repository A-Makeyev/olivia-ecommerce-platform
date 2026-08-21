import Redis from 'ioredis'


const REDIS_URI = process.env.REDIS_URI
if (!REDIS_URI) {
    throw new Error('REDIS_URI is required. Set it in your .env file.')
}

const redis = new Redis(REDIS_URI, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: true
})

redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message)
})

export const disconnect = () => redis.quit()

export const pingRedis = async (timeoutMs = 2000): Promise<boolean> => {
    try {
        const pingPromise = redis.ping()
        const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Redis ping timeout')), timeoutMs)
        )
        const res = await Promise.race([pingPromise, timeoutPromise])
        return res === 'PONG'
    } catch {
        return false
    }
}

export default redis
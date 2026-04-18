import prisma from "@packages/libs/prisma"


let isHealthy = false

export const isDbConnected = () => isHealthy

export const connectToDatabase = async () => {
    const maxRetries = 6
    const initialDelay = 1000 
    const maxDelay = 30000  

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[DB] Attempting connection... (${attempt}/${maxRetries})`)
            await prisma.$connect()
            
            isHealthy = true
            console.log('[DB] Connected to MongoDB')
            
            startKeepAlivePing()
            return
        } catch (error) {
            isHealthy = false
            console.error(`❌ [DB] Connection failed:`, error instanceof Error ? error.message : error)

            if (attempt === maxRetries) {
                console.error('[DB] Could not connect to database after maximum retries')
                process.exit(1)
            }

            const backoff = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay)
            const jitter = Math.random() * 1000 
            const sleepTime = backoff + jitter

            console.log(`[DB] Retrying in ${(sleepTime/1000).toFixed(1)}s...`)
            await new Promise((resolve) => setTimeout(resolve, sleepTime))
        }
    }
}

// Periodically pings the database to prevent MongoDB Atlas from pausing the cluster due to inactivity
const startKeepAlivePing = () => {
    const PING_INTERVAL_MS = 6 * 60 * 60 * 1000 

    setInterval(async () => {
        try {
            await prisma.$runCommandRaw({ ping: 1 })
            isHealthy = true
            console.log(`[DB] Keep-alive ping successful at ${new Date().toLocaleTimeString()}`)
        } catch (error) {
            isHealthy = false
            console.warn('[DB] Keep-alive ping failed. Database might be unreachable')
        }
    }, PING_INTERVAL_MS)
}

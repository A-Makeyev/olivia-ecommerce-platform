import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './routes/auth.router'
import swaggerUi from 'swagger-ui-express'
import { errorMiddleware } from '@packages/error-handler/error-middleware'
import { connectToDatabase, isDbConnected } from './utils/db-connection'


const swaggerDocument = require('./swagger-output.json')
const app = express()

app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'})
})

app.get('/health', (req, res) => {
    const dbStatus = isDbConnected() ? 'connected' : 'disconnected'
    res.status(isDbConnected() ? 200 : 503).json({
        status: 'UP',
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});

// Documentation

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/docs-json', (req, res) => {
    res.json(swaggerDocument)
})

// Routes
app.use('/api', router)

app.use(errorMiddleware)

const startServer = async () => {
    await connectToDatabase()

    const port = process.env.PORT || 6001
    const server = app.listen(port, () => {
        console.log(`>>> Auth Service is running on http://localhost:${port}/api`)
        console.log(`>>> Swagger docs available at http://localhost:${port}/api-docs`)
    })

    server.on('error', (err) => {
        console.error('Error starting the server:', err)
    })
}

startServer()

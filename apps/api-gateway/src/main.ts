import * as path from 'path'
import express from 'express'
import proxy from 'express-http-proxy'
import swaggerUi from 'swagger-ui-express'
import axios from 'axios'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

const app = express()

app.set('trust proxy', 1)

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

app.use(morgan('dev'))
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(cookieParser())

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: true
})

app.use(limiter)
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' })
})

app.get('/', proxy('http://localhost:6001'))

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`)
})
server.on('error', console.error)

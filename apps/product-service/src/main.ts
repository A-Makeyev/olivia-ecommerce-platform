import { errorMiddleware } from '@packages/error-handler/error-middleware'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import router from './routes/product.router'
// import './jobs/product-cron.job'


const swaggerDocument = require('./swagger-output.json')
const app = express()

app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ 'message': 'Product Service API'})
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/docs-json', (req, res) => {
    res.json(swaggerDocument)
})

app.use('/api', router)
app.use(errorMiddleware)

const port = process.env.PORT || 6002
const server = app.listen(port, () => {
  console.log(`>>> Product service is running on http://localhost:${port}/api`)
  console.log(`>>> Product docs available at http://localhost:${port}/api-docs`)
})

server.on('error', (err) => {
  console.error('Error starting the server:', err)
})
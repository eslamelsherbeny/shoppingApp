const path = require('path')

const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')
const compression = require('compression')

dotenv.config()
const ApiError = require('./utils/apiError')
const globalError = require('./middlewares/errorMiddleware')
const dbConnection = require('./config/database')
// Routes
const mountRoutes = require('./routes')
const { webhookCheckout } = require('./services/orderService')

// Connect with db
dbConnection()

// express app
const app = express()

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://assum.vercel.app',
      'https://basma-alpha.vercel.app',
      'http://localhost:8000',
    ],

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.options('*', cors())

app.use(compression())

// Checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
)

app.use(express.json())
app.use(express.static(path.join(__dirname, 'uploads')))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
  console.log(`mode: ${process.env.NODE_ENV}`)
}

mountRoutes(app)

app.get('/', (req, res) => {
  res.send('Welcome to the API ')
})

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400))
})

app.use(globalError)

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`)
})

process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`)
  server.close(() => {
    console.error(`Shutting down....`)
    process.exit(1)
  })
})

import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' })
})

app.use('/api/auth', authRouter)

app.use(notFound)
app.use(errorHandler)

export default app

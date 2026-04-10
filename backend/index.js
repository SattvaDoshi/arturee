import app from './src/app.js'
import env from './src/config/env.js'
import connectDB from './src/config/db.js'

const startServer = async () => {
	try {
		await connectDB()

		app.listen(env.port, () => {
			console.log(`Server running on port ${env.port}`)
		})
	} catch (error) {
		console.error('Failed to start server:', error.message)
		process.exit(1)
	}
}

startServer()

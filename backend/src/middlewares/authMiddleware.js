import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { verifyAuthToken } from '../utils/token.js'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Unauthorized: token missing')
    }

    const decoded = verifyAuthToken(token)
    const user = await User.findById(decoded.userId)

    if (!user) {
      throw new ApiError(401, 'Unauthorized: user not found')
    }

    req.user = user
    next()
  } catch (error) {
    next(new ApiError(401, 'Unauthorized: invalid token'))
  }
}

export default authMiddleware

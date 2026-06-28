import ApiError from '../utils/ApiError.js'

/**
 * Admin middleware — must be used AFTER authMiddleware.
 * Checks that the authenticated user has role === 'admin'.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized: not authenticated'))
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: admin access required'))
  }

  next()
}

export default adminMiddleware

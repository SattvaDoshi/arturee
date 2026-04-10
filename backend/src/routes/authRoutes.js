import { Router } from 'express'
import {
  signupController,
  verifySignupOtpController,
  resendSignupOtpController,
  loginController,
  googleAuthController,
  forgotPasswordController,
  resetPasswordController,
  updatePasswordController
} from '../controllers/authController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const authRouter = Router()

authRouter.post('/signup', signupController)
authRouter.post('/verify-signup-otp', verifySignupOtpController)
authRouter.post('/resend-signup-otp', resendSignupOtpController)
authRouter.post('/login', loginController)
authRouter.post('/google', googleAuthController)
authRouter.post('/forgot-password', forgotPasswordController)
authRouter.post('/reset-password', resetPasswordController)
authRouter.post('/update-password', authMiddleware, updatePasswordController)

export default authRouter

import asyncHandler from '../utils/asyncHandler.js'
import {
  signup,
  verifySignupOtp,
  resendSignupOtp,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  updatePassword
} from '../services/authService.js'

export const signupController = asyncHandler(async (req, res) => {
  const result = await signup(req.body)
  res.status(201).json({ success: true, ...result })
})

export const verifySignupOtpController = asyncHandler(async (req, res) => {
  const result = await verifySignupOtp(req.body)
  res.status(200).json({ success: true, ...result })
})

export const resendSignupOtpController = asyncHandler(async (req, res) => {
  const result = await resendSignupOtp(req.body)
  res.status(200).json({ success: true, ...result })
})

export const loginController = asyncHandler(async (req, res) => {
  const result = await login(req.body)
  res.status(200).json({ success: true, ...result })
})

export const googleAuthController = asyncHandler(async (req, res) => {
  const result = await googleAuth(req.body)
  res.status(200).json({ success: true, ...result })
})

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = await forgotPassword(req.body)
  res.status(200).json({ success: true, ...result })
})

export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await resetPassword(req.body)
  res.status(200).json({ success: true, ...result })
})

export const updatePasswordController = asyncHandler(async (req, res) => {
  const result = await updatePassword({
    userId: req.user._id,
    ...req.body
  })
  res.status(200).json({ success: true, ...result })
})

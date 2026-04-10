import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import env from '../config/env.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { randomToken, sha256 } from '../utils/crypto.js'
import { sendEmail } from '../utils/mailer.js'
import { generateOtp, getOtpExpiryDate } from '../utils/otp.js'
import { createAuthToken } from '../utils/token.js'

const SALT_ROUNDS = 10
const RESET_TOKEN_MINUTES = 15

const googleClient = new OAuth2Client(env.googleClientId || undefined)

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isEmailVerified: user.isEmailVerified,
  authProvider: user.authProvider
})

const issueAuthResponse = (user) => ({
  token: createAuthToken({ userId: user._id }),
  user: sanitizeUser(user)
})

const validateEmail = (email) => /\S+@\S+\.\S+/.test(String(email).toLowerCase())

export const signup = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required')
  }
  if (!validateEmail(email)) {
    throw new ApiError(400, 'Invalid email format')
  }
  if (String(password).length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long')
  }

  const normalizedEmail = email.toLowerCase().trim()
  const existingUser = await User.findOne({ email: normalizedEmail })

  if (existingUser?.isEmailVerified) {
    throw new ApiError(409, 'Email already registered')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const otp = generateOtp()
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS)
  const otpExpiresAt = getOtpExpiryDate(10)

  let user = existingUser
  if (!user) {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      authProvider: 'local',
      otpHash,
      otpExpiresAt
    })
  } else {
    user.name = name.trim()
    user.password = passwordHash
    user.authProvider = 'local'
    user.otpHash = otpHash
    user.otpExpiresAt = otpExpiresAt
    await user.save()
  }

  await sendEmail({
    to: user.email,
    subject: 'Verify your ART account',
    html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
  })

  return { message: 'Signup successful. OTP sent to email for verification.' }
}

export const verifySignupOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required')
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  if (user.isEmailVerified) {
    return issueAuthResponse(user)
  }
  if (!user.otpHash || !user.otpExpiresAt) {
    throw new ApiError(400, 'No OTP generated. Please signup again.')
  }
  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw new ApiError(400, 'OTP expired. Please request a new OTP.')
  }

  const isValidOtp = await bcrypt.compare(String(otp), user.otpHash)
  if (!isValidOtp) {
    throw new ApiError(400, 'Invalid OTP')
  }

  user.isEmailVerified = true
  user.otpHash = null
  user.otpExpiresAt = null
  await user.save()

  return issueAuthResponse(user)
}

export const resendSignupOtp = async ({ email }) => {
  if (!email) {
    throw new ApiError(400, 'Email is required')
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified')
  }

  const otp = generateOtp()
  user.otpHash = await bcrypt.hash(otp, SALT_ROUNDS)
  user.otpExpiresAt = getOtpExpiryDate(10)
  await user.save()

  await sendEmail({
    to: user.email,
    subject: 'Your new ART verification OTP',
    html: `<p>Your new OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
  })

  return { message: 'New OTP sent to your email' }
}

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }
  if (!user.password) {
    throw new ApiError(400, 'Please continue with Google login for this account')
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid credentials')
  }
  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email first')
  }

  return issueAuthResponse(user)
}

export const googleAuth = async ({ idToken }) => {
  if (!idToken) {
    throw new ApiError(400, 'Google idToken is required')
  }
  if (!env.googleClientId) {
    throw new ApiError(500, 'GOOGLE_CLIENT_ID is not configured')
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId
  })
  const payload = ticket.getPayload()

  if (!payload?.email) {
    throw new ApiError(400, 'Google account email not available')
  }

  const email = payload.email.toLowerCase().trim()
  let user = await User.findOne({ email })

  if (!user) {
    user = await User.create({
      name: payload.name || 'Google User',
      email,
      isEmailVerified: true,
      authProvider: 'google',
      googleId: payload.sub,
      password: null
    })
  } else {
    user.authProvider = 'google'
    user.googleId = payload.sub
    user.isEmailVerified = true
    if (!user.name && payload.name) {
      user.name = payload.name
    }
    await user.save()
  }

  return issueAuthResponse(user)
}

export const forgotPassword = async ({ email }) => {
  if (!email) {
    throw new ApiError(400, 'Email is required')
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent.' }
  }

  const rawToken = randomToken(32)
  user.resetPasswordTokenHash = sha256(rawToken)
  user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)
  await user.save()

  const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`

  await sendEmail({
    to: user.email,
    subject: 'Reset your ART account password',
    html: `<p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p><p>This link expires in ${RESET_TOKEN_MINUTES} minutes.</p>`
  })

  return { message: 'If the email exists, a reset link has been sent.' }
}

export const resetPassword = async ({ email, token, newPassword }) => {
  if (!email || !token || !newPassword) {
    throw new ApiError(400, 'Email, token and newPassword are required')
  }
  if (String(newPassword).length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long')
  }

  const tokenHash = sha256(token)
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() }
  })

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token')
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS)
  user.authProvider = 'local'
  user.resetPasswordTokenHash = null
  user.resetPasswordExpiresAt = null
  await user.save()

  return { message: 'Password reset successful' }
}

export const updatePassword = async ({ userId, currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'currentPassword and newPassword are required')
  }
  if (String(newPassword).length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long')
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  if (!user.password) {
    throw new ApiError(400, 'Password update is not available for Google-only account')
  }

  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS)
  await user.save()

  return { message: 'Password updated successfully' }
}

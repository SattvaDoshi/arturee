import jwt from 'jsonwebtoken'
import env from '../config/env.js'

export const createAuthToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiry
  })
}

export const verifyAuthToken = (token) => {
  return jwt.verify(token, env.jwtSecret)
}

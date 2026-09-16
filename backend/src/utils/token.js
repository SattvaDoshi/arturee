import jwt from 'jsonwebtoken'
import env from '../config/env.js'

/**
 * Create a signed JWT embedding the userId, current sessionVersion, and sessionId.
 *
 * @param {{ userId: string, sessionVersion: number, sessionId: string }} payload
 */
export const createAuthToken = ({ userId, sessionVersion, sessionId }) => {
  return jwt.sign({ userId, sessionVersion, sessionId }, env.jwtSecret, {
    expiresIn: env.jwtExpiry
  })
}

export const verifyAuthToken = (token) => {
  return jwt.verify(token, env.jwtSecret)
}

import crypto from 'crypto'

export const randomToken = (size = 32) => crypto.randomBytes(size).toString('hex')

export const sha256 = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex')
}

import crypto from "crypto"

const ITERATIONS = 100_000
const KEYLEN = 64
const DIGEST = "sha512"

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const hashed = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST)
  const storedBuf = Buffer.from(hash, "hex")
  if (storedBuf.length !== hashed.length) return false
  return crypto.timingSafeEqual(storedBuf, hashed)
}

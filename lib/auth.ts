import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import { readDb, writeDb, type Session } from "@/lib/db"
import { verifyPassword } from "@/lib/security"

const SESSION_COOKIE = "bv_admin_session"
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

function pruneSessions(sessions: Session[]): Session[] {
  const now = Date.now()
  return sessions.filter((s) => new Date(s.expiresAt).getTime() > now)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return false
  const db = await readDb()
  const sessions = pruneSessions(db.sessions)
  const found = sessions.find((s) => s.token === token)
  if (db.sessions.length !== sessions.length) {
    db.sessions = sessions
    await writeDb(db)
  }
  return Boolean(found)
}

export async function loginAdmin(password: string): Promise<boolean> {
  const db = await readDb()
  const ok = verifyPassword(password, db.admin.passwordHash)
  if (!ok) return false

  const token = randomUUID()
  const now = new Date()
  const session: Session = {
    token,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  }
  db.sessions = pruneSessions(db.sessions)
  db.sessions.push(session)
  await writeDb(db)

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })

  return true
}

export async function logoutAdmin(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (token) {
    const db = await readDb()
    db.sessions = pruneSessions(db.sessions).filter((s) => s.token !== token)
    await writeDb(db)
  }

  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

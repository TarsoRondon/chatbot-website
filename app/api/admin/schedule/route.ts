import { isAdminAuthenticated } from "@/lib/auth"
import { readDb, writeDb, sanitizeSchedule } from "@/lib/db"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const db = await readDb()
  return Response.json(db.schedule)
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const payload = await request.json()
  const db = await readDb()
  db.schedule = sanitizeSchedule(payload)
  await writeDb(db)
  return Response.json({ ok: true })
}

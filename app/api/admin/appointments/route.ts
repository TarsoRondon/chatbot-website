import { isAdminAuthenticated } from "@/lib/auth"
import { readDb } from "@/lib/db"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const db = await readDb()
  return Response.json(db.appointments)
}

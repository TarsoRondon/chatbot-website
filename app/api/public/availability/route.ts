import { readDb } from "@/lib/db"
import { computeAvailability } from "@/lib/schedule"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const date = url.searchParams.get("date")
  const barberId = url.searchParams.get("barberId")

  if (!date) {
    return Response.json({ error: "date_required" }, { status: 400 })
  }

  const db = await readDb()
  const slots = computeAvailability(date, db.schedule, db.appointments, db.barbers, barberId)
  return Response.json({ date, slots })
}

import { readDb } from "@/lib/db"
import { computeAvailability, isDateClosed } from "@/lib/schedule"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const daysParam = Number(url.searchParams.get("days") || 14)
  const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 60) : 14

  const db = await readDb()
  const today = new Date()
  const list: string[] = []

  for (let offset = 0; offset < days; offset += 1) {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    const dateStr = d.toISOString().split("T")[0]
    if (isDateClosed(dateStr, db.schedule)) continue
    const slots = computeAvailability(dateStr, db.schedule, db.appointments, db.barbers)
    if (slots.some((s) => s.available)) {
      list.push(dateStr)
    }
  }

  return Response.json({ days: list })
}

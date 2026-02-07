import { readDb, writeDb } from "@/lib/db"
import { canBook } from "@/lib/schedule"
import type { Appointment } from "@/lib/data"

function normalizePhone(value: string) {
  return String(value || "").replace(/\D/g, "")
}

function sanitizeAppointment(input: Partial<Appointment>): Appointment {
  return {
    id: String(input.id || Date.now().toString()),
    clientName: String(input.clientName || ""),
    clientPhone: String(input.clientPhone || ""),
    serviceId: String(input.serviceId || ""),
    barberId: String(input.barberId || ""),
    barberName: String(input.barberName || ""),
    date: String(input.date || ""),
    time: String(input.time || ""),
    createdAt: String(input.createdAt || new Date().toISOString()),
  }
}

export async function GET(request: Request) {
  const db = await readDb()
  const url = new URL(request.url)
  const phone = url.searchParams.get("phone")
  const name = url.searchParams.get("name")
  let list = db.appointments

  if (phone) {
    const target = normalizePhone(phone)
    list = list.filter((a) => normalizePhone(a.clientPhone) === target)
  }
  if (name) {
    const target = name.toLowerCase().trim()
    list = list.filter((a) => a.clientName.toLowerCase().includes(target))
  }

  return Response.json(list)
}

export async function POST(request: Request) {
  const payload = await request.json()
  const db = await readDb()
  const appointment = sanitizeAppointment(payload || {})
  const check = canBook(
    appointment.date,
    appointment.time,
    db.schedule,
    db.appointments,
    db.barbers,
    appointment.barberId,
  )
  if (!check.ok) {
    return Response.json({ ok: false, reason: check.reason }, { status: 409 })
  }
  db.appointments.push(appointment)
  await writeDb(db)
  return Response.json({ ok: true, id: appointment.id })
}

export async function DELETE(request: Request) {
  const payload = await request.json()
  const id = String(payload?.id || "")
  if (!id) return Response.json({ ok: false }, { status: 400 })
  const db = await readDb()
  const next = db.appointments.filter((a) => a.id !== id)
  db.appointments = next
  await writeDb(db)
  return Response.json({ ok: true })
}

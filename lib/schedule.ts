import type { Appointment, Barber, ScheduleSettings } from "@/lib/data"

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => Number(v))
  return h * 60 + m
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function isDateClosed(dateStr: string, schedule: ScheduleSettings): boolean {
  const date = new Date(dateStr + "T12:00:00")
  const weekday = date.getDay()
  if (schedule.closedWeekdays.includes(weekday)) return true
  if (schedule.blockedDates.includes(dateStr)) return true
  return false
}

function isInBreak(timeMinutes: number, schedule: ScheduleSettings): boolean {
  return schedule.breaks.some((b) => {
    const start = timeToMinutes(b.start)
    const end = timeToMinutes(b.end)
    return timeMinutes >= start && timeMinutes < end
  })
}

export function generateSlotTimes(dateStr: string, schedule: ScheduleSettings): string[] {
  if (isDateClosed(dateStr, schedule)) return []
  const dayStart = new Date(dateStr + "T00:00:00")
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  if (dayStart < todayStart) return []

  const openMin = timeToMinutes(schedule.openTime)
  const closeMin = timeToMinutes(schedule.closeTime)
  const step = schedule.slotMinutes
  const slots: string[] = []
  const now = new Date()
  const isToday = dateStr === now.toISOString().split("T")[0]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (let t = openMin; t + step <= closeMin; t += step) {
    if (isInBreak(t, schedule)) continue
    if (isToday && t <= nowMinutes) continue
    const time = minutesToTime(t)
    if (schedule.blockedSlots.some((s) => s.date === dateStr && s.time === time)) continue
    slots.push(time)
  }
  return slots
}

function barberBlocked(barber: Barber, dateStr: string, time?: string | null): boolean {
  const weekday = new Date(dateStr + "T12:00:00").getDay()
  if ((barber.blockedWeekdays || []).includes(weekday)) return true
  if ((barber.blockedDates || []).includes(dateStr)) return true
  if (time) {
    return (barber.blockedSlots || []).some((s) => s.date === dateStr && s.time === time)
  }
  return false
}

export function computeAvailability(
  dateStr: string,
  schedule: ScheduleSettings,
  appointments: Appointment[],
  barbers: Barber[],
  barberId?: string | null,
) {
  const slots = generateSlotTimes(dateStr, schedule)

  return slots.map((time) => {
    const bookedAtTime = appointments.filter((a) => a.date === dateStr && a.time === time)
    if (barbers.length === 0) {
      return { time, available: bookedAtTime.length === 0 }
    }

    if (barberId && barberId !== "none") {
      const target = barbers.find((b) => b.id === barberId)
      if (!target) return { time, available: false }
      if (barberBlocked(target, dateStr, time)) return { time, available: false }
      const hasBooking = bookedAtTime.some((a) => a.barberId === barberId)
      return { time, available: !hasBooking }
    }

    const availableBarbers = barbers.filter((b) => !barberBlocked(b, dateStr, time))
    const bookedIds = new Set(
      bookedAtTime.map((a) => a.barberId).filter((id) => id && id !== "none"),
    )
    let freeCount = availableBarbers.filter((b) => !bookedIds.has(b.id)).length

    const unknownBookings = bookedAtTime.filter(
      (a) => !a.barberId || a.barberId === "none" || !barbers.some((b) => b.id === a.barberId),
    ).length
    freeCount = Math.max(0, freeCount - unknownBookings)

    return { time, available: freeCount > 0 }
  })
}

export function canBook(
  dateStr: string,
  time: string,
  schedule: ScheduleSettings,
  appointments: Appointment[],
  barbers: Barber[],
  barberId: string,
) {
  if (isDateClosed(dateStr, schedule)) {
    return { ok: false, reason: "dia_fechado" }
  }

  const slots = generateSlotTimes(dateStr, schedule)
  if (!slots.includes(time)) {
    return { ok: false, reason: "horario_indisponivel" }
  }

  const bookedAtTime = appointments.filter((a) => a.date === dateStr && a.time === time)
  if (barbers.length === 0) {
    if (bookedAtTime.length > 0) return { ok: false, reason: "sem_vagas" }
    return { ok: true, reason: "ok" }
  }

  if (barberId && barberId !== "none") {
    const target = barbers.find((b) => b.id === barberId)
    if (!target) return { ok: false, reason: "barbeiro_indisponivel" }
    if (barberBlocked(target, dateStr, time)) return { ok: false, reason: "barbeiro_indisponivel" }
    const hasSameBarber = bookedAtTime.some((a) => a.barberId === barberId)
    if (hasSameBarber) return { ok: false, reason: "barbeiro_ocupado" }
    return { ok: true, reason: "ok" }
  }

  const availableBarbers = barbers.filter((b) => !barberBlocked(b, dateStr, time))
  const bookedIds = new Set(
    bookedAtTime.map((a) => a.barberId).filter((id) => id && id !== "none"),
  )
  let freeCount = availableBarbers.filter((b) => !bookedIds.has(b.id)).length
  const unknownBookings = bookedAtTime.filter(
    (a) => !a.barberId || a.barberId === "none" || !barbers.some((b) => b.id === a.barberId),
  ).length
  freeCount = Math.max(0, freeCount - unknownBookings)
  if (freeCount <= 0) return { ok: false, reason: "sem_vagas" }

  return { ok: true, reason: "ok" }
}

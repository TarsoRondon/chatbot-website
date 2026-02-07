"use client"

import {
  DEFAULT_ABOUT,
  DEFAULT_BARBERS,
  DEFAULT_BUSINESS,
  DEFAULT_SCHEDULE,
  DEFAULT_SERVICES,
  type AboutTag,
  type Barber,
  type BusinessInfo,
  type Appointment,
  type Service,
  type ScheduleSettings,
} from "@/lib/data"
import { normalizePathOrUrl } from "@/lib/normalize"

export type { AboutTag, Barber, BusinessInfo, Appointment, Service, ScheduleSettings } from "@/lib/data"

// --- Local storage helpers ---

const STORAGE_KEYS = {
  services: "bv_services",
  barbers: "bv_barbers",
  business: "bv_business",
  appointments: "bv_appointments",
  client: "bv_client",
  about: "bv_about",
  schedule: "bv_schedule",
} as const

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error("fetch failed")
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

async function fetchJsonAuth<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store", credentials: "include" })
    if (!res.ok) throw new Error("fetch failed")
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

async function saveJson<T>(url: string, payload: T): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    })
    return res.ok
  } catch {
    return false
  }
}

// Services
export function getServices(): Service[] {
  return getItem(STORAGE_KEYS.services, DEFAULT_SERVICES)
}
export async function fetchServices(): Promise<Service[]> {
  const data = await fetchJson<Service[]>("/api/public/services", getServices())
  setItem(STORAGE_KEYS.services, data)
  return data
}
export async function saveServices(services: Service[]) {
  setItem(STORAGE_KEYS.services, services)
  return saveJson("/api/admin/services", services)
}

// Barbers
export function getBarbers(): Barber[] {
  return getItem(STORAGE_KEYS.barbers, DEFAULT_BARBERS)
}
export async function fetchBarbers(): Promise<Barber[]> {
  const data = await fetchJson<Barber[]>("/api/public/barbers", getBarbers())
  setItem(STORAGE_KEYS.barbers, data)
  return data
}
export async function saveBarbers(barbers: Barber[]) {
  setItem(STORAGE_KEYS.barbers, barbers)
  return saveJson("/api/admin/barbers", barbers)
}

// Business
export function getBusiness(): BusinessInfo {
  const stored = getItem(STORAGE_KEYS.business, DEFAULT_BUSINESS)
  const normalized = { ...stored, logoUrl: normalizePathOrUrl(stored.logoUrl, DEFAULT_BUSINESS.logoUrl) }
  if (normalized.logoUrl !== stored.logoUrl) {
    setItem(STORAGE_KEYS.business, normalized)
  }
  return normalized
}
export async function fetchBusiness(): Promise<BusinessInfo> {
  const data = await fetchJson<BusinessInfo>("/api/public/business", getBusiness())
  setItem(STORAGE_KEYS.business, data)
  return data
}
export async function saveBusiness(business: BusinessInfo) {
  setItem(STORAGE_KEYS.business, {
    ...business,
    logoUrl: normalizePathOrUrl(business.logoUrl, DEFAULT_BUSINESS.logoUrl),
  })
  return saveJson("/api/admin/business", {
    ...business,
    logoUrl: normalizePathOrUrl(business.logoUrl, DEFAULT_BUSINESS.logoUrl),
  })
}

// About
export function getAboutTags(): AboutTag[] {
  const list = getItem(STORAGE_KEYS.about, DEFAULT_ABOUT)
  const normalized = list.map((item) => ({
    ...item,
    photoUrl: normalizePathOrUrl(item.photoUrl, ""),
  }))
  if (JSON.stringify(list) !== JSON.stringify(normalized)) {
    setItem(STORAGE_KEYS.about, normalized)
  }
  return normalized
}
export async function fetchAboutTags(): Promise<AboutTag[]> {
  const data = await fetchJson<AboutTag[]>("/api/public/about", getAboutTags())
  setItem(STORAGE_KEYS.about, data)
  return data
}
export async function saveAboutTags(tags: AboutTag[]) {
  setItem(
    STORAGE_KEYS.about,
    tags.map((item) => ({
      ...item,
      photoUrl: normalizePathOrUrl(item.photoUrl, ""),
    })),
  )
  return saveJson(
    "/api/admin/about",
    tags.map((item) => ({
      ...item,
      photoUrl: normalizePathOrUrl(item.photoUrl, ""),
    })),
  )
}

// Schedule
export function getSchedule(): ScheduleSettings {
  return getItem(STORAGE_KEYS.schedule, DEFAULT_SCHEDULE)
}
export async function fetchSchedule(): Promise<ScheduleSettings> {
  const data = await fetchJson<ScheduleSettings>("/api/public/schedule", getSchedule())
  setItem(STORAGE_KEYS.schedule, data)
  return data
}
export async function fetchScheduleAdmin(): Promise<ScheduleSettings> {
  const data = await fetchJsonAuth<ScheduleSettings>("/api/admin/schedule", getSchedule())
  setItem(STORAGE_KEYS.schedule, data)
  return data
}
export async function saveSchedule(schedule: ScheduleSettings) {
  setItem(STORAGE_KEYS.schedule, schedule)
  return saveJson("/api/admin/schedule", schedule)
}

// Appointments
export function getAppointments(): Appointment[] {
  return getItem(STORAGE_KEYS.appointments, [])
}
export async function saveAppointment(appointment: Appointment): Promise<{ ok: boolean; reason?: string }> {
  try {
    const res = await fetch("/api/public/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, reason: String(json?.reason || "erro") }
    }
    const list = getAppointments()
    list.push(appointment)
    setItem(STORAGE_KEYS.appointments, list)
    return { ok: true }
  } catch {
    return { ok: false, reason: "erro" }
  }
}
export function cancelAppointment(id: string) {
  const list = getAppointments().filter((a) => a.id !== id)
  setItem(STORAGE_KEYS.appointments, list)
  void fetch("/api/public/appointments", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
}

export async function fetchAppointmentsAdmin(): Promise<Appointment[]> {
  return fetchJsonAuth<Appointment[]>("/api/admin/appointments", getAppointments())
}

export async function fetchAppointmentsForClient(client: ClientSession): Promise<Appointment[]> {
  const params = new URLSearchParams()
  if (client?.phone) params.set("phone", client.phone)
  if (client?.name) params.set("name", client.name)
  const data = await fetchJson<Appointment[]>(
    `/api/public/appointments?${params.toString()}`,
    getAppointments(),
  )
  setItem(STORAGE_KEYS.appointments, data)
  return data
}

// Client session
export interface ClientSession {
  name: string
  phone: string
}
export function getClient(): ClientSession | null {
  return getItem(STORAGE_KEYS.client, null)
}
export function saveClient(client: ClientSession) {
  setItem(STORAGE_KEYS.client, client)
}
export function logoutClient() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.client)
}

// Time slots
export interface TimeSlot {
  time: string
  available: boolean
}

export function generateTimeSlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = []
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const currentHour = today.getHours()
  const currentMin = today.getMinutes()

  for (let hour = 9; hour <= 20; hour++) {
    for (const min of [0, 30]) {
      if (hour === 20 && min === 30) continue
      const available = !isToday || hour > currentHour || (hour === currentHour && min > currentMin)
      const randomUnavailable = Math.random() > 0.8
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
        available: available && !randomUnavailable,
      })
    }
  }
  return slots
}

export function getNextDays(count: number): Date[] {
  const days: Date[] = []
  const today = new Date()
  let added = 0
  let offset = 0
  while (added < count) {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    offset++
    if (d.getDay() !== 0) {
      days.push(d)
      added++
    }
  }
  return days
}

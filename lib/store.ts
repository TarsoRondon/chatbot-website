"use client"

export interface Service {
  id: string
  name: string
  duration: string
  price: number
}

export interface Barber {
  id: string
  name: string
  role: string
  avatar: string
  photoUrl: string
}

export interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  serviceId: string
  barberId: string
  barberName: string
  date: string
  time: string
  createdAt: string
}

export interface BusinessInfo {
  name: string
  address: string
  phone: string
  instagram: string
  description: string
  logoUrl: string
  hours: string
}

export const DEFAULT_SERVICES: Service[] = [
  { id: "corte", name: "Corte", duration: "1hr", price: 60 },
  { id: "barba", name: "Barba", duration: "1hr", price: 60 },
  { id: "corte-barba", name: "Corte + Barba", duration: "1hr", price: 100 },
  { id: "selagem", name: "Selagem", duration: "1hr", price: 100 },
  { id: "relaxamento", name: "Relaxamento Capilar", duration: "1hr 30min", price: 150 },
  { id: "sobrancelha", name: "Sobrancelha", duration: "30min", price: 20 },
  { id: "corte-barba-selagem", name: "Corte + Barba + Selagem", duration: "1hr", price: 200 },
  { id: "corte-selagem", name: "Corte + Selagem", duration: "1hr", price: 150 },
  { id: "penteado", name: "Penteado", duration: "40min", price: 40 },
]

export const DEFAULT_BARBERS: Barber[] = [
  { id: "angelo", name: "Angelo Henrique", role: "Barbeiro", avatar: "AH", photoUrl: "" },
  { id: "marcos", name: "Marcos Silva", role: "Barbeiro", avatar: "MS", photoUrl: "" },
  { id: "joao", name: "Joao Pedro", role: "Barbeiro", avatar: "JP", photoUrl: "" },
]

export const DEFAULT_BUSINESS: BusinessInfo = {
  name: "Boto Velho Barbearia",
  address: "Avenida Alvaro Maia, 2947, Porto Velho",
  phone: "(69) 99999-9999",
  instagram: "@botovelhobarbearia",
  description: "Venha e nos faca uma visita e descubra um novo conceito, um novo corte de cabelo, uma nova barba.",
  logoUrl: "/logo.png",
  hours: "Seg - Sab, 09:00 - 19:00",
}

// --- Local storage helpers ---

const STORAGE_KEYS = {
  services: "bv_services",
  barbers: "bv_barbers",
  business: "bv_business",
  appointments: "bv_appointments",
  client: "bv_client",
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

// Services
export function getServices(): Service[] {
  return getItem(STORAGE_KEYS.services, DEFAULT_SERVICES)
}
export function saveServices(services: Service[]) {
  setItem(STORAGE_KEYS.services, services)
}

// Barbers
export function getBarbers(): Barber[] {
  return getItem(STORAGE_KEYS.barbers, DEFAULT_BARBERS)
}
export function saveBarbers(barbers: Barber[]) {
  setItem(STORAGE_KEYS.barbers, barbers)
}

// Business
export function getBusiness(): BusinessInfo {
  return getItem(STORAGE_KEYS.business, DEFAULT_BUSINESS)
}
export function saveBusiness(business: BusinessInfo) {
  setItem(STORAGE_KEYS.business, business)
}

// Appointments
export function getAppointments(): Appointment[] {
  return getItem(STORAGE_KEYS.appointments, [])
}
export function saveAppointment(appointment: Appointment) {
  const list = getAppointments()
  list.push(appointment)
  setItem(STORAGE_KEYS.appointments, list)
}
export function cancelAppointment(id: string) {
  const list = getAppointments().filter((a) => a.id !== id)
  setItem(STORAGE_KEYS.appointments, list)
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

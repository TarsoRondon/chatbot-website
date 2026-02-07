import { promises as fs } from "fs"
import path from "path"
import {
  DEFAULT_ABOUT,
  DEFAULT_BARBERS,
  DEFAULT_BUSINESS,
  DEFAULT_SCHEDULE,
  DEFAULT_SERVICES,
  type AboutTag,
  type Barber,
  type BusinessInfo,
  type Service,
  type Appointment,
  type ScheduleSettings,
} from "@/lib/data"
import { hashPassword } from "@/lib/security"
import { normalizePathOrUrl } from "@/lib/normalize"

export interface AdminUser {
  username: string
  passwordHash: string
  createdAt: string
}

export interface Session {
  token: string
  createdAt: string
  expiresAt: string
}

export interface Database {
  admin: AdminUser
  sessions: Session[]
  business: BusinessInfo
  services: Service[]
  barbers: Barber[]
  about: AboutTag[]
  schedule: ScheduleSettings
  appointments: Appointment[]
}

const DB_DIR = path.join(process.cwd(), "data")
const DB_PATH = path.join(DB_DIR, "db.json")

export function sanitizeBusiness(input: Partial<BusinessInfo> | null | undefined): BusinessInfo {
  return {
    name: String(input?.name || DEFAULT_BUSINESS.name),
    address: String(input?.address || DEFAULT_BUSINESS.address),
    phone: String(input?.phone || DEFAULT_BUSINESS.phone),
    instagram: String(input?.instagram || DEFAULT_BUSINESS.instagram),
    description: String(input?.description || DEFAULT_BUSINESS.description),
    logoUrl: normalizePathOrUrl(String(input?.logoUrl || DEFAULT_BUSINESS.logoUrl), DEFAULT_BUSINESS.logoUrl),
    hours: String(input?.hours || DEFAULT_BUSINESS.hours),
  }
}

export function sanitizeServices(list: Service[] | null | undefined): Service[] {
  if (!Array.isArray(list)) return DEFAULT_SERVICES
  return list.map((item, index) => ({
    id: String(item?.id || `service-${index}`),
    name: String(item?.name || "Servico"),
    duration: String(item?.duration || "1hr"),
    price: Number(item?.price || 0),
  }))
}

export function sanitizeBarbers(list: Barber[] | null | undefined): Barber[] {
  if (!Array.isArray(list)) return DEFAULT_BARBERS
  return list.map((item, index) => ({
    id: String(item?.id || `barber-${index}`),
    name: String(item?.name || "Barbeiro"),
    role: String(item?.role || "Barbeiro"),
    avatar: String(item?.avatar || ""),
    photoUrl: normalizePathOrUrl(String(item?.photoUrl || ""), ""),
    blockedDates: Array.isArray(item?.blockedDates)
      ? item!.blockedDates.map((d) => String(d))
      : [],
    blockedSlots: Array.isArray(item?.blockedSlots)
      ? item!.blockedSlots.map((s) => ({
          date: String(s?.date || ""),
          time: normalizeTime(String(s?.time || ""), "09:00"),
        }))
      : [],
    blockedWeekdays: normalizeBarberWeekdays(item?.blockedWeekdays),
  }))
}

export function sanitizeAbout(list: AboutTag[] | null | undefined): AboutTag[] {
  if (!Array.isArray(list)) return DEFAULT_ABOUT
  return list.map((item, index) => ({
    id: String(item?.id || `about-${index}`),
    tag: String(item?.tag || "Tema"),
    title: String(item?.title || ""),
    description: String(item?.description || ""),
    photoUrl: normalizePathOrUrl(String(item?.photoUrl || ""), ""),
  }))
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

function normalizeTime(value: string, fallback: string): string {
  const trimmed = String(value || "").trim()
  if (!TIME_RE.test(trimmed)) return fallback
  return trimmed
}

function normalizeWeekdays(days: number[] | null | undefined): number[] {
  if (!Array.isArray(days)) return DEFAULT_SCHEDULE.closedWeekdays
  return days
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
}

function normalizeBarberWeekdays(days: number[] | null | undefined): number[] {
  if (!Array.isArray(days)) return []
  return days
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
}

export function sanitizeSchedule(input: ScheduleSettings | null | undefined): ScheduleSettings {
  const schedule = input || DEFAULT_SCHEDULE
  const slotMinutes = Number(schedule.slotMinutes)
  return {
    openTime: normalizeTime(schedule.openTime, DEFAULT_SCHEDULE.openTime),
    closeTime: normalizeTime(schedule.closeTime, DEFAULT_SCHEDULE.closeTime),
    slotMinutes: Number.isFinite(slotMinutes) && slotMinutes >= 10 && slotMinutes <= 120 ? slotMinutes : DEFAULT_SCHEDULE.slotMinutes,
    closedWeekdays: normalizeWeekdays(schedule.closedWeekdays),
    breaks: Array.isArray(schedule.breaks)
      ? schedule.breaks.map((b) => ({
          start: normalizeTime(b?.start, DEFAULT_SCHEDULE.breaks[0]?.start || "12:00"),
          end: normalizeTime(b?.end, DEFAULT_SCHEDULE.breaks[0]?.end || "13:00"),
        }))
      : DEFAULT_SCHEDULE.breaks,
    blockedDates: Array.isArray(schedule.blockedDates)
      ? schedule.blockedDates.map((d) => String(d))
      : [],
    blockedSlots: Array.isArray(schedule.blockedSlots)
      ? schedule.blockedSlots.map((s) => ({
          date: String(s?.date || ""),
          time: normalizeTime(s?.time, "09:00"),
        }))
      : [],
  }
}

export async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_PATH)
    return
  } catch {
    // continue to create
  }

  await fs.mkdir(DB_DIR, { recursive: true })
  const initialPassword = process.env.ADMIN_PASSWORD || "admin123"
  const admin: AdminUser = {
    username: "admin",
    passwordHash: hashPassword(initialPassword),
    createdAt: new Date().toISOString(),
  }

  const db: Database = {
    admin,
    sessions: [],
    business: sanitizeBusiness(DEFAULT_BUSINESS),
    services: sanitizeServices(DEFAULT_SERVICES),
    barbers: sanitizeBarbers(DEFAULT_BARBERS),
    about: sanitizeAbout(DEFAULT_ABOUT),
    schedule: sanitizeSchedule(DEFAULT_SCHEDULE),
    appointments: [],
  }

  await writeDb(db)
}

export async function readDb(): Promise<Database> {
  await ensureDb()
  const raw = await fs.readFile(DB_PATH, "utf8")
  const parsed = JSON.parse(raw || "{}") as Partial<Database>
  const admin = parsed.admin
  const fallbackAdmin = {
    username: "admin",
    passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "admin123"),
    createdAt: new Date().toISOString(),
  }
  return {
    admin: admin?.passwordHash ? (admin as AdminUser) : fallbackAdmin,
    sessions: Array.isArray(parsed.sessions) ? (parsed.sessions as Session[]) : [],
    business: sanitizeBusiness(parsed.business),
    services: sanitizeServices(parsed.services as Service[]),
    barbers: sanitizeBarbers(parsed.barbers as Barber[]),
    about: sanitizeAbout(parsed.about as AboutTag[]),
    schedule: sanitizeSchedule(parsed.schedule as ScheduleSettings),
    appointments: Array.isArray(parsed.appointments) ? (parsed.appointments as Appointment[]) : [],
  }
}

export async function writeDb(db: Database): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true })
  const tmp = `${DB_PATH}.tmp`
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8")
  await fs.rename(tmp, DB_PATH)
}

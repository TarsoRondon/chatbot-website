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
  blockedDates: string[]
  blockedSlots: { date: string; time: string }[]
  blockedWeekdays: number[]
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

export interface AboutTag {
  id: string
  tag: string
  title: string
  description: string
  photoUrl: string
}

export interface ScheduleBreak {
  start: string
  end: string
}

export interface ScheduleSettings {
  openTime: string
  closeTime: string
  slotMinutes: number
  closedWeekdays: number[]
  breaks: ScheduleBreak[]
  blockedDates: string[]
  blockedSlots: { date: string; time: string }[]
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
  { id: "angelo", name: "Angelo Henrique", role: "Barbeiro", avatar: "AH", photoUrl: "", blockedDates: [], blockedSlots: [], blockedWeekdays: [] },
  { id: "marcos", name: "Marcos Silva", role: "Barbeiro", avatar: "MS", photoUrl: "", blockedDates: [], blockedSlots: [], blockedWeekdays: [] },
  { id: "joao", name: "Joao Pedro", role: "Barbeiro", avatar: "JP", photoUrl: "", blockedDates: [], blockedSlots: [], blockedWeekdays: [] },
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

export const DEFAULT_ABOUT: AboutTag[] = [
  {
    id: "sobre-equipe",
    tag: "Nossa equipe",
    title: "Profissionais especializados",
    description: "Barbeiros experientes, atendimento atencioso e acabamento de alto nivel.",
    photoUrl: "",
  },
  {
    id: "sobre-ambiente",
    tag: "Ambiente",
    title: "Estilo e conforto",
    description: "Espaco moderno, clima descontraido e atmosfera premium.",
    photoUrl: "",
  },
  {
    id: "sobre-experiencia",
    tag: "Experiencia",
    title: "Detalhes que fazem a diferenca",
    description: "Produtos selecionados e atendimento personalizado para cada cliente.",
    photoUrl: "",
  },
]

export const DEFAULT_SCHEDULE: ScheduleSettings = {
  openTime: "09:00",
  closeTime: "19:00",
  slotMinutes: 30,
  closedWeekdays: [0],
  breaks: [{ start: "12:00", end: "13:00" }],
  blockedDates: [],
  blockedSlots: [],
}

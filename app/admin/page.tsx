"use client"

import React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Settings,
  Store,
  Users,
  Scissors,
  CalendarDays,
  Save,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ImageUploader } from "@/components/image-uploader"
import {
  fetchBusiness,
  saveBusiness,
  fetchBarbers,
  saveBarbers,
  fetchServices,
  saveServices,
  getAppointments,
  fetchAppointmentsAdmin,
  fetchAboutTags,
  saveAboutTags,
  fetchScheduleAdmin,
  saveSchedule,
  type BusinessInfo,
  type Barber,
  type Service,
  type Appointment,
  type AboutTag,
  type ScheduleSettings,
} from "@/lib/store"
import { isDateClosed, timeToMinutes, minutesToTime } from "@/lib/schedule"

type Tab = "business" | "barbers" | "services" | "appointments" | "about" | "schedule"

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [wrongPassword, setWrongPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("business")
  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [barbersList, setBarbersList] = useState<Barber[]>([])
  const [servicesList, setServicesList] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [aboutTags, setAboutTags] = useState<AboutTag[]>([])
  const [schedule, setSchedule] = useState<ScheduleSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [blockedDateInput, setBlockedDateInput] = useState("")
  const [blockedSlotDate, setBlockedSlotDate] = useState("")
  const [blockedSlotTime, setBlockedSlotTime] = useState("")
  const [uploading, setUploading] = useState<string | null>(null)
  const [barberDateInputs, setBarberDateInputs] = useState<Record<string, string>>({})
  const [barberSlotDateInputs, setBarberSlotDateInputs] = useState<Record<string, string>>({})
  const [barberSlotTimeInputs, setBarberSlotTimeInputs] = useState<Record<string, string>>({})
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month")
  const [calendarBarber, setCalendarBarber] = useState<string>("all")

  useEffect(() => {
    let mounted = true

    const load = async () => {
      let authedValue = false
      try {
        const authRes = await fetch("/api/auth/check", { cache: "no-store" })
        const authJson = authRes.ok ? await authRes.json() : { authed: false }
        authedValue = Boolean(authJson.authed)
        if (mounted) {
          setAuthed(authedValue)
        }
      } catch {
        if (mounted) setAuthed(false)
      } finally {
        if (mounted) setAuthChecking(false)
      }

      const [businessData, barbersData, servicesData, aboutData, scheduleData] = await Promise.all([
        fetchBusiness(),
        fetchBarbers(),
        fetchServices(),
        fetchAboutTags(),
        fetchScheduleAdmin(),
      ])

      if (!mounted) return
      setBusiness(businessData)
      setBarbersList(barbersData)
      setServicesList(servicesData)
      setAboutTags(aboutData)
      setSchedule(scheduleData)
      if (authedValue) {
        const appts = await fetchAppointmentsAdmin()
        setAppointments(appts)
      } else {
        setAppointments(getAppointments())
      }
      setIsLoaded(true)
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
        setWrongPassword(false)
      } else {
        setWrongPassword(true)
      }
    } catch {
      setWrongPassword(true)
    }
  }

  useEffect(() => {
    if (!authed) return
    fetchAppointmentsAdmin().then((data) => setAppointments(data))
    fetchScheduleAdmin().then((data) => setSchedule(data))
  }, [authed])

  useEffect(() => {
    if (calendarView !== "month" && !selectedDate) {
      setSelectedDate(new Date().toISOString().split("T")[0])
    }
  }, [calendarView, selectedDate])

  const timeSlots = React.useMemo(() => {
    if (!schedule) return []
    const openMin = timeToMinutes(schedule.openTime)
    const closeMin = timeToMinutes(schedule.closeTime)
    const step = schedule.slotMinutes
    const slots: string[] = []
    for (let t = openMin; t + step <= closeMin; t += step) {
      const inBreak = schedule.breaks.some((b) => {
        const start = timeToMinutes(b.start)
        const end = timeToMinutes(b.end)
        return t >= start && t < end
      })
      if (inBreak) continue
      slots.push(minutesToTime(t))
    }
    return slots
  }, [schedule])

  const showSavedFeedback = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Business handlers
  const handleSaveBusiness = () => {
    if (business) {
      saveBusiness(business).then((ok) => {
        if (!ok) {
          alert("Falha ao salvar. Verifique se esta logado como admin.")
          return
        }
        showSavedFeedback()
      })
    }
  }

  // Barber handlers
  const handleAddBarber = () => {
    const id = `barber-${Date.now()}`
    setBarbersList([
      ...barbersList,
      {
        id,
        name: "",
        role: "Barbeiro",
        avatar: "",
        photoUrl: "",
        blockedDates: [],
        blockedSlots: [],
        blockedWeekdays: [],
      },
    ])
  }

  const handleUpdateBarber = (index: number, field: keyof Barber, value: string) => {
    const updated = [...barbersList]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "name" && value.length >= 2) {
      updated[index].avatar = value
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    setBarbersList(updated)
  }

  const handleRemoveBarber = (index: number) => {
    setBarbersList(barbersList.filter((_, i) => i !== index))
  }

  const updateBarberById = (id: string, updater: (barber: Barber) => Barber) => {
    setBarbersList((prev) => prev.map((b) => (b.id === id ? updater(b) : b)))
  }

  const toggleBarberWeekday = (barberId: string, day: number) => {
    updateBarberById(barberId, (b) => {
      const current = b.blockedWeekdays || []
      const exists = current.includes(day)
      return {
        ...b,
        blockedWeekdays: exists ? current.filter((d) => d !== day) : [...current, day],
      }
    })
  }

  const handleAddBarberBlockedDate = (barberId: string) => {
    const date = barberDateInputs[barberId]
    if (!date) return
    updateBarberById(barberId, (b) => ({
      ...b,
      blockedDates: Array.from(new Set([...(b.blockedDates || []), date])),
    }))
    setBarberDateInputs((prev) => ({ ...prev, [barberId]: "" }))
  }

  const handleRemoveBarberBlockedDate = (barberId: string, date: string) => {
    updateBarberById(barberId, (b) => ({
      ...b,
      blockedDates: (b.blockedDates || []).filter((d) => d !== date),
    }))
  }

  const handleAddBarberBlockedSlot = (barberId: string) => {
    const date = barberSlotDateInputs[barberId]
    const time = barberSlotTimeInputs[barberId]
    if (!date || !time) return
    updateBarberById(barberId, (b) => ({
      ...b,
      blockedSlots: [
        ...(b.blockedSlots || []),
        { date, time },
      ],
    }))
    setBarberSlotDateInputs((prev) => ({ ...prev, [barberId]: "" }))
    setBarberSlotTimeInputs((prev) => ({ ...prev, [barberId]: "" }))
  }

  const handleRemoveBarberBlockedSlot = (barberId: string, index: number) => {
    updateBarberById(barberId, (b) => ({
      ...b,
      blockedSlots: (b.blockedSlots || []).filter((_, i) => i !== index),
    }))
  }

  const handleSaveBarbers = () => {
    saveBarbers(barbersList).then((ok) => {
      if (!ok) {
        alert("Falha ao salvar. Verifique se esta logado como admin.")
        return
      }
      showSavedFeedback()
    })
  }

  // Service handlers
  const handleAddService = () => {
    const id = `service-${Date.now()}`
    setServicesList([...servicesList, { id, name: "", duration: "1hr", price: 0 }])
  }

  const handleUpdateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = [...servicesList]
    updated[index] = { ...updated[index], [field]: value }
    setServicesList(updated)
  }

  const handleRemoveService = (index: number) => {
    setServicesList(servicesList.filter((_, i) => i !== index))
  }

  const handleSaveServices = () => {
    saveServices(servicesList).then((ok) => {
      if (!ok) {
        alert("Falha ao salvar. Verifique se esta logado como admin.")
        return
      }
      showSavedFeedback()
    })
  }

  // About handlers
  const handleAddAbout = () => {
    const id = `about-${Date.now()}`
    setAboutTags([
      ...aboutTags,
      {
        id,
        tag: "Nossa equipe",
        title: "",
        description: "",
        photoUrl: "",
      },
    ])
  }

  const handleUpdateAbout = (index: number, field: keyof AboutTag, value: string) => {
    const updated = [...aboutTags]
    updated[index] = { ...updated[index], [field]: value }
    setAboutTags(updated)
  }

  const handleRemoveAbout = (index: number) => {
    setAboutTags(aboutTags.filter((_, i) => i !== index))
  }

  const handleSaveAbout = () => {
    saveAboutTags(aboutTags).then((ok) => {
      if (!ok) {
        alert("Falha ao salvar. Verifique se esta logado como admin.")
        return
      }
      showSavedFeedback()
    })
  }

  // Schedule handlers
  const updateSchedule = (field: keyof ScheduleSettings, value: ScheduleSettings[keyof ScheduleSettings]) => {
    setSchedule((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const toggleWeekday = (day: number) => {
    if (!schedule) return
    const exists = schedule.closedWeekdays.includes(day)
    const next = exists
      ? schedule.closedWeekdays.filter((d) => d !== day)
      : [...schedule.closedWeekdays, day]
    updateSchedule("closedWeekdays", next)
  }

  const handleAddBreak = () => {
    if (!schedule) return
    updateSchedule("breaks", [...schedule.breaks, { start: "12:00", end: "13:00" }])
  }

  const handleUpdateBreak = (index: number, field: "start" | "end", value: string) => {
    if (!schedule) return
    const updated = [...schedule.breaks]
    updated[index] = { ...updated[index], [field]: value }
    updateSchedule("breaks", updated)
  }

  const handleRemoveBreak = (index: number) => {
    if (!schedule) return
    updateSchedule("breaks", schedule.breaks.filter((_, i) => i !== index))
  }

  const handleAddBlockedDate = () => {
    if (!schedule || !blockedDateInput) return
    const next = Array.from(new Set([...schedule.blockedDates, blockedDateInput]))
    updateSchedule("blockedDates", next)
    setBlockedDateInput("")
  }

  const handleRemoveBlockedDate = (date: string) => {
    if (!schedule) return
    updateSchedule("blockedDates", schedule.blockedDates.filter((d) => d !== date))
  }

  const handleAddBlockedSlot = () => {
    if (!schedule || !blockedSlotDate || !blockedSlotTime) return
    const next = [
      ...schedule.blockedSlots,
      { date: blockedSlotDate, time: blockedSlotTime },
    ]
    updateSchedule("blockedSlots", next)
    setBlockedSlotDate("")
    setBlockedSlotTime("")
  }

  const handleRemoveBlockedSlot = (index: number) => {
    if (!schedule) return
    updateSchedule("blockedSlots", schedule.blockedSlots.filter((_, i) => i !== index))
  }

  const handleSaveSchedule = () => {
    if (!schedule) return
    saveSchedule(schedule).then((ok) => {
      if (!ok) {
        alert("Falha ao salvar. Verifique se esta logado como admin.")
        return
      }
      showSavedFeedback()
    })
  }

  const uploadImage = async (file: File, context: string): Promise<string | null> => {
    const maxSizeMb = 5
    if (file.size > maxSizeMb * 1024 * 1024) {
      alert(`Imagem muito grande. Use ate ${maxSizeMb}MB.`)
      return null
    }
    try {
      setUploading(context)
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        alert("Falha ao enviar imagem.")
        return null
      }
      const json = await res.json()
      return String(json?.url || "")
    } catch {
      alert("Falha ao enviar imagem.")
      return null
    } finally {
      setUploading(null)
    }
  }

  if (!isLoaded || authChecking) return null

  // Admin login
  if (!authed) {
    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="flex min-h-[70dvh] items-center justify-center px-4">
          <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-4 text-center">
              <Image
                src={business?.logoUrl ?? "/logo.png"}
                alt={business?.name ?? "Barbearia"}
                width={64}
                height={64}
                className="rounded-xl"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Painel Admin</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Digite a senha para acessar o painel administrativo
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha de administrador"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setWrongPassword(false)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={`w-full rounded-xl border bg-card py-3.5 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                    wrongPassword
                      ? "border-destructive focus:border-destructive focus:ring-destructive"
                      : "border-border focus:border-primary focus:ring-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {wrongPassword && (
                <p className="text-xs text-destructive">Senha incorreta. Tente novamente.</p>
              )}
              <button
                type="button"
                onClick={handleLogin}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Entrar
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Senha inicial: admin123 (configuravel no servidor)
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Tabs
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "business", label: "Empresa", icon: Store },
    { id: "barbers", label: "Barbeiros", icon: Users },
    { id: "services", label: "Servicos", icon: Scissors },
    { id: "about", label: "Sobre", icon: Sparkles },
    { id: "schedule", label: "Horarios", icon: Clock },
    { id: "appointments", label: "Agenda", icon: CalendarDays },
  ]

  const getServiceName = (id: string) => servicesList.find((s) => s.id === id)?.name ?? id
  const getBarberName = (id: string) => barbersList.find((b) => b.id === id)?.name ?? id
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
  const startWeekday = monthStart.getDay()
  const daysInMonth = monthEnd.getDate()
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7
  const monthLabel = monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const matchesBarberFilter = (appt: Appointment) => {
    if (calendarBarber === "all") return true
    if (calendarBarber === "none") {
      return !appt.barberId || appt.barberId === "none"
    }
    return appt.barberId === calendarBarber
  }

  const filteredByBarber = appointments.filter(matchesBarberFilter)
  const appointmentCounts = filteredByBarber.reduce<Record<string, number>>((acc, appt) => {
    acc[appt.date] = (acc[appt.date] || 0) + 1
    return acc
  }, {})

  const calendarCells = Array.from({ length: totalCells }).map((_, index) => {
    const dayNumber = index - startWeekday + 1
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return { dayNumber: null, dateStr: null, weekday: index % 7 }
    }
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNumber)
    const dateStr = date.toISOString().split("T")[0]
    return { dayNumber, dateStr, weekday: date.getDay() }
  })

  const hasNoBarberAppointments = appointments.some((a) => !a.barberId || a.barberId === "none")
  const noBarberColumn: Barber = {
    id: "none",
    name: "Sem barbeiro",
    role: "",
    avatar: "",
    photoUrl: "",
    blockedDates: [],
    blockedSlots: [],
    blockedWeekdays: [],
  }
  const gridBarbers =
    calendarBarber === "all"
      ? [...barbersList, ...(hasNoBarberAppointments ? [noBarberColumn] : [])]
      : calendarBarber === "none"
        ? [noBarberColumn]
        : barbersList.filter((b) => b.id === calendarBarber)


  const selectedDateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : new Date()
  const weekday = selectedDateObj.getDay()
  const diffToMonday = (weekday + 6) % 7
  const weekStart = new Date(selectedDateObj)
  weekStart.setDate(selectedDateObj.getDate() - diffToMonday)
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + index)
    return d
  })

  const weekStartStr = toDateStr(weekStart)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekEndStr = toDateStr(weekEnd)

  const filteredAppointments = filteredByBarber.filter((appt) => {
    if (calendarView === "day") {
      return !selectedDate || appt.date === selectedDate
    }
    if (calendarView === "week") {
      return appt.date >= weekStartStr && appt.date <= weekEndStr
    }
    if (selectedDate) {
      return appt.date === selectedDate
    }
    return true
  })

  function toDateStr(date: Date) {
    return date.toISOString().split("T")[0]
  }

  const updateSelectedDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    const dateObj = new Date(dateStr + "T12:00:00")
    setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
  }

  const shiftSelectedDate = (days: number) => {
    const base = selectedDate ? new Date(selectedDate + "T12:00:00") : new Date()
    base.setDate(base.getDate() + days)
    updateSelectedDate(toDateStr(base))
  }

  const shiftSelectedWeek = (weeks: number) => {
    shiftSelectedDate(weeks * 7)
  }

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      {/* Save notification */}
      {saved && (
        <div className="fixed right-4 top-20 z-50 animate-in fade-in slide-in-from-top-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg">
          Salvo com sucesso!
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-foreground">Painel Administrativo</h1>
          </div>
          <Image
            src={business?.logoUrl ?? "/logo.png"}
            alt={business?.name ?? "Logo"}
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="mt-6">
          {/* Business tab */}
          {activeTab === "business" && business && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Image
                  src={business.logoUrl || "/placeholder.svg"}
                  alt={business.name}
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-foreground">Dados da Empresa</h3>
                  <p className="text-xs text-muted-foreground">Altere as informacoes do estabelecimento</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nome da empresa</label>
                  <input
                    type="text"
                    value={business.name}
                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Endereco</label>
                  <input
                    type="text"
                    value={business.address}
                    onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefone</label>
                  <input
                    type="text"
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Horario de funcionamento</label>
                  <input
                    type="text"
                    value={business.hours}
                    onChange={(e) => setBusiness({ ...business, hours: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Seg - Sab, 09:00 - 19:00"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Instagram</label>
                  <input
                    type="text"
                    value={business.instagram}
                    onChange={(e) => setBusiness({ ...business, instagram: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Descricao</label>
                  <textarea
                    value={business.description}
                    onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">URL da Logo</label>
                  <input
                    type="text"
                    value={business.logoUrl}
                    onChange={(e) => setBusiness({ ...business, logoUrl: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <ImageUploader
                  label="Enviar logo"
                  value={business.logoUrl}
                  context="logo"
                  aspect={1}
                  helper="Recomendado: 512x512"
                  isUploading={uploading === "logo"}
                  upload={uploadImage}
                  onUploaded={(url) => setBusiness((prev) => (prev ? { ...prev, logoUrl: url } : prev))}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBusiness}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Salvar Alteracoes
              </button>
            </div>
          )}

          {/* Barbers tab */}
          {activeTab === "barbers" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Barbeiros</h3>
                  <p className="text-xs text-muted-foreground">Gerencie os profissionais</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddBarber}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {barbersList.map((barber, i) => (
                  <div key={barber.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                      {barber.photoUrl ? (
                        <img
                          src={barber.photoUrl}
                          alt={barber.name || "Barbeiro"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{barber.avatar || "?"}</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Nome do barbeiro"
                        value={barber.name}
                        onChange={(e) => handleUpdateBarber(i, "name", e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Funcao (ex: Barbeiro Senior)"
                        value={barber.role}
                        onChange={(e) => handleUpdateBarber(i, "role", e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="URL da foto (ex: /barbeiros/joao.jpg)"
                        value={barber.photoUrl}
                        onChange={(e) => handleUpdateBarber(i, "photoUrl", e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <ImageUploader
                        label="Enviar foto (recomendado)"
                        value={barber.photoUrl}
                        context={`barber-${i}`}
                        aspect={3 / 4}
                        helper="Recomendado: 900x1200"
                        isUploading={uploading === `barber-${i}`}
                        upload={uploadImage}
                        onUploaded={(url) => {
                          setBarbersList((prev) => {
                            const updated = [...prev]
                            updated[i] = { ...updated[i], photoUrl: url }
                            return updated
                          })
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Dica: coloque as fotos em `public/` e use o caminho relativo (ex: `/barbeiros/joao.jpg`).
                      </p>

                      <div className="rounded-xl border border-border bg-secondary/40 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Folgas e bloqueios</p>
                        <div className="mt-2">
                          <p className="text-[10px] text-muted-foreground">Bloqueio recorrente</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label, day) => {
                              const active = (barber.blockedWeekdays || []).includes(day)
                              return (
                                <button
                                  key={`${barber.id}-${label}`}
                                  type="button"
                                  onClick={() => toggleBarberWeekday(barber.id, day)}
                                  className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-background text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            Ex: marque "Seg" para folga toda segunda-feira.
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="date"
                            value={barberDateInputs[barber.id] || ""}
                            onChange={(e) => setBarberDateInputs((prev) => ({ ...prev, [barber.id]: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddBarberBlockedDate(barber.id)}
                            className="rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground"
                          >
                            Bloquear dia
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(barber.blockedDates || []).map((date) => (
                            <button
                              key={`${barber.id}-${date}`}
                              type="button"
                              onClick={() => handleRemoveBarberBlockedDate(barber.id, date)}
                              className="rounded-full bg-background px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              {date} ✕
                            </button>
                          ))}
                          {(barber.blockedDates || []).length === 0 && (
                            <span className="text-[10px] text-muted-foreground">Nenhum dia bloqueado.</span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="date"
                            value={barberSlotDateInputs[barber.id] || ""}
                            onChange={(e) => setBarberSlotDateInputs((prev) => ({ ...prev, [barber.id]: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                          <input
                            type="time"
                            value={barberSlotTimeInputs[barber.id] || ""}
                            onChange={(e) => setBarberSlotTimeInputs((prev) => ({ ...prev, [barber.id]: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddBarberBlockedSlot(barber.id)}
                            className="rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground"
                          >
                            Bloquear horario
                          </button>
                        </div>
                        <div className="mt-2 flex flex-col gap-2">
                          {(barber.blockedSlots || []).map((slot, index) => (
                            <div
                              key={`${barber.id}-${slot.date}-${slot.time}-${index}`}
                              className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-[10px] text-muted-foreground"
                            >
                              <span>
                                {slot.date} • {slot.time}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBarberBlockedSlot(barber.id, index)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                          {(barber.blockedSlots || []).length === 0 && (
                            <span className="text-[10px] text-muted-foreground">Nenhum horario bloqueado.</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBarber(i)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveBarbers}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Salvar Barbeiros
              </button>
            </div>
          )}

          {/* Services tab */}
          {activeTab === "services" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Servicos</h3>
                  <p className="text-xs text-muted-foreground">Gerencie servicos e precos</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground sm:inline-block">
                    {servicesList.length} servico(s)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </button>
                </div>
              </div>

              {servicesList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="text-sm font-medium text-foreground">Nenhum servico cadastrado</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clique em "Adicionar" para criar o primeiro servico.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {servicesList.map((service, i) => (
                    <div key={service.id} className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Scissors className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Servico</span>
                            <input
                              type="text"
                              placeholder="Nome do servico"
                              value={service.name}
                              onChange={(e) => handleUpdateService(i, "name", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(i)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Remover servico"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Duracao</label>
                          <input
                            type="text"
                            placeholder="1hr"
                            value={service.duration}
                            onChange={(e) => handleUpdateService(i, "duration", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Preco (R$)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={service.price || ""}
                            onChange={(e) => handleUpdateService(i, "price", Number(e.target.value))}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-2">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Preview</span>
                        <span className="text-sm font-bold text-primary">
                          R$ {Number(service.price || 0).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveServices}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Salvar Servicos
              </button>
            </div>
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Sobre nos</h3>
                  <p className="text-xs text-muted-foreground">
                    Crie temas com foto, tag e descricao para a sessao "Sobre"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground sm:inline-block">
                    {aboutTags.length} item(s)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAbout}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </button>
                </div>
              </div>

              {aboutTags.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="text-sm font-medium text-foreground">Nenhuma tag cadastrada</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Clique em "Adicionar" para criar o primeiro tema.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {aboutTags.map((item, i) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/60 md:h-40 md:w-56">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.title || "Tema"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
                              <Sparkles className="h-6 w-6 text-primary" />
                              <span>Sem foto</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tema</p>
                            <button
                              type="button"
                              onClick={() => handleRemoveAbout(i)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Ex: Nossa equipe, Ambiente, Experiencia"
                            value={item.tag}
                            onChange={(e) => handleUpdateAbout(i, "tag", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Titulo do tema"
                            value={item.title}
                            onChange={(e) => handleUpdateAbout(i, "title", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                          <textarea
                            placeholder="Descricao curta"
                            value={item.description}
                            onChange={(e) => handleUpdateAbout(i, "description", e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                          />
                          <input
                            type="text"
                            placeholder="URL da foto (ex: /sobre/ambiente.jpg)"
                            value={item.photoUrl}
                            onChange={(e) => handleUpdateAbout(i, "photoUrl", e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                          <ImageUploader
                            label="Enviar foto"
                            value={item.photoUrl}
                            context={`about-${i}`}
                            aspect={4 / 3}
                            helper="Recomendado: 1200x900"
                            isUploading={uploading === `about-${i}`}
                            upload={uploadImage}
                            onUploaded={(url) => {
                              setAboutTags((prev) => {
                                const updated = [...prev]
                                updated[i] = { ...updated[i], photoUrl: url }
                                return updated
                              })
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAbout}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Salvar Sobre
              </button>
            </div>
          )}

          {/* Schedule tab */}
          {activeTab === "schedule" && schedule && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Horarios e bloqueios</h3>
                <p className="text-xs text-muted-foreground">
                  Configure horarios de funcionamento, pausas e bloqueios.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Abertura</label>
                  <input
                    type="time"
                    value={schedule.openTime}
                    onChange={(e) => updateSchedule("openTime", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Fechamento</label>
                  <input
                    type="time"
                    value={schedule.closeTime}
                    onChange={(e) => updateSchedule("closeTime", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Intervalo (min)</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={schedule.slotMinutes}
                    onChange={(e) => updateSchedule("slotMinutes", Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Dias fechados
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label, day) => {
                    const active = schedule.closedWeekdays.includes(day)
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Pausas</p>
                    <p className="text-xs text-muted-foreground">Horarios sem atendimento</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBreak}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {schedule.breaks.map((b, index) => (
                    <div key={`${b.start}-${b.end}-${index}`} className="flex items-center gap-3">
                      <input
                        type="time"
                        value={b.start}
                        onChange={(e) => handleUpdateBreak(index, "start", e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <span className="text-xs text-muted-foreground">ate</span>
                      <input
                        type="time"
                        value={b.end}
                        onChange={(e) => handleUpdateBreak(index, "end", e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBreak(index)}
                        className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Bloquear dia</p>
                  <p className="text-xs text-muted-foreground">Feche datas especificas</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="date"
                      value={blockedDateInput}
                      onChange={(e) => setBlockedDateInput(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlockedDate}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {schedule.blockedDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleRemoveBlockedDate(date)}
                        className="rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        {date} ✕
                      </button>
                    ))}
                    {schedule.blockedDates.length === 0 && (
                      <span className="text-xs text-muted-foreground">Nenhuma data bloqueada.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Bloquear horario</p>
                  <p className="text-xs text-muted-foreground">Remova horarios especificos</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="date"
                      value={blockedSlotDate}
                      onChange={(e) => setBlockedSlotDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <input
                      type="time"
                      value={blockedSlotTime}
                      onChange={(e) => setBlockedSlotTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddBlockedSlot}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {schedule.blockedSlots.map((slot, index) => (
                      <div key={`${slot.date}-${slot.time}-${index}`} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                        <span>
                          {slot.date} • {slot.time}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedSlot(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    {schedule.blockedSlots.length === 0 && (
                      <span className="text-xs text-muted-foreground">Nenhum horario bloqueado.</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSchedule}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Salvar Horarios
              </button>
            </div>
          )}

          {/* Appointments tab */}
          {activeTab === "appointments" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Todos os Agendamentos</h3>
                <p className="text-xs text-muted-foreground">{appointments.length} agendamento(s) no total</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Calendario</p>
                    <p className="text-xs text-muted-foreground">
                      Selecione um dia para filtrar a agenda.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <div className="flex w-full items-center gap-1 rounded-lg bg-secondary p-1 sm:w-auto">
                      {(["month", "week", "day"] as const).map((view) => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setCalendarView(view)}
                          className={`flex-1 rounded-md px-3 py-1 text-[11px] font-semibold transition-colors sm:flex-none ${
                            calendarView === view
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {view === "month" ? "Mes" : view === "week" ? "Semana" : "Dia"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Barbeiro
                      </label>
                      <select
                        value={calendarBarber}
                        onChange={(e) => setCalendarBarber(e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                      >
                        <option value="all">Todos</option>
                        <option value="none">Sem barbeiro</option>
                        {barbersList.map((barber) => (
                          <option key={barber.id} value={barber.id}>
                            {barber.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {calendarView === "month" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCalendarMonth(
                              new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1),
                            )
                          }}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {"<"}
                        </button>
                        <span className="text-sm font-semibold text-foreground capitalize">{monthLabel}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCalendarMonth(
                              new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1),
                            )
                          }}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {">"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => (calendarView === "week" ? shiftSelectedWeek(-1) : shiftSelectedDate(-1))}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {"<"}
                        </button>
                        <input
                          type="date"
                          value={selectedDate ?? toDateStr(new Date())}
                          onChange={(e) => updateSelectedDate(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-1 text-xs text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => (calendarView === "week" ? shiftSelectedWeek(1) : shiftSelectedDate(1))}
                          className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {">"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {calendarView === "month" && (
                  <>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] text-muted-foreground">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((label) => (
                        <div key={label} className="text-center">
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-7 gap-1">
                      {calendarCells.map((cell, index) => {
                        if (!cell.dayNumber || !cell.dateStr) {
                          return <div key={`empty-${index}`} className="h-16 rounded-lg bg-background/40" />
                        }
                        const count = appointmentCounts[cell.dateStr] || 0
                        const closed = schedule ? isDateClosed(cell.dateStr, schedule) : false
                        const isSelected = selectedDate === cell.dateStr
                        return (
                          <button
                            key={cell.dateStr}
                            type="button"
                            onClick={() => updateSelectedDate(cell.dateStr)}
                            className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-foreground hover:border-primary/60"
                            }`}
                          >
                            <span className={`text-sm font-semibold ${closed ? "text-destructive" : "text-foreground"}`}>
                              {cell.dayNumber}
                            </span>
                            {count > 0 && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                                {count} ag.
                              </span>
                            )}
                            {count === 0 && closed && (
                              <span className="text-[10px] text-destructive">Fechado</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">Selecionado</span>
                      <span className="rounded-full bg-primary px-2 py-1 text-primary-foreground">Com agendamento</span>
                      <span className="rounded-full bg-destructive/10 px-2 py-1 text-destructive">Fechado</span>
                      {selectedDate && (
                        <button
                          type="button"
                          onClick={() => setSelectedDate(null)}
                          className="ml-auto rounded-full bg-secondary px-3 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Limpar filtro
                        </button>
                      )}
                    </div>
                  </>
                )}

                {calendarView !== "month" && (
                  <div className="mt-4 flex flex-col gap-4">
                    {calendarView === "week" ? (
                      weekDays.map((day) => {
                        const dateStr = toDateStr(day)
                        const closed = schedule ? isDateClosed(dateStr, schedule) : false
                        return (
                          <div key={dateStr} className="rounded-xl border border-border bg-background p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground capitalize">
                                  {day.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{dateStr}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateSelectedDate(dateStr)}
                                className="rounded-full bg-secondary px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                Ver detalhes
                              </button>
                            </div>
                            {closed || !schedule ? (
                              <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
                                Dia fechado
                              </div>
                            ) : gridBarbers.length === 0 ? (
                              <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
                                Nenhum barbeiro cadastrado para exibir.
                              </div>
                            ) : (
                              <div className="mt-3 overflow-x-auto">
                                <div
                                  className="grid gap-1"
                                  style={{ gridTemplateColumns: `80px repeat(${gridBarbers.length}, minmax(120px, 1fr))` }}
                                >
                                  <div className="rounded-lg bg-secondary px-2 py-2 text-[10px] text-muted-foreground">
                                    Horario
                                  </div>
                                  {gridBarbers.map((barber) => (
                                    <div
                                      key={`${dateStr}-${barber.id}`}
                                      className="rounded-lg bg-secondary px-2 py-2 text-[10px] text-muted-foreground"
                                    >
                                      {barber.name}
                                    </div>
                                  ))}
                                  {timeSlots.map((time) => {
                                    const slotBlocked = schedule.blockedSlots.some(
                                      (s) => s.date === dateStr && s.time === time,
                                    )
                                    return (
                                      <React.Fragment key={`${dateStr}-${time}`}>
                                        <div className="rounded-lg border border-border px-2 py-2 text-[10px] text-muted-foreground">
                                          {time}
                                        </div>
                                        {gridBarbers.map((barber) => {
                                          const isNoBarber = barber.id === "none"
                                          const barberBlocked = !isNoBarber
                                            ? (barber.blockedWeekdays || []).includes(day.getDay()) ||
                                              (barber.blockedDates || []).includes(dateStr) ||
                                              (barber.blockedSlots || []).some((s) => s.date === dateStr && s.time === time)
                                            : false
                                          const appt = filteredByBarber.find(
                                            (a) =>
                                              a.date === dateStr &&
                                              a.time === time &&
                                              (isNoBarber ? !a.barberId || a.barberId === "none" : a.barberId === barber.id),
                                          )
                                          if (slotBlocked || barberBlocked) {
                                            return (
                                              <div
                                                key={`${dateStr}-${time}-${barber.id}`}
                                                className="rounded-lg border border-dashed border-border bg-destructive/10 px-2 py-2 text-[10px] text-destructive"
                                              >
                                                Bloqueado
                                              </div>
                                            )
                                          }
                                          if (appt) {
                                            return (
                                              <div
                                                key={`${dateStr}-${time}-${barber.id}`}
                                                className="rounded-lg border border-border bg-primary/10 px-2 py-2 text-[10px] text-primary"
                                              >
                                                {appt.clientName}
                                              </div>
                                            )
                                          }
                                          return (
                                            <div
                                              key={`${dateStr}-${time}-${barber.id}`}
                                              className="rounded-lg border border-border px-2 py-2 text-[10px] text-muted-foreground"
                                            >
                                              Livre
                                            </div>
                                          )
                                        })}
                                      </React.Fragment>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="rounded-xl border border-border bg-background p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground capitalize">
                              {selectedDateObj.toLocaleDateString("pt-BR", {
                                weekday: "long",
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{toDateStr(selectedDateObj)}</p>
                          </div>
                        </div>
                        {schedule && !isDateClosed(toDateStr(selectedDateObj), schedule) ? (
                          gridBarbers.length === 0 ? (
                            <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
                              Nenhum barbeiro cadastrado para exibir.
                            </div>
                          ) : (
                            <div className="mt-3 overflow-x-auto">
                              <div
                                className="grid gap-1"
                                style={{ gridTemplateColumns: `80px repeat(${gridBarbers.length}, minmax(140px, 1fr))` }}
                              >
                              <div className="rounded-lg bg-secondary px-2 py-2 text-[10px] text-muted-foreground">
                                Horario
                              </div>
                              {gridBarbers.map((barber) => (
                                <div
                                  key={`day-${barber.id}`}
                                  className="rounded-lg bg-secondary px-2 py-2 text-[10px] text-muted-foreground"
                                >
                                  {barber.name}
                                </div>
                              ))}
                              {timeSlots.map((time) => {
                                const dateStr = toDateStr(selectedDateObj)
                                const slotBlocked = schedule.blockedSlots.some(
                                  (s) => s.date === dateStr && s.time === time,
                                )
                                return (
                                  <React.Fragment key={`day-${time}`}>
                                    <div className="rounded-lg border border-border px-2 py-2 text-[10px] text-muted-foreground">
                                      {time}
                                    </div>
                                    {gridBarbers.map((barber) => {
                                      const isNoBarber = barber.id === "none"
                                      const barberBlocked = !isNoBarber
                                        ? (barber.blockedWeekdays || []).includes(selectedDateObj.getDay()) ||
                                          (barber.blockedDates || []).includes(dateStr) ||
                                          (barber.blockedSlots || []).some((s) => s.date === dateStr && s.time === time)
                                        : false
                                      const appt = filteredByBarber.find(
                                        (a) =>
                                          a.date === dateStr &&
                                          a.time === time &&
                                          (isNoBarber ? !a.barberId || a.barberId === "none" : a.barberId === barber.id),
                                      )
                                      if (slotBlocked || barberBlocked) {
                                        return (
                                          <div
                                            key={`day-${time}-${barber.id}`}
                                            className="rounded-lg border border-dashed border-border bg-destructive/10 px-2 py-2 text-[10px] text-destructive"
                                          >
                                            Bloqueado
                                          </div>
                                        )
                                      }
                                      if (appt) {
                                        return (
                                          <div
                                            key={`day-${time}-${barber.id}`}
                                            className="rounded-lg border border-border bg-primary/10 px-2 py-2 text-[10px] text-primary"
                                          >
                                            {appt.clientName}
                                          </div>
                                        )
                                      }
                                      return (
                                        <div
                                          key={`day-${time}-${barber.id}`}
                                          className="rounded-lg border border-border px-2 py-2 text-[10px] text-muted-foreground"
                                        >
                                          Livre
                                        </div>
                                      )
                                    })}
                                  </React.Fragment>
                                )
                              })}
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
                            Dia fechado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum agendamento registrado</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...filteredAppointments]
                    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
                    .map((appt) => {
                      const apptDate = new Date(appt.date + "T12:00:00")
                      const formattedDate = apptDate.toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                      return (
                        <div key={appt.id} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{appt.clientName}</p>
                              <p className="text-xs text-muted-foreground">{appt.clientPhone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {formattedDate} - {appt.time}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                            <span className="text-xs text-muted-foreground">
                              {getServiceName(appt.serviceId)} - {getBarberName(appt.barberId)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

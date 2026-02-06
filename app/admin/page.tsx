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
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import {
  getBusiness,
  saveBusiness,
  getBarbers,
  saveBarbers,
  getServices,
  saveServices,
  getAppointments,
  type BusinessInfo,
  type Barber,
  type Service,
  type Appointment,
} from "@/lib/store"

const ADMIN_PASSWORD = "admin123"

type Tab = "business" | "barbers" | "services" | "appointments"

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
  const [saved, setSaved] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setBusiness(getBusiness())
    setBarbersList(getBarbers())
    setServicesList(getServices())
    setAppointments(getAppointments())
    setIsLoaded(true)
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setWrongPassword(false)
    } else {
      setWrongPassword(true)
    }
  }

  const showSavedFeedback = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Business handlers
  const handleSaveBusiness = () => {
    if (business) {
      saveBusiness(business)
      showSavedFeedback()
    }
  }

  // Barber handlers
  const handleAddBarber = () => {
    const id = `barber-${Date.now()}`
    setBarbersList([...barbersList, { id, name: "", role: "Barbeiro", avatar: "" }])
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

  const handleSaveBarbers = () => {
    saveBarbers(barbersList)
    showSavedFeedback()
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
    saveServices(servicesList)
    showSavedFeedback()
  }

  if (!isLoaded) return null

  // Admin login
  if (!authed) {
    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="flex min-h-[70dvh] items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
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
                Senha padrao: admin123
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
    { id: "appointments", label: "Agenda", icon: CalendarDays },
  ]

  const getServiceName = (id: string) => servicesList.find((s) => s.id === id)?.name ?? id
  const getBarberName = (id: string) => barbersList.find((b) => b.id === id)?.name ?? id

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
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-2xl font-bold text-foreground">Painel Administrativo</h1>
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                      {barber.avatar || "?"}
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
                <button
                  type="button"
                  onClick={handleAddService}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {servicesList.map((service, i) => (
                  <div key={service.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 shrink-0 text-primary" />
                      <input
                        type="text"
                        placeholder="Nome do servico"
                        value={service.name}
                        onChange={(e) => handleUpdateService(i, "name", e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveService(i)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Duracao</label>
                        <input
                          type="text"
                          placeholder="1hr"
                          value={service.duration}
                          onChange={(e) => handleUpdateService(i, "duration", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
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
                  </div>
                ))}
              </div>

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

          {/* Appointments tab */}
          {activeTab === "appointments" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Todos os Agendamentos</h3>
                <p className="text-xs text-muted-foreground">{appointments.length} agendamento(s) no total</p>
              </div>

              {appointments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum agendamento registrado</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {[...appointments]
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

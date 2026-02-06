"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, User, Phone, CheckCircle2, CalendarDays, Clock, Scissors, MapPin, AlertTriangle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { StepService } from "@/components/step-service"
import { StepBarber } from "@/components/step-barber"
import { StepDate } from "@/components/step-date"
import { StepTime } from "@/components/step-time"
import {
  getServices,
  getBarbers,
  getBusiness,
  getClient,
  saveClient,
  saveAppointment,
  type Service,
  type Barber,
  type BusinessInfo,
  type ClientSession,
} from "@/lib/store"

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function AgendarPage() {
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [client, setClient] = useState<ClientSession | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Login fields
  const [loginName, setLoginName] = useState("")
  const [loginPhone, setLoginPhone] = useState("")

  // Booking fields
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isBooked, setIsBooked] = useState(false)

  const hasBarbers = barbers.length > 0

  // Dynamic steps based on whether barbers exist
  const getStepLabels = useCallback(() => {
    if (hasBarbers) return ["Servico", "Barbeiro", "Data", "Horario", "Confirmar"]
    return ["Servico", "Data", "Horario", "Confirmar"]
  }, [hasBarbers])

  const totalSteps = hasBarbers ? 5 : 4

  useEffect(() => {
    setServices(getServices())
    setBarbers(getBarbers())
    setBusiness(getBusiness())
    const existing = getClient()
    if (existing) {
      setClient(existing)
    }
    setIsLoaded(true)
  }, [])

  const service = services.find((s) => s.id === selectedService) ?? null
  const barber = barbers.find((b) => b.id === selectedBarber) ?? null

  // Map logical step to actual content
  const getStepContent = useCallback(() => {
    if (hasBarbers) {
      // 5 steps: service, barber, date, time, confirm
      return step
    }
    // 4 steps: service, date, time, confirm
    // step 1 = service, step 2 = date, step 3 = time, step 4 = confirm
    if (step === 1) return 1 // service
    if (step === 2) return 3 // date (skip barber)
    if (step === 3) return 4 // time
    if (step === 4) return 5 // confirm
    return step
  }, [step, hasBarbers])

  const canProceed = useCallback(() => {
    const content = getStepContent()
    switch (content) {
      case 1: return selectedService !== null
      case 2: return selectedBarber !== null
      case 3: return selectedDate !== null
      case 4: return selectedTime !== null
      case 5: return true // confirm button
      default: return false
    }
  }, [getStepContent, selectedService, selectedBarber, selectedDate, selectedTime])

  const handleLogin = () => {
    if (loginName.trim() && loginPhone.replace(/\D/g, "").length >= 10) {
      const session = { name: loginName.trim(), phone: loginPhone.trim() }
      saveClient(session)
      setClient(session)
    }
  }

  const handleNext = () => {
    if (step === totalSteps) {
      // Confirm booking
      const appointment = {
        id: Date.now().toString(),
        clientName: client!.name,
        clientPhone: client!.phone,
        serviceId: selectedService!,
        barberId: selectedBarber ?? "none",
        barberName: barber?.name ?? "Barbeiro nao confirmado",
        date: selectedDate!,
        time: selectedTime!,
        createdAt: new Date().toISOString(),
      }
      saveAppointment(appointment)
      setIsBooked(true)
      return
    }
    if (canProceed()) {
      setStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1))

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedTime(null)
  }

  const handleNewBooking = () => {
    setStep(1)
    setSelectedService(null)
    setSelectedBarber(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setIsBooked(false)
  }

  if (!isLoaded) return null

  // LOGIN SCREEN - shown first if not logged in
  if (!client) {
    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="flex min-h-[80dvh] items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image
                src="/logo.png"
                alt="Boto Velho Barbearia"
                width={80}
                height={80}
                className="rounded-xl"
              />
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Agendar Horario</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Informe seu nome e telefone para continuar
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div>
                <label htmlFor="login-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="login-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="login-phone" className="mb-1.5 block text-xs font-medium text-muted-foreground">Numero de telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="login-phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(formatPhone(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full rounded-xl border border-border bg-card py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogin}
                disabled={!loginName.trim() || loginPhone.replace(/\D/g, "").length < 10}
                className="mt-2 w-full rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar para agendamento
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // SUCCESS SCREEN
  if (isBooked) {
    const formattedDate = selectedDate
      ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : ""

    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
          <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="absolute -inset-3 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Agendado!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {client.name}, seu horario foi reservado com sucesso
              </p>
            </div>

            {/* Booking details card */}
            <div className="w-full overflow-hidden rounded-xl border border-primary/20 bg-card">
              <div className="bg-primary/10 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Detalhes do agendamento</p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Scissors className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Servico</p>
                    <p className="text-sm font-medium text-foreground">{service?.name}</p>
                  </div>
                  <span className="ml-auto text-sm font-bold text-primary">
                    {"R$ "}{service?.price.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Profissional</p>
                    <p className={`text-sm font-medium ${barber ? "text-foreground" : "text-primary"}`}>
                      {barber?.name ?? "Barbeiro nao confirmado"}
                    </p>
                  </div>
                  {!barber && <AlertTriangle className="ml-auto h-4 w-4 text-primary" />}
                </div>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="text-sm font-medium capitalize text-foreground">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horario</p>
                    <p className="text-sm font-medium text-foreground">{selectedTime}</p>
                  </div>
                </div>
                {business && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Local</p>
                      <p className="text-sm font-medium text-foreground">{business.name}</p>
                      <p className="text-xs text-muted-foreground">{business.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!barber && (
              <div className="w-full rounded-xl bg-primary/10 p-4">
                <p className="text-center text-xs text-primary">
                  O barbeiro sera confirmado pela barbearia e aparecera nos seus agendamentos.
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleNewBooking}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Novo agendamento
              </button>
              <Link
                href="/cliente"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Ver meus agendamentos
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // BOOKING FLOW
  const stepLabels = getStepLabels()
  const contentStep = getStepContent()

  // Confirmation step content
  const ConfirmStep = () => {
    const formattedDate = selectedDate
      ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      : ""

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Confirmar agendamento</h2>
          <p className="mt-1 text-sm text-muted-foreground">Revise os detalhes abaixo</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Scissors className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Servico</p>
              <p className="font-medium text-foreground">{service?.name}</p>
            </div>
            <span className="text-lg font-bold text-primary">
              {"R$ "}{service?.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="flex items-center gap-3 border-b border-border p-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Profissional</p>
              <p className={`font-medium ${barber ? "text-foreground" : "text-primary"}`}>
                {barber?.name ?? "Barbeiro nao confirmado"}
              </p>
            </div>
            {!barber && <AlertTriangle className="ml-auto h-5 w-5 text-primary" />}
          </div>
          <div className="flex items-center gap-3 border-b border-border p-4">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="font-medium capitalize text-foreground">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Horario</p>
              <p className="font-medium text-foreground">{selectedTime}</p>
            </div>
          </div>
        </div>

        {business && (
          <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{business.name}</p>
              <p className="text-xs text-muted-foreground">{business.address}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-muted p-4">
          <p className="text-center text-xs text-muted-foreground">
            Este estabelecimento permite cancelamentos com no minimo <span className="font-bold text-foreground">1 h</span> de antecedencia.
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      {/* Client info bar */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{client.name}</p>
              <p className="text-[10px] text-muted-foreground">{client.phone}</p>
            </div>
          </div>
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i + 1 < step
                      ? "bg-primary text-primary-foreground"
                      : i + 1 === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1 < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`hidden h-0.5 w-4 sm:block ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{stepLabels[step - 1]}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
          {contentStep === 1 && (
            <StepService services={services} selected={selectedService} onSelect={setSelectedService} />
          )}
          {contentStep === 2 && (
            <StepBarber barbers={barbers} selected={selectedBarber} onSelect={setSelectedBarber} />
          )}
          {contentStep === 3 && (
            <StepDate selected={selectedDate} onSelect={handleDateSelect} />
          )}
          {contentStep === 4 && (
            <StepTime selectedDate={selectedDate} selected={selectedTime} onSelect={setSelectedTime} />
          )}
          {contentStep === 5 && <ConfirmStep />}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              canProceed()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-secondary text-muted-foreground"
            }`}
          >
            {step === totalSteps ? (
              <>
                <Check className="h-4 w-4" />
                Confirmar agendamento
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      <div className="h-24" />
    </main>
  )
}

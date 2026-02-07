"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  User,
  Phone,
  CalendarDays,
  Clock,
  Scissors,
  LogOut,
  CalendarPlus,
  X,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import {
  getClient,
  saveClient,
  logoutClient,
  getAppointments,
  cancelAppointment,
  fetchServices,
  fetchBarbers,
  fetchBusiness,
  fetchAppointmentsForClient,
  type ClientSession,
  type Appointment,
  type Service,
  type Barber,
  type BusinessInfo,
} from "@/lib/store"

export default function ClientePage() {
  const [client, setClient] = useState<ClientSession | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [loginName, setLoginName] = useState("")
  const [loginPhone, setLoginPhone] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchServices(), fetchBarbers(), fetchBusiness()]).then(
      ([servicesData, barbersData, businessData]) => {
        if (!mounted) return
        setClient(getClient())
        setAppointments(getAppointments())
        setServices(servicesData)
        setBarbers(barbersData)
        setBusiness(businessData)
        setIsLoaded(true)
      },
    )
    return () => {
      mounted = false
    }
  }, [])

  const handleLogin = () => {
    if (loginName.trim() && loginPhone.trim().length >= 10) {
      const session = { name: loginName.trim(), phone: loginPhone.trim() }
      saveClient(session)
      setClient(session)
    }
  }

  const handleLogout = () => {
    logoutClient()
    setClient(null)
    setLoginName("")
    setLoginPhone("")
  }

  const handleCancel = useCallback(
    (id: string) => {
      cancelAppointment(id)
      if (client) {
        fetchAppointmentsForClient(client).then((data) => setAppointments(data))
      } else {
        setAppointments(getAppointments())
      }
    },
    [client]
  )

  useEffect(() => {
    if (!client) return
    let mounted = true
    fetchAppointmentsForClient(client).then((data) => {
      if (mounted) setAppointments(data)
    })
    return () => {
      mounted = false
    }
  }, [client])

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name ?? id
  const getServicePrice = (id: string) => services.find((s) => s.id === id)?.price ?? 0
  const getBarberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? id

  if (!isLoaded) return null

  // Login screen
  if (!client) {
    return (
      <main className="min-h-dvh bg-background">
        <Navbar />
        <div className="flex min-h-[70dvh] items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <Image
                src={business?.logoUrl ?? "/logo.png"}
                alt={business?.name ?? "Boto Velho Barbearia"}
                width={64}
                height={64}
                className="rounded-xl"
              />
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Minha Area</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe seu nome e telefone para acessar seus agendamentos
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(formatPhone(e.target.value))}
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={handleLogin}
                disabled={!loginName.trim() || loginPhone.replace(/\D/g, "").length < 10}
                className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // My appointments
  const myAppointments = appointments
    .filter(
      (a) =>
        a.clientName.toLowerCase() === client.name.toLowerCase() ||
        a.clientPhone.replace(/\D/g, "") === client.phone.replace(/\D/g, "")
    )
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* User header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Image
              src={business?.logoUrl ?? "/logo.png"}
              alt={business?.name ?? "Logo"}
              width={36}
              height={36}
              className="rounded-lg"
            />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>

        {/* My appointments section */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary">Meus</p>
              <h2 className="font-serif text-2xl font-bold text-foreground">Agendamentos</h2>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Novo
            </Link>
          </div>

          {myAppointments.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Nenhum agendamento</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Voce ainda nao tem agendamentos. Agende agora!
                </p>
              </div>
              <Link
                href="/"
                className="mt-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Agendar Horario
              </Link>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {myAppointments.map((appt) => {
                const apptDate = new Date(appt.date + "T12:00:00")
                const formattedDate = apptDate.toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                const isPast = new Date(`${appt.date}T${appt.time}`) < new Date()

                return (
                  <div
                    key={appt.id}
                    className={`overflow-hidden rounded-xl border bg-card ${
                      isPast ? "border-border opacity-60" : "border-border"
                    }`}
                  >
                    {/* Date header */}
                    <div className="flex items-center justify-between bg-secondary px-4 py-2.5">
                      <p className="text-sm font-medium text-foreground">
                        {formattedDate} as {appt.time}
                      </p>
                      {!isPast && (
                        <button
                          type="button"
                          onClick={() => handleCancel(appt.id)}
                          className="flex items-center gap-1 rounded-md bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground transition-colors hover:bg-destructive/90"
                        >
                          CANCELAR
                        </button>
                      )}
                      {isPast && (
                        <span className="text-xs text-muted-foreground">Concluido</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <p className="font-medium text-foreground">{appt.clientName}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">
                            {getServiceName(appt.serviceId)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Profissional: {getBarberName(appt.barberId)}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          R$ {getServicePrice(appt.serviceId).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Cancellation policy */}
          <div className="mt-6 rounded-xl bg-muted p-4">
            <p className="text-center text-xs text-muted-foreground">
              Este estabelecimento permite cancelamentos com no minimo{" "}
              <span className="font-bold text-foreground">1 h</span> de antecedencia.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

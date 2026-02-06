"use client"

import { Scissors, User, CalendarDays, Clock, MapPin, Phone } from "lucide-react"
import type { Service, Barber, BusinessInfo } from "@/lib/store"

interface StepConfirmProps {
  service: Service | null
  barber: Barber | null
  date: string | null
  time: string | null
  customerName: string
  customerPhone: string
  onNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
  business: BusinessInfo | null
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function StepConfirm({
  service,
  barber,
  date,
  time,
  customerName,
  customerPhone,
  onNameChange,
  onPhoneChange,
  business,
}: StepConfirmProps) {
  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : ""

  const handlePhoneChange = (value: string) => {
    onPhoneChange(formatPhone(value))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Confirmar agendamento</h2>
        <p className="mt-1 text-sm text-muted-foreground">Revise os detalhes e preencha seus dados</p>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Servico</p>
            <p className="font-medium text-foreground">{service?.name}</p>
          </div>
          <span className="text-lg font-bold text-primary">
            R$ {service?.price.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profissional</p>
            <p className="font-medium text-foreground">{barber?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-medium capitalize text-foreground">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Horario</p>
            <p className="font-medium text-foreground">{time}</p>
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Seus dados</p>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nome completo"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={customerPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Location */}
      {business && (
        <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{business.name}</p>
            <p className="text-xs text-muted-foreground">{business.address}</p>
          </div>
        </div>
      )}

      {/* Cancellation policy */}
      <div className="rounded-xl bg-muted p-4">
        <p className="text-center text-xs text-muted-foreground">
          Este estabelecimento permite cancelamentos com no minimo <span className="font-bold text-foreground">1 h</span> de antecedencia.
        </p>
      </div>
    </div>
  )
}

"use client"

import { CheckCircle2, CalendarDays, Clock, Scissors, User } from "lucide-react"
import Link from "next/link"
import type { Service, Barber } from "@/lib/store"

interface BookingSuccessProps {
  service: Service | null
  barber: Barber | null
  date: string | null
  time: string | null
  customerName: string
  onNewBooking: () => void
}

export function BookingSuccess({
  service,
  barber,
  date,
  time,
  customerName,
  onNewBooking,
}: BookingSuccessProps) {
  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : ""

  return (
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
            {customerName ? `${customerName}, seu` : "Seu"} horario foi reservado com sucesso
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-primary/20 bg-card">
          <div className="bg-primary/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Detalhes do agendamento</p>
          </div>
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Scissors className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Servico</p>
                <p className="text-sm font-medium text-foreground">{service?.name}</p>
              </div>
              <span className="ml-auto text-sm font-bold text-primary">
                R$ {service?.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Profissional</p>
                <p className="text-sm font-medium text-foreground">{barber?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm font-medium capitalize text-foreground">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Horario</p>
                <p className="text-sm font-medium text-foreground">{time}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={onNewBooking}
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
  )
}

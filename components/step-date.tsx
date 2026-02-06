"use client"

import { Check, CalendarDays } from "lucide-react"
import { getNextDays } from "@/lib/store"

interface StepDateProps {
  selected: string | null
  onSelect: (dateStr: string) => void
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export function StepDate({ selected, onSelect }: StepDateProps) {
  const days = getNextDays(14)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Escolha a data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Selecione o melhor dia para voce</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {days.map((date) => {
          const dateStr = date.toISOString().split("T")[0]
          const isSelected = selected === dateStr
          const isToday = date.toDateString() === new Date().toDateString()
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`group relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {dayNames[date.getDay()]}
              </span>
              <span className={`text-2xl font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                {date.getDate()}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {monthNames[date.getMonth()]}
              </span>
              {isToday && (
                <span className="text-[9px] font-medium text-primary">Hoje</span>
              )}
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
        <CalendarDays className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          {selected
            ? `Selecionado: ${new Date(selected + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`
            : "Funcionamos de segunda a sabado"}
        </p>
      </div>
    </div>
  )
}

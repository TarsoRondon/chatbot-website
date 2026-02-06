"use client"

import { Check, Clock } from "lucide-react"
import { useMemo } from "react"
import { generateTimeSlots } from "@/lib/store"

interface StepTimeProps {
  selectedDate: string | null
  selected: string | null
  onSelect: (time: string) => void
}

export function StepTime({ selectedDate, selected, onSelect }: StepTimeProps) {
  const slots = useMemo(() => {
    if (!selectedDate) return []
    return generateTimeSlots(new Date(selectedDate + "T12:00:00"))
  }, [selectedDate])

  const morningSlots = slots.filter((s) => {
    const hour = Number.parseInt(s.time.split(":")[0])
    return hour < 12
  })
  const afternoonSlots = slots.filter((s) => {
    const hour = Number.parseInt(s.time.split(":")[0])
    return hour >= 12 && hour < 18
  })
  const eveningSlots = slots.filter((s) => {
    const hour = Number.parseInt(s.time.split(":")[0])
    return hour >= 18
  })

  const renderSlotGroup = (label: string, groupSlots: typeof slots) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {groupSlots.map((slot) => {
          const isSelected = selected === slot.time
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => slot.available && onSelect(slot.time)}
              className={`relative rounded-lg border px-2 py-2.5 text-sm font-medium transition-all duration-200 ${
                !slot.available
                  ? "cursor-not-allowed border-border bg-card text-muted-foreground/40 line-through"
                  : isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              {slot.time}
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground">
                  <Check className="h-2.5 w-2.5 text-background" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Escolha o horario</h2>
        <p className="mt-1 text-sm text-muted-foreground">Selecione o melhor horario para voce</p>
      </div>
      <div className="flex flex-col gap-5">
        {morningSlots.length > 0 && renderSlotGroup("Manha", morningSlots)}
        {afternoonSlots.length > 0 && renderSlotGroup("Tarde", afternoonSlots)}
        {eveningSlots.length > 0 && renderSlotGroup("Noite", eveningSlots)}
      </div>
    </div>
  )
}

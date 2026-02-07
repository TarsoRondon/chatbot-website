"use client"

import { Check, Clock } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface StepTimeProps {
  selectedDate: string | null
  selected: string | null
  onSelect: (time: string) => void
  barberId?: string | null
}

interface Slot {
  time: string
  available: boolean
}

export function StepTime({ selectedDate, selected, onSelect, barberId }: StepTimeProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ date: selectedDate })
        if (barberId) params.set("barberId", barberId)
        const res = await fetch(`/api/public/availability?${params.toString()}`)
        const json = res.ok ? await res.json() : { slots: [] }
        if (mounted) setSlots(Array.isArray(json.slots) ? json.slots : [])
      } catch {
        if (mounted) setSlots([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [selectedDate, barberId])

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
      {loading && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Carregando horarios disponiveis...
        </div>
      )}
      <div className="flex flex-col gap-5">
        {morningSlots.length > 0 && renderSlotGroup("Manha", morningSlots)}
        {afternoonSlots.length > 0 && renderSlotGroup("Tarde", afternoonSlots)}
        {eveningSlots.length > 0 && renderSlotGroup("Noite", eveningSlots)}
        {!loading && slots.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Nenhum horario disponivel para este dia.
          </div>
        )}
      </div>
    </div>
  )
}

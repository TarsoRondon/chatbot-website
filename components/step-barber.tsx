"use client"

import { Check } from "lucide-react"
import type { Barber } from "@/lib/store"

interface StepBarberProps {
  barbers: Barber[]
  selected: string | null
  onSelect: (id: string) => void
}

export function StepBarber({ barbers, selected, onSelect }: StepBarberProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Escolha o profissional</h2>
        <p className="mt-1 text-sm text-muted-foreground">Selecione o barbeiro de sua preferencia</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {barbers.map((barber) => {
          const isSelected = selected === barber.id
          return (
            <button
              key={barber.id}
              type="button"
              onClick={() => onSelect(barber.id)}
              className={`group flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <div className="relative">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground group-hover:text-primary"
                  }`}
                >
                  {barber.avatar}
                </div>
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {barber.name}
                </p>
                <p className="text-xs text-muted-foreground">{barber.role}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

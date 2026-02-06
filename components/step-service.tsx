"use client"

import { Check, Scissors } from "lucide-react"
import type { Service } from "@/lib/store"

interface StepServiceProps {
  services: Service[]
  selected: string | null
  onSelect: (id: string) => void
}

export function StepService({ services, selected, onSelect }: StepServiceProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Escolha o servico</h2>
        <p className="mt-1 text-sm text-muted-foreground">Selecione o que deseja fazer hoje</p>
      </div>
      <div className="flex flex-col gap-3">
        {services.map((service) => {
          const isSelected = selected === service.id
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground group-hover:text-primary"
                }`}
              >
                <Scissors className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {service.name}
                </p>
                <p className="text-xs text-muted-foreground">{service.duration}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-lg font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  R$ {service.price.toFixed(2).replace(".", ",")}
                </span>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

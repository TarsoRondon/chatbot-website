"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Scissors, Clock, MapPin, Phone, Instagram, CalendarPlus } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { getServices, getBusiness, type Service, type BusinessInfo } from "@/lib/store"

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [business, setBusiness] = useState<BusinessInfo | null>(null)

  useEffect(() => {
    setServices(getServices())
    setBusiness(getBusiness())
  }, [])

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/logo.png"
            alt={business?.name ?? "Barbearia"}
            width={80}
            height={80}
            className="rounded-xl"
          />
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">{business?.name ?? "Barbearia"}</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {business?.description}
            </p>
          </div>
        </div>

        {/* Services grid */}
        <div className="mt-10">
          <h2 className="mb-6 font-serif text-xl font-bold text-foreground">Tabela de Precos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{service.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{service.duration}</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary shrink-0">
                  R$ {service.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarPlus className="h-5 w-5" />
            Agendar Horario
          </Link>
        </div>

        {/* Business info */}
        {business && (
          <div className="mt-10 flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Informacoes</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{business.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{business.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{business.instagram}</p>
              </div>
            </div>

            <div className="mt-2 rounded-lg bg-muted p-4">
              <p className="text-center text-xs text-muted-foreground">
                Este estabelecimento permite cancelamentos com no minimo <span className="font-bold text-foreground">1 h</span> de antecedencia.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

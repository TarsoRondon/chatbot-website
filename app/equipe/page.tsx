"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarPlus, MapPin, Phone, Instagram, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { fetchBarbers, fetchBusiness, type Barber, type BusinessInfo } from "@/lib/store"

export default function EquipePage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [business, setBusiness] = useState<BusinessInfo | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchBarbers(), fetchBusiness()]).then(([barbersData, businessData]) => {
      if (!mounted) return
      setBarbers(barbersData)
      setBusiness(businessData)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src={business?.logoUrl ?? "/logo.png"}
            alt={business?.name ?? "Barbearia"}
            width={80}
            height={80}
            className="rounded-xl"
          />
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Nossa equipe</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Profissionais experientes e dedicados para entregar o melhor resultado.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Nenhum profissional cadastrado ainda.
            </div>
          )}

          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                {barber.photoUrl ? (
                  <Image
                    src={barber.photoUrl}
                    alt={barber.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground">
                    {barber.avatar}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <div className="p-5 text-center">
                <p className="text-base font-semibold text-foreground">{barber.name}</p>
                <p className="text-xs text-muted-foreground">{barber.role}</p>
              </div>
            </div>
          ))}
        </div>

        {business && (
          <div className="mt-12 grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Endereco</p>
                <p className="text-sm text-foreground">{business.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Telefone</p>
                <p className="text-sm text-foreground">{business.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Instagram</p>
                <p className="text-sm text-foreground">{business.instagram}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Horario</p>
                <p className="text-sm text-foreground">{business.hours}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/agendar"
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CalendarPlus className="h-5 w-5" />
            Agendar Horario
          </Link>
        </div>
      </div>
    </main>
  )
}

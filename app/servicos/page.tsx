"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Scissors, Clock, MapPin, Phone, Instagram, CalendarPlus, Star } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { fetchServices, fetchBusiness, type Service, type BusinessInfo } from "@/lib/store"

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [business, setBusiness] = useState<BusinessInfo | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.all([fetchServices(), fetchBusiness()]).then(([servicesData, businessData]) => {
      if (!mounted) return
      setServices(servicesData)
      setBusiness(businessData)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Ambiente da barbearia"
            fill
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/50" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-4">
              <Image
                src={business?.logoUrl ?? "/logo.png"}
                alt={business?.name ?? "Barbearia"}
                width={72}
                height={72}
                className="rounded-xl"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tabela de servicos</p>
                <h1 className="mt-2 font-serif text-4xl font-bold text-foreground md:text-5xl">
                  Servicos e precos
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Escolha o servico ideal para o seu estilo. Atendimento pontual, ambiente premium e profissionais experientes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/agendar"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <CalendarPlus className="h-4 w-4" />
                Agendar horario
              </Link>
              <Link
                href="/cliente"
                className="flex items-center gap-2 rounded-xl border border-primary/40 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10"
              >
                Minha area
              </Link>
            </div>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Scissors className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Cortes modernos</p>
              <p className="mt-1 text-xs text-muted-foreground">Modelos atuais e personalizados.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Pontualidade</p>
              <p className="mt-1 text-xs text-muted-foreground">Horario reservado com hora marcada.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Star className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Experiencia premium</p>
              <p className="mt-1 text-xs text-muted-foreground">Produtos e acabamento de alto nivel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services list */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Servicos</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-foreground md:text-3xl">Tabela de precos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Valores atualizados e transparencia total no atendimento.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {services.length} servico(s)
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-secondary/40"
            >
              {index === 0 && (
                <span className="absolute right-4 top-4 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Mais pedido
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{service.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-2xl font-bold text-primary">
                  R$ {service.price.toFixed(2).replace(".", ",")}
                </span>
                <Link
                  href="/agendar"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary"
                >
                  Agendar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border border-border bg-card px-6 py-8 md:flex md:items-center md:justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground">Pronto para agendar?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha o servico, horario e finalize em poucos minutos.
            </p>
          </div>
          <Link
            href="/agendar"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:mt-0"
          >
            <CalendarPlus className="h-5 w-5" />
            Agendar Horario
          </Link>
        </div>
      </section>

      {/* Business info */}
      {business && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">Informacoes</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Atendimento por agendamento com horario reservado.
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 text-primary" />
                  <span>{business.instagram}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-xl bg-secondary/60 p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Horario</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{business.hours}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-center text-xs text-muted-foreground">
                  Cancelamentos com no minimo <span className="font-bold text-foreground">1 h</span> de antecedencia.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

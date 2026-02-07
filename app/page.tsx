"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin, Scissors, Users, Star, ChevronRight, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import {
  fetchServices,
  fetchBarbers,
  fetchBusiness,
  fetchAboutTags,
  type Service,
  type Barber,
  type BusinessInfo,
  type AboutTag,
} from "@/lib/store"

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [aboutTags, setAboutTags] = useState<AboutTag[]>([])

  useEffect(() => {
    let mounted = true
    Promise.all([fetchServices(), fetchBarbers(), fetchBusiness(), fetchAboutTags()]).then(
      ([servicesData, barbersData, businessData, aboutData]) => {
        if (!mounted) return
        setServices(servicesData)
        setBarbers(barbersData)
        setBusiness(businessData)
        setAboutTags(aboutData)
      },
    )
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[85dvh] flex-col justify-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Barbearia"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>

        {/* Logo overlay */}
        <div className="absolute left-6 top-20 md:left-10 md:top-24">
          <Image
            src={business?.logoUrl ?? "/logo.png"}
            alt={business?.name ?? "Boto Velho"}
            width={100}
            height={100}
            className="rounded-xl opacity-90"
          />
        </div>

        {/* Hero content */}
        <div className="relative px-6 pb-10 md:px-10">
          <h1 className="font-serif text-5xl font-bold leading-tight text-foreground md:text-7xl">
            <span className="italic">Seu visual,</span>
            <br />
            <span className="italic">nossa arte.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
            Agendamento online, rapido e sem complicacao. Escolha o servico, o barbeiro e o melhor horario para voce.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/agendar"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
            >
              Agendar Horario
            </Link>
            <Link
              href="/servicos"
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-transparent px-8 py-4 text-sm font-bold text-foreground transition-all hover:border-primary hover:bg-primary/10"
            >
              Ver Servicos
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{business?.hours ?? "Seg - Sab, 09:00 - 19:00"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{business?.address ?? "Av. Alvaro Maia, 2947 - Porto Velho"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Nossos Servicos</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">O que oferecemos</h2>
            </div>
            <Link
              href="/servicos"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href="/agendar"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-secondary"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.duration}</p>
                </div>
                <span className="text-lg font-bold text-primary">
                  {"R$ "}{service.price.toFixed(2).replace(".", ",")}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex justify-center md:hidden">
            <Link
              href="/servicos"
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              Ver todos os servicos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Us */}
      {aboutTags.length > 0 && (
        <section className="relative overflow-hidden border-t border-border px-6 py-16 md:px-10">
          <div className="absolute -right-24 top-6 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-6 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-widest">Sobre nos</p>
                </div>
                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Detalhes que fazem a diferenca
                </h2>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                  Um pouco da nossa historia, do nosso estilo e da experiencia que voce encontra aqui.
                </p>
              </div>
              <Link
                href="/agendar"
                className="hidden items-center gap-2 rounded-full border border-primary/40 px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10 md:flex"
              >
                Agendar agora
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aboutTags.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-secondary/60">
                    {item.photoUrl ? (
                      <Image
                        src={item.photoUrl}
                        alt={item.title || item.tag}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Sem foto
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                      {item.tag || "Tema"}
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {item.title || "Novo tema"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description || "Adicione uma descricao no painel admin."}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex md:hidden">
              <Link
                href="/agendar"
                className="w-full rounded-full border border-primary/40 px-5 py-3 text-center text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10"
              >
                Agendar agora
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Team Preview */}
      {barbers.length > 0 && (
        <section className="border-t border-border px-6 py-16 md:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Nossa Equipe</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">Profissionais qualificados</h2>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {barbers.map((barber) => (
                <div key={barber.id} className="flex flex-col items-center gap-3">
                  {barber.photoUrl ? (
                    <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30">
                      <Image
                        src={barber.photoUrl || "/placeholder.svg"}
                        alt={barber.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-muted-foreground border-2 border-border">
                      {barber.avatar}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-medium text-foreground">{barber.name}</p>
                    <p className="text-xs text-muted-foreground">{barber.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t border-border px-6 py-16 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-5 w-5 fill-primary text-primary" />
            ))}
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold text-foreground text-balance">
            Agende seu horario em 2 minutos
          </h2>
          <p className="mt-3 text-muted-foreground">
            {business?.description}
          </p>
          <Link
            href="/agendar"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
          >
            Agendar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
          <Image
            src={business?.logoUrl ?? "/logo.png"}
            alt={business?.name ?? "Boto Velho"}
            width={48}
            height={48}
            className="rounded-lg"
          />
          <p className="text-sm text-muted-foreground">{business?.address}</p>
          <p className="text-xs text-muted-foreground">
            {"2026 "}{business?.name ?? "Boto Velho Barbearia"}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { fetchBusiness, type BusinessInfo } from "@/lib/store"

const navItems = [
    { href: "/", label: "Inicio" },
  { href: "/servicos", label: "Servicos" },
  { href: "/equipe", label: "Equipe" },
  { href: "/agendar", label: "Agendar" },
  { href: "/cliente", label: "Minha Area" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [business, setBusiness] = useState<BusinessInfo | null>(null)

  useEffect(() => {
    let mounted = true
    fetchBusiness().then((data) => {
      if (mounted) setBusiness(data)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl border border-border/60 bg-background/70 p-1">
              <Image
                src={business?.logoUrl || "/logo.png"}
                alt={business?.name ?? "Boto Velho Barbearia"}
                width={64}
                height={44}
                className="h-11 w-16 rounded-lg"
              />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
              Barbearia <span className="text-primary">BOTO VELHO</span>
            </span>
          </Link>

        {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isAccent = item.href === "/cliente"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-2 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : isAccent
                        ? "text-primary/90 hover:text-primary"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-px w-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:block">
            <Link
              href="/agendar"
              className="rounded-full border border-primary/70 bg-transparent px-6 py-2.5 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary/10"
            >
              Agendar Agora
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-card/95 px-4 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Admin
            </Link>
          </nav>
          <Link
            href="/agendar"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
          >
            Agendar Agora
          </Link>
        </div>
      )}
    </header>
  )
}

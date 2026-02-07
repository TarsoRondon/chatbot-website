"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari legacy
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setVisible(false)
      return
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setVisible(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={install}
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 text-sm font-semibold text-foreground shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-secondary/80"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
        </span>
        <span className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">PWA</span>
          <span>Instalar App</span>
        </span>
      </button>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"

export function UpdateAvailableToast() {
  const [visible, setVisible] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const refreshingRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    const onControllerChange = () => {
      if (refreshingRef.current) {
        window.location.reload()
      }
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    const checkForUpdate = async () => {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      setRegistration(reg)

      if (reg.waiting) {
        setVisible(true)
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setVisible(true)
          }
        })
      })
    }

    checkForUpdate()

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [])

  const handleUpdate = async () => {
    if (!registration) return
    refreshingRef.current = true

    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
      return
    }

    try {
      await registration.update()
    } catch {
      // ignore update errors
    }
    window.location.reload()
  }

  if (!visible) return null

  return (
    <div className="fixed right-6 top-6 z-50 max-w-sm rounded-2xl border border-border bg-card/95 px-4 py-3 text-sm text-foreground shadow-lg backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <RefreshCw className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Atualização disponível</p>
          <p className="text-xs text-muted-foreground">Clique para aplicar a nova versão.</p>
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Atualizar
        </button>
      </div>
    </div>
  )
}

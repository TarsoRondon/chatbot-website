"use client"

import { useEffect, useRef, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"

export function NetworkStatusToast() {
  const [online, setOnline] = useState(true)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    setOnline(navigator.onLine)
    setVisible(!navigator.onLine)

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const handleOnline = () => {
      setOnline(true)
      setVisible(true)
      clearTimer()
      timerRef.current = window.setTimeout(() => setVisible(false), 3000)
    }

    const handleOffline = () => {
      clearTimer()
      setOnline(false)
      setVisible(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearTimer()
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full border border-border bg-card/95 px-4 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur">
      <div className="flex items-center gap-2">
        {online ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-destructive" />}
        <span>{online ? "Conexão restaurada" : "Sem conexão com a internet"}</span>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Share2 } from "lucide-react"

const DISMISS_KEY = "pwa-ios-hint-dismissed-until"
const DISMISS_DAYS = 7

function isIosSafari() {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent
  const isIos = /iPhone|iPad|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua)
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua)
  return isIos && isSafari && !isOtherBrowser
}

function isStandalone() {
  if (typeof window === "undefined") return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
}

export function IosInstallHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isIosSafari() || isStandalone()) return
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissedUntil > Date.now()) return
    setVisible(true)
  }, [])

  const handleDismiss = () => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(until))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-xs rounded-2xl border border-border bg-card/95 p-4 text-sm text-foreground shadow-lg backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Share2 className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="font-semibold">Instale no iPhone</p>
          <p className="text-xs text-muted-foreground">
            Toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
      >
        Entendi
      </button>
    </div>
  )
}

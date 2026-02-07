"use client";

import React, { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Props = {
  delayMs?: number; // recomendado: 15000 ou 30000
  dismissDays?: number; // recomendado: 7
  requireInteraction?: boolean; // recomendado: true
};

const STORAGE_KEY = "pwa_install_dismissed_until";

function nowMs(): number {
  return Date.now();
}

function getDismissUntil(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const num = raw ? Number(raw) : 0;
  return Number.isFinite(num) ? num : 0;
}

function setDismissUntil(days: number) {
  if (typeof window === "undefined") return;
  const ms = days * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(STORAGE_KEY, String(nowMs() + ms));
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mmStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;

  const navStandalone = (window.navigator as any).standalone === true;
  return mmStandalone || navStandalone;
}

function isChromium(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (isIOS) return false;
  return /Chrome|Chromium|Edg/i.test(ua);
}

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function InstallPWAButtonPremium({
  delayMs = 15_000,
  dismissDays = 7,
  requireInteraction = true,
}: Props) {
  const eligibleBrowser = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isChromium() && !isStandalone();
  }, []);

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [readyAfterDelay, setReadyAfterDelay] = useState(false);
  const [hadInteraction, setHadInteraction] = useState(!requireInteraction);
  const [installing, setInstalling] = useState(false);

  // Delay
  useEffect(() => {
    if (!eligibleBrowser) return;

    const dismissedUntil = getDismissUntil();
    if (dismissedUntil > nowMs()) return;

    const t = window.setTimeout(() => setReadyAfterDelay(true), delayMs);
    return () => window.clearTimeout(t);
  }, [eligibleBrowser, delayMs]);

  // Interação
  useEffect(() => {
    if (!eligibleBrowser || !requireInteraction) return;

    const onInteract = () => setHadInteraction(true);

    window.addEventListener("scroll", onInteract, { passive: true, once: true });
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("mousemove", onInteract, { once: true });

    return () => {
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("mousemove", onInteract);
    };
  }, [eligibleBrowser, requireInteraction]);

  // Captura beforeinstallprompt
  useEffect(() => {
    if (!eligibleBrowser) return;

    const dismissedUntil = getDismissUntil();
    if (dismissedUntil > nowMs()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, [eligibleBrowser]);

  // Mostrar quando estiver pronto
  useEffect(() => {
    if (!eligibleBrowser) return;
    if (!deferred) return;
    if (!readyAfterDelay) return;
    if (!hadInteraction) return;

    const dismissedUntil = getDismissUntil();
    if (dismissedUntil > nowMs()) return;

    setVisible(true);
  }, [eligibleBrowser, deferred, readyAfterDelay, hadInteraction]);

  // Esconder após instalação
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onInstalled = () => {
      setDeferred(null);
      setVisible(false);
    };

    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  function close() {
    setDismissUntil(dismissDays);
    setVisible(false);
  }

  async function install() {
    if (!deferred || installing) return;

    try {
      setInstalling(true);
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // não spammar console
    } finally {
      setInstalling(false);
      // some por um tempo mesmo se cancelar
      close();
    }
  }

  if (!eligibleBrowser || !visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[min(92vw,420px)]">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/45 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="flex gap-3 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <span className="text-lg">⬇️</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Instalar App</p>
            <p className="mt-1 text-sm leading-snug text-white/80">
              Use como aplicativo: abre mais rápido e fica na sua tela inicial.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={close}
                className={cx(
                  "rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white/90",
                  "ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]",
                )}
                type="button"
              >
                Agora não
              </button>

              <button
                onClick={install}
                disabled={installing}
                className={cx(
                  "rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black",
                  "transition hover:bg-white/95 active:scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:opacity-70",
                )}
                type="button"
              >
                {installing ? "Instalando..." : "Instalar"}
              </button>

              <span className="ml-auto text-[11px] text-white/60">Chrome / Edge</span>
            </div>
          </div>

          <button
            onClick={close}
            className="ml-auto h-9 w-9 rounded-xl bg-white/5 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 active:scale-[0.98]"
            aria-label="Fechar"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

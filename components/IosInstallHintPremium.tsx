"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  delayMs?: number; // recomendado: 30000
  dismissDays?: number; // recomendado: 7
  requireInteraction?: boolean; // recomendado: true
};

const STORAGE_KEY = "ios_install_hint_dismissed_until";

function isLikelyIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  const isIOSDevice = /iPhone|iPad|iPod/i.test(ua);
  const isIpadOs =
    /Macintosh/i.test(ua) && (window.navigator as any).maxTouchPoints > 1;
  return isIOSDevice || isIpadOs;
}

function isSafariOnIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";

  const isIOS = isLikelyIos();
  if (!isIOS) return false;

  const isChrome = /CriOS/i.test(ua);
  const isFirefox = /FxiOS/i.test(ua);
  const isEdge = /EdgiOS/i.test(ua);
  const isOpera = /OPiOS/i.test(ua);

  return !(isChrome || isFirefox || isEdge || isOpera);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  const navStandalone = (window.navigator as any).standalone === true;

  const mmStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return navStandalone || mmStandalone;
}

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

export default function IosInstallHintPremium({
  delayMs = 30_000,
  dismissDays = 7,
  requireInteraction = true,
}: Props) {
  const eligible = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isLikelyIos() && isSafariOnIos() && !isStandalone();
  }, []);

  const [visible, setVisible] = useState(false);
  const [readyAfterDelay, setReadyAfterDelay] = useState(false);
  const [hadInteraction, setHadInteraction] = useState(!requireInteraction);

  useEffect(() => {
    if (!eligible) return;

    const dismissedUntil = getDismissUntil();
    if (dismissedUntil > nowMs()) return;

    const t = window.setTimeout(() => setReadyAfterDelay(true), delayMs);
    return () => window.clearTimeout(t);
  }, [eligible, delayMs]);

  useEffect(() => {
    if (!eligible || !requireInteraction) return;

    const onInteract = () => setHadInteraction(true);

    window.addEventListener("scroll", onInteract, { passive: true, once: true });
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, {
      passive: true,
      once: true,
    });

    return () => {
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, [eligible, requireInteraction]);

  useEffect(() => {
    if (!eligible) return;
    if (!readyAfterDelay) return;
    if (!hadInteraction) return;

    const dismissedUntil = getDismissUntil();
    if (dismissedUntil > nowMs()) return;

    setVisible(true);
  }, [eligible, readyAfterDelay, hadInteraction]);

  function close() {
    setDismissUntil(dismissDays);
    setVisible(false);
  }

  if (!eligible || !visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] w-[min(96vw,520px)] -translate-x-1/2">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/45 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="flex gap-3 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <span className="text-lg">⤴︎</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Instale o app</p>

            <p className="mt-1 text-sm leading-snug text-white/80">
              Use o Chatbot como um aplicativo no seu iPhone.
              <span className="block">
                Toque em <b className="text-white">Compartilhar (⤴︎)</b> e depois
                em <b className="text-white">“Adicionar à Tela de Início”</b>.
              </span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={close}
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white/90 ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
                type="button"
              >
                Agora não
              </button>

              <button
                onClick={close}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/95 active:scale-[0.98]"
                type="button"
              >
                Entendi
              </button>

              <span className="ml-auto text-[11px] text-white/60">
                Safari • iOS
              </span>
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

      <p className="mt-2 text-center text-[11px] text-black/60 dark:text-white/40">
        Dica: você pode remover isso depois em Ajustes → Tela de Início.
      </p>
    </div>
  );
}

import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Boto Velho Barbearia | Agendamento Online',
  description: 'Agende seu horario online na Boto Velho Barbearia. Corte, barba, selagem e muito mais em Porto Velho.',
}

export const viewport: Viewport = {
  themeColor: '#1a1d24',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${_inter.variable} ${_playfair.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}

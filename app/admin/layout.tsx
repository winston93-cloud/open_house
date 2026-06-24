import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './admin-totality-theme.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dashboard de Gestión - Open House y Sesiones Informativas',
  description: 'Dashboard de gestión para Open House y Sesiones Informativas - Instituto Winston Churchill',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`admin-totality-theme ${spaceGrotesk.variable} ${inter.variable} ${inter.className}`}
      data-admin-theme="totality-festival"
    >
      {children}
    </div>
  )
}

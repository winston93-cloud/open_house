import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard de Gestión - Open House y Sesiones Informativas',
  description: 'Dashboard de gestión para Open House y Sesiones Informativas - Instituto Winston Churchill',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


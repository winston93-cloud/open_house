'use client'

import SesionesForm from '../components/SesionesForm'
import Link from 'next/link'

export default function SesionesPage() {
  return (
    <>
      <SesionesForm />
      
      {/* Botón flotante del asistente IA */}
      <Link
        href="/asistente"
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
        title="Asistente Virtual"
      >
        <span className="text-3xl">🤖</span>
        <span className="ml-0 max-w-0 overflow-hidden group-hover:ml-3 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
          ¿Necesitas ayuda?
        </span>
      </Link>
    </>
  )
}


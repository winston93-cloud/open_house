'use client'

import { useState } from 'react'
import InscripcionForm from './components/InscripcionForm'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <InscripcionForm />
      
      {/* Botón flotante del asistente IA */}
      <Link
        href="/asistente"
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        style={{ zIndex: 9999 }}
        title="Asistente Virtual"
      >
        <span className="text-3xl">🤖</span>
        <span className="ml-0 max-w-0 overflow-hidden group-hover:ml-3 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
          ¿Necesitas ayuda?
        </span>
      </Link>
    </div>
  )
}

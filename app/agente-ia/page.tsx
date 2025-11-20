'use client';

import { useState } from 'react';

export default function AgenteIAPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Encabezado */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              📚 Winston Informes y Citas 📝
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Tu asistente educativo personalizado
            </p>
          </div>

          {/* Tarjetas de información */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Atención Inmediata
              </h3>
              <p className="text-gray-600">
                Respuestas rápidas a tus consultas
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Agenda tu Cita
              </h3>
              <p className="text-gray-600">
                Programa tu visita fácilmente
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Asistente IA
              </h3>
              <p className="text-gray-600">
                Tecnología de inteligencia artificial
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              💬 ¿Cómo funciona?
            </h2>
            <div className="text-left space-y-4 text-gray-700">
              <p className="flex items-start">
                <span className="mr-3">✅</span>
                <span>Haz clic en el botón de chat del lado derecho</span>
              </p>
              <p className="flex items-start">
                <span className="mr-3">✅</span>
                <span>Escribe tu consulta o solicitud</span>
              </p>
              <p className="flex items-start">
                <span className="mr-3">✅</span>
                <span>Nuestro agente de IA te responderá al instante</span>
              </p>
              <p className="flex items-start">
                <span className="mr-3">✅</span>
                <span>Agenda citas, solicita información y más</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante de chat (estilo Kommo) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed right-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Abrir chat"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {/* Indicador de notificación */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            💬 Chatea con nosotros
          </span>
        </button>
      )}

      {/* Widget de chat */}
      {isChatOpen && (
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 w-96 h-[600px] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">Asistente Winston</h3>
                <p className="text-xs opacity-90">En línea</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* Mensaje de bienvenida */}
            <div className="mb-4">
              <div className="bg-white rounded-lg shadow p-3 inline-block max-w-[80%]">
                <p className="text-sm text-gray-800">
                  👋 ¡Hola! Soy tu asistente virtual de Winston. ¿En qué puedo ayudarte hoy?
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Escribe tu mensaje para comenzar...
                </p>
              </div>
            </div>
          </div>

          {/* Input de mensaje */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 hover:shadow-lg transition-shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


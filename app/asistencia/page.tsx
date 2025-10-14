'use client';

import { Suspense } from 'react';

export default function ConfirmarAsistencia() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          ¡Confirmación Exitosa! 🎉
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Tu asistencia ha sido confirmada correctamente.
        </p>
        <button
          onClick={() => window.location.href = 'https://www.winston93.edu.mx'}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

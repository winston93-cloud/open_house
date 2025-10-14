'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Inscripcion {
  id: string;
  nombre_aspirante: string;
  nivel_academico: string;
  confirmacion_asistencia: string;
  fecha_confirmacion?: string;
}

function ConfirmarAsistenciaContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      cargarInscripcion();
    } else {
      setError('ID de inscripción no encontrado');
      setLoading(false);
    }
  }, [id]);

  const cargarInscripcion = async () => {
    try {
      const response = await fetch(`/api/confirmar-asistencia?id=${id}`);
      const data = await response.json();

      if (data.success) {
        setInscripcion(data.inscripcion);
      } else {
        setError(data.error || 'Error al cargar la inscripción');
      }
    } catch (error) {
      setError('Error al cargar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!inscripcion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <p className="text-gray-600">Inscripción no encontrada</p>
        </div>
      </div>
    );
  }

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

export default function ConfirmarAsistencia() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmarAsistenciaContent />
    </Suspense>
  );
}

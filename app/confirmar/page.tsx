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
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState('');
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

  const confirmarAsistencia = async (confirmacion: 'confirmado' | 'no_confirmado') => {
    if (!inscripcion) return;

    setConfirmando(true);
    setError('');
    setMensaje('');

    try {
      const response = await fetch('/api/confirmar-asistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: inscripcion.id,
          confirmacion
        })
      });

      const data = await response.json();

      if (data.success) {
        setMensaje(data.mensaje);
        setInscripcion(data.inscripcion);
      } else {
        setError(data.error || 'Error al confirmar asistencia');
      }
    } catch (error) {
      setError('Error al confirmar asistencia');
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!inscripcion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-gray-600">Inscripción no encontrada</p>
        </div>
      </div>
    );
  }

  const yaConfirmado = inscripcion.confirmacion_asistencia !== 'pendiente';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Confirmación de Asistencia
          </h1>
          <p className="text-gray-600">
            Open House 2025
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Información del Aspirante
          </h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {inscripcion.nombre_aspirante}</p>
            <p><span className="font-medium">Nivel:</span> {inscripcion.nivel_academico}</p>
            {yaConfirmado && (
              <p><span className="font-medium">Estado:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  inscripcion.confirmacion_asistencia === 'confirmado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {inscripcion.confirmacion_asistencia === 'confirmado' ? '✅ Confirmado' : '❌ No confirmado'}
                </span>
              </p>
            )}
          </div>
        </div>

        {mensaje && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{mensaje}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!yaConfirmado ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-4">
              ¿Podrás asistir al Open House?
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => confirmarAsistencia('confirmado')}
                disabled={confirmando}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {confirmando ? 'Confirmando...' : '✅ Sí, asistiré'}
              </button>
              
              <button
                onClick={() => confirmarAsistencia('no_confirmado')}
                disabled={confirmando}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {confirmando ? 'Confirmando...' : '❌ No podré asistir'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Ya has confirmado tu asistencia. ¡Gracias!
            </p>
            <p className="text-sm text-gray-500">
              Si necesitas cambiar tu respuesta, contacta a la institución.
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Instituto Winston Churchill<br />
            Open House 2025
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmarAsistencia() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmarAsistenciaContent />
    </Suspense>
  );
}

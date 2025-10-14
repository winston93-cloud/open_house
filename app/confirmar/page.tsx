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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border-4 border-yellow-400">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg font-semibold">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border-4 border-red-500">
          <div className="text-red-500 text-8xl mb-6 animate-bounce">❌</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!inscripcion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border-4 border-gray-400">
          <p className="text-gray-600 text-lg">Inscripción no encontrada</p>
        </div>
      </div>
    );
  }

  const yaConfirmado = inscripcion.confirmacion_asistencia !== 'pendiente';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-yellow-400">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 text-center">
          <div className="text-8xl mb-4 animate-bounce">🎓</div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Confirmación de Asistencia
          </h1>
          <p className="text-white text-xl font-semibold">
            Open House 2025
          </p>
        </div>

        <div className="p-8">
          {/* Información del aspirante */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6 border-4 border-blue-300 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
              👤 Información del Aspirante
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
                <span className="font-bold text-gray-700">Nombre:</span>
                <span className="text-blue-600 font-bold text-lg">{inscripcion.nombre_aspirante}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
                <span className="font-bold text-gray-700">Nivel:</span>
                <span className="text-purple-600 font-bold text-lg capitalize">{inscripcion.nivel_academico}</span>
              </div>
              {yaConfirmado && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
                  <span className="font-bold text-gray-700">Estado:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                    inscripcion.confirmacion_asistencia === 'confirmado' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {inscripcion.confirmacion_asistencia === 'confirmado' ? '✅ Confirmado' : '❌ No confirmado'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de éxito */}
          {mensaje && (
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 border-4 border-green-600 rounded-2xl p-6 mb-6 shadow-xl">
              <p className="text-white text-lg font-bold text-center">{mensaje}</p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-gradient-to-r from-red-400 to-pink-500 border-4 border-red-600 rounded-2xl p-6 mb-6 shadow-xl">
              <p className="text-white text-lg font-bold text-center">{error}</p>
            </div>
          )}

          {/* Botones de confirmación */}
          {!yaConfirmado ? (
            <div className="space-y-4">
              <p className="text-center text-gray-700 text-xl font-bold mb-6">
                ¿Podrás asistir al Open House?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => confirmarAsistencia('confirmado')}
                  disabled={confirmando}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-400 text-white font-bold py-6 px-8 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-green-700 disabled:transform-none"
                >
                  {confirmando ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirmando...
                    </span>
                  ) : (
                    '✅ Sí, asistiré'
                  )}
                </button>
                
                <button
                  onClick={() => confirmarAsistencia('no_confirmado')}
                  disabled={confirmando}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-red-300 disabled:to-pink-400 text-white font-bold py-6 px-8 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-red-700 disabled:transform-none"
                >
                  {confirmando ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirmando...
                    </span>
                  ) : (
                    '❌ No podré asistir'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-4 border-yellow-400">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-700 text-xl mb-4 font-bold">
                Ya has confirmado tu asistencia. ¡Gracias!
              </p>
              <p className="text-gray-600">
                Si necesitas cambiar tu respuesta, contacta a la institución.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-4 border-gray-300">
            <p className="text-center text-gray-600 font-bold text-lg">
              Instituto Winston Churchill<br />
              <span className="text-blue-600">Open House 2025</span>
            </p>
          </div>
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

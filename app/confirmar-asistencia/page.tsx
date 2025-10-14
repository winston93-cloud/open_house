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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-red-200">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!inscripcion) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-gray-200">
          <p className="text-gray-600">Inscripción no encontrada</p>
        </div>
      </div>
    );
  }

  const yaConfirmado = inscripcion.confirmacion_asistencia !== 'pendiente';

  return (
    <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-red-600">
        {/* Header */}
        <div className="bg-red-600 p-8 text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-4xl font-bold text-yellow-300 mb-2">
            ¡Confirmación de Asistencia! 🎓
          </h1>
          <p className="text-yellow-200 text-xl">
            Open House 2025 🏫
          </p>
        </div>

        {/* Contenido principal */}

        <div className="p-8 bg-yellow-50">
          {/* Información del aspirante */}
          <div className="bg-white rounded-lg p-6 mb-6 border-4 border-red-500">
            <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">
              📝 Información del Aspirante
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-yellow-100 p-3 rounded">
                <span className="font-bold text-red-700">👤 Nombre:</span>
                <span className="text-red-900 font-bold text-lg">{inscripcion.nombre_aspirante}</span>
              </div>
              <div className="flex justify-between items-center bg-yellow-100 p-3 rounded">
                <span className="font-bold text-red-700">🎓 Nivel:</span>
                <span className="text-red-900 font-bold text-lg capitalize">{inscripcion.nivel_academico}</span>
              </div>
              {yaConfirmado && (
                <div className="flex justify-between items-center pt-3 border-t-4 border-red-500">
                  <span className="font-bold text-red-700">✅ Estado:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-center font-semibold">{mensaje}</p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center font-semibold">{error}</p>
            </div>
          )}

          {/* Botones de confirmación */}
          {!yaConfirmado ? (
            <div className="space-y-4">
              <p className="text-center text-red-700 text-2xl font-bold mb-6">
                🤔 ¿Podrás asistir al Open House? 🤔
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={() => confirmarAsistencia('confirmado')}
                  disabled={confirmando}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-yellow-300 font-bold text-2xl py-6 px-12 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 disabled:cursor-not-allowed border-4 border-red-900"
                >
                  {confirmando ? '⏳ Confirmando...' : '🎉 ¡SÍ, ASISTIRÉ! 🎉'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center bg-yellow-100 border-4 border-red-500 rounded-lg p-6">
              <div className="text-6xl mb-3">🎉🎊🎈</div>
              <p className="text-red-700 text-2xl mb-2 font-bold">
                ¡Ya confirmaste tu asistencia! ¡Gracias! 🙏
              </p>
              <p className="text-gray-600 text-sm">
                Si necesitas cambiar tu respuesta, contacta a la institución.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              <strong>Instituto Winston Churchill</strong><br />
              Open House 2025
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmarAsistenciaContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface PendingReminder {
  id: string;
  nombre_aspirante: string;
  email: string;
  telefono: string;
  nivel_academico: string;
  grado_escolar: string;
  tipo_evento: 'open_house' | 'sesion';
  fecha_evento: string;
  hora_evento: string;
  institucion: string;
}

interface SendStatus {
  email: string;
  status: 'pending' | 'sending' | 'success' | 'error';
  message?: string;
}

export default function EnviarRecordatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [pendientes, setPendientes] = useState<PendingReminder[]>([]);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<Record<string, SendStatus>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/enviar-recordatorios-manual?preview=true');
      const data = await response.json();
      
      if (data.success && data.pendientes) {
        setPendientes(data.pendientes);
      } else {
        setPendientes([]);
      }
    } catch (error) {
      console.error('Error cargando pendientes:', error);
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  };

  const iniciarEnvio = () => {
    setShowConfirm(true);
  };

  const confirmarEnvio = async () => {
    setShowConfirm(false);
    setSending(true);

    // Inicializar estados
    const initialStatus: Record<string, SendStatus> = {};
    pendientes.forEach(p => {
      initialStatus[p.email] = { email: p.email, status: 'sending' };
    });
    setSendStatus(initialStatus);

    try {
      // Llamar al endpoint POST para enviar
      const response = await fetch('/api/enviar-recordatorios-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success && data.results) {
        // Actualizar estados según resultados
        data.results.forEach((result: any) => {
          setSendStatus(prev => ({
            ...prev,
            [result.email]: {
              email: result.email,
              status: result.status === 'success' ? 'success' : 'error',
              message: result.message
            }
          }));
        });
      }
      
      // Recargar pendientes después de enviar
      setTimeout(() => {
        cargarPendientes();
        setSending(false);
        setSendStatus({});
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar:', error);
      
      // Marcar todos como error
      pendientes.forEach(p => {
        setSendStatus(prev => ({
          ...prev,
          [p.email]: {
            email: p.email,
            status: 'error',
            message: 'Error al enviar'
          }
        }));
      });
      
      setSending(false);
    }
  };

  const proximosEnvios = [
    {
      fecha: 'Domingo 1 de Diciembre',
      hora: '6:00 PM',
      tipo: 'Sesión Informativa',
      niveles: ['Maternal', 'Kinder'],
      institucion: 'Instituto Educativo Winston',
      recordatorio: 'Domingo 30 de Noviembre, 9:00 AM'
    },
    {
      fecha: 'Viernes 6 de Diciembre',
      hora: '9:00 AM - 11:30 AM',
      tipo: 'Open House',
      niveles: ['Primaria'],
      institucion: 'Instituto Winston Churchill',
      recordatorio: 'Viernes 5 de Diciembre, 9:00 AM'
    },
    {
      fecha: 'Viernes 6 de Diciembre',
      hora: '11:30 AM - 2:00 PM',
      tipo: 'Open House',
      niveles: ['Secundaria'],
      institucion: 'Instituto Winston Churchill',
      recordatorio: 'Viernes 5 de Diciembre, 9:00 AM'
    },
    {
      fecha: 'Domingo 8 de Diciembre',
      hora: '6:00 PM',
      tipo: 'Sesión Informativa',
      niveles: ['Primaria'],
      institucion: 'Instituto Winston Churchill',
      recordatorio: 'Domingo 7 de Diciembre, 9:00 AM'
    },
    {
      fecha: 'Lunes 9 de Diciembre',
      hora: '6:00 PM',
      tipo: 'Sesión Informativa',
      niveles: ['Secundaria'],
      institucion: 'Instituto Winston Churchill',
      recordatorio: 'Lunes 8 de Diciembre, 9:00 AM'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📧 Sistema de Recordatorios
              </h1>
              <p className="text-gray-600 text-lg">
                Envío manual de recordatorios de Open House y Sesiones Informativas
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Fecha actual</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Date().toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recordatorios pendientes */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📮 Pendientes Hoy</h2>
              {pendientes.length > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xl font-bold px-4 py-2 rounded-full">
                  {pendientes.length}
                </span>
              )}
            </div>
            
            {pendientes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-600 text-lg font-medium">
                  No hay recordatorios pendientes para hoy
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Todos los envíos están al día
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendientes.map((p, idx) => (
                  <div 
                    key={idx}
                    className="bg-orange-50 rounded-lg p-4 border border-orange-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{p.nombre_aspirante}</p>
                        <p className="text-sm text-gray-600">{p.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.nivel_academico} • {p.grado_escolar}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.tipo_evento === 'open_house' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {p.tipo_evento === 'open_house' ? '🏠 Open House' : '📚 Sesión'}
                      </span>
                    </div>
                    
                    {sendStatus[p.email] && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        {sendStatus[p.email].status === 'pending' && (
                          <span className="text-gray-500 text-sm">⏳ En espera...</span>
                        )}
                        {sendStatus[p.email].status === 'sending' && (
                          <span className="text-blue-600 text-sm font-medium">📤 Enviando...</span>
                        )}
                        {sendStatus[p.email].status === 'success' && (
                          <span className="text-green-600 text-sm font-medium">✅ Enviado</span>
                        )}
                        {sendStatus[p.email].status === 'error' && (
                          <span className="text-red-600 text-sm font-medium">❌ Error</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Estadísticas</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Open House</p>
                <p className="text-3xl font-bold text-blue-600">34</p>
                <p className="text-xs text-gray-500 mt-1">Maternal/Kinder enviados el 28 nov</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Sesiones Informativas</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
                <p className="text-xs text-gray-500 mt-1">Primera sesión: 30 nov</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Tasa de éxito</p>
                <p className="text-3xl font-bold text-green-600">100%</p>
                <p className="text-xs text-gray-500 mt-1">34/34 enviados exitosamente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        {pendientes.length > 0 && !sending && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  ⚡ Listo para enviar {pendientes.length} recordatorio{pendientes.length > 1 ? 's' : ''}
                </h3>
                <p className="text-orange-100">
                  Los emails se enviarán de forma rápida. Los SMS están desactivados.
                </p>
              </div>
              <button
                onClick={iniciarEnvio}
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Enviar Ahora
              </button>
            </div>
          </div>
        )}

        {/* Próximos envíos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Próximos Envíos Programados</h2>
          <div className="space-y-4">
            {proximosEnvios.map((envio, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        envio.tipo === 'Open House'
                          ? 'bg-blue-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {envio.tipo === 'Open House' ? '🏠' : '📚'} {envio.tipo}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {envio.niveles.join(' • ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {envio.fecha}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      ⏰ {envio.hora}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      📍 {envio.institucion}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-sm font-medium text-blue-600">
                    📤 Enviar recordatorio: {envio.recordatorio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de confirmación */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Confirmar Envío
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de enviar <span className="font-bold text-orange-600">{pendientes.length}</span> recordatorio{pendientes.length > 1 ? 's' : ''}?
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarEnvio}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                  >
                    Sí, Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


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
  const confirmacion = searchParams.get('confirmacion');
  
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (id) {
      cargarInscripcion();
    } else {
      setError('ID de inscripción no encontrado');
      setLoading(false);
    }
  }, [id]);

  // Si viene con confirmacion=confirmado, automáticamente confirmar
  useEffect(() => {
    if (confirmacion === 'confirmado' && id && inscripcion && !confirmado) {
      console.log('Auto-confirmando asistencia...');
      setConfirmando(true);
      
      fetch(`/api/confirmar-asistencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, confirmacion: 'confirmado' }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setConfirmado(true);
        } else {
          console.error('Error auto-confirmando:', data.message);
        }
      })
      .catch(error => {
        console.error('Error auto-confirmando:', error);
      })
      .finally(() => {
        setConfirmando(false);
      });
    }
  }, [confirmacion, id, inscripcion, confirmado]);

  const cargarInscripcion = async () => {
    try {
      const response = await fetch(`/api/confirmar-asistencia?id=${id}`);
      const data = await response.json();

      if (data.success) {
        setInscripcion(data.inscripcion);
        if (data.inscripcion.confirmacion_asistencia === 'confirmado') {
          setConfirmado(true);
        }
      } else {
        setError(data.error || 'Error al cargar la inscripción');
      }
    } catch (error) {
      setError('Error al cargar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  const confirmarAsistencia = async () => {
    if (!id) return;
    
    setConfirmando(true);
    try {
      const response = await fetch(`/api/confirmar-asistencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, confirmacion: 'confirmado' }),
      });
      
      const data = await response.json();

      if (data.success) {
        setConfirmado(true);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Error al confirmar asistencia. Intenta de nuevo.');
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            border: '4px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
            Error
          </h2>
          <p style={{ color: '#666', marginBottom: '25px', fontSize: '16px' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.href = 'https://www.winston93.edu.mx'}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #3b82f6, #6366f1)',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!inscripcion) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        {confirmado ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: '15px' 
            }}>
              ¡Confirmación Exitosa!
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '25px',
              fontSize: '16px'
            }}>
              Hola <strong>{inscripcion.nombre_aspirante}</strong>,
            </p>
            <p style={{ 
              color: '#666', 
              marginBottom: '15px',
              fontSize: '16px'
            }}>
              Tu asistencia al Open House ha sido confirmada correctamente.
            </p>
            <p style={{ 
              color: '#666', 
              marginBottom: '25px',
              fontSize: '16px'
            }}>
              <strong>Nivel:</strong> {inscripcion.nivel_academico.charAt(0).toUpperCase() + inscripcion.nivel_academico.slice(1)}
            </p>
            <p style={{ 
              color: '#10b981', 
              marginBottom: '25px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              ¡Te esperamos! 🎓
            </p>
            <button
              onClick={() => window.location.href = 'https://www.winston93.edu.mx'}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Aceptar
            </button>
          </>
        ) : (
          <>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: '15px' 
            }}>
              ¿Podrás asistir al Open House?
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '15px',
              fontSize: '16px'
            }}>
              Hola <strong>{inscripcion.nombre_aspirante}</strong>,
            </p>
            <p style={{ 
              color: '#666', 
              marginBottom: '25px',
              fontSize: '16px'
            }}>
              Por favor confirma tu asistencia al Open House.
            </p>
            <button
              onClick={confirmarAsistencia}
              disabled={confirmando}
              style={{
                width: '100%',
                background: confirmando ? '#9ca3af' : 'linear-gradient(to right, #10b981, #059669)',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: confirmando ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                boxShadow: confirmando ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!confirmando) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!confirmando) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              {confirmando ? 'Confirmando...' : '✅ Sí, asistiré'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmarAsistencia() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            border: '4px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmarAsistenciaContent />
    </Suspense>
  );
}

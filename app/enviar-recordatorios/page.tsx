'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getProximosEnviosProgramados,
  getReminderCalendarSummary,
} from '../../lib/reminder-schedule';
import './recordatorios.css';

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

    const initialStatus: Record<string, SendStatus> = {};
    pendientes.forEach(p => {
      initialStatus[p.email] = { email: p.email, status: 'sending' };
    });
    setSendStatus(initialStatus);

    try {
      const response = await fetch('/api/enviar-recordatorios-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success && data.results) {
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
      
      setTimeout(() => {
        cargarPendientes();
        setSending(false);
        setSendStatus({});
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar:', error);
      
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

  const proximosEnvios = useMemo(() => getProximosEnviosProgramados(), []);
  const calendarioResumen = useMemo(() => getReminderCalendarSummary(), []);

  if (loading) {
    return (
      <div className="recordatorios-container">
        <div className="recordatorios-loading">
          <div className="recordatorios-spinner"></div>
          <p className="recordatorios-loading-text">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recordatorios-container">
      <div className="recordatorios-wrapper">
        {/* Header */}
        <div className="recordatorios-header">
          <div className="recordatorios-header-content">
            <div>
              <h1 className="recordatorios-title">
                📧 Sistema de Recordatorios
              </h1>
              <p className="recordatorios-subtitle">
                Envío manual de recordatorios de Open House y Sesiones Informativas
              </p>
            </div>
            <div className="recordatorios-fecha">
              <p className="recordatorios-fecha-label">Fecha actual</p>
              <p className="recordatorios-fecha-valor">
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
        <div className="recordatorios-grid">
          {/* Pendientes */}
          <div className="recordatorios-card recordatorios-card-pendientes">
            <div className="recordatorios-card-header">
              <h2 className="recordatorios-card-title">📮 Pendientes Hoy</h2>
              {pendientes.length > 0 && (
                <span className="recordatorios-badge">{pendientes.length}</span>
              )}
            </div>
            
            {pendientes.length === 0 ? (
              <div className="recordatorios-empty">
                <div className="recordatorios-empty-icon">✅</div>
                <p className="recordatorios-empty-text">
                  No hay recordatorios pendientes para hoy
                </p>
                <p className="recordatorios-empty-subtext">
                  Todos los envíos están al día
                </p>
              </div>
            ) : (
              <div className="recordatorios-list">
                {pendientes.map((p, idx) => (
                  <div key={idx} className="recordatorios-item">
                    <div className="recordatorios-item-header">
                      <div className="recordatorios-item-info">
                        <h4>{p.nombre_aspirante}</h4>
                        <p>{p.email}</p>
                        <p>{p.nivel_academico} • {p.grado_escolar}</p>
                      </div>
                      <span className={`recordatorios-item-badge ${
                        p.tipo_evento === 'open_house' 
                          ? 'recordatorios-badge-openhouse' 
                          : 'recordatorios-badge-sesion'
                      }`}>
                        {p.tipo_evento === 'open_house' ? '🏠 Open House' : '📚 Sesión'}
                      </span>
                    </div>
                    
                    {sendStatus[p.email] && (
                      <div className="recordatorios-item-status">
                        {sendStatus[p.email].status === 'pending' && (
                          <span className="recordatorios-status-pending">⏳ En espera...</span>
                        )}
                        {sendStatus[p.email].status === 'sending' && (
                          <span className="recordatorios-status-sending">📤 Enviando...</span>
                        )}
                        {sendStatus[p.email].status === 'success' && (
                          <span className="recordatorios-status-success">✅ Enviado</span>
                        )}
                        {sendStatus[p.email].status === 'error' && (
                          <span className="recordatorios-status-error">❌ Error</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="recordatorios-card recordatorios-card-estadisticas">
            <h2 className="recordatorios-card-title">📊 Calendario de Recordatorios 2026</h2>
            <div className="recordatorios-stats">
              <div className="recordatorios-stat-item recordatorios-stat-openhouse">
                <p className="recordatorios-stat-label">🏠 Open House</p>
                <p className="recordatorios-stat-value">
                  {calendarioResumen.openHouseEventos} evento
                  {calendarioResumen.openHouseEventos !== 1 ? 's' : ''}
                </p>
                <p className="recordatorios-stat-description">{calendarioResumen.openHouseEnviosLabel}</p>
              </div>
              <div className="recordatorios-stat-item recordatorios-stat-sesiones">
                <p className="recordatorios-stat-label">📚 Sesiones Informativas</p>
                <p className="recordatorios-stat-value">
                  {calendarioResumen.sesionesEventos} evento
                  {calendarioResumen.sesionesEventos !== 1 ? 's' : ''}
                </p>
                <p className="recordatorios-stat-description">{calendarioResumen.sesionesEnviosLabel}</p>
              </div>
              <div className="recordatorios-stat-item recordatorios-stat-exito">
                <p className="recordatorios-stat-label">📅 Primer recordatorio</p>
                <p className="recordatorios-stat-value">{calendarioResumen.primerRecordatorioLabel}</p>
                <p className="recordatorios-stat-description">{calendarioResumen.primerRecordatorioSub}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        {pendientes.length > 0 && !sending && (
          <div className="recordatorios-send-cta">
            <div className="recordatorios-send-content">
              <div>
                <h3 className="recordatorios-send-title">
                  ⚡ Listo para enviar {pendientes.length} recordatorio{pendientes.length > 1 ? 's' : ''}
                </h3>
                <p className="recordatorios-send-subtitle">
                  Los emails se enviarán de forma rápida. Los SMS están desactivados.
                </p>
              </div>
              <button
                onClick={iniciarEnvio}
                className="recordatorios-send-button"
              >
                🚀 Enviar Ahora
              </button>
            </div>
          </div>
        )}

        {/* Próximos envíos */}
        <div className="recordatorios-proximos">
          <h2 className="recordatorios-proximos-title">📅 Próximos Envíos Programados</h2>
          {proximosEnvios.length === 0 ? (
            <p className="recordatorios-empty-subtext" style={{ padding: '1rem 0' }}>
              No hay envíos de recordatorio programados a partir de hoy.
            </p>
          ) : (
          <div className="recordatorios-proximos-list">
            {proximosEnvios.map((envio, idx) => (
              <div key={idx} className="recordatorios-proximo-item">
                <div className="recordatorios-proximo-header">
                  <span className={`recordatorios-proximo-tipo ${
                    envio.tipo === 'Open House'
                      ? 'recordatorios-proximo-tipo-openhouse'
                      : 'recordatorios-proximo-tipo-sesion'
                  }`}>
                    {envio.tipo === 'Open House' ? '🏠' : '📚'} {envio.tipo}
                  </span>
                  <span className="recordatorios-proximo-niveles">
                    {envio.niveles.join(' • ')}
                  </span>
                </div>
                <h3 className="recordatorios-proximo-fecha">{envio.fecha}</h3>
                <p className="recordatorios-proximo-hora">⏰ {envio.hora}</p>
                <p className="recordatorios-proximo-lugar">📍 {envio.institucion}</p>
                <p className="recordatorios-proximo-recordatorio">
                  📤 Enviar recordatorio: {envio.recordatorio}
                </p>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Modal de confirmación */}
        {showConfirm && (
          <div className="recordatorios-modal-overlay">
            <div className="recordatorios-modal">
              <div className="recordatorios-modal-icon">⚠️</div>
              <h3 className="recordatorios-modal-title">Confirmar Envío</h3>
              <p className="recordatorios-modal-text">
                ¿Estás seguro de enviar <span className="recordatorios-modal-count">{pendientes.length}</span> recordatorio{pendientes.length > 1 ? 's' : ''}?
              </p>
              <p className="recordatorios-modal-warning">
                Esta acción no se puede deshacer.
              </p>
              <div className="recordatorios-modal-buttons">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="recordatorios-modal-button recordatorios-modal-button-cancel"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEnvio}
                  className="recordatorios-modal-button recordatorios-modal-button-confirm"
                >
                  Sí, Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

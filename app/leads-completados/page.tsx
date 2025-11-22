'use client';

import { useState, useEffect } from 'react';
import './styles.css';

interface Lead {
  kommo_lead_id: number;
  nombre: string;
  telefono: string;
  email: string;
  plantel: string;
  sms_72h_sent_at: string;
  last_contact_time: string;
}

export default function LeadsCompletados() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Cargar leads completados
  const cargarLeads = async () => {
    setLoading(true);
    setMensaje(null);
    try {
      const response = await fetch('/api/leads-completados');
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads || []);
        if (data.leads && data.leads.length === 0) {
          setMensaje({ tipo: 'success', texto: 'No hay leads completados. Todos los leads están activos.' });
        }
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar leads: ' + (data.error || 'Error desconocido') });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al cargar leads' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLeads();
  }, []);

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular días desde último contacto
  const diasDesdeContacto = (fecha: string) => {
    if (!fecha) return 'N/A';
    const ahora = new Date();
    const contacto = new Date(fecha);
    const diff = Math.floor((ahora.getTime() - contacto.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Seleccionar/deseleccionar lead
  const toggleLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Seleccionar todos
  const seleccionarTodos = () => {
    if (selectedLeads.length === leads.length && leads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.kommo_lead_id));
    }
  };

  // Eliminar leads seleccionados
  const eliminarSeleccionados = async () => {
    if (selectedLeads.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Por favor, selecciona al menos un lead para eliminar' });
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar permanentemente ${selectedLeads.length} lead(s)?\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    setEliminando(true);
    setMensaje(null);
    try {
      const response = await fetch('/api/leads-completados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads })
      });

      const data = await response.json();
      
      if (data.success) {
        setMensaje({ tipo: 'success', texto: `✅ ${data.count} lead(s) eliminado(s) permanentemente` });
        setSelectedLeads([]);
        cargarLeads();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error: ' + (data.error || 'Error desconocido') });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al eliminar leads' });
    } finally {
      setEliminando(false);
    }
  };

  // Eliminar todos
  const eliminarTodos = async () => {
    if (leads.length === 0) {
      setMensaje({ tipo: 'error', texto: 'No hay leads para eliminar' });
      return;
    }

    if (!confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de eliminar permanentemente TODOS los ${leads.length} leads completados?\n\nEsta acción NO se puede deshacer y eliminará todos los registros de la base de datos.`)) {
      return;
    }

    setEliminando(true);
    setMensaje(null);
    try {
      const response = await fetch('/api/leads-completados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eliminarTodos: true })
      });

      const data = await response.json();
      
      if (data.success) {
        setMensaje({ tipo: 'success', texto: `✅ ${data.count} lead(s) eliminado(s) permanentemente` });
        setSelectedLeads([]);
        cargarLeads();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error: ' + (data.error || 'Error desconocido') });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al eliminar leads' });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="leads-completados-container">
      {/* Header */}
      <div className="leads-header">
        <div className="leads-header-content">
          <h1 className="leads-title">
            <span className="leads-icon">🗑️</span>
            Gestión de Leads Completados
          </h1>
          <p className="leads-subtitle">
            Leads que completaron su ciclo completo de SMS (24h → 48h → 5 días)
          </p>
          <div className="leads-warning">
            <span className="warning-icon">⚠️</span>
            Los leads se eliminan <strong>permanentemente</strong> de la base de datos
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`leads-mensaje leads-mensaje-${mensaje.tipo}`}>
          <span className="mensaje-icon">
            {mensaje.tipo === 'success' ? '✅' : '❌'}
          </span>
          <span className="mensaje-texto">{mensaje.texto}</span>
          <button 
            className="mensaje-cerrar"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {/* Panel de acciones */}
      <div className="leads-acciones">
        <div className="acciones-izquierda">
          <button
            className="btn btn-refresh"
            onClick={cargarLeads}
            disabled={loading || eliminando}
          >
            <span className="btn-icon">🔄</span>
            Actualizar
          </button>
          
          {leads.length > 0 && (
            <>
              <button
                className="btn btn-select"
                onClick={seleccionarTodos}
                disabled={eliminando}
              >
                <span className="btn-icon">
                  {selectedLeads.length === leads.length ? '☐' : '☑'}
                </span>
                {selectedLeads.length === leads.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
              
              <button
                className="btn btn-delete-selected"
                onClick={eliminarSeleccionados}
                disabled={eliminando || selectedLeads.length === 0}
              >
                <span className="btn-icon">🗑️</span>
                {eliminando ? 'Eliminando...' : `Eliminar seleccionados (${selectedLeads.length})`}
              </button>
              
              <button
                className="btn btn-delete-all"
                onClick={eliminarTodos}
                disabled={eliminando}
              >
                <span className="btn-icon">⚠️</span>
                {eliminando ? 'Eliminando...' : `Eliminar todos (${leads.length})`}
              </button>
            </>
          )}
        </div>
        
        <div className="acciones-derecha">
          <div className="leads-contador">
            <span className="contador-label">Total:</span>
            <span className="contador-numero">{leads.length}</span>
            <span className="contador-texto">leads completados</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="leads-contenido">
        {loading ? (
          <div className="leads-vacio">
            <div className="vacio-icon">⏳</div>
            <div className="vacio-titulo">Cargando leads...</div>
            <div className="vacio-texto">Por favor espera un momento</div>
          </div>
        ) : leads.length === 0 ? (
          <div className="leads-vacio">
            <div className="vacio-icon">✅</div>
            <div className="vacio-titulo">No hay leads completados</div>
            <div className="vacio-texto">
              Todos los leads están activos o aún no han completado su ciclo de seguimiento (5 días)
            </div>
          </div>
        ) : (
          <div className="leads-tabla-container">
            <table className="leads-tabla">
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      onChange={seleccionarTodos}
                      className="checkbox-input"
                    />
                  </th>
                  <th className="col-nombre">Nombre</th>
                  <th className="col-telefono">Teléfono</th>
                  <th className="col-email">Email</th>
                  <th className="col-plantel">Plantel</th>
                  <th className="col-contacto">Último Contacto</th>
                  <th className="col-sms">SMS 5 días Enviado</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const dias = diasDesdeContacto(lead.last_contact_time);
                  return (
                    <tr key={lead.kommo_lead_id} className={selectedLeads.includes(lead.kommo_lead_id) ? 'row-selected' : ''}>
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.kommo_lead_id)}
                          onChange={() => toggleLead(lead.kommo_lead_id)}
                          className="checkbox-input"
                        />
                      </td>
                      <td className="col-nombre">
                        <div className="cell-nombre">{lead.nombre || 'N/A'}</div>
                      </td>
                      <td className="col-telefono">
                        <div className="cell-telefono">{lead.telefono || 'N/A'}</div>
                      </td>
                      <td className="col-email">
                        <div className="cell-email">{lead.email || 'N/A'}</div>
                      </td>
                      <td className="col-plantel">
                        <div className={`cell-plantel plantel-${lead.plantel || 'unknown'}`}>
                          {lead.plantel ? lead.plantel.charAt(0).toUpperCase() + lead.plantel.slice(1) : 'N/A'}
                        </div>
                      </td>
                      <td className="col-contacto">
                        <div className="cell-fecha">{formatearFecha(lead.last_contact_time)}</div>
                        <div className="cell-dias">
                          {dias !== 'N/A' && (
                            <span className={`badge-dias ${dias > 7 ? 'badge-dias-alto' : dias > 3 ? 'badge-dias-medio' : 'badge-dias-bajo'}`}>
                              {dias} día{dias !== 1 ? 's' : ''} atrás
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="col-sms">
                        <div className="cell-fecha">{formatearFecha(lead.sms_72h_sent_at)}</div>
                        <div className="cell-badge">
                          <span className="badge-completado">✓ Completado</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

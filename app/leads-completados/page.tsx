'use client';

import { useState, useEffect } from 'react';

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
    try {
      const response = await fetch('/api/leads-completados');
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads || []);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar leads' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar leads' });
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
    return `${diff} días`;
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
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.kommo_lead_id));
    }
  };

  // Eliminar leads seleccionados
  const eliminarSeleccionados = async () => {
    if (selectedLeads.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Selecciona al menos un lead' });
      return;
    }

    setEliminando(true);
    try {
      const response = await fetch('/api/leads-completados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads })
      });

      const data = await response.json();
      
      if (data.success) {
        setMensaje({ tipo: 'success', texto: `${data.count} lead(s) eliminado(s) exitosamente` });
        setSelectedLeads([]);
        cargarLeads(); // Recargar lista
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al eliminar leads' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar leads' });
    } finally {
      setEliminando(false);
    }
  };

  // Eliminar todos
  const eliminarTodos = async () => {
    if (!confirm(`¿Estás seguro de eliminar TODOS los ${leads.length} leads completados?`)) {
      return;
    }

    setEliminando(true);
    try {
      const response = await fetch('/api/leads-completados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eliminarTodos: true })
      });

      const data = await response.json();
      
      if (data.success) {
        setMensaje({ tipo: 'success', texto: `${data.count} lead(s) eliminado(s) exitosamente` });
        setSelectedLeads([]);
        cargarLeads(); // Recargar lista
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al eliminar leads' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar leads' });
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗑️ Gestión de Leads Completados
          </h1>
          <p className="text-gray-600">
            Leads que ya completaron su ciclo de SMS (24h, 48h, 72h)
          </p>
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Los leads se eliminan permanentemente de la base de datos
          </p>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mensaje.texto}
            <button 
              onClick={() => setMensaje(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex gap-4 items-center">
          <button
            onClick={cargarLeads}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            🔄 Actualizar
          </button>
          
          {leads.length > 0 && (
            <>
              <button
                onClick={seleccionarTodos}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                {selectedLeads.length === leads.length ? '☐ Deseleccionar todos' : '☑ Seleccionar todos'}
              </button>
              
              <button
                onClick={eliminarSeleccionados}
                disabled={eliminando || selectedLeads.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {eliminando ? '⏳ Eliminando...' : `🗑️ Eliminar seleccionados (${selectedLeads.length})`}
              </button>
              
              <button
                onClick={eliminarTodos}
                disabled={eliminando}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50"
              >
                {eliminando ? '⏳ Eliminando...' : `🗑️ Eliminar todos (${leads.length})`}
              </button>
            </>
          )}
          
          <div className="ml-auto text-gray-600">
            Total: <span className="font-bold">{leads.length}</span> leads completados
          </div>
        </div>

        {/* Tabla de leads */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Cargando leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">✅ No hay leads completados</p>
            <p className="text-gray-500 mt-2">Todos los leads están activos o aún no han completado su ciclo</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={seleccionarTodos}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plantel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SMS 72h enviado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.kommo_lead_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.kommo_lead_id)}
                          onChange={() => toggleLead(lead.kommo_lead_id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.telefono || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{lead.plantel || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatearFecha(lead.last_contact_time)}</div>
                        <div className="text-xs text-gray-500">({diasDesdeContacto(lead.last_contact_time)} atrás)</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatearFecha(lead.sms_72h_sent_at)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


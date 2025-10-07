'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-client';

interface Inscripcion {
  id: string;
  nombre_aspirante: string;
  nivel_academico: string;
  grado_escolar: string;
  email: string;
  whatsapp: string;
  fecha_inscripcion: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    maternal: 0,
    kinder: 0,
    primaria: 0,
    secundaria: 0
  });

  // Verificar autenticación
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'winston2025') {
      setAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Cargar datos
  useEffect(() => {
    if (authenticated) {
      fetchInscripciones();
    }
  }, [authenticated]);

  const fetchInscripciones = async () => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInscripciones(data || []);
      
      // Calcular estadísticas
      const stats = {
        total: data?.length || 0,
        maternal: data?.filter(i => i.nivel_academico === 'maternal').length || 0,
        kinder: data?.filter(i => i.nivel_academico === 'kinder').length || 0,
        primaria: data?.filter(i => i.nivel_academico === 'primaria').length || 0,
        secundaria: data?.filter(i => i.nivel_academico === 'secundaria').length || 0
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Nombre', 'Nivel', 'Grado', 'Email', 'WhatsApp', 'Fecha Inscripción'],
      ...inscripciones.map(i => [
        i.nombre_aspirante,
        i.nivel_academico,
        i.grado_escolar,
        i.email,
        i.whatsapp,
        new Date(i.created_at).toLocaleDateString('es-MX')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscripciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!authenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1>Panel de Administración</h1>
            <p>Acceso seguro al sistema de inscripciones</p>
          </div>

          <div className="admin-login-form">
            <form onSubmit={handleLogin}>
              <div className="admin-form-group">
                <label>Contraseña de Acceso</label>
                <div className="admin-input-container">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <div className="admin-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="admin-login-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Acceder al Sistema
              </button>
            </form>
          </div>

          <div className="admin-login-footer">
            <p>Sistema de Gestión de Inscripciones Winston</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <div className="admin-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1>Dashboard de Inscripciones</h1>
              <p>Sistema de gestión Winston</p>
            </div>
          </div>
          
          <div className="admin-header-actions">
            <button onClick={fetchInscripciones} className="admin-refresh-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button onClick={exportToExcel} className="admin-export-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                <p className="admin-stat-label">Total Inscripciones</p>
                <p className="admin-stat-number admin-stat-blue">{stats.total}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                <p className="admin-stat-label">Maternal</p>
                <p className="admin-stat-number admin-stat-pink">{stats.maternal}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-pink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                <p className="admin-stat-label">Kinder</p>
                <p className="admin-stat-number admin-stat-purple">{stats.kinder}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                <p className="admin-stat-label">Primaria</p>
                <p className="admin-stat-number admin-stat-green">{stats.primaria}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                <p className="admin-stat-label">Secundaria</p>
                <p className="admin-stat-number admin-stat-orange">{stats.secundaria}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Inscripciones Recientes
            </h2>
          </div>
          
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Nivel</th>
                  <th>Grado</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="admin-loading">
                      <div className="admin-spinner"></div>
                      <span>Cargando inscripciones...</span>
                    </td>
                  </tr>
                ) : inscripciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="admin-empty-title">No hay inscripciones registradas</p>
                      <p className="admin-empty-subtitle">Las inscripciones aparecerán aquí una vez que los padres llenen el formulario.</p>
                    </td>
                  </tr>
                ) : (
                  inscripciones.map((inscripcion, index) => (
                    <tr key={inscripcion.id} className={index % 2 === 0 ? 'admin-row-even' : 'admin-row-odd'}>
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                            {inscripcion.nombre_aspirante.charAt(0).toUpperCase()}
                          </div>
                          <div className="admin-user-name">{inscripcion.nombre_aspirante}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-level-badge admin-level-${inscripcion.nivel_academico}`}>
                          {inscripcion.nivel_academico.charAt(0).toUpperCase() + inscripcion.nivel_academico.slice(1)}
                        </span>
                      </td>
                      <td className="admin-grade">{inscripcion.grado_escolar}</td>
                      <td className="admin-email">{inscripcion.email}</td>
                      <td className="admin-whatsapp">{inscripcion.whatsapp}</td>
                      <td className="admin-date">
                        {new Date(inscripcion.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

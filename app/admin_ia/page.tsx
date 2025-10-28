'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-client';

interface TallerParticipante {
  id: string;
  nombre: string;
  apellido: string;
  puesto: string;
  grado_clase: string;
  institucion_procedencia: string;
  email: string;
  whatsapp: string;
  experiencia_ia: boolean;
  fecha_registro: string;
  created_at: string;
}

export default function AdminIADashboard() {
  const [participantes, setParticipantes] = useState<TallerParticipante[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalParticipantes: 0,
    conExperienciaIA: 0,
    sinExperienciaIA: 0,
    porInstitucion: {} as Record<string, number>
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
      fetchParticipantes();
    }
  }, [authenticated]);

  const fetchParticipantes = async () => {
    try {
      const { data, error } = await supabase
        .from('taller_ia')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setParticipantes(data || []);
      
      // Calcular estadísticas
      const totalParticipantes = data?.length || 0;
      const conExperienciaIA = data?.filter(p => p.experiencia_ia).length || 0;
      const sinExperienciaIA = totalParticipantes - conExperienciaIA;
      
      // Contar por institución
      const porInstitucion: Record<string, number> = {};
      data?.forEach(p => {
        const institucion = p.institucion_procedencia;
        porInstitucion[institucion] = (porInstitucion[institucion] || 0) + 1;
      });

      setStats({
        totalParticipantes,
        conExperienciaIA,
        sinExperienciaIA,
        porInstitucion
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      if (!XLSX.utils) {
        throw new Error('XLSX library not loaded properly');
      }
    
      // Crear workbook
      const workbook = XLSX.utils.book_new();
    
      // === HOJA 1: RESUMEN EJECUTIVO ===
      const resumenData = [
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'REPORTE DEL TALLER DE IA Y EDUCACIÓN TEMPRANA', '', '', '', ''],
        ['', 'Fecha de generación:', new Date().toLocaleDateString('es-MX'), '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'RESUMEN EJECUTIVO', '', '', '', ''],
        ['', 'Total de Participantes:', stats.totalParticipantes, '', '', ''],
        ['', 'Con Experiencia en IA:', stats.conExperienciaIA, '', '', ''],
        ['', 'Sin Experiencia en IA:', stats.sinExperienciaIA, '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'DESGLOSE POR INSTITUCIÓN', '', '', '', ''],
      ];

      // Agregar instituciones
      Object.entries(stats.porInstitucion).forEach(([institucion, cantidad]) => {
        resumenData.push(['', institucion + ':', cantidad, '', '', '']);
      });
      
      const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
      resumenSheet['!cols'] = [
        { width: 5 },
        { width: 30 },
        { width: 20 },
        { width: 10 },
        { width: 10 },
        { width: 10 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen Ejecutivo');
      
      // === HOJA 2: DATOS DETALLADOS ===
      const datosDetallados = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', 'TALLER DE IA - DATOS DETALLADOS', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', 'NOMBRE', 'APELLIDO', 'PUESTO', 'GRADO', 'INSTITUCIÓN', 'EMAIL', 'EXPERIENCIA IA']
      ];
      
      participantes.forEach(item => {
        datosDetallados.push([
          '',
          item.nombre,
          item.apellido,
          item.puesto,
          item.grado_clase.replace(/([a-zA-Z]+)(\d+)/, '$1-$2').replace(/(\d+)([a-zA-Z]+)/, '$1-$2').replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2'),
          item.institucion_procedencia,
          item.email,
          item.experiencia_ia ? 'Sí' : 'No'
        ]);
      });
      
      const detalladosSheet = XLSX.utils.aoa_to_sheet(datosDetallados);
      detalladosSheet['!cols'] = [
        { width: 5 },
        { width: 25 },
        { width: 25 },
        { width: 20 },
        { width: 15 },
        { width: 30 },
        { width: 35 },
        { width: 15 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, detalladosSheet, 'Participantes');
      
      // Generar y descargar archivo
      const fileName = `Reporte_Taller_IA_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intenta de nuevo.');
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logos-container">
              <img 
                src="/logos/logo_winston.png" 
                alt="Logo Winston Churchill" 
                className="admin-logo-winston"
              />
              <img 
                src="/logos/educativo%20hd.png" 
                alt="Logo Educativo" 
                className="admin-logo-educativo"
              />
            </div>
            <h1>Panel de Administración - Taller IA</h1>
            <p>Acceso seguro al sistema</p>
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
            <p>Sistema de Gestión Winston - Taller IA</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
              <h1>Dashboard - Taller de IA y Educación Temprana</h1>
              <p>Sistema de gestión de participantes</p>
              </div>
            </div>
          
          <div className="admin-header-actions">
            <button onClick={() => { fetchParticipantes(); }} className="admin-refresh-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button onClick={exportToExcel} className="admin-export-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar Reporte Excel
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Estadísticas */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                    <p className="admin-stat-label">Total Participantes</p>
                    <p className="admin-stat-number admin-stat-blue">{stats.totalParticipantes}</p>
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
                <p className="admin-stat-label">Con Experiencia IA</p>
                <p className="admin-stat-number admin-stat-green">{stats.conExperienciaIA}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-content">
              <div>
                <p className="admin-stat-label">Sin Experiencia IA</p>
                <p className="admin-stat-number admin-stat-orange">{stats.sinExperienciaIA}</p>
              </div>
              <div className="admin-stat-icon admin-stat-icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de participantes */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Participantes del Taller IA
            </h2>
          </div>
          
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Puesto</th>
                  <th>Grado</th>
                  <th>Institución</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Experiencia IA</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                        <td colSpan={8} className="admin-loading">
                      <div className="admin-spinner"></div>
                      <span>Cargando participantes...</span>
                    </td>
                  </tr>
                ) : participantes.length === 0 ? (
                  <tr>
                        <td colSpan={8} className="admin-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="admin-empty-title">No hay participantes registrados</p>
                      <p className="admin-empty-subtitle">Los participantes del taller aparecerán aquí una vez que se registren.</p>
                    </td>
                  </tr>
                ) : (
                      participantes.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'admin-row-even' : 'admin-row-odd'}>
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                                {(item.nombre + ' ' + item.apellido).charAt(0).toUpperCase()}
                          </div>
                              <div className="admin-user-name">{item.nombre} {item.apellido}</div>
                        </div>
                      </td>
                      <td className="admin-puesto">{item.puesto}</td>
                      <td className="admin-grade">
                            {item.grado_clase
                              .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
                              .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
                              .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2')
                        }
                      </td>
                          <td className="admin-institucion">{item.institucion_procedencia}</td>
                          <td className="admin-email">{item.email}</td>
                          <td className="admin-whatsapp">{item.whatsapp}</td>
                          <td>
                            <span className={`admin-confirmation-badge ${
                              item.experiencia_ia ? 'admin-confirmation-confirmed' : 'admin-confirmation-pending'
                            }`}>
                              {item.experiencia_ia ? '✅ Sí' : '❌ No'}
                            </span>
                      </td>
                      <td className="admin-date">
                            {new Date(item.created_at).toLocaleDateString('es-MX', {
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

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
  confirmacion_asistencia: string;
  fecha_confirmacion?: string;
}

interface Sesion {
  id: string;
  nombre_aspirante: string;
  nivel_academico: string;
  grado_escolar: string;
  email: string;
  whatsapp: string;
  fecha_inscripcion: string;
  created_at: string;
  reminder_sent: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'openhouse' | 'sesiones'>('openhouse');
  const [openHouse, setOpenHouse] = useState<Inscripcion[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalOpenHouse: 0,
    totalSesiones: 0,
    maternal: 0,
    kinder: 0,
    primaria: 0,
    secundaria: 0,
    sesionesMaternal: 0,
    sesionesKinder: 0,
    sesionesPrimaria: 0,
    sesionesSecundaria: 0,
    confirmados: 0,
    no_confirmados: 0,
    pendientes: 0
  });
  const [restoring, setRestoring] = useState(false);
  const [restoreFiles, setRestoreFiles] = useState<any[]>([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

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
      fetchOpenHouse();
      fetchSesiones();
      fetchRestoreFiles();
    }
  }, [authenticated]);

  // Obtener archivos de backup disponibles
  const fetchRestoreFiles = async () => {
    try {
      const response = await fetch('/api/restore-database');
      const data = await response.json();
      if (data.success) {
        setRestoreFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error al obtener archivos de backup:', error);
    }
  };

  // Restaurar base de datos
  const restoreDatabase = async (backupFile?: string) => {
    if (!confirm('⚠️ ADVERTENCIA: Esta acción sobrescribirá los datos actuales. ¿Estás seguro?')) {
      return;
    }

    setRestoring(true);
    try {
      const response = await fetch('/api/restore-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupFile: backupFile || 'latest'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Restauración exitosa!\n\n📊 Registros restaurados: ${result.successCount}\n⏱️ Duración: ${result.duration}\n📅 Backup: ${result.backupMetadata?.timestamp || 'N/A'}`);
        // Recargar datos después de la restauración
        await fetchOpenHouse();
        await fetchSesiones();
      } else {
        alert(`❌ Error en la restauración: ${result.message}`);
      }
    } catch (error) {
      console.error('Error al restaurar:', error);
      alert('❌ Error al restaurar la base de datos');
    } finally {
      setRestoring(false);
      setShowRestoreModal(false);
    }
  };

  const fetchOpenHouse = async () => {
    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOpenHouse(data || []);
      
      // Actualizar solo las estadísticas de Open House, preservando las de Sesiones
      setStats(prev => ({
        ...prev,
        totalOpenHouse: data?.length || 0,
        maternal: data?.filter(i => i.nivel_academico === 'maternal').length || 0,
        kinder: data?.filter(i => i.nivel_academico === 'kinder').length || 0,
        primaria: data?.filter(i => i.nivel_academico === 'primaria').length || 0,
        secundaria: data?.filter(i => i.nivel_academico === 'secundaria').length || 0,
        confirmados: data?.filter(i => i.confirmacion_asistencia === 'confirmado').length || 0,
        no_confirmados: data?.filter(i => i.confirmacion_asistencia === 'no_confirmado').length || 0,
        pendientes: data?.filter(i => i.confirmacion_asistencia === 'pendiente' || !i.confirmacion_asistencia).length || 0
      }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSesiones = async () => {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSesiones(data || []);
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalSesiones: data?.length || 0,
        sesionesMaternal: data?.filter(s => s.nivel_academico === 'maternal').length || 0,
        sesionesKinder: data?.filter(s => s.nivel_academico === 'kinder').length || 0,
        sesionesPrimaria: data?.filter(s => s.nivel_academico === 'primaria').length || 0,
        sesionesSecundaria: data?.filter(s => s.nivel_academico === 'secundaria').length || 0
      }));
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
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
        ['', 'REPORTE DE OPEN HOUSE WINSTON', '', '', '', ''],
        ['', 'Fecha de generación:', new Date().toLocaleDateString('es-MX'), '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'RESUMEN EJECUTIVO', '', '', '', ''],
        ['', 'Total de Open House:', stats.totalOpenHouse, '', '', ''],
        ['', 'Total de Sesiones Informativas:', stats.totalSesiones, '', '', ''],
        ['', 'Total General:', stats.totalOpenHouse + stats.totalSesiones, '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'DESGLOSE POR NIVELES (OPEN HOUSE)', '', '', '', ''],
        ['', 'Maternal:', stats.maternal, '', '', ''],
        ['', 'Kinder:', stats.kinder, '', '', ''],
        ['', 'Primaria:', stats.primaria, '', '', ''],
        ['', 'Secundaria:', stats.secundaria, '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'CONFIRMACIONES DE ASISTENCIA (OPEN HOUSE)', '', '', '', ''],
        ['', 'Confirmados:', stats.confirmados, '', '', ''],
        ['', 'No confirmados:', stats.no_confirmados, '', '', ''],
        ['', 'Pendientes:', stats.pendientes, '', '', '']
      ];
      
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
      
      // === HOJA 2: DATOS DETALLADOS OPEN HOUSE ===
      const datosOpenHouse = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', 'OPEN HOUSE - DATOS DETALLADOS', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', 'NOMBRE DEL ASPIRANTE', 'NIVEL ACADÉMICO', 'GRADO ESCOLAR', 'EMAIL', 'WHATSAPP', 'FECHA DE INSCRIPCIÓN', 'CONFIRMACIÓN']
      ];
      
      openHouse.forEach(item => {
        datosOpenHouse.push([
          '',
          item.nombre_aspirante,
          item.nivel_academico,
          item.grado_escolar,
          item.email,
          item.whatsapp,
          new Date(item.created_at).toLocaleDateString('es-MX'),
          item.confirmacion_asistencia === 'confirmado' ? '✅ CONFIRMADO' :
          item.confirmacion_asistencia === 'no_confirmado' ? '❌ NO CONFIRMADO' :
          '⏳ PENDIENTE'
        ]);
      });
      
      const openHouseSheet = XLSX.utils.aoa_to_sheet(datosOpenHouse);
      openHouseSheet['!cols'] = [
        { width: 5 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 35 },
        { width: 20 },
        { width: 25 },
        { width: 15 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, openHouseSheet, 'Open House');
      
      // === HOJA 3: DATOS DETALLADOS SESIONES INFORMATIVAS ===
      const datosSesiones = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', 'SESIONES INFORMATIVAS - DATOS DETALLADOS', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', 'NOMBRE DEL ASPIRANTE', 'NIVEL ACADÉMICO', 'GRADO ESCOLAR', 'EMAIL', 'WHATSAPP', 'FECHA DE INSCRIPCIÓN']
      ];
      
      sesiones.forEach(item => {
        datosSesiones.push([
          '',
          item.nombre_aspirante,
          item.nivel_academico,
          item.grado_escolar,
          item.email,
          item.whatsapp,
          new Date(item.created_at).toLocaleDateString('es-MX')
        ]);
      });
      
      const sesionesSheet = XLSX.utils.aoa_to_sheet(datosSesiones);
      sesionesSheet['!cols'] = [
        { width: 5 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 35 },
        { width: 20 },
        { width: 25 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, sesionesSheet, 'Sesiones Informativas');
      
      // Generar y descargar archivo
      const fileName = `Reporte_Winston_${new Date().toISOString().split('T')[0]}.xlsx`;
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
            <h1>Panel de Administración</h1>
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
            <p>Sistema de Gestión Winston</p>
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
              <h1>Dashboard de Gestión Winston</h1>
              <p>Sistema de gestión de inscripciones</p>
            </div>
          </div>
        
          <div className="admin-header-actions">
            <button onClick={() => { fetchOpenHouse(); fetchSesiones(); }} className="admin-refresh-button">
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
            <button 
              onClick={() => setShowRestoreModal(true)} 
              className="admin-restore-button"
              disabled={restoring}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {restoring ? 'Restaurando...' : 'Restaurar Base de Datos'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Pestañas */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'openhouse' ? 'active' : ''}`}
            onClick={() => setActiveTab('openhouse')}
          >
            🎓 Open House ({stats.totalOpenHouse})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'sesiones' ? 'active' : ''}`}
            onClick={() => setActiveTab('sesiones')}
          >
            📋 Sesiones Informativas ({stats.totalSesiones})
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'openhouse' ? (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <div>
                    <p className="admin-stat-label">Total Open House</p>
                    <p className="admin-stat-number admin-stat-blue">{stats.totalOpenHouse}</p>
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
                  Open House Recientes
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
                      <th>Confirmación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="admin-loading">
                          <div className="admin-spinner"></div>
                          <span>Cargando Open House...</span>
                        </td>
                      </tr>
                    ) : openHouse.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="admin-empty-title">No hay Open House registrados</p>
                          <p className="admin-empty-subtitle">Los registros de Open House aparecerán aquí una vez que los padres llenen el formulario.</p>
                        </td>
                      </tr>
                    ) : (
                      openHouse.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'admin-row-even' : 'admin-row-odd'}>
                          <td>
                            <div className="admin-user-info">
                              <div className="admin-user-avatar">
                                {item.nombre_aspirante.charAt(0).toUpperCase()}
                              </div>
                              <div className="admin-user-name">{item.nombre_aspirante}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`admin-level-badge admin-level-${item.nivel_academico}`}>
                              {item.nivel_academico.charAt(0).toUpperCase() + item.nivel_academico.slice(1)}
                            </span>
                          </td>
                          <td className="admin-grade">
                            {item.grado_escolar
                              .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
                              .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
                              .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2')
                            }
                          </td>
                          <td className="admin-email">{item.email}</td>
                          <td className="admin-whatsapp">{item.whatsapp}</td>
                          <td className="admin-date">
                            {new Date(item.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <span className={`admin-confirmation-badge ${
                              item.confirmacion_asistencia === 'confirmado' ? 'admin-confirmation-confirmed' :
                              item.confirmacion_asistencia === 'no_confirmado' ? 'admin-confirmation-denied' :
                              'admin-confirmation-pending'
                            }`}>
                              {item.confirmacion_asistencia === 'confirmado' ? '✅ Confirmado' :
                               item.confirmacion_asistencia === 'no_confirmado' ? '❌ No confirmado' :
                               '⏳ Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <div>
                    <p className="admin-stat-label">Total Sesiones Informativas</p>
                    <p className="admin-stat-number" style={{ color: '#FA9D00' }}>{stats.totalSesiones}</p>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#FA9D00' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <div>
                    <p className="admin-stat-label">Maternal</p>
                    <p className="admin-stat-number admin-stat-pink">{stats.sesionesMaternal}</p>
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
                    <p className="admin-stat-number admin-stat-purple">{stats.sesionesKinder}</p>
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
                    <p className="admin-stat-number admin-stat-green">{stats.sesionesPrimaria}</p>
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
                    <p className="admin-stat-number admin-stat-orange">{stats.sesionesSecundaria}</p>
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
                  Sesiones Informativas Recientes
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
                      <th>Recordatorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="admin-loading">
                          <div className="admin-spinner"></div>
                          <span>Cargando Sesiones Informativas...</span>
                        </td>
                      </tr>
                    ) : sesiones.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="admin-empty-title">No hay Sesiones Informativas registradas</p>
                          <p className="admin-empty-subtitle">Los registros de Sesiones Informativas aparecerán aquí una vez que los padres llenen el formulario.</p>
                        </td>
                      </tr>
                    ) : (
                      sesiones.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'admin-row-even' : 'admin-row-odd'}>
                          <td>
                            <div className="admin-user-info">
                              <div className="admin-user-avatar">
                                {item.nombre_aspirante.charAt(0).toUpperCase()}
                              </div>
                              <div className="admin-user-name">{item.nombre_aspirante}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`admin-level-badge admin-level-${item.nivel_academico}`}>
                              {item.nivel_academico.charAt(0).toUpperCase() + item.nivel_academico.slice(1)}
                            </span>
                          </td>
                          <td className="admin-grade">
                            {item.grado_escolar
                              .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
                              .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
                              .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2')
                            }
                          </td>
                          <td className="admin-email">{item.email}</td>
                          <td className="admin-whatsapp">{item.whatsapp}</td>
                          <td className="admin-date">
                            {new Date(item.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <span className={`admin-confirmation-badge ${
                              item.reminder_sent ? 'admin-confirmation-confirmed' : 'admin-confirmation-pending'
                            }`}>
                              {item.reminder_sent ? '✅ Enviado' : '⏳ Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Restauración */}
      {showRestoreModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRestoreModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>🔄 Restaurar Base de Datos</h3>
              <button 
                className="admin-modal-close"
                onClick={() => setShowRestoreModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="admin-modal-content">
              <p className="admin-modal-warning">
                ⚠️ <strong>ADVERTENCIA:</strong> Esta acción sobrescribirá los datos actuales con los datos del backup seleccionado.
              </p>
              
              <div className="admin-restore-options">
                <h4>📁 Archivos de Backup Disponibles:</h4>
                
                <div className="admin-backup-list">
                  {restoreFiles.length > 0 ? (
                    restoreFiles.map((file, index) => (
                      <div key={index} className="admin-backup-item">
                        <div className="admin-backup-info">
                          <strong>{file.name}</strong>
                          <span className="admin-backup-date">{file.lastModified}</span>
                          <span className="admin-backup-size">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button 
                          className="admin-backup-restore-btn"
                          onClick={() => restoreDatabase(file.downloadUrl)}
                          disabled={restoring}
                        >
                          {restoring ? 'Restaurando...' : 'Restaurar'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="admin-no-backups">No se encontraron archivos de backup</p>
                  )}
                </div>

                <div className="admin-restore-actions">
                  <button 
                    className="admin-restore-latest-btn"
                    onClick={() => restoreDatabase()}
                    disabled={restoring || restoreFiles.length === 0}
                  >
                    {restoring ? 'Restaurando...' : '🔄 Restaurar Más Reciente'}
                  </button>
                  <button 
                    className="admin-modal-cancel"
                    onClick={() => setShowRestoreModal(false)}
                    disabled={restoring}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


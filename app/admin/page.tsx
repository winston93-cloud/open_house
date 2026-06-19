'use client';

import { useState, useEffect } from 'react';
import {
  getDefaultOpenHouseEdicion,
  OPEN_HOUSE_EDICIONES_META,
  getOpenHouseEdicionLabel,
} from '../../lib/open-house-event';
import {
  getDefaultSesionesEdicion,
  SESIONES_EDICIONES_META,
  getSesionesEdicionLabel,
} from '../../lib/sesiones-informativas-event';
import { getPlanCampamento } from '../../lib/campamento-verano';
import type { CampamentoRegistro } from '../../lib/campamento-admin';
import CampamentoAdminModal from '../components/admin/CampamentoAdminModal';

interface Inscripcion {
  id: string;
  nombre_aspirante: string;
  nivel_academico: string;
  grado_escolar: string;
  email: string;
  telefono: string;
  fecha_inscripcion: string;
  created_at: string;
  confirmacion_asistencia: string;
  fecha_confirmacion?: string;
  ciclo_escolar: string;
  edicion_open_house?: string | null;
}

interface Sesion {
  id: string;
  nombre_aspirante: string;
  nivel_academico: string;
  grado_escolar: string;
  email: string;
  telefono: string;
  fecha_inscripcion: string;
  created_at: string;
  reminder_sent: boolean;
  confirmacion_asistencia: string;
  fecha_confirmacion?: string;
  ciclo_escolar: string;
  edicion_sesiones?: string | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'openhouse' | 'sesiones' | 'campamento'>('openhouse');
  const [openHouse, setOpenHouse] = useState<Inscripcion[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [campamento, setCampamento] = useState<CampamentoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCampamento, setLoadingCampamento] = useState(false);
  const [campamentoModalOpen, setCampamentoModalOpen] = useState(false);
  const [campamentoModalRegistro, setCampamentoModalRegistro] = useState<CampamentoRegistro | null>(null);
  const [campamentoModalIsNew, setCampamentoModalIsNew] = useState(false);
  const [campamentoSeleccionados, setCampamentoSeleccionados] = useState<Set<string>>(new Set());
  const [enviandoCorreosCampamento, setEnviandoCorreosCampamento] = useState(false);
  const [asignandoFoliosCampamento, setAsignandoFoliosCampamento] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [cicloEscolar, setCicloEscolar] = useState<string>('2026'); // Año activo por defecto
  const [edicionOpenHouse, setEdicionOpenHouse] = useState<string>(() => getDefaultOpenHouseEdicion());
  const [edicionSesiones, setEdicionSesiones] = useState<string>(() => getDefaultSesionesEdicion());
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
    totalCampamento: 0,
    campamento4Semanas: 0,
    campamento3Semanas: 0,
    campamentoSemanal: 0,
    confirmados: 0,
    no_confirmados: 0,
    pendientes: 0
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
      fetchOpenHouse();
      fetchSesiones();
      fetchCampamento();
    }
  }, [authenticated, cicloEscolar, edicionOpenHouse, edicionSesiones]);

  const onCicloEscolarChange = (value: string) => {
    setCicloEscolar(value);
    if (value === '2025') {
      setEdicionOpenHouse('2025-diciembre');
    } else {
      setEdicionOpenHouse(getDefaultOpenHouseEdicion());
      setEdicionSesiones(getDefaultSesionesEdicion());
    }
  };

  const onEdicionOpenHouseChange = (value: string) => {
    setEdicionOpenHouse(value);
    if (value === '2025-diciembre') {
      setCicloEscolar('2025');
    } else if (value === '2026-enero' || value === '2026-junio') {
      setCicloEscolar('2026');
    }
  };

  const onEdicionSesionesChange = (value: string) => {
    setEdicionSesiones(value);
    if (value === '2026-enero' || value === '2026-junio') {
      setCicloEscolar('2026');
    }
  };

  const descripcionFiltroSesiones = (): string => {
    if (edicionSesiones === 'todos') {
      return `Ciclo ${cicloEscolar} · todas las ediciones`;
    }
    if (edicionSesiones === 'sin-etiqueta') {
      return `Ciclo ${cicloEscolar} · sin etiqueta de convocatoria`;
    }
    return `${getSesionesEdicionLabel(edicionSesiones)} (${edicionSesiones})`;
  };

  const descripcionFiltroOpenHouse = (): string => {
    if (edicionOpenHouse === 'todos') {
      return `Ciclo ${cicloEscolar} · todas las ediciones`;
    }
    if (edicionOpenHouse === 'sin-etiqueta') {
      return `Ciclo ${cicloEscolar} · sin etiqueta`;
    }
    return `${getOpenHouseEdicionLabel(edicionOpenHouse)} (${edicionOpenHouse})`;
  };

  const fetchOpenHouse = async () => {
    try {
      const params = new URLSearchParams({
        ciclo_escolar: cicloEscolar,
        edicion_open_house: edicionOpenHouse,
      });
      const res = await fetch(`/api/admin/inscripciones?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Error al cargar inscripciones');
      const data: Inscripcion[] = json.inscripciones || [];

      setOpenHouse(data);
      
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
      const params = new URLSearchParams({
        ciclo_escolar: cicloEscolar,
        edicion_sesiones: edicionSesiones,
      });
      const res = await fetch(`/api/admin/sesiones?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Error al cargar sesiones');
      const data: Sesion[] = json.sesiones || [];

      setSesiones(data);
      
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

  const fetchCampamento = async () => {
    setLoadingCampamento(true);
    try {
      const res = await fetch('/api/admin/campamento-verano?edicion=todos');
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const registros: CampamentoRegistro[] = data.registros || [];
      setCampamento(registros);
      setStats((prev) => ({
        ...prev,
        totalCampamento: registros.length,
        campamento4Semanas: registros.filter((r) => r.plan_campamento === '4_semanas').length,
        campamento3Semanas: registros.filter((r) => r.plan_campamento === '3_semanas').length,
        campamentoSemanal: registros.filter((r) => r.plan_campamento === 'semanal').length,
      }));
    } catch (error) {
      console.error('Error al cargar campamento:', error);
    } finally {
      setLoadingCampamento(false);
    }
  };

  const openCampamentoModal = (registro: CampamentoRegistro) => {
    setCampamentoModalRegistro(registro);
    setCampamentoModalIsNew(false);
    setCampamentoModalOpen(true);
  };

  const openCampamentoNew = () => {
    setCampamentoModalRegistro(null);
    setCampamentoModalIsNew(true);
    setCampamentoModalOpen(true);
  };

  const closeCampamentoModal = () => {
    setCampamentoModalOpen(false);
    setCampamentoModalRegistro(null);
    setCampamentoModalIsNew(false);
  };

  const handleCampamentoSaved = (registro: CampamentoRegistro) => {
    setCampamento((prev) => {
      const idx = prev.findIndex((r) => r.id === registro.id);
      const next = idx >= 0 ? [...prev] : [registro, ...prev];
      if (idx >= 0) next[idx] = registro;
      setStats((s) => ({
        ...s,
        totalCampamento: next.length,
        campamento4Semanas: next.filter((r) => r.plan_campamento === '4_semanas').length,
        campamento3Semanas: next.filter((r) => r.plan_campamento === '3_semanas').length,
        campamentoSemanal: next.filter((r) => r.plan_campamento === 'semanal').length,
      }));
      return next;
    });
  };

  const handleCampamentoDeleted = (id: string) => {
    setCampamento((prev) => {
      const next = prev.filter((r) => r.id !== id);
      setStats((s) => ({
        ...s,
        totalCampamento: next.length,
        campamento4Semanas: next.filter((r) => r.plan_campamento === '4_semanas').length,
        campamento3Semanas: next.filter((r) => r.plan_campamento === '3_semanas').length,
        campamentoSemanal: next.filter((r) => r.plan_campamento === 'semanal').length,
      }));
      return next;
    });
  };

  const formatPlanCampamento = (planId: string): string => {
    const plan = getPlanCampamento(planId);
    return plan ? plan.label : planId;
  };

  const toggleCampamentoSeleccion = (id: string) => {
    setCampamentoSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCampamentoSeleccionTodos = () => {
    if (campamentoSeleccionados.size === campamento.length) {
      setCampamentoSeleccionados(new Set());
    } else {
      setCampamentoSeleccionados(new Set(campamento.map((r) => r.id)));
    }
  };

  const mergeCampamentoRegistros = (actualizados: CampamentoRegistro[]) => {
    if (!actualizados.length) return;
    setCampamento((prev) => {
      const map = new Map(prev.map((r) => [r.id, r]));
      for (const r of actualizados) map.set(r.id, r);
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const handleAsignarFoliosFaltantes = async () => {
    if (!confirm('¿Generar folio para todas las inscripciones que aún no lo tienen?')) return;
    setAsignandoFoliosCampamento(true);
    try {
      const res = await fetch('/api/admin/campamento-verano/asignar-folios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.registros?.length) mergeCampamentoRegistros(data.registros);
      alert(data.message || (data.success ? 'Folios asignados.' : 'Hubo errores al asignar folios.'));
    } catch {
      alert('Error de conexión al asignar folios.');
    } finally {
      setAsignandoFoliosCampamento(false);
    }
  };

  const handleEnviarCorreosCampamento = async () => {
    const ids = Array.from(campamentoSeleccionados);
    if (ids.length === 0) {
      alert('Selecciona al menos una inscripción.');
      return;
    }
    if (
      !confirm(
        `¿Enviar correo de confirmación con folio a ${ids.length} inscripción(es)? Se generará folio si falta.`
      )
    ) {
      return;
    }
    setEnviandoCorreosCampamento(true);
    try {
      const res = await fetch('/api/admin/campamento-verano/enviar-correos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      await fetchCampamento();
      alert(data.message || 'Proceso completado.');
      setCampamentoSeleccionados(new Set());
    } catch {
      alert('Error de conexión al enviar correos.');
    } finally {
      setEnviandoCorreosCampamento(false);
    }
  };

  // Función auxiliar para formatear el nombre del nivel
  const formatNivelAcademico = (nivel: string): string => {
    const niveles: { [key: string]: string } = {
      'maternal': 'Maternal',
      'kinder': 'Kinder',
      'primaria': 'Primaria',
      'secundaria': 'Secundaria'
    };
    return niveles[nivel] || nivel.charAt(0).toUpperCase() + nivel.slice(1);
  };

  // Función auxiliar para ordenar por nivel y nombre
  const ordenarPorNivelYNombre = <T extends { nivel_academico: string; nombre_aspirante: string }>(items: T[]): T[] => {
    const ordenNiveles: { [key: string]: number } = {
      'maternal': 1,
      'kinder': 2,
      'primaria': 3,
      'secundaria': 4
    };

    return [...items].sort((a, b) => {
      // Primero ordenar por nivel
      const nivelA = ordenNiveles[a.nivel_academico] || 999;
      const nivelB = ordenNiveles[b.nivel_academico] || 999;
      
      if (nivelA !== nivelB) {
        return nivelA - nivelB;
      }
      
      // Si el nivel es el mismo, ordenar por nombre ascendente
      return a.nombre_aspirante.localeCompare(b.nombre_aspirante, 'es', { sensitivity: 'base' });
    });
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
        ['', 'Filtro Open House (listado):', descripcionFiltroOpenHouse(), '', '', ''],
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
        ['', 'Pendientes:', stats.pendientes, '', '', ''],
        ['', '', '', '', '', ''],
        ['', 'DESGLOSE POR NIVELES (SESIONES INFORMATIVAS)', '', '', '', ''],
        ['', 'Maternal:', stats.sesionesMaternal, '', '', ''],
        ['', 'Kinder:', stats.sesionesKinder, '', '', ''],
        ['', 'Primaria:', stats.sesionesPrimaria, '', '', ''],
        ['', 'Secundaria:', stats.sesionesSecundaria, '', '', '']
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
      // Ordenar y agrupar por nivel
      const openHouseOrdenados = ordenarPorNivelYNombre(openHouse);
      
      const datosOpenHouse = [
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', 'OPEN HOUSE - DATOS DETALLADOS', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', 'NOMBRE DEL ASPIRANTE', 'NIVEL ACADÉMICO', 'GRADO ESCOLAR', 'EMAIL', 'TELÉFONO', 'FECHA DE INSCRIPCIÓN', 'EDICIÓN OH', 'CONFIRMACIÓN', 'AÑO']
      ];
      
      let nivelAnterior = '';
      openHouseOrdenados.forEach(item => {
        // Agregar separador de nivel si cambió el nivel
        if (nivelAnterior !== item.nivel_academico && nivelAnterior !== '') {
          datosOpenHouse.push(['', '', '', '', '', '', '', '', '', '']); // Línea en blanco para separar
        }
        
        datosOpenHouse.push([
          '',
          item.nombre_aspirante,
          formatNivelAcademico(item.nivel_academico),
          item.grado_escolar,
          item.email,
          item.telefono || '',
          new Date(item.created_at).toLocaleDateString('es-MX'),
          getOpenHouseEdicionLabel(item.edicion_open_house),
          item.confirmacion_asistencia === 'confirmado' ? '✅ CONFIRMADO' :
          item.confirmacion_asistencia === 'no_confirmado' ? '❌ NO CONFIRMADO' :
          '⏳ PENDIENTE',
          item.ciclo_escolar || '2025'
        ]);
        
        nivelAnterior = item.nivel_academico;
      });
      
      const openHouseSheet = XLSX.utils.aoa_to_sheet(datosOpenHouse);
      openHouseSheet['!cols'] = [
        { width: 5 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 35 },
        { width: 20 },
        { width: 22 },
        { width: 14 },
        { width: 18 },
        { width: 10 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, openHouseSheet, 'Open House');
      
      // === HOJA 3: DATOS DETALLADOS SESIONES INFORMATIVAS ===
      // Ordenar y agrupar por nivel
      const sesionesOrdenadas = ordenarPorNivelYNombre(sesiones);
      
      const datosSesiones = [
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', 'SESIONES INFORMATIVAS - DATOS DETALLADOS', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['', 'NOMBRE DEL ASPIRANTE', 'NIVEL ACADÉMICO', 'GRADO ESCOLAR', 'EMAIL', 'TELÉFONO', 'FECHA DE INSCRIPCIÓN', 'CONVOCATORIA', 'AÑO']
      ];
      
      nivelAnterior = '';
      sesionesOrdenadas.forEach(item => {
        // Agregar separador de nivel si cambió el nivel
        if (nivelAnterior !== item.nivel_academico && nivelAnterior !== '') {
          datosSesiones.push(['', '', '', '', '', '', '', '']); // Línea en blanco para separar
        }
        
        datosSesiones.push([
          '',
          item.nombre_aspirante,
          formatNivelAcademico(item.nivel_academico),
          item.grado_escolar,
          item.email,
          item.telefono || '',
          new Date(item.created_at).toLocaleDateString('es-MX'),
          getSesionesEdicionLabel(item.edicion_sesiones),
          item.ciclo_escolar || '2025'
        ]);
        
        nivelAnterior = item.nivel_academico;
      });
      
      const sesionesSheet = XLSX.utils.aoa_to_sheet(datosSesiones);
      sesionesSheet['!cols'] = [
        { width: 5 },
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 35 },
        { width: 20 },
        { width: 25 },
        { width: 18 },
        { width: 15 }
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

          <div className="admin-header-right">
            {(activeTab === 'openhouse' || activeTab === 'sesiones') && (
              <div className="admin-header-filters">
                
                <div className="admin-filter-field">
                  <label htmlFor="cicloSelect">Año</label>
                  <select
                    id="cicloSelect"
                    value={cicloEscolar}
                    onChange={(e) => onCicloEscolarChange(e.target.value)}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
                {activeTab === 'openhouse' && (
                  <div className="admin-filter-field admin-filter-field-wide">
                    <label htmlFor="edicionOHSelect">Open House</label>
                    <select
                      id="edicionOHSelect"
                      value={edicionOpenHouse}
                      onChange={(e) => onEdicionOpenHouseChange(e.target.value)}
                    >
                      <option value="todos">Todas las ediciones (por año)</option>
                      <option value="sin-etiqueta">Sin etiqueta</option>
                      {OPEN_HOUSE_EDICIONES_META.map((ed) => (
                        <option key={ed.id} value={ed.id}>
                          {ed.label} ({ed.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {activeTab === 'sesiones' && (
                  <div className="admin-filter-field admin-filter-field-wide">
                    <label htmlFor="edicionSesionesSelect">Sesiones Informativas</label>
                    <select
                      id="edicionSesionesSelect"
                      value={edicionSesiones}
                      onChange={(e) => onEdicionSesionesChange(e.target.value)}
                    >
                      <option value="todos">Todas las ediciones (por año)</option>
                      <option value="sin-etiqueta">Sin etiqueta</option>
                      {SESIONES_EDICIONES_META.map((ed) => (
                        <option key={ed.id} value={ed.id}>
                          {ed.label} ({ed.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="admin-header-buttons">
              <button
                onClick={() => {
                  fetchOpenHouse();
                  fetchSesiones();
                  fetchCampamento();
                }}
                className="admin-refresh-button"
              >
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
          <button 
            className={`admin-tab ${activeTab === 'campamento' ? 'active' : ''}`}
            onClick={() => setActiveTab('campamento')}
          >
            🏕️ Campamento de Verano ({stats.totalCampamento})
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
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#64748b', marginTop: '6px' }}>
                {descripcionFiltroOpenHouse()}
              </span>
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
                  <th>Fecha</th>
                  <th>Edición OH</th>
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
                      <td className="admin-date">
                            {new Date(item.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ fontSize: '13px', color: '#475569' }}>
                        {getOpenHouseEdicionLabel(item.edicion_open_house)}
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
        ) : activeTab === 'sesiones' ? (
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
                  <span className="admin-table-filter-hint">{descripcionFiltroSesiones()}</span>
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
                      <th>Fecha</th>
                      <th>Convocatoria</th>
                      <th>Recordatorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="admin-loading">
                          <div className="admin-spinner"></div>
                          <span>Cargando Sesiones Informativas...</span>
                        </td>
                      </tr>
                    ) : sesiones.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="admin-empty">
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
                          <td className="admin-date">
                            {new Date(item.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="admin-grade">
                            {getSesionesEdicionLabel(item.edicion_sesiones)}
                          </td>
                          <td>
                            <span className={`admin-confirmation-badge ${
                              item.confirmacion_asistencia === 'confirmado' ? 'admin-confirmation-confirmed' : 
                              item.confirmacion_asistencia === 'cancelado' ? 'admin-confirmation-cancelled' : 
                              item.reminder_sent ? 'admin-confirmation-confirmed' : 
                              'admin-confirmation-pending'
                            }`}>
                              {item.confirmacion_asistencia === 'confirmado' ? '✅ Confirmado' : 
                               item.confirmacion_asistencia === 'cancelado' ? '❌ Cancelado' : 
                               item.reminder_sent ? '✅ Enviado' : 
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
                    <p className="admin-stat-label">Total Campamento</p>
                    <p className="admin-stat-number" style={{ color: '#0ea5e9' }}>{stats.totalCampamento}</p>
                  </div>
                  <div className="admin-stat-icon" style={{ background: '#0ea5e9' }}>
                    <span style={{ fontSize: '24px' }}>🏕️</span>
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <div>
                    <p className="admin-stat-label">Plan 4 semanas</p>
                    <p className="admin-stat-number admin-stat-green">{stats.campamento4Semanas}</p>
                  </div>
                  <div className="admin-stat-icon admin-stat-icon-green">
                    <span style={{ fontSize: '20px' }}>4️⃣</span>
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <div>
                    <p className="admin-stat-label">Plan 3 semanas</p>
                    <p className="admin-stat-number admin-stat-purple">{stats.campamento3Semanas}</p>
                  </div>
                  <div className="admin-stat-icon admin-stat-icon-purple">
                    <span style={{ fontSize: '20px' }}>3️⃣</span>
                  </div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-content">
                  <div>
                    <p className="admin-stat-label">Plan semanal</p>
                    <p className="admin-stat-number admin-stat-orange">{stats.campamentoSemanal}</p>
                  </div>
                  <div className="admin-stat-icon admin-stat-icon-orange">
                    <span style={{ fontSize: '20px' }}>📅</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-table-container">
              <div className="admin-table-header admin-table-header-with-action">
                <h2>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Inscripciones Campamento de Verano
                </h2>
                <div className="admin-campamento-header-actions">
                  <button
                    type="button"
                    className="admin-campamento-folio-btn"
                    onClick={handleAsignarFoliosFaltantes}
                    disabled={asignandoFoliosCampamento || enviandoCorreosCampamento}
                  >
                    {asignandoFoliosCampamento ? 'Generando folios…' : '🔖 Generar folios faltantes'}
                  </button>
                  <button
                    type="button"
                    className="admin-campamento-email-btn"
                    onClick={handleEnviarCorreosCampamento}
                    disabled={
                      enviandoCorreosCampamento ||
                      asignandoFoliosCampamento ||
                      campamentoSeleccionados.size === 0
                    }
                  >
                    {enviandoCorreosCampamento
                      ? 'Enviando…'
                      : `📧 Enviar correo (${campamentoSeleccionados.size})`}
                  </button>
                  <button type="button" className="admin-campamento-new-btn" onClick={openCampamentoNew}>
                    ➕ Nuevo registro
                  </button>
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-campamento-check-col">
                        <input
                          type="checkbox"
                          checked={
                            campamento.length > 0 &&
                            campamentoSeleccionados.size === campamento.length
                          }
                          onChange={toggleCampamentoSeleccionTodos}
                          aria-label="Seleccionar todos"
                        />
                      </th>
                      <th>Folio</th>
                      <th>Nombre</th>
                      <th>Grado</th>
                      <th>Plan</th>
                      <th>Email</th>
                      <th>Fecha</th>
                      <th>Edición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCampamento ? (
                      <tr>
                        <td colSpan={8} className="admin-loading">
                          <div className="admin-spinner"></div>
                          <span>Cargando campamento...</span>
                        </td>
                      </tr>
                    ) : campamento.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="admin-empty">
                          <span style={{ fontSize: '32px' }}>🏕️</span>
                          <p className="admin-empty-title">No hay inscripciones al campamento</p>
                          <p className="admin-empty-subtitle">Los registros aparecerán aquí cuando los padres llenen el formulario en /campamento-verano.</p>
                        </td>
                      </tr>
                    ) : (
                      campamento.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'admin-row-even' : 'admin-row-odd'}>
                          <td className="admin-campamento-check-col">
                            <input
                              type="checkbox"
                              checked={campamentoSeleccionados.has(item.id)}
                              onChange={() => toggleCampamentoSeleccion(item.id)}
                              aria-label={`Seleccionar ${item.nombre_participante}`}
                            />
                          </td>
                          <td>
                            {item.folio ? (
                              <code className="admin-campamento-folio">{item.folio}</code>
                            ) : (
                              <span className="admin-campamento-sin-folio">Sin folio</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-user-info">
                              <div className="admin-user-avatar">
                                {item.nombre_participante.charAt(0).toUpperCase()}
                              </div>
                              <div className="admin-user-name">{item.nombre_participante}</div>
                            </div>
                          </td>
                          <td className="admin-grade">{item.grado_escolar}</td>
                          <td>
                            <span className="admin-campamento-plan-badge">
                              {formatPlanCampamento(item.plan_campamento)}
                            </span>
                          </td>
                          <td className="admin-email">{item.email}</td>
                          <td className="admin-date">
                            {new Date(item.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-campamento-edit-btn"
                              onClick={() => openCampamentoModal(item)}
                            >
                              ✏️ Ver / Editar
                            </button>
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

      {campamentoModalOpen && (
        <CampamentoAdminModal
          registro={campamentoModalRegistro}
          isNew={campamentoModalIsNew}
          onClose={closeCampamentoModal}
          onSaved={handleCampamentoSaved}
          onDeleted={handleCampamentoDeleted}
        />
      )}

    </div>
  );
}


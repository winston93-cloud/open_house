'use client';

import { useEffect, useRef, useState } from 'react';
import {
  type CampamentoPayload,
  type CampamentoRegistro,
  registroToPayload,
  validateCampamentoPayload,
} from '../../../lib/campamento-admin';
import { PLANES_CAMPAMENTO, CAMPAMENTO_EDICION, GRADOS_CAMPAMENTO, KIT_BIENVENIDA_NOMBRE, KIT_BIENVENIDA_PRECIO_FORMATEADO, puedeElegirKitBienvenida } from '../../../lib/campamento-verano';
import {
  getSemanasRequeridas,
  SEMANAS_CAMPAMENTO,
  CAMPAMENTO_RANGO_LABEL,
} from '../../../lib/campamento-semanas';

const PLAN_META: Record<string, { icon: string; desc: string }> = {
  '4_semanas': { icon: '🏕️', desc: 'Julio completo · 4 semanas' },
  '3_semanas': { icon: '⭐', desc: 'Elige 3 semanas del calendario' },
  semanal: { icon: '☀️', desc: '1 semana a la vez' },
};

interface CampamentoAdminModalProps {
  registro: CampamentoRegistro | null;
  isNew?: boolean;
  onClose: () => void;
  onSaved: (registro: CampamentoRegistro) => void;
  onDeleted?: (id: string) => void;
}

const emptyPayload = (): CampamentoPayload => ({
  nombreParticipante: '',
  fechaNacimiento: '',
  edad: 0,
  gradoEscolar: '',
  nombreTutor: '',
  telefonoPrincipal: '',
  telefonoEmergencia: '',
  email: '',
  tieneAlergias: false,
  alergiasDetalle: null,
  autorizaPrimerosAuxilios: true,
  autorizaFotos: true,
  aceptaReglamento: true,
  fechaFirma: new Date().toISOString().slice(0, 10),
  planCampamento: '',
  semanasSeleccionadas: [],
  kitBienvenida: false,
  edicion: CAMPAMENTO_EDICION,
});

export default function CampamentoAdminModal({
  registro,
  isNew = false,
  onClose,
  onSaved,
  onDeleted,
}: CampamentoAdminModalProps) {
  const [form, setForm] = useState<CampamentoPayload>(emptyPayload());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (registro) {
      setForm(registroToPayload(registro));
    } else if (isNew) {
      setForm(emptyPayload());
    }
  }, [registro, isNew]);

  const requeridas = getSemanasRequeridas(form.planCampamento);
  const mostrarKitBienvenida = puedeElegirKitBienvenida(
    form.planCampamento,
    form.semanasSeleccionadas.length
  );

  const ajustarSemanasAlPlan = (plan: string, prev: string[]): string[] => {
    if (plan === '4_semanas') return SEMANAS_CAMPAMENTO.map((s) => s.id);
    const req = getSemanasRequeridas(plan);
    if (!req) return [];
    const sorted = prev
      .filter((id) => SEMANAS_CAMPAMENTO.some((s) => s.id === id))
      .sort(
        (a, b) =>
          SEMANAS_CAMPAMENTO.find((s) => s.id === a)!.numero -
          SEMANAS_CAMPAMENTO.find((s) => s.id === b)!.numero
      );
    return sorted.slice(0, req);
  };

  const update = (patch: Partial<CampamentoPayload>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const showError = (message: string) => {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const toggleSemana = (id: string) => {
    const sel = form.semanasSeleccionadas;
    let next: string[];
    if (sel.includes(id)) {
      next = sel.filter((s) => s !== id);
    } else {
      if (sel.length >= requeridas) return;
      next = [...sel, id].sort(
        (a, b) =>
          SEMANAS_CAMPAMENTO.find((s) => s.id === a)!.numero -
          SEMANAS_CAMPAMENTO.find((s) => s.id === b)!.numero
      );
    }
    update({
      semanasSeleccionadas: next,
      kitBienvenida: puedeElegirKitBienvenida(form.planCampamento, next.length)
        ? form.kitBienvenida
        : false,
    });
  };

  const handleSave = async () => {
    const validationError = validateCampamentoPayload(form);
    if (validationError) {
      showError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const url = isNew
        ? '/api/admin/campamento-verano'
        : `/api/admin/campamento-verano/${registro!.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        showError(data.message || 'Error al guardar');
        return;
      }
      onSaved(data.registro);
      onClose();
    } catch {
      showError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!registro || !onDeleted) return;
    if (!confirm('¿Eliminar este registro de campamento? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/campamento-verano/${registro.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Error al eliminar');
        return;
      }
      onDeleted(registro.id);
      onClose();
    } catch {
      setError('Error de conexión');
    } finally {
      setDeleting(false);
    }
  };

  const selectPlan = (planId: string) => {
    if (planId === form.planCampamento) return;
    const nextSemanas = ajustarSemanasAlPlan(planId, form.semanasSeleccionadas);
    update({
      planCampamento: planId,
      semanasSeleccionadas: nextSemanas,
      kitBienvenida: puedeElegirKitBienvenida(planId, nextSemanas.length)
        ? form.kitBienvenida
        : false,
    });
  };

  const semanasCompletas = form.planCampamento
    ? form.semanasSeleccionadas.length === requeridas
    : false;

  if (!registro && !isNew) return null;

  const planActivo = PLANES_CAMPAMENTO.find((p) => p.id === form.planCampamento);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-campamento-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isNew ? '➕ Nuevo registro — Campamento' : '✏️ Editar inscripción — Campamento'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="admin-modal-content admin-campamento-modal-body">
          {error && (
            <div ref={errorRef} className="admin-campamento-error" role="alert">
              {error}
            </div>
          )}

          {!isNew && registro?.folio && (
            <div className="admin-campamento-folio-banner">
              <span className="admin-campamento-folio-banner-label">Folio de inscripción</span>
              <span className="admin-campamento-folio-banner-code">{registro.folio}</span>
              <span className="admin-campamento-folio-banner-hint">
                Presentar al pagar la inscripción
              </span>
            </div>
          )}

          <section className="admin-campamento-section">
            <h4>Participante</h4>
            <div className="admin-campamento-grid">
              <label>
                Nombre completo
                <input
                  value={form.nombreParticipante}
                  onChange={(e) => update({ nombreParticipante: e.target.value })}
                />
              </label>
              <label>
                Fecha de nacimiento
                <input
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => update({ fechaNacimiento: e.target.value })}
                />
              </label>
              <label>
                Edad
                <input
                  type="number"
                  min={0}
                  value={form.edad || ''}
                  onChange={(e) => update({ edad: Number(e.target.value) })}
                />
              </label>
              <label>
                Grado escolar
                <select
                  value={form.gradoEscolar}
                  onChange={(e) => update({ gradoEscolar: e.target.value })}
                >
                  <option value="">Seleccionar</option>
                  {GRADOS_CAMPAMENTO.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="admin-campamento-section">
            <h4>Padre / tutor</h4>
            <div className="admin-campamento-grid">
              <label className="full">
                Nombre
                <input
                  value={form.nombreTutor}
                  onChange={(e) => update({ nombreTutor: e.target.value })}
                />
              </label>
              <label>
                Tel. principal
                <input
                  value={form.telefonoPrincipal}
                  onChange={(e) => update({ telefonoPrincipal: e.target.value })}
                />
              </label>
              <label>
                Tel. emergencia
                <input
                  value={form.telefonoEmergencia}
                  onChange={(e) => update({ telefonoEmergencia: e.target.value })}
                />
              </label>
              <label className="full">
                Correo
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="admin-campamento-section">
            <h4>Médico y autorizaciones</h4>
            <div className="admin-campamento-grid">
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={form.tieneAlergias}
                  onChange={(e) =>
                    update({
                      tieneAlergias: e.target.checked,
                      alergiasDetalle: e.target.checked ? form.alergiasDetalle : null,
                    })
                  }
                />
                Tiene alergias
              </label>
              {form.tieneAlergias && (
                <label className="full">
                  Detalle alergias
                  <textarea
                    value={form.alergiasDetalle || ''}
                    onChange={(e) => update({ alergiasDetalle: e.target.value })}
                    rows={2}
                  />
                </label>
              )}
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={form.autorizaPrimerosAuxilios}
                  onChange={(e) => update({ autorizaPrimerosAuxilios: e.target.checked })}
                />
                Autoriza primeros auxilios
              </label>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={form.autorizaFotos}
                  onChange={(e) => update({ autorizaFotos: e.target.checked })}
                />
                Autoriza fotos / videos
              </label>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={form.aceptaReglamento}
                  onChange={(e) => update({ aceptaReglamento: e.target.checked })}
                />
                Acepta reglamento
              </label>
              <label>
                Fecha firma
                <input
                  type="date"
                  value={form.fechaFirma}
                  onChange={(e) => update({ fechaFirma: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="admin-campamento-section admin-campamento-plan-section">
            <h4>Plan y semanas</h4>

            <p className="admin-campamento-plan-intro">Elige el plan de inscripción</p>
            <div className="admin-campamento-plan-grid" role="radiogroup" aria-label="Plan del campamento">
              {PLANES_CAMPAMENTO.map((p) => {
                const meta = PLAN_META[p.id];
                const selected = form.planCampamento === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`admin-campamento-plan-card${selected ? ' selected' : ''}`}
                    onClick={() => selectPlan(p.id)}
                  >
                    {selected && <span className="admin-campamento-plan-check" aria-hidden>✓</span>}
                    <span className="admin-campamento-plan-card-icon">{meta.icon}</span>
                    <span className="admin-campamento-plan-card-label">{p.label}</span>
                    <span className="admin-campamento-plan-card-meta">{meta.desc}</span>
                    <span className="admin-campamento-plan-card-price">{p.precioFormateado}</span>
                  </button>
                );
              })}
            </div>

            {planActivo && (
              <div className="admin-campamento-plan-summary">
                <span className="admin-campamento-plan-summary-label">Inversión del plan</span>
                <strong>{planActivo.precioFormateado} MXN</strong>
              </div>
            )}

            {form.planCampamento && (
              <div className="admin-campamento-weeks-panel">
                <div className="admin-campamento-weeks-header">
                  <div className="admin-campamento-weeks-title-wrap">
                    <span className="admin-campamento-weeks-icon">📅</span>
                    <div>
                      <p className="admin-campamento-weeks-title">Semanas del campamento</p>
                      <p className="admin-campamento-weeks-range">{CAMPAMENTO_RANGO_LABEL}</p>
                    </div>
                  </div>
                  <div
                    className={`admin-campamento-weeks-counter${
                      semanasCompletas ? ' admin-campamento-weeks-counter--done' : ''
                    }`}
                  >
                    <span className="admin-campamento-weeks-counter-num">
                      {form.semanasSeleccionadas.length}/{requeridas}
                    </span>
                    <span className="admin-campamento-weeks-counter-label">
                      {requeridas === 1 ? 'semana' : 'semanas'}
                    </span>
                  </div>
                </div>

                <div className="admin-campamento-weeks-timeline" aria-hidden="true">
                  {SEMANAS_CAMPAMENTO.map((s) => (
                    <div
                      key={s.id}
                      className={`admin-campamento-weeks-timeline-seg${
                        form.semanasSeleccionadas.includes(s.id)
                          ? ' admin-campamento-weeks-timeline-seg--on'
                          : ''
                      }`}
                    >
                      S{s.numero}
                    </div>
                  ))}
                </div>

                <p
                  className={`admin-campamento-weeks-hint${
                    !semanasCompletas ? ' admin-campamento-weeks-hint--warn' : ''
                  }`}
                >
                  {semanasCompletas
                    ? '✓ Semanas listas para guardar'
                    : requeridas === 1
                      ? 'Toca la semana en la que participará'
                      : `Elige ${requeridas} semanas del calendario`}
                </p>

                <div className="admin-campamento-weeks-grid">
                  {SEMANAS_CAMPAMENTO.map((s) => {
                    const selected = form.semanasSeleccionadas.includes(s.id);
                    const disabled = !selected && form.semanasSeleccionadas.length >= requeridas;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`admin-campamento-week-card${selected ? ' selected' : ''}${
                          disabled ? ' disabled' : ''
                        }`}
                        onClick={() => toggleSemana(s.id)}
                        disabled={disabled}
                        aria-pressed={selected}
                      >
                        <span className="admin-campamento-week-card-emoji">{s.emoji}</span>
                        <span className="admin-campamento-week-card-num">Semana {s.numero}</span>
                        <span className="admin-campamento-week-card-dates">{s.labelCorto}</span>
                        <span className="admin-campamento-week-card-full">{s.label}</span>
                        {selected && <span className="admin-campamento-week-card-check">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {form.semanasSeleccionadas.length > 0 && (
                  <div className="admin-campamento-week-summary">
                    {form.semanasSeleccionadas
                      .map((id) => SEMANAS_CAMPAMENTO.find((w) => w.id === id))
                      .filter(Boolean)
                      .sort((a, b) => a!.numero - b!.numero)
                      .map((s) => (
                        <span key={s!.id} className="admin-campamento-week-tag">
                          {s!.emoji} S{s!.numero}: {s!.label}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}

            {mostrarKitBienvenida && (
              <div className="admin-campamento-kit-box">
                <p className="admin-campamento-kit-intro">
                  Opcional para plan semanal: agrega el <strong>{KIT_BIENVENIDA_NOMBRE}</strong> por{' '}
                  <strong>{KIT_BIENVENIDA_PRECIO_FORMATEADO}.00 MXN</strong>.
                </p>
                <label className="admin-campamento-kit-option">
                  <input
                    type="checkbox"
                    checked={form.kitBienvenida === true}
                    onChange={(e) => update({ kitBienvenida: e.target.checked })}
                  />
                  <span>
                    Sí, incluir {KIT_BIENVENIDA_NOMBRE} ({KIT_BIENVENIDA_PRECIO_FORMATEADO}.00 MXN)
                  </span>
                </label>
              </div>
            )}

            {form.planCampamento === 'semanal' && !mostrarKitBienvenida && (
              <p className="admin-campamento-weeks-hint admin-campamento-weeks-hint--muted">
                El {KIT_BIENVENIDA_NOMBRE.toLowerCase()} solo aplica al elegir exactamente 1 semana.
              </p>
            )}
          </section>
        </div>

        <div className="admin-campamento-modal-actions">
          {!isNew && onDeleted && (
            <button
              type="button"
              className="admin-campamento-delete"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? 'Eliminando…' : '🗑️ Eliminar'}
            </button>
          )}
          <div className="admin-campamento-modal-actions-right">
            <button type="button" className="admin-modal-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className="admin-campamento-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : '💾 Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

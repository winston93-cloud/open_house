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
  getSemanasCampamentoLabels,
} from '../../../lib/campamento-semanas';

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

  if (!registro && !isNew) return null;

  const semanasLabels = getSemanasCampamentoLabels(form.semanasSeleccionadas);

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

          <section className="admin-campamento-section">
            <h4>Plan y semanas</h4>
            <label>
              Plan
              <select
                value={form.planCampamento}
                onChange={(e) => {
                  const plan = e.target.value;
                  const nextSemanas = ajustarSemanasAlPlan(plan, form.semanasSeleccionadas);
                  update({
                    planCampamento: plan,
                    semanasSeleccionadas: nextSemanas,
                    kitBienvenida: puedeElegirKitBienvenida(plan, nextSemanas.length)
                      ? form.kitBienvenida
                      : false,
                  });
                }}
              >
                <option value="">Seleccionar plan</option>
                {PLANES_CAMPAMENTO.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — {p.precioFormateado}
                  </option>
                ))}
              </select>
            </label>

            {form.planCampamento && (
              <div className="admin-campamento-semanas">
                <p
                  className={`admin-campamento-semanas-hint${
                    form.semanasSeleccionadas.length < requeridas ? ' admin-campamento-semanas-hint-warn' : ''
                  }`}
                >
                  Selecciona {requeridas} semana{requeridas > 1 ? 's' : ''} (
                  {form.semanasSeleccionadas.length}/{requeridas})
                  {form.semanasSeleccionadas.length < requeridas &&
                    ' — debes elegir las semanas antes de guardar'}
                </p>
                <div className="admin-campamento-semanas-grid">
                  {SEMANAS_CAMPAMENTO.map((s) => {
                    const selected = form.semanasSeleccionadas.includes(s.id);
                    const disabled = !selected && form.semanasSeleccionadas.length >= requeridas;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`admin-campamento-semana-chip${selected ? ' selected' : ''}${
                          disabled ? ' disabled' : ''
                        }`}
                        onClick={() => toggleSemana(s.id)}
                        disabled={disabled}
                      >
                        {s.emoji} S{s.numero} · {s.labelCorto}
                      </button>
                    );
                  })}
                </div>
                {semanasLabels.length > 0 && (
                  <ul className="admin-campamento-semanas-list">
                    {semanasLabels.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {mostrarKitBienvenida && (
              <label className="inline-check admin-campamento-kit-check">
                <input
                  type="checkbox"
                  checked={form.kitBienvenida === true}
                  onChange={(e) => update({ kitBienvenida: e.target.checked })}
                />
                {KIT_BIENVENIDA_NOMBRE} ({KIT_BIENVENIDA_PRECIO_FORMATEADO}.00 MXN)
              </label>
            )}

            {form.planCampamento === 'semanal' && !mostrarKitBienvenida && (
              <p className="admin-campamento-semanas-hint">
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

'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  PLANES_CAMPAMENTO,
  calcularEdad,
  CAMPAMENTO_INSTITUCION,
  CAMPAMENTO_SUBTITULO,
  CAMPAMENTO_TITULO,
} from '../../lib/campamento-verano';

interface FormData {
  nombreParticipante: string;
  fechaNacimiento: string;
  edad: string;
  gradoEscolar: string;
  nombreTutor: string;
  telefonoPrincipal: string;
  telefonoEmergencia: string;
  email: string;
  tieneAlergias: 'si' | 'no' | '';
  alergiasDetalle: string;
  autorizaPrimerosAuxilios: boolean;
  autorizaFotos: boolean;
  aceptaReglamento: boolean;
  planCampamento: string;
}

type FormErrors = Partial<Record<keyof FormData | 'general', string>>;

const GRADOS = [
  'Maternal A',
  'Maternal B',
  'Kinder 1',
  'Kinder 2',
  'Kinder 3',
  '1° Primaria',
  '2° Primaria',
  '3° Primaria',
  '4° Primaria',
  '5° Primaria',
  '6° Primaria',
  '1° Secundaria',
  '2° Secundaria',
  '3° Secundaria',
  'Otro',
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTodayLabel(): string {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CampamentoVeranoForm() {
  const fechaFirma = useMemo(() => todayIso(), []);
  const fechaFirmaLabel = useMemo(() => formatTodayLabel(), []);

  const [formData, setFormData] = useState<FormData>({
    nombreParticipante: '',
    fechaNacimiento: '',
    edad: '',
    gradoEscolar: '',
    nombreTutor: '',
    telefonoPrincipal: '',
    telefonoEmergencia: '',
    email: '',
    tieneAlergias: '',
    alergiasDetalle: '',
    autorizaPrimerosAuxilios: false,
    autorizaFotos: false,
    aceptaReglamento: false,
    planCampamento: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const planSeleccionado = PLANES_CAMPAMENTO.find((p) => p.id === formData.planCampamento);

  useEffect(() => {
    document.body.classList.add('campamento-page');
    return () => document.body.classList.remove('campamento-page');
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      } as FormData;

      if (name === 'fechaNacimiento' && value) {
        const edadCalc = calcularEdad(value);
        if (edadCalc !== null) next.edad = String(edadCalc);
      }

      if (name === 'tieneAlergias' && value === 'no') {
        next.alergiasDetalle = '';
      }

      return next;
    });

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.nombreParticipante.trim()) next.nombreParticipante = 'Campo obligatorio';
    if (!formData.fechaNacimiento) next.fechaNacimiento = 'Campo obligatorio';
    else {
      const edadCalc = calcularEdad(formData.fechaNacimiento);
      if (edadCalc === null || edadCalc < 3 || edadCalc > 18) {
        next.fechaNacimiento = 'Edad del participante debe ser entre 3 y 18 años';
      } else if (formData.edad !== String(edadCalc)) {
        next.edad = 'No coincide con la fecha de nacimiento';
      }
    }
    if (!formData.edad) next.edad = 'Campo obligatorio';
    if (!formData.gradoEscolar) next.gradoEscolar = 'Selecciona un grado';
    if (!formData.nombreTutor.trim()) next.nombreTutor = 'Campo obligatorio';
    if (formData.telefonoPrincipal.replace(/\D/g, '').length < 10) {
      next.telefonoPrincipal = 'Mínimo 10 dígitos';
    }
    if (formData.telefonoEmergencia.replace(/\D/g, '').length < 10) {
      next.telefonoEmergencia = 'Mínimo 10 dígitos';
    }
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      next.email = 'Correo electrónico inválido';
    }
    if (!formData.tieneAlergias) next.tieneAlergias = 'Indica si tiene alergias';
    if (formData.tieneAlergias === 'si' && !formData.alergiasDetalle.trim()) {
      next.alergiasDetalle = 'Especifica las alergias';
    }
    if (!formData.autorizaPrimerosAuxilios) {
      next.autorizaPrimerosAuxilios = 'Autorización requerida';
    }
    if (!formData.autorizaFotos) next.autorizaFotos = 'Autorización requerida';
    if (!formData.aceptaReglamento) next.aceptaReglamento = 'Debes aceptar el reglamento';
    if (!formData.planCampamento) next.planCampamento = 'Selecciona un plan';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/campamento-verano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tieneAlergias: formData.tieneAlergias === 'si',
          edad: Number(formData.edad),
          fechaFirma,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowModal(true);
        setFormData({
          nombreParticipante: '',
          fechaNacimiento: '',
          edad: '',
          gradoEscolar: '',
          nombreTutor: '',
          telefonoPrincipal: '',
          telefonoEmergencia: '',
          email: '',
          tieneAlergias: '',
          alergiasDetalle: '',
          autorizaPrimerosAuxilios: false,
          autorizaFotos: false,
          aceptaReglamento: false,
          planCampamento: '',
        });
      } else {
        setSubmitError(result.message || 'Error al procesar la inscripción');
      }
    } catch {
      setSubmitError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="campamento-root">
      <div className="campamento-wrap">
        <div className="campamento-banner">
          <img
            src="/banner-campamento-verano.png"
            alt={`${CAMPAMENTO_TITULO} — ${CAMPAMENTO_SUBTITULO}`}
          />
        </div>

        <div className="campamento-card">
          {submitError && <div className="campamento-alert error">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <section className="campamento-section">
              <h2 className="campamento-section-title">
                <span className="campamento-section-num">1</span>
                Información del participante
              </h2>
              <div className="campamento-grid">
                <div className="campamento-field full-width">
                  <label htmlFor="nombreParticipante">
                    Nombre completo <span className="req">*</span>
                  </label>
                  <input
                    id="nombreParticipante"
                    name="nombreParticipante"
                    type="text"
                    value={formData.nombreParticipante}
                    onChange={handleChange}
                    placeholder="Nombre completo del participante"
                    autoComplete="name"
                  />
                  {errors.nombreParticipante && (
                    <p className="campamento-error">{errors.nombreParticipante}</p>
                  )}
                </div>

                <div className="campamento-field">
                  <label htmlFor="fechaNacimiento">
                    Fecha de nacimiento <span className="req">*</span>
                  </label>
                  <input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    max={todayIso()}
                  />
                  {errors.fechaNacimiento && (
                    <p className="campamento-error">{errors.fechaNacimiento}</p>
                  )}
                </div>

                <div className="campamento-field">
                  <label htmlFor="edad">
                    Edad <span className="req">*</span>
                  </label>
                  <input
                    id="edad"
                    name="edad"
                    type="number"
                    min={3}
                    max={18}
                    value={formData.edad}
                    onChange={handleChange}
                    placeholder="Años"
                    readOnly={!!formData.fechaNacimiento}
                  />
                  {errors.edad && <p className="campamento-error">{errors.edad}</p>}
                </div>

                <div className="campamento-field full-width">
                  <label htmlFor="gradoEscolar">
                    Grado escolar actual <span className="req">*</span>
                  </label>
                  <select
                    id="gradoEscolar"
                    name="gradoEscolar"
                    value={formData.gradoEscolar}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona el grado</option>
                    {GRADOS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {errors.gradoEscolar && (
                    <p className="campamento-error">{errors.gradoEscolar}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="campamento-section">
              <h2 className="campamento-section-title">
                <span className="campamento-section-num">2</span>
                Información de padres / tutores
              </h2>
              <div className="campamento-grid">
                <div className="campamento-field full-width">
                  <label htmlFor="nombreTutor">
                    Nombre del padre o tutor <span className="req">*</span>
                  </label>
                  <input
                    id="nombreTutor"
                    name="nombreTutor"
                    type="text"
                    value={formData.nombreTutor}
                    onChange={handleChange}
                    placeholder="Nombre completo del tutor"
                  />
                  {errors.nombreTutor && (
                    <p className="campamento-error">{errors.nombreTutor}</p>
                  )}
                </div>

                <div className="campamento-field">
                  <label htmlFor="telefonoPrincipal">
                    Teléfono principal <span className="req">*</span>
                  </label>
                  <input
                    id="telefonoPrincipal"
                    name="telefonoPrincipal"
                    type="tel"
                    value={formData.telefonoPrincipal}
                    onChange={handleChange}
                    placeholder="833 000 0000"
                    autoComplete="tel"
                  />
                  {errors.telefonoPrincipal && (
                    <p className="campamento-error">{errors.telefonoPrincipal}</p>
                  )}
                </div>

                <div className="campamento-field">
                  <label htmlFor="telefonoEmergencia">
                    Teléfono de emergencia <span className="req">*</span>
                  </label>
                  <input
                    id="telefonoEmergencia"
                    name="telefonoEmergencia"
                    type="tel"
                    value={formData.telefonoEmergencia}
                    onChange={handleChange}
                    placeholder="833 000 0000"
                  />
                  {errors.telefonoEmergencia && (
                    <p className="campamento-error">{errors.telefonoEmergencia}</p>
                  )}
                </div>

                <div className="campamento-field full-width">
                  <label htmlFor="email">
                    Correo electrónico <span className="req">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                  {errors.email && <p className="campamento-error">{errors.email}</p>}
                </div>
              </div>
            </section>

            <section className="campamento-section">
              <h2 className="campamento-section-title">
                <span className="campamento-section-num">3</span>
                Información médica
              </h2>
              <div className="campamento-field">
                <label>
                  ¿Tiene alergias? <span className="req">*</span>
                </label>
                <div className="campamento-radio-group">
                  <label className="campamento-radio">
                    <input
                      type="radio"
                      name="tieneAlergias"
                      value="si"
                      checked={formData.tieneAlergias === 'si'}
                      onChange={handleChange}
                    />
                    Sí
                  </label>
                  <label className="campamento-radio">
                    <input
                      type="radio"
                      name="tieneAlergias"
                      value="no"
                      checked={formData.tieneAlergias === 'no'}
                      onChange={handleChange}
                    />
                    No
                  </label>
                </div>
                {errors.tieneAlergias && (
                  <p className="campamento-error">{errors.tieneAlergias}</p>
                )}
              </div>

              {formData.tieneAlergias === 'si' && (
                <div className="campamento-field" style={{ marginTop: '1rem' }}>
                  <label htmlFor="alergiasDetalle">
                    Especificar alergias <span className="req">*</span>
                  </label>
                  <textarea
                    id="alergiasDetalle"
                    name="alergiasDetalle"
                    value={formData.alergiasDetalle}
                    onChange={handleChange}
                    placeholder="Describe las alergias y consideraciones importantes"
                  />
                  {errors.alergiasDetalle && (
                    <p className="campamento-error">{errors.alergiasDetalle}</p>
                  )}
                </div>
              )}
            </section>

            <section className="campamento-section">
              <h2 className="campamento-section-title">
                <span className="campamento-section-num">4</span>
                Autorizaciones
              </h2>

              <label className="campamento-check">
                <input
                  type="checkbox"
                  name="autorizaPrimerosAuxilios"
                  checked={formData.autorizaPrimerosAuxilios}
                  onChange={handleChange}
                />
                <span>
                  Autorizo al {CAMPAMENTO_INSTITUCION} a brindar primeros auxilios a mi
                  hijo(a) si fuera necesario.
                </span>
              </label>
              {errors.autorizaPrimerosAuxilios && (
                <p className="campamento-error">{errors.autorizaPrimerosAuxilios}</p>
              )}

              <label className="campamento-check">
                <input
                  type="checkbox"
                  name="autorizaFotos"
                  checked={formData.autorizaFotos}
                  onChange={handleChange}
                />
                <span>
                  Autorizo el uso de fotos y videos de mi hijo(a) con fines educativos y
                  promocionales del {CAMPAMENTO_INSTITUCION}.
                </span>
              </label>
              {errors.autorizaFotos && (
                <p className="campamento-error">{errors.autorizaFotos}</p>
              )}

              <label className="campamento-check">
                <input
                  type="checkbox"
                  name="aceptaReglamento"
                  checked={formData.aceptaReglamento}
                  onChange={handleChange}
                />
                <span>
                  Acepto las normas y reglamentos del campamento de verano, y me comprometo a
                  que mi hijo(a) las respete.
                </span>
              </label>
              {errors.aceptaReglamento && (
                <p className="campamento-error">{errors.aceptaReglamento}</p>
              )}

              <p className="campamento-plan-hint" style={{ marginTop: '1rem' }}>
                <strong>Fecha:</strong> {fechaFirmaLabel}
              </p>
            </section>

            <section className="campamento-section">
              <h2 className="campamento-section-title">
                <span className="campamento-section-num">5</span>
                Plan del campamento
              </h2>
              <div className="campamento-field full-width">
                <label htmlFor="planCampamento">
                  Selecciona tu plan <span className="req">*</span>
                </label>
                <select
                  id="planCampamento"
                  name="planCampamento"
                  className="campamento-plan-select"
                  value={formData.planCampamento}
                  onChange={handleChange}
                >
                  <option value="">Elige un plan</option>
                  {PLANES_CAMPAMENTO.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} — {p.precioFormateado}
                    </option>
                  ))}
                </select>
                {planSeleccionado && (
                  <p className="campamento-plan-hint">
                    Plan: <strong>{planSeleccionado.label}</strong> · Inversión:{' '}
                    <strong>{planSeleccionado.precioFormateado} MXN</strong>
                  </p>
                )}
                {errors.planCampamento && (
                  <p className="campamento-error">{errors.planCampamento}</p>
                )}
              </div>
            </section>

            <button type="submit" className="campamento-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando inscripción…' : 'Confirmar inscripción al campamento'}
            </button>
          </form>
        </div>

        <p className="campamento-footer">© {new Date().getFullYear()} {CAMPAMENTO_INSTITUCION}</p>
      </div>

      {showModal && (
        <div className="campamento-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="campamento-modal" onClick={(e) => e.stopPropagation()}>
            <div className="campamento-modal-icon">🎉</div>
            <h2>¡Inscripción exitosa!</h2>
            <p>
              Tu registro al campamento fue guardado correctamente. Revisa tu correo electrónico
              con la confirmación y el resumen de tu plan.
            </p>
            <button type="button" className="campamento-modal-btn" onClick={() => setShowModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

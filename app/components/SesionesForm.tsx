'use client'

import { useState } from 'react'

interface FormData {
  nombreAspirante: string
  nivelAcademico: string
  gradoEscolar: string
  fechaNacimiento: string
  genero: string
  escuelaProcedencia: string
  nombreCompleto: string
  correo: string
  whatsapp: string
  parentesco: string
  personasAsistiran: string
  medioEntero: string
}

interface FormErrors {
  [key: string]: string
}

export default function SesionesForm() {
  const [formData, setFormData] = useState<FormData>({
    nombreAspirante: '',
    nivelAcademico: '',
    gradoEscolar: '',
    fechaNacimiento: '',
    genero: '',
    escuelaProcedencia: '',
    nombreCompleto: '',
    correo: '',
    whatsapp: '',
    parentesco: '',
    personasAsistiran: '',
    medioEntero: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Reset gradoEscolar when nivelAcademico changes
    if (name === 'nivelAcademico') {
      setFormData(prev => ({
        ...prev,
        gradoEscolar: ''
      }))
    }

    // Real-time email validation
    if (name === 'correo' && value) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(value)) {
        setErrors(prev => ({
          ...prev,
          correo: 'Formato de correo inválido'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          correo: ''
        }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields validation
    const requiredFields = [
      'nombreAspirante', 'nivelAcademico', 'gradoEscolar', 'fechaNacimiento',
      'genero', 'escuelaProcedencia', 'nombreCompleto', 'correo',
      'whatsapp', 'parentesco', 'personasAsistiran', 'medioEntero'
    ]

    requiredFields.forEach(field => {
      if (!formData[field as keyof FormData]) {
        newErrors[field] = `${getFieldLabel(field)} es obligatorio`
      }
    })

    // Email validation
    if (formData.correo) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = 'Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)'
      }
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      nombreAspirante: 'Nombre del Aspirante',
      nivelAcademico: 'Nivel Académico',
      gradoEscolar: 'Grado Escolar al que aspira',
      fechaNacimiento: 'Fecha de nacimiento',
      genero: 'Género',
      escuelaProcedencia: 'Escuela de procedencia',
      nombreCompleto: 'Nombre completo',
      correo: 'Correo electrónico',
      whatsapp: 'WhatsApp',
      parentesco: 'Parentesco',
      personasAsistiran: 'Personas que asistirán al evento',
      medioEntero: 'Medio por el cual se enteró'
    }
    return labels[field] || field
  }

  const getGradoOptions = () => {
    if (formData.nivelAcademico === 'maternal') {
      return [
        { value: 'maternalA', label: 'Maternal A' },
        { value: 'maternalB', label: 'Maternal B' }
      ]
    } else if (formData.nivelAcademico === 'kinder') {
      return [
        { value: 'kinder1', label: 'Kinder-1' },
        { value: 'kinder2', label: 'Kinder-2' },
        { value: 'kinder3', label: 'Kinder-3' }
      ]
    } else if (formData.nivelAcademico === 'primaria') {
      return [
        { value: '1primaria', label: '1° Primaria' },
        { value: '2primaria', label: '2° Primaria' },
        { value: '3primaria', label: '3° Primaria' },
        { value: '4primaria', label: '4° Primaria' },
        { value: '5primaria', label: '5° Primaria' },
        { value: '6primaria', label: '6° Primaria' }
      ]
    } else if (formData.nivelAcademico === 'secundaria') {
      return [
        { value: '7secundaria', label: '7° Secundaria' },
        { value: '8secundaria', label: '8° Secundaria' },
        { value: '9secundaria', label: '9° Secundaria' }
      ]
    }
    return []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Formulario enviado:', formData)
    
    if (!validateForm()) {
      console.log('Validación falló:', errors)
      return
    }

    console.log('Validación exitosa, enviando datos...')
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      console.log('Enviando datos al backend...')
          const response = await fetch('/api/sesiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Respuesta del backend:', response.status)
      const result = await response.json()
      console.log('Resultado:', result)

      if (result.success) {
        setShowModal(true)
        // Reset form
        setFormData({
          nombreAspirante: '',
          nivelAcademico: '',
          gradoEscolar: '',
          fechaNacimiento: '',
          genero: '',
          escuelaProcedencia: '',
          nombreCompleto: '',
          correo: '',
          whatsapp: '',
          parentesco: '',
          personasAsistiran: '',
          medioEntero: ''
        })
      } else {
        setSubmitMessage({
          type: 'error',
          text: result.message || 'Error al procesar la inscripción'
        })
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, intenta nuevamente.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        .sesiones-form-container .form-intro h2 {
          color: #FA9D00;
        }
        
        .sesiones-form-container .dates-info h3 {
          color: #FA9D00;
        }
        
        .sesiones-form-container .section-title {
          color: #FA9D00;
        }
        
        .sesiones-form-container .submit-button {
          background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
        }
        
        .sesiones-form-container .submit-button:hover {
          background: linear-gradient(135deg, #E88D00 0%, #D67D00 100%);
        }
        
        .sesiones-form-container .submit-button:active {
          background: linear-gradient(135deg, #D67D00 0%, #C66D00 100%);
        }
        
        .sesiones-form-container .submit-button:disabled {
          background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
          opacity: 0.7;
        }
        
        .sesiones-form-container .modal-header {
          background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
        }
        
        .sesiones-form-container .modal-button {
          background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
        }
        
        .sesiones-form-container .modal-button:hover {
          background: linear-gradient(135deg, #E88D00 0%, #D67D00 100%);
        }
      `}</style>

      {/* Winston Banner */}
      <div className="winston-banner">
        <img 
          src="/winston-banner.jpg" 
          alt="Winston Sesiones Informativas 2025" 
          className="winston-banner-image"
        />
      </div>



      {/* Form Container */}
      <div className="form-container sesiones-form-container">
        <div className="form-intro">
          <h2>Sesiones Informativas</h2>
          <p>Déjanos tus datos y confirma tu asistencia a nuestra Sesión Informativa.</p>
        </div>

          {/* Dates Info */}
            <div className="dates-info">
              <h3>Fecha de Sesión Informativa</h3>
              <div className="date-item">
                <span className="date-label">Maternal y Kinder:</span>
                <span className="date-value">29 de noviembre - 9:00 AM</span>
              </div>
              <div className="date-item">
                <span className="date-label">Primaria:</span>
                <span className="date-value">6 de diciembre - 9:00 a 11:30 AM</span>
              </div>
              <div className="date-item">
                <span className="date-label">Secundaria:</span>
                <span className="date-value">6 de diciembre - 11:30 AM a 2:00 PM</span>
              </div>
            </div>

        {/* Success/Error Messages */}
        {submitMessage && (
          <div className={`message ${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Datos Generales del Aspirante */}
          <div className="form-section">
            <h3 className="section-title">Datos Generales del Aspirante</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombreAspirante">
                  Nombre del Aspirante <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombreAspirante"
                  name="nombreAspirante"
                  value={formData.nombreAspirante}
                  onChange={handleInputChange}
                  placeholder="Nombre completo del aspirante"
                />
                {errors.nombreAspirante && (
                  <div className="error-message">{errors.nombreAspirante}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nivelAcademico">Nivel Académico *</label>
                <select
                  id="nivelAcademico"
                  name="nivelAcademico"
                  value={formData.nivelAcademico}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un nivel</option>
                  <option value="maternal">Maternal</option>
                  <option value="kinder">Kinder</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                </select>
                {errors.nivelAcademico && (
                  <div className="error-message">{errors.nivelAcademico}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gradoEscolar">
                  Grado Escolar al que aspira <span className="required">*</span>
                </label>
                <select
                  id="gradoEscolar"
                  name="gradoEscolar"
                  value={formData.gradoEscolar}
                  onChange={handleInputChange}
                  disabled={!formData.nivelAcademico}
                >
                  <option value="">
                    {formData.nivelAcademico ? 'Selecciona un grado' : 'Primero selecciona un nivel académico'}
                  </option>
                  {getGradoOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.gradoEscolar && (
                  <div className="error-message">{errors.gradoEscolar}</div>
                )}
              </div>


              <div className="form-group">
                <label htmlFor="fechaNacimiento">
                  Fecha de nacimiento <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                />
                <div className="hint-text">Día, mes y año</div>
                {errors.fechaNacimiento && (
                  <div className="error-message">{errors.fechaNacimiento}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="genero">
                  Género <span className="required">*</span>
                </label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                {errors.genero && (
                  <div className="error-message">{errors.genero}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="escuelaProcedencia">
                  Escuela de procedencia <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="escuelaProcedencia"
                  name="escuelaProcedencia"
                  value={formData.escuelaProcedencia}
                  onChange={handleInputChange}
                  placeholder="Nombre de la escuela actual"
                />
                {errors.escuelaProcedencia && (
                  <div className="error-message">{errors.escuelaProcedencia}</div>
                )}
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="form-section">
            <h3 className="section-title">Datos de Contacto</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombreCompleto">
                  Nombre completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombreCompleto"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleInputChange}
                  placeholder="Nombre y Apellido"
                />
                {errors.nombreCompleto && (
                  <div className="error-message">{errors.nombreCompleto}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="correo">
                  Correo electrónico <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  spellCheck="false"
                />
                {errors.correo && (
                  <div className="error-message">{errors.correo}</div>
                )}
                <div className="hint-text">
                  Formato: usuario@dominio.com
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">
                  WhatsApp <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="833..."
                />
                {errors.whatsapp && (
                  <div className="error-message">{errors.whatsapp}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="parentesco">
                  Parentesco <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="parentesco"
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleInputChange}
                  placeholder="Padre, Madre o Tutor"
                />
                {errors.parentesco && (
                  <div className="error-message">{errors.parentesco}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="personasAsistiran">
                  Personas que asistirán al evento <span className="required">*</span>
                </label>
                <select
                  id="personasAsistiran"
                  name="personasAsistiran"
                  value={formData.personasAsistiran}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona cantidad</option>
                  <option value="1">1 persona</option>
                  <option value="2">2 personas</option>
                  <option value="3">3 personas</option>
                  <option value="4">4 personas</option>
                  <option value="5">5 personas</option>
                  <option value="6">6 o más personas</option>
                </select>
                {errors.personasAsistiran && (
                  <div className="error-message">{errors.personasAsistiran}</div>
                )}
              </div>
            </div>
          </div>

          {/* Medio por el cual se enteró */}
          <div className="form-section">
            <h3 className="section-title">MEDIO POR EL CUAL SE ENTERÓ</h3>
            <div className="form-grid">
              <div className="form-group">
                <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="medioEntero"
                        value="redes_sociales"
                        checked={formData.medioEntero === 'redes_sociales'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label">REDES SOCIALES</span>
                    </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="medioEntero"
                      value="informacion_impresa"
                      checked={formData.medioEntero === 'informacion_impresa'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-label">INFORMACIÓN IMPRESA</span>
                  </label>
                  
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="medioEntero"
                      value="otra"
                      checked={formData.medioEntero === 'otra'}
                      onChange={handleInputChange}
                    />
                    <span className="radio-label">OTRA</span>
                  </label>
                </div>
                {errors.medioEntero && (
                  <div className="error-message">{errors.medioEntero}</div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading"></span> Procesando...
              </>
            ) : (
              'Confirmar Asistencia'
            )}
          </button>
        </form>
        
        {/* Copyright */}
        <div className="copyright">
          <p>© 2025 Instituto Winston Churchill.</p>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">✅</div>
              <h2>¡Inscripción Exitosa!</h2>
            </div>
            <div className="modal-body">
              <p>Tu inscripción ha sido registrada correctamente.</p>
              <p>Se ha enviado un email de confirmación a tu correo electrónico con todos los detalles del evento.</p>
              <div className="modal-highlight">
                <p><strong>¡Te esperamos en nuestra Sesión Informativa!</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button"
                onClick={() => setShowModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


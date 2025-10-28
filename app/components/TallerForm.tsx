'use client';

import { useState } from 'react';

export default function TallerForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    puesto: '',
    gradoClase: '',
    institucionProcedencia: '',
    email: '',
    whatsapp: '',
    experienciaIA: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/taller-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          nombre: '',
          apellido: '',
          puesto: '',
          gradoClase: '',
          institucionProcedencia: '',
          email: '',
          whatsapp: '',
          experienciaIA: false
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Error al procesar el registro');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="taller-form-container">
      <style jsx global>{`
        .taller-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          font-family: 'Arial', sans-serif;
        }
        
        .taller-banner {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .form-container {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .form-title {
          text-align: center;
          color: #4a5568;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .form-subtitle {
          text-align: center;
          color: #718096;
          font-size: 16px;
          margin-bottom: 30px;
          font-weight: 500;
        }
        
        .form-section {
          margin-bottom: 25px;
        }
        
        .form-section h3 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #f7fafc;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: #f7fafc;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }
        
        .checkbox-group input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #667eea;
        }
        
        .checkbox-group label {
          margin: 0;
          font-weight: 500;
          color: #2d3748;
          cursor: pointer;
        }
        
        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .status-message {
          margin-top: 20px;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
        }
        
        .status-success {
          background: #c6f6d5;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }
        
        .status-error {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }
        
        @media (max-width: 768px) {
          .taller-form-container {
            padding: 12px;
          }
          
          .form-container {
            padding: 20px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .form-title {
            font-size: 24px;
          }
          
          .form-subtitle {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Banner del Taller - Temporal hasta que proporciones el PNG */}
      <div className="taller-banner" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
          Taller "IA e Inclusión en la Educación Temprana"
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
          Dirigido por la Directora Claudia
        </p>
      </div>

      <div className="form-container">
        <h2 className="form-title">Registro del Taller</h2>
        <p className="form-subtitle">
          Completa el siguiente formulario para participar en el taller
        </p>

        <form onSubmit={handleSubmit}>
          {/* Información Personal */}
          <div className="form-section">
            <h3>👤 Información Personal</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu nombre"
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  placeholder="Tu apellido"
                />
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="form-section">
            <h3>🎓 Información Profesional</h3>
            <div className="form-group">
              <label htmlFor="puesto">Puesto *</label>
              <input
                type="text"
                id="puesto"
                name="puesto"
                value={formData.puesto}
                onChange={handleInputChange}
                required
                placeholder="Ej: Maestra, Coordinadora, Directora"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gradoClase">Grado en el que imparten clase *</label>
              <select
                id="gradoClase"
                name="gradoClase"
                value={formData.gradoClase}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un grado</option>
                <option value="maternal">Maternal</option>
                <option value="kinder1">Kinder 1</option>
                <option value="kinder2">Kinder 2</option>
                <option value="kinder3">Kinder 3</option>
                <option value="primaria1">Primaria 1°</option>
                <option value="primaria2">Primaria 2°</option>
                <option value="primaria3">Primaria 3°</option>
                <option value="primaria4">Primaria 4°</option>
                <option value="primaria5">Primaria 5°</option>
                <option value="primaria6">Primaria 6°</option>
                <option value="secundaria1">Secundaria 1°</option>
                <option value="secundaria2">Secundaria 2°</option>
                <option value="secundaria3">Secundaria 3°</option>
                <option value="administrativo">Personal Administrativo</option>
                <option value="directivo">Personal Directivo</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="institucionProcedencia">Institución Educativa de Procedencia *</label>
              <input
                type="text"
                id="institucionProcedencia"
                name="institucionProcedencia"
                value={formData.institucionProcedencia}
                onChange={handleInputChange}
                required
                placeholder="Nombre de tu institución"
              />
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="form-section">
            <h3>📞 Información de Contacto</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp *</label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  placeholder="8331234567"
                />
              </div>
            </div>
          </div>

          {/* Experiencia con IA */}
          <div className="form-section">
            <h3>🤖 Experiencia con Inteligencia Artificial</h3>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="experienciaIA"
                name="experienciaIA"
                checked={formData.experienciaIA}
                onChange={handleInputChange}
              />
              <label htmlFor="experienciaIA">
                ¿Tienes experiencia con el manejo de herramientas de IA?
              </label>
            </div>
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar Registro'}
          </button>

          {/* Mensajes de Estado */}
          {submitStatus === 'success' && (
            <div className="status-message status-success">
              ✅ ¡Registro exitoso! Te hemos enviado un email de confirmación.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="status-message status-error">
              ❌ {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

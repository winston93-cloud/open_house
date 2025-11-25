'use client';

import React from 'react';
import './styles.css';

export default function GestionAdministrativa() {
  const handleCardClick = (nivel: string) => {
    // Aquí se configurarán los PDFs más adelante
    console.log(`Clic en: ${nivel}`);
    // window.open('/ruta-al-pdf', '_blank');
  };

  return (
    <div className="gestion-container">
      <div className="gestion-content">
        <header className="gestion-header">
          <h1 className="gestion-title">
            Gestión Administrativa
          </h1>
          <div className="title-underline"></div>
        </header>

        <div className="becas-banner">
          <span className="becas-icon">🎓</span>
          <h2 className="becas-title">Becas Winston</h2>
          <span className="becas-icon">🎓</span>
        </div>

        <div className="cards-grid">
          {/* Tarjeta Maternal y Kinder */}
          <div 
            className="admin-card maternal-card"
            onClick={() => handleCardClick('maternal-kinder')}
          >
            <div className="card-icon">🧸</div>
            <h2 className="card-title">Maternal y Kinder</h2>
            <p className="card-description">
              Gestión de alumnos de nivel inicial
            </p>
            <div className="card-footer">
              <span className="card-action">Ver documentos →</span>
            </div>
          </div>

          {/* Tarjeta Primaria */}
          <div 
            className="admin-card primaria-card"
            onClick={() => handleCardClick('primaria')}
          >
            <div className="card-icon">📚</div>
            <h2 className="card-title">Primaria</h2>
            <p className="card-description">
              Gestión de alumnos de nivel primaria
            </p>
            <div className="card-footer">
              <span className="card-action">Ver documentos →</span>
            </div>
          </div>

          {/* Tarjeta Secundaria */}
          <div 
            className="admin-card secundaria-card"
            onClick={() => handleCardClick('secundaria')}
          >
            <div className="card-icon">🎓</div>
            <h2 className="card-title">Secundaria</h2>
            <p className="card-description">
              Gestión de alumnos de nivel secundaria
            </p>
            <div className="card-footer">
              <span className="card-action">Ver documentos →</span>
            </div>
          </div>
        </div>

        <footer className="gestion-footer">
          <p>Colegio Educativo Winston Churchill</p>
        </footer>
      </div>
    </div>
  );
}


-- Tabla para almacenar las inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_aspirante VARCHAR(255) NOT NULL,
    nivel_academico VARCHAR(50) NOT NULL,
    grado_escolar VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nombre_padre VARCHAR(255) NOT NULL,
    nombre_madre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Campos para recordatorios
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_scheduled_for TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_inscripciones_nivel_academico ON inscripciones(nivel_academico);
CREATE INDEX IF NOT EXISTS idx_inscripciones_fecha_inscripcion ON inscripciones(fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_inscripciones_email ON inscripciones(email);
CREATE INDEX IF NOT EXISTS idx_inscripciones_reminder_sent ON inscripciones(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_inscripciones_reminder_scheduled ON inscripciones(reminder_scheduled_for);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_inscripciones_updated_at 
    BEFORE UPDATE ON inscripciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

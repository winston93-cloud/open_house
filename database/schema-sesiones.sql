-- Tabla para Sesiones Informativas
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_aspirante VARCHAR(255) NOT NULL,
    nivel_academico VARCHAR(50) NOT NULL,
    grado_escolar VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20),
    escuela_procedencia VARCHAR(255),
    nombre_padre VARCHAR(255) NOT NULL,
    nombre_madre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    parentesco VARCHAR(50),
    personas_asistiran VARCHAR(20),
    medio_entero VARCHAR(50),
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_scheduled_for TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_inscripcion ON sesiones(fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_sesiones_nivel_academico ON sesiones(nivel_academico);
CREATE INDEX IF NOT EXISTS idx_sesiones_reminder_sent ON sesiones(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_sesiones_email ON sesiones(email);

-- Comentarios en la tabla
COMMENT ON TABLE sesiones IS 'Tabla para almacenar las inscripciones a Sesiones Informativas';
COMMENT ON COLUMN sesiones.reminder_sent IS 'Indica si se ha enviado el recordatorio por email';
COMMENT ON COLUMN sesiones.reminder_scheduled_for IS 'Fecha programada para enviar el recordatorio';


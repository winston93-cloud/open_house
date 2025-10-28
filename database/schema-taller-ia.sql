-- Tabla para el registro del Taller "IA e Inclusión en la Educación Temprana"
CREATE TABLE taller_ia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    grado_clase VARCHAR(50) NOT NULL,
    institucion_procedencia VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    experiencia_ia BOOLEAN NOT NULL DEFAULT false,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_taller_ia_email ON taller_ia(email);
CREATE INDEX idx_taller_ia_fecha_registro ON taller_ia(fecha_registro);
CREATE INDEX idx_taller_ia_institucion ON taller_ia(institucion_procedencia);

-- Comentarios para documentación
COMMENT ON TABLE taller_ia IS 'Registro de participantes del Taller IA e Inclusión en la Educación Temprana';
COMMENT ON COLUMN taller_ia.nombre IS 'Nombre del participante';
COMMENT ON COLUMN taller_ia.apellido IS 'Apellido del participante';
COMMENT ON COLUMN taller_ia.puesto IS 'Puesto o cargo del participante';
COMMENT ON COLUMN taller_ia.grado_clase IS 'Grado en el que imparte clase';
COMMENT ON COLUMN taller_ia.institucion_procedencia IS 'Institución educativa de procedencia';
COMMENT ON COLUMN taller_ia.email IS 'Correo electrónico del participante';
COMMENT ON COLUMN taller_ia.whatsapp IS 'Número de WhatsApp del participante';
COMMENT ON COLUMN taller_ia.experiencia_ia IS '¿Tiene experiencia con herramientas de IA?';
COMMENT ON COLUMN taller_ia.fecha_registro IS 'Fecha de registro en el taller';

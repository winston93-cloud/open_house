-- Agregar campos de confirmación de asistencia a la tabla sesiones
ALTER TABLE sesiones 
ADD COLUMN IF NOT EXISTS confirmacion_asistencia VARCHAR(20),
ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP WITH TIME ZONE;

-- Crear índice para optimizar consultas de confirmación
CREATE INDEX IF NOT EXISTS idx_sesiones_confirmacion ON sesiones(confirmacion_asistencia);

-- Comentarios
COMMENT ON COLUMN sesiones.confirmacion_asistencia IS 'Estado de confirmación de asistencia: confirmado, no_confirmado, o NULL';
COMMENT ON COLUMN sesiones.fecha_confirmacion IS 'Fecha y hora en que se confirmó la asistencia';

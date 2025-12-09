-- Migración: Agregar columna ciclo_escolar a tablas inscripciones y sesiones
-- Fecha: 2025-12-09
-- Propósito: Diferenciar eventos por ciclo escolar (2024-2025, 2025-2026, etc.)

-- 1. Agregar columna a tabla inscripciones
ALTER TABLE inscripciones 
ADD COLUMN IF NOT EXISTS ciclo_escolar VARCHAR(20) DEFAULT '2025';

-- 2. Agregar columna a tabla sesiones
ALTER TABLE sesiones 
ADD COLUMN IF NOT EXISTS ciclo_escolar VARCHAR(20) DEFAULT '2025';

-- 3. Actualizar registros existentes con el año 2025
UPDATE inscripciones 
SET ciclo_escolar = '2025' 
WHERE ciclo_escolar IS NULL;

UPDATE sesiones 
SET ciclo_escolar = '2025' 
WHERE ciclo_escolar IS NULL;

-- 4. Crear índices para mejorar consultas por ciclo
CREATE INDEX IF NOT EXISTS idx_inscripciones_ciclo ON inscripciones(ciclo_escolar);
CREATE INDEX IF NOT EXISTS idx_sesiones_ciclo ON sesiones(ciclo_escolar);

-- 5. Verificación
SELECT 'Inscripciones por ciclo:' as info;
SELECT ciclo_escolar, COUNT(*) as total 
FROM inscripciones 
GROUP BY ciclo_escolar;

SELECT 'Sesiones por ciclo:' as info;
SELECT ciclo_escolar, COUNT(*) as total 
FROM sesiones 
GROUP BY ciclo_escolar;


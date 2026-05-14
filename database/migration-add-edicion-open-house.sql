-- Convocatoria Open House (distingue p. ej. enero 2026 vs junio 2026)
-- Ejecutar en Supabase SQL Editor (o psql) sobre el proyecto activo.

ALTER TABLE public.inscripciones
  ADD COLUMN IF NOT EXISTS edicion_open_house VARCHAR(32);

COMMENT ON COLUMN public.inscripciones.edicion_open_house IS
  'Convocatoria Open House, ej. 2025-dic, 2026-enero, 2026-junio';

CREATE INDEX IF NOT EXISTS idx_inscripciones_edicion_open_house
  ON public.inscripciones (edicion_open_house);

-- Enero 2026: solo ciclo escolar 2026 (no tocar ciclo 2025 = diciembre 2025)
UPDATE public.inscripciones
SET edicion_open_house = '2026-enero'
WHERE edicion_open_house IS NULL
  AND ciclo_escolar = '2026'
  AND reminder_scheduled_for IS NOT NULL
  AND reminder_scheduled_for < TIMESTAMPTZ '2026-06-01 00:00:00+00';

-- Ciclo 2026 inscrito antes de junio 2026 sin reminder (legacy)
UPDATE public.inscripciones
SET edicion_open_house = '2026-enero'
WHERE edicion_open_house IS NULL
  AND ciclo_escolar = '2026'
  AND fecha_inscripcion IS NOT NULL
  AND fecha_inscripcion < TIMESTAMPTZ '2026-06-01 00:00:00+00';

-- Convocatoria Sesiones Informativas (distingue enero 2026 vs junio 2026)
-- Ejecutar en Supabase SQL Editor sobre el proyecto activo.

ALTER TABLE public.sesiones
  ADD COLUMN IF NOT EXISTS edicion_sesiones VARCHAR(32);

COMMENT ON COLUMN public.sesiones.edicion_sesiones IS
  'Convocatoria Sesiones Informativas, ej. 2026-enero, 2026-junio';

CREATE INDEX IF NOT EXISTS idx_sesiones_edicion_sesiones
  ON public.sesiones (edicion_sesiones);

-- Enero 2026: inscripciones del ciclo 2026 antes de junio 2026
UPDATE public.sesiones
SET edicion_sesiones = '2026-enero'
WHERE edicion_sesiones IS NULL
  AND ciclo_escolar = '2026'
  AND reminder_scheduled_for IS NOT NULL
  AND reminder_scheduled_for < TIMESTAMPTZ '2026-06-01 00:00:00+00';

UPDATE public.sesiones
SET edicion_sesiones = '2026-enero'
WHERE edicion_sesiones IS NULL
  AND ciclo_escolar = '2026'
  AND fecha_inscripcion IS NOT NULL
  AND fecha_inscripcion < TIMESTAMPTZ '2026-06-01 00:00:00+00';

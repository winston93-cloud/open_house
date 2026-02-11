-- Correcciones de seguridad (RLS) para Open House
-- Objetivo: evitar errores del linter y mantener formularios funcionando

BEGIN;

-- 1) Habilitar RLS en tablas expuestas
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taller_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kommo_lead_tracking ENABLE ROW LEVEL SECURITY;

-- 2) Políticas mínimas para que los formularios públicos funcionen
--    Nota: los inserts de formularios se aceptan para anon/authenticated
DROP POLICY IF EXISTS public_insert_inscripciones ON public.inscripciones;
CREATE POLICY public_insert_inscripciones
  ON public.inscripciones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS public_insert_sesiones ON public.sesiones;
CREATE POLICY public_insert_sesiones
  ON public.sesiones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS public_insert_taller_ia ON public.taller_ia;
CREATE POLICY public_insert_taller_ia
  ON public.taller_ia
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3) Kommo lead tracking: solo se modifica desde backend (service role)
--    Se deja sin políticas públicas para evitar exposición.

COMMIT;

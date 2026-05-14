-- Corrige datos ya migrados: ciclo_escolar '2025' = Open House diciembre 2025,
-- no deben llevar edicion_open_house '2026-enero' (eso era por el UPDATE sin filtrar ciclo).
-- Ejecutar en Supabase SQL Editor.

UPDATE public.inscripciones
SET edicion_open_house = '2025-dic'
WHERE ciclo_escolar = '2025'
  AND edicion_open_house = '2026-enero';

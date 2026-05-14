-- Ciclo escolar 2025 = Open House diciembre 2025 (no enero 2026).
-- Ejecuta en Supabase SQL Editor (una sola sentencia).

UPDATE public.inscripciones
SET edicion_open_house = '2025-diciembre'
WHERE ciclo_escolar = '2025';

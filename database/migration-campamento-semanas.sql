-- Si ya creaste campamento_verano sin semanas, ejecuta esto en Supabase:

ALTER TABLE public.campamento_verano
  ADD COLUMN IF NOT EXISTS semanas_seleccionadas JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.campamento_verano.semanas_seleccionadas IS
  'IDs de semanas elegidas (ej. 2025-s1, 2025-s2)';

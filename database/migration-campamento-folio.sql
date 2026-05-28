-- Folio de pago para inscripciones al campamento de verano (10 caracteres alfanuméricos)
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.campamento_verano
ADD COLUMN IF NOT EXISTS folio VARCHAR(10);

CREATE UNIQUE INDEX IF NOT EXISTS idx_campamento_verano_folio_unique
  ON public.campamento_verano (folio)
  WHERE folio IS NOT NULL;

COMMENT ON COLUMN public.campamento_verano.folio IS
  'Folio alfanumérico de 10 caracteres (nombre + fecha de nacimiento). Presentar al pagar la inscripción.';

-- Los folios de registros ya existentes se generan desde el admin
-- (botón "Generar folios faltantes" o al enviar correo a seleccionados).

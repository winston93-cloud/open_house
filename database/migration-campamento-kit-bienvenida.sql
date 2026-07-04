-- Kit de bienvenida (opcional, solo plan semanal de 1 semana)
ALTER TABLE public.campamento_verano
  ADD COLUMN IF NOT EXISTS kit_bienvenida BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.campamento_verano.kit_bienvenida IS
  'true si el participante adquirió el kit de bienvenida ($280); solo aplica a plan semanal (1 semana)';

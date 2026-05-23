-- Campamento de verano — Startup Kids Camp / Verano 2025
-- Instituto Educativo Winston
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.campamento_verano (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Participante
    nombre_participante VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad SMALLINT NOT NULL,
    grado_escolar VARCHAR(100) NOT NULL,

    -- Padre / tutor
    nombre_tutor VARCHAR(255) NOT NULL,
    telefono_principal VARCHAR(20) NOT NULL,
    telefono_emergencia VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,

    -- Médico
    tiene_alergias BOOLEAN NOT NULL DEFAULT false,
    alergias_detalle TEXT,

    -- Autorizaciones
    autoriza_primeros_auxilios BOOLEAN NOT NULL DEFAULT false,
    autoriza_fotos BOOLEAN NOT NULL DEFAULT false,
    acepta_reglamento BOOLEAN NOT NULL DEFAULT false,
    fecha_firma DATE NOT NULL,

    -- Plan
    plan_campamento VARCHAR(20) NOT NULL CHECK (plan_campamento IN ('4_semanas', '3_semanas', 'semanal')),
    plan_precio NUMERIC(10, 2) NOT NULL,

    edicion VARCHAR(20) NOT NULL DEFAULT '2025',
    fecha_inscripcion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campamento_verano_email ON public.campamento_verano (email);
CREATE INDEX IF NOT EXISTS idx_campamento_verano_fecha_inscripcion ON public.campamento_verano (fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_campamento_verano_edicion ON public.campamento_verano (edicion);
CREATE INDEX IF NOT EXISTS idx_campamento_verano_plan ON public.campamento_verano (plan_campamento);

COMMENT ON TABLE public.campamento_verano IS 'Inscripciones al campamento de verano Startup Kids Camp (IWC)';
COMMENT ON COLUMN public.campamento_verano.plan_campamento IS '4_semanas | 3_semanas | semanal';

-- Trigger updated_at (usa la misma función que inscripciones si ya existe)
DROP TRIGGER IF EXISTS campamento_verano_updated_at ON public.campamento_verano;
CREATE TRIGGER campamento_verano_updated_at
    BEFORE UPDATE ON public.campamento_verano
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS: solo inserción pública (formulario); lectura/actualización vía service role en admin
ALTER TABLE public.campamento_verano ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_insert_campamento_verano ON public.campamento_verano;
CREATE POLICY public_insert_campamento_verano
    ON public.campamento_verano
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Open House — esquema inicial para InsForge
-- Consolidado desde Supabase producción (Fase 0) + database/*.sql
-- 5 tablas: inscripciones, sesiones, taller_ia, kommo_lead_tracking, campamento_verano

-- =============================================================================
-- Función compartida: updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- inscripciones — Open House
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.inscripciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_aspirante VARCHAR(255) NOT NULL,
    nivel_academico VARCHAR(50) NOT NULL,
    grado_escolar VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nombre_padre VARCHAR(255) NOT NULL,
    nombre_madre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_scheduled_for TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    confirmacion_asistencia VARCHAR(20) DEFAULT 'pendiente',
    fecha_confirmacion TIMESTAMPTZ,
    ciclo_escolar VARCHAR(20) DEFAULT '2025',
    edicion_open_house VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscripciones_nivel_academico ON public.inscripciones (nivel_academico);
CREATE INDEX IF NOT EXISTS idx_inscripciones_fecha_inscripcion ON public.inscripciones (fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_inscripciones_email ON public.inscripciones (email);
CREATE INDEX IF NOT EXISTS idx_inscripciones_reminder_sent ON public.inscripciones (reminder_sent);
CREATE INDEX IF NOT EXISTS idx_inscripciones_reminder_scheduled ON public.inscripciones (reminder_scheduled_for);
CREATE INDEX IF NOT EXISTS idx_inscripciones_confirmacion_asistencia ON public.inscripciones (confirmacion_asistencia);
CREATE INDEX IF NOT EXISTS idx_inscripciones_ciclo ON public.inscripciones (ciclo_escolar);
CREATE INDEX IF NOT EXISTS idx_inscripciones_edicion_open_house ON public.inscripciones (edicion_open_house);

DROP TRIGGER IF EXISTS update_inscripciones_updated_at ON public.inscripciones;
CREATE TRIGGER update_inscripciones_updated_at
    BEFORE UPDATE ON public.inscripciones
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.inscripciones IS 'Inscripciones al Open House del Instituto Winston';
COMMENT ON COLUMN public.inscripciones.edicion_open_house IS 'Convocatoria Open House, ej. 2025-diciembre, 2026-enero, 2026-junio';

-- =============================================================================
-- sesiones — Sesiones informativas
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sesiones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_aspirante VARCHAR(255) NOT NULL,
    nivel_academico VARCHAR(50) NOT NULL,
    grado_escolar VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20),
    escuela_procedencia VARCHAR(255),
    nombre_padre VARCHAR(255) NOT NULL,
    nombre_madre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) DEFAULT '',
    email VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    parentesco VARCHAR(50),
    personas_asistiran VARCHAR(20),
    medio_entero VARCHAR(50),
    fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_scheduled_for TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    confirmacion_asistencia VARCHAR(20),
    fecha_confirmacion TIMESTAMPTZ,
    ciclo_escolar VARCHAR(20) DEFAULT '2025',
    edicion_sesiones VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_inscripcion ON public.sesiones (fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_sesiones_nivel_academico ON public.sesiones (nivel_academico);
CREATE INDEX IF NOT EXISTS idx_sesiones_reminder_sent ON public.sesiones (reminder_sent);
CREATE INDEX IF NOT EXISTS idx_sesiones_email ON public.sesiones (email);
CREATE INDEX IF NOT EXISTS idx_sesiones_confirmacion ON public.sesiones (confirmacion_asistencia);
CREATE INDEX IF NOT EXISTS idx_sesiones_ciclo ON public.sesiones (ciclo_escolar);
CREATE INDEX IF NOT EXISTS idx_sesiones_edicion_sesiones ON public.sesiones (edicion_sesiones);

COMMENT ON TABLE public.sesiones IS 'Inscripciones a Sesiones Informativas';
COMMENT ON COLUMN public.sesiones.edicion_sesiones IS 'Convocatoria Sesiones Informativas, ej. 2026-enero, 2026-junio';

-- =============================================================================
-- taller_ia — Taller IA e Inclusión
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.taller_ia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    grado_clase VARCHAR(50) NOT NULL,
    institucion_procedencia VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    experiencia_ia BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taller_ia_email ON public.taller_ia (email);
CREATE INDEX IF NOT EXISTS idx_taller_ia_fecha_registro ON public.taller_ia (fecha_registro);
CREATE INDEX IF NOT EXISTS idx_taller_ia_institucion ON public.taller_ia (institucion_procedencia);

COMMENT ON TABLE public.taller_ia IS 'Registro de participantes del Taller IA e Inclusión en la Educación Temprana';

-- =============================================================================
-- kommo_lead_tracking — Webhook/cron Kommo + SMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.kommo_lead_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kommo_lead_id BIGINT NOT NULL UNIQUE,
    kommo_contact_id BIGINT,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    plantel VARCHAR(20) NOT NULL,
    last_contact_time TIMESTAMPTZ NOT NULL,
    sms_24h_sent BOOLEAN DEFAULT FALSE,
    sms_24h_sent_at TIMESTAMPTZ,
    sms_24h_tag_added BOOLEAN DEFAULT FALSE,
    sms_48h_sent BOOLEAN DEFAULT FALSE,
    sms_48h_sent_at TIMESTAMPTZ,
    sms_72h_sent BOOLEAN DEFAULT FALSE,
    sms_72h_sent_at TIMESTAMPTZ,
    pipeline_id BIGINT,
    status_id BIGINT,
    responsible_user_id BIGINT,
    lead_status VARCHAR(50) DEFAULT 'active',
    last_webhook_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kommo_lead_id ON public.kommo_lead_tracking (kommo_lead_id);
CREATE INDEX IF NOT EXISTS idx_last_contact_time ON public.kommo_lead_tracking (last_contact_time);
CREATE INDEX IF NOT EXISTS idx_sms_24h_sent ON public.kommo_lead_tracking (sms_24h_sent);
CREATE INDEX IF NOT EXISTS idx_sms_48h_sent ON public.kommo_lead_tracking (sms_48h_sent);
CREATE INDEX IF NOT EXISTS idx_sms_72h_sent ON public.kommo_lead_tracking (sms_72h_sent);
CREATE INDEX IF NOT EXISTS idx_lead_status ON public.kommo_lead_tracking (lead_status);
CREATE INDEX IF NOT EXISTS idx_plantel ON public.kommo_lead_tracking (plantel);

CREATE INDEX IF NOT EXISTS idx_pending_sms
    ON public.kommo_lead_tracking (last_contact_time, sms_24h_sent, lead_status)
    WHERE sms_24h_sent = FALSE AND lead_status = 'active';

DROP TRIGGER IF EXISTS update_kommo_tracking_updated_at ON public.kommo_lead_tracking;
CREATE TRIGGER update_kommo_tracking_updated_at
    BEFORE UPDATE ON public.kommo_lead_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.kommo_lead_tracking IS 'Trackea leads de Kommo para detectar inactividad y enviar SMS/emails';
COMMENT ON COLUMN public.kommo_lead_tracking.sms_72h_sent IS 'Reutilizado para marcar envío del SMS de 5 días';

-- =============================================================================
-- campamento_verano — Startup Kids Camp
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.campamento_verano (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_participante VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad SMALLINT NOT NULL,
    grado_escolar VARCHAR(100) NOT NULL,
    nombre_tutor VARCHAR(255) NOT NULL,
    telefono_principal VARCHAR(20) NOT NULL,
    telefono_emergencia VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tiene_alergias BOOLEAN NOT NULL DEFAULT FALSE,
    alergias_detalle TEXT,
    autoriza_primeros_auxilios BOOLEAN NOT NULL DEFAULT FALSE,
    autoriza_fotos BOOLEAN NOT NULL DEFAULT FALSE,
    acepta_reglamento BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_firma DATE NOT NULL,
    plan_campamento VARCHAR(20) NOT NULL CHECK (plan_campamento IN ('4_semanas', '3_semanas', 'semanal')),
    plan_precio NUMERIC(10, 2) NOT NULL,
    semanas_seleccionadas JSONB NOT NULL DEFAULT '[]'::jsonb,
    folio VARCHAR(10),
    edicion VARCHAR(20) NOT NULL DEFAULT '2025',
    fecha_inscripcion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campamento_verano_email ON public.campamento_verano (email);
CREATE INDEX IF NOT EXISTS idx_campamento_verano_fecha_inscripcion ON public.campamento_verano (fecha_inscripcion);
CREATE INDEX IF NOT EXISTS idx_campamento_verano_edicion ON public.campamento_verano (edicion);
CREATE INDEX IF NOT EXISTS idx_campamento_verano_plan ON public.campamento_verano (plan_campamento);

CREATE UNIQUE INDEX IF NOT EXISTS idx_campamento_verano_folio_unique
    ON public.campamento_verano (folio)
    WHERE folio IS NOT NULL;

DROP TRIGGER IF EXISTS campamento_verano_updated_at ON public.campamento_verano;
CREATE TRIGGER campamento_verano_updated_at
    BEFORE UPDATE ON public.campamento_verano
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.campamento_verano IS 'Inscripciones al campamento de verano Startup Kids Camp (IWC)';
COMMENT ON COLUMN public.campamento_verano.folio IS 'Folio alfanumérico de 10 caracteres; presentar al pagar la inscripción';

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taller_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kommo_lead_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campamento_verano ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS public_insert_campamento_verano ON public.campamento_verano;
CREATE POLICY public_insert_campamento_verano
    ON public.campamento_verano
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- kommo_lead_tracking: sin políticas públicas; acceso vía API key (admin) en server

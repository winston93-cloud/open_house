-- Tabla para trackear comunicaciones con leads de Kommo
-- Detecta cuando un lead supera las 24h sin comunicación para enviar SMS

CREATE TABLE IF NOT EXISTS kommo_lead_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kommo_lead_id BIGINT NOT NULL UNIQUE, -- ID del lead en Kommo
    kommo_contact_id BIGINT, -- ID del contacto en Kommo
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    plantel VARCHAR(20) NOT NULL, -- 'winston' o 'educativo'
    
    -- Timestamps de comunicación
    last_contact_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Control de SMS enviados
    sms_24h_sent BOOLEAN DEFAULT FALSE,
    sms_24h_sent_at TIMESTAMP WITH TIME ZONE,
    sms_24h_tag_added BOOLEAN DEFAULT FALSE, -- Control para evitar duplicados
    
    -- Metadata del lead
    pipeline_id BIGINT,
    status_id BIGINT,
    responsible_user_id BIGINT,
    lead_status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed_won', 'closed_lost'
    
    -- Para debug
    last_webhook_payload JSONB
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_kommo_lead_id ON kommo_lead_tracking(kommo_lead_id);
CREATE INDEX IF NOT EXISTS idx_last_contact_time ON kommo_lead_tracking(last_contact_time);
CREATE INDEX IF NOT EXISTS idx_sms_24h_sent ON kommo_lead_tracking(sms_24h_sent);
CREATE INDEX IF NOT EXISTS idx_lead_status ON kommo_lead_tracking(lead_status);
CREATE INDEX IF NOT EXISTS idx_plantel ON kommo_lead_tracking(plantel);

-- Índice compuesto para búsqueda de leads sin SMS después de 24h
CREATE INDEX IF NOT EXISTS idx_pending_sms 
ON kommo_lead_tracking(last_contact_time, sms_24h_sent, lead_status)
WHERE sms_24h_sent = FALSE AND lead_status = 'active';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_kommo_tracking_updated_at 
    BEFORE UPDATE ON kommo_lead_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE kommo_lead_tracking IS 'Trackea leads de Kommo para detectar 24h sin comunicación y enviar SMS';
COMMENT ON COLUMN kommo_lead_tracking.last_contact_time IS 'Última actividad: nota, mensaje, actualización de status';
COMMENT ON COLUMN kommo_lead_tracking.sms_24h_sent IS 'TRUE si ya se envió SMS de 24h';
COMMENT ON COLUMN kommo_lead_tracking.sms_24h_tag_added IS 'TRUE si ya se añadió tag en Kommo para evitar duplicados';


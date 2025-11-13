-- Reset del lead de prueba para que se envíe mañana a las 10:00 AM
UPDATE kommo_lead_tracking
SET 
  last_contact_time = '2025-11-12 16:00:00+00'::timestamptz,  -- 10:00 AM México del 12 nov
  sms_24h_sent = false,
  sms_24h_sent_at = NULL,
  sms_24h_tag_added = false,
  sms_48h_sent = false,
  sms_48h_sent_at = NULL,
  sms_72h_sent = false,
  sms_72h_sent_at = NULL,
  updated_at = NOW()
WHERE kommo_lead_id = 35955903;

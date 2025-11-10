# Configuración del Sistema de SMS Automáticos (Ventana 24h)

## 📋 Resumen

Este sistema envía automáticamente SMS a leads de Kommo que han pasado más de 24 horas sin comunicación. Es completamente automático y no requiere intervención humana.

## 🎯 Cómo funciona

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO AUTOMÁTICO                              │
└─────────────────────────────────────────────────────────────────┘

1. Usuario llena formulario Open House/Sesiones
   ↓
2. Se crea lead en Kommo + registro en kommo_lead_tracking
   ↓
3. Kommo envía webhooks cuando hay actividad (update, nota, mensaje)
   ↓
4. Webhook recibido → Se actualiza last_contact_time del lead
   ↓
5. ADEMÁS: Se revisan TODOS los leads en la BD
   ↓
6. ¿Lead con >24h sin contacto? → Enviar SMS automático
   ↓
7. Marcar lead: sms_24h_sent = true
   ↓
8. Añadir tag "SMS-24h-Enviado" en Kommo
```

## 🚀 Pasos de Configuración

### Paso 1: Crear tabla en Supabase

Ejecuta el siguiente SQL en tu proyecto de Supabase:

```sql
-- Copiar y ejecutar: database/schema-kommo-tracking.sql
CREATE TABLE IF NOT EXISTS kommo_lead_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kommo_lead_id BIGINT NOT NULL UNIQUE,
    kommo_contact_id BIGINT,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    plantel VARCHAR(20) NOT NULL,
    
    last_contact_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    sms_24h_sent BOOLEAN DEFAULT FALSE,
    sms_24h_sent_at TIMESTAMP WITH TIME ZONE,
    sms_24h_tag_added BOOLEAN DEFAULT FALSE,
    
    pipeline_id BIGINT,
    status_id BIGINT,
    responsible_user_id BIGINT,
    lead_status VARCHAR(50) DEFAULT 'active',
    
    last_webhook_payload JSONB
);

-- Índices
CREATE INDEX idx_kommo_lead_id ON kommo_lead_tracking(kommo_lead_id);
CREATE INDEX idx_last_contact_time ON kommo_lead_tracking(last_contact_time);
CREATE INDEX idx_sms_24h_sent ON kommo_lead_tracking(sms_24h_sent);
CREATE INDEX idx_lead_status ON kommo_lead_tracking(lead_status);
CREATE INDEX idx_pending_sms ON kommo_lead_tracking(last_contact_time, sms_24h_sent, lead_status)
WHERE sms_24h_sent = FALSE AND lead_status = 'active';
```

### Paso 2: Configurar Webhook en Kommo

1. **Ir a Kommo:**
   - https://winstonchurchill.kommo.com
   - Login con tu cuenta

2. **Navegar a configuración:**
   - Click en el ícono de configuración (⚙️) arriba a la derecha
   - Seleccionar **API**
   - Click en **Webhooks**

3. **Añadir nuevo webhook:**
   - Click en **Add webhook**
   - Configurar:
     - **URL**: `https://open-house-chi.vercel.app/api/kommo/webhook`
     - **Events to subscribe**:
       - ✅ `lead_added` (cuando se crea un lead)
       - ✅ `lead_updated` (cuando se actualiza un lead)
       - ✅ `lead_status_changed` (cuando cambia el status)
       - ✅ `note_added` (opcional - cuando se añade una nota)
     - **Active**: ✅ Yes

4. **Guardar y verificar:**
   - Click en **Save**
   - Verificar que el webhook aparece como **Active** (verde)

### Paso 3: Verificar Variables de Entorno

Asegúrate de tener configuradas en Vercel (o `.env.local` para desarrollo):

```bash
# SMS Gateway
SMS_GATEWAY_URL=https://api.smsmobileapi.com/sendsms/
SMS_GATEWAY_TOKEN=tu_api_key_aqui

# Kommo
KOMMO_CLIENT_ID=fd378cbf-e7a0-494a-bb98-303e15c621aa
KOMMO_CLIENT_SECRET=p8n7DWLGmjOnTDqtPGjt1ydDr1F93aDMaAAa3Res3G9ZayP762p4RAm9LmuVvrPH

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key

# Base URL (para llamadas internas)
NEXT_PUBLIC_BASE_URL=https://open-house-chi.vercel.app
```

### Paso 4: Deploy a Vercel

```bash
git add .
git commit -m "feat: Sistema automático de SMS para leads con >24h sin comunicación"
git push
```

Vercel desplegará automáticamente.

## 🧪 Probar el Sistema

### Prueba 1: Crear lead y verificar registro

1. Llena el formulario de Open House
2. Verifica en Supabase que se creó el registro en `kommo_lead_tracking`
3. Verifica en Kommo que se creó el lead

### Prueba 2: Simular webhook (manual)

Puedes hacer una petición POST manual al webhook para probarlo:

```bash
curl -X POST https://open-house-chi.vercel.app/api/kommo/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "leads": {
      "update": [{
        "id": 123456,
        "pipeline_id": 5030645,
        "status_id": 56296556
      }]
    }
  }'
```

### Prueba 3: Simular lead con >24h (para testing)

Puedes modificar manualmente un registro en Supabase para probar:

```sql
-- Hacer que un lead aparezca como si tuviera >24h sin contacto
UPDATE kommo_lead_tracking
SET last_contact_time = NOW() - INTERVAL '25 hours',
    sms_24h_sent = false
WHERE kommo_lead_id = 12345678; -- Reemplazar con un ID real

-- Luego dispara el webhook manualmente (ver Prueba 2)
-- El sistema debería detectar este lead y enviar SMS
```

## 📊 Monitoreo

### Verificar leads pendientes de SMS

```sql
-- Ver leads que tienen >24h y aún no tienen SMS enviado
SELECT 
  nombre,
  telefono,
  plantel,
  last_contact_time,
  NOW() - last_contact_time as tiempo_sin_contacto,
  sms_24h_sent
FROM kommo_lead_tracking
WHERE 
  last_contact_time < NOW() - INTERVAL '24 hours'
  AND sms_24h_sent = false
  AND lead_status = 'active'
ORDER BY last_contact_time ASC;
```

### Ver estadísticas de SMS enviados

```sql
-- Contar SMS enviados por plantel
SELECT 
  plantel,
  COUNT(*) as total_sms_enviados,
  COUNT(*) FILTER (WHERE sms_24h_sent_at > NOW() - INTERVAL '7 days') as ultimos_7_dias
FROM kommo_lead_tracking
WHERE sms_24h_sent = true
GROUP BY plantel;
```

### Ver logs en Vercel

1. Ve a Vercel Dashboard
2. Selecciona el proyecto `open-house`
3. Click en **Logs** o **Functions**
4. Busca logs de `/api/kommo/webhook`
5. Verás mensajes como:
   - `🔔 Webhook recibido de Kommo`
   - `🔍 Revisando leads con >24h sin comunicación`
   - `📱 Encontrados X leads pendientes de SMS`
   - `✅ SMS enviado exitosamente`

## 🔍 Troubleshooting

### El webhook no se está llamando

1. Verifica que el webhook esté activo en Kommo
2. Verifica que la URL sea correcta: `https://open-house-chi.vercel.app/api/kommo/webhook`
3. Prueba hacer una actualización manual en un lead de Kommo
4. Revisa logs en Vercel

### Los SMS no se están enviando

1. Verifica que `SMS_GATEWAY_URL` y `SMS_GATEWAY_TOKEN` estén configurados
2. Verifica que el teléfono Android con SMS Mobile API esté encendido y con internet
3. Revisa los logs del webhook - busca errores en `sendSMS24hNotification`
4. Verifica que los números de teléfono estén en formato correcto

### El tag "SMS-24h-Enviado" no aparece en Kommo

1. Verifica que el token de Kommo tenga permisos para modificar leads
2. Revisa logs - busca errores en `addTagToKommoLead`
3. El sistema marca `sms_24h_sent = true` incluso si el tag falla (no es crítico)

## 📝 Mantenimiento

### Limpiar leads antiguos (opcional)

Si quieres limpiar leads muy antiguos de la tabla de tracking:

```sql
-- Eliminar leads cerrados de hace más de 3 meses
DELETE FROM kommo_lead_tracking
WHERE lead_status IN ('closed_won', 'closed_lost')
  AND updated_at < NOW() - INTERVAL '3 months';
```

### Resetear SMS enviado (para re-testing)

```sql
-- Resetear flags de SMS para un lead específico
UPDATE kommo_lead_tracking
SET 
  sms_24h_sent = false,
  sms_24h_sent_at = NULL,
  sms_24h_tag_added = false
WHERE kommo_lead_id = 12345678;
```

## ✅ Checklist de Configuración Completa

- [ ] Tabla `kommo_lead_tracking` creada en Supabase
- [ ] Webhook configurado en Kommo apuntando a `/api/kommo/webhook`
- [ ] Eventos suscritos: lead_added, lead_updated, lead_status_changed
- [ ] Variables de entorno configuradas en Vercel
- [ ] SMS Mobile API funcionando en teléfono Android
- [ ] Deploy realizado exitosamente
- [ ] Prueba creando un lead nuevo - se registra en tracking
- [ ] Prueba simulando lead >24h - se envía SMS
- [ ] Tag "SMS-24h-Enviado" aparece en Kommo

## 🎉 ¡Listo!

El sistema ahora está completamente automatizado. Cada vez que un lead de Kommo pase 24 horas sin comunicación, recibirá automáticamente un SMS de seguimiento.

**Sin intervención humana. Sin cron jobs adicionales. Completamente automático.**


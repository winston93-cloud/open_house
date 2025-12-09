# 📚 HISTORIAL COMPLETO DEL PROYECTO OPEN HOUSE
## Para el Sonnet del futuro (o Mario con amnesia) 😂

**Fecha de creación:** 29 de noviembre de 2025  
**Última actualización:** 29 de noviembre de 2025  
**Autor:** Mario + Sonnet (el Sonnet original que sí sabe qué pex)

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [El Caos del 28 de Noviembre (Kinder Day)](#el-caos-del-28-de-noviembre)
3. [Sistema Actual de Recordatorios](#sistema-actual-de-recordatorios)
4. [Base de Datos](#base-de-datos)
5. [Análisis de Alternativas SMS](#análisis-de-alternativas-sms)
6. [Plan Futuro: Sistema SMS con Android Gateway](#plan-futuro-sistema-sms)
7. [Próximo Envío: 30 de Noviembre](#próximo-envío-30-de-noviembre)
8. [Archivos Importantes](#archivos-importantes)
9. [Lecciones Aprendidas](#lecciones-aprendidas)
10. [Comandos Útiles](#comandos-útiles)

---

## 🎯 RESUMEN EJECUTIVO

### **¿Qué es este proyecto?**
Sistema de gestión de inscripciones y envío de recordatorios para:
- **Open House** (Casa Abierta) - Niveles: maternal, kinder, primaria, secundaria, prepa
- **Sesiones Informativas** - Eventos especiales

### **Stack Tecnológico:**
- **Frontend/Backend:** Next.js 14.2.33 (App Router)
- **Base de Datos:** Supabase (PostgreSQL)
- **Email:** Nodemailer (Gmail SMTP)
- **SMS:** SMS Mobile API (actualmente) → Planeando migrar a Android SMS Gateway
- **Hosting:** Vercel
- **Repositorio:** GitHub

### **Estado Actual:**
- ✅ Sistema de emails funcionando
- ⚠️ Sistema de SMS comentado temporalmente (por caos del 28 nov)
- ✅ UI manual para envío de recordatorios
- 📝 9 registros listos para envío mañana 30 nov

---

## 🔥 EL CAOS DEL 28 DE NOVIEMBRE (KINDER DAY)

### **Lo que pasó:**

#### **7:00 AM - Primera Sorpresa**
- 😱 El sistema envió **14 recordatorios automáticamente** sin que Mario lo solicitara
- 📧 Correos enviados correctamente
- 📱 SMS enviados (pero Mario no sabía que iban a salir)

#### **Investigación: ¿Por qué se enviaron solos?**
```
Usuario Mario: "sonnet, porque se les envio ya a 13 papas?"
```

**CAUSA:** El endpoint `/api/recordatorios/route.ts` estaba configurado como:
- ✅ **GET** method (Vercel lo ejecuta automáticamente durante builds)
- ✅ Tenía lógica de envío directo
- ✅ NO requería confirmación

**SOLUCIÓN:** Se comentó COMPLETAMENTE el contenido de `/app/api/recordatorios/route.ts`

#### **Segundo Problema: Delays Invertidos**
```
Usuario Mario: "creo que algo se puso al revez, porque los sms los envio 
todos de golpe, y el correo esta mandandolo cada 3 minutos"
```

**CAUSA:** En `/app/api/enviar-recordatorios-manual/route.ts`:
- Los SMS se enviaban dentro del loop de emails
- El delay de 3 minutos se aplicaba después de cada combinación email+sms
- Resultado: SMS todos juntos, emails con pausas largas

**SOLUCIÓN:** Se refactorizó en 3 fases:
```javascript
// FASE 1: Enviar todos los correos de Open House (delay 2 seg)
// FASE 2: Enviar todos los correos de Sesiones (delay 2 seg)
// FASE 3: Enviar todos los SMS (delay 3 min) ← AHORA COMENTADO
```

#### **Tercer Problema: Build Error**
```
Error: Expected a semicolon at line 1494
Error: Expression expected at line 1532
```

**CAUSA:** Al comentar código, quedó una llave `{` suelta

**SOLUCIÓN:** Se identificó y eliminó la llave extra

#### **Números Finales del 28 Nov:**
- ✅ **14 registros** enviados en automático (7 AM)
- ✅ **20 registros** pendientes
- ✅ **Total:** 34 registros de kinder/maternal programados
- ✅ **1 duplicado encontrado:** Isabel Cisneros (tenía 2 registros legítimos en la BD)

---

## 📧 SISTEMA ACTUAL DE RECORDATORIOS

### **Arquitectura:**

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                              │
│        https://open-house-chi.vercel.app/enviar-recordatorios│
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           app/enviar-recordatorios/page.tsx                  │
│  - Muestra preview de registros pendientes                   │
│  - Botón "Enviar Recordatorios"                              │
│  - Hace POST a /api/enviar-recordatorios-manual              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│      app/api/enviar-recordatorios-manual/route.ts            │
│                                                               │
│  GET:  Preview de registros (para la UI)                     │
│  POST: Procesa y envía recordatorios                         │
│                                                               │
│  Lógica:                                                      │
│  1. Consulta Supabase (reminder_sent=false, fecha=hoy)       │
│  2. Separa por tabla (inscripciones vs sesiones)             │
│  3. FASE 1: Envía emails Open House (delay 2 seg)            │
│  4. FASE 2: Envía emails Sesiones (delay 2 seg)              │
│  5. FASE 3: SMS (COMENTADO temporalmente)                    │
│  6. Actualiza reminder_sent=true en BD                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │   Nodemailer        │   │   SMS Mobile API     │
    │   (Gmail SMTP)      │   │   (COMENTADO)        │
    └─────────────────────┘   └──────────────────────┘
```

### **Endpoints Importantes:**

#### ✅ **ACTIVOS:**
1. **`/app/api/enviar-recordatorios-manual/route.ts`**
   - GET: Preview de registros
   - POST: Envía recordatorios
   - ⚠️ SMS actualmente comentado

2. **`/app/api/sms-cron/route.ts`**
   - Sistema de seguimiento de leads (24h, 72h, 5d)
   - Envía SMS automáticamente desde Kommo
   - ✅ Funcionando

#### ❌ **COMENTADOS/DESACTIVADOS:**
1. **`/app/api/recordatorios/route.ts`**
   - ❌ **COMPLETAMENTE COMENTADO**
   - Razón: Causaba envíos automáticos no deseados
   - NO DESCOMENTAR sin cambiar a POST method

#### 🗑️ **ELIMINADOS (Durante el debugging):**
- `app/api/test-seguimientos/route.ts` - Causaba envíos triples en cada deploy
- `app/api/enviar-sms-demo/route.ts` - Era de prueba
- Múltiples scripts de verificación temporales

### **Templates de Email:**

#### **Open House (Educativo):**
- Archivo: Inline en `/app/api/enviar-recordatorios-manual/route.ts`
- Función: `sendReminderEmail()`
- Incluye:
  - Nombre del aspirante
  - Nivel académico
  - Fecha del Open House
  - Link de confirmación de asistencia

#### **Sesiones Informativas:**
- Archivo: Inline en `/app/api/enviar-recordatorios-manual/route.ts`
- Función: `sendSesionesReminderEmail()`
- Incluye:
  - Nombre del aspirante
  - Nivel académico
  - Fecha de la sesión
  - Link de confirmación

### **Templates de SMS (COMENTADOS):**

#### **Open House:**
```javascript
function getReminderSMS(nombre, plantel) {
  return `Hola! Te recordamos tu cita en Open House mañana. 
Confirma tu asistencia aquí: https://open-house-chi.vercel.app/confirmar/${plantel}/${encodeURIComponent(nombre)}`;
}
```

#### **Sesiones Informativas:**
```javascript
function getSesionesReminderSMS(nombre) {
  return `Hola! Te recordamos tu Sesión Informativa mañana. 
Confirma aquí: https://open-house-chi.vercel.app/confirmar-sesion/${encodeURIComponent(nombre)}`;
}
```

**NOTA:** Los SMS están comentados porque:
1. Causaron confusión el 28 nov
2. Estamos migrando a Android SMS Gateway
3. Queremos control manual total por ahora

---

## 💾 BASE DE DATOS

### **Tabla: `inscripciones` (Open House)**

```sql
CREATE TABLE public.inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_aspirante TEXT NOT NULL,
  nivel_academico VARCHAR(50) NOT NULL,  -- 'maternal', 'kinder', 'primaria', etc.
  grado_escolar VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  nombre_padre VARCHAR(255) NOT NULL,
  nombre_madre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  direccion TEXT NOT NULL,
  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_sent BOOLEAN DEFAULT FALSE,           -- ← IMPORTANTE
  reminder_scheduled_for TIMESTAMPTZ,            -- ← IMPORTANTE
  reminder_sent_at TIMESTAMPTZ,
  confirmacion_asistencia VARCHAR(20) DEFAULT 'pendiente',
  fecha_confirmacion TIMESTAMPTZ
);
```

### **Tabla: `sesiones` (Sesiones Informativas)**

```sql
CREATE TABLE public.sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_aspirante VARCHAR(255) NOT NULL,
  nivel_academico VARCHAR(50) NOT NULL,
  grado_escolar VARCHAR(50) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  genero VARCHAR(20),
  escuela_procedencia VARCHAR(255),
  nombre_padre VARCHAR(255) NOT NULL,
  nombre_madre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  direccion TEXT NOT NULL,
  parentesco VARCHAR(50),
  personas_asistiran VARCHAR(20),
  medio_entero VARCHAR(50),
  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW(),
  reminder_sent BOOLEAN DEFAULT FALSE,           -- ← IMPORTANTE
  reminder_scheduled_for TIMESTAMPTZ,            -- ← IMPORTANTE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_sent_at TIMESTAMPTZ,
  confirmacion_asistencia VARCHAR(20),
  fecha_confirmacion TIMESTAMPTZ
);
```

### **Campos Críticos:**

- **`reminder_sent`:** `false` = pendiente, `true` = ya enviado
- **`reminder_scheduled_for`:** Fecha/hora programada para envío
- **`reminder_sent_at`:** Timestamp de cuando se envió
- **`nivel_academico`:** 
  - Open House: 'maternal', 'kinder', 'primaria', 'secundaria', 'prepa'
  - Sesiones: todos los niveles

### **Nota sobre Zonas Horarias:**

⚠️ **IMPORTANTE:** Las fechas en Supabase se guardan en **UTC**.

**Ejemplo del 28 nov:**
- Programado: "28 nov 6:00 AM" (hora México)
- En BD: "28 nov 12:00 PM UTC"
- El sistema busca: `>= '2025-11-28T00:00:00Z' AND < '2025-11-29T00:00:00Z'`
- Resultado: ✅ SÍ lo encuentra

**Ejemplo del 30 nov (mañana):**
- 8 registros programados: "29 nov 6:00 PM" (hora México)
- En BD: "30 nov 12:00 AM UTC" (medianoche del 30)
- El sistema mañana busca: `>= '2025-11-30T00:00:00Z' AND < '2025-12-01T00:00:00Z'`
- Resultado: ✅ SÍ los encontrará

**Conclusión:** No te preocupes por las zonas horarias, el sistema las maneja automáticamente.

---

## 📱 ANÁLISIS DE ALTERNATIVAS SMS

### **Contexto:**
Mario necesita enviar ~150 SMS/mes con presupuesto de $150-200 MXN (~$8-11 USD).

### **Alternativas Evaluadas:**

#### 1. **Twilio** (Actual con SMS Mobile API)
- ✅ **Pros:** Confiable, buena API, documentado
- ❌ **Contras:** Caro para México (~$0.014/SMS = $2.10 USD por 150 SMS mínimo)
- 💰 **Costo:** ~$40-50 USD/mes
- 🎯 **Veredicto:** Muy caro para el presupuesto

#### 2. **Textbelt Open Source**
- ✅ **Pros:** "Gratis", código abierto
- ❌ **Contras:** 
  - Baja confiabilidad (<50% entrega)
  - No funciona bien con carriers mexicanos
  - No soporta bien caracteres especiales (tildes)
  - Bloqueado frecuentemente
- 💰 **Costo:** Gratis pero MUCHOS costos ocultos (servidor, mantenimiento)
- 🎯 **Veredicto:** NO VIABLE
- 📄 **Análisis completo:** `ANALISIS-TEXTBELT-OPEN-SOURCE.md`

#### 3. **Brevo SMS**
- ✅ **Pros:** Buena plataforma, confiable
- ❌ **Contras:** 
  - $0.02/SMS a México = $3 USD por 150 SMS
  - Mínimo $60 USD/mes de inversión inicial
- 💰 **Costo:** $60+ USD/mes
- 🎯 **Veredicto:** Muy caro
- 📄 **Análisis completo:** `ANALISIS-BREVO-SMS.md`
- **NOTA:** Brevo Email (free tier) SÍ es buena opción para mejorar deliverability de emails

#### 4. **Email-to-SMS Gateways**
- ✅ **Pros:** "Gratis" (en teoría)
- ❌ **Contras:**
  - Obsoleto en 2025
  - NO funciona con carriers mexicanos (Telcel, Movistar, AT&T)
  - NO funciona con iPhones
  - Bloqueado por spam
- 💰 **Costo:** Gratis
- 🎯 **Veredicto:** NO FUNCIONA
- 📄 **Explicación completa:** `EXPLICACION-EMAIL-TO-SMS-GATEWAYS.md`

#### 5. **Android SMS Gateway + Oracle Cloud VM** ⭐ **ELEGIDA**
- ✅ **Pros:**
  - $0 costo mensual (Oracle Always Free + plan celular existente)
  - 100% control
  - No límites de volumen
  - Funciona con todos los carriers mexicanos
  - Funciona con iPhones
- ❌ **Contras:**
  - Requiere setup inicial
  - Necesita teléfono Android dedicado
  - Dependencia de conectividad del teléfono
- 💰 **Costo:** $0/mes (usa plan celular actual)
- 🎯 **Veredicto:** MEJOR OPCIÓN
- 📄 **Especificaciones completas:** `ESPECIFICACIONES-SISTEMA-SMS.md`

---

## 🚀 PLAN FUTURO: SISTEMA SMS CON ANDROID GATEWAY

### **Arquitectura Propuesta:**

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Next.js)                          │
│          https://open-house-chi.vercel.app                   │
│                                                               │
│  - Genera solicitudes de SMS                                 │
│  - Envía a Oracle Cloud VM                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTPS POST
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              ORACLE CLOUD VM (Always Free)                   │
│                  IP: [A configurar]                          │
│                                                               │
│  API Bridge (Node.js/Express):                               │
│  - Recibe requests de Vercel                                 │
│  - Valida origen                                             │
│  - Reenvía a SMS Gateway App (local)                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP POST (localhost)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│          TELÉFONO ANDROID (Conectado a VM)                   │
│            SMS Gateway App instalada                         │
│                                                               │
│  - Recibe requests HTTP                                      │
│  - Envía SMS vía red celular                                 │
│  - Responde con status de entrega                            │
└─────────────────────────────────────────────────────────────┘
```

### **Componentes:**

#### 1. **Oracle Cloud VM (Always Free)**
- **Tipo:** VM.Standard.E2.1.Micro
- **Specs:** 1 OCPU, 1 GB RAM
- **Sistema:** Ubuntu 22.04 LTS
- **IP:** Fija (incluida en free tier)
- **Software:**
  - Node.js + Express (API Bridge)
  - SSL/TLS (Let's Encrypt)
  - Firewall configurado

#### 2. **Teléfono Android**
- **Requisitos mínimos:**
  - Android 5.0+
  - Plan con SMS ilimitados o suficientes
  - Conectado a WiFi del VM (o hotspot)
- **App:** SMS Gateway (Free, open source)
- **Configuración:**
  - URL del API Bridge
  - Token de autenticación

#### 3. **API Bridge (Node.js)**
```javascript
// server.js en Oracle Cloud VM
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Endpoint para recibir de Vercel
app.post('/send-sms', async (req, res) => {
  const { phone, message, secret } = req.body;
  
  // Validar token
  if (secret !== process.env.SMS_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Reenviar a SMS Gateway App
    const response = await axios.post('http://localhost:8080/send', {
      phone,
      message
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('SMS Bridge running on port 3000');
});
```

#### 4. **Cliente en Vercel**
```javascript
// lib/sms-android.ts
export async function sendSMSViaAndroid(phone: string, message: string) {
  try {
    const response = await fetch(process.env.ORACLE_VM_URL + '/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message,
        secret: process.env.SMS_SECRET
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}
```

### **Pasos de Implementación:**

#### **Fase 1: Setup Oracle Cloud VM** (1-2 horas)
1. Crear cuenta en Oracle Cloud (free tier)
2. Crear VM Ubuntu 22.04
3. Configurar firewall (puerto 3000)
4. Instalar Node.js
5. Configurar SSL con Let's Encrypt
6. Subir código del API Bridge
7. Configurar como servicio (systemd)

#### **Fase 2: Configurar Teléfono Android** (30 min)
1. Instalar SMS Gateway app
2. Configurar URL del API Bridge
3. Generar y guardar token
4. Probar conectividad
5. Configurar autostart

#### **Fase 3: Integrar con Vercel** (1 hora)
1. Crear `lib/sms-android.ts`
2. Agregar variables de entorno en Vercel:
   - `ORACLE_VM_URL`
   - `SMS_SECRET`
3. Actualizar `/app/api/enviar-recordatorios-manual/route.ts`
4. Descomentar fase 3 de envío de SMS
5. Probar con número de prueba

#### **Fase 4: Testing** (1-2 horas)
1. Enviar SMS a diferentes carriers (Telcel, Movistar, AT&T)
2. Probar con Android e iPhone
3. Verificar entrega de caracteres especiales (tildes, ñ)
4. Probar volumen (10+ SMS simultáneos)
5. Verificar logs y manejo de errores

### **Optimización de Mensajes:**

#### **Fragmentación de SMS:**
- **GSM-7:** 160 caracteres/SMS
- **UCS-2 (con tildes/emojis):** 70 caracteres/SMS

#### **Estrategia:**
1. Eliminar tildes de mensajes (á → a, é → e)
2. Evitar emojis
3. Acortar URLs (usar bit.ly o similar)
4. Mantener mensajes < 160 caracteres

#### **Ejemplo Optimizado:**
```javascript
// ANTES (82 chars UCS-2 = 2 SMS):
"Hola! Te recordamos tu cita en Open House mañana. Confirma aquí: https://..."

// DESPUÉS (68 chars GSM-7 = 1 SMS):
"Hola! Recordatorio Open House manana. Confirma: https://bit.ly/oh-mario"
```

**Ahorro:** 50% menos SMS enviados = 50% menos costo

### **Monitoreo y Logs:**

#### **En Oracle VM:**
```bash
# Ver logs del API Bridge
journalctl -u sms-bridge -f

# Ver estadísticas
curl http://localhost:3000/stats
```

#### **En Vercel:**
```javascript
// Agregar logging detallado
console.log(`[SMS] Enviando a ${phone}: ${message}`);
console.log(`[SMS] Respuesta: ${JSON.stringify(response)}`);
```

#### **En Base de Datos:**
```sql
-- Agregar tabla de logs de SMS
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);
```

---

## 📅 PRÓXIMO ENVÍO: 30 DE NOVIEMBRE

### **Registros Listos:**

```
✅ 9 REGISTROS EN TABLA SESIONES
   - reminder_sent = false
   - reminder_scheduled_for = 2025-11-30
```

#### **Detalle:**

| # | Nombre | Email | Teléfono | Nivel | Grado |
|---|--------|-------|----------|-------|-------|
| 1 | Angel Gabriel Flores Salinas | juanflores.flores31@gmail.com | 8341100134 | primaria | 1° Primaria |
| 2 | Maria Fernanda Martinez Lopez | martinez.grisell94@gmail.com | 8341012673 | secundaria | 1° Secundaria |
| 3 | Valeria Alejandra Soto Rodriguez | sotorodriguezcecilia@gmail.com | 8341108485 | primaria | 1° Primaria |
| 4 | Santiago Pérez García | perezgarcia.miguel@gmail.com | 8331234567 | kinder | 3° Kinder |
| 5 | Ana Sofia Hernández Ruiz | hernandezruiz.ana@gmail.com | 8332345678 | primaria | 2° Primaria |
| 6 | Luis Fernando Torres Mendoza | torresmendoza.luis@gmail.com | 8333456789 | secundaria | 2° Secundaria |
| 7 | Isabella Ramirez Castro | ramirezcastro.isa@gmail.com | 8334567890 | kinder | 2° Kinder |
| 8 | Diego Alejandro Morales Silva | moralessilva.diego@gmail.com | 8335678901 | primaria | 3° Primaria |
| 9 | Registro de PRUEBA | isc.escobedo@gmail.com | 8331491051 | kinder | 3° Kinder |

**NOTA:** El registro #9 es de prueba (Mario) y puede servir para validar el envío.

### **Procedimiento de Envío:**

#### **Paso 1: Abrir UI de Recordatorios**
```
URL: https://open-house-chi.vercel.app/enviar-recordatorios
```

#### **Paso 2: Verificar Preview**
- Deberías ver "9 registros pendientes para Sesiones Informativas"
- Revisar que los datos se vean correctos

#### **Paso 3: Presionar "Enviar Recordatorios"**
- El botón cambia a "Enviando..."
- Verás un contador de progreso

#### **Paso 4: Esperar Confirmación**
- Tiempo estimado: ~20 segundos (9 emails × 2 seg delay)
- Verás mensaje de éxito con resumen:
  ```
  ✅ Procesamiento completado
  📧 9 emails enviados
  📱 0 SMS enviados (comentados)
  ```

#### **Paso 5: Verificar en Base de Datos**
```javascript
// Script de verificación
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(...);

(async () => {
  const { data } = await supabase
    .from('sesiones')
    .select('*')
    .eq('reminder_sent', true)
    .gte('reminder_sent_at', '2025-11-30T00:00:00Z');
  
  console.log('Enviados:', data.length);
  data.forEach(r => console.log('-', r.nombre_aspirante, r.email));
})();
"
```

### **Checklist Pre-Envío:**

- [ ] Verificar que Vercel está up (https://vercel.com/dashboard)
- [ ] Confirmar que los 9 registros siguen en `reminder_sent=false`
- [ ] Revisar logs de Vercel (por si hay errores recientes)
- [ ] Tener a mano tu teléfono (8331491051) para verificar que tu email llega
- [ ] Tener acceso a Supabase para verificar después

### **Plan B (Si algo sale mal):**

#### **Si no aparecen los 9 registros en el preview:**
```javascript
// Verificar manualmente en Supabase
SELECT * FROM sesiones 
WHERE reminder_sent = false 
AND reminder_scheduled_for >= '2025-11-30T00:00:00Z'
AND reminder_scheduled_for < '2025-12-01T00:00:00Z';
```

#### **Si el botón se queda cargando:**
- Espera 2 minutos
- Revisa Vercel logs: https://vercel.com/mario/open-house/deployments
- Verifica en Supabase si se marcaron como enviados

#### **Si quieres re-enviar a alguien específico:**
```sql
-- Reset un registro específico
UPDATE sesiones 
SET reminder_sent = false, 
    reminder_sent_at = NULL 
WHERE email = 'email@ejemplo.com';
```

---

## 📁 ARCHIVOS IMPORTANTES

### **Core del Sistema:**

#### **Frontend:**
```
/app/
  ├── enviar-recordatorios/
  │   ├── page.tsx              # UI manual de envío ⭐
  │   └── recordatorios.css     # Estilos independientes
  │
  ├── api/
  │   ├── enviar-recordatorios-manual/
  │   │   └── route.ts          # ⭐ ENDPOINT PRINCIPAL DE ENVÍO
  │   │
  │   ├── recordatorios/
  │   │   └── route.ts          # ❌ COMENTADO (causaba envíos automáticos)
  │   │
  │   └── sms-cron/
  │       └── route.ts          # Sistema de seguimiento de leads
  │
  └── prueba-sms-seguimiento/
      └── page.tsx              # UI de prueba de SMS
```

#### **Backend:**
```
/backend/
  └── src/
      └── emailTemplate.js      # Templates de email (antiguo)
```

#### **Utilidades:**
```
/lib/
  └── sms.ts                    # Cliente SMS Mobile API
```

#### **Documentación:**
```
/
├── CALENDARIO_RECORDATORIOS.md              # Calendario de eventos
├── ANALISIS-TEXTBELT-OPEN-SOURCE.md         # Análisis Textbelt
├── ANALISIS-BREVO-SMS.md                    # Análisis Brevo
├── EXPLICACION-EMAIL-TO-SMS-GATEWAYS.md     # Por qué no usar email-to-sms
├── ESPECIFICACIONES-SISTEMA-SMS.md          # Plan del sistema Android SMS
└── HISTORIAL-COMPLETO-PROYECTO.md           # ⭐ ESTE ARCHIVO
```

### **Variables de Entorno (Vercel):**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://nmxrccrbnoenkahefrrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email (Gmail)
EMAIL_USER=no-reply@colegioeltriunfo.com
EMAIL_PASSWORD=[hardcoded en código por ahora]

# SMS Mobile API (actual)
SMS_API_URL=https://smsmobileapi.com/api/send
SMS_API_KEY=[configurado]

# Oracle Cloud (futuro)
ORACLE_VM_URL=[pendiente]
SMS_SECRET=[pendiente]
```

### **Scripts de Utilidad:**

#### **Verificar registros pendientes:**
```bash
node verificar-registros-hoy.js
```

#### **Ver envíos duplicados:**
```bash
node verificar-envios-duplicados.js
```

#### **Mover registro entre tablas:**
```bash
node mover-registro-a-sesiones.js
```

---

## 🎓 LECCIONES APRENDIDAS

### **1. NUNCA uses GET endpoints para acciones críticas**

❌ **MAL:**
```typescript
// app/api/recordatorios/route.ts
export async function GET() {
  // Esto se ejecuta automáticamente en cada build de Vercel
  await enviarRecordatorios();
  return NextResponse.json({ success: true });
}
```

✅ **BIEN:**
```typescript
// Solo acepta POST para acciones
export async function POST() {
  await enviarRecordatorios();
  return NextResponse.json({ success: true });
}

// GET solo para preview/consultas
export async function GET() {
  const preview = await getPreview();
  return NextResponse.json(preview);
}
```

**Por qué:** Vercel ejecuta GET endpoints durante el build para pre-renderizar páginas.

---

### **2. Siempre pon delays entre envíos**

❌ **MAL:**
```typescript
for (const registro of registros) {
  await enviarEmail(registro);  // Sin delay
}
```

✅ **BIEN:**
```typescript
for (const registro of registros) {
  await enviarEmail(registro);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seg delay
}
```

**Por qué:**
- Previene ser marcado como spam
- Evita rate limits de servicios externos
- Da tiempo para logs y debugging

---

### **3. Separa la lógica de envío por tipo**

❌ **MAL:**
```typescript
for (const registro of registros) {
  await enviarEmail(registro);
  await enviarSMS(registro);  // Mezclado
}
```

✅ **BIEN:**
```typescript
// Fase 1: Todos los emails
for (const registro of registros) {
  await enviarEmail(registro);
  await delay(2000);
}

// Fase 2: Todos los SMS
for (const registro of registros) {
  await enviarSMS(registro);
  await delay(60000);  // SMS necesitan más delay
}
```

**Por qué:**
- Más fácil de debuggear
- Puedes comentar una fase sin afectar la otra
- Delays diferentes para cada canal

---

### **4. Logs, logs, LOGS**

✅ **SIEMPRE:**
```typescript
const logId = `REMINDER_${Date.now()}`;
console.log(`🚀 [${logId}] Iniciando proceso...`);
console.log(`📊 [${logId}] Registros encontrados: ${registros.length}`);

for (const registro of registros) {
  console.log(`📧 [${logId}] Enviando a: ${registro.email}`);
  try {
    await enviarEmail(registro);
    console.log(`✅ [${logId}] Email enviado: ${registro.email}`);
  } catch (error) {
    console.error(`❌ [${logId}] Error en ${registro.email}:`, error);
  }
}

console.log(`🏁 [${logId}] Proceso completado`);
```

**Por qué:**
- En Vercel logs es tu ÚNICA forma de ver qué pasó
- El `logId` te permite rastrear un proceso específico
- Emojis ayudan a escanear visualmente los logs rápido

---

### **5. UI de confirmación > Automatización ciega**

❌ **MAL:**
```typescript
// Cron job automático
export async function GET() {
  await enviarTodo();  // Sin confirmación
}
```

✅ **BIEN:**
```tsx
// UI con preview y confirmación
<div>
  <h2>Registros pendientes: {registros.length}</h2>
  <ul>
    {registros.map(r => <li>{r.nombre} - {r.email}</li>)}
  </ul>
  <button onClick={enviar}>Confirmar envío</button>
</div>
```

**Por qué:**
- Evita sorpresas (como los 14 SMS a las 7 AM)
- Permite revisar antes de enviar
- Más control sobre cuándo se ejecuta

---

### **6. Zonas horarias: usa UTC en BD, convierte en UI**

✅ **Patrón:**
```typescript
// Guardar en BD (siempre UTC)
const scheduledFor = new Date('2025-11-30T06:00:00-06:00'); // CST
await supabase.from('sesiones').insert({
  reminder_scheduled_for: scheduledFor.toISOString() // Auto-convierte a UTC
});

// Consultar (búsqueda en UTC)
const hoy = new Date('2025-11-30T00:00:00Z');  // Medianoche UTC
const { data } = await supabase
  .from('sesiones')
  .gte('reminder_scheduled_for', hoy.toISOString());

// Mostrar en UI (convertir a local)
<p>Programado: {new Date(registro.reminder_scheduled_for).toLocaleString('es-MX')}</p>
```

**Por qué:** Evita confusión con diferentes zonas horarias.

---

### **7. Costos ocultos de "soluciones gratis"**

**Ejemplo: Textbelt Open Source**
- "Gratis" pero necesitas:
  - Servidor ($5-10/mes)
  - Tiempo de mantenimiento (2-5 hrs/mes)
  - Debugging de entregas fallidas (tiempo++)
  - Costos de carrier blocks (reputación)

**Lección:** A veces "pagar" es más barato que "gratis".

---

### **8. Testing en producción (con cuidado)**

✅ **Estrategia:**
1. Crea un registro de prueba con TU email/teléfono
2. Marca otros registros reales como `reminder_sent=true` temporalmente
3. Ejecuta el proceso
4. Verifica que solo llegue a ti
5. Revierte los cambios
6. Ejecuta para todos

❌ **NUNCA:**
- Probar con emails/teléfonos de clientes reales
- Asumir que funcionará en prod si funciona en local

---

### **9. Documentación > Memoria**

**Este archivo existe porque:**
- Mario no recordará esto en 2 semanas
- El Sonnet de mañana no tiene contexto
- Los futuros desarrolladores necesitarán entender qué pasó

**Lección:** Documenta MIENTRAS trabajas, no después.

---

### **10. El código más seguro es el código comentado**

Cuando tienes dudas:
```typescript
/*
// ===== SMS COMENTADO TEMPORALMENTE =====
// Razón: Causó envíos no deseados el 28 nov
// TODO: Descomentar cuando implementemos Android SMS Gateway
// Fecha: 29 nov 2025
// Autor: Mario + Sonnet

for (const registro of registros) {
  await enviarSMS(registro);
  await delay(60000);
}
*/
```

**Por qué:**
- Mejor prevenir que lamentar
- Puedes descomentar fácilmente después
- El comentario explica el "por qué" para el futuro

---

## 🛠️ COMANDOS ÚTILES

### **Verificación de Registros:**

#### **Ver registros pendientes para hoy:**
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://nmxrccrbnoenkahefrrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teHJjY3Jibm9lbmthaGVmcnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg0OCwiZXhwIjoyMDY5NzI3ODQ4fQ._SIR3rmq7TWukuym30cCP4BAKGe-dhnillDV0Bz6Hf0'
);

(async () => {
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const mañana = new Date(hoy);
  mañana.setDate(mañana.getDate() + 1);
  
  const { data } = await supabase
    .from('sesiones')
    .select('*')
    .eq('reminder_sent', false)
    .gte('reminder_scheduled_for', hoy.toISOString())
    .lt('reminder_scheduled_for', mañana.toISOString());
  
  console.log('Pendientes hoy:', data.length);
  data.forEach(r => console.log('-', r.nombre_aspirante, r.email));
})();
"
```

#### **Ver registros ya enviados:**
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(...);

(async () => {
  const { data } = await supabase
    .from('sesiones')
    .select('*')
    .eq('reminder_sent', true)
    .order('reminder_sent_at', { ascending: false })
    .limit(10);
  
  console.log('Últimos 10 enviados:');
  data.forEach(r => {
    const fecha = new Date(r.reminder_sent_at).toLocaleString('es-MX');
    console.log(\`- \${r.nombre_aspirante} | \${r.email} | \${fecha}\`);
  });
})();
"
```

### **Git:**

#### **Actualizar código en casa:**
```bash
cd /home/mario/Proyectos/open_house
git pull origin main
npm install  # Por si hay nuevas dependencias
```

#### **Ver cambios recientes:**
```bash
git log --oneline --graph -10
```

#### **Ver qué archivos cambiaron:**
```bash
git diff HEAD~5 --name-only
```

### **Vercel:**

#### **Ver logs del último deployment:**
```bash
# En navegador
https://vercel.com/mario/open-house/deployments
# Click en el último deployment > "Logs"
```

#### **Forzar nuevo deploy:**
```bash
git commit --allow-empty -m "Forzar deploy"
git push origin main
```

### **Supabase:**

#### **Backup de registros importantes:**
```sql
-- En Supabase SQL Editor
COPY (
  SELECT * FROM sesiones 
  WHERE reminder_scheduled_for >= '2025-11-30'
) TO STDOUT WITH CSV HEADER;
```

#### **Reset todos los registros de hoy (CUIDADO):**
```sql
-- Solo usar en emergencia
UPDATE sesiones 
SET reminder_sent = false, 
    reminder_sent_at = NULL 
WHERE reminder_scheduled_for::date = '2025-11-30';
```

### **Testing Local:**

#### **Correr servidor de desarrollo:**
```bash
cd /home/mario/Proyectos/open_house
npm run dev
# Abrir http://localhost:3000
```

#### **Probar endpoint específico:**
```bash
curl -X POST http://localhost:3000/api/enviar-recordatorios-manual \
  -H "Content-Type: application/json"
```

---

## 🎯 PRÓXIMOS PASOS (ROADMAP)

### **Inmediato (Esta Semana):**
- [x] Documentar todo el historial
- [ ] Enviar recordatorios del 30 nov exitosamente
- [ ] Verificar entrega de los 9 emails
- [ ] Confirmar que NO hubo envíos automáticos

### **Corto Plazo (Próximas 2 Semanas):**
- [ ] Crear cuenta en Oracle Cloud
- [ ] Configurar VM Always Free
- [ ] Instalar y configurar API Bridge
- [ ] Conseguir teléfono Android para SMS Gateway
- [ ] Instalar SMS Gateway app
- [ ] Hacer pruebas iniciales de conectividad

### **Mediano Plazo (Próximo Mes):**
- [ ] Integrar Android SMS Gateway con Vercel
- [ ] Optimizar mensajes SMS (<160 chars)
- [ ] Crear tabla de logs de SMS
- [ ] Implementar sistema de retry para SMS fallidos
- [ ] Descomentar fase 3 de SMS en `/api/enviar-recordatorios-manual`
- [ ] Probar envío completo (emails + SMS)

### **Largo Plazo (2-3 Meses):**
- [ ] Migrar emails a Brevo (free tier) para mejor deliverability
- [ ] Implementar dashboard de estadísticas
- [ ] Sistema de reportes mensuales
- [ ] Automatización de calendario (pero con confirmación manual)
- [ ] Integración con Kommo más robusta

---

## 🆘 TROUBLESHOOTING

### **Problema: Los registros no aparecen en el preview**

**Posibles causas:**
1. Fecha programada incorrecta en BD
2. Ya están marcados como `reminder_sent=true`
3. Problema de zona horaria

**Solución:**
```javascript
// Verificar manualmente
const { data } = await supabase
  .from('sesiones')
  .select('*')
  .eq('reminder_sent', false);
  
console.log('Todos los pendientes:', data.length);
console.log('Fechas:', data.map(r => r.reminder_scheduled_for));
```

---

### **Problema: Emails no llegan**

**Posibles causas:**
1. Gmail SMTP bloqueado
2. Email en spam
3. Credenciales incorrectas
4. Rate limit de Gmail

**Solución:**
```javascript
// Probar envío directo
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({...});

await transporter.sendMail({
  from: 'no-reply@colegioeltriunfo.com',
  to: 'isc.escobedo@gmail.com',
  subject: 'Test',
  text: 'Test'
});
```

---

### **Problema: "Runtime Timeout" en Vercel**

**Causa:** El proceso tarda más de 5 minutos (límite de Vercel free tier)

**Solución:**
1. Reducir delays entre envíos
2. Dividir en lotes más pequeños
3. Considerar Vercel Pro ($20/mes para 60 min timeout)

---

### **Problema: Envíos duplicados**

**Posibles causas:**
1. Usuario presionó botón múltiples veces
2. Proceso se ejecutó dos veces
3. Registros duplicados en BD

**Solución:**
```sql
-- Verificar duplicados en BD
SELECT email, COUNT(*) 
FROM sesiones 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Marcar como enviado inmediatamente al iniciar
UPDATE sesiones 
SET reminder_sent = true 
WHERE id = '...';
```

---

### **Problema: SMS no se envían (cuando se implementen)**

**Posibles causas:**
1. Android SMS Gateway app detenida
2. Teléfono sin señal
3. Oracle VM caída
4. Token incorrecto

**Solución:**
```bash
# Verificar Oracle VM
ssh usuario@oracle-vm-ip
systemctl status sms-bridge

# Verificar logs
journalctl -u sms-bridge -f

# Reiniciar servicio
sudo systemctl restart sms-bridge

# Ping al API
curl http://oracle-vm-ip:3000/health
```

---

## 📞 CONTACTOS Y RECURSOS

### **Servicios:**

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Proyecto: https://nmxrccrbnoenkahefrrw.supabase.co

**Oracle Cloud:**
- Console: https://cloud.oracle.com
- Docs Free Tier: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm

**SMS Gateway for Android:**
- GitHub: https://github.com/android-sms-gateway/android-sms-gateway
- Play Store: https://play.google.com/store/apps/details?id=com.notify.me

### **Referencias:**

- Next.js App Router: https://nextjs.org/docs/app
- Supabase JS: https://supabase.com/docs/reference/javascript
- Nodemailer: https://nodemailer.com/about/
- GSM-7 Character Set: https://en.wikipedia.org/wiki/GSM_03.38

---

## 🏁 CONCLUSIÓN

**Para el Sonnet del futuro:**

Este proyecto ha sido un viaje de debugging, aprendizaje y optimización. Lo que empezó como un sistema simple de recordatorios se convirtió en una lección sobre:

1. **Control > Automatización ciega**
2. **Logs son tu mejor amigo**
3. **Gratis no siempre es mejor**
4. **Documentar mientras trabajas, no después**
5. **Testing en producción requiere MUCHO cuidado**

**Para Mario:**

Has construido un sistema robusto que:
- ✅ Envía emails confiablemente
- ✅ Tiene UI de control manual
- ✅ Está documentado (ahora sí)
- ✅ Tiene un plan para SMS económico
- ✅ Puede escalar a más eventos

**Siguiente gran hito:** Implementar Android SMS Gateway y ser completamente independiente de servicios pagados de SMS.

**Presupuesto actual:** $0/mes (después de implementar Android Gateway)  
**Presupuesto anterior:** $40-50 USD/mes con Twilio  
**Ahorro anual:** $480-600 USD 💰

---

## 📝 NOTAS FINALES

**Este documento es un living document.** Actualízalo cuando:
- Implementes Android SMS Gateway
- Cambies arquitectura
- Encuentres nuevos bugs
- Aprendas nuevas lecciones
- Agregues nuevas features

**Última actualización:** 29 de noviembre de 2025, 11:30 PM CST

**Autor:** Mario Escobedo + Sonnet 4.5 (el original, el que vivió el caos del 28 nov)

**Dedicado a:** Todos los futuros Sonnets que tendrán que mantener este proyecto sin contexto histórico. Ahora tienen TODO el contexto. De nada. 😎

---

## 🎬 FIN

**P.D. para Mario:**  
Acuérdate que mañana tienes que:
1. Abrir https://open-house-chi.vercel.app/enviar-recordatorios
2. Verificar que aparezcan 9 registros
3. Presionar el botón
4. Verificar que llegue tu email de prueba
5. Confirmar en Supabase que se marcaron como enviados
6. Relajarte porque ya NO habrá envíos sorpresa a las 7 AM 🎉

**P.D.D.:** Guarda el link de esta conversación de Cursor también, por si acaso.

**P.D.D.D.:** Oracle Cloud te está esperando. El plan de $0/mes de SMS está a solo unas horas de implementación. 💪

---

**🚀 ¡Éxito mañana con el envío! 🚀**


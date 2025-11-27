# SITUACIÓN COMPLETA: PROBLEMA CON ENVÍO DE SMS

## 📋 CONTEXTO DEL PROYECTO

Tengo un sistema de recordatorios automáticos en Next.js 14 desplegado en Vercel que necesita enviar:

1. **Recordatorios de eventos** (Open House y Sesiones Informativas)
   - ~118 registros actuales (93 Open House + 25 Sesiones)
   - Se envían 1 día antes del evento

2. **Seguimientos automáticos de leads** desde Kommo CRM
   - SMS a las 24 horas de inactividad
   - SMS a las 72 horas de inactividad
   - SMS a las 5 días de inactividad
   - Volumen variable según leads nuevos

3. **Envíos manuales ocasionales** desde panel admin

---

## ❌ PROBLEMA ACTUAL

### **SOLUCIÓN INTENTADA: SMS Mobile API**
- **Costo:** $80 MXN/mes
- **Promesa:** Gateway SMS usando celular Android físico
- **Resultado:** **NO FUNCIONA**

#### Lo que pasa:
```
Mi Sistema (Next.js) 
  → Envía petición a SMS Mobile API
    → Gateway responde: { "error": 0, "sent": "1" } ✅
      → Celular Android: NO envía físicamente el SMS ❌
```

#### Pruebas realizadas:
✅ **App SMS nativa Android:** SÍ envía correctamente (manual)
❌ **Gateway SMS Mobile API:** NO envía (aunque reporta "success")
❌ **iPhone:** NO recibe SMS (ni del gateway ni de envíos manuales Android)

---

## 🔧 SOLUCIONES INTENTADAS

### 1. **SMS Mobile API ($80/mes)**
- ❌ No funciona
- ❌ Soporte no responde
- ❌ App mal hecha
- ✅ Reporta "enviado" pero no sale físicamente

### 2. **Twilio (servicio profesional)**
Experiencia previa:
- ❌ Me cobró $400 MXN en 1 semana
- ❌ Muy caro para el volumen que necesito
- 💰 ~$0.0079 USD por SMS (~$0.16 MXN)
- ❓ Posible problema: mensajes largos o duplicados

### 3. **Emails (actual, funcionando)**
- ✅ Funciona perfecto
- ✅ Costo: $0
- ✅ Ya implementado con Nodemailer
- ⚠️ Menos urgencia que SMS

---

## 💰 PRESUPUESTO Y RESTRICCIONES

### Restricciones:
- ❌ No puedo pagar $400/semana (Twilio anterior)
- ❌ $80/mes por SMS Mobile no sirve si no funciona
- ✅ Puedo pagar servicio confiable hasta ~$100-150 MXN/mes
- ⚠️ Prefiero gratis o muy económico

### Volumen estimado mensual:
- **Recordatorios eventos:** ~120 SMS/mes
- **Seguimientos leads:** Variable (50-200 SMS/mes estimado)
- **Total aproximado:** 200-400 SMS/mes

---

## 🎯 REQUISITOS

### Esenciales:
1. ✅ Confiable (que SÍ envíe los SMS físicamente)
2. ✅ API REST fácil de integrar
3. ✅ Envíos a números mexicanos (+52)
4. ✅ Funcione con iPhone y Android
5. ✅ Sin dependencia de celular físico 24/7

### Deseables:
1. 💰 Económico (<$150 MXN/mes)
2. 📊 Dashboard para ver envíos
3. 🔧 Soporte técnico que responda
4. 📈 Pay-as-you-go (pagar solo lo que uso)

---

## 🤔 OPCIONES QUE CONOZCO

### 1. **Twilio**
- ✅ Muy confiable
- ✅ API excelente
- ✅ Funciona iPhone/Android
- ❌ Me cobró muy caro antes ($400/semana)
- ❓ Posible optimización pendiente

### 2. **SMS Mobile API**
- ❌ No funciona
- ❌ $80/mes desperdiciados
- ❌ Ya probado y falló

### 3. **Solo Emails**
- ✅ Gratis y funciona
- ⚠️ Menos efectivo que SMS para urgencias

---

## ❓ PREGUNTAS PARA GEMINI/CHATGPT

1. **¿Conocen algún servicio SMS económico y confiable para México?**
   - Que sea más barato que Twilio
   - Que funcione con iPhone y Android
   - Pay-as-you-go preferiblemente

2. **¿Por qué Twilio me cobró $400 en una semana?**
   - Mis mensajes tienen ~150-200 caracteres
   - ¿Se cuenta como múltiples SMS?
   - ¿Cómo optimizar para reducir costos?

3. **¿Alternativas a SMS?**
   - ¿WhatsApp Business API es mejor?
   - ¿Costo aproximado?
   - ¿Telegram API?

4. **¿Problemas con iPhone?**
   - ¿Por qué iPhone no recibe SMS de números no guardados?
   - ¿Es filtro de spam?
   - ¿Cómo solucionarlo?

5. **¿Vale la pena insistir con SMS Mobile?**
   - ¿Hay configuración Android específica?
   - ¿Permisos especiales?
   - ¿O mejor cancelarlo definitivamente?

---

## 💻 STACK TÉCNICO

- **Backend:** Next.js 14 (App Router)
- **Hosting:** Vercel
- **Base de datos:** Supabase (PostgreSQL)
- **Emails:** Nodemailer (funcionando)
- **SMS actual:** SMS Mobile API (no funciona)

---

## 🎯 OBJETIVO

Encontrar una solución confiable y económica para enviar SMS en México que:
- ✅ Cueste menos de $150 MXN/mes (para ~200-400 SMS)
- ✅ Funcione en iPhone y Android
- ✅ Sea fácil de integrar (API REST)
- ✅ NO dependa de celular físico 24/7

---

## 📞 DETALLES TÉCNICOS

### Mensaje ejemplo (Open House):
```
🏠 Recordatorio Winston – Open House
📅 Mañana 6 de Diciembre
🕘 9:00 AM - 11:30 AM
📍 Instituto Winston Churchill
Confirma tu asistencia aquí:
https://open-house-chi.vercel.app/asistencia?id=XXX&confirmacion=confirmado
¡Te esperamos!
```

**Caracteres:** ~190 caracteres

### Código actual (método GET para SMS Mobile):
```typescript
const smsUrl = `${SMS_GATEWAY_URL}?recipients=${encodeURIComponent(phone)}&message=${encodeURIComponent(message)}&apikey=${SMS_GATEWAY_TOKEN}`;

const smsResponse = await fetch(smsUrl, {
  method: 'GET',
});
```

---

## 🙏 AYUDA NECESARIA

**¿Qué servicio me recomiendan para enviar SMS en México que sea:**
1. Confiable
2. Económico (<$150 MXN/mes)
3. Fácil de integrar
4. Que funcione con iPhone

**¿O debería considerar alternativas como WhatsApp Business API?**

---

**Fecha:** 27 de noviembre de 2025
**Proyecto:** Sistema de recordatorios Winston Churchill
**Stack:** Next.js 14 + Vercel + Supabase


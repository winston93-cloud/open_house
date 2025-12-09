# 📋 ESPECIFICACIONES TÉCNICAS - SISTEMA SMS

**Proyecto:** Open House Winston Churchill  
**Fecha:** 28 de Noviembre, 2025  
**Propósito:** Consulta técnica para validación

---

## 🏗️ ARQUITECTURA PROPUESTA

### **Stack tecnológico:**
```
VERCEL (Next.js 14.2.33)
    ↓ HTTPS POST
ORACLE CLOUD VM (Ubuntu, Always Free Tier)
  └── API Bridge (Node.js/Express)
    ↓ HTTP local
CELULAR ANDROID
  └── App: "SMS Gateway for Android"
  └── SIM: Telcel ilimitada ($229 MXN/mes)
    ↓
DESTINATARIOS (Padres de familia)
```

### **Componentes:**
1. **Frontend:** Vercel serverless
2. **Gateway:** Oracle Cloud VM (IP pública fija, gratis forever)
3. **SMS Driver:** Android phone + SMS Gateway app
4. **Carrier:** Telcel México (SIM ilimitada)

---

## 📱 MENSAJES SMS ACTUALES

### **Características generales:**
- **Tipo:** SMS Transaccionales (recordatorios y seguimiento)
- **Frecuencia:** 30 mensajes/día promedio
- **Volumen mensual:** ~900 SMS/mes
- **Destinatarios:** México (códigos de área 833, 331, etc.)

---

### **Mensaje 1: Seguimiento 24 horas**

```
RECORDATORIO

¡Hola! Te recordamos que estamos disponibles para apoyarte con el proceso de admisión al Instituto Winston Churchill.

Escríbenos por WhatsApp y con gusto te brindamos toda la información necesaria:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507
```

**Especificaciones:**
- **Longitud:** 285 caracteres
- **Emojis:** NO (solo viñetas •)
- **Tildes:** SÍ (¡, admisión, información, gusto)
- **Caracteres especiales:** Signos de exclamación (¡!), dos puntos (:)
- **URLs:** 2 enlaces WhatsApp (https://wa.me/)
- **Saltos de línea:** 5 líneas

---

### **Mensaje 2: Seguimiento 72 horas**

```
¿AGENDAMOS UN RECORRIDO?

¡Nos encantaría que conociera nuestro Instituto Winston Churchill!

¿Le gustaría agendar un recorrido por nuestras instalaciones?

Envía un mensaje y te ayudamos a reservar tu visita:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507
```

**Especificaciones:**
- **Longitud:** 295 caracteres
- **Emojis:** NO
- **Tildes:** SÍ (¿?, ¡!, encantaría, gustaría)
- **Caracteres especiales:** Signos de interrogación (¿?), exclamación (¡!)
- **URLs:** 2 enlaces WhatsApp
- **Saltos de línea:** 6 líneas

---

### **Mensaje 3: Seguimiento 5 días**

```
DESCUENTO ESPECIAL AL INICIAR TU PROCESO DE ADMISIÓN HOY

¡Aproveche nuestro descuento especial al iniciar su proceso de admisión hoy!

Escríbenos y da el primer paso para formar parte del Instituto Winston Churchill:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507
```

**Especificaciones:**
- **Longitud:** 308 caracteres
- **Emojis:** NO
- **Tildes:** SÍ (ADMISIÓN, Escríbenos)
- **Caracteres especiales:** Signos de exclamación (¡!)
- **URLs:** 2 enlaces WhatsApp
- **Saltos de línea:** 5 líneas

---

## 📊 ANÁLISIS TÉCNICO DE CODIFICACIÓN

### **Conjunto de caracteres usado:**
```
- Letras: A-Z, a-z (alfabeto español)
- Números: 0-9
- Tildes: á, é, í, ó, ú, Á, É, Í, Ó, Ú
- Diéresis: ü, Ü
- Ñ/ñ
- Signos: ¿ ? ¡ ! : • -
- Espacios y saltos de línea
- URLs: https://wa.me/52...
```

### **Codificación esperada:**
- **UCS-2 / UTF-16** (debido a tildes y signos españoles)
- **NO GSM 7-bit** (contiene caracteres fuera del charset GSM)

### **Segmentación SMS:**
```
Con codificación UCS-2:
  - 70 caracteres por segmento
  - Mensaje 1 (285 chars): 285 ÷ 70 = ~4-5 segmentos
  - Mensaje 2 (295 chars): 295 ÷ 70 = ~5 segmentos
  - Mensaje 3 (308 chars): 308 ÷ 70 = ~5 segmentos
```

---

## 🎯 PREGUNTAS ESPECÍFICAS PARA VALIDACIÓN

### **Pregunta 1: Capacidad diaria**
Con los mensajes tal como están (285-308 caracteres, con tildes, con URLs):
- ¿Cuántos mensajes puedo enviar por día con una SIM Telcel "ilimitada" (límite real ~200 SMS/día)?
- ¿Los 30 mensajes/día están dentro de la capacidad?

### **Pregunta 2: Fragmentación**
- ¿Cómo se fragmentarán estos mensajes al enviarse por SMS?
- ¿El destinatario los recibirá como 1 mensaje largo o como varios SMS separados?

### **Pregunta 3: Compatibilidad**
- ¿Los enlaces https://wa.me/ funcionarán correctamente en SMS?
- ¿Los caracteres españoles (¿¡ñáéíóú) causarán problemas?
- ¿Los saltos de línea se preservarán?

### **Pregunta 4: Restricciones de carrier**
- ¿Telcel México tiene restricciones conocidas para SMS con URLs?
- ¿Hay límites de longitud por mensaje que debamos considerar?
- ¿Los mensajes con múltiples URLs tienen mayor probabilidad de ser bloqueados?

### **Pregunta 5: Delivery rate**
Con la arquitectura propuesta (Celular Android + App + SIM Telcel):
- ¿Qué tasa de entrega real se puede esperar?
- ¿iPhone recibirá estos mensajes correctamente?
- ¿Hay diferencia entre Android e iPhone en la recepción?

---

## 💰 CONTEXTO DE COSTOS

### **Costo propuesto:**
- Hardware: Celular Android usado ($500-800 MXN, una vez)
- SIM Telcel ilimitada: $229 MXN/mes
- Oracle Cloud VM: $0 (Always Free)
- **Total mensual:** $229 MXN

### **Comparativa con alternativas:**
- Twilio optimizado: $32-130 MXN/mes (400-500 SMS)
- SMS Mobile API: $80 MXN/mes (no funciona, bloqueado)
- Brevo SMS: $420-560 MXN/mes (400 SMS)

---

## 🔍 INFORMACIÓN ADICIONAL

### **Carrier:**
- **País:** México
- **Operador:** Telcel
- **Plan:** SIM prepago con SMS "ilimitados"
- **Límite real estimado:** ~200 SMS/día

### **App Android:**
- **Nombre:** SMS Gateway for Android
- **GitHub:** https://github.com/capcom6/android-sms-gateway
- **Play Store:** eu.apksoft.android.smsgateway
- **Versión:** Última disponible (2024-2025)
- **Protocolo:** API REST HTTP

### **Destinos:**
- **País:** México
- **Números:** 10 dígitos (833XXXXXXX, 331XXXXXXX, etc.)
- **Formato de envío:** Sin prefijo 52 (app lo agrega automáticamente)

---

## ❓ PREGUNTA PRINCIPAL PARA GROK

**"Con esta arquitectura y estos mensajes SMS (285-308 caracteres, con tildes españolas, con 2 URLs cada uno), enviando 30 mensajes por día desde un celular Android con app SMS Gateway y SIM Telcel ilimitada en México:**

**1. ¿Funcionarán correctamente sin necesidad de optimización?**
**2. ¿Cuántos SMS del límite diario (200) consumirá cada mensaje debido a la fragmentación?**
**3. ¿Hay algún problema técnico que deba considerar antes de implementar?"**

---

## 📝 RESPUESTA DE CLAUDE SONNET 4.5

**Respuesta:** Los mensajes funcionarán correctamente. Cada mensaje consumirá ~5 SMS del límite diario debido a la codificación UCS-2 (por las tildes). Con 30 mensajes/día × 5 partes = 150 SMS consumidos de los 200 disponibles. Hay capacidad suficiente.

**Delivery rate esperado:** 65-92%  
**Compatibilidad:** iPhone y Android  
**URLs:** Funcionan correctamente  

---

**FIN DEL DOCUMENTO - LISTO PARA CONSULTAR CON GROK**


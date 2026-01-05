# 📋 Migración de WhatsApp Business API a WhatsApp Lite en Kommo

**Instituto Winston Churchill**  
**Fecha:** 5 de enero de 2026  
**Objetivo:** Eliminar costos de WhatsApp Business API ($19-25 USD/mes) y migrar a WhatsApp Lite (gratis)

---

## ⚠️ IMPORTANTE - LEER ANTES DE COMENZAR

- ✅ El historial de conversaciones en Kommo **SE MANTIENE**
- ✅ Las apps de WhatsApp en los celulares **NO SE TOCAN**
- ✅ Los números de teléfono **SIGUEN FUNCIONANDO**
- ⏰ Tiempo estimado total: **20-30 minutos**
- 🔄 Habrá una interrupción de 10-15 minutos durante la migración

---

## 📊 TABLA DE PASOS - MIGRACIÓN COMPLETA

| # | PASO | DESCRIPCIÓN DETALLADA | RESPONSABLE | TIEMPO | ✓ |
|---|------|----------------------|-------------|--------|---|
| **FASE 1: PREPARACIÓN** |
| 1 | **Verificar números actuales** | Anota cuáles son los 2 números de WhatsApp que tienes conectados a la API:<br>• Número 1: ___________________<br>• Número 2: ___________________ | Admin Kommo | 2 min | ☐ |
| 2 | **Backup preventivo** | En Kommo, ve a cada lead importante y toma screenshots de conversaciones críticas (opcional pero recomendado) | Admin Kommo | 5 min | ☐ |
| 3 | **Avisar al equipo** | Notifica que habrá 10-15 min sin servicio de WhatsApp en Kommo | Admin | 2 min | ☐ |
| **FASE 2: DESCONEXIÓN DE API** |
| 4 | **Abrir Facebook Business Manager** | Ve a: https://business.facebook.com | Admin | 1 min | ☐ |
| 5 | **Navegar a cuentas** | Click en el menú lateral:<br>• **Configuración de empresa**<br>• **Cuentas**<br>• **WhatsApp Business** | Admin | 1 min | ☐ |
| 6 | **Eliminar número 1 de API** | • Selecciona tu cuenta de WhatsApp<br>• Click en **Números de teléfono**<br>• Busca el primer número<br>• Click en **⋮** (tres puntos)<br>• **Eliminar número**<br>• Confirma la eliminación | Admin | 2 min | ☐ |
| 7 | **Eliminar número 2 de API** | Repite el paso anterior para el segundo número | Admin | 2 min | ☐ |
| 8 | **⏰ ESPERAR LIBERACIÓN** | **CRÍTICO:** Espera 10 minutos completos para que Meta libere los números del sistema API.<br>**No continúes antes de tiempo o fallará** | - | 10 min | ☐ |
| **FASE 3: DESCONEXIÓN EN KOMMO** |
| 9 | **Abrir Kommo Settings** | Ve a: https://winstonchurchill.kommo.com/settings/widgets/ | Admin Kommo | 1 min | ☐ |
| 10 | **Localizar WhatsApp Business API** | En el menú izquierdo:<br>• **Integraciones**<br>• Busca "WhatsApp" (no Lite)<br>• La que dice "Instalado" | Admin Kommo | 1 min | ☐ |
| 11 | **Desconectar API** | • Click en la integración de WhatsApp Business<br>• Click en **Desinstalar** o **Desconectar**<br>• Confirma la acción | Admin Kommo | 1 min | ☐ |
| **FASE 4: CONEXIÓN DE WHATSAPP LITE** |
| 12 | **Localizar WhatsApp Lite** | En la misma sección de Integraciones:<br>• Busca "**WhatsApp Lite**"<br>• Debe decir "Instalado" (ya lo tienes) | Admin Kommo | 1 min | ☐ |
| 13 | **Conectar número 1** | • Click en WhatsApp Lite<br>• Click en **Conectar**<br>• Te mostrará un código QR | Admin Kommo | 1 min | ☐ |
| 14 | **Escanear QR - Número 1** | 📱 **En el celular 1:**<br>• Abre WhatsApp (la app que usas normalmente)<br>• Ve a **⋮** → **Dispositivos vinculados**<br>• **Vincular un dispositivo**<br>• Escanea el QR de Kommo<br>• Acepta permisos | Usuario celular 1 | 2 min | ☐ |
| 15 | **Verificar conexión - Número 1** | En Kommo debe aparecer "Conectado" con el nombre del número | Admin Kommo | 30 seg | ☐ |
| 16 | **Conectar número 2** | Si tienes un segundo número, repite pasos 13-15 | Admin Kommo + Usuario | 3 min | ☐ |
| **FASE 5: PRUEBAS Y VERIFICACIÓN** |
| 17 | **Enviar mensaje de prueba** | Desde Kommo, envía un mensaje de prueba a tu propio número | Admin Kommo | 1 min | ☐ |
| 18 | **Verificar recepción** | Confirma que el mensaje llega correctamente | Admin Kommo | 1 min | ☐ |
| 19 | **Responder desde Kommo** | Responde el mensaje desde Kommo y verifica que llega al celular | Admin Kommo | 1 min | ☐ |
| 20 | **Verificar historial** | Abre un lead anterior y confirma que las conversaciones viejas siguen ahí | Admin Kommo | 1 min | ☐ |
| **FASE 6: CONFIGURACIÓN FINAL** |
| 21 | **Renombrar canales (opcional)** | En Kommo, renombra los canales de WhatsApp Lite si es necesario:<br>• "WhatsApp Lite - Open House"<br>• "WhatsApp Lite - Sesiones" | Admin Kommo | 2 min | ☐ |
| 22 | **Verificar plantillas** | Las plantillas de mensaje en Kommo deben seguir funcionando (no son plantillas de Meta) | Admin Kommo | 2 min | ☐ |
| 23 | **Notificar al equipo** | Avisa que el servicio ya está restaurado y funcionando | Admin | 1 min | ☐ |
| 24 | **Monitorear próximas 24hrs** | Vigila que todos los mensajes entrantes y salientes funcionen correctamente | Admin Kommo | - | ☐ |

---

## ✅ VERIFICACIÓN FINAL - CHECKLIST

Marca cada punto SOLO cuando esté 100% confirmado:

| VERIFICACIÓN | ESTADO |
|--------------|--------|
| ☐ Los 2 números fueron eliminados de Facebook Business Manager | ☐ |
| ☐ La integración "WhatsApp Business API" fue desconectada en Kommo | ☐ |
| ☐ WhatsApp Lite está conectado y muestra "Conectado" | ☐ |
| ☐ Los 2 números aparecen como dispositivos vinculados en los celulares | ☐ |
| ☐ El mensaje de prueba se envió y recibió correctamente | ☐ |
| ☐ El historial de conversaciones anteriores se mantiene en los leads | ☐ |
| ☐ El equipo fue notificado del cambio | ☐ |

---

## 🚫 LO QUE **NO** DEBES HACER

| ❌ NUNCA HAGAS ESTO | ¿POR QUÉ? |
|---------------------|------------|
| Desinstalar WhatsApp del celular | La app del celular NO tiene nada que ver con la API |
| Cambiar de WhatsApp Business App a WhatsApp normal | No es necesario, ambos funcionan igual con Lite |
| Hacer respaldo y restaurar WhatsApp | No se pierde nada en el celular |
| Conectar Lite ANTES de eliminar de Facebook | Dará error de "número ya en uso" |
| Saltarte los 10 minutos de espera | El número no estará liberado y fallará |
| Borrar conversaciones del CRM | El historial en Kommo se mantiene automáticamente |

---

## 📞 CONTACTOS DE SOPORTE

**Si algo sale mal:**

| PROBLEMA | CONTACTO |
|----------|----------|
| Error al eliminar número de Facebook | Soporte de Meta Business: https://business.facebook.com/help |
| Error al conectar en Kommo | Soporte Kommo: desde tu cuenta → **?** → Chat de soporte |
| Número no se libera después de 10 min | Espera 30 minutos y reintenta |
| Código QR no escanea | Verifica que el celular tenga conexión a internet |

---

## 💰 BENEFICIOS ESPERADOS

| ANTES (Business API) | DESPUÉS (WhatsApp Lite) |
|----------------------|-------------------------|
| $19.47 - $25.00 USD/mes | **$0 USD/mes** ✅ |
| Cobros por mensajes de spam | **Sin cobros** ✅ |
| Configuración compleja | **Simple y directo** ✅ |
| Requiere plantillas aprobadas | **Mensajes libres** ✅ |

**Ahorro anual estimado:** $234 - $300 USD 💵

---

## 📝 NOTAS IMPORTANTES

1. **Ventana de 24 horas:** Con WhatsApp Lite, solo puedes responder dentro de 24hrs después del último mensaje del cliente. Para tu caso (confirmaciones y recordatorios) es perfecto porque el cliente escribe primero.

2. **Sesión activa:** Mantén el celular con WhatsApp activo al menos 1 vez cada 14 días para evitar que Kommo se desconecte.

3. **Múltiples dispositivos:** Puedes tener el mismo número conectado a:
   - El celular principal ✅
   - Kommo (como dispositivo vinculado) ✅
   - WhatsApp Web (si lo usas) ✅

4. **Sin plantillas pagadas:** Ya no tendrás las plantillas de Meta (las que cobraban), pero puedes crear plantillas de respuesta rápida dentro de Kommo gratis.

---

## 📅 REGISTRO DE MIGRACIÓN

**Fecha de inicio:** ___ / ___ / 2026  
**Hora de inicio:** ___:___  
**Fecha de finalización:** ___ / ___ / 2026  
**Hora de finalización:** ___:___  

**Responsable:** ______________________  
**Firma:** ______________________  

**Incidencias durante el proceso:**
- _____________________________________________
- _____________________________________________
- _____________________________________________

**Estado final:** ☐ Exitoso  ☐ Con observaciones  ☐ Fallido

---

**Documento creado:** 5 de enero de 2026  
**Última actualización:** 5 de enero de 2026  
**Versión:** 1.0


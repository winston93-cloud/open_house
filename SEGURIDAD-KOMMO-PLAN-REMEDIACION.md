# 🔐 PLAN DE REMEDIACIÓN DE SEGURIDAD - INTEGRACIÓN KOMMO

**Fecha:** 18 de diciembre, 2025  
**Proyecto:** Open House - Instituto Winston Churchill  
**Severidad:** CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

Se identificaron múltiples vulnerabilidades de seguridad en la integración con Kommo CRM que permitieron el acceso no autorizado a las cuentas, resultando en:
- Activación de agentes de IA no autorizados
- Envío de spam masivo a través de WhatsApp Business
- Compromiso de credenciales y tokens de acceso

Este documento detalla el plan de remediación en 5 pasos para restaurar la seguridad del sistema.

---

## 🚨 VULNERABILIDADES IDENTIFICADAS

### 1. Credenciales Hardcodeadas en Código Fuente
**Ubicación:** `lib/kommo.ts` líneas 5-14  
**Descripción:** Client ID y Client Secret expuestos directamente en el código  
**Riesgo:** Acceso completo a la API de Kommo si el repositorio es público o comprometido

### 2. Token de Larga Duración Expuesto
**Ubicación:** `lib/kommo.ts` línea 39  
**Descripción:** Token JWT de acceso directo hardcodeado en el código  
**Riesgo:** Acceso permanente a Kommo sin necesidad de autenticación adicional

### 3. Configuración de Integración Expuesta
**Ubicación:** `lib/kommo.ts` líneas 10-12  
**Descripción:** IDs de Pipeline, Status y Usuario responsable expuestos  
**Riesgo:** Los atacantes conocen la estructura interna del CRM

### 4. Números de WhatsApp Business Expuestos
**Ubicación:** `lib/kommo.ts` líneas 30-33  
**Descripción:** Números de teléfono de WhatsApp Business hardcodeados  
**Riesgo:** Objetivo directo para ataques de spam y posible bloqueo por Meta

---

## ✅ PLAN DE REMEDIACIÓN (5 PASOS)

---

## PASO 1: REGENERAR CREDENCIALES EN KOMMO

### Objetivo
Invalidar todas las credenciales comprometidas y generar nuevas credenciales seguras.

### Acciones Requeridas

#### 1.1 Revocar Token de Larga Duración
1. Ingresar a Kommo → **Configuración**
2. Navegar a **Integraciones** → **API**
3. Buscar el token actual y seleccionar **Revocar**
4. Confirmar la revocación

#### 1.2 Regenerar Client Secret
1. En la misma sección de **API**
2. Localizar la integración actual
3. Seleccionar **Regenerar Client Secret**
4. **IMPORTANTE:** Copiar y guardar el nuevo Client Secret en un lugar seguro (NO en el código)

#### 1.3 Generar Nuevo Token de Larga Duración
1. En **API** → **Tokens**
2. Seleccionar **Generar Nuevo Token**
3. Configurar permisos necesarios:
   - ✅ CRM
   - ✅ Files
   - ✅ Notifications
   - ✅ Push Notifications
4. Copiar y guardar el nuevo token (NO en el código)

#### 1.4 Verificar IDs de Configuración
Confirmar los siguientes IDs (pueden haber cambiado):
- Pipeline ID
- Status ID  
- Responsible User ID

### Tiempo Estimado
15-20 minutos

### Responsable
Administrador de Kommo

---

## PASO 2: CREAR VARIABLES DE ENTORNO

### Objetivo
Mover todas las credenciales del código a variables de entorno seguras.

### Estructura de Variables de Entorno

#### Archivo: `.env.local` (local) y Variables de Entorno en Vercel (producción)

```env
# ============================================
# KOMMO API - CREDENCIALES PRINCIPALES
# ============================================
KOMMO_SUBDOMAIN=winstonchurchill
KOMMO_CLIENT_ID=<nuevo_client_id>
KOMMO_CLIENT_SECRET=<nuevo_client_secret>
KOMMO_ACCESS_TOKEN=<nuevo_token_larga_duracion>
KOMMO_REDIRECT_URI=https://open-house-chi.vercel.app/api/auth/kommo/callback

# ============================================
# KOMMO - CONFIGURACIÓN DE PIPELINE
# ============================================
KOMMO_PIPELINE_ID=5030645
KOMMO_STATUS_ID=56296556
KOMMO_RESPONSIBLE_USER_ID=7882301

# ============================================
# KOMMO - WHATSAPP BUSINESS
# ============================================
KOMMO_WHATSAPP_WINSTON=8334378743
KOMMO_WHATSAPP_EDUCATIVO=8333474507

# ============================================
# KOMMO SESIONES - CONFIGURACIÓN ALTERNATIVA
# (Solo si se usa configuración diferente para Sesiones)
# ============================================
# KOMMO_SESIONES_SUBDOMAIN=
# KOMMO_SESIONES_CLIENT_ID=
# KOMMO_SESIONES_CLIENT_SECRET=
# KOMMO_SESIONES_LONG_TOKEN=
# KOMMO_SESIONES_PIPELINE_ID=
# KOMMO_SESIONES_STATUS_ID=
# KOMMO_SESIONES_RESPONSIBLE_USER_ID=
# KOMMO_SESIONES_WHATSAPP=
```

### Acciones Requeridas

#### 2.1 Crear Archivo Local (Desarrollo)
1. En la raíz del proyecto, crear/actualizar `.env.local`
2. Copiar la estructura de arriba
3. Llenar con las nuevas credenciales del PASO 1
4. **VERIFICAR** que `.env.local` esté en `.gitignore`

#### 2.2 Agregar Variables en Vercel (Producción)
1. Ingresar a [Vercel Dashboard](https://vercel.com)
2. Seleccionar el proyecto `open-house-chi`
3. Ir a **Settings** → **Environment Variables**
4. Agregar cada variable **UNA POR UNA**
5. Aplicar a todos los entornos (Production, Preview, Development)

### Tiempo Estimado
10-15 minutos

### Responsable
Desarrollador / DevOps

---

## PASO 3: ACTUALIZAR CÓDIGO FUENTE

### Objetivo
Eliminar todas las credenciales hardcodeadas y migrar a variables de entorno.

### Archivos a Modificar

#### 3.1 Archivo: `lib/kommo.ts`

**Cambios Requeridos:**
- Eliminar objeto `KOMMO_CONFIG` con credenciales hardcodeadas
- Crear función para cargar configuración desde variables de entorno
- Agregar validaciones para variables faltantes
- Actualizar función `getKommoAccessToken()` para usar variable de entorno

#### 3.2 Código Actualizado (Resumen)

```typescript
// Nueva estructura segura
const KOMMO_CONFIG = {
  subdomain: process.env.KOMMO_SUBDOMAIN!,
  clientId: process.env.KOMMO_CLIENT_ID!,
  clientSecret: process.env.KOMMO_CLIENT_SECRET!,
  redirectUri: process.env.KOMMO_REDIRECT_URI!,
  pipelineId: process.env.KOMMO_PIPELINE_ID!,
  statusId: process.env.KOMMO_STATUS_ID!,
  responsibleUserId: process.env.KOMMO_RESPONSIBLE_USER_ID!,
  whatsappNumber: process.env.KOMMO_WHATSAPP_WINSTON!,
};

// Función para obtener token
export async function getKommoAccessToken(integration: 'open-house' | 'sesiones'): Promise<string> {
  const token = integration === 'sesiones' 
    ? process.env.KOMMO_SESIONES_LONG_TOKEN || process.env.KOMMO_ACCESS_TOKEN
    : process.env.KOMMO_ACCESS_TOKEN;
  
  if (!token) {
    throw new Error('KOMMO_ACCESS_TOKEN no configurado');
  }
  
  return token;
}
```

#### 3.3 Validación de Variables
Agregar función de validación al inicio:

```typescript
function validateKommoConfig() {
  const required = [
    'KOMMO_SUBDOMAIN',
    'KOMMO_CLIENT_ID',
    'KOMMO_CLIENT_SECRET',
    'KOMMO_ACCESS_TOKEN'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
}
```

### Tiempo Estimado
20-30 minutos

### Responsable
Desarrollador

---

## PASO 4: DEPLOYMENT Y VERIFICACIÓN

### Objetivo
Desplegar los cambios en producción y verificar el correcto funcionamiento.

### Acciones Requeridas

#### 4.1 Verificación Local
```bash
# 1. Instalar dependencias (si es necesario)
npm install

# 2. Verificar que .env.local existe y está completo
cat .env.local

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Probar endpoint de prueba
curl http://localhost:3000/api/health
```

#### 4.2 Commit y Push
```bash
# 1. Revisar cambios
git status

# 2. Agregar archivos modificados
git add lib/kommo.ts

# 3. Commit con mensaje descriptivo
git commit -m "security: Migrar credenciales Kommo a variables de entorno"

# 4. Push a GitHub
git push origin main
```

#### 4.3 Verificar Deployment en Vercel
1. Vercel detectará el push automáticamente
2. Esperar a que termine el build (2-3 minutos)
3. Verificar logs en Vercel Dashboard
4. Confirmar que no hay errores

#### 4.4 Pruebas en Producción
1. Acceder a: `https://open-house-chi.vercel.app`
2. Probar formulario de Open House
3. Verificar que se crea el lead en Kommo
4. Confirmar que se envía WhatsApp automático
5. Revisar logs en Vercel

### Tiempo Estimado
15-20 minutos (incluyendo build y pruebas)

### Responsable
Desarrollador / DevOps

---

## PASO 5: SEGURIDAD ADICIONAL Y MONITOREO

### Objetivo
Implementar capas adicionales de seguridad y establecer monitoreo continuo.

### 5.1 Seguridad del Repositorio GitHub

#### Verificar Privacidad del Repositorio
1. Ir a GitHub → Repositorio `open-house`
2. **Settings** → **General**
3. Verificar que **Visibility** sea **Private**
4. Si es público, cambiar a privado

#### Limpiar Historial (Opcional - Avanzado)
**ADVERTENCIA:** Solo si el repositorio fue público previamente

```bash
# Usar herramienta BFG Repo Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# O git-filter-repo
git filter-repo --path lib/kommo.ts --invert-paths
```

#### Habilitar Protecciones
1. **Settings** → **Branches**
2. Agregar regla para `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Include administrators

### 5.2 Auditoría de Accesos en Kommo

#### Revisar Logs de Acceso
1. Kommo → **Configuración**
2. **Seguridad** → **Logs de Actividad**
3. Filtrar por:
   - Fechas del incidente
   - IPs desconocidas
   - Acciones sospechosas

#### Revisar Usuarios Activos
1. **Configuración** → **Usuarios**
2. Verificar que todos los usuarios sean legítimos
3. Eliminar usuarios desconocidos
4. Confirmar permisos de cada usuario

### 5.3 Configurar Alertas

#### En Kommo
1. Activar notificaciones de:
   - Nuevos accesos desde IPs desconocidas
   - Cambios en configuración de API
   - Volumen inusual de mensajes

#### En Vercel
1. **Settings** → **Notifications**
2. Activar alertas para:
   - Build failures
   - Error rate spikes
   - High bandwidth usage

### 5.4 Implementar Rate Limiting

#### En la Aplicación
Agregar rate limiting a endpoints sensibles:

```typescript
// Ejemplo de rate limiting por IP
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requests máximo
  message: 'Demasiadas solicitudes, intente más tarde'
});
```

### 5.5 Monitoreo Continuo

#### Checklist Semanal
- [ ] Revisar logs de acceso en Kommo
- [ ] Verificar volumen de leads creados
- [ ] Confirmar que no hay usuarios nuevos no autorizados
- [ ] Revisar logs de errores en Vercel

#### Checklist Mensual
- [ ] Rotar tokens de acceso
- [ ] Auditar permisos de usuarios
- [ ] Revisar integraciones activas
- [ ] Verificar que no hay webhooks sospechosos

### Tiempo Estimado
30-45 minutos (configuración inicial)  
5-10 minutos (monitoreo semanal)

### Responsable
Administrador de Sistemas / Desarrollador

---

## 📊 CRONOGRAMA DE IMPLEMENTACIÓN

| Paso | Descripción | Tiempo | Prioridad | Estado |
|------|-------------|--------|-----------|--------|
| 1 | Regenerar credenciales Kommo | 15-20 min | 🔴 CRÍTICA | ⬜ Pendiente |
| 2 | Crear variables de entorno | 10-15 min | 🔴 CRÍTICA | ⬜ Pendiente |
| 3 | Actualizar código fuente | 20-30 min | 🔴 CRÍTICA | ⬜ Pendiente |
| 4 | Deployment y verificación | 15-20 min | 🔴 CRÍTICA | ⬜ Pendiente |
| 5 | Seguridad adicional | 30-45 min | 🟡 ALTA | ⬜ Pendiente |

**Tiempo Total Estimado:** 1.5 - 2 horas

---

## ✅ CHECKLIST DE VERIFICACIÓN FINAL

### Seguridad
- [ ] Todas las credenciales hardcodeadas fueron eliminadas del código
- [ ] Todas las variables de entorno están configuradas en Vercel
- [ ] Los tokens antiguos fueron revocados en Kommo
- [ ] El archivo `.env.local` está en `.gitignore`
- [ ] El repositorio de GitHub es privado (o credenciales borradas del historial)

### Funcionalidad
- [ ] El formulario de Open House funciona correctamente
- [ ] El formulario de Sesiones Informativas funciona correctamente
- [ ] Los leads se crean en Kommo sin errores
- [ ] Los mensajes de WhatsApp se envían automáticamente
- [ ] Los emails de confirmación se envían correctamente

### Monitoreo
- [ ] Alertas configuradas en Kommo
- [ ] Alertas configuradas en Vercel
- [ ] Logs de acceso revisados
- [ ] Usuarios de Kommo auditados
- [ ] Integraciones y webhooks verificados

---

## 📞 CONTACTOS Y RECURSOS

### Soporte Kommo
- **Email:** support@kommo.com
- **Documentación API:** https://www.amocrm.com/developers/
- **Status Page:** https://status.kommo.com/

### Equipo Interno
- **Desarrollador Principal:** [Nombre]
- **Administrador Kommo:** Karla Garza / Laura
- **Responsable Seguridad:** [Nombre]

---

## 📝 NOTAS ADICIONALES

### Lecciones Aprendidas
1. **NUNCA** almacenar credenciales en código fuente
2. Usar siempre variables de entorno para datos sensibles
3. Implementar autenticación de dos factores (2FA)
4. Auditar regularmente accesos y permisos
5. Mantener contraseñas fuertes y únicas

### Recomendaciones Futuras
1. Considerar usar un gestor de secretos (AWS Secrets Manager, HashiCorp Vault)
2. Implementar rotación automática de tokens
3. Configurar alertas de seguridad más granulares
4. Realizar auditorías de seguridad trimestrales
5. Capacitar al equipo en mejores prácticas de seguridad

---

**Documento generado:** 18 de diciembre, 2025  
**Versión:** 1.0  
**Estado:** Pendiente de implementación


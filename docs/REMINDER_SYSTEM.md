# Sistema de Recordatorios Automáticos

## 📧 Descripción

El sistema de recordatorios automáticos envía un email elegante a los usuarios **un día después** de que se registren en el formulario de inscripción del Open House. El email incluye información personalizada del evento y un diseño atractivo.

## 🎨 Características del Email de Recordatorio

### Diseño
- **Estilo moderno y elegante** con gradientes y animaciones CSS
- **Responsive** - se adapta a dispositivos móviles y desktop
- **Contador de días restantes** hasta el evento
- **Información personalizada** del aspirante y el evento
- **Call-to-action** atractivo

### Contenido
- ✅ Badge de "Recordatorio"
- 📅 Contador de días restantes hasta el evento
- 👤 Información completa del aspirante
- 🎉 Detalles del evento (fecha, hora, lugar)
- 📞 Información de contacto de la institución

## 🏗️ Arquitectura del Sistema

### Componentes

1. **Base de Datos** (`database/schema.sql`)
   - Campos adicionales para tracking de recordatorios:
     - `reminder_sent`: Boolean - indica si se envió el recordatorio
     - `reminder_scheduled_for`: Timestamp - fecha programada para el recordatorio
     - `reminder_sent_at`: Timestamp - fecha real de envío

2. **Template de Email** (`backend/src/reminderEmailTemplate.js`)
   - Template HTML elegante y responsive
   - Cálculo automático de días restantes
   - Información personalizada por nivel académico

3. **API Endpoint** (`app/api/reminders/route.ts`)
   - `POST /api/reminders` - Procesa recordatorios pendientes
   - `GET /api/reminders` - Estado del sistema de recordatorios

4. **Script de Automatización** (`scripts/send-reminders.js`)
   - Script Node.js para ejecutar desde cron job
   - Manejo de errores y logging
   - Verificación de estado del sistema

5. **Configuración** (`scripts/setup-cron.sh`)
   - Script para configurar el cron job automáticamente
   - Configuración de variables de entorno
   - Verificación del sistema

## ⚙️ Configuración e Instalación

### 1. Configurar Variables de Entorno

Edita el archivo `.env` con tus valores:

```bash
REMINDER_API_URL=https://tu-dominio.com/api/reminders
REMINDER_API_TOKEN=tu-token-secreto-muy-seguro
```

### 2. Ejecutar Migración de Base de Datos

```bash
# Conecta a tu base de datos PostgreSQL/Supabase
# Ejecuta el contenido actualizado de database/schema.sql
```

### 3. Configurar Cron Job Automáticamente

```bash
# Ejecuta el script de configuración
./scripts/setup-cron.sh
```

### 4. Configuración Manual del Cron Job

Si prefieres configurar manualmente:

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ajusta la ruta según tu proyecto):
0 9 * * * cd /ruta/completa/al/proyecto && /usr/bin/node scripts/send-reminders.js >> logs/reminders.log 2>&1
```

## 🚀 Uso del Sistema

### Envío Automático
- El sistema envía recordatorios **automáticamente** todos los días a las 9:00 AM
- Solo procesa inscripciones que tengan más de 24 horas de antigüedad
- Marca automáticamente los recordatorios como enviados

### Pruebas Manuales

```bash
# Enviar recordatorios manualmente
node scripts/send-reminders.js

# Verificar estado del sistema
node scripts/send-reminders.js --status

# Ver logs
tail -f logs/reminders.log
```

### API Endpoints

```bash
# Verificar recordatorios pendientes
GET /api/reminders

# Procesar recordatorios (requiere token de autorización)
POST /api/reminders
Authorization: Bearer tu-token-secreto
```

## 📊 Fechas de Eventos por Nivel

| Nivel | Fecha | Hora | Institución |
|-------|-------|------|-------------|
| Maternal/Kinder | 29 de noviembre | 9:00 AM | Instituto Educativo Winston |
| Primaria | 6 de diciembre | 9:00 AM - 11:30 AM | Instituto Winston Churchill |
| Secundaria | 6 de diciembre | 11:30 AM - 2:00 PM | Instituto Winston Churchill |

## 🔍 Monitoreo y Logs

### Logs del Sistema
- **Ubicación**: `logs/reminders.log`
- **Contenido**: Registro de cada ejecución del cron job
- **Formato**: Timestamp, resultado, detalles de errores

### Verificación de Estado
```bash
# Ver recordatorios pendientes
curl -X GET http://localhost:3000/api/reminders

# Verificar cron jobs
crontab -l

# Ver logs en tiempo real
tail -f logs/reminders.log
```

## 🛠️ Troubleshooting

### Problemas Comunes

1. **No se envían recordatorios**
   - Verificar que el cron job esté configurado: `crontab -l`
   - Revisar logs: `tail -f logs/reminders.log`
   - Verificar que la aplicación esté ejecutándose

2. **Error de autorización**
   - Verificar que `REMINDER_API_TOKEN` esté configurado correctamente
   - Asegurarse de que el token coincida en `.env` y en las peticiones

3. **Error de base de datos**
   - Verificar conexión a Supabase
   - Confirmar que los campos de recordatorio existan en la tabla

4. **Error de email**
   - Verificar credenciales de Gmail en `emailConfig.js`
   - Confirmar que la app password esté configurada correctamente

### Comandos de Diagnóstico

```bash
# Verificar configuración
node scripts/send-reminders.js --status

# Probar conexión a la API
curl -X GET http://localhost:3000/api/reminders

# Verificar variables de entorno
echo $REMINDER_API_TOKEN
```

## 📈 Métricas y Estadísticas

El sistema registra:
- ✅ Número de recordatorios enviados exitosamente
- ❌ Número de errores
- 📊 Tiempo de procesamiento
- 📧 Emails que fallaron (con detalles del error)

## 🔒 Seguridad

- **Token de autorización** requerido para el endpoint POST
- **Validación de datos** antes del envío
- **Rate limiting** implícito (un envío por día)
- **Logs seguros** sin exponer información sensible

## 📝 Notas de Desarrollo

- El template de email es completamente responsive
- Los días restantes se calculan dinámicamente
- El sistema es fault-tolerant (continúa aunque algunos emails fallen)
- Compatible con diferentes proveedores de hosting (Vercel, Netlify, etc.)

## 🔄 Actualizaciones Futuras

Posibles mejoras:
- Recordatorios múltiples (3 días, 1 día, día del evento)
- Personalización por usuario
- Integración con WhatsApp para recordatorios
- Dashboard de administración
- Métricas detalladas de apertura y clicks

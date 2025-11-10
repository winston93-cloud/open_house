# Formulario de Inscripción - Instituto Tampico

Este proyecto contiene un formulario de inscripción para sesiones informativas del Instituto Tampico, desarrollado con Node.js (backend) y Next.js con TypeScript (frontend).

## Estructura del Proyecto

```
open_house/
├── backend/                 # Backend Node.js
│   ├── src/
│   │   └── index.js        # Servidor Express
│   ├── package.json
│   └── config.js
├── frontend/               # Frontend Next.js
│   ├── app/
│   │   ├── components/
│   │   │   └── InscripcionForm.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
└── package.json           # Scripts principales
```

## Características

### Backend (Node.js + Express)
- ✅ API REST para manejo de inscripciones
- ✅ Validación de datos (CURP, email, campos obligatorios)
- ✅ CORS configurado para frontend
- ✅ Middleware de seguridad (Helmet)
- ✅ Manejo de errores

### Frontend (Next.js + TypeScript)
- ✅ Formulario responsivo con validación en tiempo real
- ✅ Diseño que replica el formulario original
- ✅ Validación de campos obligatorios
- ✅ Estados de carga y mensajes de éxito/error
- ✅ CSS global con diseño moderno

## Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm run install:all
```

### 2. Ejecutar en modo desarrollo
```bash
npm run dev
```

Esto ejecutará:
- Backend en http://localhost:3001
- Frontend en http://localhost:3000

### 3. Ejecutar solo backend
```bash
npm run dev:backend
```

### 4. Ejecutar solo frontend
```bash
npm run dev:frontend
```

## Campos del Formulario

### Datos Generales del Aspirante
- Nombre del Aspirante *
- Nivel Académico
- Grado Escolar al que aspira *
- CURP *
- Fecha de nacimiento *
- Género *
- Escuela de procedencia *

### Datos de Contacto
- Nombre completo *
- Correo electrónico *
- WhatsApp *
- Parentesco *
- Personas que asistirán al evento *

## API Endpoints

### POST /api/inscripcion
Registra una nueva inscripción.

**Body:**
```json
{
  "nombreAspirante": "string",
  "nivelAcademico": "string",
  "gradoEscolar": "string",
  "curp": "string",
  "fechaNacimiento": "string",
  "genero": "string",
  "escuelaProcedencia": "string",
  "nombreCompleto": "string",
  "correo": "string",
  "whatsapp": "string",
  "parentesco": "string",
  "personasAsistiran": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inscripción registrada exitosamente",
  "data": {
    "nombreAspirante": "string",
    "nivelAcademico": "string",
    "gradoEscolar": "string"
  }
}
```

### GET /api/health
Verifica el estado del servidor.

## Validaciones

- **CURP**: Formato mexicano válido
- **Email**: Formato de email válido
- **Campos obligatorios**: Todos los campos marcados con * son requeridos
- **Validación en tiempo real**: Los errores se muestran mientras el usuario escribe

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js, CORS, Helmet
- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: CSS Global con diseño responsivo
- **Validación**: JavaScript nativo en frontend y backend

## Módulo de envío de SMS

El sistema puede enviar SMS usando un teléfono Android configurado con la app **SMS Mobile API**.

1. Instala la app en el teléfono y activa el modo gateway.
2. Obtén tu API Key desde la sección *Help Center*.
3. Usa la URL `https://api.smsmobileapi.com/sendsms/`.
4. Configura las variables en `.env.local`:

```
SMS_GATEWAY_URL=https://api.smsmobileapi.com/sendsms/
SMS_GATEWAY_TOKEN=tu_api_key
NEXT_PUBLIC_SMS_MODULE_PASSWORD=winston2025
```

El módulo se encuentra en `/sms` (restringido por contraseña). Desde ahí se pueden enviar SMS manuales a cualquier número mediante la API interna `/api/sms/send`.

### SMS Automáticos por Ventana de 24h (Kommo Integration)

El sistema monitorea automáticamente los leads de Kommo y envía SMS cuando se detecta que han pasado más de 24 horas sin comunicación.

**Cómo funciona:**

1. Cada lead creado se registra en la tabla `kommo_lead_tracking` con un timestamp `last_contact_time`.
2. Kommo envía webhooks cuando hay actividad en leads (actualizaciones, notas, mensajes).
3. Cada webhook recibido dispara una revisión automática de TODOS los leads.
4. Si un lead tiene >24h sin comunicación y no se le ha enviado SMS, se envía automáticamente.
5. Se marca el lead con un tag "SMS-24h-Enviado" en Kommo para identificación visual.

**Configuración del Webhook en Kommo:**

1. Ve a **Kommo → Settings → API → Webhooks**
2. Añade un nuevo webhook:
   - URL: `https://open-house-chi.vercel.app/api/kommo/webhook`
   - Eventos a suscribir:
     - ✅ Lead added
     - ✅ Lead updated
     - ✅ Lead status changed
     - ✅ Note added (opcional pero recomendado)
3. Guarda y verifica que el webhook esté activo.

**Base de datos:**

Ejecuta el schema en Supabase: `database/schema-kommo-tracking.sql`

```sql
-- Crear la tabla de tracking
CREATE TABLE kommo_lead_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kommo_lead_id BIGINT NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  plantel VARCHAR(20) NOT NULL,
  last_contact_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sms_24h_sent BOOLEAN DEFAULT FALSE,
  lead_status VARCHAR(50) DEFAULT 'active',
  -- ... más campos (ver schema completo)
);
```

El sistema es completamente automático: no requiere intervención humana ni cron jobs adicionales.

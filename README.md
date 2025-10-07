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

## Próximos Pasos

- [ ] Integración con base de datos
- [ ] Envío de emails de confirmación
- [ ] Panel de administración
- [ ] Exportación de datos
- [ ] Tests unitarios y de integración

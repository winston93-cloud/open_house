# 🤖 Asistente Virtual con IA - Guía de Configuración

## Descripción

El asistente virtual es un chatbot powered by Claude AI (Anthropic) que ayuda a los padres de familia a resolver dudas sobre el proceso de inscripción, Open House, y Sesiones Informativas.

## ✨ Características

- **Chat en tiempo real** con streaming de respuestas
- **Entrenado** con información específica del proyecto
- **Contexto completo** sobre fechas, horarios, documentos, procesos
- **Interfaz moderna** y responsiva
- **Protegido** con contraseña (winston2025)
- **Botón flotante** accesible desde todas las páginas principales

## 🚀 Configuración

### 1. Obtener API Key de Anthropic

1. Ve a: https://console.anthropic.com/
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en el menú
4. Haz clic en **Create Key**
5. Copia la API key (guárdala en un lugar seguro, solo se muestra una vez)

### 2. Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto **open_house**
3. Ve a **Settings → Environment Variables**
4. Agrega una nueva variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-api03-...` (tu API key de Anthropic)
   - **Environment**: Selecciona Production, Preview, y Development
5. Haz clic en **Save**
6. **Importante**: Después de agregar la variable, haz un nuevo deploy:
   - Ve a **Deployments**
   - Haz clic en los tres puntos del último deployment
   - Selecciona **Redeploy**

### 3. Verificar que funciona

1. Ve a: https://open-house-chi.vercel.app/asistente
2. Ingresa la contraseña: `winston2025`
3. Escribe un mensaje de prueba: "¿Qué es un Open House?"
4. Deberías ver la respuesta del asistente en tiempo real

## 📝 Uso

### Acceso

- **URL**: `/asistente`
- **Contraseña**: `winston2025` (igual que admin)

### Botón flotante

En las páginas principales (Open House y Sesiones), verás un botón flotante en la esquina inferior derecha con el emoji 🤖. Al pasar el mouse, dice "¿Necesitas ayuda?". Haz clic para acceder al asistente.

## 🎯 Capacidades del asistente

El asistente puede ayudar con:

✅ Explicar qué es un Open House y Sesiones Informativas  
✅ Proporcionar fechas y horarios de eventos  
✅ Indicar documentos necesarios para inscripción  
✅ Explicar el proceso de admisión paso a paso  
✅ Responder preguntas frecuentes  
✅ Diferencias entre Winston Churchill y Educativo Tampico  
✅ Información sobre niveles académicos (Maternal, Kinder, Primaria, Secundaria)  
✅ Direccionar a contacto humano cuando sea necesario  

❌ **NO puede**:
- Proporcionar costos específicos (remite al WhatsApp)
- Confirmar o modificar inscripciones (remite al WhatsApp)
- Acceder a datos personales de usuarios

## 🛠️ Personalización

### Actualizar el contexto del asistente

El asistente "conoce" la información que está en el archivo:  
**`lib/assistant-context.ts`**

Para actualizar la información:

1. Abre el archivo `lib/assistant-context.ts`
2. Modifica las secciones relevantes:
   - `ASSISTANT_CONTEXT`: Información sobre el instituto, fechas, FAQ, etc.
   - `ASSISTANT_INSTRUCTIONS`: Comportamiento y tono del asistente
3. Guarda y haz commit
4. El cambio se aplicará automáticamente en el siguiente deploy

### Cambiar el comportamiento del asistente

Edita la sección `ASSISTANT_INSTRUCTIONS` en `lib/assistant-context.ts` para modificar:
- El tono de las respuestas (más formal, más casual, etc.)
- Las reglas de lo que puede/no puede hacer
- El formato de las respuestas
- Las limitaciones

### Ejemplos de personalización

#### Cambiar fechas de eventos

```typescript
// En lib/assistant-context.ts, busca la sección de fechas:

**Fechas de Open House:**
- Sábado 23 de noviembre de 2024 - 10:00 a 12:00 hrs
- Sábado 30 de noviembre de 2024 - 10:00 a 12:00 hrs
```

#### Agregar nueva pregunta frecuente

```typescript
// En la sección ### ¿Preguntas frecuentes

### ¿Tienen programa de idiomas?
Sí, contamos con programa de inglés como segunda lengua desde Maternal. 
En Winston Churchill, el programa es 50% inglés y 50% español.
```

## 🔧 Troubleshooting

### El asistente no responde

**Posibles causas:**

1. **API Key no configurada**
   - Verifica en Vercel Settings → Environment Variables
   - Asegúrate de que `ANTHROPIC_API_KEY` esté presente
   - Redeploy después de agregar la variable

2. **API Key inválida**
   - Verifica que la key sea correcta
   - Genera una nueva key en Anthropic Console
   - Actualiza en Vercel

3. **Cuota excedida**
   - Verifica tu cuenta de Anthropic
   - Revisa el uso y límites en el dashboard
   - Agrega crédito si es necesario

### Error: "API key de Anthropic no configurada"

Esto significa que la variable de entorno no está presente. Sigue los pasos de **Configuración** arriba.

### El stream se corta a la mitad

Esto puede pasar si:
- Hay problemas de red
- El mensaje es muy largo (max 1024 tokens)
- Para aumentar el límite, edita `app/api/assistant/route.ts` y cambia `max_tokens`

### El asistente da respuestas incorrectas

Si el asistente proporciona información desactualizada:
1. Actualiza `lib/assistant-context.ts` con la información correcta
2. Haz commit y push
3. El asistente usará la información actualizada

## 💰 Costos

Claude Sonnet 3.5 (el modelo usado) tiene los siguientes precios (Anthropic, Nov 2024):

- **Input**: ~$3 USD por millón de tokens
- **Output**: ~$15 USD por millón de tokens

**Estimación de uso:**
- Cada conversación usa ~500-1000 tokens
- 1000 conversaciones ≈ $10-20 USD
- El contexto del proyecto (~2000 tokens) se envía en cada consulta

**Recomendación:**
- Monitorea el uso en Anthropic Console
- Configura alertas de gasto
- Considera límites de rate si es necesario

## 📊 Monitoreo

### Logs en Vercel

Para ver los logs del asistente:
1. Ve a Vercel Dashboard → tu proyecto
2. Haz clic en **Deployments**
3. Selecciona el deployment actual
4. Ve a la pestaña **Functions**
5. Busca `/api/assistant`

### Logs en Anthropic

Para ver el uso de API:
1. Ve a Anthropic Console
2. Sección **Usage**
3. Revisa las métricas de uso

## 🔐 Seguridad

- El asistente está protegido con contraseña (winston2025)
- NO tiene acceso a la base de datos de inscripciones
- NO puede modificar datos
- NO puede acceder a información personal de otros usuarios
- Solo proporciona información pública/general del instituto

## 📞 Soporte

Si tienes problemas con el asistente:
1. Revisa esta documentación
2. Verifica los logs en Vercel
3. Contacta al desarrollador del proyecto


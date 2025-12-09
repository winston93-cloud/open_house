# CALENDARIO DE ENVÍOS DE RECORDATORIOS
## Sistema de Open House y Sesiones Informativas
## AÑO 2026

---

## 🏠 OPEN HOUSE 2026

| Fecha de Envío | Hora | Nivel | Fecha del Evento | Institución |
|----------------|------|-------|------------------|-------------|
| **Jueves 16 de Enero 2026** | 9:00 AM | Primaria/Secundaria | 17 de Enero, 9:00-11:30 AM (Primaria) / 11:30 AM-2:00 PM (Secundaria) | Instituto Winston Churchill |
| **Jueves 23 de Enero 2026** | 9:00 AM | Maternal/Kinder | 24 de Enero, 9:00 AM | Instituto Educativo Winston |

---

## 📚 SESIONES INFORMATIVAS 2026

| Fecha de Envío | Hora | Nivel | Fecha del Evento | Institución |
|----------------|------|-------|------------------|-------------|
| **Sábado 18 de Enero 2026** | 9:00 AM | Primaria | 19 de Enero, 6:00 PM | Instituto Winston Churchill |
| **Domingo 19 de Enero 2026** | 9:00 AM | Secundaria | 20 de Enero, 6:00 PM | Instituto Winston Churchill |
| **Sábado 25 de Enero 2026** | 9:00 AM | Maternal/Kinder | 26 de Enero, 6:00 PM | Instituto Educativo Winston |

---

## 🚀 MÉTODOS DE EJECUCIÓN

### **Opción 1: Automático (Recomendado)**
El sistema Vercel Cron se ejecutará automáticamente cada día a las 9:00 AM (hora de México).
- No requiere intervención manual
- Se ejecuta en segundo plano
- Procesa automáticamente los recordatorios programados para ese día

### **Opción 2: Manual (Respaldo)**
Si necesitas enviar recordatorios manualmente, abre esta URL en tu navegador:

**URL del Endpoint Manual:**
```
https://open-house-chi.vercel.app/api/enviar-recordatorios-manual
```

**Cuándo usar el endpoint manual:**
- Si el cron automático no se ejecutó
- Para enviar recordatorios fuera del horario programado
- Como respaldo en caso de emergencia

---

## 📊 RESUMEN

- **Total de envíos:** 5 recordatorios
- **Período:** 16 de enero - 25 de enero 2026 (9 días)
- **Formularios:** 2 (Open House y Sesiones Informativas)
- **Niveles:** Maternal, Kinder, Primaria, Secundaria

---

## 🔄 FILTROS POR AÑO

El sistema ahora incluye filtros por **año** para diferenciar eventos:

- **2025:** Eventos de Nov-Dic 2025 (ya realizados)
- **2026:** Eventos de Enero 2026 (actuales)

### En el Admin Dashboard:
- Selector de año en la esquina superior derecha
- Los reportes Excel incluyen columna de año
- Las estadísticas se calculan por año seleccionado

### En los Recordatorios:
- Solo se envían recordatorios del año activo (2026)
- Los eventos anteriores (2025) se mantienen como histórico

---

## 📝 NOTAS IMPORTANTES

1. Los recordatorios se envían **1 día antes** del evento
2. **Solo se envían EMAILS** (SMS desactivados hasta implementar Bridge API)
3. Los recordatorios se envían a las **9:00 AM hora de México** (UTC-6)
4. El sistema filtra automáticamente por `ciclo_escolar = '2026'`
5. Los datos históricos del año 2025 se mantienen intactos en la base de datos

---

## 🗓️ HISTÓRICO - AÑO 2025

**OPEN HOUSE 2025 (Realizados):**
- Viernes 28 de Noviembre 2025: Maternal/Kinder (29 Nov)
- Viernes 5 de Diciembre 2025: Primaria/Secundaria (6 Dic)

**SESIONES INFORMATIVAS 2025 (Realizadas):**
- Domingo 30 de Noviembre 2025: Maternal/Kinder (1 Dic)
- Domingo 7 de Diciembre 2025: Primaria (8 Dic)
- Lunes 8 de Diciembre 2025: Secundaria (9 Dic)

---

**Última actualización:** 9 de Diciembre de 2025
**Sistema:** Winston Open House & Sesiones Informativas

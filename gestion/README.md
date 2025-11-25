# Sistema de Gestión de Becas Winston - PDF

## 📋 Descripción

Sistema de reportes en PDF para gestión de becas escolares por nivel educativo.

## 🎓 Reportes Disponibles

### 1. **Maternal y Kinder** 🧸
- Muestra ambos niveles separados en el mismo PDF
- Maternal A y Maternal B
- Kínder 1, 2 y 3

### 2. **Primaria** 📚
- 1ro a 6to grado

### 3. **Secundaria** 🎓
- 7mo, 8vo y 9no grado

## 📊 Estructura del Reporte

Cada PDF muestra:
```
NIVEL EDUCATIVO
━━━━━━━━━━━━━━━━━━━━━━━━━
Porcentaje   | Total Alumnos
━━━━━━━━━━━━━━━━━━━━━━━━━
10%          | 5
20%          | 15
30%          | 8
...
━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:       | 45 alumnos
```

## 🔍 Filtros Aplicados

### Tabla `alumno`:
- `alumno_ciclo_escolar = 22` (Ciclo 2017-2018)
- `alumno_status = 1` (Activo)
- `alumno_nivel` = 1, 2, 3 o 4

### Tabla `alumno_beca`:
- `beca_ciclo_escolar = 22`
- `beca_estatus = 1` (Beca activa)
- Agrupado por `beca_porcentaje`

## 📁 Archivos del Sistema

```
gestion/
├── index.php                      ← Página principal
├── config.php                     ← Conexión MySQL
├── fpdf.php                       ← Librería PDF
├── reporte-maternal-kinder.php    ← PDF Maternal + Kínder
├── reporte-primaria.php           ← PDF Primaria
├── reporte-secundaria.php         ← PDF Secundaria
├── styles.css                     ← Estilos
├── test-conexion.php              ← Prueba de BD
└── README.md                      ← Este archivo
```

## 🚀 Instalación

1. **Subir al hosting:**
   - Sube toda la carpeta `gestion` a: `public_html/open_house/gestion/`

2. **Acceder:**
   - URL: `https://winston93.edu.mx/open_house/gestion/`

3. **Probar conexión (opcional):**
   - `https://winston93.edu.mx/open_house/gestion/test-conexion.php`
   - ⚠️ **Eliminar después por seguridad**

## 📝 Niveles y Grados

| Nivel | Nombre      | Grados                |
|-------|-------------|-----------------------|
| 1     | Maternal    | 1=Maternal A, 2=Maternal B |
| 2     | Kínder      | 1=Kinder-1, 2=Kinder-2, 3=Kinder-3 |
| 3     | Primaria    | 1=1ro, 2=2do, ... 6=6to |
| 4     | Secundaria  | 1=7mo, 2=8vo, 3=9no |

## 🔧 Características Técnicas

✅ **PHP 5.1 compatible**  
✅ **FPDF** para generación de PDFs  
✅ **MySQL** con funciones `mysql_*`  
✅ **UTF-8** para tildes y ñ  
✅ **Responsive** en el índice  
✅ **PDFs se abren en nueva pestaña**  

## 🎨 Personalización

### Cambiar Ciclo Escolar:
Edita en cada archivo `reporte-*.php`:
```php
WHERE alumno_ciclo_escolar = 22  // Cambiar número
AND beca_ciclo_escolar = 22      // Cambiar número
```

### Cambiar Colores del PDF:
```php
$pdf->SetFillColor(255, 215, 0);  // RGB del color dorado
```

## ⚠️ Notas Importantes

- Los PDFs se generan dinámicamente desde la base de datos
- Si no hay alumnos con becas, muestra mensaje informativo
- Los totales se calculan automáticamente
- Solo muestra alumnos activos con becas activas

## 📞 Soporte

Si hay errores:
1. Revisar logs de PHP en cPanel
2. Verificar credenciales en `config.php`
3. Probar `test-conexion.php`
4. Verificar que existan datos en las tablas

## 📄 Licencia

Uso exclusivo del Colegio Educativo Winston Churchill.

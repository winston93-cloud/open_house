# Sistema de Gestión Administrativa - Winston Churchill

## 📋 Instrucciones de Instalación

### 1. Subir archivos al hosting

Sube toda la carpeta `gestion` a tu hosting mediante FTP o el administrador de archivos de cPanel.

**Ruta final:** `public_html/open_house/gestion/`

**URL de acceso:** `https://winston93.edu.mx/open_house/gestion/`

### 2. Verificar permisos

Los archivos PHP deben tener permisos **644** y las carpetas **755**

### 3. Estructura de archivos

```
gestion/
├── index.php              (Página principal con las 3 tarjetas)
├── config.php             (Configuración de base de datos)
├── maternal-kinder.php    (Listado de alumnos Maternal/Kinder)
├── primaria.php           (Listado de alumnos Primaria)
├── secundaria.php         (Listado de alumnos Secundaria)
├── styles.css             (Estilos del sistema)
└── README.md              (Este archivo)
```

### 4. Configuración de Base de Datos

El archivo `config.php` ya está configurado con tus credenciales:
- Host: localhost
- Usuario: winston_richard
- Password: 101605
- Base de datos: winston_general

### 5. Ajustar las consultas SQL

**⚠️ IMPORTANTE:** Necesitas verificar que los nombres de las columnas en las consultas coincidan con tu tabla `alumno`.

Actualmente el sistema espera estas columnas:
- `nombre`
- `nivel`
- `grado`
- `edad`
- `tutor`
- `telefono`
- `email`

**Si tus columnas tienen otros nombres, edita los archivos:**
- `maternal-kinder.php`
- `primaria.php`
- `secundaria.php`

Y cambia los nombres en las consultas SQL y en la tabla HTML.

### 6. Compatibilidad PHP

El código está desarrollado para **PHP 5.1** usando `mysql_*` functions.

**Nota:** Si tu hosting usa PHP 7+ necesitarás actualizar a `mysqli_*` o PDO.

## 🎨 Características

✅ Diseño elegante con degradados azul marino
✅ 3 tarjetas principales con hover effects
✅ Listados de alumnos por nivel
✅ Botón de impresión en cada listado
✅ Responsive (funciona en móviles)
✅ Compatible con PHP 5.1

## 🔧 Próximos pasos

1. Verificar la estructura de la tabla `alumno` en phpMyAdmin
2. Ajustar los nombres de columnas si es necesario
3. Agregar funcionalidad de exportar a PDF si lo deseas
4. Agregar filtros por grado o búsqueda

## 📞 Soporte

Si hay algún error, revisa:
1. Los logs de PHP en cPanel
2. La consola del navegador (F12)
3. Verifica que la tabla `alumno` exista en la base de datos


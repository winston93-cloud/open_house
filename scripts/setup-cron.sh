#!/bin/bash

# Script para configurar el cron job de recordatorios automáticos
# Este script configura el sistema para enviar recordatorios diariamente

echo "🔧 Configurando sistema de recordatorios automáticos..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js antes de continuar"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_PATH="$PROJECT_DIR/scripts/send-reminders.js"

echo "📍 Directorio del proyecto: $PROJECT_DIR"
echo "📍 Ruta del script: $SCRIPT_PATH"

# Verificar que el script existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: No se encontró el script send-reminders.js"
    exit 1
fi

echo "✅ Script encontrado"

# Hacer el script ejecutable
chmod +x "$SCRIPT_PATH"
echo "✅ Script hecho ejecutable"

# Crear el comando del cron job
CRON_COMMAND="0 9 * * * cd $PROJECT_DIR && /usr/bin/node $SCRIPT_PATH >> $PROJECT_DIR/logs/reminders.log 2>&1"

echo "📝 Comando del cron job:"
echo "   $CRON_COMMAND"

# Crear directorio de logs si no existe
mkdir -p "$PROJECT_DIR/logs"
echo "✅ Directorio de logs creado"

# Configurar variables de entorno si no existen
ENV_FILE="$PROJECT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creando archivo .env..."
    cat > "$ENV_FILE" << EOF
# Configuración para recordatorios automáticos
REMINDER_API_URL=http://localhost:3000/api/reminders
REMINDER_API_TOKEN=default-secret-token

# Cambiar estos valores según tu configuración
# REMINDER_API_URL=https://tu-dominio.com/api/reminders
# REMINDER_API_TOKEN=tu-token-secreto-aqui
EOF
    echo "✅ Archivo .env creado"
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus valores reales"
else
    echo "✅ Archivo .env ya existe"
fi

# Función para agregar el cron job
add_cron_job() {
    # Verificar si ya existe el cron job
    if crontab -l 2>/dev/null | grep -q "send-reminders.js"; then
        echo "⚠️  Ya existe un cron job para recordatorios"
        echo "📋 Cron jobs actuales relacionados:"
        crontab -l 2>/dev/null | grep "send-reminders.js"
        echo ""
        read -p "¿Deseas reemplazar el cron job existente? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Operación cancelada"
            return 1
        fi
        
        # Remover cron jobs existentes
        (crontab -l 2>/dev/null | grep -v "send-reminders.js") | crontab -
        echo "✅ Cron jobs anteriores removidos"
    fi
    
    # Agregar el nuevo cron job
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
    echo "✅ Cron job agregado exitosamente"
    return 0
}

# Función para mostrar el estado actual
show_status() {
    echo ""
    echo "📊 Estado actual del sistema:"
    echo "================================"
    
    echo "📅 Cron jobs configurados:"
    if crontab -l 2>/dev/null | grep -q "send-reminders.js"; then
        crontab -l 2>/dev/null | grep "send-reminders.js" | while read line; do
            echo "   ✅ $line"
        done
    else
        echo "   ❌ No hay cron jobs configurados"
    fi
    
    echo ""
    echo "📁 Archivos del sistema:"
    echo "   Script: $([ -f "$SCRIPT_PATH" ] && echo "✅ Existe" || echo "❌ No existe")"
    echo "   Logs: $([ -d "$PROJECT_DIR/logs" ] && echo "✅ Directorio existe" || echo "❌ No existe")"
    echo "   .env: $([ -f "$ENV_FILE" ] && echo "✅ Existe" || echo "❌ No existe")"
    
    echo ""
    echo "🔍 Verificación del script:"
    if node "$SCRIPT_PATH" --status 2>/dev/null; then
        echo "✅ Script funciona correctamente"
    else
        echo "❌ Error al ejecutar el script"
    fi
}

# Menú principal
echo ""
echo "🚀 Configuración de Recordatorios Automáticos"
echo "=============================================="
echo ""
echo "Opciones disponibles:"
echo "1) Agregar/actualizar cron job"
echo "2) Mostrar estado del sistema"
echo "3) Probar envío de recordatorios (manual)"
echo "4) Salir"
echo ""

read -p "Selecciona una opción (1-4): " -n 1 -r
echo ""

case $REPLY in
    1)
        add_cron_job
        ;;
    2)
        show_status
        ;;
    3)
        echo "🧪 Ejecutando prueba manual..."
        cd "$PROJECT_DIR"
        node "$SCRIPT_PATH"
        ;;
    4)
        echo "👋 ¡Hasta luego!"
        exit 0
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "🏁 Configuración completada"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus valores reales"
echo "2. Verifica que tu aplicación esté ejecutándose"
echo "3. Revisa los logs en $PROJECT_DIR/logs/reminders.log"
echo ""
echo "💡 Comandos útiles:"
echo "   Ver logs: tail -f $PROJECT_DIR/logs/reminders.log"
echo "   Ver cron jobs: crontab -l"
echo "   Probar manualmente: node $SCRIPT_PATH"
echo "   Verificar estado: node $SCRIPT_PATH --status"

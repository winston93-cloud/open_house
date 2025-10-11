#!/bin/bash

# Script wrapper para ejecutar el sistema de recordatorios
# Carga las variables de entorno necesarias

# Directorio del proyecto
PROJECT_DIR="/home/mario/Proyectos/open_house"
cd "$PROJECT_DIR"

# Cargar variables de entorno
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teHJjY3Jibm9lbmthaGVmcnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg0OCwiZXhwIjoyMDY5NzI3ODQ4fQ._SIR3rmq7TWukuym30cCP4BAKGe-dhnillDV0Bz6Hf0"
export NEXT_PUBLIC_SUPABASE_URL="https://nmxrccrbnoenkahefrrw.supabase.co"
export EMAIL_USER="sistemas.desarrollo@winston93.edu.mx"
export EMAIL_PASS="ckxc xdfg oxqx jtmm"

# Ejecutar el script de recordatorios
/usr/bin/node "$PROJECT_DIR/scripts/send-reminders-standalone.js" "$@"

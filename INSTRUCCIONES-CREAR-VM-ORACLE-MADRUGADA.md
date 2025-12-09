# 🌙 INSTRUCCIONES PARA CREAR VM EN ORACLE CLOUD - MADRUGADA

**Fecha:** 2 de diciembre 2025  
**Horario recomendado:** 2:00 AM - 6:00 AM hora de México  
**Objetivo:** Crear instancia Always Free en Oracle Cloud para el SMS Bridge API

---

## 📋 CONTEXTO DEL PROBLEMA

### Situación actual:
- ✅ Cuenta en Oracle Cloud creada
- ✅ Región: Noreste de México (Monterrey) - `mx-monterrey-1`
- ❌ Error al crear VM: "Out of capacity for shape VM.Standard.A1.Flex in availability domain AD-1"
- ❌ No se puede cambiar a otra región (límite de regiones alcanzado)
- ❌ La región Monterrey solo tiene 1 Availability Domain (AD-1), no hay AD-2 ni AD-3

### Por qué intentar en la madrugada:
- Menos usuarios activos = más recursos disponibles
- Mayor probabilidad de encontrar capacidad liberada
- Horarios 2:00 AM - 6:00 AM son los mejores

---

## 🎯 OBJETIVO

Crear una instancia Always Free con estas especificaciones:
- **Nombre:** `sms-gateway-bridge`
- **Image:** Oracle Linux 9 (o Ubuntu 22.04 si está disponible)
- **Shape:** VM.Standard.A1.Flex
- **OCPUs:** 1 (máximo disponible en free tier)
- **Memory:** 6 GB (máximo disponible en free tier)
- **Networking:** VCN y Subnet nuevas (públicas)
- **IP pública:** SÍ (muy importante)
- **SSH keys:** Generar par de claves
- **Boot volume:** 46.6 GB (default)

---

## 📝 PASOS DETALLADOS PARA CREAR LA VM

### Paso 1: Acceder a Oracle Cloud

1. Ve a: https://cloud.oracle.com/
2. Inicia sesión con tu cuenta
3. Verifica que estés en la región: **"Noreste de México (Monterrey)"**

### Paso 2: Ir a Compute > Instances

1. En el menú hamburguesa (☰), busca **"Compute"**
2. Haz clic en **"Instances"** o **"Instancias"**
3. Haz clic en el botón **"Create Instance"** o **"Crear instancia"**

### Paso 3: Configurar Información Básica

#### 3.1 Nombre y Compartimento
- **Name:** `sms-gateway-bridge`
- **Create in compartment:** `sistemasdesarrollo (root)` (o el que tengas)

#### 3.2 Image and Shape

**Image:**
- Haz clic en **"Change image"** o **"Cambiar imagen"**
- Busca **"Oracle Linux 9"** o **"Canonical Ubuntu 22.04"**
- Selecciona la que esté disponible (preferible Ubuntu, pero Oracle Linux también funciona)
- Debe decir **"Always Free-eligible"**

**Shape:**
- Haz clic en **"Change shape"** o **"Cambiar forma"**
- Selecciona **"Ampere"** (ARM-based processor)
- En la tabla, selecciona **"VM.Standard.A1.Flex"**
- Debe mostrar: **"Always Free-eligible"**
- **OCPUs:** 1 (máximo disponible)
- **Memory:** 6 GB (máximo disponible)
- Haz clic en **"Select shape"**

**⚠️ IMPORTANTE:** Si ves el error "Out of capacity", haz clic en "Cancel" y vuelve a intentar en 30-60 minutos.

#### 3.3 Placement (Colocación)

- **Availability Domain:** Se mostrará fijo como **"AD-1"** (no se puede cambiar, es normal)
- **Fault Domain:** Déjalo en **"No preference"** o sin especificar (no selecciones ninguno)

**⚠️ NOTA:** No intentes cambiar el Availability Domain, la región Monterrey solo tiene AD-1.

### Paso 4: Configurar Networking

#### 4.1 Primary Network
- Selecciona: **"Create new virtual cloud network"** o **"Crear nueva red virtual"**
- **New virtual cloud network name:** `vcn-sms-gateway`
- **Create in compartment:** `sistemasdesarrollo (root)`

#### 4.2 Subnet
- Selecciona: **"Create new public subnet"** o **"Crear nueva subred pública"**
- **New subnet name:** `subnet-public-sms-gateway`
- **Create in compartment:** `sistemasdesarrollo (root)`
- **CIDR block:** `10.0.0.0/24` (default, está bien)

#### 4.3 IP Pública (CRÍTICO)

Busca la sección **"Public IPv4 address assignment"**:
- Debe estar activado: **"Automatically assign public IPv4 address"** o **"Asignar automáticamente dirección IPv4 pública"**
- El toggle debe estar en **ON** (azul)

**⚠️ MUY IMPORTANTE:** Sin IP pública, no podrás acceder a la VM desde internet.

### Paso 5: Configurar SSH Keys

- Selecciona: **"Generate a key pair for me"** o **"Generar un par de claves para mí"**
- **HAZ CLIC EN "Download private key"** o **"Descargar llave privada"**
- Se descargará un archivo `.pem` (ej: `ssh-key-XXXXX.pem`)
- **GUÁRDALO EN UN LUGAR SEGURO** - lo necesitarás para conectarte por SSH
- **⚠️ ADVERTENCIA:** Solo se muestra una vez, si no lo descargas, no podrás conectarte después

### Paso 6: Configurar Storage

- **Boot volume:** 46.6 GB (default, no se puede cambiar en free tier)
- **Encryption:** Activado por defecto (está bien)
- No necesitas cambiar nada aquí

### Paso 7: Review (Revisar)

1. Haz clic en **"Próximo"** o **"Next"** hasta llegar a **"Review"** o **"Revisar"**
2. Revisa que todo esté correcto:
   - ✅ Image: Oracle Linux 9 (o Ubuntu)
   - ✅ Shape: VM.Standard.A1.Flex (1 OCPU, 6 GB)
   - ✅ Networking: VCN y Subnet nuevas, IP pública asignada
   - ✅ SSH keys: Generadas
   - ✅ Boot volume: 46.6 GB

### Paso 8: Crear la Instancia

1. Haz clic en **"Create"** o **"Crear"**
2. Espera 2-5 minutos mientras se crea
3. **Si aparece error "Out of capacity":**
   - Haz clic en "Cancel"
   - Espera 30-60 minutos
   - Vuelve a intentar desde el Paso 2

---

## ✅ DESPUÉS DE CREAR LA VM EXITOSAMENTE

### Información que necesitas anotar:

1. **Public IP:** XXX.XXX.XXX.XXX (aparece en la página de la instancia)
2. **Username:** 
   - Si es Oracle Linux: `opc`
   - Si es Ubuntu: `ubuntu`
3. **Archivo .pem:** El que descargaste (ej: `ssh-key-XXXXX.pem`)

### Verificar que la VM está funcionando:

1. En la página de la instancia, el estado debe ser **"Running"** o **"En ejecución"**
2. Debe mostrar una **IP pública** (no privada)
3. El botón **"Create Instance"** debe haber desaparecido

---

## 🐛 TROUBLESHOOTING

### Error: "Out of capacity for shape VM.Standard.A1.Flex in availability domain AD-1"

**Causa:** No hay recursos disponibles en AD-1 en este momento.

**Solución:**
1. Haz clic en "Cancel" para salir del wizard
2. Espera 30-60 minutos
3. Vuelve a intentar desde el Paso 2
4. Si persiste, intenta en diferentes horarios:
   - 2:00 AM - 6:00 AM (mejor)
   - 6:00 AM - 8:00 AM (bueno)
   - Fines de semana temprano

**⚠️ NO intentes:**
- Cambiar Availability Domain (no se puede, solo hay AD-1)
- Cambiar región (límite alcanzado)
- Cambiar shape (debe ser VM.Standard.A1.Flex para Always Free)

### Error: "You have exceeded the maximum number of regions"

**Causa:** Ya tienes el máximo de regiones suscritas.

**Solución:** No puedes suscribirte a más regiones. Debes usar Monterrey.

### La VM se crea pero no tiene IP pública

**Causa:** No se activó la opción de IP pública en Networking.

**Solución:**
1. Ve a la instancia creada
2. Click en los 3 puntos > "Edit" o "Editar"
3. Ve a "Attached VNICs" o "VNICs adjuntos"
4. Click en el VNIC
5. Click en "Edit" y activa "Assign a public IPv4 address"
6. Guarda los cambios

### No descargué el archivo .pem

**Problema:** Sin el .pem, no puedes conectarte por SSH.

**Solución:**
1. Ve a la instancia
2. Click en "Console Connection" o "Conexión de consola"
3. Sigue las instrucciones para generar nuevas keys O
4. Usa "Instance Console" (menos seguro, pero funciona)

---

## 📋 CHECKLIST FINAL

Antes de decir "listo", verifica:

- [ ] VM creada con nombre `sms-gateway-bridge`
- [ ] Estado: "Running" o "En ejecución"
- [ ] Tiene IP pública (no solo privada)
- [ ] Archivo .pem descargado y guardado
- [ ] Username anotado (`opc` para Oracle Linux, `ubuntu` para Ubuntu)
- [ ] Shape: VM.Standard.A1.Flex (1 OCPU, 6 GB)
- [ ] Image: Oracle Linux 9 o Ubuntu 22.04

---

## 🔄 PRÓXIMOS PASOS (Después de crear la VM)

Una vez que tengas la VM creada, los siguientes pasos son:

### Tabla de Referencia Rápida

| Sistema Operativo | Username | Comandos de Instalación |
|-------------------|----------|-------------------------|
| **Oracle Linux 9** | `opc` | `sudo dnf update -y && sudo dnf install -y nodejs npm git` |
| **Ubuntu 22.04** | `ubuntu` | `sudo apt update && sudo apt install -y nodejs npm git` |

### Paso 1: Conectarse por SSH

**⚠️ IMPORTANTE:** El username depende del sistema operativo que elegiste:

```bash
# Cambiar permisos del archivo .pem
chmod 400 ~/Downloads/ssh-key-XXXXX.pem

# Conectar (usa el username correcto según tu imagen):
# Si es Oracle Linux 9:
ssh -i ~/Downloads/ssh-key-XXXXX.pem opc@XXX.XXX.XXX.XXX

# Si es Ubuntu 22.04:
ssh -i ~/Downloads/ssh-key-XXXXX.pem ubuntu@XXX.XXX.XXX.XXX
```

**Nota:** Reemplaza `XXX.XXX.XXX.XXX` con la IP pública de tu VM y `ssh-key-XXXXX.pem` con el nombre real del archivo que descargaste.

### Paso 2: Instalar Node.js y dependencias

**Una vez conectado por SSH**, ejecuta los comandos según tu sistema operativo:

**Para Oracle Linux 9:**
```bash
sudo dnf update -y
sudo dnf install -y nodejs npm git
```

**Para Ubuntu 22.04:**
```bash
sudo apt update
sudo apt install -y nodejs npm git
```

**Instalar PM2 (gestor de procesos) - igual para ambos:**
```bash
sudo npm install -g pm2
```

**Verificar instalación:**
```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
pm2 --version   # Debe mostrar la versión de PM2
```

3. **Instalar el Bridge API:**
   - El código está en: `GUIA-COMPLETA-SMS-GATEWAY-ANDROID.md` (Paso 3)
   - O se puede preparar antes y copiar/pegar

4. **Configurar el túnel (Cloudflare/ngrok):**
   - Para conectar Oracle Cloud con el celular Android
   - Instrucciones en: `GUIA-COMPLETA-SMS-GATEWAY-ANDROID.md` (Paso 2.8)

---

## 📞 INFORMACIÓN DE CONTACTO Y REFERENCIAS

### Archivos relacionados:
- `GUIA-COMPLETA-SMS-GATEWAY-ANDROID.md` - Guía completa del sistema
- `HISTORIAL-COMPLETO-PROYECTO.md` - Historial del proyecto

### URLs importantes:
- Oracle Cloud Console: https://cloud.oracle.com/
- Región actual: Noreste de México (Monterrey) - `mx-monterrey-1`

### Credenciales (NO incluir aquí por seguridad):
- Usuario Oracle Cloud: (guardar en lugar seguro)
- Archivo .pem: (guardar en lugar seguro)

---

## ⏰ ESTRATEGIA DE REINTENTOS

### Si falla en el primer intento:

1. **Espera 30-60 minutos** antes de reintentar
2. **Horarios recomendados para reintentar:**
   - 2:00 AM - 6:00 AM (mejor)
   - 6:00 AM - 8:00 AM (bueno)
   - Fines de semana temprano

3. **Frecuencia de reintentos:**
   - Cada 30-60 minutos
   - Máximo 5-10 intentos por sesión
   - Si no funciona después de 2-3 horas, intenta otro día

4. **No te desesperes:**
   - Es normal que falle varias veces
   - La capacidad se libera dinámicamente
   - Usuarios reportan éxito después de 1-24 horas

---

## 🎯 RESUMEN RÁPIDO PARA EL AUTO

**Contexto:** Usuario necesita crear VM Always Free en Oracle Cloud (Monterrey) pero recibe error "Out of capacity". Debe intentar en madrugada (2-6 AM) cuando hay menos demanda.

**Pasos clave:**
1. Compute > Instances > Create Instance
2. Nombre: `sms-gateway-bridge`
3. Image: Oracle Linux 9 o Ubuntu 22.04
4. Shape: VM.Standard.A1.Flex (1 OCPU, 6 GB)
5. Networking: Crear VCN y Subnet nuevas, **IP pública activada**
6. SSH keys: Generar y **descargar .pem**
7. Si falla "Out of capacity": Esperar 30-60 min y reintentar

**Información crítica a anotar:**
- IP pública de la VM
- Username (`opc` o `ubuntu`)
- Archivo .pem descargado

**Si no funciona:** Es normal, reintentar en diferentes horarios. La capacidad se libera dinámicamente.

---

**Creado:** 1 de diciembre 2025  
**Para uso:** 2 de diciembre 2025 (madrugada)  
**Autor:** Open House Team


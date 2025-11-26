# 🚀 Guía Rápida - Integración con Sistema de Autenticación

## 📝 Resumen Ejecutivo

Se ha completado la integración del microservicio de búsqueda con el sistema de autenticación del grupo de autenticación de usuarios. Ahora el sistema puede:

✅ **Guardar historial personalizado** para usuarios autenticados  
✅ **Funcionar normalmente** para usuarios anónimos  
✅ **Validar tokens JWT** contra el servicio de autenticación externo  
✅ **Cachear validaciones** para reducir carga en el servicio de auth  
✅ **Continuar operando** si el servicio de autenticación no está disponible

---

## 📊 Información del Servicio de Autenticación

| Propiedad | Valor |
|-----------|-------|
| **Repositorio** | https://github.com/Bladjot/proyecto-back-tite |
| **Puerto** | 3000 |
| **Prefijo API** | `/api` |
| **Framework** | NestJS + TypeScript |
| **Base de datos** | MongoDB |
| **Swagger** | http://localhost:3000/api-docs |

---

## 🔑 Endpoints Importantes

### Del Servicio de Autenticación (Puerto 3000):

```
POST   /api/auth/register     # Registrar usuario
POST   /api/auth/login        # Iniciar sesión → obtener token
GET    /api/auth/me           # Obtener usuario autenticado (requiere token)
GET    /api/auth/can-access   # Verificar permiso (requiere token)
GET    /api/users/public/:id  # Perfil público (sin token)
```

### De Nuestro Microservicio (Puerto 5610):

```
GET    /api/search            # Buscar productos (opcional token)
GET    /api/search/suggestions # Sugerencias (opcional token)
GET    /api/search/history    # Historial (opcional token)
GET    /health                # Estado del servicio
```

---

## 🚀 Inicio Rápido

### 1️⃣ Clonar el Repositorio de Autenticación

```bash
# En tu carpeta de proyectos
cd C:\Users\Max\Documents\Cuarto_anio\S8\TIPE4

# Clonar repo del grupo de autenticación
git clone https://github.com/Bladjot/proyecto-back-tite.git
```

### 2️⃣ Instalar y Configurar Servicio de Autenticación

```bash
cd proyecto-back-tite
pnpm install

# Copiar .env de ejemplo
copy .env.ejemplo .env

# Editar .env (ya viene configurado con valores por defecto)
notepad .env
```

**Valores clave en su `.env`:**
```env
PORT=3000
MONGODB_URI=mongodb://Admin:Admin1234Admin@localhost:27017/gpi_database
JWT_SECRET=EstoEsUnSecretoSuperSeguroParaElCursoGPI
JWT_EXPIRES_IN=1d
```

### 3️⃣ Restaurar Base de Datos de Autenticación (Opcional)

```bash
# Si tienen backups disponibles
mongorestore --drop `
  --uri "mongodb://Admin:Admin1234Admin@localhost:27017/gpi_database" `
  --db gpi_database ./backups/gpi_dump/gpi_database
```

### 4️⃣ Iniciar Todos los Servicios

**Terminal 1 - Servicio de Autenticación:**
```powershell
cd C:\Users\Max\Documents\Cuarto_anio\S8\TIPE4\proyecto-back-tite
pnpm start:dev
```

**Terminal 2 - Microservicio de Búsqueda:**
```powershell
cd C:\Users\Max\Documents\Cuarto_anio\S8\TIPE4\Microservicio_busqueda_V9\backend
pnpm dev
```

**Terminal 3 - Frontend:**
```powershell
cd C:\Users\Max\Documents\Cuarto_anio\S8\TIPE4\Microservicio_busqueda_V9\frontend
pnpm dev
```

### 5️⃣ Verificar que Todo Funciona

```powershell
# Verificar servicio de autenticación
curl http://localhost:3000/api-docs

# Verificar microservicio de búsqueda
curl http://localhost:5610/health

# Debería mostrar: "authentication": { "status": "online" }
```

---

## 🧪 Probar la Integración

### Ejecutar Script de Pruebas Automatizado:

```powershell
cd backend
pnpm test:auth
```

Este script verificará:
- ✅ Disponibilidad del servicio de autenticación
- ✅ Login y obtención de token
- ✅ Validación de token
- ✅ Búsqueda sin autenticación
- ✅ Búsqueda con autenticación
- ✅ Verificación de permisos
- ✅ Health check

### Prueba Manual con PowerShell:

```powershell
# 1. Hacer login
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"correo":"admin@admin.com","contrasena":"Admin1234"}'

$token = $response.access_token
Write-Host "Token obtenido: $token"

# 2. Verificar token
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" `
  -Headers @{Authorization = "Bearer $token"}

# 3. Buscar con autenticación
Invoke-RestMethod -Uri "http://localhost:5610/api/search?busqueda=laptop" `
  -Headers @{Authorization = "Bearer $token"}

# 4. Buscar sin autenticación (también debe funcionar)
Invoke-RestMethod -Uri "http://localhost:5610/api/search?busqueda=laptop"
```

---

## 📁 Archivos Creados/Modificados

### ✅ Archivos Nuevos:

```
backend/
├── src/
│   ├── services/
│   │   └── authService.ts                    # Servicio de integración con Auth
│   └── scripts/
│       └── test-auth-integration.ts          # Script de pruebas
├── INTEGRACION_AUTENTICACION.md              # Documentación completa
└── .env                                      # Actualizado con nuevas variables

root/
├── INTEGRACION_RESUMEN.md                    # Resumen ejecutivo
├── GUIA_RAPIDA_INTEGRACION.md               # Este archivo
└── docker-compose.auth-integrated.yml        # Docker Compose integrado
```

### ✅ Archivos Modificados:

```
backend/
├── src/
│   ├── middleware/
│   │   └── auth.ts                           # Actualizado para usar authService
│   ├── server.ts                             # Health check mejorado
│   └── .env                                  # Nuevas variables de entorno
└── package.json                              # Nuevo script test:auth
```

---

## 🔧 Configuración en `.env`

Agregar estas líneas en `backend/.env`:

```env
# Integración con Servicio de Autenticación
AUTH_SERVICE_URL=http://localhost:3000/api
AUTH_SERVICE_TIMEOUT=5000
```

---

## 🐳 Uso con Docker

Si prefieres usar Docker:

```powershell
# Iniciar todos los servicios con Docker
docker-compose -f docker-compose.auth-integrated.yml up -d

# Ver logs
docker-compose -f docker-compose.auth-integrated.yml logs -f

# Detener
docker-compose -f docker-compose.auth-integrated.yml down
```

**Nota:** Asegúrate de ajustar la ruta del repositorio de autenticación en `docker-compose.auth-integrated.yml`:

```yaml
auth_service:
  build:
    context: ../proyecto-back-tite  # Ajustar según tu estructura
```

---

## 🎯 Flujos de Usuario

### Usuario Anónimo:
```
1. Abre http://localhost:5620
2. Busca productos → funciona normalmente
3. NO se guarda historial personalizado
```

### Usuario Autenticado:
```
1. Abre http://localhost:5620
2. Hace login en http://localhost:3000/api/auth/login
3. Frontend guarda el token JWT
4. Busca productos con el token en el header
5. ✅ Historial se guarda en MongoDB asociado a su userId
6. ✅ Puede ver sugerencias personalizadas
```

---

## 🐛 Solución de Problemas

### Problema: Servicio de autenticación no responde

```powershell
# Verificar que está corriendo
curl http://localhost:3000/health

# Ver logs
cd proyecto-back-tite
pnpm start:dev
```

### Problema: Token inválido

```powershell
# Hacer login nuevamente
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"correo":"admin@admin.com","contrasena":"Admin1234"}'

$response.access_token
```

### Problema: No se guarda el historial

1. Verificar que el token se envía correctamente
2. Revisar logs del backend de búsqueda
3. Verificar MongoDB con Mongo Express: http://localhost:8081

---

## 📚 Documentación Adicional

- **Documentación Completa**: `backend/INTEGRACION_AUTENTICACION.md`
- **Resumen Técnico**: `INTEGRACION_RESUMEN.md`
- **Swagger Auth**: http://localhost:3000/api-docs
- **Swagger Búsqueda**: http://localhost:5610/api-docs

---

## ✅ Checklist de Integración

- [x] Servicio de autenticación clonado
- [x] Dependencias instaladas (`pnpm install`)
- [x] Variables de entorno configuradas
- [x] Base de datos restaurada (opcional)
- [x] Servicio de autenticación corriendo (puerto 3000)
- [x] Microservicio de búsqueda corriendo (puerto 5610)
- [x] Frontend corriendo (puerto 5620)
- [x] Tests de integración pasando (`pnpm test:auth`)
- [x] Health check mostrando auth service online

---

## 🤝 Coordinación con Grupo de Autenticación

Si necesitas cambios o soporte del grupo de autenticación:

1. **Issues en GitHub**: https://github.com/Bladjot/proyecto-back-tite/issues
2. **Postman Collection**: Ver archivo `Postman.json` en su repo
3. **Swagger en vivo**: http://localhost:3000/api-docs

---

## 📞 Contacto

Para dudas sobre esta integración:
- Revisar documentación en `backend/INTEGRACION_AUTENTICACION.md`
- Ejecutar tests: `pnpm test:auth`
- Verificar logs del servidor

---

**Fecha de integración:** 24 de noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completado y probado

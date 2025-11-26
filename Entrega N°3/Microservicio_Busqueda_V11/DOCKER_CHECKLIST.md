# ✅ Checklist de Integración Docker

## Pre-requisitos
- [ ] Docker Desktop instalado y corriendo
- [ ] Git instalado
- [ ] Puerto 5610 libre (Backend)
- [ ] Puerto 5620 libre (Frontend)
- [ ] Puerto 5173 libre (MongoDB)
- [ ] Puerto 8081 libre (Mongo Express)
- [ ] Al menos 4GB RAM disponible

## Archivos de Docker Creados
- [ ] `backend/Dockerfile` - Imagen del backend
- [ ] `backend/.dockerignore` - Exclusiones de build backend
- [ ] `frontend/Dockerfile` - Imagen del frontend
- [ ] `frontend/.dockerignore` - Exclusiones de build frontend
- [ ] `docker-compose.yml` - Orquestación de servicios
- [ ] `nginx.conf` - Configuración proxy inverso (opcional)
- [ ] `.env.docker.example` - Variables de entorno

## Documentación Creada
- [ ] `README.md` - Documentación principal actualizada
- [ ] `DOCKER_GUIDE.md` - Guía completa de dockerización
- [ ] `DOCKER_COMMANDS.md` - Comandos rápidos
- [ ] `backend/README.md` - Documentación backend
- [ ] `frontend/Readme.md` - Documentación frontend
- [ ] `backend/API_INTEGRACION.md` - Endpoint de integración
- [ ] `backend/INTEGRACION_PUBLICACIONES.md` - Consumo API externa

## Configuración de Puertos
- [ ] Backend: 5610 ✓
- [ ] Frontend: 5620 ✓
- [ ] MongoDB: 5173 ✓
- [ ] Mongo Express: 8081 ✓
- [ ] Nginx: 80 (opcional)

## Variables de Entorno
- [ ] `MONGODB_URI` configurada para Docker
- [ ] `PORT=5610` en backend
- [ ] `FRONTEND_ORIGIN=http://localhost:5620`
- [ ] `PRODUCTS_API_URL=http://localhost:4040/api`
- [ ] Variables de MongoDB configuradas

## Tests Previos al Build

### 1. Verificar Puertos Libres (PowerShell)
```powershell
# Verificar que no estén en uso
netstat -ano | findstr :5610
netstat -ano | findstr :5620
netstat -ano | findstr :5173
netstat -ano | findstr :8081

# Si alguno está en uso, matar el proceso:
# taskkill /PID <pid> /F
```

### 2. Limpiar Docker (si es necesario)
```bash
docker system prune
docker-compose down -v
```

### 3. Verificar Docker Desktop
- [ ] Docker Desktop está corriendo
- [ ] WSL2 está activo (Windows)
- [ ] Suficiente espacio en disco (>5GB libre)

## Build y Ejecución

### Paso 1: Construir Imágenes
```bash
cd Microservicio_busqueda_V8
docker-compose build
```

**Verificar:**
- [ ] Backend build exitoso (sin errores)
- [ ] Frontend build exitoso (sin errores)
- [ ] Imágenes creadas correctamente

### Paso 2: Iniciar Servicios
```bash
docker-compose up
```

**Observar logs:**
- [ ] MongoDB inicia correctamente
- [ ] Backend conecta a MongoDB
- [ ] Backend inicia en puerto 5610
- [ ] Frontend inicia en puerto 80
- [ ] Mongo Express conecta a MongoDB
- [ ] Sin errores en logs

### Paso 3: Verificar Servicios Activos
```bash
docker-compose ps
```

**Debería mostrar:**
```
NAME                      STATUS    PORTS
backend_busqueda          Up        0.0.0.0:5610->5610/tcp
frontend_busqueda         Up        0.0.0.0:5620->80/tcp
db_mongodb_busqueda       Up        0.0.0.0:5173->27017/tcp
mongo_express_busqueda    Up        0.0.0.0:8081->8081/tcp
```

- [ ] Todos los contenedores en estado "Up"
- [ ] Puertos mapeados correctamente

## Verificación de Funcionalidad

### Backend
```bash
# Swagger
curl http://localhost:5610/api-docs

# Obtener productos
curl http://localhost:5610/api/search/products/all

# Obtener categorías
curl http://localhost:5610/api/categories
```

- [ ] Swagger carga correctamente
- [ ] Endpoint de productos responde
- [ ] Endpoint de categorías responde
- [ ] Sin errores 500

### Frontend
```bash
# Abrir en navegador
start http://localhost:5620
```

- [ ] Frontend carga correctamente
- [ ] Imágenes de categorías se muestran
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Sin errores en consola (F12)

### MongoDB
```bash
# Abrir Mongo Express
start http://localhost:8081
```

- [ ] Mongo Express carga
- [ ] Base de datos `searchdb` existe
- [ ] Colecciones `searches` y `clicks` existen

### Logs sin Errores
```bash
docker-compose logs backend_busqueda | findstr "error"
docker-compose logs frontend_busqueda | findstr "error"
docker-compose logs db_mongodb | findstr "error"
```

- [ ] Sin errores críticos en backend
- [ ] Sin errores críticos en frontend
- [ ] MongoDB funciona correctamente

## Pruebas Funcionales

### 1. Búsqueda de Productos
- [ ] Buscar "laptop" retorna resultados
- [ ] Filtrar por categoría funciona
- [ ] Filtrar por precio funciona
- [ ] Ordenar por precio funciona

### 2. Categorías
- [ ] Grid de categorías se muestra
- [ ] Imágenes optimizadas cargan
- [ ] Click en categoría filtra productos

### 3. Productos Populares
- [ ] Scroll horizontal funciona
- [ ] Badges de clicks se muestran
- [ ] Click en producto registra analytics

### 4. Integración API
- [ ] Backend consume del puerto 4040 (si está disponible)
- [ ] Modo fallback funciona (datos demo)
- [ ] Endpoint de integración responde

## Troubleshooting Común

### Error: "Cannot connect to Docker daemon"
- [ ] Docker Desktop está corriendo
- [ ] Ejecutar terminal como Administrador
- [ ] Reiniciar Docker Desktop

### Error: "Port already in use"
- [ ] Verificar puertos con `netstat`
- [ ] Matar procesos que usan los puertos
- [ ] O cambiar puertos en docker-compose.yml

### Error: "Build failed"
- [ ] Limpiar cache: `docker system prune`
- [ ] Verificar que el código compile localmente
- [ ] Reconstruir sin cache: `docker-compose build --no-cache`

### Frontend no carga
- [ ] Verificar logs: `docker-compose logs frontend_busqueda`
- [ ] Verificar URL del backend en código frontend
- [ ] Verificar CORS en backend

### MongoDB no conecta
- [ ] Verificar que contenedor esté up
- [ ] Verificar URI de conexión
- [ ] Reiniciar: `docker-compose restart db_mongodb`

## Integración con Otros Grupos

Si vas a integrar con otros microservicios:

- [ ] Tu repositorio está en GitHub
- [ ] Dockerfiles incluidos en el repo
- [ ] Variables de entorno documentadas
- [ ] Puertos documentados
- [ ] READMEs actualizados
- [ ] Endpoint de integración probado
- [ ] Swagger documentation disponible

## Limpieza Post-Prueba

```bash
# Detener servicios
docker-compose down

# Si quieres eliminar volúmenes (BORRA DATOS)
docker-compose down -v

# Limpiar sistema
docker system prune
```

## Documentación Final

Antes de entregar/integrar:

- [ ] README.md completo y actualizado
- [ ] Todos los puertos documentados
- [ ] Variables de entorno explicadas
- [ ] Comandos de ejecución claros
- [ ] Troubleshooting documentado
- [ ] Diagramas de arquitectura incluidos
- [ ] Endpoints de integración documentados

## Entrega para Integración

Archivos clave para compartir:

1. `docker-compose.yml` (tu sección de servicios)
2. URLs de tu repositorio GitHub
3. Documentación de endpoints (Swagger)
4. Variables de entorno requeridas
5. Puertos utilizados
6. Dependencias con otros servicios

---

## ✅ Checklist Final

Todo listo cuando:
- [ ] Docker build sin errores
- [ ] Todos los servicios UP
- [ ] Frontend accesible en 5620
- [ ] Backend accesible en 5610
- [ ] Swagger funciona
- [ ] MongoDB conecta
- [ ] Búsquedas funcionan
- [ ] Filtros funcionan
- [ ] Imágenes cargan
- [ ] Sin errores en logs
- [ ] Documentación completa
- [ ] Repositorio GitHub actualizado

---

**Última verificación:** ___/___/___  
**Verificado por:** Max Latuz  
**Estado:** [ ] Listo para Integración

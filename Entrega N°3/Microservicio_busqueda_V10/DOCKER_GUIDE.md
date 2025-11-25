# 🐳 Guía de Dockerización - Microservicio de Búsqueda

Este documento explica cómo ejecutar el microservicio de búsqueda usando Docker y Docker Compose.

## 📋 Requisitos Previos

- **Docker Desktop** instalado y corriendo
- **Git** para clonar el repositorio
- **Node.js 20** (opcional, solo para desarrollo local)
- Al menos **4GB de RAM** disponible para Docker

## 🏗️ Arquitectura de Contenedores

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network (appnet)              │
│                                                         │
│  ┌──────────────┐      ┌──────────────┐               │
│  │   Frontend   │◄─────┤    Nginx     │ (Opcional)    │
│  │   (5620:80)  │      │    (80:80)   │               │
│  └──────┬───────┘      └──────────────┘               │
│         │                                              │
│         ▼                                              │
│  ┌──────────────┐                                     │
│  │   Backend    │                                     │
│  │ (5610:5610)  │                                     │
│  └──────┬───────┘                                     │
│         │                                              │
│         ▼                                              │
│  ┌──────────────┐      ┌──────────────┐              │
│  │   MongoDB    │◄─────┤ Mongo Express│              │
│  │ (5173:27017) │      │  (8081:8081) │              │
│  └──────────────┘      └──────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Inicio Rápido

### Opción 1: Sin Nginx (Desarrollo)

```bash
# 1. Clonar el repositorio (si no lo tienes)
git clone <tu-repo-url>
cd Microservicio_busqueda_V8

# 2. Construir y ejecutar todos los servicios
docker-compose up --build

# 3. Esperar a que todos los servicios estén listos (puede tomar 5-10 min la primera vez)
```

**Acceder a los servicios:**
- Frontend: http://localhost:5620
- Backend API: http://localhost:5610
- Swagger Docs: http://localhost:5610/api-docs
- Mongo Express: http://localhost:8081

### Opción 2: Con Nginx (Producción)

```bash
# 1. Editar docker-compose.yml y descomentar la sección de nginx

# 2. Construir y ejecutar
docker-compose up --build

# 3. Acceder a través de Nginx
```

**Acceder a los servicios:**
- Frontend: http://localhost/busqueda/
- Backend API: http://localhost/api/search/
- Swagger Docs: http://localhost/api-docs/
- Mongo Express: http://localhost/mongo-express/

## 📦 Puertos Configurados

| Servicio | Puerto Host | Puerto Contenedor | Descripción |
|----------|-------------|-------------------|-------------|
| Frontend | 5620 | 80 | Aplicación React |
| Backend | 5610 | 5610 | API Express + TypeScript |
| MongoDB | 5173 | 27017 | Base de datos |
| Mongo Express | 8081 | 8081 | Interfaz web BD |
| Nginx | 80 | 80 | Proxy inverso (opcional) |

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios en segundo plano
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend_busqueda
docker-compose logs frontend_busqueda
docker-compose logs db_mongodb

# Seguir logs en tiempo real
docker-compose logs -f backend_busqueda

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (ELIMINA DATOS DE BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend_busqueda

# Reconstruir imágenes sin caché
docker-compose build --no-cache

# Ver estado de contenedores
docker-compose ps
```

### Limpieza de Docker

```bash
# Limpiar contenedores, imágenes y redes no utilizadas
docker system prune

# Limpiar todo (incluyendo volúmenes)
docker system prune -a --volumes
```

### Detener WSL (si hay problemas)

```powershell
wsl --shutdown
```

## 🔧 Variables de Entorno

El backend utiliza las siguientes variables de entorno (configuradas en `docker-compose.yml`):

```yaml
NODE_ENV=production
PORT=5610
MONGODB_URI=mongodb://search_user:search_pass@db_mongodb:27017/searchdb?authSource=searchdb
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=rootpass
FRONTEND_ORIGIN=http://localhost:5620
PRODUCTS_API_URL=http://localhost:4040/api
```

## 📝 Archivos de Configuración

### Backend (`backend/Dockerfile`)
- Node.js 20
- Multi-stage build (construcción + producción)
- Expone puerto 5610
- Copia imágenes de categorías

### Frontend (`frontend/Dockerfile`)
- Node.js 20 para construcción
- Nginx Alpine para servir
- Build de producción con Vite
- Expone puerto 80

### Docker Compose (`docker-compose.yml`)
- Define red `appnet`
- Volumen persistente para MongoDB
- Variables de entorno
- Dependencias entre servicios

### Nginx (`nginx.conf`)
- Proxy inverso para todos los servicios
- Configuración de rutas
- Headers para WebSocket y CORS

## 🐛 Troubleshooting

### Problema 1: "Cannot connect to Docker daemon"

**Solución:**
1. Abrir Docker Desktop
2. Esperar a que inicie completamente
3. Ejecutar comando como Administrador

### Problema 2: "Port already in use"

**Solución:**
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :5610

# Detener el proceso
taskkill /PID <pid> /F

# O cambiar el puerto en docker-compose.yml
ports:
  - "5611:5610"  # Cambiar puerto host
```

### Problema 3: "Build failed" o errores de compilación

**Solución:**
```bash
# Limpiar caché de Docker
docker system prune

# Reconstruir sin caché
docker-compose build --no-cache

# Verificar que el código compile localmente
cd backend
npm install
npm run build
```

### Problema 4: MongoDB no conecta

**Solución:**
```bash
# Ver logs de MongoDB
docker-compose logs db_mongodb

# Verificar que el contenedor esté corriendo
docker-compose ps

# Reiniciar MongoDB
docker-compose restart db_mongodb
```

### Problema 5: Frontend no carga

**Solución:**
1. Verificar en browser console (F12) por errores CORS
2. Verificar que backend esté corriendo: http://localhost:5610/api-docs
3. Verificar logs del frontend:
```bash
docker-compose logs frontend_busqueda
```

### Problema 6: Imágenes no cargan

**Solución:**
- Las imágenes se optimizan al iniciar el servidor (2 segundos después)
- Verificar logs:
```bash
docker-compose logs backend_busqueda | findstr "imagen"
```
- La primera vez puede tardar en generar el caché

## 🔍 Verificación de Servicios

### 1. Verificar que todos los contenedores estén corriendo

```bash
docker-compose ps
```

Deberías ver:
```
NAME                      STATUS    PORTS
backend_busqueda          Up        0.0.0.0:5610->5610/tcp
frontend_busqueda         Up        0.0.0.0:5620->80/tcp
db_mongodb_busqueda       Up        0.0.0.0:5173->27017/tcp
mongo_express_busqueda    Up        0.0.0.0:8081->8081/tcp
```

### 2. Probar el Backend

```bash
# Obtener todos los productos
curl http://localhost:5610/api/search/products/all

# Swagger
curl http://localhost:5610/api-docs
```

### 3. Probar el Frontend

Abrir en navegador: http://localhost:5620

### 4. Probar MongoDB

Abrir Mongo Express: http://localhost:8081

## 📚 Integración con Otros Grupos

Si necesitas integrar este microservicio con otros usando Docker Compose:

1. **Agregar tu servicio al docker-compose.yml del grupo:**

```yaml
services:
  # ... otros servicios ...

  backend_busqueda:
    build: ./Microservicio_busqueda_V8/backend
    environment:
      - MONGODB_URI=mongodb://search_user:search_pass@db_mongodb:27017/searchdb
      - PRODUCTS_API_URL=http://backend_publicaciones:4040/api
    ports:
      - "5610:5610"
    networks:
      - appnet

  db_mongodb:
    image: mongo:7.0
    ports:
      - "5173:27017"
    networks:
      - appnet
```

2. **Actualizar nginx.conf del grupo para incluir rutas de búsqueda**

3. **Usar la red compartida `appnet`**

## 🎯 Mejores Prácticas

1. **Siempre usa `--build`** al hacer cambios en el código
2. **Revisa logs** si algo no funciona
3. **Usa volúmenes** para persistencia de datos
4. **No commitees** archivos `.env` con credenciales reales
5. **Documenta** cualquier cambio en puertos o configuración

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica el estado: `docker-compose ps`
3. Consulta Troubleshooting arriba
4. Limpia Docker y reconstruye

---

**Encargado:** Max Latuz  
**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025

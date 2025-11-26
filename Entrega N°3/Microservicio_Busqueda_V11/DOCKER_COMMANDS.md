# 🚀 Comandos Rápidos Docker - Microservicio Búsqueda

## Iniciar Proyecto

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano (detached)
docker-compose up -d --build

# Solo construir (sin ejecutar)
docker-compose build
```

## Detener Proyecto

```bash
# Detener servicios (mantiene datos)
docker-compose down

# Detener y eliminar volúmenes (BORRA DATOS DE BD)
docker-compose down -v
```

## Ver Estado y Logs

```bash
# Ver estado de contenedores
docker-compose ps

# Ver todos los logs
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend_busqueda
docker-compose logs frontend_busqueda
docker-compose logs db_mongodb

# Seguir logs en tiempo real
docker-compose logs -f

# Últimas 100 líneas de logs
docker-compose logs --tail=100
```

## Reiniciar Servicios

```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend_busqueda
docker-compose restart frontend_busqueda
docker-compose restart db_mongodb
```

## Reconstruir Servicios

```bash
# Reconstruir todo sin caché
docker-compose build --no-cache

# Reconstruir y ejecutar
docker-compose up --build --force-recreate

# Reconstruir solo un servicio
docker-compose build backend_busqueda
docker-compose up -d backend_busqueda
```

## Ejecutar Comandos en Contenedores

```bash
# Shell en contenedor backend
docker-compose exec backend_busqueda sh

# Shell en contenedor frontend
docker-compose exec frontend_busqueda sh

# Ejecutar comando npm en backend
docker-compose exec backend_busqueda npm run build

# Ver variables de entorno en backend
docker-compose exec backend_busqueda env
```

## Gestión de MongoDB

```bash
# Shell de MongoDB
docker-compose exec db_mongodb mongosh

# Ver bases de datos
docker-compose exec db_mongodb mongosh --eval "show dbs"

# Backup de base de datos
docker-compose exec db_mongodb mongodump --db searchdb --out /data/backup

# Restaurar base de datos
docker-compose exec db_mongodb mongorestore /data/backup
```

## Limpieza de Docker

```bash
# Limpiar contenedores, imágenes y redes no usadas
docker system prune

# Limpiar todo (incluyendo volúmenes)
docker system prune -a --volumes

# Limpiar solo imágenes
docker image prune

# Limpiar solo volúmenes
docker volume prune

# Ver espacio usado por Docker
docker system df
```

## Troubleshooting

```bash
# Detener WSL (Windows)
wsl --shutdown

# Ver puertos en uso (Windows)
netstat -ano | findstr :5610
netstat -ano | findstr :5620
netstat -ano | findstr :5173

# Matar proceso por PID (Windows)
taskkill /PID <pid> /F

# Reiniciar Docker Desktop
# 1. Cerrar Docker Desktop
# 2. Abrir como Administrador
# 3. Esperar a que inicie completamente
```

## Verificación Rápida

```bash
# Verificar que todo está corriendo
docker-compose ps

# Probar backend (PowerShell)
Invoke-WebRequest http://localhost:5610/api-docs

# Probar backend (cmd/bash)
curl http://localhost:5610/api-docs

# Probar frontend
start http://localhost:5620

# Probar Mongo Express
start http://localhost:8081
```

## Desarrollo

```bash
# Ver cambios en tiempo real (logs)
docker-compose logs -f backend_busqueda

# Actualizar código sin reconstruir todo
# 1. Detener servicio
docker-compose stop backend_busqueda

# 2. Reconstruir solo ese servicio
docker-compose build backend_busqueda

# 3. Iniciarlo de nuevo
docker-compose up -d backend_busqueda

# 4. Ver logs
docker-compose logs -f backend_busqueda
```

## URLs de Acceso

```
Frontend:        http://localhost:5620
Backend API:     http://localhost:5610
Swagger Docs:    http://localhost:5610/api-docs
Mongo Express:   http://localhost:8081
MongoDB Direct:  mongodb://localhost:5173
```

## Con Nginx (Opcional)

Si activas nginx en docker-compose.yml:

```
Frontend:        http://localhost/busqueda/
Backend API:     http://localhost/api/search/
Swagger Docs:    http://localhost/api-docs/
Mongo Express:   http://localhost/mongo-express/
```

## Comandos de Emergencia

```bash
# Si nada funciona, resetear todo:
docker-compose down -v
docker system prune -a --volumes
wsl --shutdown
# Reiniciar Docker Desktop
docker-compose up --build --force-recreate

# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Eliminar contenedor específico forzosamente
docker rm -f backend_busqueda

# Eliminar imagen específica
docker rmi microservicio_busqueda_v8_backend_busqueda

# Ver logs de Docker daemon
# Windows: C:\Users\<user>\AppData\Local\Docker\log.txt
```

## Integración con Otros Microservicios

```bash
# Si otro grupo usa tu microservicio en su docker-compose:

# 1. Ellos agregan tu servicio a su docker-compose.yml
# 2. Usan tu imagen o buildan desde tu repo
# 3. Se conectan a tu backend por nombre de servicio:
#    http://backend_busqueda:5610/api/search/products

# Ejemplo de dependencia en su compose:
services:
  su_servicio:
    depends_on:
      - backend_busqueda
    environment:
      - SEARCH_API_URL=http://backend_busqueda:5610
```

---

**Tip:** Guarda este archivo como referencia rápida durante el desarrollo y despliegue.

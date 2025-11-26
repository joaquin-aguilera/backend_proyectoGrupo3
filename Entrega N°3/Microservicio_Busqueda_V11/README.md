# 🔍 Microservicio de Búsqueda - Pulga Shop

**Encargado:** Max Latuz
               Joaquin Aguilera
               Angel Pino
               Lucas Orellana
               Thean Orlandi

Sistema de búsqueda y filtrado de productos con integración a microservicios externos.

---

## Como descargar el repositorio (La entrega N°3 es la version final)

git clone https://github.com/joaquin-aguilera/backend_proyectoGrupo3.git

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado para Producción)

```bash
cd "backend_proyectoGrupo3\Entrega N°3\Microservicio_busqueda_V8"
# Construir y ejecutar todos los servicios
docker-compose up --build

# Acceder a los servicios:
# - Frontend: http://localhost:5620
# - Backend: http://localhost:5610
# - Swagger: http://localhost:5610/api-docs
# - Mongo Express: http://localhost:8081
```

📖 **Documentación completa de Docker:** [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)  
⚡ **Comandos rápidos:** [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md)

### Opción 2: Desarrollo Local

#### Backend
```bash
cd backend
npm install
npm run docker:up    # Iniciar MongoDB
npm run dev          # Puerto 5610
```

#### Frontend
```bash
cd frontend
npm install
npm run dev          # Puerto 5620
```

---

## 📋 Arquitectura del Sistema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   MongoDB    │
│  React 19    │     │  Express +   │     │   Puerto     │
│ Puerto 5620  │     │  TypeScript  │     │    5173      │
└──────────────┘     │ Puerto 5610  │     └──────────────┘
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Microservicio│
                     │ Publicaciones│
                     │ Puerto 4040  │
                     └──────────────┘
```

---

## 🌐 URLs de Acceso

### Desarrollo Local
- **Frontend**: http://localhost:5620
- **Backend API**: http://localhost:5610
- **Swagger Docs**: http://localhost:5610/api-docs
- **Mongo Express**: http://localhost:8081

### Con Docker
- **Frontend**: http://localhost:5620
- **Backend API**: http://localhost:5610
- **Swagger Docs**: http://localhost:5610/api-docs
- **Mongo Express**: http://localhost:8081

### Con Nginx (Opcional)
- **Frontend**: http://localhost/busqueda/
- **Backend API**: http://localhost/api/search/
- **Swagger Docs**: http://localhost/api-docs/

---

## 📦 Puertos Configurados

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 5620 | Aplicación React + Vite |
| Backend | 5610 | API Express + TypeScript |
| MongoDB | 5173 | Base de datos (mapeado a 27017) |
| Mongo Express | 8081 | Interfaz web para MongoDB |
| Nginx | 80 | Proxy inverso (opcional) |

---

## 🛠️ Tecnologías

### Backend
- **Express 5.1.0** - Framework web
- **TypeScript 5.9.3** - Lenguaje tipado
- **MongoDB 8.0 + Mongoose** - Base de datos
- **Sharp 0.34.5** - Optimización de imágenes
- **Swagger** - Documentación API
- **Helmet + HPP** - Seguridad

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Lenguaje tipado
- **Material UI 6** - Componentes
- **Vite** - Build tool
- **Axios** - Cliente HTTP

---

## 📚 Documentación

### General
- [Backend README](./backend/README.md) - Estructura y funcionalidades del backend
- [Frontend README](./frontend/Readme.md) - Componentes y integración con API

### Integración
- [API Integración Externa](./backend/API_INTEGRACION.md) - Endpoint para otros grupos
- [Integración Publicaciones](./backend/INTEGRACION_PUBLICACIONES.md) - Consumo de productos

### Docker
- [Guía de Docker](./DOCKER_GUIDE.md) - Dockerización completa
- [Comandos Docker](./DOCKER_COMMANDS.md) - Referencia rápida

---

## 🔌 Integración con Otros Microservicios

### Consumir Productos (Publicaciones)
El backend consume productos del microservicio de publicaciones:
- **URL**: http://localhost:4040/api/publicaciones
- **Documentación**: [INTEGRACION_PUBLICACIONES.md](./backend/INTEGRACION_PUBLICACIONES.md)

### Exportar Datos (Analítica)
Endpoint para compartir búsquedas con otros grupos:
- **URL**: http://localhost:5610/api/search/product-searches
- **Formato**: `{id_producto, nombre, fecha}`
- **Documentación**: [API_INTEGRACION.md](./backend/API_INTEGRACION.md)

---

## 🧪 Pruebas de Seguridad

### 1. Rate Limiting
```powershell
# Dispara 80 peticiones rápidas; deben aparecer 429
$codes = @(1..80 | % { curl.exe -s -o NUL -w "%{http_code}`n" "http://localhost:5610/api/search/products?busqueda=test" })
$codes | Sort-Object | Get-Unique

# Ver Retry-After header
curl.exe -i "http://localhost:5610/api/search/products?busqueda=test" | findstr /I "Retry-After"
```

### 2. Validación de Parámetros
```powershell
# Precio fuera del enum -> 400
curl.exe -i "http://localhost:5610/api/search/products?precio=barato"

# Parámetro desconocido -> 200 o 400 (nunca 500)
curl.exe -i "http://localhost:5610/api/search/products?foo=bar"
```

### 3. Protección HPP
```powershell
# Duplicados -> 200 o 400 (nunca 500)
curl.exe -i "http://localhost:5610/api/search/products?categoria=a&categoria=b"
```

### 4. Fuzzing
```powershell
# Inyección NoSQL
curl.exe -i "http://localhost:5610/api/search/suggestions?texto=%7B%22%24gt%22%3A%22%22%7D"

# Prototype pollution
curl.exe -i "http://localhost:5610/api/search/products?__proto__=x"
```

---

## 📊 Funcionalidades Principales

### Backend
1. **Búsqueda de Productos** - Filtros por texto, precio, categoría, condición
2. **Categorías** - Agregación automática con imágenes optimizadas
3. **Productos Populares** - Top productos por clicks
4. **Sugerencias** - Autocompletado basado en historial
5. **Historial** - Registro de búsquedas
6. **Analytics** - Tracking de clicks
7. **Integración Externa** - Endpoint para otros grupos
8. **Optimización de Imágenes** - Procesamiento con Sharp

### Frontend
1. **Grid de Categorías** - 13 categorías con imágenes
2. **Búsqueda Avanzada** - Múltiples filtros
3. **Productos Populares** - Scroll horizontal
4. **Ordenamiento** - Precio ascendente/descendente
5. **Diseño Responsivo** - Mobile, tablet, desktop

---

## 🐛 Troubleshooting

### Docker
```bash
# Detener WSL
wsl --shutdown

# Limpiar Docker
docker system prune -a --volumes

# Ver logs
docker-compose logs backend_busqueda

# Reconstruir sin caché
docker-compose build --no-cache
```

### Puerto en Uso
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :5610

# Matar proceso
taskkill /PID <pid> /F
```

### MongoDB No Conecta
```bash
# Verificar que esté corriendo
docker-compose ps

# Reiniciar
docker-compose restart db_mongodb
```

---

## 📝 Estructura de Archivos

```
Microservicio_busqueda_V8/
├── backend/                    # Backend Express + TypeScript
│   ├── src/
│   │   ├── controllers/        # Lógica de controladores
│   │   ├── routes/             # Definición de rutas
│   │   ├── services/           # Lógica de negocio
│   │   ├── models/             # Modelos MongoDB
│   │   ├── middleware/         # Middlewares
│   │   └── swagger/            # Documentación API
│   ├── Dockerfile              # Imagen Docker backend
│   ├── .dockerignore           # Archivos excluidos en build
│   └── README.md               # Documentación backend
├── frontend/                   # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── layouts/            # Layouts de página
│   │   └── routes/             # Configuración de rutas
│   ├── Dockerfile              # Imagen Docker frontend
│   └── Readme.md               # Documentación frontend
├── docker-compose.yml          # Orquestación de servicios
├── nginx.conf                  # Configuración Nginx
├── DOCKER_GUIDE.md             # Guía de dockerización
├── DOCKER_COMMANDS.md          # Comandos rápidos
└── README.md                   # Este archivo
```

---

## 👨‍💻 Desarrollo

### Agregar Nuevas Funcionalidades

1. **Backend**: Crear controller → service → route → swagger
2. **Frontend**: Crear component → agregar en layout → conectar API
3. **Docker**: Reconstruir con `docker-compose up --build`

### Commits
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin main
```

---

## 🤝 Integración con Otros Grupos

Para usar este microservicio en un docker-compose compartido:

```yaml
services:
  backend_busqueda:
    build: ./Microservicio_busqueda_V8/backend
    environment:
      - PRODUCTS_API_URL=http://backend_publicaciones:4040/api
    ports:
      - "5610:5610"
    networks:
      - appnet
```

---

## 🔧 Solución de Rate Limiting (Actualizado)

### Problema
El sistema estaba alcanzando límites de rate limit muy rápido en desarrollo:
```
⚠️ Rate limit global excedido para IP: ::1 en /api/search/products/all
⚠️ Rate limit global excedido para IP: ::1 en /api/categories
⚠️ Rate limit global excedido para IP: ::1 en /api/analytics/top-products
```

### Solución Aplicada
Se optimizó la configuración de rate limiting en `backend/src/middleware/rateLimit.ts`:

**Límites por Tipo:**
- **Global**: 500 solicitudes / 15 minutos (33 req/min) - Para desarrollo y uso normal
- **Búsquedas**: 30 solicitudes / 1 minuto - Para endpoints de búsqueda
- **Escritura**: 20 solicitudes / 5 minutos - Para POST/PUT/DELETE
- **Autenticación**: 5 intentos / 15 minutos - Para endpoints de login
- **Estricto**: 3 solicitudes / 1 hora - Para operaciones sensibles

**Cambios en `server.ts`:**
```typescript
// Antes: Aplicaba rate limit global a TODAS las rutas
app.use('/api/', globalLimiter);

// Ahora: Solo a rutas específicas
app.use('/api/search', globalLimiter);
app.use('/api/categories', globalLimiter);
app.use('/api/analytics', globalLimiter);
```

**Cambios en Rutas:**
- `analyticsRoutes.ts`: Agregados rate limiters específicos a cada endpoint
- `searchRoutes.ts`: Ya tenía limiters, verificados y funcionando
- `categoriesRoutes.ts`: Ya tenía limiters, verificados y funcionando

### Resultado
✅ El frontend ahora puede hacer múltiples solicitudes simultáneamente sin alcanzar límites
✅ Protección de seguridad mantenida (500 req/15min es razonable)
✅ En producción se pueden ajustar más restrictivamente según sea necesario

---

**Encargado:** Max Latuz  
**Proyecto:** Microservicio de Búsqueda - Pulga Shop  
**Fecha:** Noviembre 2025

---

## 📄 Licencia

ISC

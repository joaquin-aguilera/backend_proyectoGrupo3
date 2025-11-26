# 🔐 Integración con Sistema de Autenticación

## 📋 Resumen

Este documento describe la integración del microservicio de búsqueda con el sistema de autenticación del grupo de autenticación de usuarios.

---

## 🌐 Sistema de Autenticación (Grupo de Autenticación)

### 📍 Información del Servicio

- **Repositorio**: https://github.com/Bladjot/proyecto-back-tite
- **Framework**: NestJS + TypeScript
- **Base de datos**: MongoDB
- **Puerto**: `3000` (configurable via `process.env.PORT`)
- **Prefijo global**: `/api`
- **Documentación**: `http://localhost:3000/api-docs` (Swagger)

### 🔑 Variables de Entorno Requeridas

```env
# En su .env
PORT=3000
MONGODB_URI=mongodb://Admin:Admin1234Admin@localhost:27017/gpi_database
JWT_SECRET=EstoEsUnSecretoSuperSeguroParaElCursoGPI
JWT_EXPIRES_IN=1d
```

---

## 🎯 Endpoints de Autenticación Disponibles

### 1. **Registro de Usuario**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nombre": "John",
  "apellido": "Doe",
  "rut": "12345678-9",
  "correo": "john.doe@example.com",
  "contrasena": "password123",
  "recaptchaToken": "<token_recaptcha_v2>"
}
```

**Respuesta exitosa:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673abc123def456789...",
    "nombre": "John",
    "apellido": "Doe",
    "correo": "john.doe@example.com",
    "roles": ["cliente"],
    "permisos": ["ver_perfil", "editar_perfil"],
    "activo": true,
    "creado_en": "2024-11-24T10:00:00.000Z"
  }
}
```

---

### 2. **Inicio de Sesión**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "correo": "john.doe@example.com",
  "contrasena": "password123",
  "recaptchaToken": "<token_recaptcha_v2>"
}
```

**Respuesta exitosa:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673abc123def456789...",
    "nombre": "John",
    "apellido": "Doe",
    "correo": "john.doe@example.com",
    "roles": ["cliente"],
    "permisos": ["ver_perfil", "editar_perfil"],
    "activo": true
  }
}
```

---

### 3. **Obtener Usuario Autenticado** ⭐ (IMPORTANTE)
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer <access_token>
```

**Respuesta exitosa:**
```json
{
  "id": "673abc123def456789...",
  "nombre": "John",
  "apellido": "Doe",
  "correo": "john.doe@example.com",
  "roles": ["cliente", "vendedor"],
  "permisos": [
    "ver_perfil",
    "editar_perfil",
    "crear_publicacion",
    "editar_publicacion"
  ],
  "activo": true,
  "creado_en": "2024-11-24T10:00:00.000Z",
  "actualizado_en": "2024-11-24T15:30:00.000Z"
}
```

---

### 4. **Verificar Permisos de Acceso** ⭐ (IMPORTANTE)
```http
GET http://localhost:3000/api/auth/can-access?page=<codigo_permiso>
Authorization: Bearer <access_token>
```

**Ejemplo:**
```http
GET http://localhost:3000/api/auth/can-access?page=crear_publicacion
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa:**
```json
{
  "page": "crear_publicacion",
  "hasAccess": true
}
```

---

### 5. **Perfil Público de Usuario** (Sin autenticación)
```http
GET http://localhost:3000/api/users/public/:id
```

**Ejemplo:**
```http
GET http://localhost:3000/api/users/public/673abc123def456789
```

**Respuesta exitosa:**
```json
{
  "id": "673abc123def456789...",
  "nombre": "John",
  "apellido": "Doe",
  "correo": "john.doe@example.com",
  "activo": true,
  "creado_en": "2024-11-24T10:00:00.000Z",
  "actualizado_en": "2024-11-24T15:30:00.000Z"
}
```

---

## 🔧 Integración en Nuestro Microservicio

### Estrategia de Integración

Nuestro microservicio de búsqueda utilizará **autenticación opcional** para:

1. **Usuarios autenticados**: Guardar historial de búsquedas personalizado
2. **Usuarios anónimos**: Permitir búsquedas sin historial persistente
3. **Verificación de tokens**: Validar tokens JWT con el servicio de autenticación

### Flujo de Autenticación

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │ 1. Login/Register
         ▼
┌─────────────────────────┐
│ Servicio Autenticación  │◄─── Puerto 3000
│  (NestJS - Grupo Auth)  │
└────────┬────────────────┘
         │ 2. JWT Token
         ▼
┌─────────────────┐
│   Frontend      │
│ (Guarda Token)  │
└────────┬────────┘
         │ 3. Búsqueda con Token
         ▼
┌─────────────────────────┐
│ Microservicio Búsqueda  │◄─── Puerto 5610
│   (Express - Nuestro)   │
└────────┬────────────────┘
         │ 4. Validar Token con Auth Service
         ▼
┌─────────────────────────┐
│ Servicio Autenticación  │
│   GET /api/auth/me      │
└─────────────────────────┘
```

---

## 🛠️ Configuración del Microservicio de Búsqueda

### Variables de Entorno Nuevas

Agregar en `backend/.env`:

```env
# Servicio de Autenticación
AUTH_SERVICE_URL=http://localhost:3000/api
AUTH_SERVICE_TIMEOUT=5000
```

### Middleware de Autenticación Actualizado

El nuevo middleware `optionalAuthenticate` realizará:

1. **Extracción del token** del header `Authorization: Bearer <token>`
2. **Validación del token** contra el servicio de autenticación (`GET /api/auth/me`)
3. **Cacheo temporal** de la información del usuario (opcional, para reducir llamadas)
4. **Manejo de errores** sin bloquear la petición si falla la autenticación

---

## 📊 Esquema de Usuario en Sesión

Una vez autenticado, `req` contendrá:

```typescript
interface AuthenticatedRequest extends Request {
  userId?: string;           // "673abc123def456789..."
  userEmail?: string;        // "john.doe@example.com"
  userName?: string;         // "John Doe"
  userRoles?: string[];      // ["cliente", "vendedor"]
  userPermissions?: string[]; // ["ver_perfil", "crear_publicacion"]
}
```

---

## 🔄 Casos de Uso

### Caso 1: Usuario Anónimo Busca Productos

```
1. Frontend hace GET /api/search?busqueda=laptop
2. Middleware detecta que NO hay token
3. Se permite la búsqueda
4. NO se guarda historial en MongoDB
5. Se retornan los productos
```

### Caso 2: Usuario Autenticado Busca Productos

```
1. Frontend hace GET /api/search?busqueda=laptop
   Header: Authorization: Bearer <token>
2. Middleware valida token con AUTH_SERVICE
3. Se permite la búsqueda
4. Se guarda historial asociado a userId en MongoDB
5. Se retornan los productos
```

### Caso 3: Usuario con Token Expirado

```
1. Frontend hace GET /api/search?busqueda=laptop
   Header: Authorization: Bearer <token_expirado>
2. Middleware valida token con AUTH_SERVICE
3. AUTH_SERVICE retorna 401 Unauthorized
4. Middleware continúa SIN bloquear (autenticación opcional)
5. Se permite la búsqueda
6. NO se guarda historial
7. Se retornan los productos
```

---

## 🚀 Implementación

### Nuevo Servicio de Autenticación

Crear `backend/src/services/authService.ts`:

```typescript
import axios from 'axios';

interface UserInfo {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
  permisos: string[];
  activo: boolean;
}

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000/api';
const AUTH_SERVICE_TIMEOUT = parseInt(process.env.AUTH_SERVICE_TIMEOUT || '5000', 10);

export class AuthService {
  static async verifyToken(token: string): Promise<UserInfo | null> {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: AUTH_SERVICE_TIMEOUT
      });

      return response.data;
    } catch (error) {
      console.warn('⚠️ Token inválido o servicio de autenticación no disponible:', error);
      return null;
    }
  }

  static async checkPermission(token: string, permission: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${AUTH_SERVICE_URL}/auth/can-access?page=${permission}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: AUTH_SERVICE_TIMEOUT
        }
      );

      return response.data.hasAccess === true;
    } catch (error) {
      console.warn('⚠️ Error al verificar permiso:', error);
      return false;
    }
  }
}
```

---

## 🧪 Pruebas de Integración

### 1. Probar Login en Servicio de Autenticación

```bash
# Iniciar servicio de autenticación (puerto 3000)
cd /path/to/proyecto-back-tite
pnpm start:dev

# Hacer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@admin.com",
    "contrasena": "Admin1234"
  }'

# Copiar el access_token de la respuesta
```

### 2. Probar Validación de Token

```bash
# Usar el token obtenido
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### 3. Probar Búsqueda con Token

```bash
# Iniciar microservicio de búsqueda (puerto 5610)
cd backend
pnpm dev

# Hacer búsqueda con autenticación
curl -X GET "http://localhost:5610/api/search?busqueda=laptop" \
  -H "Authorization: Bearer <access_token>"
```

---

## 📝 Checklist de Integración

- [x] Analizar servicio de autenticación del grupo
- [x] Identificar endpoints relevantes
- [x] Documentar estructura de respuestas
- [ ] Implementar nuevo middleware de autenticación
- [ ] Crear servicio de comunicación con Auth API
- [ ] Agregar variables de entorno
- [ ] Actualizar docker-compose con servicio de autenticación
- [ ] Implementar cacheo de validación de tokens (opcional)
- [ ] Agregar logs de autenticación
- [ ] Probar flujos con usuarios autenticados
- [ ] Probar flujos con usuarios anónimos
- [ ] Documentar en README principal

---

## 🐳 Docker Compose Actualizado

Para integrar ambos servicios en Docker:

```yaml
version: '3.8'

services:
  # Servicio de Autenticación (Grupo Auth)
  auth_service:
    build: ../proyecto-back-tite  # Ajustar ruta
    container_name: auth_service
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://Admin:Admin1234Admin@db_mongodb_auth:27017/gpi_database
      - JWT_SECRET=EstoEsUnSecretoSuperSeguroParaElCursoGPI
      - JWT_EXPIRES_IN=1d
    ports:
      - "3000:3000"
    networks:
      - appnet
    depends_on:
      - db_mongodb_auth

  # MongoDB para Autenticación
  db_mongodb_auth:
    image: mongo:7.0
    container_name: db_mongodb_auth
    environment:
      MONGO_INITDB_ROOT_USERNAME: Admin
      MONGO_INITDB_ROOT_PASSWORD: Admin1234Admin
      MONGO_INITDB_DATABASE: gpi_database
    volumes:
      - mongodb_auth_data:/data/db
    ports:
      - "27018:27017"
    networks:
      - appnet

  # Backend Búsqueda (Nuestro)
  backend_busqueda:
    build: ./backend
    container_name: backend_busqueda
    environment:
      - NODE_ENV=production
      - PORT=5610
      - MONGODB_URI=mongodb://search_user:search_pass@db_mongodb:27017/searchdb?authSource=searchdb
      - AUTH_SERVICE_URL=http://auth_service:3000/api
      - AUTH_SERVICE_TIMEOUT=5000
    ports:
      - "5610:5610"
    networks:
      - appnet
    depends_on:
      - db_mongodb
      - auth_service

  # ... resto de servicios

volumes:
  mongodb_auth_data:
  mongodb_data:
```

---

## 📚 Referencias

- **Repositorio Auth**: https://github.com/Bladjot/proyecto-back-tite
- **Swagger Auth**: http://localhost:3000/api-docs
- **Documentación JWT**: https://jwt.io/
- **NestJS Docs**: https://docs.nestjs.com/

---

## 🤝 Contacto con Grupo de Autenticación

Para coordinar cambios o resolver dudas:

1. Revisar issues en GitHub: https://github.com/Bladjot/proyecto-back-tite/issues
2. Verificar Postman collection: `Postman.json` en el repo
3. Consultar Swagger en http://localhost:3000/api-docs

---

**Última actualización**: 24 de noviembre de 2025

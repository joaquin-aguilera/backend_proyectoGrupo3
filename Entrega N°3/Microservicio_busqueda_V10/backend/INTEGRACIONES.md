# 🔌 Guía de Integraciones del Microservicio de Búsqueda

Esta guía detalla todas las integraciones externas del microservicio de búsqueda, incluyendo ubicaciones exactas en el código y ejemplos de uso.

---

## 📋 Tabla de Contenidos

1. [Integración con API de Publicaciones (Entrada)](#1-integración-con-api-de-publicaciones-entrada)
2. [Integración con Servicio de Autenticación (Entrada)](#2-integración-con-servicio-de-autenticación-entrada)
3. [Integración con Servicio de Análisis (Salida)](#3-integración-con-servicio-de-análisis-salida)

---

## 1. Integración con API de Publicaciones (Entrada)

### 📝 Descripción
El microservicio **consume productos** del microservicio de publicaciones desarrollado por el equipo backend.

### 🔗 Información de Conexión
- **Repositorio:** `Team-Planning/Back-end` (NestJS)
- **URL Base:** `http://localhost:3000/api`
- **Endpoint:** `GET /publicaciones`
- **Autenticación:** No requerida (pública)

### 📂 Ubicación en el Código

#### Archivo Principal
**`src/services/productsService.ts`**

#### Función: `getProductos()`
```typescript
// Líneas: 15-65
export const getProductos = async (): Promise<Product[]> => {
  // 1. Intentar obtener desde API externa
  try {
    const API_URL = process.env.PUBLICATIONS_API_URL || 'http://localhost:3000/api';
    const response = await axios.get(`${API_URL}/publicaciones`, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Productos obtenidos de API externa');
    return normalizeProducts(response.data);
    
  } catch (error) {
    console.warn('⚠️ API externa no disponible, intentando MongoDB...');
    
    // 2. Fallback: MongoDB local
    try {
      const productos = await Product.find().lean();
      if (productos.length > 0) {
        console.log('✅ Productos obtenidos de MongoDB');
        return normalizeProducts(productos);
      }
    } catch (dbError) {
      console.warn('⚠️ MongoDB no disponible');
    }
    
    // 3. Último recurso: Datos demo
    console.log('📦 Usando productos de demostración');
    return DEMO_PRODUCTS;
  }
};
```

### 🔄 Sistema de Prioridad (Fallback en Cascada)

1. **API Externa** (Primero)
   - Intenta conectar a `http://localhost:3000/api/publicaciones`
   - Timeout: 5 segundos
   - Si falla → Continúa al paso 2

2. **MongoDB Local** (Segundo)
   - Busca en colección `products`
   - 25 productos seed (5 con datos completos)
   - Si no hay datos → Continúa al paso 3

3. **Datos Demo** (Último recurso)
   - 15 productos hardcodeados en el código
   - Siempre disponibles

### 🔧 Normalización de Datos

**Función:** `normalizeProducts()` (líneas 70-95)

```typescript
const normalizeProducts = (productos: any[]): Product[] => {
  return productos.map(p => ({
    id_producto: p.id_producto || p.id,
    id_tienda: p.id_tienda || 1,
    nombre: p.nombre || 'Sin nombre',
    precio: p.precio || 0,
    categoria: normalizarCategoria(p.categoria),      // ELECTRÓNICA
    condicion: normalizarCondicion(p.condicion),      // NUEVO
    descripcion: p.descripcion || '',
    stock: p.stock || 0,
    sku: p.sku || '',
    marca: p.marca || '',
    imagen: p.imagen || ''
  }));
};
```

**Mapeo de Categorías:**
- `"electronica"`, `"Electrónica"`, `"ELECTRONICA"` → `"ELECTRÓNICA"`
- `"ropa"`, `"Ropa"`, `"ROPA"` → `"ROPA"`
- Etc. (12 categorías estándar)
- Desconocidas → `"GENERAL"`

### ✅ Verificación de Conexión

```bash
# 1. Verificar que la API externa está corriendo
curl http://localhost:3000/api/publicaciones

# 2. Verificar desde el microservicio de búsqueda
curl http://localhost:5610/api/search/products/all

# 3. Revisar logs del servidor
# Deberías ver: "✅ Productos obtenidos de API externa"
```

### ⚙️ Configuración

**Archivo:** `.env`
```bash
PUBLICATIONS_API_URL=http://localhost:3000/api
```

**Uso en código:**
```typescript
const API_URL = process.env.PUBLICATIONS_API_URL || 'http://localhost:3000/api';
```

### 📊 Respuesta Esperada

```json
[
  {
    "id_producto": 1,
    "id_tienda": 5,
    "nombre": "Laptop HP Pavilion",
    "precio": 450,
    "categoria": "Electrónica",
    "condicion": "nuevo",
    "descripcion": "Laptop para gaming y trabajo",
    "stock": 10,
    "sku": "HP-LAP-001",
    "marca": "HP"
  }
]
```

---

## 2. Integración con Servicio de Autenticación (Entrada)

### 📝 Descripción
El microservicio **valida tokens JWT** del servicio de autenticación para proteger endpoints.

### 🔗 Información de Conexión
- **Repositorio:** `Bladjot/proyecto-back-tite` (NestJS)
- **URL Base:** `http://localhost:3000`
- **Endpoint:** `POST /auth/validate-token`
- **Headers:** `Authorization: Bearer <token>`

### 📂 Ubicación en el Código

#### Archivo Principal
**`src/middleware/auth.ts`**

#### Middleware: `authMiddleware()`
```typescript
// Líneas: 10-60
const tokenCache = new Map<string, CachedUser>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // 1. Extraer token del header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    // 2. Verificar caché
    const cachedUser = tokenCache.get(token);
    if (cachedUser && Date.now() < cachedUser.expiresAt) {
      req.user = cachedUser.user;
      return next();
    }
    
    // 3. Validar con API de autenticación
    const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:3000';
    const response = await axios.post(
      `${AUTH_API_URL}/auth/validate-token`,
      { token },
      { timeout: 5000 }
    );
    
    // 4. Guardar en caché
    const user = response.data;
    tokenCache.set(token, {
      user,
      expiresAt: Date.now() + CACHE_DURATION
    });
    
    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
```

### 🔐 Sistema de Caché

**Características:**
- Caché en memoria (Map)
- Duración: 5 minutos
- Evita llamadas repetidas al servicio de autenticación
- Limpieza automática por expiración

**Estructura del caché:**
```typescript
interface CachedUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresAt: number;
}
```

### 🛠️ Aplicación del Middleware

**Actualmente:** Middleware disponible pero **NO aplicado** a rutas públicas

**Para activar autenticación:**

```typescript
// src/routes/searchRoutes.ts
import { authMiddleware } from '../middleware/auth';

// Proteger endpoints específicos
router.get('/history', authMiddleware, searchController.getHistory);
router.post('/clicks', authMiddleware, searchController.registerClick);

// O proteger todas las rutas
router.use(authMiddleware); // Aplicar a todo searchRoutes
```

### ✅ Verificación

```bash
# Sin token (debe fallar)
curl http://localhost:5610/api/search/history

# Con token válido
curl http://localhost:5610/api/search/history \
  -H "Authorization: Bearer <tu_token_jwt>"
```

### ⚙️ Configuración

**Archivo:** `.env`
```bash
AUTH_API_URL=http://localhost:3000
```

### 📊 Respuesta del Servicio de Auth

```json
{
  "id": "user_123",
  "email": "usuario@example.com",
  "role": "user",
  "name": "Juan Pérez"
}
```

---

## 3. Integración con Servicio de Análisis (Salida)

### 📝 Descripción
El microservicio **provee datos de búsquedas** al grupo de análisis para calcular métricas de popularidad.

### 🔗 Información de Exportación
- **Endpoint:** `GET /api/search/product-searches`
- **Autenticación:** No requerida (pública)
- **Formato:** JSON con array de búsquedas

### 📂 Ubicación en el Código

#### Archivo Principal
**`src/controllers/searchController.ts`**

#### Función: `getProductSearches()`
```typescript
// Líneas: 250-300
export const getProductSearches = async (req: Request, res: Response) => {
  try {
    const { desde, hasta, limite } = req.query;
    
    // Validar parámetros
    const limit = parseInt(limite as string) || 100;
    const startDate = desde ? new Date(desde as string) : undefined;
    const endDate = hasta ? new Date(hasta as string) : undefined;
    
    // Obtener búsquedas del servicio
    const resultado = await searchService.getProductSearchesForAnalytics({
      startDate,
      endDate,
      limit
    });
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener búsquedas' });
  }
};
```

#### Servicio: `searchService.getProductSearchesForAnalytics()`
**Archivo:** `src/services/searchService.ts`

```typescript
// Líneas: 150-200
export const getProductSearchesForAnalytics = async (params: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) => {
  const { startDate, endDate, limit = 100 } = params;
  
  // Construir filtro de fechas
  const dateFilter: any = {};
  if (startDate) dateFilter.$gte = startDate;
  if (endDate) dateFilter.$lte = endDate;
  
  // Query con agregación
  const searches = await Search.aggregate([
    {
      $match: dateFilter.$gte || dateFilter.$lte 
        ? { requestedAt: dateFilter } 
        : {}
    },
    { $unwind: '$results' }, // Descomponer array de resultados
    {
      $project: {
        id_producto: '$results.id_producto',
        nombre: '$results.nombre',
        fecha: '$requestedAt'
      }
    },
    { $limit: limit }
  ]);
  
  return {
    total: searches.length,
    busquedas: searches
  };
};
```

### 📊 Formato de Respuesta

```json
{
  "total": 150,
  "busquedas": [
    {
      "id_producto": 1,
      "nombre": "Laptop Gaming",
      "fecha": "2025-11-24T10:30:00.000Z"
    },
    {
      "id_producto": 5,
      "nombre": "Mouse Inalámbrico",
      "fecha": "2025-11-24T11:15:00.000Z"
    },
    {
      "id_producto": 1,
      "nombre": "Laptop Gaming",
      "fecha": "2025-11-24T14:20:00.000Z"
    }
  ]
}
```

### 🔍 Parámetros de Query

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `desde` | ISO 8601 | Fecha inicial | `2025-11-01T00:00:00Z` |
| `hasta` | ISO 8601 | Fecha final | `2025-11-30T23:59:59Z` |
| `limite` | number | Máximo de resultados | `100` (default) |

### ✅ Ejemplos de Uso

```bash
# Todas las búsquedas (últimas 100)
curl http://localhost:5610/api/search/product-searches

# Búsquedas del último mes
curl "http://localhost:5610/api/search/product-searches?desde=2025-11-01T00:00:00Z&hasta=2025-11-30T23:59:59Z"

# Límite personalizado
curl "http://localhost:5610/api/search/product-searches?limite=500"

# Combinado
curl "http://localhost:5610/api/search/product-searches?desde=2025-11-01T00:00:00Z&limite=1000"
```

### 📈 Caso de Uso: Grupo de Análisis

**Objetivo:** Calcular productos más buscados

```javascript
// Cliente del grupo de análisis
const response = await fetch(
  'http://localhost:5610/api/search/product-searches?limite=1000'
);
const { busquedas } = await response.json();

// Agrupar por producto
const conteos = busquedas.reduce((acc, b) => {
  acc[b.id_producto] = (acc[b.id_producto] || 0) + 1;
  return acc;
}, {});

// Top 10 más buscados
const top10 = Object.entries(conteos)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10);

console.log('Top 10 productos más buscados:', top10);
```

### 📄 Documentación Completa

Ver archivo: **`API_INTEGRACION.md`** para más detalles sobre este endpoint.

---

## 🛠️ Herramientas de Desarrollo

### Variables de Entorno Completas

**Archivo:** `.env`
```bash
# Servidor
PORT=5610
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://admin:password123@localhost:27017/busqueda_productos?authSource=admin

# Integraciones
PUBLICATIONS_API_URL=http://localhost:3000/api
AUTH_API_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=60000
```

### Testing de Integraciones

```bash
# 1. Verificar API de Publicaciones
curl http://localhost:3000/api/publicaciones

# 2. Verificar Auth Service
curl -X POST http://localhost:3000/auth/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "test_token"}'

# 3. Verificar endpoint de análisis
curl http://localhost:5610/api/search/product-searches

# 4. Verificar nuestro microservicio
curl http://localhost:5610/api/search/products/all
```

### Logs de Depuración

El microservicio imprime logs útiles:

```
✅ Productos obtenidos de API externa (25 productos)
⚠️ API externa no disponible, intentando MongoDB...
✅ Productos obtenidos de MongoDB (25 productos)
📦 Usando productos de demostración (15 productos)
🔐 Token validado correctamente para usuario: user_123
💾 Búsqueda guardada en historial: laptop
```

---

## 📞 Contacto y Soporte

**Encargado del Microservicio:** Max Latuz

**Repositorio:** `Microservicio_busqueda_V9`

**Documentos relacionados:**
- `README.md` - Guía general del proyecto
- `API_INTEGRACION.md` - Endpoint de análisis detallado
- `INTEGRACION_PUBLICACIONES.md` - Integración con API de productos
- `swagger.ts` - Documentación OpenAPI/Swagger

---

**Última actualización:** Noviembre 2025

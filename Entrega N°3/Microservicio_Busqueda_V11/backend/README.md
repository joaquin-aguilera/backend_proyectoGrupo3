# Backend - Microservicio de Búsqueda

**Encargado:** Max Latuz

## Ejecución del Backend y Base de Datos

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar Base de Datos (MongoDB con Docker)
```bash
npm run docker:up
```

### 3. Iniciar el Servidor en Modo Desarrollo
```bash
npm run dev
```

### 4. Construir para Producción
```bash
npm run build
npm start
```

### 5. Detener la Base de Datos
```bash
npm run docker:down
```

### 6. Regenerar Caché de Imágenes (Opcional)
```bash
npm run images:generate
```
Este comando optimiza y cachea todas las imágenes de categorías. El servidor también lo hace automáticamente al iniciar.

## Descripción

Microservicio de búsqueda de productos que proporciona funcionalidades de búsqueda avanzada, filtrado, sugerencias y análisis basado en búsquedas. El backend se ejecuta en el puerto **5610** y utiliza MongoDB como base de datos.

**Características principales:**
- 🔍 Búsqueda con múltiples filtros (texto, precio, categoría, condición)
- 📊 Analítica basada en cantidad de búsquedas por producto
- 🎯 Sugerencias inteligentes desde historial
- 🖼️ Optimización automática de imágenes con Sharp
- 🔌 Integración con API de publicaciones (fallback a MongoDB y datos demo)
- 📱 API RESTful documentada con Swagger

### Documentación API
Una vez iniciado el servidor, la documentación Swagger está disponible en:
```
http://localhost:5610/api-docs
```

### Documentación de Integraciones
Para información detallada sobre todas las integraciones externas (APIs consumidas y provistas):
- **[INTEGRACIONES.md](./INTEGRACIONES.md)** - Guía completa de integraciones con ubicaciones exactas en el código

### API de Integración con Grupo 1 - Analítica
Para compartir datos de búsquedas con otros microservicios, consultar:
- **[API_INTEGRACION.md](./API_INTEGRACION.md)** - Documentación del endpoint `/api/search/product-searches`

### API de Publicaciones - Consumo de Productos
Para integrar productos del microservicio de publicaciones:
- **[INTEGRACION_PUBLICACIONES.md](./INTEGRACION_PUBLICACIONES.md)** - Guía de integración con publicaciones

## Tecnologías y Dependencias

El proyecto utiliza las siguientes tecnologías principales:

- **Express**: Framework web para Node.js
- **TypeScript**: Superset de JavaScript con tipado estático
- **MongoDB/Mongoose**: Base de datos NoSQL y ODM
- **Axios**: Cliente HTTP para comunicación con APIs externas
- **Sharp**: Procesamiento y optimización de imágenes
- **Swagger**: Documentación automática de la API (swagger-jsdoc, swagger-ui-express)
- **Helmet**: Seguridad HTTP headers
- **HPP**: Protección contra HTTP Parameter Pollution
- **CORS**: Manejo de Cross-Origin Resource Sharing
- **Dotenv**: Gestión de variables de entorno
- **Nodemon**: Recarga automática en desarrollo
- **ts-node**: Ejecución de TypeScript en tiempo de desarrollo

## Sistema de Optimización de Imágenes

El backend incluye un sistema automático de optimización de imágenes que:

- **Reescala imágenes** a dimensiones óptimas (800x600px por defecto)
- **Comprime con calidad controlada** (85% JPEG)
- **Cachea resultados** para mejorar rendimiento
- **Reduce tamaño de archivos** hasta 90% sin pérdida visible de calidad

### Endpoints de Imágenes

- `GET /api/images/categories/:imageName` - Servir imagen optimizada
- `POST /api/images/cache/clear` - Limpiar caché (admin)

### Parámetros de Optimización

```
GET /api/images/categories/Electrónica.jpg?width=800&height=600&quality=85
```

Las imágenes se pregenera automáticamente al iniciar el servidor.

## Estructura de Directorios

```
backend/
├── src/
│   ├── server.ts                    # Punto de entrada del servidor
│   ├── controllers/                 # Lógica de controladores
│   │   ├── searchController.ts      # Búsqueda y filtrado de productos
│   │   ├── categoriesController.ts  # Gestión de categorías
│   │   └── imageController.ts       # Servir imágenes optimizadas
│   ├── routes/                      # Definición de rutas/endpoints
│   │   ├── searchRoutes.ts          # /api/search/*
│   │   ├── categoriesRoutes.ts      # /api/categories/*
│   │   └── imageRoutes.ts           # /api/images/*
│   ├── services/                    # Lógica de negocio
│   │   ├── searchService.ts         # Gestión de búsquedas y clicks
│   │   ├── productsService.ts       # Obtención y normalización de productos
│   │   ├── categoriesService.ts     # Agregación de categorías
│   │   ├── imageService.ts          # Optimización de imágenes con Sharp
│   │   └── db.ts                    # Conexión a MongoDB
│   ├── models/                      # Modelos de datos (Mongoose)
│   │   ├── Search.ts                # Esquema de búsquedas
│   │   └── Click.ts                 # Esquema de clicks
│   ├── middleware/                  # Middlewares de Express
│   │   ├── authMiddleware.ts        # Autenticación (simulada)
│   │   ├── rateLimit.ts             # Limitación de requests
│   │   └── validateSearchParams.ts  # Validación de parámetros
│   ├── swagger/                     # Documentación API
│   │   ├── swagger.ts               # Configuración Swagger
│   │   └── schemas.ts               # Esquemas de datos
│   ├── errors/                      # Manejo de errores personalizados
│   │   └── BadRequestError.ts
│   ├── types/                       # Tipos de TypeScript
│   │   └── hpp.d.ts
│   ├── scripts/                     # Scripts utilitarios
│   │   └── pregenerate-images.ts    # Script para optimizar imágenes
│   └── BD/                          # Base de datos
│       ├── docker-compose.yml       # Configuración Docker MongoDB
│       ├── init/                    # Scripts de inicialización DB
│       │   ├── 01-init.js           # Crear usuario y DB
│       │   ├── 02-seed.js           # Datos de ejemplo
│       │   └── 03-seed-products.js  # Productos de prueba
│       ├── scripts/                 # Scripts de queries
│       │   └── query-clicks-example.mjs
│       └── test/                    # Queries de prueba
│           └── queries.md
├── public/                          # Archivos estáticos
│   └── images/
│       ├── categories/              # Imágenes originales de categorías
│       └── cache/                   # Imágenes optimizadas (generado automáticamente)
├── dist/                            # Código compilado (TypeScript → JavaScript)
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración TypeScript
└── README.md                        # Este archivo
```

### Flujo de Funcionalidades Principales

#### **1. Búsqueda de Productos** → `searchController.ts`
- **Endpoint**: `GET /api/search/products`
- **Servicios usados**: `productsService.ts` (obtener productos), `searchService.ts` (guardar búsqueda)
- **Funcionalidad**: Filtra productos por texto, precio, categoría, condición y ordenamiento
- **DB**: Guarda cada búsqueda en colección `searches`

#### **2. Categorías** → `categoriesController.ts`
- **Endpoint**: `GET /api/categories`
- **Servicios usados**: `categoriesService.ts`, `productsService.ts`
- **Funcionalidad**: Agrupa productos por categoría, cuenta total por cada una
- **Imágenes**: Retorna URLs de imágenes optimizadas

#### **3. Productos Populares (Por Búsquedas)** → `categoriesController.ts`
- **Endpoint**: `GET /api/categories/top-products?limit=6`
- **Servicios usados**: `categoriesService.ts`
- **Funcionalidad**: Obtiene productos más buscados usando agregación de MongoDB
- **DB**: Consulta colección `searches` (no clicks)
- **Nota**: La analítica se basa en cantidad de búsquedas, no en clicks

#### **4. Sugerencias** → `searchController.ts`
- **Endpoint**: `GET /api/search/suggestions?texto=laptop`
- **Servicios usados**: `searchService.ts`, `productsService.ts`
- **Funcionalidad**: Retorna sugerencias del historial + productos que coinciden

#### **5. Historial** → `searchController.ts`
- **Endpoints**: 
  - `GET /api/search/history` (obtener)
  - `POST /api/search/history` (guardar)
- **Servicios usados**: `searchService.ts`
- **DB**: Colección `searches`

#### **6. Clicks (Sistema Legacy)** → `searchController.ts`
- **Endpoints**: 
  - `POST /api/search/clicks` (registrar)
  - `GET /api/search/clicks/:productId` (obtener por producto)
- **Servicios usados**: `searchService.ts`
- **DB**: Colección `clicks`
- **Nota**: Sistema disponible pero no usado activamente. La analítica principal se basa en búsquedas

#### **7. Integración Externa** → `searchController.ts`
- **Endpoint**: `GET /api/search/product-searches`
- **Servicios usados**: `searchService.ts`, `productsService.ts`
- **Funcionalidad**: Exporta búsquedas con formato `{id_producto, nombre, fecha}` para otros grupos
- **Parámetros**: `desde`, `hasta`, `limite`

#### **8. Imágenes Optimizadas** → `imageController.ts`
- **Endpoint**: `GET /api/images/categories/:imageName`
- **Servicios usados**: `imageService.ts`
- **Funcionalidad**: Reescala y comprime imágenes on-demand con caché
- **Tecnología**: Sharp (procesamiento de imágenes)

#### **9. Analítica de Productos Populares** → `categoriesController.ts`
- **Endpoint**: `GET /api/categories/top-products?limit=6`
- **Servicios usados**: `categoriesService.ts`
- **Funcionalidad**: Retorna los 6 productos más buscados mediante agregación de MongoDB
- **DB**: Consulta colección `searches` agrupando por `id_producto`

#### **10. Categoría Aleatoria "Sorpréndeme"** → `categoriesController.ts`
- **Endpoint**: `GET /api/categories/random`
- **Servicios usados**: `categoriesService.ts`, `productsService.ts`
- **Funcionalidad**: Selecciona aleatoriamente 8 productos de cualquier categoría usando Fisher-Yates shuffle
- **Uso**: Implementado para la categoría especial "Aleatorio/Sorpréndeme" en el frontend

#### **11. Detalle Completo de Producto** → `searchController.ts`
- **Endpoint**: `GET /api/search/products/:id/detail`
- **Servicios usados**: `productsService.ts`, `Product` model
- **Funcionalidad**: Obtiene información completa del producto incluyendo:
  - Datos del producto (nombre, precio, descripción, stock, marca, SKU)
  - Información del vendedor/tienda (nombre, email, tipo, teléfono)
  - Multimedia (galería de imágenes desde Unsplash CDN)
  - Opciones de despacho (envío, retiro, ambos)
  - Precio de envío
  - Estado de la publicación
- **DB**: MongoDB con esquema extendido en primeros 5 productos
- **Fallback**: Si el producto no existe en MongoDB, intenta API externa

**Estructura de respuesta:**
```json
{
  "producto": {
    "id_producto": 1,
    "nombre": "Silla Gamer Premium",
    "precio": 280,
    "descripcion": "...",
    "categoria": "MUEBLES",
    "condicion": "NUEVO",
    "stock": 8,
    "marca": "DXRacer",
    "sku": "CHAIR-GAM-005"
  },
  "vendedor": {
    "id": "tienda_001",
    "nombre": "Muebles Modernos",
    "email": "info@mueblesmodernos.cl",
    "tipo": "tienda",
    "telefono": "+56912345678"
  },
  "publicacion": {
    "multimedia": [
      { "url": "https://images.unsplash.com/...", "tipo": "imagen" }
    ],
    "despacho": "ambos",
    "precio_envio": 15000,
    "estado": "activo",
    "fecha_creacion": "2025-11-01T10:00:00Z"
  }
}
```

### 🗄️ Base de Datos MongoDB

**Colecciones Activas:**
- `searches`: Historial de búsquedas con resultados (PRINCIPAL para analítica)
- `products`: 25 productos seed con datos completos (5 con información extendida)

**Colecciones Legacy:**
- `clicks`: Registro de clicks en productos (disponible pero no usado activamente)

**Índices de `searches`:**
- `userId, requestedAt`: Consultas por usuario y fecha
- `requestedAt`: Ordenamiento cronológico
- `results.productId, requestedAt`: Agregación de productos más buscados
- `queryText`: Búsqueda de texto completo

**Analítica:**
La popularidad de productos se calcula agregando la colección `searches` y contando cuántas veces aparece cada `id_producto` en los resultados. NO se usan clicks.

---

## 🔌 Integraciones Externas

### 1. Integración con API de Publicaciones (Productos)

El microservicio consume productos del **microservicio de publicaciones** (desarrollador backend) mediante:

**URL:** `http://localhost:3000/api/publicaciones` (Team-Planning/Back-end)

**Prioridad de Fuentes:**
1. **API Externa** → Intenta obtener productos de la API de publicaciones
2. **MongoDB Local** → Si falla, busca en la base de datos local (25 productos seed)
3. **Datos Demo** → Como última opción, retorna productos hardcodeados

**Ubicación en el código:**
- **Archivo**: `src/services/productsService.ts`
- **Función**: `getProductos()`
- **Líneas**: ~15-65
- **Lógica**: Try-catch en cascada con normalización automática de datos

```typescript
// Ejemplo de la lógica de fallback
try {
  // 1. Intentar API externa
  const response = await axios.get(`${API_URL}/publicaciones`);
  return normalizeProducts(response.data);
} catch (error) {
  // 2. Intentar MongoDB
  const productos = await Product.find().lean();
  if (productos.length > 0) return normalizeProducts(productos);
  
  // 3. Retornar datos demo
  return DEMO_PRODUCTS;
}
```

### 2. Integración con Servicio de Autenticación

El microservicio valida tokens JWT del **microservicio de autenticación** (NestJS):

**URL:** `http://localhost:3000` (Bladjot/proyecto-back-tite)

**Endpoints consumidos:**
- `POST /auth/validate-token` - Validación de tokens JWT
- `GET /users/:id` - Obtención de información de usuario (opcional)

**Ubicación en el código:**
- **Archivo**: `src/middleware/auth.ts`
- **Función**: `authMiddleware()`
- **Líneas**: ~10-45
- **Caché**: Sistema de caché en memoria (5 minutos) para validaciones

```typescript
// Ejemplo de validación con caché
const cachedUser = tokenCache.get(token);
if (cachedUser) return cachedUser;

const response = await axios.post('http://localhost:3000/auth/validate-token', {
  token
});
tokenCache.set(token, response.data);
```

**Nota:** El middleware está configurado pero actualmente no es obligatorio para endpoints públicos. Para activarlo, agregar a las rutas:

```typescript
router.get('/products', authMiddleware, searchController.getProducts);
```

### 3. Integración con Servicio de Análisis (Salida)

El microservicio **exporta datos de búsquedas** al grupo de análisis para calcular métricas de popularidad:

**Endpoint:** `GET /api/search/product-searches`

**Formato de Salida:**
```json
{
  "total": 150,
  "busquedas": [
    {
      "id_producto": 1,
      "nombre": "Laptop Gaming",
      "fecha": "2025-11-24T10:30:00Z"
    },
    {
      "id_producto": 1,
      "nombre": "Laptop Gaming",
      "fecha": "2025-11-24T14:20:00Z"
    }
  ]
}
```

**Características:**
- Cada entrada representa una búsqueda donde apareció el producto
- Los productos duplicados indican mayor popularidad (más búsquedas)
- El grupo de análisis puede agrupar por `id_producto` y contar ocurrencias
- Permite calcular productos más buscados, tendencias y patrones

**Ubicación en el código:**
- **Archivo**: `src/controllers/searchController.ts`
- **Función**: `getProductSearches()`
- **Líneas**: ~250-300
- **Servicio**: `searchService.getProductSearchesForAnalytics()`

**Parámetros disponibles:**
- `desde`: Fecha inicial (ISO 8601) - opcional
- `hasta`: Fecha final (ISO 8601) - opcional
- `limite`: Cantidad máxima de resultados (default: 100)

**Ejemplo de uso:**
```bash
# Últimas 100 búsquedas
curl http://localhost:5610/api/search/product-searches

# Búsquedas del último mes
curl "http://localhost:5610/api/search/product-searches?desde=2025-11-01T00:00:00Z&hasta=2025-11-30T23:59:59Z"

# Límite personalizado
curl "http://localhost:5610/api/search/product-searches?limite=500"
```

**Documentación completa:** Ver `API_INTEGRACION.md`

---

## 🔌 Integración con API de Publicaciones (Detallado)

### Variables de Entorno (.env)

```bash
# Integración API de Publicaciones
PUBLICATIONS_API_URL=http://localhost:3000/api

# Integración API de Autenticación  
AUTH_API_URL=http://localhost:3000

# Configuración del servidor
PORT=5610
NODE_ENV=development

# Rate Limiting (ajustable para desarrollo)
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=60000
```

### Cómo Funciona

1. **ProductsService** (`src/services/productsService.ts`) consume el endpoint `/publicaciones`
2. Los productos se **normalizan** al formato interno del microservicio de búsqueda
3. Si la API no está disponible, se usan **datos de demostración**

### Normalización de Datos

El servicio mapea automáticamente los productos del endpoint externo a nuestro formato:

```typescript
// Producto del endpoint externo
{
  id_producto: 123,
  id_tienda: 5,
  nombre: "Laptop HP",
  precio: 450,
  categoria: "Electrónica",  // Puede venir en diferentes formatos
  condicion: "nuevo",        // Puede venir en minúsculas
  stock: 10,
  sku: "HP-001",
  descripcion: "...",
  marca: "HP"
}

// Se normaliza a:
{
  id_producto: 123,
  id_tienda: 5,
  nombre: "Laptop HP",
  precio: 450,
  categoria: "ELECTRÓNICA",   // Estandarizado en MAYÚSCULAS
  condicion: "NUEVO",         // Estandarizado en MAYÚSCULAS
  stock: 10,
  sku: "HP-001",
  descripcion: "...",
  marca: "HP"
}
```

### Categorías Soportadas

El servicio mapea automáticamente variaciones de nombres a categorías estándar:
- `ELECTRÓNICA`, `ROPA`, `CALZADO`, `HOGAR`, `JUGUETES`, `DEPORTES`
- `LIBROS`, `ALIMENTOS`, `BELLEZA`, `OFICINA`, `AUTOMOTRIZ`, `MASCOTAS`
- `GENERAL` (categoría por defecto para otros casos)

### Condiciones Soportadas

- `NUEVO`
- `USADO`
- `REACONDICIONADO`

### Verificar Conexión

Para probar que la integración funciona correctamente:

**1. Asegúrate que el microservicio de publicaciones esté corriendo en el puerto 4040:**
```bash
# En la terminal del desarrollador backend
# Debería mostrar algo como: "Server running on port 4040"
```

**2. Prueba el endpoint directamente:**
```bash
curl http://localhost:4040/api/publicaciones
```

**3. Inicia este microservicio y prueba la búsqueda:**
```bash
npm run dev
```

**4. Consulta productos en Swagger:**
```
http://localhost:5610/api-docs
```

**5. O directamente por API:**
```bash
curl http://localhost:5610/api/search/products/all
```

### Modo Fallback

Si el endpoint externo no está disponible o responde con error, el sistema automáticamente:
- ✅ Muestra un **warning** en la consola
- ✅ Retorna **15 productos de demostración**
- ✅ Permite que el sistema siga funcionando

Esto garantiza que el microservicio de búsqueda siempre esté operativo para pruebas y desarrollo.

### Troubleshooting

**Problema:** "Error fetching products from external API"
- **Solución 1**: Verifica que el microservicio de publicaciones esté corriendo en `localhost:4040`
- **Solución 2**: Verifica que el endpoint sea `/api/publicaciones` y no otro
- **Solución 3**: Revisa los logs del servicio externo por errores

**Problema:** "API requiere autenticación (401)"
- **Solución**: Agrega el token en `.env` si el endpoint lo requiere:
  ```
  PRODUCTS_API_TOKEN=tu_token_aqui
  ```

**Problema:** Productos no aparecen con las categorías correctas
- **Solución**: Verifica que el endpoint externo retorne `categoria` en un formato que el mapeo reconozca (ej: "Electrónica", "electronica", "ELECTRÓNICA")


# Integración de Detalle de Producto con Vendedor/Tienda

## 📋 Resumen de Cambios

Se implementó un sistema completo para mostrar el detalle de productos con información del vendedor/tienda al hacer clic en cualquier producto.

---

## 🔧 Backend

### 1. Servicio de Productos (`productsService.ts`)
- **Prioridad actualizada**: Ahora consulta en este orden:
  1. API externa de publicaciones (puerto 3000 - Grupo 2)
  2. MongoDB local (25 productos de respaldo)
  3. Datos demo hardcodeados

### 2. Nuevo Controlador (`searchController.ts`)
- **Función**: `getProductDetail(id)`
- **Endpoint**: `GET /api/search/products/:id/detail`
- **Funcionalidad**:
  - Obtiene publicación del microservicio de publicaciones (puerto 3000)
  - Obtiene información del vendedor del servicio de autenticación
  - Combina toda la información en una respuesta unificada
  - Fallback a MongoDB local si las APIs externas no están disponibles

### 3. Nueva Ruta (`searchRoutes.ts`)
```typescript
GET /api/search/products/:id/detail
```
- Documentación Swagger incluida
- Rate limiting aplicado
- Retorna: `{ producto, vendedor, publicacion }`

### 4. Variables de Entorno (`.env`)
```bash
PUBLICATIONS_API_URL=http://localhost:3000/api
```

---

## 🎨 Frontend

### 1. Nuevo Componente: `ProductDetail.tsx`
**Ubicación**: `frontend/src/views/product/ProductDetail.tsx`

**Características**:
- ✅ **Botón de retroceso** para volver al buscador
- ✅ Galería de imágenes del producto (si disponible)
- ✅ Información completa del producto (nombre, precio, descripción, marca, SKU, stock)
- ✅ Información del vendedor/tienda con avatar
- ✅ Opciones de despacho y precio de envío
- ✅ Badges de categoría, condición y estado
- ✅ Diseño responsive (2 columnas en desktop, 1 en móvil)
- ✅ Loading state y error handling
- ✅ Miniaturas de imágenes (si hay múltiples)

### 2. Actualización de Rutas (`Routes.tsx`)
```typescript
{
  path: "producto/:id",
  exact: true,
  element: <ProductDetail />,
}
```

### 3. Productos Clickeables (`ProductList.tsx`)
- Importado `useNavigate` de react-router-dom
- `handleProductClick()` actualizado para:
  1. Registrar click en analytics (si hay searchId)
  2. Navegar a `/producto/:id`
- Aplica tanto para productos de búsqueda como productos populares

---

## 🔄 Flujo de Integración

### Escenario 1: API de Publicaciones Disponible (Puerto 3000)
```
Usuario click producto
    ↓
Frontend navega a /producto/123
    ↓
Backend llama GET http://localhost:3000/api/publicaciones/123
    ↓
Backend enriquece con info del vendedor
    ↓
Frontend muestra detalle completo con imágenes, despacho, etc.
```

### Escenario 2: API Externa No Disponible (Fallback)
```
Usuario click producto
    ↓
Frontend navega a /producto/123
    ↓
Backend intenta API externa → Falla
    ↓
Backend busca en MongoDB local (25 productos)
    ↓
Frontend muestra info básica sin multimedia
```

---

## 📊 Estructura de Respuesta

### Endpoint: `GET /api/search/products/:id/detail`

**Respuesta exitosa (con API externa)**:
```json
{
  "producto": {
    "id_producto": 123,
    "nombre": "Laptop HP Pavilion",
    "precio": 450000,
    "descripcion": "...",
    "categoria": "ELECTRÓNICA",
    "condicion": "NUEVO"
  },
  "vendedor": {
    "id": "vendor_123",
    "nombre": "Tech Store",
    "email": "contact@techstore.cl",
    "tipo": "tienda"
  },
  "publicacion": {
    "multimedia": [
      { "url": "https://...", "tipo": "imagen" }
    ],
    "despacho": "ambos",
    "precio_envio": 5000,
    "estado": "activo",
    "fecha_creacion": "2025-11-20T10:30:00Z"
  }
}
```

**Respuesta fallback (MongoDB local)**:
```json
{
  "producto": {
    "id_producto": 1,
    "nombre": "Laptop HP Pavilion 15",
    "precio": 450,
    // ... datos básicos
  },
  "vendedor": {
    "id": "unknown",
    "nombre": "Información no disponible",
    "tipo": "vendedor"
  },
  "publicacion": null
}
```

---

## 🚀 Cómo Probar

### 1. Backend
```bash
cd backend
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

### 3. Flujo de Prueba
1. Abrir `http://localhost:5620`
2. Buscar productos o seleccionar categoría "Sorpréndeme"
3. **Hacer clic en cualquier producto**
4. Ver página de detalle con información completa
5. **Usar botón "Volver al buscador"** para regresar

---

## 🔗 Integración con Grupo 2 (Publicaciones)

### Su API (Puerto 3000)
- **Repositorio**: https://github.com/Team-Planning/Back-end
- **Tecnología**: NestJS + MongoDB Atlas + Cloudinary
- **Endpoint clave**: `GET /api/publicaciones/:id`

### Campos que aprovechamos:
- ✅ `id_vendedor` → Para obtener info del vendedor
- ✅ `multimedia` → Galería de imágenes
- ✅ `despacho` → Opciones de entrega
- ✅ `precio_envio` → Costo de envío
- ✅ `estado` → Estado de la publicación
- ✅ `titulo`, `descripcion` → Información del producto

### Cuando su API está activa:
El microservicio de búsqueda consulta automáticamente su API y muestra toda la información enriquecida (imágenes, vendedor, despacho).

### Cuando su API no está disponible:
El sistema usa los 25 productos locales de MongoDB como fallback, mostrando información básica.

---

## 📝 Archivos Modificados

### Backend
- ✅ `src/services/productsService.ts` - Prioridad de consulta actualizada
- ✅ `src/controllers/searchController.ts` - Nuevo controlador `getProductDetail`
- ✅ `src/routes/searchRoutes.ts` - Nueva ruta con Swagger
- ✅ `.env` - Variable `PUBLICATIONS_API_URL`

### Frontend
- ✅ `src/views/product/ProductDetail.tsx` - **NUEVO** Componente de detalle
- ✅ `src/routes/Routes.tsx` - Ruta `/producto/:id` agregada
- ✅ `src/components/ProductList.tsx` - Navigation onClick implementada

---

## ✨ Características Destacadas

1. **Botón de Retroceso**: Siempre visible en la parte superior
2. **Responsive**: Funciona en móvil, tablet y desktop
3. **Loading States**: Muestra spinner mientras carga
4. **Error Handling**: Maneja casos cuando las APIs fallan
5. **Fallback Inteligente**: 3 niveles de respaldo (API → MongoDB → Demo)
6. **Analytics**: Registra clicks para el grupo de analítica
7. **Integración Completa**: Listo para conectar con microservicios externos

---

## 🎯 Próximos Pasos Sugeridos

1. Coordinar con Grupo 2 para probar con su API real en puerto 3000
2. Implementar botón "Contactar vendedor" funcional
3. Agregar sistema de favoritos
4. Implementar carrito de compras
5. Agregar reviews y calificaciones

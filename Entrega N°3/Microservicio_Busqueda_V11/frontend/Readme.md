# Frontend - Microservicio de Búsqueda

**Encargado:** 
  - Angel Pino
  - Thean Orlandi

Frontend de búsqueda y visualización de productos construido con **React 19**, **TypeScript** y **Material UI**. Proporciona una interfaz moderna y responsiva integrada con el microservicio de búsqueda.

## Ejecución

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5620`

### 3. Construcción para Producción
```bash
npm run build
```
Los archivos compilados se generarán en `dist/`

### 4. Vista Previa de Producción
```bash
npm run preview
```

## Descripción

Aplicación React que consume el microservicio de búsqueda (puerto 5610) para proporcionar:
- **Búsqueda de productos** con múltiples filtros (texto, precio, categoría, condición, ordenamiento)
- **Navegación por categorías** con imágenes optimizadas y contadores
- **Categoría "Sorpréndeme"** con productos aleatorios
- **Productos más populares** basados en búsquedas (top 6)
- **Sugerencias de búsqueda** en tiempo real
- **Vista detallada de producto** con información completa del vendedor
- **Historial de búsquedas** persistente
- **Registro de clicks** para análisis
- **Interfaz responsive** adaptable a móviles, tablets y escritorio

## Tecnologías

- **React 19**: Biblioteca para interfaces de usuario
- **TypeScript**: Lenguaje tipado
- **Material UI (MUI) 6**: Sistema de componentes UI
- **Vite**: Herramienta de construcción rápida
- **React Router 7**: Enrutamiento
- **Axios**: Cliente HTTP para llamadas al backend
- **Emotion**: CSS-in-JS para estilos

## Estructura de Directorios

```
frontend/
├── src/
│   ├── main.tsx                     # Punto de entrada de la aplicación
│   ├── App.tsx                      # Componente principal con useRoutes
│   ├── components/                  # Componentes React
│   │   ├── ProductList.tsx          # Lista de productos con búsqueda y filtros
│   │   ├── ProductFilters.tsx       # Filtros de búsqueda (precio, categoría, condición)
│   │   ├── CategoriesPage.tsx       # Grid de categorías con imágenes
│   │   ├── PopularProducts.tsx      # Top 6 productos más buscados
│   │   ├── Header.tsx               # Encabezado con logo (sticky)
│   │   ├── Footer.tsx               # Pie de página con redes sociales
│   │   ├── ErrorAlert.tsx           # Alertas de error
│   │   ├── SuccessAlert.tsx         # Alertas de éxito
│   │   ├── CircularLoader.tsx       # Indicador de carga
│   │   ├── ModeView.tsx             # Selector de vista (grid/list)
│   │   └── mui/                     # Componentes MUI personalizados
│   │       ├── InputLogin.tsx
│   │       └── InputPassWord.tsx
│   ├── layouts/                     # Layouts de página
│   │   ├── dashboardLayout/         # Layout con sidebar (no usado actualmente)
│   │   │   ├── MainLayout.tsx
│   │   │   └── menuHeader/
│   │   ├── auth/
│   │   │   └── AuthLayout.tsx       # Layout para login/registro
│   │   └── blank-layout/
│   │       └── BlankLayout.tsx      # Layout sin header/footer (rutas públicas)
│   ├── routes/                      # Configuración de rutas
│   │   ├── Routes.tsx               # Definición de rutas con react-router-dom v7
│   │   └── Loadable.tsx             # HOC para lazy loading
│   ├── views/                       # Vistas/Páginas principales
│   │   ├── home/
│   │   │   └── Home.tsx             # Página principal (categorías + buscador)
│   │   ├── product/
│   │   │   └── ProductDetail.tsx    # Vista detallada de producto con vendedor
│   │   └── authentication/
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── ResetPass.tsx
│   │       └── Error.tsx
│   ├── types/                       # Definiciones TypeScript
│   │   └── index.ts                 # Interfaces: Product, FilterState, Sugerencia
│   ├── style/                       # Temas y estilos
│   │   ├── theme.mui.ts             # Tema MUI personalizado
│   │   └── customTheme.ts           # Configuración de tema
│   ├── scripts/                     # Utilidades
│   │   └── useWindowDimensions.ts   # Hook para dimensiones de ventana
│   ├── data/                        # Datos estáticos (deprecado)
│   │   └── products.json            # Productos de ejemplo
│   └── assets/                      # Recursos estáticos
│       ├── icons/
│       ├── login/
│       └── logopulgashop.png        # Logo principal
├── public/                          # Archivos públicos
├── index.html                       # HTML principal
├── package.json                     # Dependencias y scripts
├── vite.config.ts                   # Configuración de Vite
├── tsconfig.json                    # Configuración TypeScript
└── README.md                        # Este archivo
```

## Integración con Backend

### URL Base del API
```typescript
const API_URL = "http://localhost:5610";
```

### Llamadas al Backend (Modularizadas)

#### **1. ProductList.tsx** - Componente Principal de Búsqueda

**Endpoints utilizados:**
```typescript
// Obtener todos los productos (carga inicial)
GET http://localhost:5610/api/search/products/all

// Buscar con filtros
GET http://localhost:5610/api/search/products
  ?busqueda=laptop
  &precio=entre 100 - 300
  &categoria=ELECTRÓNICA
  &condicion=NUEVO
  &ordenar=precio-asc

// Guardar en historial
POST http://localhost:5610/api/search/history
Body: {
  busqueda: "laptop",
  filtros: { precio, categoria, condicion }
}

// Registrar click en producto
POST http://localhost:5610/api/search/clicks
Body: {
  searchId: "xxx",
  productId: "123"
}

// Obtener sugerencias
GET http://localhost:5610/api/search/suggestions?texto=lap
```

**Ubicación del código:**
```typescript
// Línea ~70-150: buscarProductos()
const response = await axios.get(`${API_URL}/api/search/products`, {
  params: searchParams
});

// Línea ~125: Guardar historial
await axios.post(`${API_URL}/api/search/history`, {
  busqueda: filters.search,
  filtros: { ... }
});

// Línea ~195: Registrar click
await axios.post(`${API_URL}/api/search/clicks`, {
  searchId, productId
});

// Línea ~220: Obtener sugerencias
const response = await axios.get(
  `${API_URL}/api/search/suggestions?texto=${texto}`
);
```

#### **2. CategoriesPage.tsx** - Grid de Categorías

**Endpoints utilizados:**
```typescript
// Obtener todas las categorías con conteo
GET http://localhost:5610/api/categories
```

**Ubicación del código:**
```typescript
// Línea ~185: cargarCategorias()
const response = await axios.get<Category[]>(
  "http://localhost:5610/api/categories"
);

// Línea ~195-202: Convertir URLs relativas a absolutas
...response.data.map(cat => ({
  ...cat,
  imagen: cat.imagen 
    ? `http://localhost:5610${cat.imagen}`
    : null
}))
```

#### **3. PopularProducts.tsx** - Productos Más Clickeados

**Endpoints utilizados:**
```typescript
// Obtener top 6 productos más buscados
GET http://localhost:5610/api/categories/top-products?limit=6
```

**Ubicación del código:**
```typescript
// Línea ~35: cargarProductosPopulares()
const response = await axios.get(
  "http://localhost:5610/api/categories/top-products?limit=6"
);
setProductos(response.data.productos || []);
```

**Características:**
- Muestra badge con cantidad de búsquedas
- Scroll horizontal en móviles
- Click para navegar al detalle del producto

#### **4. ProductDetail.tsx** - Vista Detallada de Producto (NUEVO)

**Endpoints utilizados:**
```typescript
// Obtener información completa del producto
GET http://localhost:5610/api/search/products/:id/detail
```

**Ubicación del código:**
```typescript
// Línea ~65-75: cargarDetalle()
const response = await axios.get<ProductDetail>(
  `http://localhost:5610/api/search/products/${id}/detail`
);
setDetalle(response.data);
```

**Características:**
- **Galería de imágenes** con thumbnails navegables
- **Información del vendedor/tienda**:
  - Avatar con icono (tienda/persona)
  - Nombre y tipo (tienda/vendedor)
  - Email de contacto
- **Detalles del producto**:
  - Nombre, precio, descripción
  - Marca, SKU, stock disponible
  - Categoría y condición (chips)
- **Opciones de entrega**:
  - Tipo de despacho (envío/retiro/ambos)
  - Precio de envío
- **Botón "Volver al Buscador"** con navegación contextual usando `location.state`
- **Layout responsivo**: 2 columnas en desktop, 1 columna en móvil
- **Estructura flex** para evitar superposición del header

**Flujo de navegación:**
```
ProductList → Click en producto
  → navigate("/producto/:id", { state: { showSearch: true } })
  → ProductDetail se carga
  → GET /api/search/products/:id/detail
  → Muestra información completa
  → Usuario clickea "Volver al Buscador"
  → navigate("/", { state: { showSearch: true } })
  → ProductList detecta state.showSearch
  → setShowCategories(false) → Muestra buscador directamente
```

### Interfaces TypeScript (types/index.ts)

```typescript
// Producto retornado por el backend
export interface Product {
  id_producto: number;
  id_tienda: number;
  nombre: string;
  precio: number;
  categoria: string;
  condicion: string;
  descripcion?: string;
  stock?: number;
  sku?: string;
  marca?: string;
  imagen?: string;
}

// Estado de filtros de búsqueda
export interface FilterState {
  search: string;
  precio: string;
  categoria: string;
  condicion: string;
  ordenPrecio: string;
}

// Sugerencia de búsqueda
export interface Sugerencia {
  texto: string;
  tipo: "historial" | "coincidencia";
  filtros?: Record<string, string>;
}

// Detalle completo de producto (NUEVO)
export interface ProductDetail {
  producto: {
    id_producto?: number;
    nombre: string;
    precio: number;
    descripcion: string;
    categoria: string;
    condicion: string;
    stock?: number;
    marca?: string;
    sku?: string;
  };
  vendedor: {
    id: string;
    nombre: string;
    email?: string;
    tipo?: string; // "tienda" | "persona"
    telefono?: string;
  };
  publicacion?: {
    multimedia: Array<{ url: string; tipo: string }>;
    despacho: string; // "envio" | "retiro" | "ambos"
    precio_envio: number;
    estado: string;
    fecha_creacion: string;
  };
}
```

## Flujo de Funcionalidades

### 1. **Carga Inicial**
```
Usuario ingresa → CategoriesPage.tsx se monta
  → GET /api/categories (obtener categorías)
  → Convierte URLs de imágenes a absolutas
  → Agrega categoría "TODO"
  → Muestra grid de categorías
```

### 2. **Navegación por Categoría**
```
Usuario clickea categoría → handleSelectCategory()
  → Actualiza filtros: categoria = "ELECTRÓNICA"
  → Navega a ProductList.tsx
  → useEffect detecta cambio en filters.categoria
  → GET /api/search/products?categoria=ELECTRÓNICA
  → Muestra productos filtrados
  → POST /api/search/history (si hay búsqueda)
```

### 3. **Búsqueda con Texto**
```
Usuario escribe "laptop" → handleSearch()
  → Actualiza filters.search
  → GET /api/search/suggestions?texto=laptop
  → Muestra sugerencias
  → Usuario presiona Enter o clickea sugerencia
  → buscarProductos()
  → GET /api/search/products?busqueda=laptop&...
  → POST /api/search/history
  → Guarda searchId para tracking de clicks
```

### 4. **Aplicar Filtros**
```
Usuario selecciona filtro → handleFilterChange()
  → Actualiza estado de filtros
  → useEffect detecta cambio
  → buscarProductos() automáticamente
  → GET /api/search/products con todos los filtros
```

### 5. **Click en Producto**
```
Usuario clickea producto → handleProductClick()
  → POST /api/search/clicks
  Body: { searchId, productId }
  → Registra click en MongoDB
  → (Opcional) Navegar a detalle del producto
```

### 6. **Productos Populares**
```
PopularProducts.tsx se monta → useEffect()
  → GET /api/categories/top-products?limit=6
  → Muestra scroll horizontal con badges
  → Badge muestra cantidad de búsquedas
  → Click en producto → navigate("/producto/:id")
```

### 7. **Categoría "Sorpréndeme" (NUEVO)**
```
Usuario clickea "Aleatorio/Sorpréndeme" → handleSelectCategory("ALEATORIO")
  → GET /api/categories/random
  → Backend usa Fisher-Yates shuffle para seleccionar 8 productos aleatorios
  → Muestra grid de productos variados
  → Cada recarga muestra productos diferentes
```

### 8. **Vista Detallada de Producto (NUEVO)**
```
Usuario clickea producto → handleProductClick()
  → navigate("/producto/:id", { state: { showSearch: true } })
  → ProductDetail se renderiza con layout flex
  → GET /api/search/products/:id/detail
  → Muestra:
    - Galería de imágenes (CardMedia + thumbnails)
    - Información completa del producto (Cards)
    - Datos del vendedor/tienda (Avatar + Typography)
    - Opciones de despacho y envío
  → Usuario clickea "Volver al Buscador"
  → navigate("/", { state: { showSearch: true } })
  → ProductList detecta state y muestra buscador directamente
```

## Diseño Responsivo y Layout

### Breakpoints MUI
- **Móviles (< 600px)**: 1 columna, menú colapsable
- **Tablets (600-960px)**: 2 columnas
- **Escritorio (> 960px)**: 3-4 columnas, vista completa

### Estructura de Layout Flexbox

Todas las páginas usan una estructura flex consistente para evitar problemas de superposición:

```tsx
<Box sx={{ 
  display: "flex", 
  flexDirection: "column", 
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden" 
}}>
  <AppBar position="static"> {/* Header */} </AppBar>
  <Box sx={{ flex: 1 }}> {/* Contenido principal */} </Box>
  <Footer /> {/* Footer (opcional) */}
</Box>
```

**Beneficios:**
- ✅ Header siempre visible pero no tapa contenido
- ✅ Contenido ocupa espacio disponible (`flex: 1`)
- ✅ Footer al final de la página
- ✅ Sin scroll horizontal inesperado
- ✅ Responsive automático

### Headers

- **Header.tsx**: Header principal con logo "Pulga Shop" (sticky en algunas vistas)
- **ProductDetail**: Header propio con logo + botón "Volver al Buscador"

### Prevención de Scroll Horizontal

**index.css:**
```css
html, body {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}
```

**Componentes:**
```tsx
<Container maxWidth="lg" sx={{ overflowX: "hidden" }}>
  {/* Contenido */}
</Container>
```

## Componentes MUI Utilizados

- `Container`: Contenedores responsivos
- `Grid`: Sistema de layout en grilla
- `Card`, `CardContent`, `CardMedia`: Tarjetas de productos/categorías
- `TextField`: Inputs de búsqueda
- `Select`, `MenuItem`: Dropdowns de filtros
- `Button`, `IconButton`: Botones de acción
- `Chip`: Tags para categoría/condición/stock
- `CircularProgress`: Indicadores de carga
- `Stack`: Layout vertical/horizontal
- `Typography`: Textos estilizados

## Variables de Entorno (Opcional)

Puedes configurar la URL del backend en un archivo `.env`:
```env
VITE_API_URL=http://localhost:5610
```

Y usarlo en el código:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5610";
```

## Scripts Disponibles

```bash
npm run dev        # Desarrollo con HMR
npm run build      # Compilar para producción
npm run preview    # Vista previa de producción
npm run lint       # Ejecutar ESLint
```

## Debugging

Para ver las llamadas al backend en la consola del navegador:
```typescript
console.log('API Request:', method, url, params);
console.log('API Response:', response.data);
```

Las llamadas están en:
- `ProductList.tsx` (líneas ~70-230)
- `CategoriesPage.tsx` (líneas ~185-210)
- `PopularProducts.tsx` (líneas ~35-50)

## Desarrollo

Para agregar nuevas funcionalidades:
1. Crear componente en `src/components/` o vista en `src/views/`
2. Definir interfaces en `src/types/index.ts`
3. Agregar llamadas al backend con Axios
4. Registrar ruta en `src/routes/Routes.tsx` con el layout apropiado
5. Usar estructura flex para layout consistente

## Troubleshooting

### El contenido no se ve o está tapado por el header
**Solución:** Asegúrate de usar la estructura flex correcta:
```tsx
<Box display="flex" flexDirection="column" minHeight="100vh">
  <AppBar position="static" /> {/* No usar sticky/fixed */}
  <Box flex={1}> {/* Contenido con flex: 1 */} </Box>
</Box>
```

### Scroll horizontal inesperado
**Solución:** Agrega restricciones de ancho:
```tsx
<Box width="100%" maxWidth="100vw" overflowX="hidden">
```

### ProductDetail no muestra información del vendedor
**Solución:** Verifica que el backend tenga productos con datos completos en MongoDB (primeros 5 productos en seed)

### Error 429 (Too Many Requests)
**Solución:** Ajusta rate limits en backend `.env`:
```bash
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=60000
```

### Navegación no funciona correctamente
**Solución:** Verifica que uses `useNavigate` con `state` para contexto:
```tsx
navigate("/producto/1", { state: { showSearch: true } });
```

## Mejoras Futuras

- [ ] Implementar autenticación real con JWT
- [ ] Agregar favoritos/wishlist
- [ ] Implementar comparador de productos
- [ ] Agregar filtros avanzados (rango de precio con slider)
- [ ] Implementar paginación/scroll infinito
- [ ] Agregar sistema de reseñas y calificaciones
- [ ] Implementar carrito de compras
- [ ] Modo oscuro/claro
- [ ] Exportar búsquedas a PDF/Excel
- [ ] Notificaciones push para ofertas

---

**Documentación actualizada:** Noviembre 2025



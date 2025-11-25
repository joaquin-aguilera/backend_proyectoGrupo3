# 🔗 Integración con API de Publicaciones

## Resumen

El microservicio de búsqueda ahora está configurado para consumir productos del **microservicio de publicaciones** (desarrollador backend) en lugar de usar datos estáticos o APIs externas.

---

## ✅ Cambios Realizados

### 1. Actualización de Variables de Entorno (`.env`)

```bash
# Antes
PRODUCTS_API_URL=https://pulga-shop-inventario-api.onrender.com/api

# Ahora
PRODUCTS_API_URL=http://localhost:4040/api
```

### 2. Actualización de `ProductsService`

**Archivo:** `src/services/productsService.ts`

**Cambios:**
- ✅ Constructor actualizado para usar `http://localhost:4040/api` por defecto
- ✅ Método `getProductos()` ahora consume `/publicaciones` en lugar de `/productos`
- ✅ Manejo flexible de respuesta: soporta array directo o `response.data.data`
- ✅ Modo fallback con datos de demostración si la API no está disponible

### 3. Script de Prueba

**Archivo:** `src/scripts/test-publicaciones-api.ts`

**Comando:** 
```bash
npm run test:api
```

**Funcionalidad:**
- Prueba conexión con `http://localhost:4040/api/publicaciones`
- Verifica estructura de datos
- Muestra categorías y condiciones disponibles
- Proporciona diagnóstico detallado de errores

---

## 🚀 Cómo Usar

### Paso 1: Iniciar el Microservicio de Publicaciones

**Importante:** El desarrollador backend debe tener su microservicio corriendo en el puerto **4040**.

```bash
# En la terminal del desarrollador backend
# (comando depende de su configuración)
npm run dev
# O el comando que use para iniciar su servicio
```

**Verificar que esté activo:**
```bash
curl http://localhost:4040/api/publicaciones
```

Debería retornar un array de productos JSON.

### Paso 2: Probar la Conexión

Desde tu proyecto de búsqueda:

```bash
npm run test:api
```

**Salida esperada si funciona:**
```
✅ Conexión exitosa!
📊 Status: 200
📦 Total de productos: 25
🔍 Ejemplo de producto recibido:
{
  "id_producto": 1,
  "nombre": "Laptop HP",
  "precio": 450,
  "categoria": "ELECTRÓNICA",
  "condicion": "NUEVO",
  ...
}
```

**Salida si no está disponible:**
```
❌ Error al conectar con el API de publicaciones
🔴 Conexión rechazada - El servidor no está corriendo
```

### Paso 3: Iniciar el Microservicio de Búsqueda

```bash
npm run dev
```

El servidor iniciará en el puerto **5610** y:
- ✅ Intentará conectarse a `http://localhost:4040/api/publicaciones`
- ✅ Si está disponible, consumirá los productos reales
- ✅ Si NO está disponible, usará 15 productos de demostración

**Verás en la consola:**
```
ProductsService inicializado con URL: http://localhost:4040/api
```

### Paso 4: Probar desde Swagger

1. Abre: `http://localhost:5610/api-docs`
2. Prueba el endpoint: `GET /api/search/products/all`
3. Verifica que retorne productos

---

## 📋 Estructura de Datos Esperada

### Producto del Endpoint Externo

```json
{
  "id_producto": 123,
  "id_tienda": 5,
  "nombre": "Laptop HP Pavilion",
  "precio": 450.00,
  "categoria": "Electrónica",      // Puede venir en diferentes formatos
  "condicion": "nuevo",            // Puede venir en minúsculas
  "stock": 10,
  "sku": "HP-PAV-001",
  "descripcion": "Laptop de 15.6 pulgadas...",
  "marca": "HP",
  "fecha_creacion": "2025-11-20T10:30:00.000Z"
}
```

### Normalización Automática

El servicio normaliza automáticamente:

**Categorías:**
- `"Electrónica"`, `"electronica"`, `"ELECTRONICA"` → `"ELECTRÓNICA"`
- `"Ropa"`, `"ropa"` → `"ROPA"`
- `"Muebles"` → `"HOGAR"`
- `"Accesorios"` → `"GENERAL"`
- Etc.

**Condiciones:**
- `"nuevo"`, `"Nuevo"` → `"NUEVO"`
- `"usado"`, `"Usado"` → `"USADO"`
- `"reacondicionado"` → `"REACONDICIONADO"`

### Producto Normalizado (Interno)

```json
{
  "id_producto": 123,
  "id_tienda": 5,
  "nombre": "Laptop HP Pavilion",
  "precio": 450.00,
  "categoria": "ELECTRÓNICA",      // Estandarizado
  "condicion": "NUEVO",            // Estandarizado
  "stock": 10,
  "sku": "HP-PAV-001",
  "descripcion": "Laptop de 15.6 pulgadas...",
  "marca": "HP",
  "fecha_creacion": "2025-11-20T10:30:00.000Z"
}
```

---

## 🔍 Flujo de Integración

```
┌─────────────────────────────┐
│ Frontend (Puerto 5620)      │
│                             │
│ ProductList.tsx             │
└──────────┬──────────────────┘
           │ GET /api/search/products
           ▼
┌─────────────────────────────┐
│ Backend Búsqueda (5610)     │
│                             │
│ searchController.ts         │
└──────────┬──────────────────┘
           │ productsService.getProductos()
           ▼
┌─────────────────────────────┐
│ ProductsService             │
│                             │
│ GET http://localhost:4040   │
│     /api/publicaciones      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Backend Publicaciones       │
│ (Puerto 4040)               │
│                             │
│ Retorna: Array<Producto>    │
└─────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### Problema 1: "Error: ECONNREFUSED"

**Causa:** El microservicio de publicaciones no está corriendo.

**Solución:**
1. Contacta al desarrollador backend
2. Pídele que inicie su servicio en el puerto 4040
3. Verifica con: `curl http://localhost:4040/api/publicaciones`

### Problema 2: "API requiere autenticación (401)"

**Causa:** El endpoint requiere token de autenticación.

**Solución:**
1. Solicita el token al desarrollador backend
2. Agrégalo en `.env`:
   ```
   PRODUCTS_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Reinicia el servidor

### Problema 3: Productos sin categorías correctas

**Causa:** El endpoint retorna categorías en formato no reconocido.

**Solución:**
1. Ejecuta `npm run test:api` para ver las categorías exactas
2. Si es necesario, actualiza `CATEGORIA_MAPPING` en `productsService.ts`
3. Ejemplo:
   ```typescript
   const CATEGORIA_MAPPING = {
     'Electronics': 'ELECTRÓNICA',  // Agregar esta línea
     'Electrónica': 'ELECTRÓNICA',
     // ...
   };
   ```

### Problema 4: Endpoint retorna estructura diferente

**Causa:** La estructura de respuesta del endpoint es distinta.

**Solución:**
1. Ejecuta `npm run test:api` para ver la estructura exacta
2. Contacta al desarrollador backend para alinear el formato
3. O ajusta el método `getProductos()` en `productsService.ts`:
   ```typescript
   // Si retorna: { productos: [...] }
   const data = response.data.productos;
   
   // Si retorna: { data: { items: [...] } }
   const data = response.data.data.items;
   ```

---

## 📝 Datos de Demostración (Fallback)

Si el endpoint externo no está disponible, el sistema usa **15 productos de demostración** que incluyen:

- 5 productos de **ELECTRÓNICA** (laptops, monitores)
- 4 productos de **HOGAR** (sillas, escritorios)
- 6 productos de **GENERAL** (teclados, mouse, webcams)
- 3 condiciones: **NUEVO** (13 productos), **USADO** (2 productos)

Esto garantiza que:
- ✅ El frontend siempre tenga datos para mostrar
- ✅ Los filtros funcionen correctamente
- ✅ Se puedan hacer pruebas sin depender del endpoint externo

---

## 🎯 Ventajas de esta Integración

1. **Datos Reales:** Consume productos actualizados del microservicio de publicaciones
2. **Desacoplamiento:** Cada microservicio mantiene su independencia
3. **Normalización:** Convierte diferentes formatos a un estándar interno
4. **Fallback Automático:** Funciona incluso si el endpoint externo falla
5. **Fácil Debugging:** Script de prueba (`npm run test:api`) para diagnóstico rápido

---

## 📞 Contacto

Si tienes problemas con la integración:
1. Ejecuta `npm run test:api` y revisa el diagnóstico
2. Contacta al desarrollador backend del microservicio de publicaciones
3. Comparte el output del script de prueba para debugging

---

## ✨ Próximos Pasos

Una vez que el desarrollador backend tenga su servicio corriendo:

1. ✅ Ejecutar `npm run test:api` para confirmar conexión
2. ✅ Iniciar ambos servicios (publicaciones en 4040, búsqueda en 5610)
3. ✅ Probar desde Swagger: `http://localhost:5610/api-docs`
4. ✅ Verificar en frontend que aparezcan los productos reales
5. ✅ Probar filtros por categoría, precio, condición
6. ✅ Confirmar que las búsquedas funcionen correctamente

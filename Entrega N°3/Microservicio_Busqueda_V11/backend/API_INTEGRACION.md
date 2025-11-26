# API de Integración - Búsquedas de Productos

## Endpoint para Grupo 1 - Analítica

Este endpoint proporciona información sobre productos buscados para que se pueda calcular métricas y estadísticas.

## GET /api/search/product-searches

Retorna todas las búsquedas de productos con el formato: `{id_producto, nombre, fecha}`

### URL
```
GET http://localhost:5610/api/search/product-searches
```

### Parámetros de Query (Opcionales)

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `desde` | string (ISO 8601) | Fecha inicial del rango | `2025-11-01T00:00:00Z` |
| `hasta` | string (ISO 8601) | Fecha final del rango | `2025-11-20T23:59:59Z` |
| `limite` | integer (1-10000) | Máximo de registros a retornar | `1000` (default) |

### Respuesta Exitosa (200 OK)

```json
{
  "total": 45,
  "busquedas": 12,
  "periodo": {
    "desde": "2025-11-01T00:00:00Z",
    "hasta": "2025-11-20T23:59:59Z"
  },
  "datos": [
    {
      "id_producto": "1",
      "nombre": "Laptop HP Pavilion 15",
      "fecha": "2025-11-19T10:30:00.000Z",
      "queryText": "laptop"
    },
    {
      "id_producto": "3",
      "nombre": "Teclado Mecánico RGB",
      "fecha": "2025-11-19T11:15:00.000Z",
      "queryText": "teclado"
    },
    {
      "id_producto": "1",
      "nombre": "Laptop HP Pavilion 15",
      "fecha": "2025-11-19T14:20:00.000Z",
      "queryText": "[navegación por categoría/filtros]"
    }
  ]
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total` | number | Total de registros retornados |
| `busquedas` | number | Total de búsquedas procesadas |
| `periodo.desde` | string | Fecha inicial del periodo consultado |
| `periodo.hasta` | string | Fecha final del periodo consultado |
| `datos` | array | Lista de búsquedas de productos |
| `datos[].id_producto` | string | ID único del producto |
| `datos[].nombre` | string | Nombre completo del producto |
| `datos[].fecha` | string | Fecha y hora de la búsqueda (ISO 8601) |
| `datos[].queryText` | string | Término de búsqueda usado (opcional) |


## Casos de Uso

### 1. Obtener todas las búsquedas
```bash
curl -X GET "http://localhost:5610/api/search/product-searches"
```

### 2. Búsquedas de la última semana
```bash
curl -X GET "http://localhost:5610/api/search/product-searches?desde=2025-11-13T00:00:00Z&hasta=2025-11-20T23:59:59Z"
```

### 3. Limitar resultados
```bash
curl -X GET "http://localhost:5610/api/search/product-searches?limite=500"
```

### 4. Rango específico con límite
```bash
curl -X GET "http://localhost:5610/api/search/product-searches?desde=2025-11-01T00:00:00Z&hasta=2025-11-30T23:59:59Z&limite=2000"
```

## Notas Importantes

1. **Duplicados son normales**: Si un producto aparece en múltiples búsquedas, aparecerá múltiples veces en los datos. Esto es correcto para calcular "cantidad de veces buscado".

2. **queryText puede ser descriptivo**: Si el valor es `[navegación por categoría/filtros]`, significa que el usuario encontró el producto navegando por categorías sin usar búsqueda textual.

3. **Límite máximo**: El endpoint tiene un límite de 10,000 registros por solicitud. Para datasets grandes, use paginación por fechas.

4. **Fechas en UTC**: Todas las fechas están en formato ISO 8601 con zona horaria UTC.

5. **Rate limiting**: El endpoint tiene rate limiting de 100 requests por minuto.

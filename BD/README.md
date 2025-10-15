
# BD del Microservicio de Búsqueda y Descubrimiento

Este paquete levanta **MongoDB** (con índices y datos de ejemplo) para el microservicio de **Búsqueda y Descubrimiento**. Stack objetivo: **NestJS + Mongoose**.

> Métrica de Entrega 2 (Equipo 1): **clicks por producto** en un rango de fechas.

## Estructura
```
search-microservice-db/
├─ docker-compose.yml
├─ init/
│  ├─ 01-init.js         # crea usuario, colecciones y índices
│  └─ 02-seed.js         # datos de ejemplo
├─ scripts/
│  └─ query-clicks-example.mjs   # script Node para probar la métrica
└─ test/
   └─ queries.md
```

## Requisitos
- Docker y Docker Compose
- (Opcional) Node 18+ para ejecutar el script de prueba

## Arranque
```bash
cd search-microservice-db
# Opcional: cambia credenciales por defecto editando docker-compose.yml y init/01-init.js
export MONGO_ROOT_USER=root
export MONGO_ROOT_PASSWORD=rootpass

docker compose up -d
```

Espera ~5–10 segundos mientras corren los scripts de `init/`.

## Verificación rápida
- Web UI (opcional): http://localhost:8081
- CLI dentro del contenedor:
```bash
docker exec -it search_mongo mongosh 'mongodb://root:rootpass@localhost:27017/admin'
# luego
use searchdb
show collections
```

## Probar la métrica de clicks por producto
```bash
# Node 18+
cd search-microservice-db
node scripts/query-clicks-example.mjs 2025-10-01 2025-10-31
```
Deberías ver una tabla con `productId` y `clicks`.

### Pipeline equivalente en `mongosh`
```javascript
db.clicks.aggregate([
  { $match: { clickedAt: { $gte: ISODate('2025-10-01T00:00:00Z'), $lte: ISODate('2025-10-31T23:59:59Z') } } },
  { $group: { _id: '$productId', clicks: { $sum: 1 } } },
  { $sort: { clicks: -1 } }
]);
```

## Conexión desde NestJS (cuando creen el backend)
- URI recomendada (usuario de aplicación creado por `01-init.js`):
```
mongodb://search_user:search_pass@localhost:27017/searchdb?authSource=searchdb
```
- Ejemplo (MongooseModule):
```ts
MongooseModule.forRoot(process.env.MONGODB_URI)
```

## Seguridad
- Cambia `search_user/search_pass` en `init/01-init.js` para producción.
- Restringe el puerto 27017 en servidores públicos (usa red interna o VPN).

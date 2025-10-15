
# Consultas de referencia (mongosh)

## Clicks por producto (rango de fechas)
```javascript
db.clicks.aggregate([
  { $match: { clickedAt: { $gte: ISODate('2025-10-01T00:00:00Z'), $lte: ISODate('2025-10-31T23:59:59Z') } } },
  { $group: { _id: '$productId', clicks: { $sum: 1 } } },
  { $sort: { clicks: -1 } }
]);
```

## Impresiones por producto (si alguna vez lo piden)
```javascript
db.searches.aggregate([
  { $match: { requestedAt: { $gte: ISODate('2025-10-01T00:00:00Z'), $lte: ISODate('2025-10-31T23:59:59Z') } } },
  { $unwind: '$results' },
  { $group: { _id: '$results.productId', impresiones: { $sum: 1 } } },
  { $sort: { impresiones: -1 } }
]);
```

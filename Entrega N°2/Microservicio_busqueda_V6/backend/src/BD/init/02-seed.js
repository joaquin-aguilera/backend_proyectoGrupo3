
// init/02-seed.js
const dbName = 'searchdb';
const db = db.getSiblingDB(dbName);
const searchId = db.searches.insertOne({
  userId: 'user-123', sessionId: null, queryText: 'notebook dell',
  filters: { categoria: 'electronica', precioMax: 500000 }, sortBy: 'price', sortDir: 'asc',
  page: 1, pageSize: 20, requestedAt: new Date('2025-10-15T23:20:00Z'), latencyMs: 120, source: 'web',
  results: [ { productId: 'P-987', position: 1, score: 0.873 }, { productId: 'P-654', position: 2, score: 0.812 } ]
}).insertedId;

db.clicks.insertMany([
  { searchId, productId: 'P-987', userId: 'user-123', clickedAt: new Date('2025-10-15T23:21:00Z') },
  { searchId, productId: 'P-987', userId: 'user-123', clickedAt: new Date('2025-10-15T23:22:10Z') },
  { searchId, productId: 'P-654', userId: 'user-123', clickedAt: new Date('2025-10-15T23:23:30Z') }
]);
print('Seed insertado.');

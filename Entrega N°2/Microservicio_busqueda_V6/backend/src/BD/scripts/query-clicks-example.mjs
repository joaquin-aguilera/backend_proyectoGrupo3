
// scripts/query-clicks-example.mjs
// Ejecutar con: node scripts/query-clicks-example.mjs "2025-10-01" "2025-10-31"
import { MongoClient } from 'mongodb';
const from = process.argv[2];
const to = process.argv[3];
if (!from || !to) {
  console.error('Uso: node scripts/query-clicks-example.mjs <from:YYYY-MM-DD> <to:YYYY-MM-DD>');
  process.exit(1);
}
const uri = process.env.MONGODB_URI || 'mongodb://search_user:search_pass@localhost:27017/searchdb?authSource=searchdb';
const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db();
  const start = new Date(`${from}T00:00:00.000Z`);
  const end   = new Date(`${to}T23:59:59.999Z`);
  const agg = [
    { $match: { clickedAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$productId', clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } }
  ];
  const rows = await db.collection('clicks').aggregate(agg).toArray();
  console.table(rows.map(r => ({ productId: r._id, clicks: r.clicks })));
} catch (e) {
  console.error(e);
  process.exit(2);
} finally {
  await client.close();
}

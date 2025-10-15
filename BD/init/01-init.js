
// init/01-init.js
const dbName = 'searchdb';
const appUser = 'search_user';
const appPass = 'search_pass';
const db = db.getSiblingDB(dbName);
try {
  db.createUser({ user: appUser, pwd: appPass, roles: [{ role: 'readWrite', db: dbName }] });
  print(`Usuario '${appUser}' creado en DB '${dbName}'.`);
} catch (e) { print(`Usuario '${appUser}' puede existir: ${e}`); }

db.createCollection('searches', {
  validator: { $jsonSchema: { bsonType: 'object', required: ['queryText','requestedAt','results'], properties: {
    userId: { bsonType: ['string','null'] },
    sessionId: { bsonType: ['string','null'] },
    queryText: { bsonType: 'string' },
    filters: { bsonType: ['object','null'] },
    sortBy: { bsonType: ['string','null'] },
    sortDir: { enum: ['asc','desc',null] },
    page: { bsonType: 'int' }, pageSize: { bsonType: 'int' }, requestedAt: { bsonType: 'date' },
    latencyMs: { bsonType: ['int','null'] }, source: { bsonType: ['string','null'] },
    results: { bsonType: 'array', items: { bsonType: 'object', required: ['productId','position'], properties: {
      productId: { bsonType: 'string' }, position: { bsonType: 'int' }, score: { bsonType: ['double','decimal','int','null'] }
    } } }
  } } }
});
try { db.searches.createIndex({ userId: 1, requestedAt: -1 }, { name: 'user_date' }); } catch(e){}
try { db.searches.createIndex({ requestedAt: -1 }, { name: 'date_desc' }); } catch(e){}
try { db.searches.createIndex({ 'results.productId': 1, requestedAt: 1 }, { name: 'results_product_date' }); } catch(e){}
try { db.searches.createIndex({ queryText: 'text' }, { name: 'query_text' }); } catch(e){}

db.createCollection('clicks', {
  validator: { $jsonSchema: { bsonType: 'object', required: ['searchId','productId','clickedAt'], properties: {
    searchId: { bsonType: 'objectId' }, productId: { bsonType: 'string' }, userId: { bsonType: ['string','null'] }, clickedAt: { bsonType: 'date' }
  } } }
});
try { db.clicks.createIndex({ productId: 1, clickedAt: 1 }, { name: 'product_date' }); } catch(e){}
try { db.clicks.createIndex({ searchId: 1 }, { name: 'by_search' }); } catch(e){}
try { db.clicks.createIndex({ userId: 1, clickedAt: -1 }, { name: 'user_date' }); } catch(e){}

db.createCollection('index_events', {
  validator: { $jsonSchema: { bsonType: 'object', required: ['productId','action','receivedAt','status'], properties: {
    productId: { bsonType: 'string' }, action: { enum: ['CREATE','UPDATE','DELETE'] }, payload: { bsonType: ['object','null'] },
    receivedAt: { bsonType: 'date' }, processedAt: { bsonType: ['date','null'] }, status: { enum: ['PENDING','PROCESSED','FAILED'] }, errorMessage: { bsonType: ['string','null'] }
  } } }
});
try { db.index_events.createIndex({ status: 1, receivedAt: -1 }, { name: 'status_date' }); } catch(e){}
try { db.index_events.createIndex({ productId: 1 }, { name: 'by_product' }); } catch(e){}
print('BD inicializada.');

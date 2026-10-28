require('dotenv').config();
const m = require('mongoose');
(async () => {
  await m.connect(process.env.MONGO_URI);
  const db = m.connection.db;
  for (const c of await db.listCollections().toArray()) {
    if (c.name.startsWith('system.')) continue;
    const col = db.collection(c.name);
    const missing = c.name === 'institutions' ? 0 : await col.countDocuments({ institutionId: { $exists: false } });
    const uniq = (await col.indexes()).filter(i => i.unique && i.name !== '_id_').map(i => i.name);
    console.log(c.name.padEnd(18), 'missing institutionId:', missing, uniq.length ? ' UNIQUE: ' + uniq.join(', ') : '');
  }
  await m.disconnect();
})();

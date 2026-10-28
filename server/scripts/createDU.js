require('dotenv').config();
const m = require('mongoose');
const I = require('../models/Institution');
(async () => {
  await m.connect(process.env.MONGO_URI);
  await I.updateOne({ slug: 'du' }, { $setOnInsert: { name: 'Dhaka University RIC', shortName: 'DU', slug: 'du', status: 'Active' } }, { upsert: true });
  console.log('DU ready');
  await m.disconnect();
})();

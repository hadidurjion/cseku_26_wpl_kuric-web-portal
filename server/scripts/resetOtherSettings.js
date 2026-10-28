require('dotenv').config();
require('../plugins/tenant');
const m = require('mongoose');
const Institution = require('../models/Institution');
const Settings = require('../models/Settings');
(async () => {
  await m.connect(process.env.MONGO_URI);
  const ku = await Institution.findOne({ slug: 'ku' });
  const r = await Settings.deleteMany({ institutionId: { $ne: ku._id } });
  console.log('Deleted non-KU settings:', r.deletedCount);
  await m.disconnect();
})();

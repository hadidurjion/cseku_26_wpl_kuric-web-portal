require('dotenv').config();
require('../plugins/tenant');
const m = require('mongoose');
const bcrypt = require('bcryptjs');
const Institution = require('../models/Institution');
const User = require('../models/User');
(async () => {
  await m.connect(process.env.MONGO_URI);
  const ku = await Institution.findOne({ slug: 'ku' });
  const email = 'superadmin@kuric.app';
  if (await User.findOne({ email, institutionId: ku._id })) {
    console.log('Super Admin already exists');
  } else {
    await User.create({
      name: 'Super Admin', email, role: 'superadmin', institutionId: ku._id,
      password: await bcrypt.hash('Super@12345', 10),
    });
    console.log('Super Admin created:', email, '/ Super@12345');
  }
  await m.disconnect();
})();

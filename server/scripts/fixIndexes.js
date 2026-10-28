require('dotenv').config();
require('../plugins/tenant');
const m = require('mongoose');
(async () => {
  await m.connect(process.env.MONGO_URI);
  for (const n of ['User', 'Settings', 'FundedProject']) {
    const M = require('../models/' + n);
    console.log(n, 'dropped:', await M.syncIndexes());
  }
  await m.disconnect();
})();

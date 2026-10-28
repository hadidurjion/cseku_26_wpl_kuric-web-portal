const Institution = require('../../models/Institution');

exports.seedKU = () =>
  Institution.create({
    name: 'Khulna University Research and Innovation Center',
    shortName: 'KU',
    slug: 'ku',
    status: 'Active',
  });

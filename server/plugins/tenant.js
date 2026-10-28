const mongoose = require('mongoose');
const als = require('./tenantContext');

// Adds institutionId to every model (except Institution) and scopes all queries by it
mongoose.plugin((schema) => {
  if (schema.path('slug') && schema.path('shortName')) return; // Institution schema

  schema.add({
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', index: true },
  });

  const scope = function () {
    const s = als.getStore();
    if (!s) return;
    if (this.getFilter().institutionId === undefined) {
      this.where({ institutionId: s.institutionId });
    }
  };

  ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'findOneAndReplace',
   'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'countDocuments'].forEach((op) => {
    schema.pre(op, { query: true, document: false }, scope);
  });

  schema.pre('validate', function () {
    if (!this.institutionId) {
      const s = als.getStore();
      if (s) this.institutionId = s.institutionId;
    }
  });
});


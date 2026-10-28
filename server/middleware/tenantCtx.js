const als = require('../plugins/tenantContext');

// Re-enter the institution context after multer (file upload) parses the request
module.exports = (req, res, next) => als.run({ institutionId: req.institutionId }, () => next());

const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');
const als = require('../plugins/tenantContext');

const cache = {};
const TTL = 15000;

async function bySlug(slug) {
  const c = cache['s:' + slug];
  if (c && Date.now() - c.t < TTL) return c.inst;
  const inst = await Institution.findOne({ slug, status: 'Active' }).lean();
  if (inst) cache['s:' + slug] = { inst, t: Date.now() };
  return inst;
}

async function isActive(id) {
  const c = cache['i:' + id];
  if (c && Date.now() - c.t < TTL) return c.ok;
  const inst = await Institution.findById(id).select('status').lean();
  const ok = !!inst && inst.status === 'Active';
  cache['i:' + id] = { ok, t: Date.now() };
  return ok;
}

module.exports = async function resolveTenant(req, res, next) {
  try {
    let id = null;
    const h = req.headers.authorization;
    if (h && h.startsWith('Bearer ')) {
      try {
        const d = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
        if (d.institutionId) id = String(d.institutionId);
      } catch (e) { /* fall through to slug */ }
    }
    if (id) {
      if (!(await isActive(id))) {
        return res.status(403).json({ message: 'This institution is not active' });
      }
    } else {
      const slug = String(req.headers['x-institution'] || req.query.institution || 'ku').toLowerCase();
      const inst = await bySlug(slug);
      if (!inst) return res.status(404).json({ message: 'Institution not found' });
      id = String(inst._id);
    }
    req.institutionId = id;
    als.run({ institutionId: id }, () => next());
  } catch (err) {
    next(err);
  }
};

module.exports.clearCache = () => {
  Object.keys(cache).forEach((k) => delete cache[k]);
};


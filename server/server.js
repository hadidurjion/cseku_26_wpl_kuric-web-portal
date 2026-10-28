require('./plugins/tenant');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const reviewRoutes = require('./routes/reviews');
const contentRoutes = require('./routes/content');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const aiRoutes = require('./routes/ai');
const officerRoutes = require('./routes/officer');
const inquiryRoutes = require('./routes/inquiries');
const fundingRoutes = require('./routes/funding');
const staffRoutes = require('./routes/staff');
const galleryRoutes = require('./routes/gallery');


const app = express();

app.use(cors());
app.get('/api/health', (req, res) => res.send('KURIC API is running'));
// Forward website routes to the local Next.js dev server. This lets phones
// reach the website through the API port when the dev port is firewalled.
app.use((req, res, next) => {
  if (req.path === '/api' || req.path.startsWith('/api/') || req.path === '/uploads' || req.path.startsWith('/uploads/')) {
    return next();
  }

  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: req.originalUrl,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:3000' },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    if (!res.headersSent) res.status(502).send('Website server is not running');
  });
  req.pipe(proxyReq);
});

app.use(express.json());
app.use(require('./middleware/resolveTenant'));
const path = require('path');

app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      console.error('File download error:', err.message);
      if (!res.headersSent) {
        res.status(404).json({ message: 'File not found' });
      }
    }
  });
});

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/proposals', proposalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/gallery', galleryRoutes);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('MongoDB connection error:', err));
}





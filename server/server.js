require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

const app = express();

app.use(cors());
app.use(express.json());
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
app.use('/api/proposals', proposalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/funding', fundingRoutes);

app.get('/', (req, res) => {
  res.send('KURIC API is running');
});

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
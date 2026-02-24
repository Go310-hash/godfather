/**
 * PCHS Bamenda - Online Student Registration
 * Express server + static frontend
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const studentRoutes = require('./src/routes/students');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static: frontend + uploads
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// API routes
const feesConfig = require('./src/config/fees');
app.get('/api/fees', (req, res) => res.json({ success: true, data: feesConfig.getAllFees() }));
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// SPA fallback: serve index for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ message: 'Not found' });
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const { seedDefaultAdmin } = require('./src/seedDefaultAdmin');

app.listen(PORT, async () => {
  await seedDefaultAdmin();
  console.log(`PCHS Bamenda server running at http://localhost:${PORT}`);
});

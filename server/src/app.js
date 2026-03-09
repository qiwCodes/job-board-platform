require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();
const port = process.env.PORT || 5000;
const uploadsDirectory = path.resolve(__dirname, '../uploads');

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Resume file size must not exceed 5MB.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid file upload.',
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Request failed.',
    });
  }

  console.error('Unhandled error:', error);

  return res.status(500).json({
    success: false,
    message: error.message || 'Internal server error.',
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;

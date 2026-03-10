const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');

const uploadsDirectory = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_req, _file, callback) => {
    callback(null, `${randomUUID()}.pdf`);
  },
});

const fileFilter = (_req, file, callback) => {
  const isPdfMimeType = file.mimetype === 'application/pdf';
  const hasPdfExtension = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMimeType && hasPdfExtension) {
    return callback(null, true);
  }

  const error = new Error('Only PDF files are allowed.');
  error.statusCode = 400;
  return callback(error);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = {
  uploadResume: upload.single('resume'),
};

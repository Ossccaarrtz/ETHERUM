import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Multer configuration for video uploads
 */

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  },
});

// File filter - accept video files
const fileFilter = (req, file, cb) => {
  console.log('File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Extended list of video MIME types
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'video/ogg',
    'video/x-flv',
    'video/3gpp',
    'video/3gpp2',
    'video/x-ms-wmv',
    'application/octet-stream' // Fallback for unknown types
  ];

  // Check by MIME type
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  // Check by file extension as fallback
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    '.mp4', '.webm', '.ogg', '.mov', '.avi', 
    '.mkv', '.mpeg', '.mpg', '.flv', '.3gp', 
    '.m4v', '.wmv'
  ];

  if (allowedExtensions.includes(ext)) {
    console.log('Accepted by extension:', ext);
    cb(null, true);
    return;
  }

  // Reject
  console.error('File rejected:', file.mimetype, ext);
  cb(new Error(`Invalid file type. Received: ${file.mimetype || 'unknown'} (${ext}). Only video files are allowed.`), false);
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

export default upload;

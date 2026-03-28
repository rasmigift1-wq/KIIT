import express from 'express';
import multer from 'multer';

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middlerware/auth.middleware.js';

import { 
  getAllDustbins, 
  createDustbin, 
  getNearbyDustbins, 
  updateDustbinStatus, 
  updateDustbin,
  deleteDustbin 
} from '../controller/dustbin.controller.js';

const router = express.Router();

const storage = new CloudinaryStorage({

  cloudinary,

  params: {
    folder: 'dustbins',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    max_file_size: 5242880
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const handleUploadErrors = (err, req, res, next) => {
  if (!err) return next();
  
  if (err.name === 'TimeoutError' || err.code === 'TIMEOUT') {
    return res.status(408).json({ 
      status: 'error', 
      message: 'Upload timed out. Try a smaller image.' 
    });
  }
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: 'error', message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ status: 'error', message: `Upload error: ${err.message}` });
  }
  
  if (err.http_code) {
    return res.status(400).json({ status: 'error', message: `Cloudinary error: ${err.message}` });
  }
  
  res.status(500).json({ status: 'error', message: 'File upload failed' });
};

router.get('/', getAllDustbins);
router.post('/add', protect, upload.single('image'), handleUploadErrors, createDustbin);
router.post('/add-photo', protect, upload.single('photo'), handleUploadErrors, createDustbin);
router.post('/get-bin', getNearbyDustbins);
router.patch('/:id/status', protect, updateDustbinStatus);
router.patch('/:id', protect, updateDustbin);
router.delete('/:id', protect, deleteDustbin);

export default router;
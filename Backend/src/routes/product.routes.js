import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getMyListings, 
  getMyPurchases, 
  buyProduct, 
  deleteProduct,
  getNearbyProducts,
  getSellerContact 
} from '../controller/product.controller.js';
import { protect } from '../middlerware/auth.middleware.js';

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

// Public route (to see available products)
router.get('/', getProducts);

// Protected routes
router.use(protect);

router.post('/', upload.single('image'), createProduct);
router.get('/my-listings', getMyListings);
router.get('/my-purchases', getMyPurchases);
router.post('/nearby', getNearbyProducts);
router.patch('/:id/buy', buyProduct);
router.delete('/:id', deleteProduct);
router.get('/:id/contact', getSellerContact);

export default router;

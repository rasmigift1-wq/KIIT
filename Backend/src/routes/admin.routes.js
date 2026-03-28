import express from 'express';
import { protect, isAdmin } from '../middlerware/auth.middleware.js';
import {
  getDashboardStats,
  getPendingDustbins,
  approveDustbin,
  rejectDustbin,
  getAllListings,
  moderateListing,
  getAllCollectors
} from '../controller/admin.controller.js';

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Dustbin Moderation
router.get('/dustbins/pending', getPendingDustbins);
router.patch('/dustbins/:id/approve', approveDustbin);
router.patch('/dustbins/:id/reject', rejectDustbin);

// Marketplace Moderation
router.get('/marketplace/listings', getAllListings);
router.patch('/marketplace/:id/moderate', moderateListing);

// Truck/Collector Management
router.get('/trucks', getAllCollectors);

export default router;

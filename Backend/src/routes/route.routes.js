import express from 'express';
import { getOptimizedRoute } from '../controller/route.controller.js';

const router = express.Router();

/**
 * POST /api/route/optimize
 * Calculate optimized route for garbage truck
 * Body: { lat: number, lng: number }
 */
router.post('/optimize', getOptimizedRoute);

export default router;

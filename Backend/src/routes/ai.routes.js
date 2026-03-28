// backend/routes/ai.routes.js
import express from 'express';
import { getAQI, chatWithAI,calculateCarbonFootprint } from '../controller/ai.controller.js';
import { protect } from '../middlerware/auth.middleware.js';

const router = express.Router();

// Public or Protected depending on your preference
router.post('/aqi', getAQI);
router.post('/carbon-predict', protect, calculateCarbonFootprint);
router.post('/chat', protect, chatWithAI);

export default router;
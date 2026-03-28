import express from 'express';
import { getForecast } from '../controller/weather.controller.js';

const router = express.Router();

router.get('/forecast', getForecast);

export default router;

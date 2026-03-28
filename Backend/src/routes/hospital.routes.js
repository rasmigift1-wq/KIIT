// hospital.routes.js
import express from 'express';
import { getAllRegionHospitals, getNearbyRadiusHospitals } from '../controller/hospital.controller.js';

const router = express.Router();

router.get('/all', getAllRegionHospitals);
router.get('/nearby', getNearbyRadiusHospitals);

export default router;
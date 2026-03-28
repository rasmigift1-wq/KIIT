import express from 'express';
import { signup, login, logout } from '../controller/auth.controller.js';
import {checkAuth} from '../middlerware/checkauth.js';

const router = express.Router();

// ✅ Public Routes (no authentication required)
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/checkAuth',checkAuth);

export default router;
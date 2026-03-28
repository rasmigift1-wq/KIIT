import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookies from 'cookie-parser';
import cors from 'cors';
import cron from 'node-cron';
import Dustbin from './models/dustbin.model.js';
import { v2 as cloudinary } from 'cloudinary';
import dustbinRoutes from './routes/dustbin.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.route.js';
import aiRoutes from './routes/ai.routes.js';
import hospitalRoute from './routes/hospital.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import productRoutes from './routes/product.routes.js';
import routeRoutes from './routes/route.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','http://localhost:5174','http://localhost:8080','http://localhost:5002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookies());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (req.path.includes('/dustbins/add') || req.path.includes('/ai/segregate')) {
    const uploadTimeout = 300000;
    req.setTimeout(uploadTimeout);
    res.setTimeout(uploadTimeout);
    req.socket.setTimeout(uploadTimeout);
  } else {
    req.setTimeout(30000);
    res.setTimeout(30000);
  }
  next();
});

app.get('/',(req,res)=>{
  res.send('Welcome to the Waste Management System API');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dustbins', dustbinRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/hospital', hospitalRoute);
app.use('/api/weather', weatherRoutes);
app.use('/api/products', productRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

app.use((err, req, res, next) => {
  console.error(' Server Error:', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    // --- AUTO EXPIRY CRON JOB ---
    cron.schedule('0 * * * *', async () => {
      console.log('🧹 Running auto-expiry cron job for pending dustbins...');
      try {
        const result = await Dustbin.deleteMany({
          verificationStatus: 'pending',
          expiresAt: { $lt: new Date() }
        });
        if (result.deletedCount > 0) {
          console.log(`✅ Removed ${result.deletedCount} expired pending dustbins.`);
        }
      } catch (error) {
        console.error('❌ Cron Job Error:', error);
      }
    });

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Database: ${process.env.MONGO_URI}`);
    });
    
    server.setTimeout(300000);
    
    server.on('clientError', (err, socket) => {
      console.error('Client Error:', err.code);
      if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
      }
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });
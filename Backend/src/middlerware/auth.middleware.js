import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// ✅ Protect Routes - JWT Verification Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Extract token from cookies (either standard or admin)
    token = req.cookies.token || req.cookies.atoken;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'You are not logged in. Please log in to access this resource.' 
      });
    }
    console.log('🔐 Token found:', token);

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4️⃣ Attach user to request and proceed
    req.user = currentUser;
    next();

  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Your token has expired. Please log in again.' 
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Invalid token. Please log in again.' 
      });
    }
    
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ 
      status: 'fail', 
      message: 'Authentication failed. Please log in.' 
    });
  }
};

// ✅ Admin Only Middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'fail',
      message: 'Access denied. Admin role required.'
    });
  }
};
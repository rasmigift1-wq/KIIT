import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
export const checkAuth = async (req, res) => {
  try{
    let token = req.cookies.token || req.cookies.atoken;
    console.log('🔍 Checking authentication with token:');
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
        else{
          return res.status(200).json({
            status: 'success',
            message: 'User is authenticated',
            data: { user: currentUser }
          });
        }
  }catch (error) {
    console.log(error)
  }
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

import User from './src/models/user.model.js';

async function promoteFirstUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne().sort({ createdAt: 1 });
    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`✅ User ${user.email} promoted to admin!`);
    } else {
      console.log('❌ No users found.');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

promoteFirstUser();

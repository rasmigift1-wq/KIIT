
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'Backend', '.env') });

import Dustbin from './Backend/src/models/dustbin.model.js';
import User from './Backend/src/models/user.model.js';

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const usersCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const collectorCount = await User.countDocuments({ role: 'collector' });
    const userRoleCount = await User.countDocuments({ role: 'user' });
    const noRoleCount = await User.countDocuments({ role: { $exists: false } });

    const binsCount = await Dustbin.countDocuments();
    const verifiedBins = await Dustbin.countDocuments({ isVerified: true });
    
    console.log('--- USER STATS ---');
    console.log(`Total Users: ${usersCount}`);
    console.log(`Admins: ${adminCount}`);
    console.log(`Collectors: ${collectorCount}`);
    console.log(`Users (role='user'): ${userRoleCount}`);
    console.log(`No Role Defined: ${noRoleCount}`);

    console.log('\n--- DUSTBIN STATS ---');
    console.log(`Total Dustbins: ${binsCount}`);
    console.log(`Verified Dustbins: ${verifiedBins}`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();

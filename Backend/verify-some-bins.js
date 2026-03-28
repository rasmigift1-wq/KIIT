
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

import Dustbin from './src/models/dustbin.model.js';

async function verifyDustbins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Verify some dustbins that are currently Full or Mid
    const result = await Dustbin.updateMany(
      { status: { $in: ['full', 'mid'] } },
      { $set: { isVerified: true, verificationStatus: 'approved' } }
    );
    
    console.log(`✅ Verified ${result.modifiedCount} dustbins.`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verifyDustbins();

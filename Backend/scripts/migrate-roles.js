
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

import User from './src/models/user.model.js';

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Set role: 'user' for all users that don't have a role
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );
    
    console.log(`✅ Migrated ${result.modifiedCount} users to 'user' role.`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

migrateRoles();

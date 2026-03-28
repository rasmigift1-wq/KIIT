
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import User from '../src/models/user.model.js';

async function createAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node scripts/create-admin.js <email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ User ${email} promoted to admin!`);
    } else {
      console.log(`❌ User ${email} not found.`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

createAdmin();

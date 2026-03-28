import mongoose from 'mongoose';

const dustbinSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"], 
    trim: true 
  },
  lat: { 
    type: Number, 
    required: [true, "Latitude is required"] 
  },
  lng: { 
    type: Number, 
    required: [true, "Longitude is required"] 
  },
  status: { 
    type: String, 
    required: true,
    enum: {
      values: ['empty', 'mid', 'full'],
      message: '{VALUE} is not a valid status'
    },
    default: 'empty' // New bins start as empty by default
  },
  imageUrl: { 
    type: String, 
    default:"https://duytan.com/Data/Sites/1/Product/5907/thung-rac-nap-kin-90-xanhla.png"
  },
  reportedBy: { 
    type: String, 
    default: "Anonymous" 
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  capturedAt: {
    type: Date
  },
  capturedLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 1
  },
  isAIDetectedValid: {
    type: Boolean
  },
  exifValid: {
    type: Boolean
  },
  expiresAt: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Automatically adds updatedAt for tracking status changes
});

export default mongoose.model('Dustbin', dustbinSchema);
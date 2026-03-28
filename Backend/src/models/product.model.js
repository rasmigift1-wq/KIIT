import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Plastic', 'Metal', 'Glass', 'Paper', 'Others']
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  image: { type: String },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['Available', 'Sold'], 
    default: 'Available' 
  },
  condition: { 
    type: String, 
    enum: ['New', 'Used', 'Refurbished'], 
    default: 'Used' 
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

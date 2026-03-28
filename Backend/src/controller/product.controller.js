import Product from '../models/product.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, condition, lat, lng } = req.body;
    
    // Robust image URL extraction
    const image = req.file ? (req.file.path || req.file.url || req.file.secure_url) : null;
    
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      lat: Number(lat),
      lng: Number(lng),
      image,
      condition,
      seller: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: newProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'Available' }).populate('seller', 'name email mobile');
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMyPurchases = async (req, res) => {
  try {
    const products = await Product.find({ buyer: req.user._id });
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const buyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (product.status === 'Sold') {
      return res.status(400).json({
        status: 'error',
        message: 'Product is already sold'
      });
    }

    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot buy your own product'
      });
    }

    // Update only the status and buyer fields, preserving lat and lng
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Sold',
        buyer: req.user._id
      },
      { 
        new: true, 
        runValidators: false // Skip validation for this update since we're not changing required fields
      }
    ).populate('seller', 'name email mobile');

    res.status(200).json({
      status: 'success',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Buy Product Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
      status: 'Available'
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found or cannot be deleted (already sold)'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getNearbyProducts = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.body; // Default radius 5km
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude and Longitude are required'
      });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);
    const range = radius / 111; // Rough conversion for 1 degree ≈ 111km

    const products = await Product.find({
      status: 'Available',
      lat: { $gte: userLat - range, $lte: userLat + range },
      lng: { $gte: userLng - range, $lte: userLng + range }
    }).populate('seller', 'name email mobile');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getSellerContact = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email mobile');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (product.status === 'Sold') {
      return res.status(400).json({
        status: 'error',
        message: 'Product is already sold'
      });
    }

    if (product.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot view your own contact details'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        seller: product.seller,
        product: {
          name: product.name,
          price: product.price,
          description: product.description
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

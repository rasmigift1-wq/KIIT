import Dustbin from '../models/dustbin.model.js';
import exifr from 'exifr';
import axios from 'axios';

export const getAllDustbins = async (req, res) => {
  try {
    const { includeRejected } = req.query;
    const query = includeRejected === 'true' ? {} : { verificationStatus: { $ne: 'rejected' } };
    const bins = await Dustbin.find(query).sort({ createdAt: -1 });

    console.log('✅ Found', bins.length, 'dustbins');

    res.status(200).json(bins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDustbin = async (req, res) => {
  try {
    const { name, lat, lng, reportedBy, status, capturedAt, capturedLocation } = req.body;
    let parsedLocation = capturedLocation;
    
    if (typeof capturedLocation === 'string') {
      try {
        parsedLocation = JSON.parse(capturedLocation);
      } catch (e) {
        console.error("Error parsing capturedLocation:", e);
      }
    }

    console.log('📋 Request body:', { name, lat, lng, reportedBy, status, capturedAt, parsedLocation });
    
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Photo is mandatory! Please send the file with field name "image" or "photo"' 
      });
    }

    if (!name || !lat || !lng) {
      return res.status(400).json({ status: 'error', message: 'Name, latitude, and longitude are required' });
    }

    const imageUrl = req.file.path || req.file.url || req.file.secure_url || req.file.filename;
    
    // --- 1. EXIF VALIDATION ---
    let exifValid = false;
    try {
      // Fetch metadata using exifr (exifr can handle URL or Buffer)
      const metadata = await exifr.parse(imageUrl);
      console.log('📸 EXIF Metadata:', metadata);

      if (metadata) {
        const exifDate = metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate;
        const exifLat = metadata.latitude;
        const exifLng = metadata.longitude;

        const timeMatches = !capturedAt || !exifDate || Math.abs(new Date(capturedAt) - new Date(exifDate)) < 120000; // ± 2 min
        const locationMatches = !parsedLocation || !exifLat || (
          Math.abs(parsedLocation.lat - exifLat) < 0.001 && 
          Math.abs(parsedLocation.lng - exifLng) < 0.001
        );

        // Requirement says: "if mismatch: exifValid = false. Else: exifValid = true."
        // If no GPS in EXIF, we still check timestamp if available. 
        // If both missing, we might mark as false or true depending on strictness.
        // User said: "GPS exists (if available)".
        exifValid = timeMatches && locationMatches;
      } else {
        // No EXIF data found, mark as false for security
        exifValid = false;
      }
    } catch (exifErr) {
      console.error("EXIF Extraction Error:", exifErr);
      exifValid = false;
    }

    // --- 2. AI FAKE DETECTION ---
    let aiScore = 0;
    let isAIDetectedValid = false;
    try {
      const aiResponse = await axios.post('http://localhost:8000/verify-dustbin', {
        image: imageUrl
      });
      
      if (aiResponse.data) {
        aiScore = aiResponse.data.confidence || 0;
        isAIDetectedValid = aiResponse.data.isDustbin || false;
      }
    } catch (aiErr) {
      console.error("AI Model Service Error:", aiErr.message);
      // Fallback or handle error
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newBin = await Dustbin.create({
      name: name.trim(),
      lat: Number(lat),
      lng: Number(lng),
      status: status || 'empty',
      reportedBy: reportedBy?.trim() || 'Anonymous',
      imageUrl,
      isVerified: false,
      verificationStatus: 'pending',
      capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
      capturedLocation: parsedLocation || { lat: Number(lat), lng: Number(lng) },
      aiScore,
      isAIDetectedValid,
      exifValid,
      expiresAt
    });

    res.status(201).json({ 
      status: 'success', 
      message: 'Dustbin report submitted for verification!', 
      data: newBin,
      verification_preliminary: {
        exifValid,
        isAIDetectedValid,
        aiScore
      }
    });
  } catch (error) {
    console.error("Create Dustbin Error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: 'Invalid data provided', details: error.message });
    }
    res.status(500).json({ status: 'error', message: 'Server error - please try again' });
  }
};

export const getNearbyDustbins = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Coordinates required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const range = 0.05; // ~5km range for better coverage

    const bins = await Dustbin.find({
      lat: { $gte: userLat - range, $lte: userLat + range },
      lng: { $gte: userLng - range, $lte: userLng + range },
      verificationStatus: { $ne: 'rejected' }
    });
    
    res.status(200).json(bins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDustbinStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['empty', 'mid', 'full'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updatedBin = await Dustbin.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!updatedBin) {
      return res.status(404).json({ status: 'error', message: 'Dustbin not found' });
    }

    res.status(200).json({ 
      status: 'success', 
      message: `Status updated to ${status}`, 
      data: updatedBin 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateDustbin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const validStatuses = ['empty', 'mid', 'full'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (status) updateData.status = status;

    const updatedBin = await Dustbin.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedBin) {
      return res.status(404).json({ status: 'error', message: 'Dustbin not found' });
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'Dustbin updated successfully', 
      data: updatedBin 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteDustbin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dustbin = await Dustbin.findById(id);
    if (!dustbin) {
      return res.status(404).json({ status: 'error', message: 'Dustbin not found' });
    }

    await Dustbin.findByIdAndDelete(id);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Dustbin deleted successfully!' 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error - please try again' });
  }
};
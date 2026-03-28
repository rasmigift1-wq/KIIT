import Dustbin from '../models/dustbin.model.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';

// --- DASHBOARD STATS ---
export const getDashboardStats = async (req, res) => {
  try {
    const totalDustbins = await Dustbin.countDocuments();
    const verifiedDustbins = await Dustbin.countDocuments({ isVerified: true });
    const pendingRequests = await Dustbin.countDocuments({ verificationStatus: 'pending' });
    const rejectedRequests = await Dustbin.countDocuments({ verificationStatus: 'rejected' });
    const totalUsers = await User.countDocuments();
    const activeTrucks = await User.countDocuments({ role: 'collector' });

    // Fill level stats
    const emptyDustbins = await Dustbin.countDocuments({ status: 'empty' });
    const midDustbins = await Dustbin.countDocuments({ status: 'mid' });
    const fullDustbins = await Dustbin.countDocuments({ status: 'full' });

    // Mocking trend data for charts
    const dailySubmissions = [
      { day: 'Mon', count: 12 },
      { day: 'Tue', count: 19 },
      { day: 'Wed', count: 15 },
      { day: 'Thu', count: 22 },
      { day: 'Fri', count: 30 },
      { day: 'Sat', count: 25 },
      { day: 'Sun', count: 18 }
    ];

    const approvalRates = [
      { name: 'Approved', value: verifiedDustbins },
      { name: 'Rejected', value: rejectedRequests },
      { name: 'Pending', value: pendingRequests }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalDustbins,
          verifiedDustbins,
          pendingRequests,
          rejectedRequests,
          totalUsers,
          activeTrucks,
          emptyDustbins,
          midDustbins,
          fullDustbins
        },
        charts: {
          dailySubmissions,
          approvalRates
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- DUSTBIN MANAGEMENT ---
export const getPendingDustbins = async (req, res) => {
  try {
    const pending = await Dustbin.find({ verificationStatus: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: pending });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const approveDustbin = async (req, res) => {
  try {
    const { id } = req.params;
    const dustbin = await Dustbin.findByIdAndUpdate(
      id,
      { isVerified: true, verificationStatus: 'approved' },
      { new: true }
    );
    if (!dustbin) return res.status(404).json({ status: 'error', message: 'Dustbin not found' });
    res.status(200).json({ status: 'success', message: 'Dustbin approved successfully', data: dustbin });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const rejectDustbin = async (req, res) => {
  try {
    const { id } = req.params;
    const dustbin = await Dustbin.findByIdAndUpdate(
      id,
      { isVerified: false, verificationStatus: 'rejected' },
      { new: true }
    );
    if (!dustbin) return res.status(404).json({ status: 'error', message: 'Dustbin not found' });
    res.status(200).json({ status: 'success', message: 'Dustbin rejected successfully', data: dustbin });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- MARKETPLACE MANAGEMENT ---
export const getAllListings = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const moderateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve', 'reject', 'delete'

    if (action === 'delete') {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ status: 'success', message: 'Listing deleted' });
    }

    const verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    const isVerified = action === 'approve';

    const product = await Product.findByIdAndUpdate(
      id,
      { isVerified, verificationStatus },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ status: 'error', message: 'Listing not found' });
    res.status(200).json({ status: 'success', message: `Listing ${action}d successfully`, data: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- COLLECTOR/TRUCK MANAGEMENT ---
export const getAllCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ role: 'collector' }).select('-password');
    res.status(200).json({ status: 'success', data: collectors });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

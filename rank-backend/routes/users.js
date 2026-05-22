const express = require('express');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// POST /api/users/sync
// Sync user profile from frontend and return current credits
router.post('/sync', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    
    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required' });
    }

    // Upsert: create if not found, update name/email if found
    let user = await User.findOneAndUpdate(
      { googleId },
      { $setOnInsert: { credits: 100, lastCreditReset: new Date(), isPremium: false }, $set: { email, name } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Check daily reset
    await user.checkDailyReset();

    res.json({
      googleId: user.googleId,
      credits: user.credits,
      isPremium: user.isPremium,
      lastCreditReset: user.lastCreditReset
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/deduct
// Deduct 20 credits for a prediction
router.post('/deduct', async (req, res) => {
  try {
    const { googleId } = req.body;
    
    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required' });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Always check reset first
    await user.checkDailyReset();

    // If premium, don't deduct
    if (user.isPremium) {
      return res.json({
        success: true,
        credits: user.credits,
        isPremium: true
      });
    }

    // Check balance
    if (user.credits < 20) {
      return res.status(403).json({ 
        error: 'Insufficient credits',
        credits: user.credits
      });
    }

    // Deduct
    user.credits -= 20;
    await user.save();

    res.json({
      success: true,
      credits: user.credits,
      isPremium: user.isPremium
    });

  } catch (error) {
    console.error('Error deducting credits:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

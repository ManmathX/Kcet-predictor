const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
// Creates a Razorpay order for KCET Pro Pass (₹99)
router.post('/create-order', async (req, res) => {
  try {
    const { googleId } = req.body;

    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required' });
    }

    // Check if user already has premium
    const user = await User.findOne({ googleId });
    if (user && user.isPremium) {
      return res.status(400).json({ error: 'User is already a premium member' });
    }

    const options = {
      amount: 9900, // ₹99 in paise
      currency: 'INR',
      receipt: `pro_${googleId.slice(0, 10)}_${Date.now().toString(36)}`,
      notes: {
        googleId,
        plan: 'KCET Pro Pass',
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
// Verifies Razorpay payment signature and upgrades user to premium
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, googleId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !googleId) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Upgrade user to premium
    const user = await User.findOneAndUpdate(
      { googleId },
      {
        $set: {
          isPremium: true,
          premiumActivatedAt: new Date(),
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ User ${googleId} upgraded to Premium (Payment: ${razorpay_payment_id})`);

    res.json({
      success: true,
      isPremium: true,
      credits: user.credits,
      message: 'Payment verified! You are now a KCET Pro Pass member.',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;

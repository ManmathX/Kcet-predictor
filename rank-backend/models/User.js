const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  credits: { type: Number, default: 100 },
  lastCreditReset: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumActivatedAt: { type: Date, default: null },
  paymentId: { type: String, default: null },
  orderId: { type: String, default: null },
}, { timestamps: true });

// Middleware to check and reset credits daily before saving or finding
userSchema.methods.checkDailyReset = async function() {
  const now = new Date();
  const lastReset = this.lastCreditReset;
  
  // Calculate difference in hours
  const diffTime = Math.abs(now - lastReset);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); 
  
  if (diffHours >= 24) {
    this.credits = 100;
    this.lastCreditReset = now;
    await this.save();
  }
};

module.exports = mongoose.model('User', userSchema);

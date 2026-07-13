const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashedPassword: { type: String, required: true },
  hashedOTP:      { type: String, required: true },
  otpExpiry:      { type: Date,   required: true },
  otpAttempts:    { type: Number, default: 0 },
  otpResendCount: { type: Number, default: 0 },
  lockedUntil:    { type: Date,   default: null },
  createdAt:      { type: Date,   default: Date.now }
});


// TTL index — MongoDB auto deletes unverified records after 24 hours
otpVerificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
);

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
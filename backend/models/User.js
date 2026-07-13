const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label:     { type: String, default: 'Home' },
  line1:     { type: String, required: true },
  line2:     { type: String },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  zip:       { type: String, required: true },
  country:   { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  img:       { type: String },
  qty:       { type: Number, default: 1, min: 1 },
  size:      { type: String },
}, { _id: true });

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name:      String,
  price:     Number,
  img:       String,
  qty:       Number,
  size:      String,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'system' }, // 'system' or admin name
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId:   { type: String },
  items:     [orderItemSchema],
  total:     { type: Number },
  status:    {
    type:    String,
    enum:    ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type:    String,
    enum:    ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  statusHistory: [statusHistorySchema],
  address:   addressSchema,
  paymentMethod: { type: String, default: 'Online' },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:            { type: String,  required: true },
  email:           { type: String,  required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String },
  phone:           { type: String },
  authProvider:    { type: String,  enum: ['local', 'google', 'github'], default: 'local' },
  role:            { type: String,  enum: ['user', 'admin'], default: 'user' },
  providerId:      { type: String },
  avatar:          { type: String },
  loginAttempts:   { type: Number,  default: 0 },
  lockUntil:       { type: Date },
  isEmailVerified: { type: Boolean, default: false },

  // E-commerce fields
  cart:      [cartItemSchema],
  wishlist:  [{ type: String }],      // array of productIds
  addresses: [addressSchema],
  orders:    [orderSchema],

  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);
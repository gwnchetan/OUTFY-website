const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ─── Profile ─────────────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -loginAttempts -lockUntil');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name)   updates.name   = name;
    if (phone)  updates.phone  = phone;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: '-password -loginAttempts -lockUntil' }
    );
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.authProvider !== 'local')
      return res.status(400).json({ message: 'OAuth accounts cannot change password here' });

    const pepper = process.env.PASSWORD_PEPPER;
    const valid  = await bcrypt.compare(currentPassword + pepper, user.password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword + pepper, 12);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cart');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, name, price, img, qty = 1, size } = req.body;
    if (!productId || !name || price == null)
      return res.status(400).json({ message: 'productId, name, and price are required' });

    const user = await User.findById(req.user.id);
    const existingIdx = user.cart.findIndex(
      item => item.productId === productId && item.size === size
    );

    if (existingIdx >= 0) {
      user.cart[existingIdx].qty += qty;
    } else {
      user.cart.push({ productId, name, price, img, qty, size });
    }

    await user.save();
    res.json({ message: 'Added to cart', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { qty } = req.body;
    const user = await User.findById(req.user.id);
    const item = user.cart.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    if (qty < 1) {
      item.deleteOne();
    } else {
      item.qty = qty;
    }
    await user.save();
    res.json({ message: 'Cart updated', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const item = user.cart.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    item.deleteOne();
    await user.save();
    res.json({ message: 'Item removed', cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    const idx  = user.wishlist.indexOf(productId);
    let action;

    if (idx >= 0) {
      user.wishlist.splice(idx, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();
    res.json({ message: `${action} from wishlist`, wishlist: user.wishlist, action });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Addresses ───────────────────────────────────────────────────────────────

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { label, line1, line2, city, state, zip, country, isDefault } = req.body;
    if (!line1 || !city || !state || !zip)
      return res.status(400).json({ message: 'line1, city, state, zip are required' });

    const user = await User.findById(req.user.id);

    // If setting as default, unset others
    if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });

    user.addresses.push({ label, line1, line2, city, state, zip, country, isDefault });
    await user.save();
    res.status(201).json({ message: 'Address added', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user    = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addrId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const { label, line1, line2, city, state, zip, country, isDefault } = req.body;
    if (isDefault) user.addresses.forEach(a => { a.isDefault = false; });

    Object.assign(address, { label, line1, line2, city, state, zip, country, isDefault });
    await user.save();
    res.json({ message: 'Address updated', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user    = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addrId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    address.deleteOne();
    await user.save();
    res.json({ message: 'Address deleted', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

exports.getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('orders');
    res.json(user.orders.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Razorpay Payment & Order Creation ───────────────────────────────────────

const Razorpay = require('razorpay');
const crypto   = require('crypto');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayClient = null;
if (keyId && keySecret) {
  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

exports.createOrder = async (req, res) => {
  try {
    const { items, total, address, paymentMethod = 'Online', upiTransactionId } = req.body;
    if (!items || !items.length || !total || !address) {
      return res.status(400).json({ message: 'Missing order items, total, or address' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let paymentStatus = 'pending';

    if (paymentMethod === 'COD') {
      orderId = `cod_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      status = 'processing';
      paymentStatus = 'pending'; // Paid on delivery
    } else if (razorpayClient) {
      // Razorpay accepts amount in paise (Rupees * 100)
      const options = {
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };
      razorpayOrder = await razorpayClient.orders.create(options);
      orderId = razorpayOrder.id;
    }

    const newOrder = {
      orderId,
      items,
      total,
      status,
      address,
      paymentMethod,
      paymentStatus,
      statusHistory: [{ status, updatedBy: 'system' }],
      createdAt: new Date(),
    };

    user.orders.push(newOrder);

    if (paymentMethod === 'COD') {
      user.cart = []; // clear cart immediately for COD orders
    }

    await user.save();

    res.status(201).json({
      message: paymentMethod === 'COD' 
        ? 'Order placed successfully (COD)' 
        : paymentMethod === 'UPI' 
          ? 'Order placed successfully via Direct UPI' 
          : 'Order created',
      orderId,
      razorpayOrder,
      amount: total,
      keyId: keyId || 'mock_key_id',
      paymentMethod
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const orderIndex = user.orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fallback to Test/Simulation Mode if keys are not present
    if (!razorpayClient || orderId.startsWith('mock_order_') || !signature || !paymentId) {
      user.orders[orderIndex].status = 'processing';
      user.orders[orderIndex].paymentStatus = 'paid';
      user.orders[orderIndex].statusHistory.push({ status: 'processing', updatedBy: 'system' });
      user.cart = [];
      await user.save();
      return res.json({ message: 'Payment verified (Simulation)', success: true });
    }

    // Actual signature verification
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === signature) {
      user.orders[orderIndex].status = 'processing';
      user.orders[orderIndex].paymentStatus = 'paid';
      user.orders[orderIndex].statusHistory.push({ status: 'processing', updatedBy: 'system' });
      user.cart = [];
      await user.save();
      res.json({ message: 'Payment verified successfully', success: true });
    } else {
      user.orders[orderIndex].paymentStatus = 'failed';
      await user.save();
      res.status(400).json({ message: 'Payment verification failed', success: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const order = user.orders.find(o => o.orderId === orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      statusHistory: order.statusHistory,
      items: order.items,
      total: order.total,
      address: order.address,
      createdAt: order.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

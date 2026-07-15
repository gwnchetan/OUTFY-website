const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type:     String,
    required: true,
    trim:     true,
  },
  slug: {
    type:      String,
    unique:    true,
    sparse:    true,   // allows multiple null values
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type:     String,
    required: true,
    enum:     ['New Arrival', 'Dresses', 'Outerwear', 'Knitwear', 'Shoes', 'Accessories'],
    index:    true,
  },
  price: {
    type:     Number,
    required: true,
    min:      0,
  },
  comparePrice: {
    type:    Number,   // Original price before discount
    default: null,
  },
  images: {
    type:    [String],
    default: [],
  },
  badge: {
    type: String,
    enum: ['', 'New', 'Sale', 'Hot', 'Limited'],
    default: '',
  },
  sizes: {
    type:    [String],
    default: ['XS', 'S', 'M', 'L', 'XL'],
  },
  colors: {
    type:    [String],
    default: [],
  },
  stock: {
    type:    Number,
    default: 0,
    min:     0,
  },
  isActive: {
    type:    Boolean,
    default: true,
    index:   true,
  },
  isFeatured: {
    type:    Boolean,
    default: false,
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 },
  },
  tags: {
    type:    [String],
    default: [],
  },
}, {
  timestamps: true,   // adds createdAt / updatedAt
});

// Auto-generate slug from name (pre-validate fires for save() and create())
productSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

// Target the exact filters and sorts used by the public catalogue. These are
// built by MongoDB automatically when the application connects to the database.
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, 'rating.count': -1 });

// Full-text search avoids collection-wide regular-expression scans as a
// catalogue grows. Keep this existing index shape so deployed databases do not
// need a disruptive text-index migration.
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);

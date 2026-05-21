import mongoose from 'mongoose';

const marketplaceItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['books', 'electronics', 'furniture', 'clothing', 'sports', 'other'],
    required: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image_url: {
    type: String,
    default: null
  },
  seller_id: {
    type: String,
    required: true
  },
  seller_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'marketplace'
});

marketplaceItemSchema.methods.toJSON = function() {
  const item = this.toObject();
  delete item.__v;
  delete item._id;
  return item;
};

export default mongoose.model('MarketplaceItem', marketplaceItemSchema);

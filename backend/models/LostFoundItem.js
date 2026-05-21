import mongoose from 'mongoose';

const lostFoundItemSchema = new mongoose.Schema({
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
    enum: ['lost', 'found'],
    required: true
  },
  item_type: {
    type: String,
    enum: ['phone', 'wallet', 'id_card', 'books', 'others'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    default: null
  },
  posted_by_id: {
    type: String,
    required: true
  },
  posted_by_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'lost_found'
});

lostFoundItemSchema.methods.toJSON = function() {
  const item = this.toObject();
  delete item.__v;
  delete item._id;
  return item;
};

export default mongoose.model('LostFoundItem', lostFoundItemSchema);

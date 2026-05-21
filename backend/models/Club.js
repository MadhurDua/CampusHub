import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
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
    enum: ['technical', 'cultural', 'sports', 'social', 'academic'],
    required: true
  },
  image_url: {
    type: String,
    default: null
  },
  logo_url: {
    type: String,
    default: null
  },
  mission: {
    type: String,
    default: ''
  },
  contact_email: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requested_by: {
    type: String,
    default: null
  },
  approved_by: {
    type: String,
    default: null
  },
  approved_at: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    default: null
  },
  leader_ids: [{
    type: String
  }],
  member_ids: [{
    type: String
  }],
  member_count: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'clubs'
});

clubSchema.methods.toJSON = function() {
  const club = this.toObject();
  delete club.__v;
  delete club._id;
  return club;
};

export default mongoose.model('Club', clubSchema);

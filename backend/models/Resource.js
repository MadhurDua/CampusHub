import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
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
  course: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  file_url: {
    type: String,
    default: null
  },
  file_data: {
    type: String,
    default: null
  },
  file_name: {
    type: String,
    required: true
  },
  uploader_id: {
    type: String,
    required: true
  },
  uploader_name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  rating_count: {
    type: Number,
    default: 0
  },
  downloads: {
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
  collection: 'resources'
});

resourceSchema.methods.toJSON = function() {
  const resource = this.toObject();
  delete resource.__v;
  delete resource._id;
  return resource;
};

export default mongoose.model('Resource', resourceSchema);

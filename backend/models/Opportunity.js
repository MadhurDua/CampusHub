import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
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
  company: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'placement', 'competition', 'scholarship'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  apply_link: {
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
  posted_by_email: {
    type: String,
    default: null
  },
  posted_by_role: {
    type: String,
    default: null
  },
  college_email: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'closing_soon', 'closed'],
    default: 'open'
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
  collection: 'opportunities'
});

opportunitySchema.methods.toJSON = function() {
  const opportunity = this.toObject();
  delete opportunity.__v;
  delete opportunity._id;
  return opportunity;
};

export default mongoose.model('Opportunity', opportunitySchema);

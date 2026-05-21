import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'college_management', 'college_admin', 'main_admin'],
    default: 'student'
  },
  college_id: {
    type: String,
    default: null,
    comment: 'College identifier extracted from email domain (e.g., "stanford" from @stanford.edu)'
  },
  bio: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  joined_clubs: [{
    type: String
  }],
  saved_events: [{
    type: String
  }],
  saved_opportunities: [{
    type: String
  }],
  hashed_password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.hashed_password;
  delete user.__v;
  delete user._id;
  return user;
};

export default mongoose.model('User', userSchema);

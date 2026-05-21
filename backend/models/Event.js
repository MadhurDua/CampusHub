import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
    enum: ['technical', 'cultural', 'sports', 'academic', 'other'],
    required: true
  },
  image_url: {
    type: String,
    default: null
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  organizer_id: {
    type: String,
    required: true
  },
  organizer_type: {
    type: String,
    enum: ['user', 'club', 'college_management', 'college_admin', 'main_admin'],
    required: true
  },
  organizer_name: {
    type: String,
    required: true
  },
  organizer_email: {
    type: String,
    default: null
  },
  max_attendees: {
    type: Number,
    default: null
  },
  registered_users: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
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
  collection: 'events'
});

eventSchema.methods.toJSON = function() {
  const event = this.toObject();
  delete event.__v;
  delete event._id;
  // Add computed attendees_count
  event.attendees_count = event.registered_users ? event.registered_users.length : 0;
  return event;
};

export default mongoose.model('Event', eventSchema);

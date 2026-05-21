import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  club_id: {
    type: String,
    required: true
  },
  author_id: {
    type: String,
    required: true
  },
  author_name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  pinned: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'posts'
});

postSchema.methods.toJSON = function() {
  const post = this.toObject();
  delete post.__v;
  delete post._id;
  return post;
};

export default mongoose.model('Post', postSchema);

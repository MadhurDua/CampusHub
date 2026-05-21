import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Club from '../models/Club.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const validateClub = [
  body('name').trim().isLength({ min: 3 }).withMessage('Club name must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['technical', 'cultural', 'sports', 'social', 'academic']).withMessage('Invalid category')
];

const validatePost = [
  body('content').trim().isLength({ min: 1 }).withMessage('Post content required')
];

router.post('/', authenticateToken, validateClub, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    const clubData = {
      id: uuidv4(),
      ...req.body,
      leader_ids: [req.user.id],
      member_ids: [req.user.id],
      member_count: 1
    };

    const club = new Club(clubData);
    await club.save();

    await User.findOneAndUpdate(
      { id: req.user.id },
      { $addToSet: { joined_clubs: club.id } }
    );

    res.status(201).json(club.toJSON());
  } catch (error) {
    console.error('Create club error:', error);
    res.status(500).json({ detail: 'Failed to create club' });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    
    if (category) query.category = category;
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    const clubs = await Club.find(query).limit(100);
    res.json(clubs.map(club => club.toJSON()));
  } catch (error) {
    console.error('Get clubs error:', error);
    res.status(500).json({ detail: 'Failed to fetch clubs' });
  }
});

router.get('/:clubId', optionalAuth, async (req, res) => {
  try {
    const club = await Club.findOne({ id: req.params.clubId });
    if (!club) {
      return res.status(404).json({ detail: 'Club not found' });
    }

    res.json(club.toJSON());
  } catch (error) {
    console.error('Get club error:', error);
    res.status(500).json({ detail: 'Failed to fetch club' });
  }
});

router.post('/:clubId/join', authenticateToken, async (req, res) => {
  try {
    const club = await Club.findOne({ id: req.params.clubId });
    if (!club) {
      return res.status(404).json({ detail: 'Club not found' });
    }

    if (club.member_ids.includes(req.user.id)) {
      return res.status(400).json({ detail: 'Already a member' });
    }

    club.member_ids.push(req.user.id);
    club.member_count += 1;
    await club.save();

    await User.findOneAndUpdate(
      { id: req.user.id },
      { $addToSet: { joined_clubs: req.params.clubId } }
    );

    res.json({ message: 'Joined successfully' });
  } catch (error) {
    console.error('Join club error:', error);
    res.status(500).json({ detail: 'Failed to join club' });
  }
});

router.delete('/:clubId/join', authenticateToken, async (req, res) => {
  try {
    await Club.findOneAndUpdate(
      { id: req.params.clubId },
      { 
        $pull: { member_ids: req.user.id },
        $inc: { member_count: -1 }
      }
    );

    await User.findOneAndUpdate(
      { id: req.user.id },
      { $pull: { joined_clubs: req.params.clubId } }
    );

    res.json({ message: 'Left successfully' });
  } catch (error) {
    console.error('Leave club error:', error);
    res.status(500).json({ detail: 'Failed to leave club' });
  }
});

router.get('/:clubId/members', authenticateToken, async (req, res) => {
  try {
    const club = await Club.findOne({ id: req.params.clubId });
    if (!club) {
      return res.status(404).json({ detail: 'Club not found' });
    }

    if (!club.leader_ids || !club.leader_ids.includes(req.user.id)) {
      return res.status(403).json({ detail: 'Only club leaders can view members' });
    }

    const members = await User.find({ id: { $in: club.member_ids } })
      .select('id email full_name');

    res.json(members.map(member => member.toJSON()));
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ detail: 'Failed to fetch members' });
  }
});

router.delete('/:clubId/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const club = await Club.findOne({ id: req.params.clubId });
    if (!club) {
      return res.status(404).json({ detail: 'Club not found' });
    }

    if (!club.leader_ids || !club.leader_ids.includes(req.user.id)) {
      return res.status(403).json({ detail: 'Only club leaders can remove members' });
    }

    if (club.leader_ids.includes(req.params.memberId)) {
      return res.status(400).json({ detail: 'Cannot remove club leaders' });
    }

    await Club.findOneAndUpdate(
      { id: req.params.clubId },
      { 
        $pull: { member_ids: req.params.memberId },
        $inc: { member_count: -1 }
      }
    );

    await User.findOneAndUpdate(
      { id: req.params.memberId },
      { $pull: { joined_clubs: req.params.clubId } }
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ detail: 'Failed to remove member' });
  }
});

router.post('/:clubId/posts', authenticateToken, validatePost, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    const club = await Club.findOne({ id: req.params.clubId });
    if (!club) {
      return res.status(404).json({ detail: 'Club not found' });
    }

    if (!club.member_ids.includes(req.user.id)) {
      return res.status(403).json({ detail: 'Not a member of this club' });
    }

    const postData = {
      id: uuidv4(),
      club_id: req.params.clubId,
      author_id: req.user.id,
      author_name: req.user.full_name,
      content: req.body.content,
      pinned: false
    };

    const post = new Post(postData);
    await post.save();

    res.status(201).json(post.toJSON());
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ detail: 'Failed to create post' });
  }
});

router.get('/:clubId/posts', optionalAuth, async (req, res) => {
  try {
    const posts = await Post.find({ club_id: req.params.clubId })
      .sort({ created_at: -1 })
      .limit(100);
    
    res.json(posts.map(post => post.toJSON()));
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ detail: 'Failed to fetch posts' });
  }
});

router.patch('/:clubId/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ detail: 'Only faculty can approve clubs' });
    }

    const club = await Club.findOne({ id: req.params.clubId });
    if (!club) {
      return res.status(404).json({ detail: 'Club not found' });
    }

    const { status, approved_by, approved_at, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status' });
    }

    club.status = status;
    club.approved_by = approved_by;
    
    if (status === 'approved') {
      club.approved_at = approved_at || new Date();
    } else if (status === 'rejected') {
      club.rejection_reason = rejection_reason;
    }

    await club.save();

    res.json({ message: `Club ${status} successfully`, club: club.toJSON() });
  } catch (error) {
    console.error('Approve club error:', error);
    res.status(500).json({ detail: 'Failed to approve club' });
  }
});

export default router;

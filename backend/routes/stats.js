import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Club from '../models/Club.js';
import Resource from '../models/Resource.js';
import Opportunity from '../models/Opportunity.js';
import MarketplaceItem from '../models/MarketplaceItem.js';
import LostFoundItem from '../models/LostFoundItem.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Club.countDocuments(),
      Resource.countDocuments(),
      Opportunity.countDocuments({ status: 'open' }),
      MarketplaceItem.countDocuments({ status: 'available' }),
      LostFoundItem.countDocuments({ status: 'active' })
    ]);

    const [
      totalUsers,
      upcomingEvents,
      totalClubs,
      totalResources,
      openOpportunities,
      availableItems,
      activeLostFound
    ] = stats;

    // Get recent activity
    const recentEvents = await Event.find({ status: 'upcoming' })
      .sort({ created_at: -1 })
      .limit(3)
      .select('title date location organizer_name');

    const popularClubs = await Club.find()
      .sort({ member_count: -1 })
      .limit(3)
      .select('name member_count category');

    const recentResources = await Resource.find()
      .sort({ created_at: -1 })
      .limit(3)
      .select('title uploader_name downloads rating');

    res.json({
      overview: {
        totalUsers,
        upcomingEvents,
        totalClubs,
        totalResources,
        openOpportunities,
        availableItems,
        activeLostFound
      },
      recent: {
        events: recentEvents,
        clubs: popularClubs,
        resources: recentResources
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ detail: 'Failed to fetch statistics' });
  }
});

// Get user-specific statistics
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const userStats = {
      joinedClubs: req.user.joined_clubs?.length || 0,
      savedEvents: req.user.saved_events?.length || 0,
      savedOpportunities: req.user.saved_opportunities?.length || 0
    };

    // Get user's created content
    const [createdEvents, uploadedResources, postedItems] = await Promise.all([
      Event.countDocuments({ organizer_id: userId }),
      Resource.countDocuments({ uploader_id: userId }),
      MarketplaceItem.countDocuments({ seller_id: userId })
    ]);

    userStats.createdEvents = createdEvents;
    userStats.uploadedResources = uploadedResources;
    userStats.postedItems = postedItems;

    res.json(userStats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ detail: 'Failed to fetch user statistics' });
  }
});

export default router;

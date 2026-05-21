import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Club from '../models/Club.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateEvent = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['technical', 'cultural', 'sports', 'academic', 'other']).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:MM)'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters')
];

// Create event
router.post('/', authenticateToken, validateEvent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    let organizerId = req.user.id;
    let organizerType = 'user';
    let organizerName = req.user.full_name;

    // If club_id is provided, validate user is a club leader
    if (req.body.club_id) {
      const club = await Club.findOne({ id: req.body.club_id });
      if (!club) {
        return res.status(404).json({ detail: 'Club not found' });
      }

      // Check if user is a club leader
      if (!club.leader_ids || !club.leader_ids.includes(req.user.id)) {
        return res.status(403).json({ detail: 'Only club leaders can create events for their clubs' });
      }

      organizerId = club.id;
      organizerType = 'club';
      organizerName = club.name;
    } else {
      // If no club_id, only college officials can create general events
      const allowedRoles = ['college_management', 'college_admin', 'main_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          detail: 'Only club leaders or college officials can create events' 
        });
      }
      // For officials, use their role as organizer type
      organizerType = req.user.role;
    }

    const eventData = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      image_url: req.body.image_url || null,
      max_attendees: req.body.max_attendees || null,
      organizer_id: organizerId,
      organizer_type: organizerType,
      organizer_name: organizerName,
      organizer_email: req.user.email,  // Add creator's email for tracking
      registered_users: [],
      attendees_count: 0
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json(event.toJSON());
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ detail: 'Failed to create event' });
  }
});

// Get events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;

    const events = await Event.find(query).sort({ date: 1 }).limit(100);
    res.json(events.map(event => event.toJSON()));
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ detail: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:eventId', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.eventId });
    if (!event) {
      return res.status(404).json({ detail: 'Event not found' });
    }

    res.json(event.toJSON());
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ detail: 'Failed to fetch event' });
  }
});

// Register for event
router.post('/:eventId/register', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.eventId });
    if (!event) {
      return res.status(404).json({ detail: 'Event not found' });
    }

    if (event.registered_users.includes(req.user.id)) {
      return res.status(400).json({ detail: 'Already registered' });
    }

    if (event.max_attendees && event.registered_users.length >= event.max_attendees) {
      return res.status(400).json({ detail: 'Event is full' });
    }

    event.registered_users.push(req.user.id);
    await event.save();

    // Update user's saved events
    await User.findOneAndUpdate(
      { id: req.user.id },
      { $addToSet: { saved_events: req.params.eventId } }
    );

    res.json({ message: 'Registered successfully' });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ detail: 'Failed to register for event' });
  }
});

// Unregister from event
router.delete('/:eventId/register', authenticateToken, async (req, res) => {
  try {
    await Event.findOneAndUpdate(
      { id: req.params.eventId },
      { $pull: { registered_users: req.user.id } }
    );

    await User.findOneAndUpdate(
      { id: req.user.id },
      { $pull: { saved_events: req.params.eventId } }
    );

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    console.error('Unregister event error:', error);
    res.status(500).json({ detail: 'Failed to unregister from event' });
  }
});

export default router;

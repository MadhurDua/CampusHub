import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import LostFoundItem from '../models/LostFoundItem.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateLostFoundItem = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['lost', 'found']).withMessage('Category must be either lost or found'),
  body('item_type').isIn(['phone', 'wallet', 'id_card', 'books', 'others']).withMessage('Invalid item type'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location required'),
  body('date').isISO8601().withMessage('Valid date required')
];

// Create lost/found item
router.post('/', authenticateToken, validateLostFoundItem, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    const itemData = {
      id: uuidv4(),
      ...req.body,
      posted_by_id: req.user.id,
      posted_by_name: req.user.full_name,
      status: 'active'
    };

    const item = new LostFoundItem(itemData);
    await item.save();

    res.status(201).json(item.toJSON());
  } catch (error) {
    console.error('Create lost/found item error:', error);
    res.status(500).json({ detail: 'Failed to create lost/found item' });
  }
});

// Get lost/found items
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status, item_type } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'active'; // Default to active items
    if (item_type) query.item_type = item_type;

    const items = await LostFoundItem.find(query)
      .sort({ created_at: -1 })
      .limit(100);
    
    // Add posted_by_email to each item
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const itemObj = item.toJSON();
      try {
        const poster = await User.findOne({ id: item.posted_by_id });
        itemObj.posted_by_email = poster?.email || null;
      } catch (error) {
        console.error('Error fetching poster email:', error);
        itemObj.posted_by_email = null;
      }
      return itemObj;
    }));
    
    res.json(enrichedItems);
  } catch (error) {
    console.error('Get lost/found items error:', error);
    res.status(500).json({ detail: 'Failed to fetch lost/found items' });
  }
});

// Get single lost/found item
router.get('/:itemId', optionalAuth, async (req, res) => {
  try {
    const item = await LostFoundItem.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    res.json(item.toJSON());
  } catch (error) {
    console.error('Get lost/found item error:', error);
    res.status(500).json({ detail: 'Failed to fetch lost/found item' });
  }
});

// Mark item as resolved
router.patch('/:itemId/resolve', authenticateToken, async (req, res) => {
  try {
    const item = await LostFoundItem.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    // Only the poster can mark as resolved
    if (item.posted_by_id !== req.user.id) {
      return res.status(403).json({ detail: 'Not authorized to resolve this item' });
    }

    item.status = 'resolved';
    await item.save();

    res.json({ message: 'Item marked as resolved', item: item.toJSON() });
  } catch (error) {
    console.error('Resolve item error:', error);
    res.status(500).json({ detail: 'Failed to resolve item' });
  }
});

// Delete lost/found item
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const item = await LostFoundItem.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    // Only the poster can delete the item
    if (item.posted_by_id !== req.user.id) {
      return res.status(403).json({ detail: 'Not authorized to delete this item' });
    }

    await LostFoundItem.deleteOne({ id: req.params.itemId });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete lost/found item error:', error);
    res.status(500).json({ detail: 'Failed to delete lost/found item' });
  }
});

export default router;

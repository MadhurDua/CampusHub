import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import MarketplaceItem from '../models/MarketplaceItem.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateMarketplaceItem = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['books', 'electronics', 'furniture', 'clothing', 'sports', 'other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Create marketplace item
router.post('/', authenticateToken, validateMarketplaceItem, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    const itemData = {
      id: uuidv4(),
      ...req.body,
      seller_id: req.user.id,
      seller_name: req.user.full_name,
      status: 'available'
    };

    const item = new MarketplaceItem(itemData);
    await item.save();

    res.status(201).json(item.toJSON());
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({ detail: 'Failed to create marketplace item' });
  }
});

// Get marketplace items
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'available'; // Default to available items

    const items = await MarketplaceItem.find(query)
      .sort({ created_at: -1 })
      .limit(100);
    
    // Add seller_email to each item
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const itemObj = item.toJSON();
      try {
        const seller = await User.findOne({ id: item.seller_id });
        itemObj.seller_email = seller?.email || null;
      } catch (error) {
        console.error('Error fetching seller email:', error);
        itemObj.seller_email = null;
      }
      return itemObj;
    }));
    
    res.json(enrichedItems);
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({ detail: 'Failed to fetch marketplace items' });
  }
});

// Get single marketplace item
router.get('/:itemId', optionalAuth, async (req, res) => {
  try {
    const item = await MarketplaceItem.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    res.json(item.toJSON());
  } catch (error) {
    console.error('Get marketplace item error:', error);
    res.status(500).json({ detail: 'Failed to fetch marketplace item' });
  }
});

// Update item status (mark as sold/reserved)
router.patch('/:itemId/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['available', 'sold', 'reserved'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status' });
    }

    const item = await MarketplaceItem.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    // Only the seller can update the status
    if (item.seller_id !== req.user.id) {
      return res.status(403).json({ detail: 'Not authorized to update this item' });
    }

    item.status = status;
    await item.save();

    res.json({ message: 'Status updated successfully', item: item.toJSON() });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ detail: 'Failed to update item status' });
  }
});

// Delete marketplace item
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const item = await MarketplaceItem.findOne({ id: req.params.itemId });
    if (!item) {
      return res.status(404).json({ detail: 'Item not found' });
    }

    // Only the seller can delete the item
    if (item.seller_id !== req.user.id) {
      return res.status(403).json({ detail: 'Not authorized to delete this item' });
    }

    await MarketplaceItem.deleteOne({ id: req.params.itemId });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    res.status(500).json({ detail: 'Failed to delete marketplace item' });
  }
});

export default router;

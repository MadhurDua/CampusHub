import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { requireRoleLevel } from '../middleware/roleHierarchy.js';

const router = express.Router();

// Validation middleware
const validateOpportunity = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('company').trim().isLength({ min: 2 }).withMessage('Company name required'),
  body('type').isIn(['internship', 'placement', 'competition', 'scholarship']).withMessage('Invalid type'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('eligibility').trim().isLength({ min: 5 }).withMessage('Eligibility criteria required'),
  body('deadline').isISO8601().withMessage('Valid deadline date required')
];

// Create opportunity (college_management or higher)
router.post('/', authenticateToken, requireRoleLevel('college_management'), validateOpportunity, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    const opportunityData = {
      id: uuidv4(),
      ...req.body,
      posted_by_id: req.user.id,
      posted_by_name: req.user.full_name,
      posted_by_email: req.user.email,
      posted_by_role: req.user.role,
      college_email: req.user.email,
      status: 'open'
    };

    const opportunity = new Opportunity(opportunityData);
    await opportunity.save();

    res.status(201).json(opportunity.toJSON());
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ detail: 'Failed to create opportunity' });
  }
});

// Get opportunities
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;

    const opportunities = await Opportunity.find(query)
      .sort({ deadline: 1 })
      .limit(100);
    
    res.json(opportunities.map(opp => opp.toJSON()));
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ detail: 'Failed to fetch opportunities' });
  }
});

// Get single opportunity
router.get('/:opportunityId', optionalAuth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ id: req.params.opportunityId });
    if (!opportunity) {
      return res.status(404).json({ detail: 'Opportunity not found' });
    }

    res.json(opportunity.toJSON());
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ detail: 'Failed to fetch opportunity' });
  }
});

// Save opportunity
router.post('/:opportunityId/save', authenticateToken, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({ id: req.params.opportunityId });
    if (!opportunity) {
      return res.status(404).json({ detail: 'Opportunity not found' });
    }

    await User.findOneAndUpdate(
      { id: req.user.id },
      { $addToSet: { saved_opportunities: req.params.opportunityId } }
    );

    res.json({ message: 'Saved successfully' });
  } catch (error) {
    console.error('Save opportunity error:', error);
    res.status(500).json({ detail: 'Failed to save opportunity' });
  }
});

// Unsave opportunity
router.delete('/:opportunityId/save', authenticateToken, async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { id: req.user.id },
      { $pull: { saved_opportunities: req.params.opportunityId } }
    );

    res.json({ message: 'Unsaved successfully' });
  } catch (error) {
    console.error('Unsave opportunity error:', error);
    res.status(500).json({ detail: 'Failed to unsave opportunity' });
  }
});

export default router;

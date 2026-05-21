import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateResource = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('course').trim().isLength({ min: 2 }).withMessage('Course required'),
  body('semester').trim().isLength({ min: 1 }).withMessage('Semester required'),
  body('subject').trim().isLength({ min: 2 }).withMessage('Subject required'),
  body('file_url').trim().notEmpty().withMessage('File URL required')
];

// Create resource
router.post('/', authenticateToken, validateResource, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array() });
    }

    // Extract file name from URL
    const fileUrl = req.body.file_url;
    const fileName = fileUrl.split('/').pop().split('?')[0] || 'document.pdf';
    const fileType = fileName.includes('.') ? fileName.split('.').pop() : 'pdf';

    const resourceData = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description || `${req.body.subject} notes for ${req.body.course}`,
      course: req.body.course,
      semester: req.body.semester,
      subject: req.body.subject,
      file_url: req.body.file_url,
      file_type: fileType,
      file_name: fileName,
      uploader_id: req.user.id,
      uploader_name: req.user.full_name,
      rating: 0.0,
      rating_count: 0,
      downloads: 0
    };

    const resource = new Resource(resourceData);
    await resource.save();

    // Add uploader email to response
    const responseData = resource.toJSON();
    responseData.uploader_email = req.user.email;

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ detail: 'Failed to create resource' });
  }
});

// Get resources
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { course, semester, subject } = req.query;
    const query = {};
    
    if (course) query.course = course;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;

    // Exclude file_data from the response for list view
    const resources = await Resource.find(query, { file_data: 0 })
      .sort({ created_at: -1 })
      .limit(100);
    
    // Add uploader email to each resource
    const enrichedResources = await Promise.all(resources.map(async (resource) => {
      const resourceObj = resource.toJSON();
      try {
        const uploader = await User.findOne({ id: resource.uploader_id });
        resourceObj.uploader_email = uploader?.email || null;
      } catch (error) {
        console.error('Error fetching uploader email:', error);
        resourceObj.uploader_email = null;
      }
      return resourceObj;
    }));
    
    res.json(enrichedResources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ detail: 'Failed to fetch resources' });
  }
});

// Download resource (increment count)
router.post('/:resourceId/download', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findOne({ id: req.params.resourceId });
    if (!resource) {
      return res.status(404).json({ detail: 'Resource not found' });
    }

    // Increment download count
    resource.downloads = (resource.downloads || 0) + 1;
    await resource.save();

    res.json({ message: 'Download tracked', downloads: resource.downloads });
  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({ detail: 'Failed to track download' });
  }
});

// Get single resource (with file data)
router.get('/:resourceId', optionalAuth, async (req, res) => {
  try {
    const resource = await Resource.findOne({ id: req.params.resourceId });
    if (!resource) {
      return res.status(404).json({ detail: 'Resource not found' });
    }

    res.json(resource.toJSON());
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ detail: 'Failed to fetch resource' });
  }
});

// Rate resource
router.post('/:resourceId/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ detail: 'Rating must be between 1 and 5' });
    }

    const resource = await Resource.findOne({ id: req.params.resourceId });
    if (!resource) {
      return res.status(404).json({ detail: 'Resource not found' });
    }

    // Simple rating calculation (in a real app, you'd track individual ratings)
    const newRatingCount = resource.rating_count + 1;
    const newRating = ((resource.rating * resource.rating_count) + rating) / newRatingCount;
    
    resource.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
    resource.rating_count = newRatingCount;
    await resource.save();

    res.json({ message: 'Rating submitted successfully', rating: resource.rating });
  } catch (error) {
    console.error('Rate resource error:', error);
    res.status(500).json({ detail: 'Failed to rate resource' });
  }
});

export default router;

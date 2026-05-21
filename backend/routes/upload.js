import express from 'express';
import multer from 'multer';
import { Dropbox } from 'dropbox';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Initialize Dropbox client - create a new instance for each request
const getDropboxClient = () => {
  return new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN
  });
};

/**
 * POST /api/upload
 * Upload a file to Dropbox
 * Requires: authentication, file in request body
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
    console.log('Folder path:', req.body.folderPath);

    if (!req.file) {
      console.error('❌ No file provided');
      return res.status(400).json({ detail: 'No file provided' });
    }

    let folderPath = req.body.folderPath || '';
    const fileName = req.file.originalname;
    
    // Ensure proper path formatting
    if (folderPath && !folderPath.startsWith('/')) {
      folderPath = '/' + folderPath;
    }
    if (folderPath && folderPath.endsWith('/')) {
      folderPath = folderPath.slice(0, -1);
    }
    
    const dropboxPath = folderPath ? `${folderPath}/${fileName}` : `/${fileName}`;

    console.log(`📍 Uploading to Dropbox path: ${dropboxPath}`);

    // Get Dropbox client instance
    const dropbox = getDropboxClient();

    // Upload file to Dropbox
    const response = await dropbox.filesUpload({
      path: dropboxPath,
      contents: req.file.buffer,
      autorename: true,
      mode: 'add'
    });

    console.log('✅ File uploaded successfully:', response.result.path_display);

    // Create a shared link for the file
    let sharedLink = null;
    try {
      const linkResponse = await dropbox.sharingCreateSharedLinkWithSettings({
        path: response.result.id,
        settings: {
          requested_visibility: 'public'
        }
      });
      sharedLink = linkResponse.result.url;
      console.log('🔗 Shared link created:', sharedLink);
    } catch (linkError) {
      console.log('Link error status:', linkError.status);
      // If link already exists, try to get it
      if (linkError.status === 409) {
        const existingLinks = await dropbox.sharingListSharedLinks({
          path: response.result.id
        });
        if (existingLinks.result.links.length > 0) {
          sharedLink = existingLinks.result.links[0].url;
          console.log('🔗 Using existing shared link:', sharedLink);
        }
      }
    }

    res.json({
      file_url: sharedLink || response.result.path_display,
      file_name: response.result.name,
      file_id: response.result.id,
      size: response.result.size
    });
  } catch (error) {
    console.error('❌ Dropbox upload error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({
      detail: error.message || 'File upload failed'
    });
  }
});

export default router;

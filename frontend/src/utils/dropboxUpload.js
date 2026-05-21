import { API } from './constants';
import axios from 'axios';

/**
 * Upload a file to Dropbox via the backend
 * @param {File} file - The file to upload
 * @param {string} folderPath - The folder path in Dropbox (e.g., '/resources', '/events')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToDropbox = async (file, folderPath = '/') => {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderPath', folderPath);

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.file_url;
  } catch (error) {
    console.error('Dropbox upload error:', error);
    throw error;
  }
};

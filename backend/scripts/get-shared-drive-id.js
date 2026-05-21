import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/google-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

async function getSharedDrives() {
  try {
    console.log('Fetching Shared Drives...\n');
    
    const response = await drive.drives.list({
      pageSize: 10,
      fields: 'drives(id, name, createdTime)'
    });

    if (response.data.drives && response.data.drives.length > 0) {
      console.log('Found Shared Drives:');
      response.data.drives.forEach((drive, index) => {
        console.log(`\n${index + 1}. ${drive.name}`);
        console.log(`   ID: ${drive.id}`);
        console.log(`   Created: ${drive.createdTime}`);
      });
      
      console.log('\n\nAdd this to your .env file:');
      console.log(`GOOGLE_SHARED_DRIVE_ID=${response.data.drives[0].id}`);
    } else {
      console.log('No Shared Drives found.');
      console.log('Please create a Shared Drive in Google Drive first.');
    }
  } catch (error) {
    console.error('Error fetching Shared Drives:', error.message);
    process.exit(1);
  }
}

getSharedDrives();

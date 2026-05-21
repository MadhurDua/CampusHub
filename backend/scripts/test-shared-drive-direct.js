import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/google-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

async function testDirectAccess() {
  try {
    const sharedDriveId = process.env.GOOGLE_SHARED_DRIVE_ID;
    
    if (!sharedDriveId) {
      console.log('❌ GOOGLE_SHARED_DRIVE_ID not set in .env');
      process.exit(1);
    }
    
    console.log(`Testing direct access to Shared Drive: ${sharedDriveId}\n`);
    
    // Try to get the Shared Drive directly
    const response = await drive.drives.get({
      driveId: sharedDriveId,
      fields: 'id, name, createdTime'
    });
    
    console.log('✅ SUCCESS! Service account can access the Shared Drive:');
    console.log(`   Name: ${response.data.name}`);
    console.log(`   ID: ${response.data.id}`);
    console.log(`   Created: ${response.data.createdTime}`);
    console.log('\n✅ Uploads should now work!');
    
  } catch (error) {
    console.error('❌ Cannot access Shared Drive');
    console.error(`Error: ${error.message}\n`);
    
    if (error.code === 404) {
      console.log('The Shared Drive ID is incorrect or the service account doesn\'t have access.');
      console.log('Please verify:');
      console.log('1. The Shared Drive ID is correct');
      console.log('2. The service account email is added to the Shared Drive');
      console.log('3. The service account has Editor permissions');
      console.log('4. Wait a few more minutes for permissions to propagate');
    } else if (error.code === 403) {
      console.log('The service account doesn\'t have permission to access this Shared Drive.');
      console.log('Please add the service account with Editor permissions.');
    }
    
    process.exit(1);
  }
}

testDirectAccess();

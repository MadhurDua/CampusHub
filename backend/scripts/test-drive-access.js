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

async function testDriveAccess() {
  try {
    console.log('Testing Google Drive access...\n');
    
    // Get service account email
    const authClient = await auth.getClient();
    const credentials = authClient.credentials;
    console.log('Service Account Email: campushub-drive-uploader@campushub-479311.iam.gserviceaccount.com\n');
    
    // Test 1: List regular drives
    console.log('Test 1: Listing regular My Drive files...');
    const myDriveResponse = await drive.files.list({
      spaces: 'drive',
      fields: 'files(id, name, mimeType)',
      pageSize: 5
    });
    console.log(`✓ My Drive accessible. Found ${myDriveResponse.data.files?.length || 0} files\n`);
    
    // Test 2: List Shared Drives
    console.log('Test 2: Listing Shared Drives...');
    const sharedDrivesResponse = await drive.drives.list({
      pageSize: 10,
      fields: 'drives(id, name)'
    });
    
    if (sharedDrivesResponse.data.drives && sharedDrivesResponse.data.drives.length > 0) {
      console.log(`✓ Found ${sharedDrivesResponse.data.drives.length} Shared Drive(s):`);
      sharedDrivesResponse.data.drives.forEach(drive => {
        console.log(`  - ${drive.name}: ${drive.id}`);
      });
    } else {
      console.log('✗ No Shared Drives found accessible to this service account');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('IMPORTANT: Verify the following:');
    console.log('='.repeat(60));
    console.log('1. Go to your Shared Drive "CampusHub"');
    console.log('2. Click Share');
    console.log('3. Make sure this email is added:');
    console.log('   campushub-drive-uploader@campushub-479311.iam.gserviceaccount.com');
    console.log('4. Verify it has "Editor" permissions');
    console.log('5. If not present, add it and grant Editor access');
    console.log('6. Wait a few minutes for permissions to propagate');
    console.log('7. Run this script again');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.errors) {
      console.error('Details:', error.errors);
    }
    process.exit(1);
  }
}

testDriveAccess();

import { Dropbox } from 'dropbox';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// For testing, we need to generate an access token
// You can get this from: https://www.dropbox.com/developers/apps
// Click on your app, go to "Generated access token" section and create one
const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ Error: DROPBOX_ACCESS_TOKEN not found in .env');
  console.log('\n📝 To get an access token:');
  console.log('1. Go to https://www.dropbox.com/developers/apps');
  console.log('2. Click on your app (campusHub-storage)');
  console.log('3. Scroll to "Generated access token" section');
  console.log('4. Click "Generate" to create a token');
  console.log('5. Add it to .env: DROPBOX_ACCESS_TOKEN="your_token_here"');
  process.exit(1);
}

const dropbox = new Dropbox({
  accessToken: accessToken
});

async function testDropboxUpload() {
  try {
    console.log('🔄 Testing Dropbox upload...');
    console.log(`📁 App Key: ${process.env.DROPBOX_APP_KEY}`);
    console.log(`📁 App Folder: ${process.env.DROPBOX_APP_FOLDER}`);

    // Create a test file
    const testContent = 'This is a test file for CampusHub Dropbox integration.\n';
    const testFileName = `test-${Date.now()}.txt`;
    const dropboxPath = `/${testFileName}`;

    console.log(`\n📤 Uploading test file: ${testFileName}`);

    // Upload to Dropbox
    const uploadResponse = await dropbox.filesUpload({
      path: dropboxPath,
      contents: Buffer.from(testContent),
      autorename: true,
      mode: 'add'
    });

    console.log('✅ Upload successful!');
    console.log(`📄 File name: ${uploadResponse.result.name}`);
    console.log(`📍 Path: ${uploadResponse.result.path_display}`);
    console.log(`💾 Size: ${uploadResponse.result.size} bytes`);
    console.log(`🆔 File ID: ${uploadResponse.result.id}`);

    // Create a shared link
    console.log(`\n🔗 Creating shared link...`);
    try {
      const linkResponse = await dropbox.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.id,
        settings: {
          requested_visibility: 'public'
        }
      });

      console.log('✅ Shared link created!');
      console.log(`🌐 Public URL: ${linkResponse.result.url}`);
      console.log(`\n✨ Test file successfully uploaded to Dropbox!`);
    } catch (linkError) {
      if (linkError.status === 409) {
        console.log('⚠️  Link already exists, fetching existing link...');
        const existingLinks = await dropbox.sharingListSharedLinks({
          path: uploadResponse.result.id
        });
        if (existingLinks.result.links.length > 0) {
          console.log(`🌐 Public URL: ${existingLinks.result.links[0].url}`);
        }
      } else {
        throw linkError;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.error) {
      console.error('Error details:', error.error);
    }
    console.error('Full error:', error);
    process.exit(1);
  }
}

testDropboxUpload();

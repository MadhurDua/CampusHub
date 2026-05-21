import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

// Helper to extract college ID from email
const extractCollegeId = (email) => {
  const match = email.match(/@([^.]+)/);
  if (match && match[1]) {
    return match[1].toLowerCase();
  }
  return null;
};

async function fixCollegeIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'CampusHub'
    });
    console.log('✅ Connected to MongoDB');

    // Find all users without college_id or with incorrect college_id
    const users = await User.find({});
    let updatedCount = 0;
    let skippedCount = 0;
    let roleMigratedCount = 0;

    console.log(`\n📊 Found ${users.length} total users`);
    console.log('🔄 Checking and updating college IDs and roles...\n');

    for (const user of users) {
      const correctCollegeId = extractCollegeId(user.email);
      
      if (!correctCollegeId) {
        console.log(`⚠️  Skipped ${user.email} - Could not extract college ID`);
        skippedCount++;
        continue;
      }

      // Migrate old roles to new roles
      const oldRoleMap = {
        'club_leader': 'student',  // Migrate club_leader to student
        'tpo': 'college_management', // Migrate tpo to college_management
        'admin': 'college_admin'  // Migrate old admin to college_admin
      };

      let needsSave = false;
      
      if (oldRoleMap[user.role]) {
        const oldRole = user.role;
        user.role = oldRoleMap[user.role];
        console.log(`🔄 Migrated role for ${user.email}: ${oldRole} → ${user.role}`);
        roleMigratedCount++;
        needsSave = true;
      }

      // Update if college_id is missing or incorrect
      if (!user.college_id || user.college_id !== correctCollegeId) {
        const oldCollegeId = user.college_id || 'NULL';
        user.college_id = correctCollegeId;
        console.log(`✅ Updated college_id for ${user.email}: ${oldCollegeId} → ${correctCollegeId}`);
        updatedCount++;
        needsSave = true;
      }

      // Save if any changes were made
      if (needsSave) {
        await user.save();
      } else {
        console.log(`✓  ${user.email}: ${user.college_id} / ${user.role} (correct)`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total users: ${users.length}`);
    console.log(`   College IDs updated: ${updatedCount}`);
    console.log(`   Roles migrated: ${roleMigratedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Already correct: ${users.length - updatedCount - skippedCount}`);

    await mongoose.connection.close();
    console.log('\n✨ College ID fix completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing college IDs:', error);
    process.exit(1);
  }
}

fixCollegeIds();

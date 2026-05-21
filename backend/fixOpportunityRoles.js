import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Opportunity from './models/Opportunity.js';
import User from './models/User.js';

dotenv.config();

async function fixOpportunityRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'CampusHub'
    });
    console.log('✅ Connected to MongoDB');

    const opportunities = await Opportunity.find({});
    console.log(`📊 Found ${opportunities.length} opportunities to update`);

    let updated = 0;
    for (const opp of opportunities) {
      const user = await User.findOne({ id: opp.posted_by_id });
      
      if (user) {
        opp.posted_by_email = user.email;
        opp.posted_by_role = user.role;
        opp.college_email = user.email;
        await opp.save();
        updated++;
        console.log(`✅ Updated opportunity "${opp.title}" - Posted by ${user.role}`);
      } else {
        console.log(`⚠️  User not found for opportunity "${opp.title}"`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} opportunities!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOpportunityRoles();

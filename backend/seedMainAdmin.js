import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function seedMainAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'CampusHub'
    });
    console.log('✅ Connected to MongoDB');

    // Check if main admin already exists
    const existingAdmin = await User.findOne({ email: 'officialharsharora2812@gmail.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Main admin already exists:', existingAdmin.email);
      
      // Update to main_admin if not already
      if (existingAdmin.role !== 'main_admin') {
        existingAdmin.role = 'main_admin';
        existingAdmin.full_name = 'Harsha';
        await existingAdmin.save();
        console.log('✅ Updated existing user to main_admin');
      }
    } else {
      // Create new main admin
      const hashedPassword = await bcrypt.hash('harsha', 10);
      
      const mainAdmin = new User({
        id: uuidv4(),
        email: 'officialharsharora2812@gmail.com',
        full_name: 'Harsha',
        role: 'main_admin',
        college_id: null,  // Main admin has no specific college
        hashed_password: hashedPassword,
        bio: 'Main System Administrator',
        interests: [],
        joined_clubs: [],
        saved_events: [],
        saved_opportunities: []
      });

      await mainAdmin.save();
      console.log('✅ Main admin created successfully!');
      console.log('📧 Email:', mainAdmin.email);
      console.log('🔑 Password: harsha');
      console.log('👤 Name:', mainAdmin.full_name);
      console.log('🎭 Role:', mainAdmin.role);
    }

    await mongoose.connection.close();
    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding main admin:', error);
    process.exit(1);
  }
}

seedMainAdmin();

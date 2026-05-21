import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Import models
import User from './models/User.js';
import Event from './models/Event.js';
import Club from './models/Club.js';
import Resource from './models/Resource.js';
import Opportunity from './models/Opportunity.js';
import MarketplaceItem from './models/MarketplaceItem.js';
import LostFoundItem from './models/LostFoundItem.js';
import Post from './models/Post.js';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME || 'CampusHub'
});

console.log('✅ Connected to MongoDB');

// Helper function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Helper function to get random date
const getRandomFutureDate = (daysFromNow = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysFromNow));
  return date.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Club.deleteMany({});
    await Resource.deleteMany({});
    await Opportunity.deleteMany({});
    await MarketplaceItem.deleteMany({});
    await LostFoundItem.deleteMany({});
    await Post.deleteMany({});

    // Create test users
    console.log('👥 Creating test users...');
    const users = [
      {
        id: uuidv4(),
        email: 'john.doe@university.edu',
        full_name: 'John Doe',
        role: 'student',
        bio: 'Computer Science student passionate about technology and innovation',
        interests: ['programming', 'ai', 'robotics', 'web development'],
        hashed_password: await hashPassword('password123')
      },
      {
        id: uuidv4(),
        email: 'jane.smith@university.edu',
        full_name: 'Jane Smith',
        role: 'faculty',
        bio: 'Professor of Computer Science specializing in Machine Learning',
        interests: ['machine learning', 'data science', 'research'],
        hashed_password: await hashPassword('password123')
      },
      {
        id: uuidv4(),
        email: 'mike.wilson@university.edu',
        full_name: 'Mike Wilson',
        role: 'club_leader',
        bio: 'President of Tech Innovation Club, passionate about entrepreneurship',
        interests: ['leadership', 'technology', 'innovation', 'startups'],
        hashed_password: await hashPassword('password123')
      },
      {
        id: uuidv4(),
        email: 'sarah.johnson@university.edu',
        full_name: 'Sarah Johnson',
        role: 'student',
        bio: 'Art and Design student with a love for creativity',
        interests: ['design', 'art', 'photography', 'creativity'],
        hashed_password: await hashPassword('password123')
      },
      {
        id: uuidv4(),
        email: 'alex.brown@university.edu',
        full_name: 'Alex Brown',
        role: 'tpo',
        bio: 'Training and Placement Officer helping students with career opportunities',
        interests: ['career guidance', 'recruitment', 'networking'],
        hashed_password: await hashPassword('password123')
      }
    ];

    await User.insertMany(users);
    const userIds = users.map(user => user.id);

    // Create test clubs
    console.log('🏛️ Creating test clubs...');
    const clubs = [
      {
        id: uuidv4(),
        name: 'Tech Innovation Club',
        description: 'A vibrant community of students passionate about technology, innovation, and entrepreneurship. We organize workshops, hackathons, and tech talks.',
        category: 'technical',
        leader_ids: [userIds[2]],
        member_ids: [userIds[0], userIds[2]],
        member_count: 2,
        tags: ['technology', 'innovation', 'programming', 'startups']
      },
      {
        id: uuidv4(),
        name: 'Cultural Society',
        description: 'Celebrating diversity and cultural exchange through events, festivals, and cultural programs that bring our campus community together.',
        category: 'cultural',
        leader_ids: [userIds[3]],
        member_ids: [userIds[0], userIds[3]],
        member_count: 2,
        tags: ['culture', 'diversity', 'events', 'festivals']
      },
      {
        id: uuidv4(),
        name: 'Sports Club',
        description: 'For all sports enthusiasts! We organize tournaments, training sessions, and promote fitness and healthy living on campus.',
        category: 'sports',
        leader_ids: [userIds[1]],
        member_ids: [userIds[1], userIds[0]],
        member_count: 2,
        tags: ['sports', 'fitness', 'health', 'tournaments']
      },
      {
        id: uuidv4(),
        name: 'Photography Club',
        description: 'Capture moments, create memories. Join us for photo walks, workshops, and exhibitions showcasing student photography.',
        category: 'cultural',
        leader_ids: [userIds[3]],
        member_ids: [userIds[3]],
        member_count: 1,
        tags: ['photography', 'art', 'creativity', 'exhibitions']
      }
    ];

    await Club.insertMany(clubs);
    const clubIds = clubs.map(club => club.id);

    // Update users with joined clubs
    await User.findOneAndUpdate({ id: userIds[0] }, { joined_clubs: [clubIds[0], clubIds[1], clubIds[2]] });
    await User.findOneAndUpdate({ id: userIds[1] }, { joined_clubs: [clubIds[2]] });
    await User.findOneAndUpdate({ id: userIds[2] }, { joined_clubs: [clubIds[0]] });
    await User.findOneAndUpdate({ id: userIds[3] }, { joined_clubs: [clubIds[1], clubIds[3]] });

    // Create test events
    console.log('📅 Creating test events...');
    const events = [
      {
        id: uuidv4(),
        title: 'AI & Machine Learning Workshop',
        description: 'Comprehensive workshop covering the fundamentals of AI and ML. Learn about neural networks, deep learning, and practical applications. Hands-on coding sessions included.',
        category: 'technical',
        date: getRandomFutureDate(14),
        time: '14:00',
        location: 'Computer Lab 101',
        organizer_id: clubIds[0],
        organizer_type: 'club',
        organizer_name: 'Tech Innovation Club',
        max_attendees: 50,
        registered_users: [userIds[0], userIds[1]],
        tags: ['ai', 'machine learning', 'workshop', 'programming']
      },
      {
        id: uuidv4(),
        title: 'Annual Cultural Night',
        description: 'A spectacular evening celebrating different cultures with traditional food, music, dance performances, and cultural exhibitions from around the world.',
        category: 'cultural',
        date: getRandomFutureDate(21),
        time: '18:00',
        location: 'Main Auditorium',
        organizer_id: clubIds[1],
        organizer_type: 'club',
        organizer_name: 'Cultural Society',
        max_attendees: 300,
        registered_users: [userIds[0], userIds[3]],
        tags: ['culture', 'music', 'dance', 'food']
      },
      {
        id: uuidv4(),
        title: 'Inter-Department Basketball Tournament',
        description: 'Annual basketball championship between different departments. Teams compete for the coveted championship trophy. Registration open for all departments.',
        category: 'sports',
        date: getRandomFutureDate(28),
        time: '16:00',
        location: 'Sports Complex',
        organizer_id: clubIds[2],
        organizer_type: 'club',
        organizer_name: 'Sports Club',
        max_attendees: 200,
        registered_users: [userIds[0]],
        tags: ['basketball', 'tournament', 'sports', 'competition']
      },
      {
        id: uuidv4(),
        title: 'Startup Pitch Competition',
        description: 'Present your innovative startup ideas to a panel of industry experts and investors. Win funding and mentorship opportunities.',
        category: 'technical',
        date: getRandomFutureDate(35),
        time: '10:00',
        location: 'Innovation Hub',
        organizer_id: clubIds[0],
        organizer_type: 'club',
        organizer_name: 'Tech Innovation Club',
        max_attendees: 100,
        registered_users: [userIds[2]],
        tags: ['startup', 'entrepreneurship', 'pitch', 'innovation']
      },
      {
        id: uuidv4(),
        title: 'Photography Exhibition',
        description: 'Showcase of stunning photographs captured by our talented student photographers. Theme: "Campus Life Through My Lens"',
        category: 'cultural',
        date: getRandomFutureDate(10),
        time: '11:00',
        location: 'Art Gallery',
        organizer_id: clubIds[3],
        organizer_type: 'club',
        organizer_name: 'Photography Club',
        max_attendees: 150,
        registered_users: [userIds[3]],
        tags: ['photography', 'art', 'exhibition', 'creativity']
      }
    ];

    await Event.insertMany(events);

    // Create test resources
    console.log('📚 Creating test resources...');
    const resources = [
      {
        id: uuidv4(),
        title: 'Data Structures and Algorithms - Complete Guide',
        description: 'Comprehensive notes covering all major data structures (arrays, linked lists, trees, graphs) and algorithms (sorting, searching, dynamic programming). Includes code examples in multiple languages.',
        course: 'Computer Science',
        semester: '3rd Semester',
        subject: 'Data Structures',
        file_type: 'pdf',
        file_name: 'dsa_complete_guide.pdf',
        uploader_id: userIds[0],
        uploader_name: 'John Doe',
        rating: 4.7,
        rating_count: 23,
        downloads: 156,
        tags: ['algorithms', 'data structures', 'programming', 'computer science']
      },
      {
        id: uuidv4(),
        title: 'Machine Learning Fundamentals',
        description: 'Essential concepts in machine learning including supervised and unsupervised learning, neural networks, and practical implementation guides.',
        course: 'Computer Science',
        semester: '6th Semester',
        subject: 'Machine Learning',
        file_type: 'pdf',
        file_name: 'ml_fundamentals.pdf',
        uploader_id: userIds[1],
        uploader_name: 'Jane Smith',
        rating: 4.9,
        rating_count: 31,
        downloads: 203,
        tags: ['machine learning', 'ai', 'neural networks', 'python']
      },
      {
        id: uuidv4(),
        title: 'Web Development Bootcamp Notes',
        description: 'Complete web development guide covering HTML, CSS, JavaScript, React, Node.js, and database integration. Perfect for beginners and intermediate developers.',
        course: 'Computer Science',
        semester: '4th Semester',
        subject: 'Web Technologies',
        file_type: 'pdf',
        file_name: 'web_dev_bootcamp.pdf',
        uploader_id: userIds[2],
        uploader_name: 'Mike Wilson',
        rating: 4.6,
        rating_count: 18,
        downloads: 89,
        tags: ['web development', 'javascript', 'react', 'nodejs']
      },
      {
        id: uuidv4(),
        title: 'Digital Design Principles',
        description: 'Fundamental principles of digital design including color theory, typography, layout design, and user experience basics.',
        course: 'Design',
        semester: '2nd Semester',
        subject: 'Digital Design',
        file_type: 'pdf',
        file_name: 'digital_design_principles.pdf',
        uploader_id: userIds[3],
        uploader_name: 'Sarah Johnson',
        rating: 4.4,
        rating_count: 15,
        downloads: 67,
        tags: ['design', 'ui/ux', 'typography', 'color theory']
      }
    ];

    await Resource.insertMany(resources);

    // Create test opportunities
    console.log('💼 Creating test opportunities...');
    const opportunities = [
      {
        id: uuidv4(),
        title: 'Software Engineering Internship - Google',
        company: 'Google',
        type: 'internship',
        description: 'Summer internship program for software engineering students. Work on real projects with experienced engineers and contribute to products used by billions.',
        eligibility: '3rd/4th year CS students with strong programming skills in Java, Python, or C++',
        deadline: getRandomFutureDate(45),
        apply_link: 'https://careers.google.com/students/',
        posted_by_id: userIds[4],
        posted_by_name: 'Alex Brown',
        tags: ['internship', 'software engineering', 'google', 'programming']
      },
      {
        id: uuidv4(),
        title: 'Data Science Competition - Kaggle',
        company: 'Kaggle',
        type: 'competition',
        description: 'Global data science competition with $50,000 prize pool. Solve real-world problems using machine learning and data analysis.',
        eligibility: 'All students with basic knowledge of data science and Python',
        deadline: getRandomFutureDate(30),
        apply_link: 'https://kaggle.com/competitions',
        posted_by_id: userIds[1],
        posted_by_name: 'Jane Smith',
        tags: ['data science', 'competition', 'machine learning', 'kaggle']
      },
      {
        id: uuidv4(),
        title: 'UI/UX Design Internship - Adobe',
        company: 'Adobe',
        type: 'internship',
        description: 'Creative internship focusing on user interface and user experience design. Work with industry-leading design tools and methodologies.',
        eligibility: 'Design students with portfolio showcasing UI/UX projects',
        deadline: getRandomFutureDate(25),
        apply_link: 'https://adobe.com/careers/students',
        posted_by_id: userIds[4],
        posted_by_name: 'Alex Brown',
        tags: ['ui/ux', 'design', 'adobe', 'internship']
      },
      {
        id: uuidv4(),
        title: 'Merit Scholarship Program',
        company: 'University Foundation',
        type: 'scholarship',
        description: 'Merit-based scholarship for outstanding academic performance. Covers tuition fees and provides additional stipend for research.',
        eligibility: 'Students with GPA above 3.5 and demonstrated leadership skills',
        deadline: getRandomFutureDate(60),
        apply_link: 'https://university.edu/scholarships',
        posted_by_id: userIds[4],
        posted_by_name: 'Alex Brown',
        tags: ['scholarship', 'merit', 'academic', 'funding']
      }
    ];

    await Opportunity.insertMany(opportunities);

    // Create test marketplace items
    console.log('🛒 Creating test marketplace items...');
    const marketplaceItems = [
      {
        id: uuidv4(),
        title: 'Introduction to Algorithms Textbook',
        description: 'Classic CLRS textbook in excellent condition. Barely used, no highlighting or writing. Perfect for data structures and algorithms course.',
        category: 'books',
        price: 45.99,
        seller_id: userIds[0],
        seller_name: 'John Doe',
        status: 'available'
      },
      {
        id: uuidv4(),
        title: 'MacBook Pro 13" (2019)',
        description: 'Well-maintained MacBook Pro with 8GB RAM and 256GB SSD. Great for programming and design work. Includes original charger and box.',
        category: 'electronics',
        price: 899.99,
        seller_id: userIds[1],
        seller_name: 'Jane Smith',
        status: 'available'
      },
      {
        id: uuidv4(),
        title: 'Study Desk with Chair',
        description: 'Comfortable study desk with ergonomic chair. Perfect for dorm room or apartment. Easy to assemble and disassemble.',
        category: 'furniture',
        price: 75.00,
        seller_id: userIds[2],
        seller_name: 'Mike Wilson',
        status: 'available'
      },
      {
        id: uuidv4(),
        title: 'Canon DSLR Camera',
        description: 'Canon EOS Rebel T7i with 18-55mm lens. Great for photography enthusiasts. Includes camera bag and extra battery.',
        category: 'electronics',
        price: 325.50,
        seller_id: userIds[3],
        seller_name: 'Sarah Johnson',
        status: 'available'
      },
      {
        id: uuidv4(),
        title: 'Calculus and Linear Algebra Books Set',
        description: 'Complete set of mathematics textbooks for engineering students. All books in good condition with minimal wear.',
        category: 'books',
        price: 85.00,
        seller_id: userIds[0],
        seller_name: 'John Doe',
        status: 'sold'
      }
    ];

    await MarketplaceItem.insertMany(marketplaceItems);

    // Create test lost & found items
    console.log('🔍 Creating test lost & found items...');
    const lostFoundItems = [
      {
        id: uuidv4(),
        title: 'Black Leather Wallet Lost',
        description: 'Lost black leather wallet containing student ID, credit cards, and some cash. Last seen near the main library entrance.',
        category: 'lost',
        item_type: 'wallet',
        location: 'Main Library',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        posted_by_id: userIds[0],
        posted_by_name: 'John Doe',
        status: 'active'
      },
      {
        id: uuidv4(),
        title: 'iPhone 12 Found',
        description: 'Found iPhone 12 (blue color) in the student cafeteria. Has a clear case with some stickers. Contact me to claim.',
        category: 'found',
        item_type: 'phone',
        location: 'Student Cafeteria',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        posted_by_id: userIds[2],
        posted_by_name: 'Mike Wilson',
        status: 'active'
      },
      {
        id: uuidv4(),
        title: 'Red Backpack Found',
        description: 'Found red Jansport backpack in the computer lab. Contains notebooks and a water bottle. Please contact to identify and claim.',
        category: 'found',
        item_type: 'others',
        location: 'Computer Lab 205',
        date: new Date().toISOString().split('T')[0],
        posted_by_id: userIds[1],
        posted_by_name: 'Jane Smith',
        status: 'active'
      },
      {
        id: uuidv4(),
        title: 'Student ID Card Lost',
        description: 'Lost student ID card somewhere between the dormitory and the engineering building. Name: Sarah Johnson, ID: 2021CS001',
        category: 'lost',
        item_type: 'id_card',
        location: 'Between Dormitory and Engineering Building',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        posted_by_id: userIds[3],
        posted_by_name: 'Sarah Johnson',
        status: 'resolved'
      }
    ];

    await LostFoundItem.insertMany(lostFoundItems);

    // Create test posts
    console.log('📝 Creating test posts...');
    const posts = [
      {
        id: uuidv4(),
        club_id: clubIds[0],
        author_id: userIds[2],
        author_name: 'Mike Wilson',
        content: '🚀 Welcome to Tech Innovation Club! We\'re excited to have you join our community of tech enthusiasts. Get ready for amazing workshops, hackathons, and networking opportunities!',
        pinned: true
      },
      {
        id: uuidv4(),
        club_id: clubIds[0],
        author_id: userIds[0],
        author_name: 'John Doe',
        content: 'Really looking forward to the upcoming AI workshop! 🤖 Who else is attending? Let\'s form study groups to prepare together.',
        pinned: false
      },
      {
        id: uuidv4(),
        club_id: clubIds[1],
        author_id: userIds[3],
        author_name: 'Sarah Johnson',
        content: '🎭 Cultural Night preparations are in full swing! We need volunteers for decoration, sound setup, and coordination. Please DM me if you\'re interested in helping out.',
        pinned: true
      },
      {
        id: uuidv4(),
        club_id: clubIds[2],
        author_id: userIds[1],
        author_name: 'Jane Smith',
        content: '🏀 Basketball tournament registrations are now open! Each department can register up to 2 teams. Don\'t miss this chance to showcase your skills and represent your department.',
        pinned: false
      },
      {
        id: uuidv4(),
        club_id: clubIds[0],
        author_id: userIds[2],
        author_name: 'Mike Wilson',
        content: '💡 Startup Pitch Competition update: We have confirmed 3 industry mentors and 2 angel investors as judges. This is a great opportunity to get real feedback on your ideas!',
        pinned: false
      },
      {
        id: uuidv4(),
        club_id: clubIds[3],
        author_id: userIds[3],
        author_name: 'Sarah Johnson',
        content: '📸 Photography Exhibition theme announced: "Campus Life Through My Lens". Submit your best shots capturing the essence of our campus community. Deadline: Next Friday!',
        pinned: true
      }
    ];

    await Post.insertMany(posts);

    console.log('\n✅ Database seeded successfully!');
    console.log(`👥 Created ${users.length} users`);
    console.log(`🏛️ Created ${clubs.length} clubs`);
    console.log(`📅 Created ${events.length} events`);
    console.log(`📚 Created ${resources.length} resources`);
    console.log(`💼 Created ${opportunities.length} opportunities`);
    console.log(`🛒 Created ${marketplaceItems.length} marketplace items`);
    console.log(`🔍 Created ${lostFoundItems.length} lost & found items`);
    console.log(`📝 Created ${posts.length} posts`);
    
    console.log('\n🔐 Test User Credentials:');
    console.log('Email: john.doe@university.edu | Password: password123 | Role: Student');
    console.log('Email: jane.smith@university.edu | Password: password123 | Role: Faculty');
    console.log('Email: mike.wilson@university.edu | Password: password123 | Role: Club Leader');
    console.log('Email: sarah.johnson@university.edu | Password: password123 | Role: Student');
    console.log('Email: alex.brown@university.edu | Password: password123 | Role: TPO');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

seedDatabase();

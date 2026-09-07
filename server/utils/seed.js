// Run with: npm run seed
// Populates the database with an admin account, a few categories and sample posts.
// Safe to re-run - it skips creation if data already exists.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const BlogPost = require('../models/BlogPost');

const run = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@blogplatform.com' });
  const admin =
    existingAdmin ||
    (await User.create({
      name: 'Admin',
      email: 'admin@blogplatform.com',
      password: 'Admin@12345',
      role: 'admin',
      avatar: { url: '/images/default-avatar.png', public_id: 'default_avatar' },
    }));
  console.log(`Admin ready: ${admin.email} (password: Admin@12345 if newly created)`);

  const categoryNames = ['Technology', 'Lifestyle', 'Travel', 'Business', 'Design'];
  const categories = [];
  for (const name of categoryNames) {
    let cat = await Category.findOne({ name });
    if (!cat) {
      cat = await Category.create({ name, description: `${name} related articles` });
    }
    categories.push(cat);
  }
  console.log(`Categories ready: ${categories.map((c) => c.name).join(', ')}`);

  const existingPosts = await BlogPost.countDocuments();
  if (existingPosts === 0) {
    await BlogPost.create([
      {
        title: 'Getting Started with the MERN Stack',
        subtitle: 'A practical introduction to MongoDB, Express, React and Node',
        content:
          '<p>The MERN stack combines four powerful technologies to build modern web applications...</p><p>In this guide we walk through setting up each layer of the stack.</p>',
        category: categories[0]._id,
        tags: ['mern', 'javascript', 'webdev'],
        author: admin._id,
        status: 'published',
        coverImage: { url: '/images/tech-cover.jpg', public_id: 'tech_cover' },
      },
      {
        title: 'Designing Interfaces People Actually Enjoy Using',
        subtitle: 'Notes on clarity, restraint, and typography',
        content:
          '<p>Good interface design is invisible - it gets out of the way and lets people accomplish what they came to do.</p>',
        category: categories[4]._id,
        tags: ['design', 'ux'],
        author: admin._id,
        status: 'published',
        coverImage: { url: '/images/design-cover.jpg', public_id: 'design_cover' },
      },
    ]);
    console.log('Sample posts created');
  }

  console.log('Seeding complete');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

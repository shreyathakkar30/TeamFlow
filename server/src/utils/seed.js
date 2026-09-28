// Seeds a demo admin and a demo team member so reviewers can log in
// immediately. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const run = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: ['admin@teamflow.dev', 'member@teamflow.dev'] } });

  const admin = await User.create({
    name: 'Alex Admin',
    email: 'admin@teamflow.dev',
    password: 'Password123!',
    role: 'admin',
  });

  const member = await User.create({
    name: 'Morgan Member',
    email: 'member@teamflow.dev',
    password: 'Password123!',
    role: 'member',
  });

  const project = await Project.create({
    name: 'Website Redesign',
    description: 'Refresh the marketing site with a new design system.',
    status: 'Active',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    members: [admin._id, member._id],
    createdBy: admin._id,
  });

  await Task.create({
    title: 'Set up component library',
    description: 'Establish shared UI components for the new design.',
    project: project._id,
    assignedTo: member._id,
    priority: 'High',
    status: 'In Progress',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: admin._id,
  });

  console.log('Seed complete.');
  console.log('Admin login:  admin@teamflow.dev / Password123!');
  console.log('Member login: member@teamflow.dev / Password123!');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

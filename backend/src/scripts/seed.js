require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Complaint = require('../models/Complaint')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/waste'

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing demo users (optional - comment out if you want to keep existing data)
    await User.deleteMany({ 
      email: { 
        $in: [
          'citizen@demo.com',
          'staff@demo.com', 
          'admin@demo.com'
        ] 
      } 
    })
    console.log('Cleared existing demo users')

    // Create demo users
    const passwordHash = await bcrypt.hash('demo123', 10)

    const demoUsers = [
      {
        name: 'Demo Citizen',
        email: 'citizen@demo.com',
        passwordHash,
        role: 'citizen',
        ecoPoints: 50
      },
      {
        name: 'Demo Staff',
        email: 'staff@demo.com',
        passwordHash,
        role: 'staff',
        ecoPoints: 0
      },
      {
        name: 'Demo Admin',
        email: 'admin@demo.com',
        passwordHash,
        role: 'admin',
        ecoPoints: 0
      }
    ]

    const users = await User.insertMany(demoUsers)
    console.log('✅ Created demo users:')
    console.log('   Citizen: citizen@demo.com / demo123')
    console.log('   Staff: staff@demo.com / demo123')
    console.log('   Admin: admin@demo.com / demo123')

    // Create some demo complaints for staff portal
    const citizenUser = users.find(u => u.role === 'citizen')
    if (citizenUser) {
      await Complaint.deleteMany({ userId: citizenUser._id })
      
      const demoComplaints = [
        {
          userId: citizenUser._id,
          title: 'Overflowing garbage bin',
          description: 'Large garbage bin is overflowing, needs immediate attention',
          category: 'Garbage Collection',
          priority: 'High',
          status: 'open',
          location: { type: 'Point', coordinates: [-73.9857, 40.7580] }, // Main Street & 5th Avenue
          severityScore: 50,
          assignedTeam: null
        },
        {
          userId: citizenUser._id,
          title: 'Damaged recycling container',
          description: 'Recycling container has a broken lid and needs repair',
          category: 'Recycling',
          priority: 'Medium',
          status: 'open',
          location: { type: 'Point', coordinates: [-73.9654, 40.7829] }, // Central Park West
          severityScore: 30,
          assignedTeam: null
        },
        {
          userId: citizenUser._id,
          title: 'Broken recycling container',
          description: 'Recycling container has a broken lid and needs repair',
          category: 'Recycling',
          priority: 'Medium',
          status: 'resolved',
          location: { type: 'Point', coordinates: [-73.9654, 40.7829] }, // Central Park East
          severityScore: 30,
          assignedTeam: 'Team Alpha',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 hours ago
        },
        {
          userId: citizenUser._id,
          title: 'Illegal dumping cleanup',
          description: 'Illegal dumping site needs cleanup',
          category: 'Illegal Dumping',
          priority: 'High',
          status: 'resolved',
          location: { type: 'Point', coordinates: [-74.0060, 40.7128] }, // Industrial District
          severityScore: 50,
          assignedTeam: 'Team Alpha',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          updatedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000) // 2.5 hours ago
        }
      ]

      await Complaint.insertMany(demoComplaints)
      console.log('✅ Created demo complaints')
    }

    console.log('\n🎉 Seed data created successfully!')
    console.log('\n📝 Demo Credentials:')
    console.log('   Citizen Portal: citizen@demo.com / demo123')
    console.log('   Staff Portal: staff@demo.com / demo123')
    console.log('   Admin Portal: admin@demo.com / demo123')
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

seed()


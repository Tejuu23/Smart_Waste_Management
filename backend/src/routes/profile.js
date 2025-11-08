const router = require('express').Router()
const User = require('../models/User')
const Complaint = require('../models/Complaint')
const { requireAuth } = require('../middleware/auth')
const bcrypt = require('bcryptjs')

// Get user profile
router.get('/', requireAuth(['citizen', 'staff', 'admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Get complaint count for citizens
    let complaintsCount = 0
    if (user.role === 'citizen') {
      complaintsCount = await Complaint.countDocuments({ userId: user._id })
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ecoPoints: user.ecoPoints || 0,
      complaintsCount: user.complaintsCount || complaintsCount,
      rating: user.rating || { average: 0, count: 0 },
      staffId: user.staffId,
      teamName: user.teamName,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/', requireAuth(['citizen', 'staff', 'admin']), async (req, res) => {
  try {
    const { name, teamName } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, teamName },
      { new: true }
    )
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ecoPoints: user.ecoPoints || 0,
      complaintsCount: user.complaintsCount || 0,
      rating: user.rating || { average: 0, count: 0 },
      teamName: user.teamName
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Update password
router.put('/password', requireAuth(['citizen', 'staff', 'admin']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' })
    }
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })
    user.passwordHash = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Failed to update password:', error)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

// Rate staff/admin
router.post('/rate/:userId', requireAuth(['citizen']), async (req, res) => {
  try {
    const { value, comment } = req.body
    const { userId } = req.params
    
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }
    
    const ratedUser = await User.findById(userId)
    if (!ratedUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (ratedUser.role !== 'staff' && ratedUser.role !== 'admin') {
      return res.status(400).json({ error: 'Can only rate staff or admin' })
    }
    
    // Check if user already rated
    const existingRating = ratedUser.rating?.ratings?.find(
      r => r.userId.toString() === req.user.id
    )
    
    if (existingRating) {
      // Update existing rating
      existingRating.value = value
      existingRating.comment = comment
      existingRating.createdAt = new Date()
    } else {
      // Add new rating
      if (!ratedUser.rating) {
        ratedUser.rating = { average: 0, count: 0, ratings: [] }
      }
      ratedUser.rating.ratings.push({
        userId: req.user.id,
        value,
        comment,
        createdAt: new Date()
      })
    }
    
    // Recalculate average rating
    const ratings = ratedUser.rating.ratings
    const sum = ratings.reduce((acc, r) => acc + r.value, 0)
    ratedUser.rating.average = sum / ratings.length
    ratedUser.rating.count = ratings.length
    
    await ratedUser.save()
    
    res.json({
      message: 'Rating submitted successfully',
      rating: ratedUser.rating
    })
  } catch (error) {
    console.error('Failed to submit rating:', error)
    res.status(500).json({ error: 'Failed to submit rating' })
  }
})

module.exports = router


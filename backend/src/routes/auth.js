const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', teamName, staffId } = req.body
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role, teamName, staffId })
    res.json({ id: user._id, role: user.role, message: 'Registration successful' })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map(e => e.message).join(', ') })
    }
    res.status(500).json({ error: error.message || 'Registration failed. Please try again.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }
    
    const ok = await user.verifyPassword(password)
    if (!ok) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        ecoPoints: user.ecoPoints || 0,
        complaintsCount: user.complaintsCount || 0,
        rating: user.rating || { average: 0, count: 0 },
        staffId: user.staffId,
        teamName: user.teamName
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

module.exports = router
// Forgot password (demo: just acknowledge request)
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const user = await User.findOne({ email })
    if (!user) return res.json({ message: 'If the email exists, reset instructions were sent.' })
    // In production, send email with token. Here we return success.
    return res.json({ message: 'Password reset instructions sent to your email.' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
})

// Reset password (demo: update directly by email)
router.post('/reset', async (req, res) => {
  try {
    const { email, newPassword } = req.body
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and newPassword are required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    user.passwordHash = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' })
  }
})



const router = require('express').Router()
const Team = require('../models/Team')
const { requireAuth } = require('../middleware/auth')

// Get all teams
router.get('/', requireAuth(['admin', 'staff']), async (req, res) => {
  try {
    const teams = await Team.find().populate('members', 'name email')
    res.json(teams)
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
})

// Create new team
router.post('/', requireAuth(['admin']), async (req, res) => {
  try {
    const { name, area, members = [], contactPhone, contactEmail, supervisorName } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' })
    }
    
    const team = await Team.create({
      name,
      area: area || 'General Area',
      members,
      status: 'Active',
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      supervisorName: supervisorName || ''
    })
    
    res.json(team)
  } catch (error) {
    console.error('Failed to create team:', error)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Team name already exists' })
    }
    res.status(500).json({ error: 'Failed to create team' })
  }
})

// Update team
router.put('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const { name, area, members, status, contactPhone, contactEmail, supervisorName } = req.body
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, area, members, status, contactPhone, contactEmail, supervisorName },
      { new: true }
    ).populate('members', 'name email')
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    
    res.json(team)
  } catch (error) {
    console.error('Failed to update team:', error)
    res.status(500).json({ error: 'Failed to update team' })
  }
})

// Delete team
router.delete('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id)
    if (!team) {
      return res.status(404).json({ error: 'Team not found' })
    }
    res.json({ message: 'Team deleted successfully' })
  } catch (error) {
    console.error('Failed to delete team:', error)
    res.status(500).json({ error: 'Failed to delete team' })
  }
})

module.exports = router


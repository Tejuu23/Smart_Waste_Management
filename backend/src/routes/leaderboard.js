const router = require('express').Router()
const User = require('../models/User')

router.get('/', async (_req, res) => {
  try {
    const users = await User.find({ role: 'citizen' })
      .select('name ecoPoints')
      .sort({ ecoPoints: -1 })
      .limit(100)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router


const router = require('express').Router()
const Bin = require('../models/Bin')
const { requireAuth } = require('../middleware/auth')

module.exports = (io) => {
  router.post('/ping', async (req, res) => {
    const { code, fillLevel, longitude, latitude } = req.body
    const bin = await Bin.findOneAndUpdate(
      { code },
      { fillLevel, lastPingAt: new Date(), location: { type: 'Point', coordinates: [Number(longitude)||0, Number(latitude)||0] } },
      { new: true, upsert: true }
    )
    if (bin.fillLevel >= 80) {
      io.emit('bin:alert', { code: bin.code, fillLevel: bin.fillLevel })
    }
    res.json({ ok: true })
  })

  router.get('/', requireAuth(['admin', 'staff']), async (_req, res) => {
    const bins = await Bin.find().sort({ updatedAt: -1 }).limit(200)
    res.json(bins)
  })

  return router
}



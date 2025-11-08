const router = require('express').Router()

// Stub endpoints for AI features
router.post('/classify', async (_req, res) => {
  // TODO: Integrate TensorFlow.js or Python microservice
  res.json({ label: 'mixed_waste', confidence: 0.72 })
})

router.get('/predict/trends', async (_req, res) => {
  // TODO: Predict per-ward waste trends
  res.json({ ward: 'W1', dailyKg: [120, 140, 135, 150, 160, 170, 165] })
})

router.post('/priority', async (req, res) => {
  const { nearSchool, overflow, proximityToMarket } = req.body
  // simple heuristic score
  const score = (nearSchool ? 30 : 0) + (overflow ? 50 : 0) + (proximityToMarket ? 20 : 0)
  res.json({ priority: score })
})

module.exports = router



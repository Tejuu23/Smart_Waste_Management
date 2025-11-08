const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get my eco points
router.get('/me', auth(['citizen', 'staff', 'admin']), async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  return res.json({ ecoPoints: user?.ecoPoints || 0 });
});

// Leaderboard - top 20
router.get('/leaderboard', auth(['citizen', 'staff', 'admin']), async (_req, res) => {
  const top = await User.find({}, { name: 1, ecoPoints: 1 })
    .sort({ ecoPoints: -1, createdAt: 1 })
    .limit(20)
    .lean();
  return res.json(top);
});

// Award eco-points (admin)
// body: { userId, points, reason }
router.post('/award', auth(['admin']), async (req, res) => {
  const { userId, points } = req.body;
  if (typeof points !== 'number') return res.status(400).json({ message: 'points must be number' });
  const updated = await User.findByIdAndUpdate(
    userId,
    { $inc: { ecoPoints: points } },
    { new: true }
  );
  return res.json({ userId: updated?._id, ecoPoints: updated?.ecoPoints || 0 });
});

module.exports = router;



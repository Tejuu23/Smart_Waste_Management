const express = require('express');
const { auth } = require('../middleware/auth');
const Bin = require('../models/Bin');

const router = express.Router();

function dist(a, b) {
  if (!a || !b) return Infinity;
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(s1 + s2)));
  return R * c;
}

// Smart Collection Mode: order full bins by nearest-neighbor
router.get('/optimize', auth(['admin', 'staff']), async (req, res) => {
  const startLat = parseFloat(req.query.startLat);
  const startLng = parseFloat(req.query.startLng);
  if (Number.isNaN(startLat) || Number.isNaN(startLng)) {
    return res.status(400).json({ message: 'startLat and startLng required' });
  }
  const start = { lat: startLat, lng: startLng };
  const candidates = await Bin.find({ fillLevel: { $gte: 80 } }).lean();
  const remaining = candidates.map(b => ({
    id: b._id,
    name: b.name,
    location: b.location,
    fillLevel: b.fillLevel
  }));
  const route = [];
  let current = start;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = dist(current, remaining[i].location);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    route.push({ ...next, distanceFromPrevMeters: Math.round(bestDist) });
    current = next.location;
  }
  return res.json({ start, stops: route });
});

module.exports = router;



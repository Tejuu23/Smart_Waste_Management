const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Bin = require('../models/Bin');

function haversineMeters(a, b) {
    if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return Infinity;
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

// In dev, accept base64/url without Cloudinary; configure multer memory for future
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Citizen: submit complaint (optionally with photo as data URL)
router.post('/', auth(['citizen']), upload.single('photo'), async (req, res) => {
	try {
		const { description, location, photoUrl } = req.body;
		const parsedLocation = location ? JSON.parse(location) : undefined;
		// Compute simple priority
		let priorityScore = 1;
		const desc = (description || '').toLowerCase();
		if (/(school|hospital|market|temple|mosque|church)/.test(desc)) priorityScore += 2;
		if (parsedLocation) {
			const nearbyOverflow = await Bin.find({ status: 'overflow' }).lean();
			for (const bin of nearbyOverflow) {
				const d = haversineMeters(parsedLocation, bin.location);
				if (d <= 300) { priorityScore += 3; break; }
			}
		}
		const complaint = await Complaint.create({
			citizen: req.user.id,
			description,
			location: parsedLocation,
			photoUrl: photoUrl || undefined,
			priorityScore
		});
		// Award eco-points for reporting an issue
		await User.findByIdAndUpdate(req.user.id, { $inc: { ecoPoints: 10 } });
		const io = req.app.get('io');
		io.emit('complaint:new', { id: complaint._id, status: complaint.status });
		return res.json(complaint);
	} catch (e) {
		return res.status(500).json({ message: 'Failed to submit complaint' });
	}
});

// Admin: list complaints
router.get('/', auth(['admin']), async (req, res) => {
	const list = await Complaint.find().sort({ createdAt: -1 }).lean();
	return res.json(list);
});
// Admin: prioritized list
router.get('/prioritized', auth(['admin']), async (req, res) => {
	const list = await Complaint.find().sort({ priorityScore: -1, createdAt: 1 }).lean();
	return res.json(list);
});

// Any authenticated user: get own complaints
router.get('/mine', auth(['citizen', 'staff', 'admin']), async (req, res) => {
	const q = req.user.role === 'citizen' ? { citizen: req.user.id } : {};
	const list = await Complaint.find(q).sort({ createdAt: -1 }).lean();
	return res.json(list);
});

// Admin: update status and assignment
router.put('/:id/status', auth(['admin']), async (req, res) => {
	const { status, assignedTo } = req.body;
	const updated = await Complaint.findByIdAndUpdate(
		req.params.id,
		{ status, assignedTo },
		{ new: true }
	);
	const io = req.app.get('io');
	io.emit('complaint:update', { id: updated._id, status: updated.status, assignedTo: updated.assignedTo });
	return res.json(updated);
});

module.exports = router;



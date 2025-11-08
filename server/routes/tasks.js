const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');
const Complaint = require('../models/Complaint');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Admin: create task for a complaint
router.post('/', auth(['admin']), async (req, res) => {
	const { complaintId, assignedTo } = req.body;
	const task = await Task.create({ complaint: complaintId, assignedTo });
	await Complaint.findByIdAndUpdate(complaintId, { status: 'assigned', assignedTo });
	const io = req.app.get('io');
	io.emit('complaint:update', { id: complaintId, status: 'assigned', assignedTo });
	return res.json(task);
});

// Staff: my tasks
router.get('/mine', auth(['staff']), async (req, res) => {
	const tasks = await Task.find({ assignedTo: req.user.id }).populate('complaint').sort({ createdAt: -1 }).lean();
	return res.json(tasks);
});

// Staff: complete task with proof
router.put('/:id/complete', auth(['staff']), upload.single('photo'), async (req, res) => {
	const { proofPhotoUrl } = req.body;
	const updated = await Task.findByIdAndUpdate(
		req.params.id,
		{ status: 'completed', proofPhotoUrl: proofPhotoUrl || undefined, completedAt: new Date() },
		{ new: true }
	);
	if (updated) {
		await Complaint.findByIdAndUpdate(updated.complaint, { status: 'resolved' });
		const io = req.app.get('io');
		io.emit('complaint:update', { id: String(updated.complaint), status: 'resolved' });
	}
	return res.json(updated);
});

module.exports = router;



const express = require('express');
const { auth } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const crypto = require('crypto');

const router = express.Router();

// Anchor a resolution proof hash (stub for blockchain integration)
router.post('/anchor-resolution', auth(['admin', 'staff']), async (req, res) => {
  const { complaintId, proof } = req.body;
  if (!complaintId || !proof) return res.status(400).json({ message: 'complaintId and proof required' });
  const hash = crypto.createHash('sha256').update(String(proof)).digest('hex');
  const anchoredAt = new Date();
  const updated = await Complaint.findByIdAndUpdate(
    complaintId,
    { $set: { resolutionAnchor: { hash, anchoredAt } } },
    { new: true }
  );
  return res.json({ complaintId: updated?._id, hash, anchoredAt });
});

module.exports = router;



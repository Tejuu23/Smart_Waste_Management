const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
	{
		complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		status: { type: String, enum: ['assigned', 'in_progress', 'completed'], default: 'assigned' },
		proofPhotoUrl: String,
		completedAt: Date
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);



const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
	{
		citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		description: { type: String, required: true },
		location: {
			lat: Number,
			lng: Number,
			address: String
		},
		photoUrl: String,
		status: { type: String, enum: ['submitted', 'assigned', 'in_progress', 'resolved'], default: 'submitted' },
		assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		priorityScore: { type: Number, default: 0 },
		resolutionAnchor: {
			hash: String,
			anchoredAt: Date
		}
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);



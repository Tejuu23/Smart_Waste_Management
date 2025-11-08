const mongoose = require('mongoose');

const binSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		location: {
			lat: Number,
			lng: Number,
			address: String
		},
		status: { type: String, enum: ['normal', 'full', 'overflow'], default: 'normal' },
		fillLevel: { type: Number, min: 0, max: 100, default: 0 },
		sensorLastSeen: Date,
		lastCollectedAt: Date
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Bin', binSchema);



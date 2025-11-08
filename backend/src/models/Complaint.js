const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  imageUrl: String,
  category: { type: String, default: 'Garbage Collection' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  assignedTeam: { type: String, default: null },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  severityScore: { type: Number, default: 0 },
  proofImageUrl: { type: String, default: null }
}, { timestamps: true })

complaintSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Complaint', complaintSchema)



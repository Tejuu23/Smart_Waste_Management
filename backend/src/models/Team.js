const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  area: String,
  status: { type: String, enum: ['Active', 'Break', 'Inactive'], default: 'Active' },
  activeTasks: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  supervisorName: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Team', teamSchema)


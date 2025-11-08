const mongoose = require('mongoose')

const binSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  fillLevel: { type: Number, default: 0 },
  lastPingAt: { type: Date }
}, { timestamps: true })

binSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Bin', binSchema)



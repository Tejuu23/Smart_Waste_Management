const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'staff', 'admin'], default: 'citizen' },
  ecoPoints: { type: Number, default: 0 },
  complaintsCount: { type: Number, default: 0 },
  rating: { 
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    ratings: [{ 
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      value: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  staffId: String,
  teamName: String
}, { timestamps: true })

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)



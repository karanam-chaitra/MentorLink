const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  department: { type: String, required: true },
  expertise: [{ type: String, required: true }],
  bio: { type: String, required: true },
  maxCapacity: { type: Number, required: true, min: 1, max: 20, default: 3 },
  activeRequestsCount: { type: Number, default: 0, min: 0 },
  exposureCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  department: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  interests: [{ type: String, required: true }],
  goals: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);

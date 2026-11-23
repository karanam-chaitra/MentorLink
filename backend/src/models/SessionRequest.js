const mongoose = require('mongoose');

const sessionRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  topic: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED'],
    default: 'PENDING'
  },
  scheduledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SessionRequest', sessionRequestSchema);

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // Format: "09:00"
    required: true
  },
  endTime: {
    type: String, // Format: "10:00"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  visitNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for preventing double booking
appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

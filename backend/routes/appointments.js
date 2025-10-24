const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const router = express.Router();

// Create appointment (patients only)
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    // Validate doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check for conflicting appointments (double booking prevention)
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'This time slot is not available' });
    }

    const appointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      reason,
      status: 'pending'
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get appointments for current user
router.get('/my-appointments', authenticate, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.userId;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.userId;
    }

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone dob gender medicalHistory')
      .populate('doctorId', 'name email specialization')
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone dob gender medicalHistory')
      .populate('doctorId', 'name email specialization');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    const isAuthorized =
      req.user.userId === appointment.patientId._id.toString() ||
      req.user.userId === appointment.doctorId._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment status (doctor only)
router.put('/:id/status', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization');

    res.json({
      message: 'Appointment status updated',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Add visit notes (doctor only)
router.put('/:id/notes', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { visitNotes } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.visitNotes = visitNotes;
    await appointment.save();

    res.json({
      message: 'Visit notes added successfully',
      appointment
    });
  } catch (error) {
    console.error('Add visit notes error:', error);
    res.status(500).json({ error: 'Failed to add visit notes' });
  }
});

// Cancel appointment (patient or doctor)
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    if (req.user.role === 'patient') {
      query.patientId = req.user.userId;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.userId;
    }

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Get all appointments (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialization')
      .sort({ date: -1, startTime: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

module.exports = router;

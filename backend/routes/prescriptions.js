const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Create prescription (doctor only)
router.post('/', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { appointmentId, medications, notes } = req.body;

    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({ error: 'Prescription already exists for this appointment' });
    }

    const prescription = new Prescription({
      appointmentId,
      doctorId: req.user.userId,
      patientId: appointment.patientId,
      medications,
      notes
    });

    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email dob gender')
      .populate('appointmentId');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: populatedPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Get prescriptions for current user
router.get('/my-prescriptions', authenticate, async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.userId;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.userId;
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email dob gender')
      .populate('appointmentId')
      .sort({ issuedAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get prescription by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name email specialization licenseNumber')
      .populate('patientId', 'name email dob gender phone address')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check authorization
    const isAuthorized =
      req.user.userId === prescription.patientId._id.toString() ||
      req.user.userId === prescription.doctorId._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Update prescription (doctor only)
router.put('/:id', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { medications, notes } = req.body;

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.user.userId
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (medications) prescription.medications = medications;
    if (notes !== undefined) prescription.notes = notes;

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email dob gender')
      .populate('appointmentId');

    res.json({
      message: 'Prescription updated successfully',
      prescription: updatedPrescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

// Get all prescriptions (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('doctorId', 'name email specialization')
      .populate('patientId', 'name email')
      .populate('appointmentId')
      .sort({ issuedAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get all prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

module.exports = router;

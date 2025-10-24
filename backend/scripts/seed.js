require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ehr_system';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    console.log('Cleared existing data');

    // Create password hash
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Admin
    const admin = await User.create({
      role: 'admin',
      name: 'Admin User',
      email: 'admin@hospital.com',
      passwordHash,
      phone: '+1234567890',
      dob: new Date('1980-01-01'),
      gender: 'other'
    });

    // Create Doctors
    const doctors = await User.create([
      {
        role: 'doctor',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        passwordHash,
        phone: '+1234567891',
        dob: new Date('1975-05-15'),
        gender: 'female',
        specialization: 'Cardiology',
        licenseNumber: 'MD-12345',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
        ]
      },
      {
        role: 'doctor',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        passwordHash,
        phone: '+1234567892',
        dob: new Date('1978-08-22'),
        gender: 'male',
        specialization: 'Orthopedics',
        licenseNumber: 'MD-12346',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }
        ]
      },
      {
        role: 'doctor',
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@hospital.com',
        passwordHash,
        phone: '+1234567893',
        dob: new Date('1982-03-10'),
        gender: 'female',
        specialization: 'Pediatrics',
        licenseNumber: 'MD-12347',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' }
        ]
      },
      {
        role: 'doctor',
        name: 'Dr. David Williams',
        email: 'david.williams@hospital.com',
        passwordHash,
        phone: '+1234567894',
        dob: new Date('1970-11-30'),
        gender: 'male',
        specialization: 'Dermatology',
        licenseNumber: 'MD-12348',
        availabilitySlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }
        ]
      }
    ]);

    // Create Patients
    const patients = await User.create([
      {
        role: 'patient',
        name: 'John Smith',
        email: 'john.smith@email.com',
        passwordHash,
        phone: '+1234567895',
        dob: new Date('1990-06-15'),
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        medicalHistory: 'No known allergies. Hypertension diagnosed in 2020.'
      },
      {
        role: 'patient',
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        passwordHash,
        phone: '+1234567896',
        dob: new Date('1985-09-20'),
        gender: 'female',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        },
        medicalHistory: 'Allergic to penicillin. Asthma since childhood.'
      },
      {
        role: 'patient',
        name: 'Robert Brown',
        email: 'robert.brown@email.com',
        passwordHash,
        phone: '+1234567897',
        dob: new Date('1995-12-05'),
        gender: 'male',
        address: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        medicalHistory: 'Type 2 diabetes. Currently on medication.'
      },
      {
        role: 'patient',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        passwordHash,
        phone: '+1234567898',
        dob: new Date('1988-04-18'),
        gender: 'female',
        address: {
          street: '321 Elm St',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'USA'
        },
        medicalHistory: 'Previous surgery for appendicitis in 2015.'
      }
    ]);

    console.log('Created users');

    // Create Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.create([
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed',
        reason: 'Regular checkup for hypertension',
        notes: 'Patient requested morning appointment'
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[2]._id,
        date: nextWeek,
        startTime: '14:00',
        endTime: '15:00',
        status: 'pending',
        reason: 'Asthma review and prescription refill',
        notes: ''
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[1]._id,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
        startTime: '11:00',
        endTime: '12:00',
        status: 'completed',
        reason: 'Knee pain evaluation',
        notes: 'Follow-up in 2 weeks',
        visitNotes: 'Patient experiencing mild knee pain. Recommended physical therapy and prescribed pain medication.'
      },
      {
        patientId: patients[3]._id,
        doctorId: doctors[3]._id,
        date: nextWeek,
        startTime: '15:00',
        endTime: '16:00',
        status: 'confirmed',
        reason: 'Skin rash consultation',
        notes: ''
      }
    ]);

    console.log('Created appointments');

    // Create Prescription for completed appointment
    const prescription = await Prescription.create({
      appointmentId: appointments[2]._id,
      doctorId: doctors[1]._id,
      patientId: patients[2]._id,
      medications: [
        {
          name: 'Ibuprofen',
          dose: '400mg',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Take with food'
        },
        {
          name: 'Physical Therapy',
          dose: 'N/A',
          frequency: '3 times per week',
          duration: '4 weeks',
          instructions: 'Refer to PT specialist'
        }
      ],
      notes: 'Follow up in 2 weeks. If pain persists, consider MRI.'
    });

    console.log('Created prescription');

    console.log('\n=== Seed Data Summary ===');
    console.log(`Admin: ${admin.email} / password123`);
    console.log('\nDoctors:');
    doctors.forEach(doc => console.log(`  ${doc.name} (${doc.specialization}): ${doc.email} / password123`));
    console.log('\nPatients:');
    patients.forEach(pat => console.log(`  ${pat.name}: ${pat.email} / password123`));
    console.log(`\nCreated ${appointments.length} appointments`);
    console.log(`Created ${1} prescription`);
    console.log('\n=========================\n');

    await mongoose.connection.close();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

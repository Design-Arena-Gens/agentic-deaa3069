# Electronic Health Record (EHR) System

A full-stack Electronic Health Record system built with Next.js, Express.js, and MongoDB.

## Features

### For Patients
- Book appointments with doctors
- View appointment history
- Access and download prescriptions as PDF
- Manage personal profile and medical history

### For Doctors
- View and manage appointment schedule
- Access patient medical history
- Issue prescriptions
- Add visit notes
- Accept/confirm/complete appointments

### Security
- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Password hashing with bcrypt

## Tech Stack

**Frontend:**
- Next.js 15 with TypeScript
- Tailwind CSS
- Axios for API calls
- jsPDF for prescription downloads
- date-fns for date formatting

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Project Structure

```
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Seed script
│   └── server.js        # Express server
│
└── frontend/
    ├── app/             # Next.js app directory
    ├── components/      # React components
    └── lib/             # API utilities and auth helpers
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ehr_system
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. Seed the database with demo data:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm start
```

Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Demo Accounts

After seeding the database, use these accounts to login:

**Patient:**
- Email: john.smith@email.com
- Password: password123

**Doctor:**
- Email: sarah.johnson@hospital.com
- Password: password123

**Admin:**
- Email: admin@hospital.com
- Password: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/doctors/:id` - Get doctor by ID

### Appointments
- `POST /api/appointments` - Create appointment (Patient)
- `GET /api/appointments/my-appointments` - Get user's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status (Doctor)
- `PUT /api/appointments/:id/notes` - Add visit notes (Doctor)
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Prescriptions
- `POST /api/prescriptions` - Create prescription (Doctor)
- `GET /api/prescriptions/my-prescriptions` - Get user's prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `PUT /api/prescriptions/:id` - Update prescription (Doctor)

## Database Models

### User
- role: patient | doctor | admin
- name, email, passwordHash, phone
- dob, gender, address
- medicalHistory (patients)
- specialization, licenseNumber, availabilitySlots (doctors)

### Appointment
- patientId, doctorId
- date, startTime, endTime
- status: pending | confirmed | completed | cancelled
- reason, notes, visitNotes

### Prescription
- appointmentId, doctorId, patientId
- medications: [{ name, dose, frequency, duration, instructions }]
- notes, issuedAt

## Features Implemented

✅ User authentication with JWT
✅ Role-based access control
✅ Patient dashboard with appointment management
✅ Doctor dashboard with schedule management
✅ Appointment booking with conflict prevention
✅ Prescription creation and management
✅ PDF download for prescriptions
✅ Profile management
✅ Medical history tracking
✅ Responsive UI with professional hospital theme
✅ Seed script with demo data

## License

MIT
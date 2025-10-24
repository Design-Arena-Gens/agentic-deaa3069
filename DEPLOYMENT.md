# Deployment Information

## Live Application

**URL:** https://agentic-deaa3069.vercel.app

## Application Overview

This is a full-stack Electronic Health Record (EHR) System with the following features:

### Patient Portal
- Login/Register
- Book appointments with doctors
- View appointment history
- Access prescriptions and download as PDF
- Manage profile and medical history

### Doctor Portal
- View and manage appointment schedule
- Access patient information
- Issue prescriptions
- Add visit notes
- Manage appointment statuses

## Demo Accounts

### Patient Account
- **Email:** john.smith@email.com
- **Password:** password123

### Doctor Account
- **Email:** sarah.johnson@hospital.com
- **Password:** password123

### Admin Account
- **Email:** admin@hospital.com
- **Password:** password123

## Important Notes

⚠️ **Backend Not Deployed**: The frontend is deployed on Vercel, but the backend requires a separate deployment with MongoDB. For full functionality:

1. Deploy the backend to a service like Railway, Render, or Heroku
2. Set up MongoDB Atlas or other MongoDB hosting
3. Update `NEXT_PUBLIC_API_URL` in frontend environment variables to point to the deployed backend

## Current Status

✅ Frontend deployed and accessible
❌ Backend requires separate deployment
❌ Database requires setup

## Tech Stack

- **Frontend:** Next.js 15 with TypeScript, Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt

## Features

- Professional hospital-themed UI (blue and white)
- Responsive design
- Role-based access control
- JWT authentication
- PDF prescription download
- Appointment booking with conflict prevention
- Medical history management

## To Complete Deployment

1. Deploy backend to cloud service
2. Set up MongoDB database
3. Configure environment variables
4. Update frontend API URL
5. Run seed script for demo data

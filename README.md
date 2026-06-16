# Ayurda Clinics

A full-stack clinic management system built with React, Node.js, Express, and MySQL.

## Features

### Patient Features

* User Registration & Login
* Browse Doctors
* View Services
* Book Appointments
* Receive Email Notifications
* View FAQs and Testimonials

### Admin Features

* Admin Authentication
* Manage Doctors
* Manage Services
* Manage FAQs
* Manage Testimonials
* View Registered Patients
* Manage Appointments

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* JWT Authentication
* Nodemailer

### Database

* MySQL (Railway)

### Deployment

* Frontend: Render
* Backend: Render
* Database: Railway

## Project Structure

```text
ayurda-clinics/
├── frontend/
├── backend/
├── README.md
├── render.yaml
└── DEPLOYMENT.md
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd ayurda-clinics
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend folder and configure:

```env
PORT=
MYSQLHOST=
MYSQLPORT=
MYSQLUSER=
MYSQLPASSWORD=
MYSQLDATABASE=
JWT_SECRET=
SMTP_USER=
SMTP_PASS=
```

## Admin Panel

Admin routes are available under:

```text
/admin/login
/admin/dashboard
```

## Deployment

Refer to `DEPLOYMENT.md` for complete deployment instructions.

## Author

Raja Kumar

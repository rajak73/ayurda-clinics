# Implementation Plan - Phase 6: Patient Authentication and Dashboard Module

This plan details the implementation of user registration, login, profile management, appointment associations, and navigation links for patients.

## Proposed Changes

### 1. Database Component
We will modify the database schema inside [dbInit.js](file:///Users/rajakumar/ayurda-clinics/backend/dbInit.js) to support authenticated patients:
- **`users` Table**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `name` VARCHAR(255) NOT NULL
  - `email` VARCHAR(255) UNIQUE NOT NULL
  - `phone` VARCHAR(50) NOT NULL
  - `password` VARCHAR(255) NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **`appointments` Table**:
  - Add `user_id` INT NULL
  - Add FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL

---

### 2. Backend Component

#### [NEW] [patientAuthMiddleware.js](file:///Users/rajakumar/ayurda-clinics/backend/middleware/patientAuthMiddleware.js)
JWT verification specifically for patients:
- Extracts token from `Authorization` header.
- Verifies using `process.env.JWT_SECRET`.
- Attaches the decoded payload (`req.user = { id: userId, email: userEmail }`) to the request object.

#### [NEW] [userController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/userController.js)
CRUD and auth handlers for patients:
- `register`: Registers a user, hashes password with `bcryptjs`.
- `login`: Validates password, signs JWT token containing user details.
- `getProfile`: Returns current profile details of the authenticated patient.
- `updateProfile`: Updates name, phone, and email of the authenticated patient.
- `changePassword`: Compares old password and hashes new password for the authenticated patient.
- `getAppointments`: Fetches appointments linked to the logged-in patient's `user_id`, split into upcoming and past categories.

#### [NEW] [userRoutes.js](file:///Users/rajakumar/ayurda-clinics/backend/routes/userRoutes.js)
Register endpoints:
- `POST /api/users/register` (Public)
- `POST /api/users/login` (Public)
- `GET /api/users/profile` (Protected)
- `PUT /api/users/profile` (Protected)
- `PUT /api/users/password` (Protected)
- `GET /api/users/appointments` (Protected)

#### [MODIFY] [appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js)
- Update `createAppointment` to check if a `user_id` is supplied in the request body (optional for guest checkout, but automatically supplied if logged in) and saves it in the database.

#### [MODIFY] [server.js](file:///Users/rajakumar/ayurda-clinics/backend/server.js)
- Mount `userRoutes` under `/api/users`.

---

### 3. Frontend Component

#### [NEW] [Login.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Login.jsx) & [Signup.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Signup.jsx)
- Authentication pages for patient login and registration, with form validations.
- Stores JWT token in `localStorage` under `patientToken`.

#### [NEW] [PatientDashboard.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/PatientDashboard.jsx)
- Sleek and modern patient dashboard containing:
  - **Appointments tab**: Lists upcoming and past appointments with status badges (Confirmed, Pending, Completed) and payment details (Paid, Unpaid).
  - **Pay button**: Allows patients to complete payments directly from the dashboard for unpaid appointments!
  - **Profile tab**: Allows editing personal information and updating passwords.

#### [MODIFY] [Navbar.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/components/Navbar.jsx)
- Update navbar dynamically:
  - If a patient is logged in: Hide "Login" & "Signup", show "Dashboard" and "Logout".
  - Else: Show "Login" and "Signup".

#### [MODIFY] [Contact.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Contact.jsx)
- If the patient is logged in, automatically pre-fill their name, phone, and email in the appointment form and pass their `user_id` when submitting the inquiry.

#### [MODIFY] [App.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/App.jsx)
- Register the new routes `/login`, `/signup`, and `/dashboard` (protected).

---

## 🚀 Verification Plan

### Manual Verification
1. Register a new patient account (`/signup`).
2. Log in using the registered credentials (`/login`).
3. Book an appointment from the **Contact** page (confirming name/phone pre-fill).
4. Perform checkouts via the Razorpay simulation.
5. Go to the **Patient Dashboard** (`/dashboard`) and verify:
   - Profile details can be updated.
   - The booking shows up in the Appointments list.
   - The payment history lists the transaction correctly.
6. Verify logging out destroys session tokens.

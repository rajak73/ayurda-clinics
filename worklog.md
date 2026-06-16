# Worklog - Ayurda Clinics Website

## Phase 2: Update Worklog

### Task:
Implemented Razorpay Payment Gateway integration for online appointment booking, including payment order creation, payment verification, transaction handling, and appointment-payment workflow.

### Learning Points / Action Items:
Learned payment gateway integration using Razorpay APIs, secure payment verification, backend order creation, transaction status handling, and frontend payment flow implementation.
*Action Item*: Test successful and failed payment scenarios and add payment analytics to admin dashboard.

## Phase 3: Patient Authentication and Dashboard Module

### Task:
Implemented the Patient Authentication and Dashboard module. Set up patient registration (with bcrypt password hashing), login (JWT token validation), session state listeners, dynamic header navigation links, and a dedicated Patient Dashboard showing booking records, unpaid checkout re-initiation, profile editor, and password modification panel.

### Learning Points / Action Items:
- Developed clean MVC patterns for user authorization, bcrypt password hashing, and JWT token allocation.
- Synchronized login state across components dynamically by dispatching custom storage events on login/logout events.
- Implemented client-side protected route checks (`PatientProtectedRoute`) to verify token presence before accessing patient panels.
- Prefilled appointment fields (name, phone, email) automatically from the patient context, establishing direct relational mapping via `user_id` inside the MySQL query execution.
*Action Item*: Run end-to-end integration tests on registration, login, prefilled bookings, and dashboard payment history updates.

## Phase 4: Resolution of 500 Internal Server Error & Database Mapping

### Root Cause of 500 Error:
The backend returned a `500 (Internal Server Error)` on booking submission because the query targeted `name` instead of the database column `patient_name`, and it did not account for the `email` column, leading to a SQL syntax/mapping failure. Furthermore, the Razorpay order creator was trying to read `appointment.name` which resulted in an error when the database column was actually `patient_name`.

### Fix Applied:
1. **Database Schema Update**: Configured [dbInit.js](file:///Users/rajakumar/ayurda-clinics/backend/dbInit.js) to dynamically rename legacy `name` column to `patient_name`, add `email`, and safely append key indices.
2. **Backend Controller Correction**: Rewrote the SQL query inside [appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js) to target `patient_name` and `email` columns.
3. **Property Aliasing (Compatibility)**: Configured the controller response handlers in [appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js) and [userController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/userController.js) to map the database `patient_name` property to `.name` in the JSON response, ensuring backward compatibility with frontend pages.
4. **Razorpay Controller Update**: Updated [paymentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/paymentController.js) to safely fallback to `patient_name` and use the database stored email.

### Files Modified:
- [dbInit.js](file:///Users/rajakumar/ayurda-clinics/backend/dbInit.js)
- [appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js)
- [userController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/userController.js)
- [paymentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/paymentController.js)
- [worklog.md](file:///Users/rajakumar/ayurda-clinics/worklog.md)

### Testing Steps:
1. Start the backend app and verify database migration and alterations log output.
2. Open the Contact form, fill in details, and press submit.
3. Validate that mock Razorpay checkout executes and returns success without 500 queries.
4. Verify bookings load successfully in Admin Dashboard and Patient Dashboard.

## Phase 5: Enforced User Existence Validation & Stale Session Protection

### Root Cause of FK Violation (`user_id = 2`):
- **Origin of ID**: When the database was reset/reseeded during development, the `users` table records were cleared, leaving only a user with `id = 1`.
- **Browser State**: The browser client retained a legacy session in `localStorage`. The client's keys are named **`patientToken`** and **`patientUser`** (not `token` or `userId`). Because the browser console query targeted `token` and `userId`, they returned `null`. However, `patientToken` remained active and was sent in the `Authorization: Bearer <token>` header of frontend API calls.
- **Decoding**: The backend middleware decoded the token payload, resolving `req.user.id` to the stale value of `2`. Since user `2` does not exist in the current database, inserting into `appointments` triggered the foreign key violation.

### Fix Applied:
1. **Debug Logs**: Added temporary console logs to [appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js) (lines 5-7) to print `req.body`, `req.user`, and resolved `user_id` inside the terminal.
2. **Session Verification**: Securely queries the database in `createAppointment` to verify the user exists before running `INSERT`.
3. **Session Purge**: Updated the catch handler in [Contact.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Contact.jsx) to listen to `401` status responses, purge `patientToken`/`patientUser` from storage, and redirect the client to `/login?redirect=contact`.

### Files Modified:
- **[appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js)** (Lines 5-7, 20-35)
- **[Contact.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Contact.jsx)** (Catch handler)
- **[worklog.md](file:///Users/rajakumar/ayurda-clinics/worklog.md)**

### Testing Steps:
1. Run `localStorage.removeItem("patientToken")` and `localStorage.removeItem("patientUser")` in the browser console.
2. Log in again to obtain a token signed with `id = 1`.
3. Fill the appointment form on `/contact` and submit to verify it books successfully with `user_id = 1`.

## Phase 6: Admin and Patient Role Isolation & Token Separation

### Root Cause of Override:
- **Token Priority Overlap**: The Axios `api.js` request interceptor globally prioritized `adminToken` if present in localStorage. When an admin was logged in, any API request carried the admin token as the bearer, even for public/patient endpoints like `/appointments`.
- **Role Sharing**: The backend signed both admin and patient JWT tokens without role claims, using the same secret key. Consequently, the patient validation middleware successfully verified and decoded the admin token payload, mapping the admin's database ID (`req.user.id = 2`) to the booking, leading to a foreign key constraint violation.

### Fix Applied:
1. **JWT Role Claims**:
   - Added `role: "admin"` in [adminController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/adminController.js) (Line 48).
   - Added `role: "patient"` in [userController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/userController.js) (Lines 46, 114) during registration and login.
2. **Access Control Verification**:
   - Refactored [authMiddleware.js](file:///Users/rajakumar/ayurda-clinics/backend/middleware/authMiddleware.js) (Lines 17-24) to assert `role === "admin"`.
   - Refactored [patientAuthMiddleware.js](file:///Users/rajakumar/ayurda-clinics/backend/middleware/patientAuthMiddleware.js) (Lines 18-25) to assert `role === "patient"`.
3. **Frontend Token Resolution Interceptor**:
   - Updated [api.js](file:///Users/rajakumar/ayurda-clinics/frontend/src/utils/api.js) (Lines 12-25) request interceptor to check the target path and prioritize `patientToken` for patient endpoints (`/appointments`, `/payments`, `/users`).
4. **Cleanup**: Removed the debug logs inside `appointmentController.js`.

### Files Modified:
- [adminController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/adminController.js)
- [userController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/userController.js)
- [authMiddleware.js](file:///Users/rajakumar/ayurda-clinics/backend/middleware/authMiddleware.js)
- [patientAuthMiddleware.js](file:///Users/rajakumar/ayurda-clinics/backend/middleware/patientAuthMiddleware.js)
- [api.js](file:///Users/rajakumar/ayurda-clinics/frontend/src/utils/api.js)
- [appointmentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/appointmentController.js)
- [worklog.md](file:///Users/rajakumar/ayurda-clinics/worklog.md)

### Testing Steps:
1. Log in to the Admin Dashboard (creates `adminToken` in localStorage).
2. Log in as a patient on the patient portal (creates `patientToken` in localStorage).
3. Book an appointment from the Contact page and verify it successfully routes with `user_id = 1` (patient) instead of mapping the admin context.





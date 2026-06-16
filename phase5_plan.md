# Implementation Plan - Phase 5: Payments, Notifications & Security

This plan outlines the architecture, database changes, and APIs required to integrate Razorpay online payment verification, configure email/WhatsApp notification dispatchers, and finalize production-ready administrative access settings.

---

## 🛠️ Proposed Changes

### 1. Database Component
We will extend the `appointments` schema to track payment transactions:
- Modify `appointments` table:
  - Add `consultation_fee` DECIMAL(10,2) DEFAULT 0.00
  - Add `payment_status` VARCHAR(50) DEFAULT 'Unpaid' (e.g. Unpaid, Paid, Failed)
  - Add `razorpay_order_id` VARCHAR(255) NULL
  - Add `razorpay_payment_id` VARCHAR(255) NULL
  - Add `razorpay_signature` VARCHAR(255) NULL
- We will add columns to the `admins` table for multi-factor configurations if needed in the future.

---

### 2. Backend Component

#### [NEW] [paymentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/paymentController.js)
CRUD and signature verification for Razorpay:
- `createOrder`: Creates a Razorpay order via the Razorpay Node SDK using a standard consultation fee (e.g., ₹500). Saves `razorpay_order_id` in the database.
- `verifyPayment`: Verifies the payment signature using `crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)` matching `razorpay_order_id + "|" + razorpay_payment_id` against the signature. Updates appointment `payment_status` to `'Paid'`.

#### [NEW] [paymentRoutes.js](file:///Users/rajakumar/ayurda-clinics/backend/routes/paymentRoutes.js)
Expose routes for orders and validation:
- `POST /api/payments/order` (public - triggers at appointment book request)
- `POST /api/payments/verify` (public - validates signature)

#### [NEW] [notificationHelper.js](file:///Users/rajakumar/ayurda-clinics/backend/utils/notificationHelper.js)
Define dispatcher functions:
- `sendEmailNotification(to, subject, body)`: Sends email confirmations using `nodemailer`.
- `sendWhatsAppNotification(phone, message)`: Sends WhatsApp updates using Twilio WhatsApp API.

#### [MODIFY] [server.js](file:///Users/rajakumar/ayurda-clinics/backend/server.js)
- Install `razorpay`, `nodemailer`, and `twilio` dependencies.
- Mount `/api/payments` routes.

---

### 3. Frontend Component

#### [MODIFY] [Contact.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Contact.jsx)
- Import Razorpay Checkout script dynamically or in `index.html`.
- Upon successful validation and submission of the appointment form, fetch `/api/payments/order` to get the order ID, launch the Razorpay Checkout modal, and on payment success call `/api/payments/verify` before redirecting to the booking confirmation page.

#### [MODIFY] [AdminDashboard.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/AdminDashboard.jsx)
- Display `Payment Status` ("Paid" / "Unpaid") in the Appointments list table.
- Display the Razorpay Transaction ID in the View Details modal of each appointment inquiry.

---

## 🚀 Verification Plan

### Automated Tests
- Test payment verification payload using Postman/curl requests.
- Verify payment signature match logic returns success status code.

### Manual Verification
- Test appointment checkout using Razorpay Test Mode credit card/UPI details.
- Verify appointment inquiry gets logged with status `'Paid'` in the admin dashboard.
- Verify confirmation email gets sent to the test email address.

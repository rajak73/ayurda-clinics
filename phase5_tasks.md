# Tasks - Phase 5: Razorpay, Notifications & Security

- [x] **Database Setup & Schema Extensions**
  - [x] Add payment fields (`consultation_fee`, `payment_status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) to the `appointments` table in `dbInit.js`
  - [x] Add check-and-alter migrations to `dbInit.js` to automatically apply columns to existing tables

- [x] **Backend Payment Integration (Razorpay)**
  - [x] Implement `paymentController.js` with `createOrder` and `verifyPayment` (HMAC signature verification)
  - [x] Implement `paymentRoutes.js` and mount it under `/api/payments` in `server.js`

- [x] **Backend Notifications Setup**
  - [x] Implement `notificationHelper.js` with `sendEmailNotification` (Nodemailer) and `sendWhatsAppNotification` (Twilio)
  - [x] Trigger email/WhatsApp alerts on appointment booking success and status updates in `appointmentController.js` and `paymentController.js`

- [x] **Frontend Checkout Integration**
  - [x] Integrate Razorpay script in index.html (Handled dynamically on checkout mount in Contact.jsx)
  - [x] Modify `Contact.jsx` booking logic: request Razorpay order ID, launch Checkout modal, and verify signature on success (Includes fallback simulator for developer mode)
  - [x] Update `AdminDashboard.jsx` to render payment status and Razorpay transaction IDs

- [x] **Verification & Polishing**
  - [x] Verify all file uploads and static routing works correctly
  - [x] Test end-to-end CRUD on all content types
  - [x] Prepare walkthrough documentation

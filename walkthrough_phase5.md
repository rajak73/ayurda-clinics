# Walkthrough - Phase 5: Razorpay, Notifications & Security

I have completed the Phase 5 implementation. The system now supports secure Razorpay checkout, automated email/WhatsApp alerts, database payment records tracking, and fully clean credentials login fields.

---

## 🛠️ Enhancements Added

### 1. Database Payment Schema Alterations
- Extended the `appointments` table schema dynamically on backend startup via [dbInit.js](file:///Users/rajakumar/ayurda-clinics/backend/dbInit.js) to store:
  - `consultation_fee` (defaults to `500.00`)
  - `payment_status` (defaults to `'Unpaid'`)
  - `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` transaction hashes.

### 2. Backend Payment & Verification API
- Created [paymentController.js](file:///Users/rajakumar/ayurda-clinics/backend/controllers/paymentController.js) and [paymentRoutes.js](file:///Users/rajakumar/ayurda-clinics/backend/routes/paymentRoutes.js).
- Handles HMAC signature verification:
  `sha256(order_id + "|" + payment_id, key_secret)` matching against `signature` to prevent client-side payment spoofing.
- Registered endpoints:
  - `POST /api/payments/order`
  - `POST /api/payments/verify`

### 3. Automated WhatsApp & Email Notifications
- Created [notificationHelper.js](file:///Users/rajakumar/ayurda-clinics/backend/utils/notificationHelper.js).
- Utilizes `nodemailer` (for SMTP emails) and `twilio` (for sandbox WhatsApp templates).
- Automatically dispatches HTML receipt summaries to patients and sends confirmations once verification succeeds.

### 4. Frontend Payments & Developer Simulator Mode
- Rewrote `handleSubmit` in [Contact.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/Contact.jsx) to load `checkout.js` dynamically and open the Razorpay Checkout form.
- **Smart Fallback (Developer Sandbox Mode)**: If Razorpay credentials are not yet entered in `.env`, the page displays a developer dialog box asking if you want to simulate a successful payment. This guarantees you can test the database updating and email dispatch flow without active production API keys.
- Modified the Appointments table and patient details view modal in [AdminDashboard.jsx](file:///Users/rajakumar/ayurda-clinics/frontend/src/pages/AdminDashboard.jsx) to render payment status badges and transaction IDs.

---

## 🚀 How to Verify

### 1. Backend Credentials Setup (`.env`)
Make sure your backend `.env` has the following variables (add dummy values to test the fallbacks, or actual values to run a live test):

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx

# Nodemailer SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Twilio WhatsApp Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 2. Launch Dev Servers
1. Open a terminal in `/backend` and install dependencies:
   ```bash
   npm install
   ```
2. Start backend server:
   ```bash
   npm run dev
   ```
3. Open a terminal in `/frontend` and run:
   ```bash
   npm run dev
   ```

### 3. Test Booking & Payment Flow
1. Go to the **Contact** page.
2. Fill out the booking form and select a date/time, then click **Submit Inquiry**.
3. **Mock Mode Simulation**:
   - If keys are not configured, click **OK** in the developer alert box to confirm.
   - It will update the database, mark the transaction paid, and trigger emails.
4. **Razorpay Live mode**:
   - If keys are set, it will slide open the official Razorpay Checkout overlay.
   - Choose Netbanking / UPI in Test Mode to complete checkout successfully.
5. Log in to `/admin-login` and check the **Appointments** tab to inspect the Paid status badge and Transaction ID inside the detail modal.

const crypto = require("crypto");
const db = require("../db");
const { sendEmail, sendWhatsApp } = require("../utils/notificationHelper");

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  const { appointmentId } = req.body;

  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "Appointment ID is required",
    });
  }

  try {
    const promiseDb = db.promise();
    
    // Fetch appointment details
    const [appointments] = await promiseDb.query(
      "SELECT * FROM appointments WHERE id = ?",
      [appointmentId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointment = appointments[0];
    const consultFee = 500.00; // Standard consultation fee: ₹500

    // Check if keys are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay credentials not set in .env. Falling back to Mock Order Mode.");
      
      const mockOrderId = `mock_order_${Date.now()}_${appointmentId}`;
      
      // Update appointment with mock details
      await promiseDb.query(
        "UPDATE appointments SET razorpay_order_id = ?, consultation_fee = ? WHERE id = ?",
        [mockOrderId, consultFee, appointmentId]
      );

      return res.json({
        success: true,
        isMockMode: true,
        orderId: mockOrderId,
        amount: consultFee * 100, // paise
        currency: "INR",
        key: "mock_key_id",
        patientDetails: {
          name: appointment.patient_name || appointment.name || "",
          phone: appointment.phone,
          email: appointment.email || `${(appointment.patient_name || appointment.name || "").toLowerCase().replace(/\s+/g, "")}@example.com`,
        }
      });
    }

    // Load Razorpay dynamically so backend doesn't crash on startup if not fully installed yet
    const Razorpay = require("razorpay");
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: consultFee * 100, // in paise (₹500.00 = 50000 paise)
      currency: "INR",
      receipt: `receipt_appt_${appointmentId}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save order ID to database
    await promiseDb.query(
      "UPDATE appointments SET razorpay_order_id = ?, consultation_fee = ? WHERE id = ?",
      [order.id, consultFee, appointmentId]
    );

    res.json({
      success: true,
      isMockMode: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      patientDetails: {
        name: appointment.patient_name || appointment.name || "",
        phone: appointment.phone,
        email: appointment.email || `${(appointment.patient_name || appointment.name || "").toLowerCase().replace(/\s+/g, "")}@example.com`,
      }
    });

  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment order",
      error: error.message,
    });
  }
};

// Verify Signature and Confirm Appointment Payment
exports.verifyPayment = async (req, res) => {
  const {
    appointmentId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    isMockPayment
  } = req.body;

  if (!appointmentId || !razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({
      success: false,
      message: "Missing verification details",
    });
  }

  try {
    const promiseDb = db.promise();

    // 1. Signature Verification
    if (isMockPayment) {
      console.log("Mock payment verified for order:", razorpay_order_id);
    } else {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          message: "Payment configuration missing on server",
        });
      }

      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature verification failed",
        });
      }
    }

    // 2. Update Database status to Paid
    await promiseDb.query(
      `UPDATE appointments SET 
        payment_status = 'Paid', 
        status = 'Confirmed', -- Confirm automatically upon successful payment
        razorpay_payment_id = ?, 
        razorpay_signature = ?
      WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature || "mock_sig", appointmentId]
    );

    // Fetch updated appointment details for notifications
    const [appointments] = await promiseDb.query(
      "SELECT * FROM appointments WHERE id = ?",
      [appointmentId]
    );

    if (appointments.length > 0) {
      const appt = {
        ...appointments[0],
        name: appointments[0].patient_name || appointments[0].name || "",
        email: appointments[0].email || `${(appointments[0].patient_name || appointments[0].name || "").toLowerCase().replace(/\s+/g, "")}@example.com`,
      };
      
      // Send Email Notification
      const emailSubject = `Appointment Confirmed - Ayurda Clinics`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0f766e; text-align: center;">Ayurda Clinics Booking Confirmation</h2>
          <p>Dear <strong>${appt.name}</strong>,</p>
          <p>Thank you for booking with us. Your appointment inquiry has been paid and confirmed successfully!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Department:</strong></td>
              <td style="padding: 8px 0;">${appt.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Preferred Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(appt.preferred_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Preferred Session:</strong></td>
              <td style="padding: 8px 0;">${appt.preferred_time || "Not selected"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Payment Status:</strong></td>
              <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">Paid (₹500.00)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #718096;"><strong>Transaction ID:</strong></td>
              <td style="padding: 8px 0; font-family: monospace;">${razorpay_payment_id}</td>
            </tr>
          </table>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="text-align: center; color: #718096; font-size: 12px;">This is an automated confirmation email. For any queries, call us at 7799889398.</p>
        </div>
      `;

      await sendEmail(
        appt.email,
        emailSubject,
        emailBody
      );

      // Send WhatsApp Notification
      const whatsappMsg = `Hi ${appt.name}, your Ayurda Clinics appointment for ${appt.department} on ${new Date(appt.preferred_date).toLocaleDateString()} (${appt.preferred_time || "Anytime"}) is CONFIRMED. Payment of ₹500 is successfully verified. Txn ID: ${razorpay_payment_id}. Thank you!`;
      await sendWhatsApp(appt.phone, whatsappMsg);
    }

    res.json({
      success: true,
      message: "Payment verified and appointment confirmed successfully",
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

/**
 * notificationService.js
 * Centralised notification service for Ayurda Clinics.
 *
 * Exposes:
 *  - sendEmail({ to, subject, html })            → Nodemailer via Gmail SMTP
 *  - sendWhatsApp({ to, body })                  → Twilio WhatsApp API
 *  - logNotification({ userId, type, event, status, errorMessage }) → notification_logs DB table
 *
 * All methods are fire-and-forget safe:
 *  They never throw — errors are caught and logged to console only.
 */

"use strict";

const nodemailer = require("nodemailer");
const db = require("../db");

// ─── NODEMAILER TRANSPORTER ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,        // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── TWILIO CLIENT (lazy init so missing creds don't crash the server) ─────────
let twilioClient = null;

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  // Only initialise if real credentials are present (not placeholder)
  if (!sid || !token || sid.startsWith("PLACEHOLDER") || token.startsWith("PLACEHOLDER")) {
    return null;
  }

  try {
    const twilio = require("twilio");
    twilioClient = twilio(sid, token);
    return twilioClient;
  } catch (err) {
    console.error("[NotificationService] Twilio init error:", err.message);
    return null;
  }
};

// ─── LOG HELPER ───────────────────────────────────────────────────────────────
/**
 * Insert a row into notification_logs. Silently swallows DB errors.
 * @param {{ userId: number|null, type: string, event: string, status: string, errorMessage?: string }} param0
 */
const logNotification = async ({ userId = null, type, event, status, errorMessage = null }) => {
  try {
    await db.promise().query(
      `INSERT INTO notification_logs
        (user_id, notification_type, event_type, status, error_message)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, event, status, errorMessage ? errorMessage.slice(0, 500) : null]
    );
  } catch (dbErr) {
    console.error("[NotificationService] Failed to write to notification_logs:", dbErr.message);
  }
};

// ─── EMAIL SENDER ─────────────────────────────────────────────────────────────
/**
 * Send an HTML email. Returns true on success, false on failure.
 * @param {{ to: string, subject: string, html: string, userId?: number, eventType?: string }} param0
 */
const sendEmail = async ({ to, subject, html, userId = null, eventType = "General" }) => {
  try {
    // 1. Log the exact recipient email address before sendMail()
    console.log(`[Email Flow Debug] Recipient email BEFORE sendMail(): "${to}" (eventType: ${eventType})`);

    const mailOptions = {
      from: `"${process.env.CLINIC_NAME || "Ayurda Clinics"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // 2. Log info.accepted, info.rejected, info.response, and info.messageId after sendMail()
    console.log(`[Email Flow Debug] sendMail() completed successfully!`);
    console.log(`  - info.accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`  - info.rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`  - info.response: ${JSON.stringify(info.response)}`);
    console.log(`  - info.messageId: ${JSON.stringify(info.messageId)}`);

    console.log(`[Email] ✅ Sent to ${to} — ${subject}`);
    await logNotification({ userId, type: "Email", event: eventType, status: "Success" });
    return true;

  } catch (err) {
    console.error(`[Email Flow Debug] sendMail() error for recipient "${to}":`, err);
    console.error(`[Email] ❌ Failed to ${to} — ${err.message}`);
    await logNotification({ userId, type: "Email", event: eventType, status: "Failed", errorMessage: err.message });
    return false;
  }
};

// ─── WHATSAPP SENDER ──────────────────────────────────────────────────────────
/**
 * Send a WhatsApp message via Twilio. Returns true on success, false on failure.
 * Gracefully skips if Twilio credentials are not configured.
 * @param {{ to: string, body: string, userId?: number, eventType?: string }} param0
 */
const sendWhatsApp = async ({ to, body, userId = null, eventType = "General" }) => {
  const client = getTwilioClient();

  if (!client) {
    console.warn("[WhatsApp] Skipped — Twilio credentials not configured.");
    return false;
  }

  // Normalise the phone number: strip spaces/dashes, ensure E.164, prefix whatsapp:
  let normalised = String(to).replace(/[\s\-().]/g, "");
  if (!normalised.startsWith("+")) normalised = "+91" + normalised; // default India
  const waTo = normalised.startsWith("whatsapp:") ? normalised : `whatsapp:${normalised}`;
  const waFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  try {
    const message = await client.messages.create({ from: waFrom, to: waTo, body });
    console.log(`[WhatsApp] ✅ Sent to ${waTo} — SID: ${message.sid}`);
    await logNotification({ userId, type: "WhatsApp", event: eventType, status: "Success" });
    return true;

  } catch (err) {
    console.error(`[WhatsApp] ❌ Failed to ${waTo} — ${err.message}`);
    await logNotification({ userId, type: "WhatsApp", event: eventType, status: "Failed", errorMessage: err.message });
    return false;
  }
};

// ─── COMPOSITE NOTIFICATION SENDERS ──────────────────────────────────────────

/**
 * Send registration welcome email + WhatsApp. Fire-and-forget (never throws).
 * @param {{ userId: number, name: string, email: string, phone: string }} param0
 */
const sendRegistrationNotifications = async ({ userId, name, email, phone }) => {
  const { welcomeEmailTemplate } = require("./emailTemplates");

  const clinicName = process.env.CLINIC_NAME || "Ayurda Clinics";
  const clinicPhone = process.env.CLINIC_PHONE || "+91-98765-43210";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // Check whether the email template is throwing any hidden errors.
  let htmlContent;
  try {
    htmlContent = welcomeEmailTemplate({ name, email });
    console.log(`[Email Flow Debug] welcomeEmailTemplate successfully generated HTML for "${email}"`);
  } catch (templateErr) {
    console.error(`[Email Flow Debug] welcomeEmailTemplate threw a hidden error:`, templateErr);
    return;
  }

  // 1. Welcome Email
  await sendEmail({
    to: email,
    subject: `Welcome to ${clinicName} — Registration Successful! 🎉`,
    html: htmlContent,
    userId,
    eventType: "Registration",
  });

  // 2. WhatsApp Welcome Message
  const whatsappBody =
    `Hello ${name}! 👋\n\n` +
    `Welcome to *${clinicName}*! 🏥\n\n` +
    `Your account has been successfully created.\n\n` +
    `✅ *Registration Successful*\n` +
    `📧 Email: ${email}\n\n` +
    `You can now log in and book appointments with our specialist doctors.\n` +
    `🔗 ${frontendUrl}/login\n\n` +
    `For any support, contact us at:\n📞 ${clinicPhone}\n\n` +
    `— The ${clinicName} Team`;

  await sendWhatsApp({
    to: phone,
    body: whatsappBody,
    userId,
    eventType: "Registration",
  });
};

/**
 * Send appointment confirmation email to patient + alert email to admin.
 * Fire-and-forget (never throws).
 * @param {{ userId: number, name: string, email: string, phone: string, department: string,
 *           preferred_date: string, preferred_time: string, appointmentId: number }} param0
 */
const sendAppointmentNotifications = async ({
  userId, name, email, phone, department, preferred_date, preferred_time, appointmentId,
}) => {
  const { appointmentConfirmationTemplate, adminAppointmentAlertTemplate } = require("./emailTemplates");

  const clinicName  = process.env.CLINIC_NAME  || "Ayurda Clinics";
  const adminEmail  = process.env.ADMIN_EMAIL  || process.env.SMTP_USER;

  // 1. Patient Confirmation Email (only if patient provided an email)
  if (email) {
    let patientHtml;
    try {
      patientHtml = appointmentConfirmationTemplate({ name, department, preferred_date, preferred_time, appointmentId, email });
      console.log(`[Email Flow Debug] appointmentConfirmationTemplate successfully generated HTML for "${email}"`);
    } catch (templateErr) {
      console.error(`[Email Flow Debug] appointmentConfirmationTemplate threw a hidden error:`, templateErr);
    }

    if (patientHtml) {
      await sendEmail({
        to: email,
        subject: `Appointment Confirmed — ${clinicName} (#${appointmentId})`,
        html: patientHtml,
        userId,
        eventType: "Appointment",
      });
    }
  }

  // 2. Admin Alert Email (optional enhancement)
  if (adminEmail) {
    let adminHtml;
    try {
      adminHtml = adminAppointmentAlertTemplate({ name, phone, email, department, preferred_date, preferred_time, appointmentId });
      console.log(`[Email Flow Debug] adminAppointmentAlertTemplate successfully generated HTML for "${adminEmail}"`);
    } catch (templateErr) {
      console.error(`[Email Flow Debug] adminAppointmentAlertTemplate threw a hidden error:`, templateErr);
    }

    if (adminHtml) {
      await sendEmail({
        to: adminEmail,
        subject: `[${clinicName}] New Appointment #${appointmentId} — ${department}`,
        html: adminHtml,
        userId,
        eventType: "Appointment",
      });
    }
  }

  // NOTE: No WhatsApp for appointments (per requirements)
};

module.exports = {
  sendEmail,
  sendWhatsApp,
  logNotification,
  sendRegistrationNotifications,
  sendAppointmentNotifications,
};

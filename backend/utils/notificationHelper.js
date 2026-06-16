const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Email Sender Helper
const sendEmail = async (to, subject, htmlContent) => {
  // Graceful check if SMTP is configured
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn("SMTP credentials not configured in .env. Skipping email sending.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 1. Log the exact recipient email address before sendMail()
    console.log(`[Email Flow Debug Helper] Recipient email BEFORE sendMail(): "${to}"`);

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Ayurda Clinics'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    // 2. Log info.accepted, info.rejected, info.response, and info.messageId after sendMail()
    console.log(`[Email Flow Debug Helper] sendMail() completed successfully!`);
    console.log(`  - info.accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`  - info.rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`  - info.response: ${JSON.stringify(info.response)}`);
    console.log(`  - info.messageId: ${JSON.stringify(info.messageId)}`);

    console.log("Email notification sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error(`[Email Flow Debug Helper] sendMail() error for recipient "${to}":`, error);
    console.error("Error sending email notification:", error);
    return false;
  }
};

// WhatsApp Dispatcher Helper
const sendWhatsApp = async (toPhone, messageBody) => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_WHATSAPP_NUMBER
  ) {
    console.warn("Twilio WhatsApp API credentials not configured in .env. Skipping WhatsApp message.");
    return false;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Format phone to standard E.164 (ensure country code e.g. +91)
    let formattedPhone = toPhone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`; // Default to India country code
    }

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: messageBody,
    });

    console.log("WhatsApp notification sent successfully:", message.sid);
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWhatsApp,
};

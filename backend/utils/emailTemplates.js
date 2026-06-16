/**
 * emailTemplates.js
 * Reusable HTML email template builders for Ayurda Clinics notification system.
 */

const CLINIC_NAME = process.env.CLINIC_NAME || "Ayurda Clinics";
const CLINIC_PHONE = process.env.CLINIC_PHONE || "+91-98765-43210";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Shared header/footer HTML wrappers
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${CLINIC_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e 0%,#115e59 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">✦ ${CLINIC_NAME}</h1>
              <p style="margin:6px 0 0;color:#99f6e4;font-size:13px;">Your Trusted Healthcare Partner</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">
                ${CLINIC_NAME} &bull; Contact: <a href="tel:${CLINIC_PHONE}" style="color:#0f766e;text-decoration:none;">${CLINIC_PHONE}</a><br/>
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Welcome email sent to new users after successful registration.
 * @param {{ name: string, email: string }} param0
 */
const welcomeEmailTemplate = ({ name, email }) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#0f766e;font-size:22px;font-weight:800;">Welcome to ${CLINIC_NAME}! 🎉</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Your account has been created successfully.</p>

    <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Registered As</p>
      <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${name}</p>
      <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${email}</p>
    </div>

    <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">
      You can now book appointments, track your consultation history, and manage your health profile — all from one place.
    </p>

    <div style="margin-bottom:28px;">
      <p style="margin:0 0 10px;color:#374151;font-size:14px;font-weight:600;">What you can do:</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#6b7280;font-size:14px;line-height:2;">
        <li>📅 Book appointments with specialist doctors</li>
        <li>📋 View and manage your appointment history</li>
        <li>💊 Access health guidance and department FAQs</li>
        <li>📞 Contact our support team anytime</li>
      </ul>
    </div>

    <a href="${FRONTEND_URL}/login"
       style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.01em;">
      Login to Your Account →
    </a>

    <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;">
      Need help? Call us at <a href="tel:${CLINIC_PHONE}" style="color:#0f766e;font-weight:600;">${CLINIC_PHONE}</a>
    </p>
  `;
  return emailWrapper(content);
};

/**
 * Appointment confirmation email sent to patient after booking.
 * @param {{ name: string, department: string, preferred_date: string, preferred_time: string, appointmentId: number, email: string }} param0
 */
const appointmentConfirmationTemplate = ({ name, department, preferred_date, preferred_time, appointmentId, email }) => {
  const formattedDate = preferred_date
    ? new Date(preferred_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "To be confirmed";

  const content = `
    <h2 style="margin:0 0 8px;color:#0f766e;font-size:22px;font-weight:800;">Appointment Confirmed! ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Your appointment inquiry has been received. Our team will reach out to confirm the slot.</p>

    <!-- Appointment Card -->
    <div style="background:linear-gradient(135deg,#f0fdfa,#ffffff);border:2px solid #99f6e4;border-radius:14px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 16px;color:#0f766e;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Appointment Details</p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <span style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;">Appointment ID</span><br/>
            <span style="color:#111827;font-size:15px;font-weight:700;">#${appointmentId}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <span style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;">Patient Name</span><br/>
            <span style="color:#111827;font-size:15px;font-weight:700;">${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <span style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;">Department</span><br/>
            <span style="color:#0f766e;font-size:15px;font-weight:700;">${department}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <span style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;">Preferred Date</span><br/>
            <span style="color:#111827;font-size:15px;font-weight:700;">📅 ${formattedDate}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;">Preferred Time</span><br/>
            <span style="color:#111827;font-size:15px;font-weight:700;">🕐 ${preferred_time || "Flexible"}</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">
        📌 Important: Our team will contact you shortly to confirm your appointment slot.
        Please keep your phone reachable.
      </p>
    </div>

    <a href="${FRONTEND_URL}/dashboard"
       style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;">
      View My Appointments →
    </a>

    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;">
      Questions? Call us at <a href="tel:${CLINIC_PHONE}" style="color:#0f766e;font-weight:600;">${CLINIC_PHONE}</a>
    </p>
  `;
  return emailWrapper(content);
};

/**
 * Admin alert email sent when a new appointment is booked.
 * @param {{ name: string, phone: string, email: string, department: string, preferred_date: string, preferred_time: string, appointmentId: number }} param0
 */
const adminAppointmentAlertTemplate = ({ name, phone, email, department, preferred_date, preferred_time, appointmentId }) => {
  const formattedDate = preferred_date
    ? new Date(preferred_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Not specified";

  const content = `
    <h2 style="margin:0 0 8px;color:#dc2626;font-size:22px;font-weight:800;">🔔 New Appointment Booked</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">A patient has submitted a new appointment inquiry. Action may be required.</p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
      <p style="margin:0 0 14px;color:#dc2626;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Patient Information</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;"><span style="color:#6b7280;font-size:12px;">Appointment ID:</span><br/><strong>#${appointmentId}</strong></td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid #fecaca;"><span style="color:#6b7280;font-size:12px;">Patient Name:</span><br/><strong>${name}</strong></td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid #fecaca;"><span style="color:#6b7280;font-size:12px;">Phone:</span><br/><strong><a href="tel:${phone}" style="color:#0f766e;">${phone}</a></strong></td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid #fecaca;"><span style="color:#6b7280;font-size:12px;">Email:</span><br/><strong>${email || "Not provided"}</strong></td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid #fecaca;"><span style="color:#6b7280;font-size:12px;">Department:</span><br/><strong style="color:#0f766e;">${department}</strong></td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid #fecaca;"><span style="color:#6b7280;font-size:12px;">Preferred Date:</span><br/><strong>${formattedDate}</strong></td></tr>
        <tr><td style="padding:6px 0;border-top:1px solid #fecaca;"><span style="color:#6b7280;font-size:12px;">Preferred Time:</span><br/><strong>${preferred_time || "Flexible"}</strong></td></tr>
      </table>
    </div>

    <a href="${FRONTEND_URL}/admin?tab=appointments"
       style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;">
      Open Admin Dashboard →
    </a>
  `;
  return emailWrapper(content);
};

module.exports = {
  welcomeEmailTemplate,
  appointmentConfirmationTemplate,
  adminAppointmentAlertTemplate,
};

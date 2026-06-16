const db = require("../db");
const { sendAppointmentNotifications } = require("../utils/notificationService");

const createAppointment = (req, res) => {
  const { name, phone, email, department, preferred_date, preferred_time, message } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in to book an appointment.",
    });
  }

  if (!name || !phone || !department) {
    return res.status(400).json({
      success: false,
      message: "Name, phone and department are required",
    });
  }

  const user_id = req.user.id;

  // 1. Verify user exists in database to avoid foreign key violations
  const userCheckSql = "SELECT id FROM users WHERE id = ?";
  db.query(userCheckSql, [user_id], (err, userRows) => {
    if (err) {
      console.error("Database error during user check:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to validate user account",
        error: err.message,
      });
    }

    if (userRows.length === 0) {
      console.warn(`Attempted booking with non-existent user_id: ${user_id}`);
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or the account was deleted. Please log in again.",
        forceLogout: true,
      });
    }

    // 2. Insert the appointment safely
    const sql = `
      INSERT INTO appointments 
      (patient_name, email, phone, department, preferred_date, preferred_time, message, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name,
        email || null,
        phone,
        department,
        preferred_date || null,
        preferred_time || null,
        message || null,
        user_id,
      ],
      (error, result) => {
        if (error) {
          console.error("Error creating appointment:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to save appointment",
            error: error.message,
          });
        }

        const appointmentId = result.insertId;

        // Send HTTP 201 response immediately
        res.status(201).json({
          success: true,
          message: "Appointment inquiry submitted successfully",
          appointmentId,
        });

        // Fire-and-forget: send email notifications (does NOT block the response)
        setImmediate(() => {
          sendAppointmentNotifications({
            userId: user_id,
            name,
            email: email || null,
            phone,
            department,
            preferred_date: preferred_date || null,
            preferred_time: preferred_time || null,
            appointmentId,
          }).catch((err) =>
            console.error("[Appointment] Notification error (non-fatal):", err.message)
          );
        });
      }
    );
  });
};

const getAppointments = (req, res) => {
  const sql = "SELECT * FROM appointments ORDER BY created_at DESC";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch appointments",
        error: error.message,
      });
    }

    // Map database properties for backwards compatibility with name/patient_name
    const mapped = results.map((appt) => ({
      ...appt,
      name: appt.patient_name || appt.name || "",
      patient_name: appt.patient_name || appt.name || "",
    }));

    res.status(200).json({
      success: true,
      appointments: mapped,
    });
  });
};

const updateAppointmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatus = ["Pending", "Contacted", "Confirmed", "Completed"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment status",
    });
  }

  const sql = "UPDATE appointments SET status = ? WHERE id = ?";

  db.query(sql, [status, id], (error, result) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update appointment status",
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
    });
  });
};
const deleteAppointment = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM appointments WHERE id = ?";

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete appointment",
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  });
};
const updateAdminNotes = (req, res) => {
  const { id } = req.params;
  const { admin_notes } = req.body;

  const sql = "UPDATE appointments SET admin_notes = ? WHERE id = ?";

  db.query(sql, [admin_notes || null, id], (error, result) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update admin notes",
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin notes updated successfully",
    });
  });
};
module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  updateAdminNotes,
};
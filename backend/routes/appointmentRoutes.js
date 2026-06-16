const express = require("express");
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  updateAdminNotes,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const patientAuthMiddleware = require("../middleware/patientAuthMiddleware");

const router = express.Router();

router.post("/", patientAuthMiddleware, createAppointment);

router.get("/", authMiddleware, getAppointments);
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);
router.patch("/:id/notes", authMiddleware, updateAdminNotes);
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;
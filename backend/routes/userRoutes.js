const express = require("express");
const router = express.Router();
const patientAuthMiddleware = require("../middleware/patientAuthMiddleware");

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAppointments
} = require("../controllers/userController");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected patient routes
router.get("/profile", patientAuthMiddleware, getProfile);
router.put("/profile", patientAuthMiddleware, updateProfile);
router.put("/password", patientAuthMiddleware, changePassword);
router.get("/appointments", patientAuthMiddleware, getAppointments);

module.exports = router;

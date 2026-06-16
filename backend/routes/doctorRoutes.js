const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController");

router.get("/", getDoctors);
router.post("/", authMiddleware, addDoctor);
router.put("/:id", authMiddleware, updateDoctor);
router.delete("/:id", authMiddleware, deleteDoctor);

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getServices,
  addService,
  updateService,
  deleteService
} = require("../controllers/serviceController");

router.get("/", getServices);
router.post("/", authMiddleware, addService);
router.put("/:id", authMiddleware, updateService);
router.delete("/:id", authMiddleware, deleteService);

module.exports = router;

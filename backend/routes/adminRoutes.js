const express = require("express");
const { adminLogin } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db");

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC");
    
    // Temporary diagnostic console logs
    console.log(`[SQL Debug] users query result count: ${rows.length}`);
    console.log(`[API Debug] Response payload count for GET /users: ${rows.length}`);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
});

module.exports = router;
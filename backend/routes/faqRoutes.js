const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getFaqs,
  addFaq,
  updateFaq,
  deleteFaq
} = require("../controllers/faqController");

router.get("/", getFaqs);
router.post("/", authMiddleware, addFaq);
router.put("/:id", authMiddleware, updateFaq);
router.delete("/:id", authMiddleware, deleteFaq);

module.exports = router;

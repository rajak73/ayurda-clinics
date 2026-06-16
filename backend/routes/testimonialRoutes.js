const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSuccessStories,
  addSuccessStory,
  updateSuccessStory,
  deleteSuccessStory
} = require("../controllers/testimonialController");

// Testimonials routes
router.get("/testimonials", getTestimonials);
router.post("/testimonials", authMiddleware, addTestimonial);
router.put("/testimonials/:id", authMiddleware, updateTestimonial);
router.delete("/testimonials/:id", authMiddleware, deleteTestimonial);

// Success stories routes
router.get("/success-stories", getSuccessStories);
router.post("/success-stories", authMiddleware, addSuccessStory);
router.put("/success-stories/:id", authMiddleware, updateSuccessStory);
router.delete("/success-stories/:id", authMiddleware, deleteSuccessStory);

module.exports = router;

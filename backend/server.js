const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import DB Initializer
const initDatabase = require("./dbInit");

// Import Routes
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const faqRoutes = require("./routes/faqRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Enable CORS
app.use(cors());

// Support JSON payloads up to 10MB (for base64 image uploads)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Run database initialization
initDatabase();

// Register API Routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api", testimonialRoutes); // Testimonials and Success Stories are mounted here
app.use("/api/faqs", faqRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Ayurda Clinics Backend Running");
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend Working" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
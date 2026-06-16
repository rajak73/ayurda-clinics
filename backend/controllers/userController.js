const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { sendRegistrationNotifications } = require("../utils/notificationService");

// 1. REGISTER USER
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const promiseDb = db.promise();

    // Check if email already exists
    const [existing] = await promiseDb.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const [result] = await promiseDb.query(
      `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`,
      [name, email, phone, hashedPassword]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send response immediately — notifications run in background
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: userId,
        name,
        email,
        phone,
      },
    });

    // Fire-and-forget: send welcome email + WhatsApp (does NOT block the response)
    setImmediate(() => {
      sendRegistrationNotifications({ userId, name, email, phone }).catch((err) =>
        console.error("[Register] Notification error (non-fatal):", err.message)
      );
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const promiseDb = db.promise();

    // Find user by email
    const [rows] = await promiseDb.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// 3. GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });

  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// 4. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const promiseDb = db.promise();

    // Check if new email conflicts with another user
    const [existing] = await promiseDb.query(
      "SELECT * FROM users WHERE email = ? AND id != ?",
      [email, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already taken",
      });
    }

    await promiseDb.query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, req.user.id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: req.user.id,
        name,
        email,
        phone,
      },
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// 5. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old password and new password are required",
    });
  }

  try {
    const promiseDb = db.promise();

    // Fetch user password
    const [rows] = await promiseDb.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await promiseDb.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// 6. GET USER APPOINTMENTS
exports.getAppointments = async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query(
      "SELECT * FROM appointments WHERE user_id = ? ORDER BY preferred_date DESC, created_at DESC",
      [req.user.id]
    );

    // Map database properties for backwards compatibility with name/patient_name
    const mapped = rows.map((appt) => ({
      ...appt,
      name: appt.patient_name || appt.name || "",
      patient_name: appt.patient_name || appt.name || "",
    }));

    res.json({
      success: true,
      appointments: mapped,
    });

  } catch (error) {
    console.error("Get user appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments history",
    });
  }
};

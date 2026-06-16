const fs = require("fs");
const path = require("path");
const db = require("../db");

// Helper to save base64 image
const saveBase64Image = (base64Str) => {
  if (!base64Str) return null;
  if (!base64Str.startsWith("data:image/")) {
    // If it's already a URL or path, return it as is
    return base64Str;
  }
  
  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    
    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");
    
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const uploadDir = path.join(__dirname, "..", "public", "uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Failed to save base64 image:", error);
    return null;
  }
};

// GET ALL DOCTORS
exports.getDoctors = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM doctors ORDER BY id DESC"
    );

    console.log("Doctors fetched:", rows);
    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching doctors"
    });
  }
};

// ADD DOCTOR
exports.addDoctor = async (req, res) => {
  try {
    const {
      name,
      department,
      qualification,
      experience,
      specialization,
      available_time,
      image,
      status,
      availability
    } = req.body;

    if (!name || !department || !qualification || !experience || !specialization || !available_time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const image_url = saveBase64Image(image);

    await db.promise().query(
      `INSERT INTO doctors
      (name, department, qualification, experience, specialization, available_time, image_url, status, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        department,
        qualification,
        experience,
        specialization,
        available_time,
        image_url,
        status || "Active",
        availability || "Available"
      ]
    );

    res.json({
      success: true,
      message: "Doctor added successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error adding doctor"
    });
  }
};

// UPDATE DOCTOR
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      department,
      qualification,
      experience,
      specialization,
      available_time,
      image,
      image_url: existing_image_url,
      status,
      availability
    } = req.body;

    if (!name || !department || !qualification || !experience || !specialization || !available_time) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    let finalImageUrl = existing_image_url || null;
    if (image) {
      const savedUrl = saveBase64Image(image);
      if (savedUrl) finalImageUrl = savedUrl;
    }

    const [result] = await db.promise().query(
      `UPDATE doctors SET 
        name = ?, 
        department = ?, 
        qualification = ?, 
        experience = ?, 
        specialization = ?, 
        available_time = ?, 
        image_url = ?, 
        status = ?,
        availability = ?
      WHERE id = ?`,
      [
        name,
        department,
        qualification,
        experience,
        specialization,
        available_time,
        finalImageUrl,
        status || "Active",
        availability || "Available",
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      message: "Doctor updated successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error updating doctor"
    });
  }
};

// DELETE DOCTOR
exports.deleteDoctor = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "DELETE FROM doctors WHERE id=?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.json({
      success: true,
      message: "Doctor deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error deleting doctor"
    });
  }
};
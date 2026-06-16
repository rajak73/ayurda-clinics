const db = require("../db");

// GET ALL FAQS
exports.getFaqs = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM faqs ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQs"
    });
  }
};

// ADD FAQ
exports.addFaq = async (req, res) => {
  try {
    const { dept, q, a } = req.body;

    if (!dept || !q || !a) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    await db.promise().query(
      `INSERT INTO faqs (dept, q, a) VALUES (?, ?, ?)`,
      [dept, q, a]
    );

    res.json({
      success: true,
      message: "FAQ added successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding FAQ"
    });
  }
};

// UPDATE FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { dept, q, a } = req.body;

    if (!dept || !q || !a) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const [result] = await db.promise().query(
      `UPDATE faqs SET 
        dept = ?, 
        q = ?, 
        a = ?
      WHERE id = ?`,
      [dept, q, a, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    res.json({
      success: true,
      message: "FAQ updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating FAQ"
    });
  }
};

// DELETE FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "DELETE FROM faqs WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    res.json({
      success: true,
      message: "FAQ deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting FAQ"
    });
  }
};

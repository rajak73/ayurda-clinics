const db = require("../db");

// GET ALL SERVICES
exports.getServices = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM services ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching services"
    });
  }
};

// ADD SERVICE
exports.addService = async (req, res) => {
  try {
    const { title, icon_name, overview, treatments, when_to_visit } = req.body;

    if (!title || !icon_name || !overview || !treatments || !when_to_visit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Ensure treatments and when_to_visit are stringified JSONs if passed as arrays/objects
    const treatmentsStr = typeof treatments === "string" ? treatments : JSON.stringify(treatments);
    const whenToVisitStr = typeof when_to_visit === "string" ? when_to_visit : JSON.stringify(when_to_visit);

    await db.promise().query(
      `INSERT INTO services (title, icon_name, overview, treatments, when_to_visit)
       VALUES (?, ?, ?, ?, ?)`,
      [title, icon_name, overview, treatmentsStr, whenToVisitStr]
    );

    res.json({
      success: true,
      message: "Service added successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding service"
    });
  }
};

// UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, icon_name, overview, treatments, when_to_visit } = req.body;

    if (!title || !icon_name || !overview || !treatments || !when_to_visit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const treatmentsStr = typeof treatments === "string" ? treatments : JSON.stringify(treatments);
    const whenToVisitStr = typeof when_to_visit === "string" ? when_to_visit : JSON.stringify(when_to_visit);

    const [result] = await db.promise().query(
      `UPDATE services SET 
        title = ?, 
        icon_name = ?, 
        overview = ?, 
        treatments = ?, 
        when_to_visit = ?
      WHERE id = ?`,
      [title, icon_name, overview, treatmentsStr, whenToVisitStr, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating service"
    });
  }
};

// DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "DELETE FROM services WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting service"
    });
  }
};

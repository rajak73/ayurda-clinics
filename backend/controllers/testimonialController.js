const db = require("../db");

// ================= TESTIMONIALS CRUD =================

// GET ALL TESTIMONIALS
exports.getTestimonials = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM testimonials ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching testimonials"
    });
  }
};

// ADD TESTIMONIAL
exports.addTestimonial = async (req, res) => {
  try {
    const { name, treatment, rating, feedback } = req.body;

    if (!name || !treatment || rating === undefined || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    await db.promise().query(
      `INSERT INTO testimonials (name, treatment, rating, feedback)
       VALUES (?, ?, ?, ?)`,
      [name, treatment, Number(rating), feedback]
    );

    res.json({
      success: true,
      message: "Testimonial added successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding testimonial"
    });
  }
};

// UPDATE TESTIMONIAL
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, treatment, rating, feedback } = req.body;

    if (!name || !treatment || rating === undefined || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const [result] = await db.promise().query(
      `UPDATE testimonials SET 
        name = ?, 
        treatment = ?, 
        rating = ?, 
        feedback = ?
      WHERE id = ?`,
      [name, treatment, Number(rating), feedback, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.json({
      success: true,
      message: "Testimonial updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating testimonial"
    });
  }
};

// DELETE TESTIMONIAL
exports.deleteTestimonial = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "DELETE FROM testimonials WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.json({
      success: true,
      message: "Testimonial deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting testimonial"
    });
  }
};


// ================= SUCCESS STORIES CRUD =================

// GET ALL SUCCESS STORIES
exports.getSuccessStories = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM success_stories ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching success stories"
    });
  }
};

// ADD SUCCESS STORY
exports.addSuccessStory = async (req, res) => {
  try {
    const { title, department, story } = req.body;

    if (!title || !department || !story) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    await db.promise().query(
      `INSERT INTO success_stories (title, department, story)
       VALUES (?, ?, ?)`,
      [title, department, story]
    );

    res.json({
      success: true,
      message: "Success story added successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding success story"
    });
  }
};

// UPDATE SUCCESS STORY
exports.updateSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, story } = req.body;

    if (!title || !department || !story) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const [result] = await db.promise().query(
      `UPDATE success_stories SET 
        title = ?, 
        department = ?, 
        story = ?
      WHERE id = ?`,
      [title, department, story, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    res.json({
      success: true,
      message: "Success story updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating success story"
    });
  }
};

// DELETE SUCCESS STORY
exports.deleteSuccessStory = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "DELETE FROM success_stories WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    res.json({
      success: true,
      message: "Success story deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting success story"
    });
  }
};

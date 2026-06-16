const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || "3306", 10),
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "ayurda_clinics",
});

db.connect((error) => {
  if (error) {
    console.log("MySQL connection failed:", error.message);
    return;
  }

  console.log("MySQL connected successfully");
});

module.exports = db;
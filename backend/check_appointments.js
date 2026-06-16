const mysql = require("mysql2/promise");
require("dotenv").config({ path: "/Users/rajakumar/ayurda-clinics/backend/.env" });

async function checkAppointmentsTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("Connected successfully to database:", process.env.DB_NAME);
    const [columns] = await connection.query("DESCRIBE appointments");
    console.log("Appointments Columns:");
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) | Null: ${col.Null} | Default: ${col.Default}`);
    });
    await connection.end();
  } catch (err) {
    console.error("Database Connection/Query Error:", err);
  }
}

checkAppointmentsTable();

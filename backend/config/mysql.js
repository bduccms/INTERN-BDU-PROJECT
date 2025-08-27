import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2";
console.log(
  "DB_PASSWORD in mysql config:",
  process.env.DB_PASSWORD ? "Exists" : "Missing"
);

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "CCMS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the promise wrapped pool
const db = pool.promise();

// Test connection once at startup
db.getConnection()
  .then((conn) => {
    console.log("✅ MySQL pool connected!");
    conn.release(); // release connection back to pool
  })
  .catch((err) => {
    console.error("❌ MySQL pool connection error:", err.message);
  });

export default db;

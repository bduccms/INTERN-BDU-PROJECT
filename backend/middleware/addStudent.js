import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const saltRounds = 10;

router.post("/", async (req, res) => {
  const { student_id, first_name, father_name, Gfather_name, department, sex } =
    req.body;
  try {
    const rawPassword = student_id + first_name;

    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    await db.query(
      `INSERT INTO student (student_id, first_name, father_name, Gfather_name, department, sex, password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        first_name,
        father_name,
        Gfather_name,
        department,
        sex,
        hashedPassword,
      ]
    );

    res
      .status(201)
      .json({ success: true, message: "Student registered successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;

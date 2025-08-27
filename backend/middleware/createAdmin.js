import express from "express";
import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import validator from "validator";

const router = express.Router();

const saltRounds = 10;

router.post("/", async (req, res) => {
  const { admin_id, first_name, last_name, email, phone } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const rawPassword = admin_id + first_name;

    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    await db.query(
      `INSERT INTO admin (admin_id, first_name, last_name, email, phone, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [admin_id, first_name, last_name, email, phone, hashedPassword]
    );

    res
      .status(201)
      .json({ success: true, message: "Admin registered successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

export default router;

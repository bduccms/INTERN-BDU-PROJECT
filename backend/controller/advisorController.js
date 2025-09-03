import db from "../config/mysql.js";
import bcrypt from "bcrypt";
const saltRounds = 10;

const addStudent = async (req, res) => {
  const {
    student_id,
    first_name,
    father_name,
    faculty,
    Gfather_name,
    department,
    sex,
  } = req.body;

  const connection = await db.getConnection(); // 👈 get dedicated connection

  try {
    await connection.beginTransaction(); // 👈 start transaction

    // 1. Generate hashed password
    const rawPassword = student_id + first_name;

    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // 2. Insert student
    await connection.query(
      `INSERT INTO student (student_id, first_name, father_name, Gfather_name,faculty, department, sex, password)
       VALUES (?, ?, ?, ?,?, ?, ?, ?)`,
      [
        student_id,
        first_name,
        father_name,
        Gfather_name,
        faculty,
        department,
        sex,
        hashedPassword,
      ]
    );

    // 3. Get café official
    const [officials] = await connection.query(
      `SELECT official_id FROM staff_official WHERE assigned_department = ? LIMIT 1`,
      ["cafe"]
    );

    if (officials.length === 0) {
      await connection.rollback(); // 👈 undo student insert if no cafe official
      return res
        .status(400)
        .json({ success: false, message: "Cafe official not found" });
    }

    const cafe_official_id = officials[0].official_id;

    // 4. Insert department risk
    await connection.query(
      `INSERT INTO department_risk (student_id, first_name, father_name, department, cause, added_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        first_name,
        father_name,
        department,
        "new_student",
        cafe_official_id,
      ]
    );

    await connection.commit(); // 👈 commit if all good
    res.status(201).json({
      success: true,
      message: "Student registered successfully with risk.",
    });
  } catch (error) {
    await connection.rollback(); // 👈 rollback if any error happens
    console.error("Transaction error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ success: false, message: "Student already exists" });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    connection.release(); // 👈 release connection back to pool
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT password from advisor WHERE advisor_id=?`[req.user.advisor_id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query("UPDATE advisor SET password = ? WHERE advisor_id = ?", [
      hashedNewPassword,
      req.user.advisor_id,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { addStudent, changePassword };

import db from "../config/mysql.js";
import bcrypt from "bcrypt";
const saltRounds = 10;

// -------------------- Add Student --------------------
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

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Generate hashed password
    const rawPassword = student_id + first_name;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // 2. Insert student
    await connection.query(
      `INSERT INTO student 
       (student_id, first_name, father_name, Gfather_name, faculty, department, sex, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Cafe official not found" });
    }

    const cafe_official_id = officials[0].official_id;

    // 4. Insert department risk
    await connection.query(
      `INSERT INTO department_risk 
       (student_id, first_name, father_name, department, cause, added_by)
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

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Student registered successfully with risk.",
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rbError) {
      console.error("Rollback error:", rbError);
    }

    console.error("Transaction error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ success: false, message: "Student already exists" });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    connection.release();
  }
};

// -------------------- Change Password --------------------
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    console.log("Advisor from token:", req.user); // check if advisor_id exists

    // 1. Fetch current password
    const [rows] = await db.query(
      `SELECT password FROM advisor WHERE advisor_id = ?`,
      [req.user.advisor_id]
    );

    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Compare old password
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // 3. Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query(`UPDATE advisor SET password = ? WHERE advisor_id = ?`, [
      hashedNewPassword,
      req.user.advisor_id,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export { addStudent, changePassword };

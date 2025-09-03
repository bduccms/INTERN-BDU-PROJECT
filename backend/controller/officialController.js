import db from "../config/mysql.js";
import bcrypt from "bcrypt";
const saltRounds = 10;

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT password from staff_official WHERE official_id=?`,
      [req.user.official_id]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query(
      "UPDATE staff_official SET password = ? WHERE official_id = ?",
      [hashedNewPassword, req.user.official_id]
    );

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addWarning = async (req, res) => {
  try {
    const { first_name, father_name, student_id, department, cause } = req.body;

    const [rows] = await db.query(
      `SELECT * FROM student 
         WHERE student_id = ? AND first_name = ? AND father_name = ?`,
      [student_id, first_name, father_name]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student data does not match our records.",
      });
    }

    const insertQuery = `INSERT INTO department_risk(
    student_id,first_name,father_name,department,cause,added_by
    )VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [
      student_id,
      first_name,
      father_name,
      department,
      cause,
      req.user.official_id,
    ];

    await db.query(insertQuery, values);
    return res
      .status(201)
      .json({ success: true, message: "Risk submitted successfully." });
  } catch (error) {
    console.error("Error  when submitting  risk :", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteWarning = async (req, res) => {
  try {
    const { risk_id } = req.params;
    const [result] = await db.query(
      "UPDATE department_risk SET deleted = true WHERE risk_id = ?",
      [risk_id]
    );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Risk deleted successfully" });
    } else {
      return res.status(404).json({ success: false, error: "Risk not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
};

const seeWarnings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT dr.*
      FROM department_risk dr
      JOIN staff_official so_risk 
          ON dr.added_by = so_risk.official_id
      JOIN staff_official so_current 
          ON so_risk.assigned_department = so_current.assigned_department
      WHERE so_current.official_id = ?
        AND dr.deleted = false
      `,
      [req.user.official_id]
    );

    res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const seeAllStudents = async (red, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM student 
         `
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students  does not found ",
      });
    }
    return res.status(200).json({ success: true, rows });
  } catch (error) {
    console.log(error);
  }
};

const editWarning = async (req, res) => {
  const { cause } = req.body;
  const { risk_id } = req.params;
  try {
    const [result] = await db.query(
      `UPDATE department_risk 
       SET cause = ? 
       WHERE risk_id = ?`,
      [cause, risk_id]
    );
    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Risk edited successfully" });
    } else {
      return res.status(404).json({ success: false, error: "Risk not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  changePassword,
  addWarning,
  seeAllStudents,
  seeWarnings,
  deleteWarning,
  editWarning,
};

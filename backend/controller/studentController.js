import db from "../config/mysql.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
const saltRounds = 10;

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT password from student WHERE student_id=?`,
      [req.user.student_id]
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
    await db.query("UPDATE student SET password = ? WHERE student_id = ?", [
      hashedNewPassword,
      req.user.student_id,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendFormData = async (req, res) => {
  try {
    const { cause, semester, academic_year, year_of_study } = req.body;

    const { student_id } = req.user;
    const [rows] = await db.query(
      `SELECT * FROM student 
       WHERE student_id = ? `,
      [student_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student data does not match our records.",
      });
    }

    const [risk_rows] = await db.query(
      `SELECT * FROM department_risk 
       WHERE student_id = ? AND first_name = ? AND father_name = ? AND deleted=false LIMIT 1`,
      [rows[0].student_id, rows[0].first_name, rows[0].father_name]
    );
    // LIMIT 1    Stops the database from scanning all rows unnecessarily.
    //SELECT 1   we only care whether a record exists, not the full row data — this improves performance.

    if (risk_rows.length > 0) {
      await db.query(
        "INSERT INTO clearance_request (student_id, first_name, father_name, Gfather_name,department, sex,academic_year, semester, year_of_study, cause,faculty,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          rows[0].student_id,
          rows[0].first_name,
          rows[0].father_name,
          rows[0].Gfather_name,
          rows[0].department,
          // rows[0].faculty,
          rows[0].sex,
          academic_year,
          semester,
          year_of_study,
          cause,
          rows[0].faculty,
          "pending",
        ]
      );
      const [where] = await db.query(
        `SELECT assigned_department FROM staff_official WHERE official_id = ?`,
        [risk_rows[0].added_by]
      );

      const [statusRows] = await db.query(
        `SELECT * FROM clearance_request WHERE student_id = ? ORDER BY request_id DESC LIMIT 1`,
        [rows[0].student_id]
      );

      return res.status(200).json({
        success: false,
        message: `Clearance request pending due to risks You have an unresolved risk at ${where[0].assigned_department}`,
        status: statusRows[0],
      });
    } else {
      const insertQuery = `
      INSERT INTO clearance_request (
        student_id, first_name, father_name, Gfather_name,
        department, sex,
        academic_year, semester, year_of_study, cause,faculty,status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

      const values = [
        rows[0].student_id,
        rows[0].first_name,
        rows[0].father_name,
        rows[0].Gfather_name,
        rows[0].department,
        rows[0].sex,
        academic_year,
        semester,
        year_of_study,
        cause,
        "computing",
        "cleared",
      ];

      await db.query(insertQuery, values);

      const [studentRows] = await db.query(
        `SELECT * FROM clearance_request WHERE student_id = ?`,
        [rows[0].student_id]
      );
      const pdfPath = await generateClearancePDF(studentRows[0]);

      // Respond with a public URL
      return res.status(201).json({
        success: true,
        message: "Clearance generated successfully.",
        url: `http://localhost:5000/pdfs/${rows[0].student_id}_clearance.pdf`,
        status: "Cleared",
      });
    }
  } catch (error) {
    console.error("Error submitting clearance request:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const checkClearanceStatus = async (req, res) => {
  const student_id = req.user.student_id;

  const { request_id } = req.params;
  try {
    // Check if the student has risks
    const [requestRows] = await db.query(
      `SELECT * FROM clearance_request WHERE request_id = ?`,
      [request_id]
    );

    if (requestRows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "request not found" });
    }

    const [rows] = await db.query(
      `SELECT * FROM student 
     WHERE student_id = ? `,
      [student_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student data does not match our records.",
      });
    }

    const [risk_rows] = await db.query(
      `SELECT * FROM department_risk 
     WHERE student_id = ?  AND deleted=false LIMIT 1`,
      [student_id]
    );

    if (risk_rows.length > 0) {
      return res.status(200).json({
        success: false,
        message: "still pending please check your warnings",
      });
    } else {
      // No risk → update status to cleared
      await db.query(
        `UPDATE clearance_request 
   SET status = 'cleared', request_date = CURRENT_DATE
   WHERE student_id = ? AND request_id = ?`,
        [student_id, request_id]
      );
    }

    // Return current status
    const [statusRows] = await db.query(
      `SELECT * FROM clearance_request WHERE student_id = ? AND request_id=? LIMIT 1`,
      [student_id, request_id]
    );
    const pdfPath = await generateClearancePDF(statusRows[0]);

    // Respond with a public URL
    return res.status(201).json({
      success: true,
      message: "Clearance generated successfully.",
      url: `http://localhost:5000/pdfs/${student_id}_clearance.pdf`,
    });
  } catch (error) {
    console.error("Error checking clearance status:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const studentRequest = async (req, res) => {
  const student_id = req.user.student_id;
  try {
    const [requestRows] = await db.query(
      `SELECT * FROM clearance_request WHERE student_id = ?`,
      [student_id]
    );

    if (requestRows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "request not found" });
    }

    return res
      .status(200)
      .json({ success: true, request_id: requestRows[0].request_id });
  } catch (error) {
    console.log(error);
  }
};

const getMyWarning = async (req, res) => {
  try {
    const id = req.user.student_id;

    const [rows] = await db.query(
      `SELECT * FROM department_risk 
       WHERE student_id = ? AND deleted=false`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(201).json({
        success: true,
        message: `You have no risk currently ${id}`,
      });
    }

    res.status(201).json({ success: true, rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error });
  }
};

const generateClearancePDF = async (student) => {
  const doc = new PDFDocument();
  const filePath = path.resolve(`./pdfs/${student.student_id}_clearance.pdf`);
  const stream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    doc.pipe(stream);

    doc
      .fontSize(20)
      .text("University Clearance Certificate", { align: "center" })
      .moveDown();

    doc
      .fontSize(14)
      .text(
        `Name: ${student.first_name} ${student.father_name} ${student.Gfather_name}`
      )
      .text(`Student ID: ${student.student_id}`)
      .text(`Department: ${student.department}`)
      .text(`Faculty: ${student.faculty}`)
      .text(`Cause: ${student.cause}`)
      .text(`Cleared On: ${new Date().toLocaleDateString()}`)
      .moveDown();

    doc
      .fontSize(16)
      .fillColor("green")
      .text(`Status: CLEARED`, { align: "center" })
      .fillColor("black")
      .moveDown();

    const signaturePath = path.resolve("./public/assets/signature.png");
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, {
        fit: [100, 50],
        align: "right",
      });
    }

    doc.text(`Registrar Signature`, { align: "right" });

    doc.end();

    stream.on("finish", () => {
      resolve(filePath);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
};

export {
  getMyWarning,
  studentRequest,
  sendFormData,
  changePassword,
  checkClearanceStatus,
};

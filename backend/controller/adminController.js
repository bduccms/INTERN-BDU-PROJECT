import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import validator from "validator";

const saltRounds = 10;

const addOfficial = async (req, res) => {
  const {
    official_id,
    first_name,
    last_name,
    profession,
    education,
    assigned_department,
    email,
    phone,
  } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    const rawPassword = official_id + first_name;

    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    await db.query(
      `INSERT INTO staff_official (
       official_id,
        first_name,
        last_name,
        profession,
        education,
        assigned_department,
        email,
        phone,
       password)
       VALUES (?, ?, ?, ?, ?, ?, ?,?,?)`,
      [
        official_id,
        first_name,
        last_name,
        profession,
        education,
        assigned_department,
        email,
        phone,
        hashedPassword,
      ]
    );

    res
      .status(201)
      .json({ success: true, message: "official registered successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteOfficial = async (req, res) => {
  try {
    const { official_id } = req.params;
    const [result] = await db.query(
      "UPDATE staff_official SET status = 'inactive' WHERE official_id = ?",
      [official_id]
    );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Official deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Official not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
};

const editOfficial = async (req, res) => {
  const { official_id } = req.params;
  const {
    first_name,
    last_name,
    profession,
    education,
    assigned_department,
    email,
    phone,
  } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const [result] = await db.query(
      `UPDATE staff_official 
       SET first_name = ?, 
           last_name = ?, 
           profession = ?, 
           education = ?, 
           assigned_department = ?, 
           email = ?, 
           phone = ? 
       WHERE official_id = ?`,
      [
        first_name,
        last_name,
        profession,
        education,
        assigned_department,
        email,
        phone,
        official_id,
      ]
    );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Official edited successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Official not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addAdvisor = async (req, res) => {
  const {
    advisor_id,
    first_name,
    last_name,
    education,
    profession,
    department,
    email,
    phone,
  } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    const rawPassword = advisor_id + first_name;

    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    await db.query(
      `INSERT INTO advisor (
      advisor_id,
        first_name,
        last_name,       
        education,
        profession,
        department,
        email,
        phone,
       password)
       VALUES (?, ?, ?, ?,?,?, ?, ?, ?)`,
      [
        advisor_id,
        first_name,
        last_name,
        education,
        profession,
        department,
        email,
        phone,
        hashedPassword,
      ]
    );

    res
      .status(201)
      .json({ success: true, message: "Advisor registered successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const deleteAdvisor = async (req, res) => {
  try {
    const { advisor_id } = req.params;
    const [result] = await db.query(
      "UPDATE advisor SET status = 'inactive' WHERE advisor_id = ?",
      [advisor_id]
    );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Advisor deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Advisor not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
};

const editAdvisor = async (req, res) => {
  const { advisor_id } = req.params;
  const { first_name, last_name, education, email, phone } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const [result] = await db.query(
      `UPDATE advisor 
       SET first_name = ?, 
           last_name = ?, 
        
           education = ?, 
           
           email = ?, 
           phone = ? 
       WHERE advisor_id = ?`,
      [first_name, last_name, education, email, phone, advisor_id]
    );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Advisor edited successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "Advisor not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const allWarnings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM department_risk 
       `
    );
    if (rows.length === 0) {
      return res.status(201).json({
        success: true,
        message: `There is no risk currently `,
      });
    }
    res.status(201).json({ success: true, rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error });
  }
};

const allClearances = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM clearance_request  
       `
    );
    if (rows.length === 0) {
      return res.status(201).json({
        success: true,
        message: `There is no clearance request currently `,
      });
    }
    res.status(201).json({ success: true, rows });
  } catch (error) {
    console.log(error);
  }
};

const totalOfficial = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM staff_official `);
    // const [rows] = await db.query(
    //   `SELECT * FROM staff_official WHERE status = ?`,
    //   ["active"]
    // );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "There is no Official currently",
        rows: [],
      });
    }

    res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error("Error fetching officials:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const totalAdvisor = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM advisor `);
    // const [rows] = await db.query(
    //   `SELECT * FROM staff_official WHERE status = ?`,
    //   ["active"]
    // );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "There is no Advisor currently",
        rows: [],
      });
    }

    res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error("Error fetching Advisor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  addOfficial,
  editOfficial,
  deleteOfficial,
  allWarnings,
  allClearances,
  totalOfficial,
  addAdvisor,
  deleteAdvisor,
  editAdvisor,
  totalAdvisor,
};

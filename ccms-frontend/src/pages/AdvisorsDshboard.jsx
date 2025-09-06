import React, { useState, useContext } from "react";
import "./StudentRegistration.css";
import axios from "axios";
import { AppContext } from "../context/Context";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { FaSignOutAlt, FaKey } from "react-icons/fa"; // 🔹 Icons for logout & password


const StudentRegistration = () => {
  const { token } = useContext(AppContext);
  const [student, setStudent] = useState({
    student_id: "",
    first_name: "",
    father_name: "",
    Gfather_name: "",
    department: "",
    faculty: "",
    sex: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // 🔹 Change Password state
  const [showModal, setShowModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("");

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // 🔹 Student form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({
      ...student,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/advisor/addStudent`,
        student,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessage("Student registered successfully!");
        setMessageType("success");
        setStudent({
          student_id: "",
          first_name: "",
          father_name: "",
          Gfather_name: "",
          department: "",
          faculty: "",
          sex: "",
        });
      } else {
        setMessage(response.data.message || "Failed to register student");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
    }
  };

  // 🔹 Change Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords do not match!");
      setPasswordMessageType("error");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/advisor/changePassword`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPasswordMessage("Password changed successfully!");
        setPasswordMessageType("success");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setPasswordMessage(response.data.message || "Failed to change password");
        setPasswordMessageType("error");
      }
    } catch (error) {
      setPasswordMessage("Network error. Please try again.");
      setPasswordMessageType("error");
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="d-flex justify-content-end mb-3 gap-2">
  <Button
    variant="outline-primary"
    onClick={() => setShowModal(true)}
    className="d-flex align-items-center"
  >
    <FaKey className="me-2" /> Change Password
  </Button>

  <Button
    variant="outline-danger"
    onClick={handleLogout}
    className="d-flex align-items-center"
  >
    <FaSignOutAlt className="me-2" /> Logout
  </Button>
</div>


        <div className="registration-header">
          <h2>
            <i className="fas fa-user-graduate"></i> Student Registration
          </h2>
          <p>Register new students into the system</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-grid">
            {/* Student Form Fields */}
            <div className="form-group">
              <label htmlFor="student_id" className="required">
                Student ID
              </label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={student.student_id}
                onChange={handleChange}
                placeholder="e.g., BDU1234"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="first_name" className="required">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={student.first_name}
                onChange={handleChange}
                placeholder="Student's first name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="father_name" className="required">
                Father's Name
              </label>
              <input
                type="text"
                id="father_name"
                name="father_name"
                value={student.father_name}
                onChange={handleChange}
                placeholder="Father's full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="Gfather_name" className="required">
                Grandfather's Name
              </label>
              <input
                type="text"
                id="Gfather_name"
                name="Gfather_name"
                value={student.Gfather_name}
                onChange={handleChange}
                placeholder="Grandfather's full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department" className="required">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={student.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Systems">Information Systems</option>
                <option value="Software Engineering">
                  Software Engineering
                </option>
                <option value="Computer Engineering">
                  Computer Engineering
                </option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="faculty">Faculty</label>
              <input
                type="text"
                id="faculty"
                name="faculty"
                value={student.faculty}
                onChange={handleChange}
                placeholder="Faculty name"
              />
            </div>

            <div className="form-group">
              <label className="required">Sex</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="sex_m"
                    name="sex"
                    value="M"
                    checked={student.sex === "M"}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="sex_m">Male</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="sex_f"
                    name="sex"
                    value="F"
                    checked={student.sex === "F"}
                    onChange={handleChange}
                  />
                  <label htmlFor="sex_f">Female</label>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <i className="fas fa-user-plus"></i> Register Student
          </button>

          {message && <div className={`message ${messageType}`}>{message}</div>}
        </form>
      </div>

      {/* 🔹 Change Password Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
  <Modal.Title>
    <FaKey className="me-2" /> Change Password
  </Modal.Title>
</Modal.Header>

        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            {passwordMessage && (
              <Alert
                variant={passwordMessageType === "success" ? "success" : "danger"}
              >
                {passwordMessage}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentRegistration;

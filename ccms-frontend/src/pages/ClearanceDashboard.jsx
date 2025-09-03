import { useState, useContext, useEffect } from "react";
import { Card, Button, Alert, Row, Col, Badge, Container, Form, Modal } from "react-bootstrap";
import ClearanceForm from "../components/ClearanceForm";
import logo from "../assets/logo.png";
import { AppContext } from "../context/Context";
import axios from "axios";
import "./ClearanceDashboard.css";

function ClearanceDashboard({ currentUser }) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { token, setToken, pdfUrl, setPdfUrl } = useContext(AppContext);
  const [r_id, setR_id] = useState("");
  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
   
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleOpenForm = () => setShowFormModal(true);
  const handleCloseForm = () => setShowFormModal(false);
 const handleOpenPasswordModal = () => {
  setPasswordData({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Clear any previous errors/success
  setPasswordErrors({});
  setPasswordSuccess(false);

  // Open modal
  setShowPasswordModal(true);
};

  const handleClosePasswordModal = () => setShowPasswordModal(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/student/request",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setR_id(response.data.request_id);
      }
      const res = await axios.get(
        `http://localhost:5000/api/student/checkClearance/${response.data.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success === false) {
        setStatus("Pending");
      } else {
        setStatus("Cleared");
        setPdfUrl(res.data.url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setChangingPassword(true);
    
    try {
      // Simulate API call - replace with your actual password change endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be your actual API call:
      /*
      const response = await axios.post(
        "http://localhost:5000/api/student/change-password",
        {
          
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      */
      
      setPasswordSuccess(true);
      setTimeout(() => {
        handleClosePasswordModal();
      }, 2000);
    } catch (error) {
      setPasswordErrors({ submit: "Failed to change password. Please try again." });
      console.error("Password change error:", error);
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    checkStatus();
  }, [token, pdfUrl]);

  if (!token) return null;

  const getStatusVariant = () => {
    switch(status) {
      case "Cleared": return "success";
      case "Pending": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="clearance-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="logo-container">
              <img src={logo} alt="BDU Logo" className="logo" />
            </div>
            <div className="brand-text">
              <h1>Campus Clearance Management System</h1>
              <p>Bahir Dar University</p>
            </div>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">{currentUser?.name}</span>
              <span className={`department-badge ${currentUser?.department?.toLowerCase()}`}>
                {currentUser?.department}
              </span>
            </div>
            <div className="user-actions">
              <Button variant="outline-light" className="password-btn" onClick={handleOpenPasswordModal}>
                Change Password
              </Button>
              <Button variant="outline-light" className="logout-btn" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Container className="dashboard-content">
        <Row>
          {/* Welcome Section */}
          <Col lg={8}>
            <Card className="welcome-card">
              <Card.Body>
                <div className="welcome-header">
                  <h2>Welcome back, {currentUser?.first_name || "Student"}!</h2>
                  <div className="welcome-badge">
                    <span className="badge-text">Student Portal</span>
                  </div>
                </div>
                
                <p className="welcome-text">
                  Manage your university clearance process digitally. Complete
                  your clearance request to ensure a smooth transition.
                </p>
                
                <Row className="benefits-row">
                  <Col md={6}>
                    <div className="benefit-card quick">
                      <div className="benefit-icon">⚡</div>
                      <div className="benefit-content">
                        <h6>Quick & Efficient</h6>
                        <p>No more long queues. Complete your clearance digitally in minutes.</p>
                      </div>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="benefit-card status">
                      <div className="benefit-icon">📊</div>
                      <div className="benefit-content">
                        <h6>Real-time Status</h6>
                        <p>Track your clearance status and get instant notifications.</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Status Section */}
          <Col lg={4}>
            <Card className="status-card">
              <Card.Body>
                <div className="status-header">
                  <h5>Your Status</h5>
                  {!loading && (
                    <Badge bg={getStatusVariant()} className="status-badge">
                      {status}
                    </Badge>
                  )}
                </div>
                
                {loading ? (
                  <div className="loading-status">
                    <div className="spinner"></div>
                    <span>Checking status...</span>
                  </div>
                ) : (
                  <>
                    <div className="status-detail">
                      <div className="detail-item">
                        <span className="label">Username:</span>
                        <span className="value">{currentUser?.student_id || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Department:</span>
                        <span className="value">{currentUser?.department || "N/A"}</span>
                      </div>
                    
                    </div>
                    
                    {pdfUrl && (
                      <div className="download-section">
                        <Button variant="outline-success" className="w-100" href={pdfUrl}>
                          📄 Download Clearance Certificate
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>

            <Card className="help-card">
              <Card.Body>
                <h5>Need Help?</h5>
                <p>
                  If you encounter any issues or have questions about the
                  clearance process, contact:
                </p>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span>+251-58-220-0000</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <span>registrar@bdu.edu.et</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">🏢</span>
                    <span>University Registrar Office</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Clearance Request */}
        <Card className="request-card">
          <Card.Body>
            <div className="request-header">
              <div className="request-title">
                <h4>Clearance Request</h4>
                <p>
                  Start your digital clearance process. Ensure all your university
                  obligations are cleared.
                </p>
              </div>
              <div className="request-icon">📄</div>
            </div>
            
            <Alert variant="warning" className="notice-alert">
              <strong>Important Notice:</strong> Complete this clearance form
              properly to maintain a healthy relationship with the university.
              This is required for official transcripts, enrollment letters, and
              readmission considerations.
            </Alert>
            
            <div className="text-center">
              <Button
                className="request-btn"
                size="lg"
                onClick={handleOpenForm}
                disabled={status === "Pending"}
              >
                {status === "Pending" ? "Request Submitted" : "Start Clearance Request"}
              </Button>
              {status === "Pending" && (
                <p className="pending-text mt-2">
                  Your request is being processed. You'll be notified when it's complete.
                </p>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            {passwordSuccess ? (
              <Alert variant="success" className="mb-0">
                <div className="d-flex align-items-center">
                  <span className="success-icon">✅</span>
                  <span>Password changed successfully!</span>
                </div>
              </Alert>
            ) : (
              <>
                
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    isInvalid={!!passwordErrors.oldPassword}
                    placeholder="Enter your current password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {passwordErrors.oldPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    isInvalid={!!passwordErrors.newPassword}
                    placeholder="Enter your new password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {passwordErrors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    isInvalid={!!passwordErrors.confirmPassword}
                    placeholder="Confirm your new password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {passwordErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                {passwordErrors.submit && (
                  <Alert variant="danger" className="mt-3">
                    {passwordErrors.submit}
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePasswordModal}>
              Cancel
            </Button>
            {!passwordSuccess && (
              <Button 
                variant="primary" 
                type="submit"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Popup Modal for Clearance Form */}
      <ClearanceForm
        show={showFormModal}
        handleClose={handleCloseForm}
        currentUser={currentUser}
      />
    </div>
  );
}

export default ClearanceDashboard;
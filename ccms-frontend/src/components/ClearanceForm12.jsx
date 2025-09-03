import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  Card,
  Container,
  ListGroup,
} from "react-bootstrap";
import { CheckCircle, Clock } from "react-bootstrap-icons";
import { AppContext } from "../context/Context";
import axios from "axios";
import logo from "../assets/logo.png";
import "./ClearanceForm.css"; // We'll create this CSS file for custom styles

function ClearanceForm({ show, handleClose }) {
  const { currentUser, token, pdfUrl, setPdfUrl } = useContext(AppContext);
  const [uriLink, setUriLink] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    father_name: "",
    Gfather_name: "",
    sex: "",
    student_id: "",
    department: "",
    academic_year: "",
    semester: "",
    year_of_study: "",
    cause: "",
    otherReason: "",
    faculty: "",
    date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState({
    dormitory: { status: "pending", name: "Dormitory" },
    library: { status: "pending", name: "Library" },
    cafeteria: { status: "pending", name: "Cafeteria" },
    sportMaster: { status: "pending", name: "Sport Master" },
    facultyStore: { status: "pending", name: "Faculty Store" },
    registrar: { status: "pending", name: "Registrar" },
  });

  useEffect(() => {
    if (show && currentUser) {
      setFormData((prev) => ({
        ...prev,
        first_name: currentUser.first_name || "",
        student_id: currentUser.student_id || "",
        department: currentUser.department || "",
        academic_year: "",
        semester: "",
        year_of_study: "",
        father_name: currentUser.father_name || "",
        Gfather_name: currentUser.Gfather_name || "",
        sex: currentUser.sex || " ",
        cause: currentUser.cause || "",
        faculty: currentUser.faculty || "",
        otherReason: "",
        date: new Date().toISOString().slice(0, 16),
      }));
    }
  }, [show, currentUser, pdfUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.academic_year.trim())
      newErrors.academic_year = "Academic Year is required.";
    if (!formData.semester.trim()) newErrors.semester = "Semester is required.";
    if (!formData.year_of_study.trim())
      newErrors.year_of_study = "Year of Study is required.";
    if (!formData.cause) newErrors.cause = "Reason for Clearance is required.";
    if (formData.cause === "Other" && !formData.otherReason.trim())
      newErrors.otherReason = "Please specify the reason.";
    if (!formData.date) newErrors.date = "Date of Application is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const processApproval = async (official) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setApprovalStatus((prev) => ({
          ...prev,
          [official]: { ...prev[official], status: "approved" },
        }));
        resolve();
      }, 1000); // 1 second delay between each approval
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (pdfUrl) {
        setStatus({
          type: "info",
          message: "ℹ️ You already have a clearance request submitted.",
        });
        return;
      }

      if (!validateForm()) {
        setStatus({
          type: "danger",
          message:
            "❌ Please correct the highlighted fields before submitting.",
        });
        return;
      }

      setLoading(true);
      setShowApprovalModal(true);

      // Reset approval status
      const resetApprovalStatus = {};
      Object.keys(approvalStatus).forEach((key) => {
        resetApprovalStatus[key] = {
          ...approvalStatus[key],
          status: "processing",
        };
      });
      setApprovalStatus(resetApprovalStatus);

      // Process approvals sequentially
      const officials = Object.keys(approvalStatus);
      for (const official of officials) {
        await processApproval(official);
      }

      const response = await axios.post(
        "http://localhost:5000/api/student/fillForm",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUriLink(response.data.url);
        setPdfUrl(response.data.url);
        setStatus({
          type: "success",
          message:
            "🎉 You are cleared! You can preview and download your clearance certificate.",
        });
        setPdfPreview(true);
        // Close the approval modal after a short delay
        setTimeout(() => {
          setShowApprovalModal(false);
          setLoading(false);
        }, 1000);
      }
      if (response.data.success === false) {
        setStatus({
          type: "danger",
          message: `❌ ${response.data.message}`,
        });
        setPdfPreview(false);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Step Indicator Component
  const StepIndicator = ({ currentStep }) => {
    const steps = [
      { number: 1, name: "Personal Information" },
      { number: 2, name: "Academic Information" },
      { number: 3, name: "Review & Submit" },
    ];

    return (
      <div className="d-flex flex-column align-items-center mb-4">
        <div
          className="d-flex align-items-center justify-content-center mb-2"
          style={{ width: "100%" }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="d-flex flex-column align-items-center position-relative">
                <div
                  className={`d-flex align-items-center justify-content-center rounded-circle ${
                    currentStep >= step.number
                      ? "bg-primary text-white"
                      : "bg-light"
                  }`}
                  style={{
                    width: "70px",
                    height: "70px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.6)",
                    position: "relative",
                    zIndex: 2,
                    border: "3px solid #fff",
                    marginBottom: "8px",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {step.number}
                </div>
                <div
                  className={`text-center ${
                    currentStep >= step.number
                      ? "fw-bold text-primary"
                      : "text-muted"
                  }`}
                  style={{
                    fontSize: "1rem",
                    maxWidth: "500px",
                    lineHeight: "1.9",
                    marginBottom: "4px",
                  }}
                >
                  {step.name}
                </div>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className="position-relative"
                  style={{
                    width: "150px",
                    height: "6px",
                    margin: "0 -25px",
                    top: "-15px",
                    zIndex: 1,
                  }}
                >
                  <div
                    className="position-absolute h-100 bg-light"
                    style={{
                      width: "100%",
                      borderRadius: "3px",
                    }}
                  />
                  <div
                    className="position-absolute h-100 bg-primary"
                    style={{
                      width: currentStep > step.number ? "100%" : "0%",
                      borderRadius: "3px",
                      transition: "width 0.5s ease-in-out",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Approval Status Indicator Component
  const ApprovalStatusItem = ({ status, name }) => (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <span>{name}</span>
      {status === "processing" && <Spinner animation="border" size="sm" />}
      {status === "approved" && <CheckCircle className="text-success" />}
      {status === "pending" && <Clock className="text-muted" />}
    </ListGroup.Item>
  );

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      fullscreen={true}
      dialogClassName="modal-fullscreen-lg-down"
    >
      <Modal.Header closeButton className="dark-blue-bg">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <img src={logo} alt="Logo" style={{ width: "50px" }} />
          </div>
          <div>
            <h4 className="mb-0">Bahir Dar University</h4>
            <p className="mb-0">Clearance Application Form</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="p-0 d-flex flex-column" style={{ width: "100%" }}>
        <Container className="py-4 flex-grow-1" style={{ width: "100%" }}>
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-section" style={{ width: "100%" }}>
              <h4 className="section-title">Personal Information</h4>
              <p className="section-subtitle">
                Your personal details (auto-filled from your profile)
              </p>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.first_name}
                      readOnly
                      className="readonly-field"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Student ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.student_id}
                      readOnly
                      className="readonly-field"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Father's Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.father_name}
                      readOnly
                      className="readonly-field"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Grandfather's Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.Gfather_name}
                      readOnly
                      className="readonly-field"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Gender</Form.Label>
                    <div className="d-flex gap-4" style={{ display: "flex" }}>
                      <Form.Check
                        inline
                        type="radio"
                        name="sex"
                        label="Male"
                        checked={formData.sex === "M"}
                        disabled
                        className="disabled-radio"
                      />
                      <Form.Check
                        inline
                        type="radio"
                        name="sex"
                        label="Female"
                        checked={formData.sex === "F"}
                        disabled
                        className="disabled-radio"
                      />
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.department}
                      readOnly
                      className="readonly-field"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Faculty</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.faculty}
                      readOnly
                      className="readonly-field"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div
                className="d-flex justify-content-between mt-4"
                style={{ display: "flex" }}
              >
                <Button variant="outline-secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={nextStep}>
                  Next: Academic Information
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Academic Information */}
          {currentStep === 2 && (
            <div className="form-section" style={{ width: "100%" }}>
              <h4 className="section-title">Academic Information</h4>
              <p className="section-subtitle">
                Please provide your current academic details
              </p>

              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Academic Year *</Form.Label>
                    <Form.Control
                      type="text"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      isInvalid={!!errors.academic_year}
                      placeholder="e.g., 2024"
                      className={errors.academic_year ? "is-invalid" : ""}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.academic_year}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Semester *</Form.Label>
                    <Form.Select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      isInvalid={!!errors.semester}
                      className={errors.semester ? "is-invalid" : ""}
                    >
                      <option value="">Select semester</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="Summer">Summer</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.semester}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Year of Study *</Form.Label>
                    <Form.Select
                      name="year_of_study"
                      value={formData.year_of_study}
                      onChange={handleChange}
                      isInvalid={!!errors.year_of_study}
                      className={errors.year_of_study ? "is-invalid" : ""}
                    >
                      <option value="">Select year</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.year_of_study}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Reason for Clearance *</Form.Label>

                    <div
                      className="reasons-grid  p-3 rounded shadow-sm"
                      style={{ width: "50%", margin: "auto" }}
                    >
                      {[
                        "End of Academic Year",
                        "Graduation",
                        "Academic Dismissal",
                        "Withdrawing for Health/Family Reasons",
                        "Disciplinary Case",
                        "Other",
                      ].map((reasonOption) => (
                        <Form.Check
                          key={reasonOption}
                          type="radio"
                          label={
                            reasonOption === "Other"
                              ? "Other (please specify)"
                              : reasonOption
                          }
                          name="cause"
                          value={reasonOption}
                          checked={formData.cause === reasonOption}
                          onChange={handleChange}
                          className={errors.cause ? "is-invalid mb-2" : "mb-2"}
                        />
                      ))}
                    </div>

                    {errors.cause && (
                      <div className="text-danger mt-2">{errors.cause}</div>
                    )}
                  </Form.Group>
                </Col>

                {formData.cause === "Other" && (
                  <Col md={12} className="mt-3">
                    <Form.Group>
                      <Form.Label>Specify Reason *</Form.Label>
                      <Form.Control
                        type="text"
                        name="otherReason"
                        value={formData.otherReason}
                        onChange={handleChange}
                        isInvalid={!!errors.otherReason}
                        placeholder="Please specify your reason"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.otherReason}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date of Application *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      isInvalid={!!errors.date}
                      className={errors.date ? "is-invalid" : ""}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div
                className="d-flex justify-content-between mt-4"
                style={{ display: "flex" }}
              >
                <Button variant="outline-secondary" onClick={prevStep}>
                  Back
                </Button>
                <Button variant="primary" onClick={nextStep}>
                  Next: Review & Submit
                </Button>
              </div>
            </div>
          )}
          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <div className="form-section" style={{ width: "100%" }}>
              <h4 className="section-title">Review Your Information</h4>
              <p className="section-subtitle">
                Please review all information before submitting
              </p>

              <Card className="review-card">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Personal Information</h6>
                      <div className="review-item">
                        <span>Full Name:</span>
                        <strong>{formData.first_name}</strong>
                      </div>
                      <div className="review-item">
                        <span>Student ID:</span>
                        <strong>{formData.student_id}</strong>
                      </div>
                      <div className="review-item">
                        <span>Father's Name:</span>
                        <strong>{formData.father_name}</strong>
                      </div>
                      <div className="review-item">
                        <span>Grandfather's Name:</span>
                        <strong>{formData.Gfather_name}</strong>
                      </div>
                      <div className="review-item">
                        <span>Gender:</span>
                        <strong>
                          {formData.sex === "M" ? "Male" : "Female"}
                        </strong>
                      </div>
                      <div className="review-item">
                        <span>Department:</span>
                        <strong>{formData.department}</strong>
                      </div>
                    </Col>

                    <Col md={6}>
                      <h6>Academic Information</h6>
                      <div className="review-item">
                        <span>Your Faculty:</span>
                        <strong>{formData.faculty}</strong>
                      </div>
                      <div className="review-item">
                        <span>Academic Year:</span>
                        <strong>{formData.academic_year}</strong>
                      </div>
                      <div className="review-item">
                        <span>Semester:</span>
                        <strong>{formData.semester}</strong>
                      </div>
                      <div className="review-item">
                        <span>Year of Study:</span>
                        <strong>{formData.year_of_study}</strong>
                      </div>
                      <div className="review-item">
                        <span>Reason for Clearance:</span>
                        <strong>{formData.cause}</strong>
                      </div>
                      {formData.cause === "Other" && (
                        <div className="review-item">
                          <span>Specified Reason:</span>
                          <strong>{formData.otherReason}</strong>
                        </div>
                      )}
                      <div className="review-item">
                        <span>Date of Application:</span>
                        <strong>
                          {new Date(formData.date).toLocaleString()}
                        </strong>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div
                className="d-flex justify-content-between mt-4"
                style={{ display: "flex" }}
              >
                <Button variant="outline-secondary" onClick={prevStep}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Clearance Request"
                  )}
                </Button>
              </div>
            </div>
          )}

          {status && (
            <Alert
              variant={status.type}
              className="mb-4 status-alert alertstatuspdf"
            >
              <div className="d-flex align-items-center">
                <div className="alert-icon">
                  {status.type === "success"
                    ? "✅"
                    : status.type === "danger"
                    ? "❌"
                    : "ℹ️"}
                </div>
                <div className="flex-grow-1">
                  <h6>
                    {status.type === "success"
                      ? "Success"
                      : status.type === "danger"
                      ? "Error"
                      : "Notice"}
                  </h6>
                  <p className="mb-0">{status.message}</p>

                  {pdfPreview && status.type === "success" && (
                    <div className="mt-3 d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        // onClick={() => generatePDF().output("dataurlnewwindow")}
                      >
                        Preview PDF
                      </Button>
                      <a
                        href={uriLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline-success">Download PDF</Button>
                      </a>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setStatus(null)}
                  aria-label="Close"
                ></button>
              </div>
            </Alert>
          )}
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default ClearanceForm;

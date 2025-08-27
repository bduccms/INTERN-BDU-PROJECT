import { useState, useEffect, useContext } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import logo from "../assets/logo.png";
import seal from "../assets/seal.png";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// import mockStudentData from "../data/mockStudentData.json"; // adjust path
// import mockRiskData from "../data/mockRiskData.json"; // adjust path
import { AppContext } from "../context/Context";

function ClearanceForm({ show, handleClose }) {
  const { currentUser, token, pdfUrl, setPdfUrl } = useContext(AppContext);
  const [uriLink, setUriLink] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    father_name: "",
    Gfather_name: "", // Added Grandfather name
    sex: "",
    student_id: "",
    department: "",
    academic_year: "",
    semester: "",
    year_of_study: "",
    cause: "",
    otherReason: "",
    faculty: "computing",
    date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(false);

  // Auto-fill student data from mock data when modal opens
  useEffect(() => {
    if (show && currentUser) {
      setFormData((prev) => ({
        ...prev,
        first_name: currentUser.first_name || "",
        student_id: currentUser.student_id || "",
        department: currentUser.department || "",
        // Remove auto-fill for academic year, semester, and year of study - let students fill these
        academic_year: "",
        semester: "",
        year_of_study: "",
        // Auto-fill family information
        father_name: currentUser.father_name || "",
        Gfather_name: currentUser.Gfather_name || "",
        // Auto-fill sex from database
        sex: currentUser.sex || " ",
        cause: "",
        faculty: "computing",
        otherReason: "",
        date: new Date().toISOString().slice(0, 16),
      }));
    }
    console.log(pdfUrl);
  }, [show, currentUser, pdfUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate dynamic fields that user needs to fill
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

      const response = await axios.post(
        "http://localhost:5000/api/student/fillForm",
        formData, // request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUriLink(response.data.url);
        setLoading(false);
        setPdfUrl(response.data.url);
        setStatus({
          type: "success",
          message:
            "🎉 You are cleared! You can preview and download your clearance certificate.",
        });
        setPdfPreview(true);
      }
      if (response.data.success === false) {
        setStatus({
          type: "danger",
          message: `❌ ${response.data.message}`,
        });
        // console.log(response.data.status.request_id);
        setPdfPreview(false);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };
  // setTimeout(() => {
  //   const studentExists = mockStudentData.students.find(
  //     (student) =>
  //       student.studentId.trim().toLowerCase() ===
  //       formData.studentId.trim().toLowerCase()
  //   );

  //   setLoading(false);

  //   if (!studentExists) {
  //     setStatus({
  //       type: "danger",
  //       message: "❌ Student ID not found. Please check and try again.",
  //     });
  //     setPdfPreview(false);
  //     return;
  //   }

  //   const riskEntry = mockRiskData.risks.find(
  //     (entry) =>
  //       entry.studentId.trim().toLowerCase() ===
  //       formData.studentId.trim().toLowerCase()
  //   );

  //   if (riskEntry) {
  //     setStatus({
  //       type: "danger",
  //       message: `❌ Clearance denied: ${riskEntry.case}. Please contact the registrar.`,
  //     });
  //     setPdfPreview(false);
  //     return;
  //   }

  //   setStatus({
  //     type: "success",
  //     message:
  //       "🎉 You are cleared! You can preview and download your clearance certificate.",
  //   });
  //   setPdfPreview(true);
  // }, 2000);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      fullscreen
      backdrop="static"
      keyboard={false}
      centered
      className="modern-form-modal"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center gap-3">
          <img src={logo} alt="BDU Logo" width="60" />
          <div>
            <h4 className="mb-0 fw-bold">
              Regular Undergraduate Student's Clearance Sheet
            </h4>
            <small>Bahir Dar University</small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        <Alert variant="info" className="mb-4 shadow rounded">
          <strong>Important:</strong> Please complete and submit this form
          properly.
        </Alert>

        <Form
          onSubmit={handleSubmit}
          className="p-4 bg-white rounded shadow-sm border"
        >
          <h5 className="fw-bold border-bottom pb-2 mb-3 text-primary">
            Personal Information
          </h5>

          <Alert variant="info" className="mb-3">
            <strong>📋 Form Information:</strong> Fields marked with{" "}
            <span className="text-muted">(Auto-filled)</span> are pre-filled
            from your student profile. You only need to complete the remaining
            fields marked with <span className="text-danger">*</span>.
          </Alert>

          {/* Student Name */}
          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <Form.Group controlId="studentName">
                <Form.Label className="fw-bold">
                  Student Name{" "}
                  <small className="text-muted">(Auto-filled)</small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="studentName"
                  value={formData.first_name}
                  onChange={handleChange}
                  isInvalid={!!errors.first_name}
                  placeholder="John Doe"
                  required
                  readOnly
                  className="bg-light"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.first_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Father Name */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="fatherName">
                <Form.Label className="fw-bold">
                  Father's Name{" "}
                  <small className="text-muted">(Auto-filled)</small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  isInvalid={!!errors.father_name}
                  placeholder="Father Name"
                  required
                  readOnly
                  className="bg-light"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.father_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Grandfather Name */}
          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <Form.Group controlId="Gfather_name">
                <Form.Label className="fw-bold">
                  Grandfather's Name{" "}
                  <small className="text-muted">(Auto-filled)</small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="Gfather_name"
                  value={formData.Gfather_name}
                  onChange={handleChange}
                  isInvalid={!!errors.Gfather_name}
                  placeholder="Grandfather Name"
                  required
                  readOnly
                  className="bg-light"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Gfather_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Sex */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="sex">
                <Form.Label className="fw-bold">
                  Sex <small className="text-muted">(Auto-filled)</small>
                </Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    name="sex"
                    value="Male"
                    label="Male"
                    checked={formData.sex === "M"}
                    onChange={handleChange}
                    disabled
                    className="bg-light"
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="sex"
                    value="Female"
                    label="Female"
                    checked={formData.sex === "F"}
                    onChange={handleChange}
                    disabled
                    className="bg-light"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Student ID */}
          <Row className="mb-3">
            <Col md={3} className="mb-3">
              <Form.Group controlId="studentId">
                <Form.Label className="fw-bold">
                  Student ID <small className="text-muted">(Auto-filled)</small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  isInvalid={!!errors.student_id}
                  placeholder="STU001"
                  required
                  readOnly
                  className="bg-light"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.student_id}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Department */}
            <Col md={3} className="mb-3">
              <Form.Group controlId="department">
                <Form.Label className="fw-bold">
                  Department <small className="text-muted">(Auto-filled)</small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  isInvalid={!!errors.department}
                  placeholder="Computer Science"
                  required
                  readOnly
                  className="bg-light"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.department}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Academic Year */}
            <Col md={3} className="mb-3">
              <Form.Group controlId="academic_year">
                <Form.Label className="fw-bold">Academic Year *</Form.Label>
                <Form.Control
                  type="text"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  isInvalid={!!errors.academic_year}
                  placeholder="e.g., 2024"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.academic_year}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Semester */}
            <Col md={3} className="mb-3">
              <Form.Group controlId="semester">
                <Form.Label className="fw-bold">Semester *</Form.Label>
                <Form.Select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  isInvalid={!!errors.semester}
                  required
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
          </Row>

          {/* Year of Study */}
          <Row className="mb-3">
            <Col md={3} className="mb-3">
              <Form.Group controlId="yearOfStudy">
                <Form.Label className="fw-bold">Year of Study *</Form.Label>
                <Form.Select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  isInvalid={!!errors.year_of_study}
                  required
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

            {/* Reason for Clearance */}
            <Col md={9} className="mb-3">
              <Form.Label className="fw-bold">
                Reason for Clearance *
              </Form.Label>
              <div>
                {[
                  "End of Academic Year",
                  "Graduation",
                  "Academic Dismissal",
                  "Withdrawing for Health/Family Reasons",
                  "Disciplinary Case",
                  "Other",
                ].map((reasonOption) => (
                  <Form.Check
                    inline
                    type="radio"
                    key={reasonOption}
                    label={
                      reasonOption === "Other"
                        ? "Other (please specify)"
                        : reasonOption
                    }
                    name="cause"
                    value={reasonOption}
                    checked={formData.cause === reasonOption}
                    onChange={handleChange}
                    required
                  />
                ))}
              </div>
              {errors.cause && (
                <div className="text-danger mt-1">{errors.cause}</div>
              )}

              {/* Show input for 'Other' reason */}
              {formData.cause === "Other" && (
                <Form.Control
                  type="text"
                  name="otherReason"
                  value={formData.otherReason}
                  onChange={handleChange}
                  isInvalid={!!errors.otherReason}
                  placeholder="Please specify other reason"
                  className="mt-2"
                  required
                />
              )}
              <Form.Control.Feedback type="invalid">
                {errors.otherReason}
              </Form.Control.Feedback>
            </Col>
          </Row>

          {/* Date of Application */}
          <Form.Group className="mb-4" controlId="date">
            <Form.Label className="fw-bold">Date of Application *</Form.Label>
            <Form.Control
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              isInvalid={!!errors.date}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.date}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
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
        </Form>

        {status && (
          <Alert
            variant={status.type === "success" ? "success" : "danger"}
            className="mt-4 shadow rounded d-flex align-items-center gap-3 p-3"
            style={{
              maxWidth: "600px",
              margin: "30px auto",
              fontSize: "1.1rem",
              borderLeft: `5px solid ${
                status.type === "success" ? "#28a745" : "#dc3545"
              }`,
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                color: status.type === "success" ? "#28a745" : "#dc3545",
                userSelect: "none",
              }}
            >
              {status.type === "success" ? "✅" : "❌"}
            </div>

            <div className="flex-grow-1">
              <strong>
                {status.type === "success" ? "Success!" : "Error!"}
              </strong>
              <p className="mb-0">{status.message}</p>

              {/* PDF Buttons */}
              {pdfPreview && status.type === "success" && (
                <div className="mt-3 d-flex gap-2">
                  <Button
                    variant="info"
                    // onClick={() => generatePDF().output("dataurlnewwindow")}
                  >
                    👀 Preview PDF
                  </Button>
                  {/* <Button
                    variant="success"
                    // onClick={() => {
                    //   const pdfDoc = generatePDF();
                    //   pdfDoc.save(
                    //     `${formData.student_id}_ClearanceCertificate.pdf`
                    //   );
                    // }}
                  >
                    📥 Download PDF
                  </Button> */}

                  <a
                    href={uriLink}
                    // download={`${formData.student_id}_ClearanceCertificate.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="success">📥 Download PDF</Button>
                  </a>
                </div>
              )}
            </div>
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ClearanceForm;

import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { PencilSquare, Trash, Search } from "react-bootstrap-icons";
import { FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.png";

// ✅ Import mock data

import { AppContext } from "../context/Context";
import axios from "axios";

function DepartmentAdmin() {
  const [riskStudents, setRiskStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [riskCase, setRiskCase] = useState("");
  const [formError, setFormError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [riskStatusFilter, setRiskStatusFilter] = useState("all"); // Add status filter
  const { token, setToken, currentUser } = useContext(AppContext);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  // ✅ Load risk data from localStorage (or fallback to JSON)

  const fetchRisks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/staff_official/Warnings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setRiskStudents(response.data.rows);
        // console.log(response.data.rows);
      }
      const res = await axios.get(
        "http://localhost:5000/api/staff_official/seeAllStudents",

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setAllStudents(res.data.rows);
        // console.log(res.data.rows);
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (token) {
      // only fetch when token is available
      fetchRisks();
    }
  }, [token]);

  // ✅ Save riskStudents to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem("riskStudents", JSON.stringify(riskStudents));
  // }, [riskStudents]);

  // Filter students based on search term and department
  const filteredStudents = allStudents.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    // const matchesDepartment =
    //   !filterDepartment || student.department === filterDepartment;
    return matchesSearch;
  });

  const filteredRiskStudents = riskStudents.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.student_id.toLowerCase().includes(studentSearch.toLowerCase());
    // const matchesDepartment =
    //   !filterDepartment || student.department === filterDepartment;
    return matchesSearch;
  });

  // Get unique departments for filter
  // const departments = [
  //   ...new Set(mockStudentData.students.map((student) => student.department)),
  // ];

  const openAddModal = () => {
    setFormMode("add");
    setSelectedStudent(null);
    setRiskCase("");
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (risk_id) => {
    setFormMode("edit");
    setEditingIndex(risk_id);
    const student = riskStudents.find((risks) => risks.risk_id === risk_id);
    if (!student) return;
    setEditingIndex(risk_id);
    setSelectedStudent({
      first_name: student.first_name,
      father_name: student.father_name,
      student_id: student.student_id,
      department: student.department,
      risk_id: student.risk_id,
    });
    setRiskCase(student.cause);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
    setSelectedStudent(null);
    setRiskCase("");
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!selectedStudent) {
        setFormError("Please select a student first.");
        return;
      }

      // if (!riskCase.trim()) {
      //   setFormError("Please enter the risk case.");
      //   return;
      // }

      if (!(riskCase || "").trim()) {
        setFormError("Please enter the risk case.");
        return;
      }

      const formdata = {
        first_name: selectedStudent.first_name,
        father_name: selectedStudent.father_name,
        student_id: selectedStudent.student_id,
        department: selectedStudent.department,
        cause: riskCase.trim(),
        added_by: currentUser.official_id,
        ...(formMode === "edit" && { risk_id: selectedStudent.risk_id }),
      };

      // const newRiskEntry = {
      //   firstName: selectedStudent.firstName,
      //   lastName: selectedStudent.lastName,
      //   studentId: selectedStudent.studentId,
      //   department: selectedStudent.department,
      //   riskCase: riskCase.trim(),
      //   addedBy: currentUser?.name
      //     ? `${currentUser.name} (${currentUser.department || "No Dept"})`
      //     : `${currentUser?.firstName || ""} ${currentUser?.lastName || ""} (${
      //         currentUser?.department || "No Dept"
      //       })`.trim() || "Unknown Official",
      //   addedOn: new Date().toISOString().split("T")[0],
      //   status: "atRisk",
      //   resolvedDate: null,
      // };

      if (formMode === "add") {
        setRiskStudents((prev) => [...prev, formdata]);

        const response = await axios.post(
          "http://localhost:5000/api/staff_official/addWarning",
          formdata,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          fetchRisks();
        } else {
          console.log(error);
        }
      } else if (formMode === "edit") {
        console.log("FormData before submit:", formdata);
        console.log("selectedStudent before submit:", selectedStudent);

        const response = await axios.put(
          `http://localhost:5000/api/staff_official/editWarning/${formdata.risk_id}`,
          formdata,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          const updatedStudents = [...riskStudents];
          updatedStudents[editingIndex] = formdata;
          setRiskStudents(updatedStudents);
          fetchRisks();
        }
      }

      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  // Rename function to be more descriptive
  const handleResolveRisk = async (risk_id) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to mark this risk as resolved? This will keep the record for historical purposes."
        )
      ) {
        const response = await axios.delete(
          `http://localhost:5000/api/staff_official/deleteWarning/${risk_id}`,

          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          fetchRisks();
        } else {
          console.log(response.data.message);
        }
        // const student = filteredRiskStudents[index];
        // // Find the actual index in the original array
        // const actualIndex = riskStudents.findIndex(
        //   (risk) =>
        //     risk.studentId === student.studentId &&
        //     risk.riskCase === student.riskCase &&
        //     risk.addedOn === student.addedOn
        // );
        // const updatedList = [...riskStudents];
        // updatedList[actualIndex] = {
        //   ...updatedList[actualIndex],
        //   status: "resolved",
        //   resolvedDate: new Date().toISOString().split("T")[0],
        // };
        // setRiskStudents(updatedList);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Check if student is already in risk list (only atRisk risks)
  const isStudentInRisk = (studentId) => {
    return riskStudents.some((risk) => risk.student_id === studentId);
  };

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#f8f9fc", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <img src={logo} alt="BDU Logo" width="50" className="me-3" />
          <div>
            <h3 className="mb-0">Officials Admin Panel</h3>
            <small className="text-muted">Risk Management Panel</small>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <span className="fw-semibold text-primary">
            Department Official -{" "}
            {currentUser?.first_name || "Department Official"}
          </span>
          <Button
            variant="outline-danger"
            size="sm"
            className="mt-1"
            onClick={() => {
              localStorage.removeItem("token");
              setToken("");

              window.location.href = "/login";
            }}
          >
            <FiLogOut style={{ marginRight: "5px" }} /> Logout
          </Button>
        </div>
      </div>

      {/* Students at Risk Summary */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-1">
              Students at Risk in{" "}
              {currentUser?.assigned_department || "Department Official"}
            </h5>
            <p className="text-muted mb-0">Students with pending issues</p>
          </div>
          <div className="display-4 text-danger fw-bold">
            {/* {riskStudents.filter((risk) => risk.status === "atRisk").length} */}
          </div>
          <div className="ms-3 fs-1 text-danger">⚠️</div>
        </Card.Body>
      </Card>

      {/* Risk Table Management */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Risk Table Management</h5>
            <InputGroup style={{ width: "300px" }}>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search Risk Student..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </InputGroup>
            <div className="d-flex align-items-center">
              {/* <Form.Select
                style={{ width: "150px" }}
                value={riskStatusFilter}
                onChange={(e) => setRiskStatusFilter(e.target.value)}
                className="me-3"
              >
                <option value="all">All Status</option>
                <option value="atRisk">At Risk Only</option>
                <option value="resolved">Resolved Only</option>
              </Form.Select> */}
              <Button variant="danger" onClick={openAddModal}>
                + Add Student to Risk
              </Button>
            </div>
          </div>
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Risk Case</th>
                <th>Added By</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiskStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.first_name}</td>
                  <td>{student.father_name}</td>
                  <td>{student.student_id}</td>
                  <td>{student.department}</td>
                  <td>{student.cause}</td>
                  <td>{student.added_by}</td>
                  {/* <td>
                    {student.status === "atRisk" && (
                      <span className="badge bg-danger">At Risk</span>
                    )}
                    {student.status === "resolved" && (
                      <span className="badge bg-success">Resolved</span>
                    )}
                    {student.resolvedDate && (
                      <span className="badge bg-info ms-2">
                        Resolved on: {student.resolvedDate}
                      </span>
                    )}
                  </td> */}
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => openEditModal(student.risk_id)}
                    >
                      <PencilSquare />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleResolveRisk(student.risk_id)}
                    >
                      Resolve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Student Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {formMode === "add"
              ? "Add Student to Risk"
              : "Edit Student Risk Information"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}

          {formMode === "add" && (
            <>
              {/* Search and Filter Section */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Search Students</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Search />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}></Col>
              </Row>

              {/* Student Selection Section */}
              <div className="mb-3">
                <h6>Select a Student:</h6>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Row>
                    {filteredStudents.map((student) => (
                      <Col md={6} key={student.student_id} className="mb-2">
                        <Card
                          className={`cursor-pointer ${
                            selectedStudent?.student_id === student.student_id
                              ? "border-primary bg-light"
                              : ""
                          } ${
                            isStudentInRisk(student.student_id)
                              ? "border-warning"
                              : ""
                          }`}
                          onClick={() =>
                            !isStudentInRisk(student.student_id) &&
                            handleStudentSelect(student)
                          }
                          style={{
                            cursor: isStudentInRisk(student.student_id)
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{student.first_name}</h6>
                                <small className="text-muted">
                                  ID: {student.student_id}
                                </small>
                                <br />
                                <small className="text-muted">
                                  {student.department}
                                </small>
                              </div>
                              {isStudentInRisk(student.student_id) && (
                                <Badge bg="warning" text="dark">
                                  Already in Risk
                                </Badge>
                              )}
                              {selectedStudent?.student_id ===
                                student.student_id && (
                                <Badge bg="primary">Selected</Badge>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </>
          )}

          {/* Selected Student Display */}
          {selectedStudent && (
            <Alert variant="info" className="mb-3">
              <strong>Selected Student:</strong>
              <br />
              Name: {selectedStudent.first_name} {selectedStudent.father_name}
              <br />
              ID: {selectedStudent.student_id}
              <br />
              Department: {selectedStudent.department}
            </Alert>
          )}

          {/* Risk Case Input */}
          <Form.Group className="mb-3">
            <Form.Label>Risk Case Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={riskCase}
              onChange={(e) => setRiskCase(e.target.value)}
              placeholder="Describe the risk case or issue with this student..."
              required
            />
          </Form.Group>

          <Button
            type="button"
            variant="danger"
            className="w-100"
            onClick={handleFormSubmit}
            disabled={!selectedStudent || !riskCase.trim()}
          >
            {formMode === "add"
              ? "Add Student to Risk"
              : "Update Risk Information"}
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default DepartmentAdmin;

import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Nav,
  InputGroup,
  Badge,
} from "react-bootstrap";
import {
  PencilSquare,
  Trash,
  Search,
  Download,
  Phone,
} from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import logo from "../assets/logo.png";
import OfficialForm from "../components/OfficialForm";
import AdvisorForm from "../components/AdvisorForm";

// ✅ Import mock data
import mockOfficials from "../data/mockOfficialsData.json";
import mockRiskData from "../data/mockRiskData.json";
import { AppContext } from "../context/Context";
import axios from "axios";

function MainAdmin() {
  const [activeTab, setActiveTab] = useState("officials"); // "officials" | "risks"
  const [officials, setOfficials] = useState([]);
  const [advisors, setAdvisors] = useState([]); // State for advisors
  const [risks, setRisks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [editingIndex, setEditingIndex] = useState(null);
  const { token, setToken, currentUser } = useContext(AppContext);

  const [officialForm, setOfficialForm] = useState({
    official_id: "",
    first_name: "",
    last_name: "",
    profession: "",
    education: "",
    assigned_department: "",

    email: "",
    phone: "",

    password: "",
  });

  const [advisorForm, setAdvisorForm] = useState({
    advisor_id: "",
    first_name: "",
    last_name: "",
    profession: "",
    education: "",
    department: "",
    email: "",
    phone: "",
  });

  const [formError, setFormError] = useState(null);

  const [summary, setSummary] = useState({
    totalOfficials: 0,
    totalRisk: 0,
    totalClearanceRequest: 0,
  });

  const [officialSearch, setOfficialSearch] = useState(""); // 🔥 Search input for officials
  const [advisorSearch, setAdvisorSearch] = useState(""); // 🔥 Search input for advisors
  const [riskSearch, setRiskSearch] = useState(""); // 🔥 Search input for risks
  const [riskStatusFilter, setRiskStatusFilter] = useState("all"); // 🔥 Status filter for risks
  const [totalOfficials, setTotalOfficial] = useState([]);
  const [totalAdvisors, setTotalAdvisors] = useState([]); // total advisors for advisors tab
  const [totalRisk, setTotalRisk] = useState([]);
  const [totalClearanceRequest, setTotalClearanceRequest] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);

  const [isFilterByStatus, setIsFilterByStatus] = useState("");
  // ✅ Load data from localStorage or fallback JSON
  const [clearanceYearFilter, setClearanceYearFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  const [filteredClearanceRequests, setFilteredClearanceRequests] = useState(
    []
  );

  const fetchAdvisors = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/totalAdvisor",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setTotalAdvisors(response.data.rows); // this will populate filteredAdvisors too
      }
    } catch (error) {
      console.error("Error fetching advisors:", error);
    }
  };

  useEffect(() => {
    if (token) fetchAdvisors();
  }, [token]);

  const fetchData = async () => {
    try {
      // console.log("Token being sent:", token);

      const [warningsRes, clearancesRes, officialsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/seeWarnings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/seeClearances", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/totalOfficial", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (warningsRes.data.success) setTotalRisk(warningsRes.data.rows);
      if (clearancesRes.data.success)
        setTotalClearanceRequest(clearancesRes.data.rows);
      if (officialsRes.data.success) setTotalOfficial(officialsRes.data.rows);
      const check = officialsRes.data.rows.filter(
        (official) => official.status === "active"
      );
      setSummary({
        // totalOfficials: officialsRes.data.rows.length,
        totalOfficials: check?.length || 0,
        totalRisk: warningsRes.data.rows?.length || 0,
        totalClearanceRequest: clearancesRes.data.rows?.length || 0,
      });
      // console.log(clearancesRes.data.rows);
      setFilteredRisks(warningsRes.data.rows);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    // console.log("Token being sent:", token);
    if (token) {
      fetchData();
    }
  }, [token]);

  useEffect(() => {
    if (clearanceYearFilter) {
      const filtered = totalClearanceRequest.filter((request) =>
        request.academic_year.toString().includes(clearanceYearFilter)
      );
      setFilteredClearanceRequests(filtered);
    } else {
      setFilteredClearanceRequests(totalClearanceRequest);
    }

    if (riskSearch) {
      const filtered = totalRisk.filter((risk) =>
        risk.first_name.toLowerCase().includes(riskSearch.toLowerCase())
      );
      setFilteredRisks(filtered);
    } else {
      setFilteredRisks(totalRisk);
    }
    if (isFilterByStatus && isFilterByStatus != "all") {
      const filtered = totalRisk.filter((risk) =>
        risk.deleted.toString().includes(isFilterByStatus)
      );
      setFilteredRisks(filtered);
    } else {
      setFilteredRisks(totalRisk);
    }
  }, [
    clearanceYearFilter,
    totalClearanceRequest,
    totalRisk,
    riskSearch,
    isFilterByStatus,
  ]);

  const openAddModal = () => {
    setFormMode("add");
    setOfficialForm({
      official_id: "",
      first_name: "",
      last_name: "",
      profession: "",
      education: "",
      assigned_department: "",

      email: "",
      phone: "",

      password: "",
    });
    setShowModal(true);
  };

  const openEditModal = (id) => {
    setFormMode("edit");
    const official = totalOfficials.find((o) => o.official_id === id);
    if (!official) return; // safety check
    setOfficialForm(official);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOfficialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation (all required fields except password in edit mode)
    if (
      !officialForm.first_name ||
      !officialForm.last_name ||
      !officialForm.profession ||
      !officialForm.education ||
      !officialForm.assigned_department ||
      !officialForm.email ||
      !officialForm.phone ||
      (formMode === "add" && !officialForm.password) // password required only when adding
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      if (formMode === "edit") {
        // Exclude password when editing
        const { official_id, password, ...editData } = officialForm;

        const response = await axios.put(
          `http://localhost:5000/api/admin/editOfficial/${officialForm.official_id}`,
          editData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          fetchData(); // refresh list
          close_Modal();
        } else {
          setFormError(response.data.message);
        }
      } else {
        // Adding a new official (include password)
        const response = await axios.post(
          `http://localhost:5000/api/admin/addOfficial`,
          officialForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          fetchData();
          close_Modal();
        } else {
          setFormError(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      setFormError("Server error. Please try again.");
    }
  };

  const handleDelete = async (official_id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/deleteOfficial/${official_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        fetchData();
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
    // const updatedList = totalOfficials.filter(
    //   (official) => official.official_id !== id
    // );
    // setTotalOfficial(updatedList);
  };

  const open_Add_Modal = () => {
    setFormMode("add");
    setAdvisorForm({
      advisor_id: "",
      first_name: "",
      last_name: "",
      profession: "",
      education: "",
      department: "",
      email: "",
      phone: "",
    });
    setShowAdvisorModal(true);
  };

  const open_Edit_Modal = (id) => {
    setFormMode("edit");
    const advisor = totalAdvisors.find((a) => a.advisor_id === id);
    if (!advisor) return;
    setAdvisorForm(advisor);
    setShowAdvisorModal(true);
  };

  const close_Modal = () => {
    setShowAdvisorModal(false);
    setFormError(null);
  };

  const handleAdvisorFormChange = (e) => {
    const { name, value } = e.target;
    setAdvisorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdvisorFormSubmit = async (e) => {
    e.preventDefault();

    // Validation (all required fields except password in edit mode)
    if (
      !advisorForm.first_name ||
      !advisorForm.last_name ||
      !advisorForm.profession ||
      !advisorForm.education ||
      !advisorForm.email ||
      !advisorForm.department ||
      !advisorForm.phone // ||
      // (formMode === "add" && !advisorForm.password) // password required only when adding
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      if (formMode === "edit") {
        // Exclude password when editing
        const { advisor_id, ...editData } = advisorForm;

        const response = await axios.put(
          `http://localhost:5000/api/admin/editAdvisor/${advisorForm.advisor_id}`,
          editData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          // Refresh advisor data
          const advisorResponse = await axios.get(
            "http://localhost:5000/api/admin/totalAdvisor",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (advisorResponse.data.success) {
            setTotalAdvisors(advisorResponse.data.rows);
          }
          close_Modal();
        } else {
          setFormError(response.data.message);
        }
      } else {
        // Adding a new advisor (include password)
        const response = await axios.post(
          `http://localhost:5000/api/admin/addAdvisor`,
          advisorForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          // Refresh advisor data
          const advisorResponse = await axios.get(
            "http://localhost:5000/api/admin/totalAdvisor",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (advisorResponse.data.success) {
            setTotalAdvisors(advisorResponse.data.rows);
          }
          close_Modal();
        } else {
          setFormError(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      setFormError("Server error. Please try again.");
    }
  };

  const handleAdvisorDelete = async (advisor_id) => {
    if (window.confirm("Are you sure you want to delete this advisor?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/admin/deleteAdvisor/${advisor_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          // Refresh advisor data
          const advisorResponse = await axios.get(
            "http://localhost:5000/api/admin/totalAdvisor",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (advisorResponse.data.success) {
            setTotalAdvisors(advisorResponse.data.rows);
          }
        } else {
          alert("Failed to delete advisor: " + response.data.message);
        }
      } catch (error) {
        console.error("Error deleting advisor:", error);
        alert("Error deleting advisor. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  // ✅ Filtered lists based on search inputs
  // const filteredOfficials = totalOfficials.filter((official) =>
  //   official.first_name.toLowerCase().includes(officialSearch.toLowerCase())
  // );

  const check = totalOfficials.filter(
    (official) => official.status === "active"
  );
  const filteredOfficials = check.filter((official) =>
    official.first_name.toLowerCase().includes(officialSearch.toLowerCase())
  );

  // search advisors by its name
  const checked = totalAdvisors.filter(
    (advisor) => advisor.status === "active"
  );

  const filteredAdvisors = checked.filter((advisor) =>
    advisor.first_name.toLowerCase().includes(advisorSearch.toLowerCase())
  );

  // ✅ Export filtered data to CSV
  const exportFilteredToCSV = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(data[0]).join(","), // headers
        ...data.map((row) => Object.values(row).join(",")),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Export filtered data to Excel
  const exportFilteredToExcel = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      // Generate Excel file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  const exportToExcel = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting to Excel");
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [Object.keys(data[0]).join(",")]
        .concat(data.map((row) => Object.values(row).join(",")))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h3 className="mb-0">Admin Panel</h3>
            <small className="text-muted">
              Campus Clearance Management System
            </small>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end">
          <span className="fw-semibold text-primary">
            👤 {currentUser?.first_name || "Admin User"} (
            {currentUser?.role || "Main Administrator"})
          </span>
          <Button
            variant="outline-danger"
            size="sm"
            className="mt-1"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h5>Total Officials</h5>
              <div className="display-4 fw-bold">{summary.totalOfficials}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h5>Students at Risk</h5>
              <div className="display-4 fw-bold text-danger">
                {summary.totalRisk}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h5>Clearance Requests</h5>
              <div className="display-4 fw-bold text-success">
                {summary.totalClearanceRequest}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
      >
        <Nav.Item>
          <Nav.Link eventKey="officials">Department Officials</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="risks">Risk Tables Overview</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="clearance">Clearance</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="advisors">Advisors</Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Clearance Requests Table */}
      {activeTab === "clearance" && (
        <Card className="mt-3 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Filter by year..."
                  value={clearanceYearFilter}
                  onChange={(e) => setClearanceYearFilter(e.target.value)}
                />
              </InputGroup>
              <div>
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() =>
                    exportToCSV(filteredClearanceRequests, "clearance")
                  }
                >
                  <Download className="me-1" /> CSV
                </Button>
                <Button
                  variant="info"
                  onClick={() =>
                    exportToExcel(filteredClearanceRequests, "clearance")
                  }
                >
                  <Download className="me-1" /> Excel
                </Button>
              </div>
            </div>

            {/* {loading.clearance ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading clearance requests...</p>
              </div>
            ) : error.clearance ? (
              <Alert variant="danger" className="text-center">
                {error.clearance}
                <Button variant="link" onClick={fetchClearanceRequests}>
                  Retry
                </Button>
              </Alert>
            ) : ( */}

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>Student ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Grandfather Name</th>
                  <th>Sex</th>
                  <th>Department</th>

                  <th>year of study</th>

                  <th>Semester</th>

                  <th>Reason of clearance</th>
                  <th>Acadamic year</th>
                  {/* <th>Year of application</th> */}
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredClearanceRequests?.length > 0 ? (
                  filteredClearanceRequests.map((request, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{request.student_id}</td>
                      <td>{request.first_name}</td>
                      <td>{request.father_name}</td>
                      <td>{request.Gfather_name}</td>
                      <td>{request.sex}</td>
                      <td>{request.department}</td>
                      <td>{request.year_of_study}</td>
                      <td>{request.semester}</td>
                      <td>{request.cause}</td>
                      <td>{request.academic_year}</td>
                      <td>
                        <Badge
                          bg={
                            request.status === "Approved"
                              ? "success"
                              : request.status === "Pending"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td>{request.request_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No requests found
                      {clearanceYearFilter ? ` for ${clearanceYearFilter}` : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Officials Table */}
      {activeTab === "officials" && (
        <Card className="mt-3 shadow-sm">
          <Card.Body>
            {/* Search bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search officials..."
                  value={officialSearch}
                  onChange={(e) => setOfficialSearch(e.target.value)}
                />
              </InputGroup>
              <div>
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() =>
                    exportFilteredToCSV(
                      filteredOfficials,
                      "filtered_officials.csv"
                    )
                  }
                >
                  <Download className="me-1" /> Download CSV
                </Button>
                <Button
                  variant="info"
                  className="me-2"
                  onClick={() =>
                    exportFilteredToExcel(
                      filteredOfficials,
                      "filtered_officials"
                    )
                  }
                >
                  <Download className="me-1" /> Export Excel
                </Button>
                <Button variant="primary" onClick={openAddModal}>
                  + Add Official
                </Button>
              </div>
            </div>
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Official ID</th>
                  <th>FirstName</th>
                  <th>LastName</th>
                  <th>Profession</th>
                  <th>Education</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficials.length > 0 ? (
                  filteredOfficials.map((official, index) => (
                    <tr key={index}>
                      <td>{official.official_id}</td>
                      <td>{official.first_name}</td>
                      <td>{official.last_name}</td>
                      <td>{official.profession}</td>
                      <td>{official.education}</td>
                      <td>{official.assigned_department}</td>
                      <td> {official.email}</td>
                      <td>{official.phone}</td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => openEditModal(official.official_id)}
                        >
                          <PencilSquare />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(official.official_id)}
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No matching officials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Risk Table */}
      {activeTab === "risks" && (
        <Card className="mt-3 shadow-sm">
          <Card.Body>
            {/* Search bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <InputGroup style={{ width: "300px" }} className="me-3">
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search risk students..."
                    value={riskSearch}
                    onChange={(e) => setRiskSearch(e.target.value)}
                  />
                </InputGroup>
                <Form.Select
                  style={{ width: "150px" }}
                  value={isFilterByStatus}
                  onChange={(e) => setIsFilterByStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="0">At Risk Only</option>
                  <option value="1">Resolved Only</option>
                </Form.Select>
              </div>
              <div>
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() =>
                    exportFilteredToCSV(
                      filteredRisks,
                      "filtered_risk_students.csv"
                    )
                  }
                >
                  <Download className="me-1" /> Download CSV
                </Button>
                <Button
                  variant="info"
                  onClick={() =>
                    exportFilteredToExcel(
                      filteredRisks,
                      "filtered_risk_students"
                    )
                  }
                >
                  <Download className="me-1" /> Export Excel
                </Button>
              </div>
            </div>
            <h5>Risk Tables Overview</h5>
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Risk Case</th>
                  <th>Added by</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.length > 0 ? (
                  filteredRisks.map((risk, index) => (
                    <tr key={index}>
                      <td>{risk.first_name}</td>
                      <td>{risk.father_name}</td>
                      <td>{risk.student_id}</td>
                      <td>{risk.department}</td>
                      <td>{risk.cause}</td>
                      <td>
                        {/* {risk.added_by} */}
                        {totalOfficials.find(
                          (official) => official.official_id === risk.added_by
                        )?.first_name || "Unknown"}
                      </td>
                      <td>
                        {risk.deleted === 0 && (
                          <span className="badge bg-danger">At Risk</span>
                        )}
                        {risk.deleted === 1 && (
                          <span className="badge bg-success">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No matching risk students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/*Advisors Table */}
      {activeTab === "advisors" && (
        <Card className="mt-3 shadow-sm">
          <Card.Body>
            {/* Search bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <InputGroup style={{ width: "300px" }}>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search advisors..."
                  value={advisorSearch}
                  onChange={(e) => setAdvisorSearch(e.target.value)}
                />
              </InputGroup>
              <div>
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() =>
                    exportFilteredToCSV(
                      filteredAdvisors,
                      "filtered_advisors.csv"
                    )
                  }
                >
                  <Download className="me-1" /> Download CSV
                </Button>
                <Button
                  variant="info"
                  className="me-2"
                  onClick={() =>
                    exportFilteredToExcel(filteredAdvisors, "filtered_advisors")
                  }
                >
                  <Download className="me-1" /> Export Excel
                </Button>
                <Button variant="primary" onClick={open_Add_Modal}>
                  + Add Advisors
                </Button>
              </div>
            </div>
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Advisors ID</th>
                  <th>FirstName</th>
                  <th>LastName</th>
                  <th>Profession</th>
                  <th>Education</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvisors.length > 0 ? (
                  filteredAdvisors.map((advisor, index) => (
                    <tr key={index}>
                      <td>{advisor.advisor_id}</td>
                      <td>{advisor.first_name}</td>
                      <td>{advisor.last_name}</td>
                      <td>{advisor.profession}</td>
                      <td>{advisor.education}</td>
                      <td>{advisor.department}</td>
                      <td> {advisor.email}</td>
                      <td>{advisor.phone}</td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => {
                            console.log("edit clicked:", advisor.advisor_id);
                            open_Edit_Modal(advisor.advisor_id);
                          }}
                        >
                          <PencilSquare />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            handleAdvisorDelete(advisor.advisor_id)
                          }
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No matching advisors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Add/Edit Official Modal */}
      <OfficialForm
        show={showModal}
        onHide={closeModal}
        mode={formMode}
        values={officialForm}
        error={formError}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
      />

      {/* Add/Edit advisors Modal */}
      <AdvisorForm
        show={showAdvisorModal}
        onHide={close_Modal}
        mode={formMode}
        values={advisorForm}
        error={formError}
        onChange={handleAdvisorFormChange}
        onSubmit={handleAdvisorFormSubmit}
      />
    </Container>
  );
}

export default MainAdmin;

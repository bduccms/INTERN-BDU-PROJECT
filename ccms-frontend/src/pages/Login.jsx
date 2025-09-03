import { useState, useEffect, useContext } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
import { AppContext } from "../context/Context";

// ✅ Import mock data
import studentsData from "../data/mockStudentData.json";
import officialsData from "../data/mockOfficialsData.json";
import adminsData from "../data/mockMainAdminData.json";

function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setToken, setCurrentUser } = useContext(AppContext);

  useEffect(() => {
    document.getElementById("usernameInput").focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null); // Clear error if user starts typing again
  };

  const validateForm = () => {
    if (!formData.username.trim()) return "Username is required";
    if (!formData.password.trim()) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/login",
        formData
      );

      if (response.data.success) {
        setToken(response.data.token);
        setCurrentUser(response.data.user);

        if (response.data.role === "student") {
          navigate("/clearance-dashboard");
        } else if (response.data.role === "staff") {
          navigate("/department-admin");
        } else if (response.data.role === "admin") {
          navigate("/main-admin");
        } else if (response.data.role === "advisor") {
          navigate("/advisor");
        }
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      id="CCMSLOGINPAGE"
      // style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' , boxShadow:'0 0 10px 20px #2A9DD5'}}
    >
      <Card className="p-4 shadow-sm" id="loginfirst">
        <Card.Header className="text-center text-white p-3">
          <img
            src={logo}
            alt="Bahir Dar University Logo"
            width="100"
            className="mb-2"
            style={{ borderRadius: "50%" }}
          />
          <h2 className="mb-0" style={{ color: "#2A9DD5" }}>
            CCMS Login
          </h2>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="usernameInput">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100 py-2"
              style={{ backgroundColor: "#2A9DD5" }}
            >
              Login
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center text-muted">
          <small>
            © {new Date().getFullYear()} Bahir Dar University. All rights
            reserved.
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default Login;

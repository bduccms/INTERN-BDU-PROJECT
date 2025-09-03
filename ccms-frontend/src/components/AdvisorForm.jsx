import { Modal, Button, Form, Alert } from "react-bootstrap";

function AdvisorForm({
  show,
  onHide,
  mode,
  values,
  error,
  onChange,
  onSubmit,
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "add" ? "Add Advisor" : "Edit Advisor"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3" controlId="advisorIdInput">
  <Form.Label>Advisor ID</Form.Label>
  <Form.Control
    type="text"
    name="advisor_id"
    value={values.advisor_id}   
    onChange={onChange}
    placeholder="e.g., ADV001"
    required
  />
</Form.Group>


          <Form.Group className="mb-3" controlId="firstNameInput">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={values.first_name}
              onChange={onChange}
              placeholder="Enter first name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lastNameInput">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={values.last_name}
              onChange={onChange}
              placeholder="Enter last name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="professionInput">
            <Form.Label>Profession</Form.Label>
            <Form.Control
              type="text"
              name="profession"
              value={values.profession}
              onChange={onChange}
              placeholder="Enter profession"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="educationInput">
            <Form.Label>Education</Form.Label>
            <Form.Control
              type="text"
              name="education"
              value={values.education}
              onChange={onChange}
              placeholder="e.g., Masters, Bachelor"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="departmentInput">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              name="assigned_department"
              value={values.assigned_department}
              onChange={onChange}
              placeholder="Enter department"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="emailInput">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={values.email}
              onChange={onChange}
              placeholder="Enter email"
              required
            />
          </Form.Group>

          {mode === "add" && (
            <Form.Group className="mb-3" controlId="passwordInput">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={values.password || ""}
                onChange={onChange}
                placeholder="Enter password"
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="phoneInput">
            <Form.Label>Phone</Form.Label>
           <Form.Control
  type="text"   // ✅ better than number
  name="phone"
  value={values.phone}
  onChange={onChange}
  placeholder="Enter phone number"
  required
/>

          </Form.Group>

          <Button type="submit" variant="primary" className="w-100">
            {mode === "add" ? "Add Advisor" : "Update Advisor"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AdvisorForm;

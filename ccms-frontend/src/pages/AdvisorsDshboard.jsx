import React, { useState } from 'react';
import './StudentRegistration.css';

const StudentRegistration = () => {
    const [student, setStudent] = useState({
        student_id: '',
        first_name: '',
        father_name: '',
        Gfather_name: '',
        department: '',
        faculty: '',
        sex: '',
        password: '',
        confirmPassword: ''
    });
    
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent({
            ...student,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        // Validation
        if (student.password !== student.confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('error');
            return;
        }
        
        if (student.password.length < 6) {
            setMessage('Password must be at least 6 characters');
            setMessageType('error');
            return;
        }
        
        try {
            // Replace with your actual API endpoint
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: student.student_id,
                    first_name: student.first_name,
                    father_name: student.father_name,
                    department: student.department,
                    faculty: student.faculty,
                    sex: student.sex,
                    Gfather_name: student.Gfather_name,
                    password: student.password
                }),
            });
            
            if (response.ok) {
                setMessage('Student registered successfully!');
                setMessageType('success');
                // Reset form
                setStudent({
                    student_id: '',
                    first_name: '',
                    father_name: '',
                    Gfather_name: '',
                    department: '',
                    faculty: '',
                    sex: '',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to register student');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            setMessageType('error');
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-card">
                <div className="registration-header">
                    <h2><i className="fas fa-user-graduate"></i> Student Registration</h2>
                    <p>Register new students into the system</p>
                </div>
                
                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="student_id" className="required">Student ID</label>
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
                            <label htmlFor="first_name" className="required">First Name</label>
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
                            <label htmlFor="father_name" className="required">Father's Name</label>
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
                            <label htmlFor="Gfather_name" className="required">Grandfather's Name</label>
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
                            <label htmlFor="department" className="required">Department</label>
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
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Computer Engineering">Computer Engineering</option>
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
                        
                        <div className="form-group">
                            <label htmlFor="password" className="required">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={student.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="required">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={student.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="submit-btn">
                        <i className="fas fa-user-plus"></i> Register Student
                    </button>
                    
                    {message && (
                        <div className={`message ${messageType}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default StudentRegistration;
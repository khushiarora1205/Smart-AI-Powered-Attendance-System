import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { API_BASE_URL } from '../config.js';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  
  // Student-related state
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    email: '',
    course: '',
    department: ''
  });
  const [studentImages, setStudentImages] = useState([]);
  const webcamRef = useRef(null);

  // Teacher form state (removed password field)
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    department: '',
    contact_number: ''
  });

  // Store last generated teacher credentials
  const [lastTeacherCredentials, setLastTeacherCredentials] = useState(null);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/add-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teacherForm)
      });

      const data = await res.json();

      if (res.ok) {
        // Store the generated credentials
        const credentials = {
          name: teacherForm.name,
          username: data.username,
          password: data.password,
          email: data.email,
          department: teacherForm.department
        };
        setLastTeacherCredentials(credentials);
        
        showMessage(`✅ Teacher added! Username: ${data.username}, Password: ${data.password}`, 'success');
        alert(`Teacher registered!\nUsername: ${data.username}\nPassword: ${data.password}`);
        
        setTeacherForm({
          name: '',
          email: '',
          department: '',
          contact_number: ''
        });
      } else {
        showMessage(data.message || 'Failed to add teacher', 'error');
      }
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCredentials = async () => {
    if (!lastTeacherCredentials) {
      showMessage('No credentials available', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/send-teacher-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lastTeacherCredentials)
      });

      const data = await res.json();
      if (res.ok) {
        showMessage(`📧 Credentials sent to ${lastTeacherCredentials.email}`, 'success');
        setLastTeacherCredentials(null);
      } else {
        showMessage(data.message || 'Failed to send credentials', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (studentImages.length < 3) {
      showMessage('Please capture at least 3 images for face recognition', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...studentForm,
          images: studentImages
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('✅ Student added successfully!', 'success');
        setStudentForm({
          name: '',
          roll_no: '',
          email: '',
          course: '',
          department: ''
        });
        setStudentImages([]);
      } else {
        showMessage(data.message || 'Failed to add student', 'error');
      }
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = () => {
    if (studentImages.length >= 5) {
      showMessage('Maximum 5 images allowed', 'error');
      return;
    }

    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setStudentImages([...studentImages, imageSrc]);
        showMessage(`Image ${studentImages.length + 1} captured successfully!`, 'success');
      } else {
        showMessage('Failed to capture image. Please try again.', 'error');
      }
    } else {
      showMessage('Camera not ready. Please wait and try again.', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>🛡️ Admin Dashboard</h1>
          
          {message && (
            <div style={{
              padding: '12px 20px',
              marginBottom: '20px',
              backgroundColor: messageType === 'success' ? '#d1fae5' : '#fee2e2',
              border: `2px solid ${messageType === 'success' ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              color: messageType === 'success' ? '#065f46' : '#991b1b'
            }}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '30px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'teacher' ? '#1e40af' : '#f3f4f6',
                color: activeTab === 'teacher' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '4px'
              }}
            >
              👨‍🏫 Add Teacher
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'student' ? '#1e40af' : '#f3f4f6',
                color: activeTab === 'student' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              👩‍🎓 Add Student
            </button>
          </div>

          {activeTab === 'teacher' ? (
            <form onSubmit={handleTeacherSubmit}>
            <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>Add New Teacher</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={teacherForm.name}
                onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px'
                }}
                placeholder="Enter teacher's full name"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px'
                }}
                placeholder="teacher@example.com"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Department *
              </label>
              <select
                required
                value={teacherForm.department}
                onChange={(e) => setTeacherForm({...teacherForm, department: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science & Engineering</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="EE">Electrical Engineering</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#9ca3af' : '#1e40af',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '20px'
              }}
            >
              {isLoading ? 'Adding Teacher...' : '👨‍🏫 Add Teacher'}
            </button>
          </form>
          ) : (
            <form onSubmit={handleStudentSubmit}>
              <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>Add New Student</h2>
              
              <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                    placeholder="Enter student's full name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({...studentForm, roll_no: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                    placeholder="e.g., 2021001"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Course *
                  </label>
                  <select
                    required
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select Course</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                    Department *
                  </label>
                  <select
                    required
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({...studentForm, department: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                  </select>
                </div>
              </div>

              {/* Face Recognition Setup */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
                  📸 Face Recognition Setup
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
                  Capture 3-5 clear photos of the student's face for accurate attendance recognition.
                </p>
                
                <div style={{
                  marginBottom: '15px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e5e7eb'
                }}>
                  <Webcam
                    ref={webcamRef}
                    width="100%"
                    height="auto"
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "user"
                    }}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleImageCapture}
                  disabled={studentImages.length >= 5}
                  style={{
                    backgroundColor: studentImages.length >= 5 ? '#9ca3af' : '#059669',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: studentImages.length >= 5 ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                  }}
                >
                  📷 Capture Image ({studentImages.length}/5)
                </button>

                {studentImages.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <p style={{ fontSize: '14px', color: '#374151', marginBottom: '10px' }}>
                      Captured Images: {studentImages.length}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {studentImages.map((img, index) => (
                        <div key={index} style={{
                          width: '80px',
                          height: '80px',
                          border: '2px solid #10b981',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={img} 
                            alt={`Captured ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: isLoading ? '#9ca3af' : '#1e40af',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '20px'
                }}
              >
                {isLoading ? 'Adding Student...' : '👩‍🎓 Add Student'}
              </button>
            </form>
          )}

          {lastTeacherCredentials && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '2px solid #0ea5e9'
            }}>
              <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>
                📧 Teacher Credentials
              </h3>
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                <p><strong>Name:</strong> {lastTeacherCredentials.name}</p>
                <p><strong>Username:</strong> {lastTeacherCredentials.username}</p>
                <p><strong>Password:</strong> {lastTeacherCredentials.password}</p>
                <p><strong>Email:</strong> {lastTeacherCredentials.email}</p>
                <p><strong>Department:</strong> {lastTeacherCredentials.department}</p>
              </div>
              <button
                type="button"
                onClick={handleSendCredentials}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#9ca3af' : '#059669',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Sending...' : '�� Send Credentials via Email'}
              </button>
            </div>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/teacher-login')}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                marginRight: '10px',
                cursor: 'pointer'
              }}
            >
              🏫 Teacher Portal
            </button>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

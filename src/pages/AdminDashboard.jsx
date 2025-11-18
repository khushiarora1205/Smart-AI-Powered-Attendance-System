import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { API_BASE_URL } from '../config.js';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();
  
  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    department: '',
    contact_number: ''
  });

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    email: '',
    course: '',
    department: '',
    batch: '',
    group: ''
  });
  
  const [studentImages, setStudentImages] = useState([]);
  const webcamRef = useRef(null);

  // Store last generated teacher credentials
  const [lastTeacherCredentials, setLastTeacherCredentials] = useState(null);

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    teacher_username: '',
    subjects: [],
    semester: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);

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
        setLastTeacherCredentials({
          name: teacherForm.name,
          email: teacherForm.email,
          username: data.username,
          password: data.password,
          department: teacherForm.department
        });
        showMessage(`✅ Teacher added! Username: ${data.username}, Password: ${data.password}`, 'success');
        setTeacherForm({ name: '', email: '', department: '', contact_number: '' });
      } else {
        showMessage(data.message || 'Failed to add teacher', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
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
          face_images: studentImages
        })
      });

      const data = await res.json();
      if (res.ok) {
        showMessage('✅ Student registered successfully with face recognition!', 'success');
        setStudentForm({ name: '', roll_no: '', email: '', course: '', department: '', batch: '', group: '' });
        setStudentImages([]);
      } else {
        showMessage(data.message || 'Failed to register student', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = () => {
    if (studentImages.length >= 5) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setStudentImages(prev => [...prev, imageSrc]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: '#1e40af', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
              🏫 Admin Dashboard
            </h1>
            <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
              Welcome, {user?.name || 'Administrator'}!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/data-management')}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📊 Data Management
            </button>
            <button
              onClick={() => navigate('/mentor-assignment')}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              👨‍🏫 Assign Mentors
            </button>
            <button
              onClick={() => navigate('/teacher-panel')}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
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

        {/* Message Display */}
        {message && (
          <div style={{
            backgroundColor: messageType === 'error' ? '#fee2e2' : '#d1fae5',
            color: messageType === 'error' ? '#dc2626' : '#059669',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('teacher')}
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                backgroundColor: activeTab === 'teacher' ? '#1e40af' : 'white',
                color: activeTab === 'teacher' ? 'white' : '#374151',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              👨‍🏫 Add Teacher
            </button>
            <button
              onClick={() => setActiveTab('student')}
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                backgroundColor: activeTab === 'student' ? '#1e40af' : 'white',
                color: activeTab === 'student' ? 'white' : '#374151',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              👩‍🎓 Add Student
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                backgroundColor: activeTab === 'assignments' ? '#1e40af' : 'white',
                color: activeTab === 'assignments' ? 'white' : '#374151',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📚 Assign Subjects
            </button>
          </div>

          <div style={{ padding: '30px' }}>
            {activeTab === 'teacher' ? (
              <form onSubmit={handleTeacherSubmit}>
                <h2 style={{ color: '#1e40af', marginBottom: '20px' }}>Add New Teacher</h2>
                
                <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                  <div>
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

                  <div>
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

                  <div>
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={teacherForm.contact_number}
                      onChange={(e) => setTeacherForm({...teacherForm, contact_number: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                      placeholder="Enter contact number"
                    />
                  </div>
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

                {/* Display generated credentials */}
                {lastTeacherCredentials && (
                  <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '2px solid #0ea5e9'
                  }}>
                    <h3 style={{ color: '#0c4a6e', marginBottom: '15px' }}>
                      🎉 Teacher Added Successfully!
                    </h3>
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Name:</strong> {lastTeacherCredentials.name}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Email:</strong> {lastTeacherCredentials.email}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Department:</strong> {lastTeacherCredentials.department}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Username:</strong> {lastTeacherCredentials.username}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Password:</strong> {lastTeacherCredentials.password}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCredentials}
                      disabled={isLoading}
                      style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? 'Sending...' : '📧 Send Credentials via Email'}
                    </button>
                  </div>
                )}
              </form>
            ) : activeTab === 'student' ? (
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

                  <div>
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
                      <option value="CSE">Computer Science</option>
                      <option value="ECE">Electronics</option>
                      <option value="ME">Mechanical</option>
                      <option value="CE">Civil</option>
                      <option value="EEE">Electrical</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Batch (Enrollment Year) *
                    </label>
                    <select
                      required
                      value={studentForm.batch}
                      onChange={(e) => setStudentForm({...studentForm, batch: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    >
                      <option value="">Select Batch</option>
                      <option value="2020">2020</option>
                      <option value="2021">2021</option>
                      <option value="2022">2022</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                      Group / Section *
                    </label>
                    <select
                      required
                      value={studentForm.group}
                      onChange={(e) => setStudentForm({...studentForm, group: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    >
                      <option value="">Select Group</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
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
                    border: '2px solid #e5e7eb',
                    maxWidth: '400px',
                    margin: '0 auto 15px auto'
                  }}>
                    <Webcam
                      ref={webcamRef}
                      width="100%"
                      height="auto"
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: "user",
                        width: 480,
                        height: 320
                      }}
                      style={{
                        maxWidth: '400px',
                        maxHeight: '300px'
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
            ) : activeTab === 'assignments' ? (
              <AssignSubjectsForm 
                assignmentForm={assignmentForm}
                setAssignmentForm={setAssignmentForm}
                teachers={teachers}
                setTeachers={setTeachers}
                assignments={assignments}
                setAssignments={setAssignments}
                showMessage={showMessage}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// Assign Subjects Form Component
const AssignSubjectsForm = ({ 
  assignmentForm, 
  setAssignmentForm, 
  teachers, 
  setTeachers,
  assignments, 
  setAssignments,
  showMessage, 
  isLoading, 
  setIsLoading 
}) => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [availableSemesters] = useState([
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
  ]);

  useEffect(() => {
    fetchTeachers();
    fetchAssignments();
    initializeSubjects();
  }, []);

  // Fetch subjects when teacher or semester changes
  useEffect(() => {
    if (selectedTeacher && assignmentForm.semester) {
      fetchSubjects(selectedTeacher.department, assignmentForm.semester);
    }
  }, [selectedTeacher, assignmentForm.semester]);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/teacher-assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchSubjects = async (department, semester) => {
    if (!department || !semester) {
      setAvailableSubjects([]);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/subjects?department=${encodeURIComponent(department)}&semester=${encodeURIComponent(semester)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAvailableSubjects(data.subjects || []);
      } else {
        setAvailableSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setAvailableSubjects([]);
    }
  };

  const initializeSubjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/initialize-subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Subjects initialization:', data.message);
      }
    } catch (err) {
      console.error('Error initializing subjects:', err);
    }
  };

  const refreshSubjects = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/refresh-subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        showMessage(data.message, 'success');
        
        // Refresh subjects if teacher and semester are selected
        if (selectedTeacher && assignmentForm.semester) {
          await fetchSubjects(selectedTeacher.department, assignmentForm.semester);
        }
      } else {
        const errorData = await res.json();
        showMessage(errorData.message, 'error');
      }
    } catch (err) {
      showMessage('Error refreshing subjects: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectToggle = (subject) => {
    const currentSubjects = assignmentForm.subjects;
    if (currentSubjects.includes(subject)) {
      setAssignmentForm({
        ...assignmentForm,
        subjects: currentSubjects.filter(s => s !== subject)
      });
    } else {
      setAssignmentForm({
        ...assignmentForm,
        subjects: [...currentSubjects, subject]
      });
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/assign-subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignmentForm)
      });

      const data = await res.json();

      if (res.ok) {
        showMessage(data.message, 'success');
        setAssignmentForm({
          teacher_username: '',
          subjects: [],
          semester: ''
        });
        fetchAssignments(); // Refresh assignments list
      } else {
        showMessage(data.message || 'Failed to assign subjects', 'error');
      }
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e40af', margin: 0 }}>Assign Subjects to Teachers</h2>
        <button
          type="button"
          onClick={refreshSubjects}
          disabled={isLoading}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Subjects Database'}
        </button>
      </div>
      
      <form onSubmit={handleAssignmentSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Teacher Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Select Teacher *
            </label>
            <select
              required
              value={assignmentForm.teacher_username}
              onChange={(e) => {
                const selectedUsername = e.target.value;
                const teacher = teachers.find(t => t.username === selectedUsername);
                setSelectedTeacher(teacher);
                setAssignmentForm({
                  ...assignmentForm, 
                  teacher_username: selectedUsername,
                  subjects: [] // Clear subjects when teacher changes
                });
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">Choose a teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher.username} value={teacher.username}>
                  {teacher.name} ({teacher.username}) - {teacher.department}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Select Semester *
            </label>
            <select
              required
              value={assignmentForm.semester}
              onChange={(e) => setAssignmentForm({
                ...assignmentForm,
                semester: e.target.value,
                subjects: [] // Clear subjects when semester changes
              })}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">Choose semester...</option>
              {availableSemesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Select Subjects * (Select multiple)
            </label>
            {!selectedTeacher || !assignmentForm.semester ? (
              <div style={{
                padding: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                textAlign: 'center',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                Please select both teacher and semester to see available subjects
              </div>
            ) : availableSubjects.length === 0 ? (
              <div style={{
                padding: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                textAlign: 'center',
                color: '#ef4444'
              }}>
                No subjects available for {selectedTeacher.department} department in {assignmentForm.semester}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px',
                padding: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {availableSubjects.map(subject => (
                <label
                  key={subject}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: assignmentForm.subjects.includes(subject) ? '#dbeafe' : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assignmentForm.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    style={{ marginRight: '8px' }}
                  />
                  {subject}
                </label>
                ))}
              </div>
            )}
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
              Selected: {assignmentForm.subjects.length} subjects
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || assignmentForm.subjects.length === 0}
            style={{
              backgroundColor: isLoading || assignmentForm.subjects.length === 0 ? '#9ca3af' : '#1e40af',
              color: 'white',
              padding: '15px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading || assignmentForm.subjects.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Assigning...' : '📚 Assign Subjects'}
          </button>
        </div>
      </form>

      {/* Current Assignments Display */}
      {assignments.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Current Assignments</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {assignments.map((assignment, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>
                      {assignment.teacher_name} ({assignment.teacher_username})
                    </h4>
                    <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#4b5563' }}>
                      {assignment.semester}
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                      Subjects: {assignment.subjects.join(', ')}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    backgroundColor: '#e5e7eb',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {assignment.subjects.length} subjects
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
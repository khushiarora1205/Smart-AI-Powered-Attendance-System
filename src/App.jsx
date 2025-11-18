import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DataManagement from './pages/DataManagement';
import Enrollment from './pages/Enrollment';
import Attendance from './pages/Attendance';
import Records from './pages/Records';
import TeacherPanel from './pages/TeacherPanel_new';
import ManualAttendance from './pages/ManualAttendance';
import BulkAttendance from './pages/BulkAttendance';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import MentorAssignment from './pages/MentorAssignment';
import MedicalLeave from './pages/MedicalLeave';

// Navigation Link Component
const NavLink = ({ to, icon, label, isActive }) => (
  <Link 
    to={to} 
    className={`nav-link ${isActive ? 'active' : ''}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      color: isActive ? '#4361ee' : '#666',
      textDecoration: 'none',
      fontWeight: isActive ? '600' : '500',
      borderRadius: '8px',
      margin: '4px 0',
      transition: 'all 0.3s ease',
      backgroundColor: isActive ? 'rgba(67, 97, 238, 0.1)' : 'transparent',
    }}
  >
    <span style={{ marginRight: '10px', fontSize: '20px' }}>{icon}</span>
    <span>{label}</span>
  </Link>
);

// Navigation Component with Logout
const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    onLogout();
  };

  return (
    <nav style={{
      width: '280px',
      backgroundColor: '#f8fafc',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Header with User Info */}
      <div style={{ 
        padding: '20px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#4361ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            marginRight: '12px'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <h3 style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {user.name}
            </h3>
            <p style={{
              margin: '0',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {user.email}
            </p>
          </div>
        </div>
        
        <h1 style={{ 
          fontSize: '24px', 
          margin: '0', 
          background: 'linear-gradient(45deg, #4361ee, #3a0ca3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700'
        }}>
          FaceAttend Pro
        </h1>
        <p style={{ 
          fontSize: '14px', 
          margin: '5px 0 0 0', 
          color: '#666' 
        }}>
          Facial Recognition Attendance
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <NavLink 
          to="/attendance" 
          icon="📱" 
          label="Mark Attendance" 
          isActive={location.pathname === '/attendance'} 
        />
        <NavLink 
          to="/records" 
          icon="📊" 
          label="Attendance Records" 
          isActive={location.pathname === '/records'} 
        />
        <NavLink 
          to="/teacher" 
          icon="👨‍🏫" 
          label="Teacher Panel" 
          isActive={location.pathname === '/teacher'} 
        />
        <NavLink 
          to="/manual-attendance" 
          icon="✏️" 
          label="Manual Attendance" 
          isActive={location.pathname === '/manual-attendance'} 
        />
        <NavLink 
          to="/bulk-attendance" 
          icon="📁" 
          label="Excel Upload" 
          isActive={location.pathname === '/bulk-attendance'} 
        />
      </div>
      
      {/* Logout Button */}
      <div style={{ 
        padding: '15px 20px', 
        borderTop: '1px solid #e2e8f0',
        marginTop: 'auto'
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ marginRight: '8px' }}>�</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

// Login Selection Component
const LoginSelection = ({ onRoleSelect }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎓</div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          margin: '0 0 15px 0',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          FaceAttend Pro
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '18px',
          margin: '0 0 40px 0'
        }}>
          Smart AI-Powered Attendance System
        </p>
        
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
          <button
            onClick={() => onRoleSelect('teacher')}
            style={{
              backgroundColor: '#5b21b6',
              color: 'white',
              padding: '20px 30px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(91, 33, 182, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#6d28d9';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#5b21b6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            👨‍🏫 Teacher Login
          </button>
          
          <button
            onClick={() => onRoleSelect('admin')}
            style={{
              backgroundColor: '#b45309',
              color: 'white',
              padding: '20px 30px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(180, 83, 9, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#d97706';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#b45309';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            👑 Admin Login
          </button>
          
          <button
            onClick={() => onRoleSelect('student')}
            style={{
              backgroundColor: '#047857',
              color: 'white',
              padding: '20px 30px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(4, 120, 87, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#047857';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🎓 Student Portal
          </button>
        </div>
        
        <div style={{
          marginTop: '30px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          Select your role to continue
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loginMode, setLoginMode] = useState(null); // 'teacher', 'admin', or null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        // Don't need to set loginMode since user is already logged in
      } catch (err) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setLoginMode(null); // Clear login mode after successful login
  };

  const handleLogout = () => {
    setUser(null);
    setLoginMode(null);
  };

  const handleRoleSelect = (role) => {
    setLoginMode(role);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Student Portal Routes - Separate from teacher/admin */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/medical-leave" element={<MedicalLeave />} />
        
        {/* Public routes for login selection and authentication */}
        <Route 
          path="/login" 
          element={
            !loginMode ? (
              <LoginSelection onRoleSelect={handleRoleSelect} />
            ) : loginMode === 'teacher' ? (
              <Login onLogin={handleLogin} />
            ) : loginMode === 'student' ? (
              <Navigate to="/student/login" replace />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          } 
        />
        {/* Direct route to show teacher login UI (used by Admin "Back to Teacher Login") */}
        <Route path="/teacher-login" element={<Login onLogin={handleLogin} />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'admin' ? (
              <Routes>
                <Route path="/admin-dashboard" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
                <Route path="/data-management" element={<DataManagement user={user} onLogout={handleLogout} />} />
                <Route path="/mentor-assignment" element={<MentorAssignment user={user} onLogout={handleLogout} />} />
                <Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
                <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
              </Routes>
            ) : (
              // Teacher routes
              <div style={{ 
                display: 'flex', 
                minHeight: '100vh',
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                <Navigation user={user} onLogout={handleLogout} />
                <main style={{ 
                  flex: 1, 
                  padding: '30px', 
                  backgroundColor: '#ffffff', 
                  overflowY: 'auto'
                }}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/teacher" replace />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/records" element={<Records />} />
                    <Route path="/teacher" element={<TeacherPanel />} />
                    <Route path="/manual-attendance" element={<ManualAttendance />} />
                    <Route path="/bulk-attendance" element={<BulkAttendance />} />
                  </Routes>
                </main>
              </div>
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
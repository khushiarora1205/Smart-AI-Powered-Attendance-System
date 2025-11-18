import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config.js';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        padding: '16px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            {profile?.name}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '4px 0 0 0'
          }}>
            {profile?.course || 'Student'}
          </p>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {/* Username */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Username
          </div>
          <div style={{
            fontSize: '16px',
            color: '#1f2937',
            fontWeight: '600'
          }}>
            {profile?.username || 'N/A'}
          </div>
        </div>

        {/* Email */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Email
          </div>
          <div style={{
            fontSize: '16px',
            color: '#1f2937',
            fontWeight: '600',
            wordBreak: 'break-word'
          }}>
            {profile?.email || 'N/A'}
          </div>
        </div>

        {/* Enrollment Number */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Enrollment Number
          </div>
          <div style={{
            fontSize: '16px',
            color: '#1f2937',
            fontWeight: '600'
          }}>
            {profile?.rollNo || 'N/A'}
          </div>
        </div>

        {/* Department */}
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Department
          </div>
          <div style={{
            fontSize: '16px',
            color: '#1f2937',
            fontWeight: '600'
          }}>
            {profile?.department || 'N/A'}
          </div>
        </div>

        {/* Batch */}
        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          border: '1px solid #93c5fd'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#1e40af',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Batch
          </div>
          <div style={{
            fontSize: '16px',
            color: '#1e3a8a',
            fontWeight: '600'
          }}>
            {profile?.batch || 'N/A'}
          </div>
        </div>

        {/* Group */}
        <div style={{
          padding: '16px',
          backgroundColor: '#dcfce7',
          borderRadius: '12px',
          border: '1px solid #86efac'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#166534',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Group
          </div>
          <div style={{
            fontSize: '16px',
            color: '#14532d',
            fontWeight: '600'
          }}>
            {profile?.group || 'N/A'}
          </div>
        </div>

        {/* Phone */}
        {profile?.phone && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Phone
            </div>
            <div style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: '600'
            }}>
              {profile.phone}
            </div>
          </div>
        )}

        {/* Course */}
        {profile?.course && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Course
            </div>
            <div style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: '600'
            }}>
              {profile.course}
            </div>
          </div>
        )}

        {/* Mentor Name */}
        {profile?.mentor_name && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Mentor Name
            </div>
            <div style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: '600'
            }}>
              {profile.mentor_name}
            </div>
          </div>
        )}

        {/* Mentor Email */}
        {profile?.mentor_email && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Mentor Email
            </div>
            <div style={{
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: '600',
              wordBreak: 'break-word'
            }}>
              {profile.mentor_email}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;

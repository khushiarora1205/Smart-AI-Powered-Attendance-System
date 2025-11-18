import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config.js';

const StudentAttendanceTable = () => {
  const [attendance, setAttendance] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/student/attendance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Updated to use new response structure: data.subjects instead of data.attendance
        setAttendance(data.subjects || []);
        setStudentInfo({
          name: data.student_name,
          rollNo: data.roll_no,
          department: data.department,
          overall: data.overall  // Store overall stats
        });
      } else {
        setError(data.message || 'Failed to load attendance');
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return '#10b981'; // Green
    if (percentage >= 80) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getPercentageBackground = (percentage) => {
    if (percentage >= 90) return '#d1fae5'; // Light green
    if (percentage >= 80) return '#fef3c7'; // Light yellow
    return '#fee2e2'; // Light red
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
        <p style={{ color: '#6b7280' }}>Loading attendance data...</p>
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

  if (attendance.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No Attendance Records</h3>
        <p style={{ color: '#6b7280' }}>Your attendance records will appear here once classes begin.</p>
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
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          📊 Subject-wise Attendance
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Track your attendance across all subjects
        </p>
      </div>

      {/* Overall Summary Card */}
      {studentInfo?.overall && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '2px solid #38bdf8',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#0284c7', marginBottom: '4px', fontWeight: '600' }}>
              TOTAL CLASSES
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0c4a6e' }}>
              {studentInfo.overall.total_classes}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#059669', marginBottom: '4px', fontWeight: '600' }}>
              PRESENT
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#065f46' }}>
              {studentInfo.overall.present}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px', fontWeight: '600' }}>
              ML
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#d97706' }}>
              {studentInfo.overall.ml || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '4px', fontWeight: '600' }}>
              ABSENT
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#991b1b' }}>
              {studentInfo.overall.absent}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#7c3aed', marginBottom: '4px', fontWeight: '600' }}>
              OVERALL %
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: getPercentageColor(studentInfo.overall.percentage)
            }}>
              {studentInfo.overall.percentage}%
            </div>
          </div>
        </div>
      )}

      {/* Responsive Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '700px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#f3f4f6',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Subject Name
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Class Attendance
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                DL
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                ML
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Overall %
              </th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((subject, index) => (
              <tr 
                key={index}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                {/* Subject Name */}
                <td style={{
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  <div>{subject.subject_name}</div>
                  {subject.teacher_name && subject.teacher_name !== 'All Teachers' && (
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      fontWeight: '400',
                      marginTop: '4px'
                    }}>
                      {subject.teacher_name}
                    </div>
                  )}
                </td>

                {/* Class Attendance */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {subject.attended} / {subject.delivered}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '2px'
                  }}>
                    Present
                  </div>
                </td>

                {/* DL */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: subject.dl > 0 ? '#fef3c7' : '#f3f4f6',
                    color: subject.dl > 0 ? '#92400e' : '#6b7280',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {subject.dl}
                    {subject.approved_dl > 0 && (
                      <span style={{ 
                        fontSize: '11px', 
                        marginLeft: '4px',
                        color: '#10b981'
                      }}>
                        ({subject.approved_dl} ✓)
                      </span>
                    )}
                  </div>
                </td>

                {/* ML */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: subject.ml > 0 ? '#fef3c7' : '#f3f4f6',
                    color: subject.ml > 0 ? '#92400e' : '#6b7280',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {subject.ml}
                  </div>
                </td>

                {/* Overall Percentage */}
                <td style={{
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: getPercentageBackground(subject.overall_percentage),
                    color: getPercentageColor(subject.overall_percentage),
                    fontWeight: '700',
                    fontSize: '16px',
                    minWidth: '70px'
                  }}>
                    {subject.overall_percentage}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        fontSize: '13px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: '#d1fae5'
            }}></div>
            <span style={{ color: '#6b7280' }}>≥ 90% (Excellent)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: '#fef3c7'
            }}></div>
            <span style={{ color: '#6b7280' }}>80-89% (Good)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: '#fee2e2'
            }}></div>
            <span style={{ color: '#6b7280' }}>&lt; 80% (Need Improvement)</span>
          </div>
        </div>
        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24',
          color: '#92400e',
          fontWeight: '500'
        }}>
          📌 Note: Medical Leave (ML) counts as PRESENT in your attendance percentage
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceTable;

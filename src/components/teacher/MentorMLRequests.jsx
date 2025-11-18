import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config.js';

const MentorMLRequests = () => {
  const [requests, setRequests] = useState([]);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchMLRequests();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchMLRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/teacher/ml_requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
        setMentorInfo({
          isMentor: data.is_mentor,
          batch: data.batch,
          group: data.group,
          pending: data.pending
        });
      } else {
        showMessage(data.message || 'Failed to load ML requests', 'error');
      }
    } catch (error) {
      console.error('Fetch ML requests error:', error);
      showMessage('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId, decision) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/teacher/approve_ml`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: requestId,
          decision: decision
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          decision === 'APPROVED' 
            ? `Medical leave approved! ${data.attendance_updated || 0} attendance records updated.`
            : 'Medical leave rejected',
          'success'
        );
        fetchMLRequests();
      } else {
        showMessage(data.message || 'Failed to process request', 'error');
      }
    } catch (error) {
      console.error('Process ML error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' };
      case 'APPROVED':
        return { bg: '#d1fae5', color: '#065f46', border: '#10b981' };
      case 'REJECTED':
        return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const viewProof = (filename) => {
    const token = localStorage.getItem('authToken');
    window.open(`${API_BASE_URL}/uploads/ml_proofs/${filename}?token=${token}`, '_blank');
  };

  if (!mentorInfo?.isMentor) {
    return (
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        color: '#92400e',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
        <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
          You are not assigned as a mentor to any batch and group.
        </p>
        <p style={{ fontSize: '14px', marginTop: '8px', margin: '8px 0 0 0' }}>
          Only mentors can view and approve medical leave requests.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Message Display */}
      {message.text && (
        <div style={{
          backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: message.type === 'error' ? '#dc2626' : '#059669',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontWeight: '500',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Mentor Info Header */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1e3a8a',
              margin: 0,
              marginBottom: '8px'
            }}>
              👨‍🏫 Mentoring: Batch {mentorInfo.batch} - Group {mentorInfo.group}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#1e40af',
              margin: 0
            }}>
              Review and approve/reject medical leave requests from your mentored students
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #93c5fd'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#1e40af',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Pending Requests
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1e3a8a'
            }}>
              {mentorInfo.pending || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Loading medical leave requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '16px', margin: 0 }}>No medical leave requests yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Student
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Roll No
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Date Range
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Duration
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Applied On
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Proof
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const statusStyle = getStatusColor(req.status);
                  const start = new Date(req.start_date);
                  const end = new Date(req.end_date);
                  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr
                      key={req._id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>
                          {req.student_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {req.student_email}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        {req.student_rollNo}
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        <div>{formatDate(req.start_date)}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          to {formatDate(req.end_date)}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        {duration} day{duration > 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        {formatDate(req.applied_at)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: `1px solid ${statusStyle.border}`
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => viewProof(req.proof_filename)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          View PDF
                        </button>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {req.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleDecision(req._id, 'APPROVED')}
                              disabled={processingId === req._id}
                              style={{
                                backgroundColor: processingId === req._id ? '#9ca3af' : '#10b981',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: processingId === req._id ? 'not-allowed' : 'pointer'
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleDecision(req._id, 'REJECTED')}
                              disabled={processingId === req._id}
                              style={{
                                backgroundColor: processingId === req._id ? '#9ca3af' : '#ef4444',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: processingId === req._id ? 'not-allowed' : 'pointer'
                              }}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{
                            color: '#6b7280',
                            fontSize: '13px',
                            fontStyle: 'italic'
                          }}>
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorMLRequests;

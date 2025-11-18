import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';

const MedicalLeave = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMLRequests();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchMLRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/student/ml_requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        showMessage(data.message || 'Failed to load ML requests', 'error');
      }
    } catch (error) {
      console.error('Fetch ML requests error:', error);
      showMessage('Network error', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setProofFile(null);
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showMessage('Only PDF files are allowed', 'error');
      e.target.value = '';
      setProofFile(null);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('File size must be less than 5MB', 'error');
      e.target.value = '';
      setProofFile(null);
      return;
    }

    setProofFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates
    if (!startDate || !endDate) {
      showMessage('Please select both start and end dates', 'error');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      showMessage('Start date cannot be after end date', 'error');
      return;
    }

    if (!proofFile) {
      showMessage('Please upload medical proof (PDF)', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('proof', proofFile);

      const response = await fetch(`${API_BASE_URL}/api/student/apply_ml`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Medical leave application submitted successfully!', 'success');
        setStartDate('');
        setEndDate('');
        setProofFile(null);
        document.getElementById('proof-file-input').value = '';
        fetchMLRequests();
      } else {
        showMessage(data.message || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('Submit ML error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/dashboard')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px 32px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
            marginBottom: '4px'
          }}>
            🏥 Medical Leave Application
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Apply for medical leave and track your requests
          </p>
        </div>

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

        {/* Application Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            Apply for Medical Leave
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Start Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Medical Proof (PDF only, max 5MB) *
              </label>
              <input
                id="proof-file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {proofFile && (
                <p style={{
                  fontSize: '12px',
                  color: '#059669',
                  marginTop: '8px',
                  margin: '8px 0 0 0'
                }}>
                  ✓ {proofFile.name} ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#667eea',
                color: 'white',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#5568d3';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#667eea';
              }}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Previous Requests */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            Your Medical Leave Requests
          </h2>

          {requests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p>No medical leave requests yet</p>
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
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      Start Date
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      End Date
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      Duration
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      Mentor
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      Applied On
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                      Proof
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, index) => {
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
                        <td style={{ padding: '12px' }}>{formatDate(req.start_date)}</td>
                        <td style={{ padding: '12px' }}>{formatDate(req.end_date)}</td>
                        <td style={{ padding: '12px' }}>{duration} day{duration > 1 ? 's' : ''}</td>
                        <td style={{ padding: '12px' }}>{req.mentor_name || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>
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
                        <td style={{ padding: '12px' }}>{formatDate(req.applied_at)}</td>
                        <td style={{ padding: '12px' }}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalLeave;

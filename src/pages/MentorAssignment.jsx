import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';

const MentorAssignment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form state
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  // Data lists
  const [batches, setBatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [mentorAssignments, setMentorAssignments] = useState([]);
  const [unassignedGroups, setUnassignedGroups] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchGroupsForBatch(selectedBatch);
    } else {
      setGroups([]);
      setSelectedGroup('');
    }
  }, [selectedBatch]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch mentor assignments
      const assignmentsRes = await fetch(`${API_BASE_URL}/api/admin/mentor-assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setMentorAssignments(data.assignments || []);
      }
      
      // Fetch available mentors
      const mentorsRes = await fetch(`${API_BASE_URL}/api/admin/available-mentors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mentorsRes.ok) {
        const data = await mentorsRes.json();
        setAvailableTeachers(data.available_mentors || []);
      }
      
      // Fetch all teachers
      const teachersRes = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setAllTeachers(data.teachers || []);
      }
      
      // Fetch unassigned groups
      const unassignedRes = await fetch(`${API_BASE_URL}/api/admin/unassigned-groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (unassignedRes.ok) {
        const data = await unassignedRes.json();
        setUnassignedGroups(data.unassigned_groups || []);
        
        // Extract unique batches
        const uniqueBatches = [...new Set(data.unassigned_groups.map(g => g.batch))].sort();
        setBatches(uniqueBatches);
      }
      
    } catch (error) {
      showMessage('Failed to fetch data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupsForBatch = (batch) => {
    const filteredGroups = unassignedGroups
      .filter(g => g.batch === batch)
      .map(g => g.group)
      .sort();
    setGroups(filteredGroups);
  };

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/assign-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch: selectedBatch,
          group: selectedGroup,
          teacher_id: selectedTeacher
        })
      });

      const data = await res.json();
      if (res.ok) {
        showMessage(`✅ ${data.message}. ${data.students_updated} students updated.`, 'success');
        setSelectedBatch('');
        setSelectedGroup('');
        setSelectedTeacher('');
        fetchData(); // Refresh all data
      } else {
        showMessage(data.message || 'Failed to assign mentor', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMentor = async (batch, group) => {
    if (!confirm(`Remove mentor assignment for Batch ${batch} - Group ${group}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/remove-mentor`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ batch, group })
      });

      const data = await res.json();
      if (res.ok) {
        showMessage('✅ Mentor assignment removed', 'success');
        fetchData();
      } else {
        showMessage(data.message || 'Failed to remove mentor', 'error');
      }
    } catch (err) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      padding: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1e40af',
          margin: 0
        }}>
          📚 Mentor Assignment System
        </h1>
        <button
          onClick={() => navigate('/admin')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: '1fr 1.5fr' }}>
        {/* Assign Mentor Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          height: 'fit-content'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '20px'
          }}>
            👨‍🏫 Assign Mentor
          </h2>

          <form onSubmit={handleAssignMentor}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Batch Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Batch (Year) *
                </label>
                <select
                  required
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* Group Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Group / Section *
                </label>
                <select
                  required
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={!selectedBatch}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: !selectedBatch ? '#f3f4f6' : 'white'
                  }}
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Teacher Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Select Mentor Teacher *
                </label>
                <select
                  required
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Teacher</option>
                  {availableTeachers.map(teacher => (
                    <option key={teacher.teacher_id} value={teacher.teacher_id}>
                      {teacher.name} - {teacher.department}
                    </option>
                  ))}
                </select>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '6px'
                }}>
                  {availableTeachers.length} teacher(s) available
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '14px',
                  backgroundColor: isLoading ? '#9ca3af' : '#1e40af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                {isLoading ? 'Assigning...' : '✓ Assign Mentor'}
              </button>
            </div>
          </form>
        </div>

        {/* Current Assignments Table */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '20px'
          }}>
            📋 Current Mentor Assignments ({mentorAssignments.length})
          </h2>

          {mentorAssignments.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
              No mentor assignments yet
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Batch</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Group</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Mentor</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Students</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorAssignments.map((assignment, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          {assignment.batch}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          {assignment.group}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {assignment.mentor_teacher_name}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {assignment.student_count} students
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleRemoveMentor(assignment.batch, assignment.group)}
                          disabled={isLoading}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Unassigned Groups Section */}
      {unassignedGroups.length > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '30px',
          border: '2px solid #fbbf24'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '15px'
          }}>
            ⚠️ Groups Without Mentors ({unassignedGroups.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {unassignedGroups.map((group, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  border: '1px solid #fbbf24'
                }}
              >
                Batch {group.batch} - Group {group.group} ({group.student_count} students)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAssignment;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';

const DataManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [studentsData, setStudentsData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    filterAndSortData();
  }, [searchQuery, sortField, sortOrder, studentsData, teachersData, activeTab]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = activeTab === 'students' 
        ? `${API_BASE_URL}/api/admin/students`
        : `${API_BASE_URL}/api/admin/teachers`;
      
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'students') {
          setStudentsData(data.students || []);
        } else {
          setTeachersData(data.teachers || []);
        }
      } else {
        showMessage('Failed to fetch data', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortData = () => {
    const data = activeTab === 'students' ? studentsData : teachersData;
    
    let filtered = data.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (item.name?.toLowerCase().includes(searchLower)) ||
        (item.email?.toLowerCase().includes(searchLower)) ||
        (item.department?.toLowerCase().includes(searchLower)) ||
        (item.rollNo?.toLowerCase().includes(searchLower)) ||
        (item.username?.toLowerCase().includes(searchLower)) ||
        (item.batch?.toLowerCase().includes(searchLower)) ||
        (item.group?.toLowerCase().includes(searchLower)) ||
        (item.mentor_name?.toLowerCase().includes(searchLower))
      );
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField]?.toString().toLowerCase() || '';
      const bVal = b[sortField]?.toString().toLowerCase() || '';
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = activeTab === 'students'
        ? `${API_BASE_URL}/api/admin/students/export`
        : `${API_BASE_URL}/api/admin/teachers/export`;
      
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('Excel file downloaded successfully!', 'success');
      } else {
        showMessage('Failed to download Excel file', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord({ ...record });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      // For students, use rollNo; for teachers, use username if available, otherwise use _id
      const id = activeTab === 'students' 
        ? editingRecord.rollNo 
        : (editingRecord.username || editingRecord._id);
      const endpoint = `${API_BASE_URL}/api/admin/${activeTab}/${id}`;
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingRecord)
      });

      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || 'Record updated successfully!', 'success');
        setEditModalOpen(false);
        setEditingRecord(null);
        fetchData();
      } else {
        showMessage(data.message || 'Failed to update record', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (record) => {
    setDeletingRecord(record);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      // For students, use rollNo; for teachers, use username if available, otherwise use _id
      const id = activeTab === 'students' 
        ? deletingRecord.rollNo 
        : (deletingRecord.username || deletingRecord._id);
      const endpoint = `${API_BASE_URL}/api/admin/${activeTab}/${id}`;
      
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || 'Record deleted successfully!', 'success');
        setDeleteModalOpen(false);
        setDeletingRecord(null);
        fetchData();
      } else {
        showMessage(data.message || 'Failed to delete record', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: '#9ca3af' }}>⇅</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin-dashboard')}
          style={{
            backgroundColor: '#6b7280',
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
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          marginBottom: '25px'
        }}>
          <h1 style={{ 
            color: '#1e40af', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            📊 Data Management
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
            View, edit, and export student and teacher records
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div style={{
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5',
            color: message.type === 'error' ? '#dc2626' : '#059669',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '500',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#a7f3d0'}`
          }}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
            <button
              onClick={() => {
                setActiveTab('students');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{
                flex: 1,
                padding: '18px 20px',
                border: 'none',
                backgroundColor: activeTab === 'students' ? '#1e40af' : 'white',
                color: activeTab === 'students' ? 'white' : '#374151',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderBottom: activeTab === 'students' ? '3px solid #1e40af' : 'none'
              }}
            >
              👩‍🎓 Students
            </button>
            <button
              onClick={() => {
                setActiveTab('teachers');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{
                flex: 1,
                padding: '18px 20px',
                border: 'none',
                backgroundColor: activeTab === 'teachers' ? '#1e40af' : 'white',
                color: activeTab === 'teachers' ? 'white' : '#374151',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderBottom: activeTab === 'teachers' ? '3px solid #1e40af' : 'none'
              }}
            >
              👨‍🏫 Teachers
            </button>
          </div>

          {/* Search and Actions Bar */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1e40af'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <button
              onClick={handleDownloadExcel}
              disabled={isLoading}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              📥 Download Excel
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {isLoading ? (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                color: '#6b7280',
                fontSize: '16px'
              }}>
                Loading data...
              </div>
            ) : currentItems.length === 0 ? (
              <div style={{ 
                padding: '60px', 
                textAlign: 'center', 
                color: '#6b7280',
                fontSize: '16px'
              }}>
                No {activeTab} found
              </div>
            ) : (
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    {activeTab === 'students' ? (
                      <>
                        <th style={headerCellStyle} onClick={() => handleSort('name')}>
                          Name <SortIcon field="name" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('email')}>
                          Email <SortIcon field="email" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('department')}>
                          Department <SortIcon field="department" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('rollNo')}>
                          Enrollment No <SortIcon field="rollNo" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('batch')}>
                          Batch <SortIcon field="batch" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('group')}>
                          Group <SortIcon field="group" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('mentor_name')}>
                          Mentor <SortIcon field="mentor_name" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('username')}>
                          Username <SortIcon field="username" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('phone')}>
                          Phone <SortIcon field="phone" />
                        </th>
                        <th style={{ ...headerCellStyle, cursor: 'default', minWidth: '150px' }}>
                          Actions
                        </th>
                      </>
                    ) : (
                      <>
                        <th style={headerCellStyle} onClick={() => handleSort('name')}>
                          Name <SortIcon field="name" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('email')}>
                          Email <SortIcon field="email" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('department')}>
                          Department <SortIcon field="department" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('username')}>
                          Username <SortIcon field="username" />
                        </th>
                        <th style={headerCellStyle} onClick={() => handleSort('contact_number')}>
                          Phone <SortIcon field="contact_number" />
                        </th>
                        <th style={{ ...headerCellStyle, cursor: 'default', minWidth: '150px' }}>
                          Actions
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr 
                      key={index}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {activeTab === 'students' ? (
                        <>
                          <td style={dataCellStyle}>{item.name}</td>
                          <td style={dataCellStyle}>{item.email}</td>
                          <td style={dataCellStyle}>{item.department}</td>
                          <td style={dataCellStyle}>{item.rollNo}</td>
                          <td style={dataCellStyle}>
                            <span style={{
                              backgroundColor: item.batch ? '#dbeafe' : '#f3f4f6',
                              color: item.batch ? '#1e40af' : '#6b7280',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {item.batch || 'N/A'}
                            </span>
                          </td>
                          <td style={dataCellStyle}>
                            <span style={{
                              backgroundColor: item.group ? '#dcfce7' : '#f3f4f6',
                              color: item.group ? '#166534' : '#6b7280',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {item.group || 'N/A'}
                            </span>
                          </td>
                          <td style={dataCellStyle}>
                            <span style={{
                              backgroundColor: item.mentor_name ? '#fef3c7' : '#f3f4f6',
                              color: item.mentor_name ? '#92400e' : '#6b7280',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {item.mentor_name || 'Not Assigned'}
                            </span>
                          </td>
                          <td style={dataCellStyle}>
                            <span style={{
                              backgroundColor: item.username ? '#dbeafe' : '#fee2e2',
                              color: item.username ? '#1e40af' : '#991b1b',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {item.username || 'Not Set'}
                            </span>
                          </td>
                          <td style={dataCellStyle}>{item.phone || 'N/A'}</td>
                        </>
                      ) : (
                        <>
                          <td style={dataCellStyle}>{item.name}</td>
                          <td style={dataCellStyle}>{item.email}</td>
                          <td style={dataCellStyle}>{item.department}</td>
                          <td style={dataCellStyle}>
                            <span style={{
                              backgroundColor: item.username ? '#dbeafe' : '#fee2e2',
                              color: item.username ? '#1e40af' : '#991b1b',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {item.username || 'Not Set'}
                            </span>
                          </td>
                          <td style={dataCellStyle}>{item.contact_number || 'N/A'}</td>
                        </>
                      )}
                      <td style={dataCellStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: '8px 14px',
                          border: '1px solid #d1d5db',
                          backgroundColor: currentPage === pageNum ? '#1e40af' : 'white',
                          color: currentPage === pageNum ? 'white' : '#374151',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          minWidth: '38px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} style={{ padding: '8px 4px', color: '#9ca3af' }}>...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editModalOpen && editingRecord && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1e40af',
                marginBottom: '20px'
              }}>
                {activeTab === 'students' ? '✏️ Edit Student' : '✏️ Edit Teacher'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name */}
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    type="text"
                    value={editingRecord.name || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, name: e.target.value})}
                    style={inputStyle}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={editingRecord.email || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, email: e.target.value})}
                    style={inputStyle}
                  />
                </div>

                {/* Department */}
                <div>
                  <label style={labelStyle}>Department</label>
                  <input
                    type="text"
                    value={editingRecord.department || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, department: e.target.value})}
                    style={inputStyle}
                  />
                </div>

                {activeTab === 'students' ? (
                  <>
                    {/* Roll Number (Read-only for students) */}
                    <div>
                      <label style={labelStyle}>Enrollment Number</label>
                      <input
                        type="text"
                        value={editingRecord.rollNo || ''}
                        disabled
                        style={{...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                      />
                    </div>

                    {/* Username (Read-only - auto-generated) */}
                    <div>
                      <label style={labelStyle}>Username (Login)</label>
                      <input
                        type="text"
                        value={editingRecord.username || 'Will be auto-generated'}
                        disabled
                        style={{...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                      />
                      {!editingRecord.username && (
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          ℹ️ Username will be auto-generated when you save
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        type="text"
                        value={editingRecord.phone || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, phone: e.target.value})}
                        style={inputStyle}
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Course */}
                    <div>
                      <label style={labelStyle}>Course</label>
                      <input
                        type="text"
                        value={editingRecord.course || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, course: e.target.value})}
                        style={inputStyle}
                      />
                    </div>

                    {/* Batch (Enrollment Year) */}
                    <div>
                      <label style={labelStyle}>Batch (Enrollment Year)</label>
                      <select
                        value={editingRecord.batch || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, batch: e.target.value})}
                        style={inputStyle}
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

                    {/* Group (Section) */}
                    <div>
                      <label style={labelStyle}>Group / Section</label>
                      <select
                        value={editingRecord.group || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, group: e.target.value})}
                        style={inputStyle}
                      >
                        <option value="">Select Group</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Username (Read-only for teachers) */}
                    <div>
                      <label style={labelStyle}>Username (Login)</label>
                      <input
                        type="text"
                        value={editingRecord.username || ''}
                        disabled
                        style={{...inputStyle, backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        type="text"
                        value={editingRecord.contact_number || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, contact_number: e.target.value})}
                        style={inputStyle}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '30px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingRecord(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    backgroundColor: '#1e40af',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && deletingRecord && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '20px' }}>
                ⚠️
              </div>
              
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#dc2626',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Delete {activeTab === 'students' ? 'Student' : 'Teacher'} Record
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#4b5563',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                Are you sure you want to delete:
              </p>

              <div style={{
                backgroundColor: '#fee2e2',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#991b1b',
                  margin: '0 0 8px 0',
                  textAlign: 'center'
                }}>
                  {deletingRecord.name}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#7f1d1d',
                  margin: 0,
                  textAlign: 'center'
                }}>
                  {activeTab === 'students' 
                    ? `Roll No: ${deletingRecord.rollNo}` 
                    : `Username: ${deletingRecord.username}`
                  }
                </p>
              </div>

              <p style={{
                fontSize: '14px',
                color: '#dc2626',
                marginBottom: '25px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ⚠️ This action cannot be undone. {activeTab === 'students' && 'All attendance records will also be deleted.'}
              </p>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeletingRecord(null);
                  }}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  {isLoading ? 'Deleting...' : '🗑️ Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const headerCellStyle = {
  padding: '16px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '2px solid #e5e7eb',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap'
};

const dataCellStyle = {
  padding: '16px',
  color: '#4b5563',
  whiteSpace: 'nowrap'
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s'
};

export default DataManagement;

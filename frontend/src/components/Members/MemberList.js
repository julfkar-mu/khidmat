import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import './Members.css';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (memberId, currentStatus) => {
    try {
      await api.put(`/members/${memberId}/toggle-status`);
      toast.success(`Member ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update member status');
    }
  };

  const columns = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Mobile No',
      selector: (row) => row.mobile_no,
      sortable: true,
    },
    {
      name: 'Address',
      selector: (row) => row.address,
      wrap: true,
    },
    {
      name: 'Admin Name',
      selector: (row) => row.admin_name || 'N/A',
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row) => row.is_active ? 'Active' : 'Inactive',
      sortable: true,
      cell: (row) => (
        <span className={row.is_active ? 'status-active' : 'status-inactive'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <button
          className={`btn ${row.is_active ? 'btn-danger' : 'btn-success'}`}
          onClick={() => handleToggleStatus(row.id, row.is_active)}
          style={{ padding: '5px 10px', fontSize: '14px' }}
        >
          {row.is_active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(filterText.toLowerCase()) ||
      member.mobile_no.includes(filterText) ||
      (member.admin_name && member.admin_name.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <div className="table-header">
            <h2>Member List</h2>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/members/register')}
            >
              Add New Member
            </button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, mobile, or admin..."
              className="form-control"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <DataTable
            columns={columns}
            data={filteredMembers}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                },
              },
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default MemberList;



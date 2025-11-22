import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import './Members.css';

const MemberRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile_no: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/members', formData);
      toast.success('Member registered successfully!');
      setFormData({ name: '', mobile_no: '', address: '' });
      navigate('/members');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Member Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Member Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile No *</label>
              <input
                type="text"
                name="mobile_no"
                className="form-control"
                value={formData.mobile_no}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                className="form-control"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register Member'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/members')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default MemberRegistration;



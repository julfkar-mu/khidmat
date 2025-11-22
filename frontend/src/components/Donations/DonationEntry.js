import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import './Donations.css';

const DonationEntry = () => {
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    contact_no: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);

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
      await api.post('/donations', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      toast.success('Donation recorded successfully!');
      setFormData({
        beneficiary_name: '',
        contact_no: '',
        amount: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Donation Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Beneficiary Name *</label>
              <input
                type="text"
                name="beneficiary_name"
                className="form-control"
                value={formData.beneficiary_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact No *</label>
              <input
                type="text"
                name="contact_no"
                className="form-control"
                value={formData.contact_no}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Record Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DonationEntry;





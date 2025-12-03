import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import './RecommendedBeneficiaries.css';

const RecommendBeneficiary = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    relative_name: '',
    mobile_no: '',
    address: '',
    reason: '',
    recommended_by: '',
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
      await api.post('/recommended-beneficiaries', formData);
      toast.success('Beneficiary recommendation submitted successfully!');
      setFormData({
        beneficiary_name: '',
        relative_name: '',
        mobile_no: '',
        address: '',
        reason: '',
        recommended_by: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="recommend-beneficiary-container">
        <div className="recommend-beneficiary-card">
          <h2>Recommend Beneficiary</h2>
          <p className="subtitle">Submit a beneficiary recommendation for consideration</p>
          
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
                placeholder="Enter beneficiary's full name"
              />
            </div>

            <div className="form-group">
              <label>Relative Name *</label>
              <input
                type="text"
                name="relative_name"
                className="form-control"
                value={formData.relative_name}
                onChange={handleChange}
                required
                placeholder="Enter relative's name (e.g., Father, Mother, Spouse)"
              />
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="tel"
                name="mobile_no"
                className="form-control"
                value={formData.mobile_no}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
                pattern="[0-9]{10,15}"
                title="Please enter a valid mobile number"
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Enter complete address"
              />
            </div>

            <div className="form-group">
              <label>Recommended By *</label>
              <input
                type="text"
                name="recommended_by"
                className="form-control"
                value={formData.recommended_by}
                onChange={handleChange}
                required
                placeholder="Enter the name of the person recommending this beneficiary"
              />
            </div>

            <div className="form-group">
              <label>Reason for Recommendation *</label>
              <textarea
                name="reason"
                className="form-control"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Please provide details about why this beneficiary should be considered for assistance"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Recommendation'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/recommended-beneficiaries/report')}
              >
                View Recommendations
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RecommendBeneficiary;


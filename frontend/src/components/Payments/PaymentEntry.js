import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import './Payments.css';

const PaymentEntry = () => {
  const [formData, setFormData] = useState({
    member_id: '',
    member_name: '',
    contact_no: '',
    amount: '200',
  });
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.filter(m => m.is_active));
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMemberSelect = (member) => {
    setFormData({
      ...formData,
      member_id: member.id.toString(),
      member_name: member.name,
      contact_no: member.mobile_no,
    });
    setMemberSearch(`${member.name} - ${member.mobile_no}`);
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setMemberSearch(value);
    setIsDropdownOpen(true);
    
    // Clear selection if search doesn't match selected member
    if (formData.member_id) {
      const selectedMember = members.find(m => m.id === parseInt(formData.member_id));
      if (!selectedMember || !value.toLowerCase().includes(selectedMember.name.toLowerCase())) {
        setFormData({
          ...formData,
          member_id: '',
          member_name: '',
          contact_no: '',
        });
      }
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const filteredMembers = members.filter((member) => {
    if (!memberSearch.trim()) return true;
    const query = memberSearch.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.mobile_no.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/payments', {
        ...formData,
        member_id: parseInt(formData.member_id),
        amount: parseFloat(formData.amount),
      });
      toast.success('Payment recorded successfully!');
      setFormData({
        member_id: '',
        member_name: '',
        contact_no: '',
        amount: '200',
      });
      setMemberSearch('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="card">
          <h2>Payment Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Member Name *</label>
              <div className="searchable-select" ref={dropdownRef}>
                <input
                  type="text"
                  ref={inputRef}
                  className="form-control searchable-select-input"
                  placeholder="Search and select member by name or contact number"
                  value={memberSearch}
                  onChange={handleSearchChange}
                  onFocus={handleInputFocus}
                  autoComplete="off"
                />
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  name="member_id"
                  value={formData.member_id}
                  required
                />
                {isDropdownOpen && (
                  <div className="searchable-select-dropdown">
                    {filteredMembers.length === 0 ? (
                      <div className="searchable-select-no-results">
                        No members found matching "{memberSearch}"
                      </div>
                    ) : (
                      filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`searchable-select-option ${
                            formData.member_id === member.id.toString() ? 'selected' : ''
                          }`}
                          onClick={() => handleMemberSelect(member)}
                        >
                          <div className="option-name">{member.name}</div>
                          <div className="option-contact">{member.mobile_no}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
              <label>Amount * (Monthly contribution: ₹200)</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="200"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentEntry;


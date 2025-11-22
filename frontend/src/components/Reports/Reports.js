import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
  const [adminPayments, setAdminPayments] = useState([]);
  const [monthlyCollection, setMonthlyCollection] = useState([]);
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [poolBalance, setPoolBalance] = useState(null);
  const [monthlyCollectionDetails, setMonthlyCollectionDetails] = useState([]);
  const [monthlyCollectionTotal, setMonthlyCollectionTotal] = useState(0);
  const [monthlyDonationDetails, setMonthlyDonationDetails] = useState([]);
  const [monthlyDonationTotal, setMonthlyDonationTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDonationMonth, setSelectedDonationMonth] = useState('');
  const [filterText, setFilterText] = useState('');
  const [donationFilterText, setDonationFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [donationDetailsLoading, setDonationDetailsLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchMonthlyCollectionDetails();
    fetchMonthlyDonationDetails();
  }, []);

  useEffect(() => {
    fetchMonthlyCollectionDetails(selectedMonth || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  useEffect(() => {
    fetchMonthlyDonationDetails(selectedDonationMonth || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDonationMonth]);

  const fetchReports = async () => {
    try {
      const [adminPaymentsRes, monthlyCollectionRes, monthlyDonationsRes, poolBalanceRes] = await Promise.all([
        api.get('/reports/admin-payments'),
        api.get('/reports/monthly-collection'),
        api.get('/reports/monthly-donations'),
        api.get('/reports/pool-balance'),
      ]);

      setAdminPayments(adminPaymentsRes.data || []);
      setMonthlyCollection(monthlyCollectionRes.data || []);
      setMonthlyDonations(monthlyDonationsRes.data || []);
      setPoolBalance(poolBalanceRes.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
      // Ensure arrays are set to empty arrays even on error
      setAdminPayments([]);
      setMonthlyCollection([]);
      setMonthlyDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyCollectionDetails = async (month = '') => {
    setDetailsLoading(true);
    try {
      const url = month 
        ? `/reports/monthly-collection-details?month=${month}`
        : '/reports/monthly-collection-details';
      const response = await api.get(url);
      setMonthlyCollectionDetails(response.data.details || []);
      setMonthlyCollectionTotal(response.data.total || 0);
      if (!selectedMonth && response.data.month) {
        setSelectedMonth(response.data.month);
      }
    } catch (error) {
      toast.error('Failed to fetch monthly collection details');
      setMonthlyCollectionDetails([]);
      setMonthlyCollectionTotal(0);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchMonthlyDonationDetails = async (month = '') => {
    setDonationDetailsLoading(true);
    try {
      const url = month 
        ? `/reports/monthly-donation-details?month=${month}`
        : '/reports/monthly-donation-details';
      const response = await api.get(url);
      setMonthlyDonationDetails(response.data.details || []);
      setMonthlyDonationTotal(response.data.total || 0);
      if (!selectedDonationMonth && response.data.month) {
        setSelectedDonationMonth(response.data.month);
      }
    } catch (error) {
      toast.error('Failed to fetch monthly donation details');
      setMonthlyDonationDetails([]);
      setMonthlyDonationTotal(0);
    } finally {
      setDonationDetailsLoading(false);
    }
  };

  const adminPaymentsColumns = [
    {
      name: 'Admin Name',
      selector: (row) => row.admin_name,
      sortable: true,
    },
    {
      name: 'Paid Members',
      selector: (row) => row.paid_members,
      sortable: true,
    },
    {
      name: 'Pending Members',
      selector: (row) => row.pending_members,
      sortable: true,
    },
    {
      name: 'Total Amount',
      selector: (row) => `₹${row.total_amount.toFixed(2)}`,
      sortable: true,
    },
  ];

  const monthlyCollectionColumns = [
    {
      name: 'Month',
      selector: (row) => row.month,
      sortable: true,
    },
    {
      name: 'Total Collection',
      selector: (row) => `₹${row.total.toFixed(2)}`,
      sortable: true,
    },
  ];

  const monthlyDonationsColumns = [
    {
      name: 'Month',
      selector: (row) => row.month,
      sortable: true,
    },
    {
      name: 'Total Donations',
      selector: (row) => `₹${row.total.toFixed(2)}`,
      sortable: true,
    },
  ];

  const monthlyCollectionDetailsColumns = [
    {
      name: 'Member Name',
      selector: (row) => row.member_name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Contact No',
      selector: (row) => row.contact_no,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row) => `₹${row.amount.toFixed(2)}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Account Admin',
      selector: (row) => row.admin_name,
      sortable: true,
    },
    {
      name: 'Payment Date',
      selector: (row) => row.payment_date,
      sortable: true,
    },
  ];

  const monthlyDonationDetailsColumns = [
    {
      name: 'Beneficiary Name',
      selector: (row) => row.beneficiary_name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Contact No',
      selector: (row) => row.contact_no,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: (row) => `₹${row.amount.toFixed(2)}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Account Admin',
      selector: (row) => row.admin_name,
      sortable: true,
    },
    {
      name: 'Donation Date',
      selector: (row) => row.donation_date,
      sortable: true,
    },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const monthLabel = selectedMonth || new Date().toISOString().slice(0, 7);
    
    // Title
    doc.setFontSize(18);
    doc.text('Monthly Collection Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${monthLabel}`, 14, 30);
    doc.text(`Total Collection: Rs. ${monthlyCollectionTotal.toFixed(2)}`, 14, 37);
    
    // Table data - replace rupee symbol with "Rs."
    const tableData = monthlyCollectionDetails.map(item => [
      item.member_name,
      item.contact_no,
      `Rs. ${item.amount.toFixed(2)}`,
      item.admin_name,
      item.payment_date,
    ]);

    // Add table
    autoTable(doc, {
      head: [['Member Name', 'Contact No', 'Amount', 'Account Admin', 'Payment Date']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Add total at bottom
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Collection: Rs. ${monthlyCollectionTotal.toFixed(2)}`, 14, finalY);
    
    // Save PDF
    doc.save(`Monthly_Collection_${monthLabel}.pdf`);
  };

  // Get available months from monthlyCollection for dropdown
  const availableMonths = monthlyCollection.map(item => item.month).reverse();
  const availableDonationMonths = monthlyDonations.map(item => item.month).reverse();

  const handleDownloadDonationPDF = () => {
    const doc = new jsPDF();
    const monthLabel = selectedDonationMonth || new Date().toISOString().slice(0, 7);
    
    // Title
    doc.setFontSize(18);
    doc.text('Monthly Donation Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${monthLabel}`, 14, 30);
    doc.text(`Total Donation: Rs. ${monthlyDonationTotal.toFixed(2)}`, 14, 37);
    
    // Table data - replace rupee symbol with "Rs."
    const tableData = monthlyDonationDetails.map(item => [
      item.beneficiary_name,
      item.contact_no,
      `Rs. ${item.amount.toFixed(2)}`,
      item.admin_name,
      item.donation_date,
    ]);

    // Add table
    autoTable(doc, {
      head: [['Beneficiary Name', 'Contact No', 'Amount', 'Account Admin', 'Donation Date']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Add total at bottom
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Donation: Rs. ${monthlyDonationTotal.toFixed(2)}`, 14, finalY);
    
    // Save PDF
    doc.save(`Monthly_Donation_${monthLabel}.pdf`);
  };

  return (
    <Layout>
      <div className="container">
        <h1>Reports</h1>

        {/* Wallet Balance Card */}
        {poolBalance && (
          <div className="card balance-card">
            <h2 className="wallet-heading">
              <span className="wallet-icon" aria-hidden="true">👛</span>
              Wallet Balance
            </h2>
            <p className="wallet-subtitle">
              Monitor how much money is available after payments and donations.
            </p>
            <div className="balance-stats">
              <div className="stat-item">
                <label>Total Payments</label>
                <div className="stat-value">₹{poolBalance.total_payments.toFixed(2)}</div>
              </div>
              <div className="stat-item">
                <label>Total Donations</label>
                <div className="stat-value">₹{poolBalance.total_donations.toFixed(2)}</div>
              </div>
              <div className="stat-item">
                <label>Available Wallet Balance</label>
                <div className="stat-value balance">₹{poolBalance.balance.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Payments Report */}
        <div className="card">
          <h2>Account Admin Wise Payment Report (Current Month)</h2>
          <DataTable
            columns={adminPaymentsColumns}
            data={adminPayments}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
          />
        </div>

        {/* Monthly Collection Summary */}
        <div className="card">
          <h2>Monthly Collection Summary</h2>
          <DataTable
            columns={monthlyCollectionColumns}
            data={monthlyCollection}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
          />
        </div>

        {/* Monthly Collection Details */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>Monthly Collection Details</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setFilterText(''); // Reset search when month changes
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              >
                <option value="">Current Month</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <button
                onClick={handleDownloadPDF}
                className="btn btn-primary"
                disabled={detailsLoading || monthlyCollectionDetails.length === 0}
                style={{ whiteSpace: 'nowrap' }}
              >
                Download PDF
              </button>
            </div>
          </div>
          
          {/* Total at top */}
          {monthlyCollectionTotal > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'right',
              border: '1px solid #dee2e6',
            }}>
              <strong style={{ fontSize: '18px', color: '#667eea' }}>
                Total Collection: ₹{monthlyCollectionTotal.toFixed(2)}
              </strong>
            </div>
          )}

          <DataTable
            columns={monthlyCollectionDetailsColumns}
            data={monthlyCollectionDetails.filter(item => 
              item.member_name?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.contact_no?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.admin_name?.toLowerCase().includes(filterText.toLowerCase())
            )}
            progressPending={detailsLoading}
            pagination
            highlightOnHover
            responsive
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="Search by member name, contact, or admin..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '100%',
                  maxWidth: '400px',
                }}
              />
            }
          />
        </div>

        {/* Monthly Donations Summary */}
        <div className="card">
          <h2>Monthly Donations Summary</h2>
          <DataTable
            columns={monthlyDonationsColumns}
            data={monthlyDonations}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
          />
        </div>

        {/* Monthly Donation Details */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>Monthly Donation Details</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedDonationMonth}
                onChange={(e) => {
                  setSelectedDonationMonth(e.target.value);
                  setDonationFilterText(''); // Reset search when month changes
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              >
                <option value="">Current Month</option>
                {availableDonationMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <button
                onClick={handleDownloadDonationPDF}
                className="btn btn-primary"
                disabled={donationDetailsLoading || monthlyDonationDetails.length === 0}
                style={{ whiteSpace: 'nowrap' }}
              >
                Download PDF
              </button>
            </div>
          </div>
          
          {/* Total at top */}
          {monthlyDonationTotal > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'right',
              border: '1px solid #dee2e6',
            }}>
              <strong style={{ fontSize: '18px', color: '#667eea' }}>
                Total Donation: ₹{monthlyDonationTotal.toFixed(2)}
              </strong>
            </div>
          )}

          <DataTable
            columns={monthlyDonationDetailsColumns}
            data={monthlyDonationDetails.filter(item => 
              item.beneficiary_name?.toLowerCase().includes(donationFilterText.toLowerCase()) ||
              item.contact_no?.toLowerCase().includes(donationFilterText.toLowerCase()) ||
              item.admin_name?.toLowerCase().includes(donationFilterText.toLowerCase())
            )}
            progressPending={donationDetailsLoading}
            pagination
            highlightOnHover
            responsive
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="Search by beneficiary name, contact, or admin..."
                value={donationFilterText}
                onChange={(e) => setDonationFilterText(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '100%',
                  maxWidth: '400px',
                }}
              />
            }
          />
        </div>
      </div>
    </Layout>
  );
};

export default Reports;



import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
  const [paidMembers, setPaidMembers] = useState([]);
  const [unpaidMembers, setUnpaidMembers] = useState([]);
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
  const [paidFilterText, setPaidFilterText] = useState('');
  const [unpaidFilterText, setUnpaidFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [donationDetailsLoading, setDonationDetailsLoading] = useState(false);
  const [paidMembersLoading, setPaidMembersLoading] = useState(false);
  const [unpaidMembersLoading, setUnpaidMembersLoading] = useState(false);

  const fetchMonthlyCollectionDetails = useCallback(async (month = '') => {
    setDetailsLoading(true);
    try {
      const url = month 
        ? `/reports/monthly-collection-details?month=${month}`
        : '/reports/monthly-collection-details';
      const response = await api.get(url);
      setMonthlyCollectionDetails(response.data.details || []);
      setMonthlyCollectionTotal(response.data.total || 0);
      setSelectedMonth((prev) => (!prev && response.data.month ? response.data.month : prev));
    } catch (error) {
      toast.error('Failed to fetch monthly collection details');
      setMonthlyCollectionDetails([]);
      setMonthlyCollectionTotal(0);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const fetchMonthlyDonationDetails = useCallback(async (month = '') => {
    setDonationDetailsLoading(true);
    try {
      const url = month 
        ? `/reports/monthly-donation-details?month=${month}`
        : '/reports/monthly-donation-details';
      const response = await api.get(url);
      setMonthlyDonationDetails(response.data.details || []);
      setMonthlyDonationTotal(response.data.total || 0);
      setSelectedDonationMonth((prev) => (!prev && response.data.month ? response.data.month : prev));
    } catch (error) {
      toast.error('Failed to fetch monthly donation details');
      setMonthlyDonationDetails([]);
      setMonthlyDonationTotal(0);
    } finally {
      setDonationDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchPaidMembers();
    fetchUnpaidMembers();
    fetchMonthlyCollectionDetails();
    fetchMonthlyDonationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMonthlyCollectionDetails(selectedMonth || '');
  }, [selectedMonth, fetchMonthlyCollectionDetails]);

  useEffect(() => {
    fetchMonthlyDonationDetails(selectedDonationMonth || '');
  }, [selectedDonationMonth, fetchMonthlyDonationDetails]);

  const fetchReports = async () => {
    try {
      const [monthlyCollectionRes, monthlyDonationsRes, poolBalanceRes] = await Promise.all([
        api.get('/reports/monthly-collection'),
        api.get('/reports/monthly-donations'),
        api.get('/reports/pool-balance'),
      ]);

      setMonthlyCollection(monthlyCollectionRes.data || []);
      setMonthlyDonations(monthlyDonationsRes.data || []);
      setPoolBalance(poolBalanceRes.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
      // Ensure arrays are set to empty arrays even on error
      setMonthlyCollection([]);
      setMonthlyDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidMembers = async () => {
    setPaidMembersLoading(true);
    try {
      const response = await api.get('/reports/paid-members');
      setPaidMembers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch paid members report');
      setPaidMembers([]);
    } finally {
      setPaidMembersLoading(false);
    }
  };

  const fetchUnpaidMembers = async () => {
    setUnpaidMembersLoading(true);
    try {
      const response = await api.get('/reports/unpaid-members');
      setUnpaidMembers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch unpaid members report');
      setUnpaidMembers([]);
    } finally {
      setUnpaidMembersLoading(false);
    }
  };


  const paidMembersColumns = [
    {
      name: 'Member Name',
      selector: (row) => row.member_name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Mobile No',
      selector: (row) => row.mobile_no,
      sortable: true,
    },
    {
      name: 'Paid Amount',
      selector: (row) => `₹${row.paid_amount.toFixed(2)}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Payment Date',
      selector: (row) => row.payment_date,
      sortable: true,
    },
    {
      name: 'Account Admin',
      selector: (row) => row.admin_name,
      sortable: true,
    },
  ];

  const unpaidMembersColumns = [
    {
      name: 'Member Name',
      selector: (row) => row.member_name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Mobile No',
      selector: (row) => row.mobile_no,
      sortable: true,
    },
    {
      name: 'Account Admin',
      selector: (row) => row.admin_name,
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

  const handleDownloadPaidMembersPDF = () => {
    const doc = new jsPDF();
    const monthLabel = new Date().toISOString().slice(0, 7);
    const filteredData = paidMembers.filter(item => 
      item.member_name?.toLowerCase().includes(paidFilterText.toLowerCase()) ||
      item.mobile_no?.toLowerCase().includes(paidFilterText.toLowerCase()) ||
      item.admin_name?.toLowerCase().includes(paidFilterText.toLowerCase())
    );
    
    // Title
    doc.setFontSize(18);
    doc.text('Paid Members Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${monthLabel}`, 14, 30);
    doc.text(`Total Paid Members: ${filteredData.length}`, 14, 37);
    
    // Calculate total amount
    const totalAmount = filteredData.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
    doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, 44);
    
    // Table data
    const tableData = filteredData.map(item => [
      item.member_name,
      item.mobile_no,
      `Rs. ${item.paid_amount.toFixed(2)}`,
      item.payment_date,
      item.admin_name,
    ]);

    // Add table
    autoTable(doc, {
      head: [['Member Name', 'Mobile No', 'Paid Amount', 'Payment Date', 'Account Admin']],
      body: tableData,
      startY: 52,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Add total at bottom
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, finalY);
    
    // Save PDF
    doc.save(`Paid_Members_${monthLabel}.pdf`);
  };

  const handleDownloadUnpaidMembersPDF = () => {
    const doc = new jsPDF();
    const monthLabel = new Date().toISOString().slice(0, 7);
    const filteredData = unpaidMembers.filter(item => 
      item.member_name?.toLowerCase().includes(unpaidFilterText.toLowerCase()) ||
      item.mobile_no?.toLowerCase().includes(unpaidFilterText.toLowerCase()) ||
      item.admin_name?.toLowerCase().includes(unpaidFilterText.toLowerCase())
    );
    
    // Title
    doc.setFontSize(18);
    doc.text('Unpaid Members Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${monthLabel}`, 14, 30);
    doc.text(`Total Unpaid Members: ${filteredData.length}`, 14, 37);
    
    // Table data
    const tableData = filteredData.map(item => [
      item.member_name,
      item.mobile_no,
      item.admin_name,
    ]);

    // Add table
    autoTable(doc, {
      head: [['Member Name', 'Mobile No', 'Account Admin']],
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
    doc.text(`Total Unpaid Members: ${filteredData.length}`, 14, finalY);
    
    // Save PDF
    doc.save(`Unpaid_Members_${monthLabel}.pdf`);
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

        {/* Paid Members Report */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>Paid Members Report (Current Month)</h2>
            <button
              onClick={handleDownloadPaidMembersPDF}
              className="btn btn-primary"
              disabled={paidMembersLoading || paidMembers.length === 0}
              style={{ whiteSpace: 'nowrap' }}
            >
              Download PDF
            </button>
          </div>
          <DataTable
            columns={paidMembersColumns}
            data={paidMembers.filter(item => 
              item.member_name?.toLowerCase().includes(paidFilterText.toLowerCase()) ||
              item.mobile_no?.toLowerCase().includes(paidFilterText.toLowerCase()) ||
              item.admin_name?.toLowerCase().includes(paidFilterText.toLowerCase())
            )}
            progressPending={paidMembersLoading}
            pagination
            highlightOnHover
            responsive
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="Search by member name, mobile, or admin..."
                value={paidFilterText}
                onChange={(e) => setPaidFilterText(e.target.value)}
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

        {/* Unpaid Members Report */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>Unpaid Members Report (Current Month)</h2>
            <button
              onClick={handleDownloadUnpaidMembersPDF}
              className="btn btn-primary"
              disabled={unpaidMembersLoading || unpaidMembers.length === 0}
              style={{ whiteSpace: 'nowrap' }}
            >
              Download PDF
            </button>
          </div>
          <DataTable
            columns={unpaidMembersColumns}
            data={unpaidMembers.filter(item => 
              item.member_name?.toLowerCase().includes(unpaidFilterText.toLowerCase()) ||
              item.mobile_no?.toLowerCase().includes(unpaidFilterText.toLowerCase()) ||
              item.admin_name?.toLowerCase().includes(unpaidFilterText.toLowerCase())
            )}
            progressPending={unpaidMembersLoading}
            pagination
            highlightOnHover
            responsive
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="Search by member name, mobile, or admin..."
                value={unpaidFilterText}
                onChange={(e) => setUnpaidFilterText(e.target.value)}
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



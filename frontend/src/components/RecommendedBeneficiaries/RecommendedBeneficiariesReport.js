import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './RecommendedBeneficiaries.css';

const RecommendedBeneficiariesReport = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await api.get('/recommended-beneficiaries');
      setBeneficiaries(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch recommended beneficiaries');
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: 'Beneficiary Name',
      selector: (row) => row.beneficiary_name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Relative Name',
      selector: (row) => row.relative_name,
      sortable: true,
      wrap: true,
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
      width: '200px',
    },
    {
      name: 'Reason',
      selector: (row) => row.reason,
      wrap: true,
      width: '250px',
    },
    {
      name: 'Recommended By',
      selector: (row) => row.recommended_by,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Submitted By',
      selector: (row) => row.admin_name,
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => new Date(row.created_at).toLocaleDateString(),
      sortable: true,
    },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const monthLabel = new Date().toISOString().slice(0, 7);
    const filteredData = beneficiaries.filter(item => 
      item.beneficiary_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.relative_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.mobile_no?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.admin_name?.toLowerCase().includes(filterText.toLowerCase())
    );
    
    // Title
    doc.setFontSize(18);
    doc.text('Recommended Beneficiaries Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${monthLabel}`, 14, 30);
    doc.text(`Total Recommendations: ${filteredData.length}`, 14, 37);
    
    // Table data
    const tableData = filteredData.map(item => [
      item.beneficiary_name,
      item.relative_name,
      item.mobile_no,
      item.address.substring(0, 40) + (item.address.length > 40 ? '...' : ''),
      item.reason.substring(0, 40) + (item.reason.length > 40 ? '...' : ''),
      item.recommended_by,
      item.admin_name,
      new Date(item.created_at).toLocaleDateString(),
    ]);

    // Add table
    autoTable(doc, {
      head: [['Beneficiary Name', 'Relative Name', 'Mobile No', 'Address', 'Reason', 'Recommended By', 'Submitted By', 'Date']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 163, 74] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Add total at bottom
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Recommendations: ${filteredData.length}`, 14, finalY);
    
    // Save PDF
    doc.save(`Recommended_Beneficiaries_${monthLabel}.pdf`);
  };

  return (
    <Layout>
      <div className="recommended-beneficiaries-report-container">
        <div className="report-header">
          <div>
            <h1>Recommended Beneficiaries Report</h1>
            <p className="report-subtitle">Current Month Recommendations</p>
          </div>
          <div className="report-actions">
            <button
              onClick={() => navigate('/recommended-beneficiaries')}
              className="btn btn-primary"
            >
              Add Recommendation
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-secondary"
              disabled={loading || beneficiaries.length === 0}
            >
              Download PDF
            </button>
          </div>
        </div>

        {beneficiaries.length > 0 && (
          <div className="report-summary">
            <strong>Total Recommendations: {beneficiaries.length}</strong>
          </div>
        )}

        <div className="report-card">
          <DataTable
            columns={columns}
            data={beneficiaries.filter(item => 
              item.beneficiary_name?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.relative_name?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.mobile_no?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.address?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.reason?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.recommended_by?.toLowerCase().includes(filterText.toLowerCase()) ||
              item.admin_name?.toLowerCase().includes(filterText.toLowerCase())
            )}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
            subHeader
            subHeaderComponent={
              <input
                type="text"
                placeholder="Search by beneficiary name, relative, mobile, address, reason, recommended by, or admin..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="search-input"
              />
            }
            noDataComponent="No recommended beneficiaries found for the current month"
          />
        </div>
      </div>
    </Layout>
  );
};

export default RecommendedBeneficiariesReport;


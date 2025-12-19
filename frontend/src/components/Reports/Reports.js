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

  // Helper to convert ArrayBuffer -> base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Load Devanagari font into jsPDF instance (expects font file at /fonts/...)
  const loadDevaFontToDoc = async (doc) => {
    try {
      // Fetch font from public folderMANGAL.TTF
      const res = await fetch('/fonts/NotoSansDevanagari-Regular.ttf');
      //const res = await fetch('/fonts/Mangal/MANGAL.TTF');
      if (!res.ok) return;
      const ab = await res.arrayBuffer();
      const b64 = arrayBufferToBase64(ab);
      // filename used in VFS must match when adding font
      const vfsName = 'NotoSansDevanagari-Regular.ttf';
      doc.addFileToVFS(vfsName, b64);
      doc.addFont(vfsName, 'NotoSansDevanagari', 'normal');
      doc.setFont('NotoSansDevanagari');
    } catch (err) {
      // silently fail — fallback to default font
      console.warn('Could not load Devanagari font for PDF:', err);
    }
  };

  const handleDownloadPDF = () => {
    (async () => {
      const doc = new jsPDF();
      await loadDevaFontToDoc(doc);
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
        styles: { fontSize: 8, font: 'NotoSansDevanagari' },
        headStyles: { fillColor: [102, 126, 234] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      // Add total at bottom
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Collection: Rs. ${monthlyCollectionTotal.toFixed(2)}`, 14, finalY);
      doc.save(`Monthly_Collection_${monthLabel}.pdf`);
    })();
  };

  // Get available months from monthlyCollection for dropdown
  const availableMonths = monthlyCollection.map(item => item.month).reverse();
  const availableDonationMonths = monthlyDonations.map(item => item.month).reverse();

  const handleDownloadDonationPDF = () => {
    (async () => {
      const doc = new jsPDF();
      await loadDevaFontToDoc(doc);
      const monthLabel = selectedDonationMonth || new Date().toISOString().slice(0, 7);
      doc.setFontSize(18);
      doc.text('Monthly Donation Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Month: ${monthLabel}`, 14, 30);
      doc.text(`Total Donation: Rs. ${monthlyDonationTotal.toFixed(2)}`, 14, 37);

      const tableData = monthlyDonationDetails.map(item => [
        item.beneficiary_name,
        item.contact_no,
        `Rs. ${item.amount.toFixed(2)}`,
        item.admin_name,
        item.donation_date,
      ]);

      autoTable(doc, {
        head: [['Beneficiary Name', 'Contact No', 'Amount', 'Account Admin', 'Donation Date']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8, font: 'NotoSansDevanagari' },
        headStyles: { fillColor: [102, 126, 234] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Donation: Rs. ${monthlyDonationTotal.toFixed(2)}`, 14, finalY);
      doc.save(`Monthly_Donation_${monthLabel}.pdf`);
    })();
  };

  const handleDownloadPaidMembersPDF = () => {
    (async () => {
      const doc = new jsPDF();
      await loadDevaFontToDoc(doc);
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
      const totalAmount = filteredData.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
      doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, 44);
      const tableData = filteredData.map(item => [
        item.member_name,
        item.mobile_no,
        `Rs. ${item.paid_amount.toFixed(2)}`,
        item.payment_date,
        item.admin_name,
      ]);
      autoTable(doc, {
        head: [['Member Name', 'Mobile No', 'Paid Amount', 'Payment Date', 'Account Admin']],
        body: tableData,
        startY: 52,
        styles: { fontSize: 8, font: 'NotoSansDevanagari' },
        headStyles: { fillColor: [102, 126, 234] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 14, finalY);
      doc.save(`Paid_Members_${monthLabel}.pdf`);
    })();
  };

  const handleDownloadUnpaidMembersPDF = () => {
    (async () => {
      const doc = new jsPDF();
      await loadDevaFontToDoc(doc);
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
      const tableData = filteredData.map(item => [
        item.member_name,
        item.mobile_no,
        item.admin_name,
      ]);
      autoTable(doc, {
        head: [['Member Name', 'Mobile No', 'Account Admin']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8, font: 'NotoSansDevanagari' },
        headStyles: { fillColor: [102, 126, 234] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Unpaid Members: ${filteredData.length}`, 14, finalY);
      doc.save(`Unpaid_Members_${monthLabel}.pdf`);
    })();
  };

  /**
   * Open (or reuse) a window and write printable HTML that uses NotoSansDevanagari.
   * Call window.open() synchronously in the click handler and pass the returned win
   * into this function to avoid popup-blocking.
   */
  const openPrintableWindow = async (html, win = null) => {
    if (!win) {
      win = window.open('', '_blank', '');
      if (!win) {
        // caller can show a toast or fallback when this returns null
        return null;
      }
    }

    try {
      win.document.open();
      win.document.write(html);
      win.document.close();
      // wait for fonts to load (modern browsers)
      if (win.document.fonts && win.document.fonts.ready) {
        await win.document.fonts.ready;
      } else {
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (e) {
      // writing to the new window can fail in some strict environments; ignore here
    }

    return win;
  };

  /**
   * Build a small printable HTML page.
   * - title: string page title
   * - metaLines: array of small metadata strings
   * - columns: array of { title } for table header
   * - rowsHtml: pre-built string of <tr>...</tr> rows
   */
  const buildPrintableHtml = ({ title, metaLines = [], columns = [], rowsHtml = '', footerHtml = '' }) => {
    const headHtml = columns.length
      ? `<tr>${columns.map((c) => `<th>${c.title}</th>`).join('')}</tr>`
      : '';

    // Note: uses the @font-face defined in Reports.css (served from /fonts)
    return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        @media screen, print {
          html,body { margin:0; padding:0; }
        }
        body { padding:20px; color:#222; }
        /* reuse class defined in app CSS */
        .printable-deva { font-family: 'NotoSansDevanagari', Arial, sans-serif; }
        .printable-deva h1 { font-size:18px; margin-bottom:6px; }
        .printable-deva .meta { margin-bottom:12px; font-size:13px; }
        .printable-deva table { border-collapse: collapse; width:100%; font-size:12px; }
        .printable-deva th, .printable-deva td { padding:8px; border:1px solid #ddd; }
        .printable-deva th { background:#667eea; color:#fff; text-align:left; }
        @media print { button { display:none !important; } }
      </style>
    </head>
    <body>
      <div class="printable-deva">
        <h1>${title}</h1>
        <div class="meta">
          ${metaLines.map((m) => `<div>${m}</div>`).join('')}
        </div>
        <table>
          <thead>${headHtml}</thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="${columns.length || 1}" style="text-align:center;padding:8px;">No records</td></tr>`}
          </tbody>
          ${footerHtml ? `<tfoot>${footerHtml}</tfoot>` : ''}
        </table>
      </div>
      <script>
        (function(){
          // attempt to close window after printing completes
          function tryClose() { try { window.close(); } catch(e){} }

          // register afterprint where supported
          try {
            if (window.addEventListener) {
              window.addEventListener('afterprint', tryClose);
            }
            // legacy fallback
            if ('onafterprint' in window) window.onafterprint = tryClose;
          } catch (e) {}

          // trigger print after a short delay to allow fonts to load
          setTimeout(function(){ try { window.focus(); window.print(); } catch(e){} }, 350);

          // safety fallback: force-close after a reasonable delay
          setTimeout(tryClose, 8000);
        })();
      </script>
    </body>
  </html>`;
  };

  // Example small helper to convert rows to html (use in your handler)
  const rowsToHtml = (rows, mapFn) => {
    if (!rows || !rows.length) return '';
    return rows.map((r) => `<tr>${mapFn(r)}</tr>`).join('');
  };

  // add near other helpers (after buildPrintableHtml / rowsToHtml)
  const makeRowsHtmlFromColumns = (rows, columns) => {
    if (!rows || !rows.length) return '';
    return rows
      .map((r) =>
        `<tr>${columns
          .map((c) => {
            // get value from selector fn or key
            const val = typeof c.selector === 'function' ? c.selector(r) : r[c.selector] ?? '';
            return `<td style="padding:8px;border:1px solid #ddd;">${val ?? ''}</td>`;
          })
          .join('')}</tr>`
      )
      .join('');
  };

  // generic exporter that must be invoked from a click handler synchronously opening a window
  const exportTableToPdfViaPrint = async ({ title, metaLines = [], columns = [], rows = [] }, preOpenedWin) => {
    const rowsHtml = makeRowsHtmlFromColumns(rows, columns);
    const footerHtml = ''; // optionally build footer
    const html = buildPrintableHtml({ title, metaLines, columns: columns.map(c => ({ title: c.name })), rowsHtml, footerHtml });

    // If caller provided a pre-opened window (must be opened synchronously in click handler),
    // navigate it to a blob URL containing the printable HTML. This is more reliable than
    // async document.write in some browsers/extensions.
    if (preOpenedWin) {
      try {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        // navigate the new window to the blob URL
        preOpenedWin.location.href = url;

        // wait for the new window to load the blob URL (or fallback after a short delay)
        await new Promise((resolve) => {
          let resolved = false;
          const onLoad = () => {
            if (resolved) return;
            resolved = true;
            resolve();
          };
          try {
            preOpenedWin.addEventListener('load', onLoad, { once: true });
          } catch (e) {
            // if addEventListener fails, fall back to timeout
          }
          // fallback
          setTimeout(() => onLoad(), 900);
        });

        // free object URL after short delay so print can load resources
        setTimeout(() => {
          try { URL.revokeObjectURL(url); } catch (e) { }
        }, 5000);

        return preOpenedWin;
      } catch (err) {
        // fallback to writing into the preOpenedWin (best-effort)
        try {
          preOpenedWin.document.open();
          preOpenedWin.document.write(html);
          preOpenedWin.document.close();
        } catch (e) {
          // ignore
        }
        return preOpenedWin;
      }
    }

    // No pre-opened window: open normally (synchronous open required by caller)
    const win = window.open('', '_blank', '');
    if (!win) {
      toast.error('Popup blocked. Allow popups to print/download PDF.');
      return null;
    }
    await openPrintableWindow(html, win);
    return win;
  };

  // convenience wrappers to call from your buttons (open window synchronously here)
  const exportMonthlyCollectionPdf = (ev) => {
    // open synchronously in click handler
    const win = window.open('', '_blank', '');
    if (!win) {
      toast.error('Popup blocked. Allow popups to print/download PDF.');
      return;
    }

    // write small placeholder synchronously so the browser treats this as a user-opened window
    try {
      win.document.open();
      win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Preparing PDF</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#222}</style></head><body><h2>Preparing PDF…</h2><p>Please wait.</p></body></html>`);
      win.document.close();
    } catch (e) {
      // ignore write errors
    }

    const monthLabel = selectedMonth || new Date().toISOString().slice(0, 7);
    const meta = [`Month: ${monthLabel}`, `Total Collection: Rs. ${monthlyCollectionTotal.toFixed(2)}`];

    // async work writes the final HTML and triggers print
    exportTableToPdfViaPrint({
      title: 'Monthly Collection Report',
      metaLines: meta,
      columns: monthlyCollectionDetailsColumns,
      rows: monthlyCollectionDetails,
    }, win);
  };

  const exportMonthlyDonationPdf = () => {
    const win = window.open('', '_blank', '');
    if (!win) {
      toast.error('Popup blocked. Allow popups to print/download PDF.');
      return;
    }

    try {
      win.document.open();
      win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Preparing PDF</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#222}</style></head><body><h2>Preparing PDF…</h2><p>Please wait.</p></body></html>`);
      win.document.close();
    } catch (e) { }

    const monthLabel = selectedDonationMonth || new Date().toISOString().slice(0, 7);
    const meta = [`Month: ${monthLabel}`, `Total Donation: Rs. ${monthlyDonationTotal.toFixed(2)}`];

    exportTableToPdfViaPrint({
      title: 'Monthly Donation Report',
      metaLines: meta,
      columns: monthlyDonationDetailsColumns,
      rows: monthlyDonationDetails,
    }, win);
  };

  const exportPaidMembersPdf = () => {
    const win = window.open('', '_blank', '');
    if (!win) { toast.error('Popup blocked. Allow popups to print/download PDF.'); return; }

    const filteredData = paidMembers.filter(item =>
      item.member_name?.toLowerCase().includes(paidFilterText.toLowerCase()) ||
      item.mobile_no?.toLowerCase().includes(paidFilterText.toLowerCase()) ||
      item.admin_name?.toLowerCase().includes(paidFilterText.toLowerCase())
    );

    exportTableToPdfViaPrint({
      title: 'Paid Members Report',
      metaLines: [`Total Paid Members: ${filteredData.length}`],
      columns: paidMembersColumns,
      rows: filteredData,
    }, win);
  };

  const exportUnpaidMembersPdf = () => {
    const win = window.open('', '_blank', '');
    if (!win) { toast.error('Popup blocked. Allow popups to print/download PDF.'); return; }

    const filteredData = unpaidMembers.filter(item =>
      item.member_name?.toLowerCase().includes(unpaidFilterText.toLowerCase()) ||
      item.mobile_no?.toLowerCase().includes(unpaidFilterText.toLowerCase()) ||
      item.admin_name?.toLowerCase().includes(unpaidFilterText.toLowerCase())
    );

    exportTableToPdfViaPrint({
      title: 'Unpaid Members Report',
      metaLines: [`Total Unpaid Members: ${filteredData.length}`],
      columns: unpaidMembersColumns,
      rows: filteredData,
    }, win);
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
              onClick={exportPaidMembersPdf}
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
              onClick={exportUnpaidMembersPdf}
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
                onClick={exportMonthlyCollectionPdf}
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
                onClick={exportMonthlyDonationPdf}
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



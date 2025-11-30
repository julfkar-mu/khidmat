import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import Layout from '../Layout/Layout';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [monthlyCollection, setMonthlyCollection] = useState([]);
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [poolBalance, setPoolBalance] = useState(null);
  const [paidMembers, setPaidMembers] = useState([]);
  const [unpaidMembers, setUnpaidMembers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        monthlyCollectionRes,
        monthlyDonationsRes,
        adminPaymentsRes,
        poolBalanceRes,
        paidMembersRes,
        unpaidMembersRes,
      ] = await Promise.all([
        api.get('/reports/monthly-collection'),
        api.get('/reports/monthly-donations'),
        api.get('/reports/admin-payments'),
        api.get('/reports/pool-balance'),
        api.get('/reports/paid-members'),
        api.get('/reports/unpaid-members'),
      ]);

      setMonthlyCollection(monthlyCollectionRes.data || []);
      setMonthlyDonations(monthlyDonationsRes.data || []);
      setAdminPayments(adminPaymentsRes.data || []);
      setPoolBalance(poolBalanceRes.data);
      setPaidMembers(paidMembersRes.data || []);
      setUnpaidMembers(unpaidMembersRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'Member Registration', path: '/members/register', icon: '👤' },
    { title: 'Member List', path: '/members', icon: '📋' },
    { title: 'Payment Entry', path: '/payments', icon: '💰' },
    { title: 'Donation Entry', path: '/donations', icon: '🎁' },
    { title: 'View Reports', path: '/reports', icon: '📊' },
  ];

  // Prepare data for line chart (last 12 months)
  const lineChartData = monthlyCollection
    .slice()
    .reverse()
    .map((collection) => {
      const donation = monthlyDonations.find((d) => d.month === collection.month);
      return {
        month: collection.month,
        collection: collection.total,
        donations: donation ? donation.total : 0,
      };
    });

  // Prepare data for admin payments pie chart
  const adminPaymentsData = adminPayments.map((admin) => ({
    name: admin.admin_name,
    value: admin.total_amount,
  }));

  // Prepare data for paid vs unpaid pie chart
  const paymentStatusData = [
    { name: 'Paid Members', value: paidMembers.length },
    { name: 'Unpaid Members', value: unpaidMembers.length },
  ];

  // Colors for charts - Modern gradient-inspired palette
  const COLORS = [
    '#667eea', // Primary purple
    '#764ba2', // Deep purple
    '#f093fb', // Pink
    '#4facfe', // Blue
    '#43e97b', // Green
    '#fa709a', // Rose
    '#fee140', // Yellow
    '#30cfd0', // Cyan
    '#a8edea', // Light teal
    '#fed6e3', // Light pink
  ];
  const PAYMENT_STATUS_COLORS = ['#10b981', '#ef4444']; // Green for paid, Red for unpaid

  // Calculate statistics
  const totalMembers = paidMembers.length + unpaidMembers.length;
  const currentMonthCollection = monthlyCollection[0]?.total || 0;
  const currentMonthDonations = monthlyDonations[0]?.total || 0;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p className="welcome-message">
          Welcome, {user.type === 'master_admin' ? 'Master Admin' : 'Account Admin'}!
        </p>

        {/* Summary Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👛</div>
            <div className="stat-content">
              <div className="stat-label">Wallet Balance</div>
              <div className="stat-value">₹{poolBalance?.balance?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">Total Members</div>
              <div className="stat-value">{totalMembers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Paid Members</div>
              <div className="stat-value">{paidMembers.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-label">Unpaid Members</div>
              <div className="stat-value">{unpaidMembers.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Current Month Collection</div>
              <div className="stat-value">₹{currentMonthCollection.toFixed(2)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-content">
              <div className="stat-label">Current Month Donations</div>
              <div className="stat-value">₹{currentMonthDonations.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Line Chart - Monthly Trends */}
          <div className="chart-card">
            <h3>Monthly Collection & Donations Trend</h3>
            {loading ? (
              <div className="chart-loading">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#718096"
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#718096"
                    tick={{ fill: '#4a5568', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="collection"
                    stroke="#667eea"
                    strokeWidth={3}
                    name="Collection"
                    dot={{ fill: '#667eea', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="donations"
                    stroke="#f093fb"
                    strokeWidth={3}
                    name="Donations"
                    dot={{ fill: '#f093fb', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, stroke: '#f093fb', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart - Account Admin Payment Distribution */}
          {user.type === 'master_admin' && adminPaymentsData.length > 0 && (
            <div className="chart-card">
              <h3>Account Admin Payment Distribution (Current Month)</h3>
              {loading ? (
                <div className="chart-loading">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={adminPaymentsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {adminPaymentsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Pie Chart - Paid vs Unpaid Members */}
          <div className="chart-card">
            <h3>Payment Status (Current Month)</h3>
            {loading ? (
              <div className="chart-loading">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PAYMENT_STATUS_COLORS[index % PAYMENT_STATUS_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions Menu */}
        <div className="menu-section">
          <h2>Quick Actions</h2>
          <div className="menu-grid">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="menu-card"
                onClick={() => navigate(item.path)}
              >
                <div className="menu-icon">{item.icon}</div>
                <div className="menu-title">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;



import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { title: 'Member Registration', path: '/members/register', icon: '👤' },
    { title: 'Member List', path: '/members', icon: '📋' },
    { title: 'Payment Entry', path: '/payments', icon: '💰' },
    { title: 'Donation Entry', path: '/donations', icon: '🎁' },
    { title: 'View Reports', path: '/reports', icon: '📊' },
  ];

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome, {user.type === 'master_admin' ? 'Master Admin' : 'Account Admin'}!</p>
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
    </Layout>
  );
};

export default Dashboard;



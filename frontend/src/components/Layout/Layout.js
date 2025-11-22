import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate('/dashboard')}>Khidmat</h1>
          <nav className="nav">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate('/members')}>
              Members
            </button>
            <button className="nav-item" onClick={() => navigate('/payments')}>
              Payments
            </button>
            <button className="nav-item" onClick={() => navigate('/donations')}>
              Donations
            </button>
            <button className="nav-item" onClick={() => navigate('/reports')}>
              Reports
            </button>
            <div className="user-info">
              <span>{user.type === 'master_admin' ? 'Master Admin' : 'Account Admin'}</span>
              <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;



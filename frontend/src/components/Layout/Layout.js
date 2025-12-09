import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import logoIcon from '../../assets/logo-icon.svg';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Force re-render on route change
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="layout" key={location.pathname}>
      <header className="header">
        <div className="header-content">
          <div className="logo-container" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
            <img src={logoIcon} alt="Khidmat Logo" className="logo-icon" />
            <h1 className="logo">Khidmat</h1>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            <span className={`hamburger ${menuOpen ? 'is-open' : ''}`} />
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
            <button className="nav-item" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
              Dashboard
            </button>
            <button className="nav-item" onClick={() => { navigate('/members'); setMenuOpen(false); }}>
              Members
            </button>
            <button className="nav-item" onClick={() => { navigate('/payments'); setMenuOpen(false); }}>
              Payments
            </button>
            <button className="nav-item" onClick={() => { navigate('/donations'); setMenuOpen(false); }}>
              Donations
            </button>
            <button className="nav-item" onClick={() => { navigate('/recommended-beneficiaries'); setMenuOpen(false); }}>
              Recommend Beneficiary
            </button>
            <button className="nav-item" onClick={() => { navigate('/recommended-beneficiaries/report'); setMenuOpen(false); }}>
              Beneficiaries Report
            </button>
            <button className="nav-item" onClick={() => { navigate('/reports'); setMenuOpen(false); }}>
              Reports
            </button>
            <div className="user-info">
              <span>{user.type === 'master_admin' ? 'Master Admin' : 'Account Admin'}</span>
              <button className="btn btn-secondary logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                Logout
              </button>
            </div>
          </nav>

          {/* Backdrop when mobile menu is open */}
          <div
            className={`nav-backdrop ${menuOpen ? 'visible' : ''}`}
            onClick={() => setMenuOpen(false)}
            aria-hidden={!menuOpen}
          />
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;



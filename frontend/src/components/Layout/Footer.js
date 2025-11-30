import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        <div className="footer-text">
        Site developed and maintained by <b>Engineer Zulfiquar</b>
        </div>
        <div className="footer-avatar">
          <img 
            src="/avatar.png" 
            alt="Engineer Zulfiquar" 
            className="avatar-image"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;



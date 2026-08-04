import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState(() => localStorage.getItem('org_name') || 'Transformation Retail Group');

  useEffect(() => {
    const syncOrg = () => {
      setOrgName(localStorage.getItem('org_name') || 'Transformation Retail Group');
    };
    window.addEventListener('storage-update', syncOrg);
    window.addEventListener('focus', syncOrg);
    return () => {
      window.removeEventListener('storage-update', syncOrg);
      window.removeEventListener('focus', syncOrg);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <Sparkles size={20} className="navbar-icon" />
          <span>Transformation Intelligence</span>
        </div>
        <div className="navbar-divider" />
        <span 
          className="stat-badge" 
          onClick={() => navigate('/profile?tab=org')} 
          style={{ cursor: 'pointer' }}
          title="Click to view Organization & Profile settings"
        >
          {orgName}
        </span>
      </div>
      
      <div className="navbar-right">
        <button 
          className="logout-btn"
          onClick={() => navigate('/profile')}
          style={{ marginRight: '8px' }}
          title="Profile & Qdrant Settings"
        >
          <User size={16} />
          <span>Profile</span>
        </button>
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

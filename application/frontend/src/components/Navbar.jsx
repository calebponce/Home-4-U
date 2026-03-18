import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Compass, Brush, Presentation, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Workspace AI', path: '/workspace', icon: <Brush size={18} /> },
    { name: 'Discover', path: '/about', icon: <Compass size={18} /> },
    { name: 'Virtual Tour', path: '/virtual-tour', icon: <Presentation size={18} /> },
  ];

  return (
    <nav className={`navbar glass-morphism ${isScrolled ? 'shrunk' : ''}`}>
      <div className="navbar-container">
        <NavLink to="/dashboard" className="navbar-brand">
          <div className="brand-logo">🏠</div>
          <span className="brand-text">Home4U</span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="navbar-desktop">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-divider"></div>

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'Designer'}</span>
              <div className="user-avatar">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${isMobileMenuOpen ? 'open' : ''} glass-morphism`}>
        <ul className="mobile-nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </NavLink>
            </li>
          ))}
          <li className="mobile-divider"></li>
          <li>
            <button className="mobile-nav-link logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span className="nav-text">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

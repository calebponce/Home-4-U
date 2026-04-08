import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Compass, Brush, Presentation, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workspace AI', path: '/workspace', icon: Brush },
    { name: 'Discover', path: '/about', icon: Compass },
    { name: 'Virtual Tour', path: '/virtual-tour', icon: Presentation },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.nav 
      className={`navbar glassmorphism-elevated ${isScrolled ? 'shrunk' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="navbar-container">
        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand" aria-label="Home4U Dashboard">
          <motion.div 
            layoutId="global-brand-logo" 
            className="brand-stack"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className="brand-glow" />
            <div className="brand-icon">🏠</div>
            <motion.span 
              className="brand-text" 
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.15 }}
            >
              Home4U
            </motion.span>
          </motion.div>
        </NavLink>

        {/* Desktop Navigation */}
        <AnimatePresence mode="wait">
          <motion.ul 
            key="desktop-nav"
            className="navbar-desktop-nav"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="navbar-desktop"
          >
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.li key={item.path} variants={itemVariants}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      backgroundColor: 'rgba(255,255,255,0.12)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <motion.div 
                      className="nav-icon-container"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <span className="nav-text">{item.name}</span>
                    <motion.div 
                      className="nav-glow"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    />
                  </NavLink>
                </motion.li>
              );
            })}
            <motion.li 
              className="nav-divider"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              transition={{ delay: 0.4 }}
            />
            {/* User Menu */}
            <motion.li variants={itemVariants} className="user-menu-container">
              <motion.button
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="user-avatar" aria-hidden="true">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user?.full_name?.split(' ')[0] || 'Designer'}</span>
                <ChevronDown size={16} className={`chevron ${userMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.ul 
                    className="user-menu-dropdown"
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <motion.li>
                      <button className="user-menu-item" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          </motion.ul>
        </AnimatePresence>

        {/* Mobile Toggle */}
        <motion.button 
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="navbar-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              className="navbar-mobile glassmorphism-elevated"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ul className="mobile-nav-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  );
                })}
                <li className="mobile-divider" />
                <li>
                  <button className="mobile-nav-link logout" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;


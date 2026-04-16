import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Compass, Brush, Presentation, LogOut, Menu, X, ChevronDown, Home } from 'lucide-react';
import './Navbar.css';

const MotionNavLink = motion(NavLink);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const previousMobileFocusRef = useRef(null);

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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workspace', path: '/workspace', icon: Brush },
    { name: 'Explore Styles', path: '/about', icon: Compass },
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

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    previousMobileFocusRef.current = document.activeElement;
    const toggleEl = mobileToggleRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusFirst = () => {
      const root = mobileMenuRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll(focusableSelector);
      const first = focusables[0] || root;
      if (first?.focus) first.focus();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const root = mobileMenuRef.current;
      if (!root) return;
      const focusables = Array.from(root.querySelectorAll(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled')
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(focusFirst);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow || '';
      if (toggleEl?.focus) {
        toggleEl.focus();
      } else if (previousMobileFocusRef.current?.focus) {
        previousMobileFocusRef.current.focus();
      }
    };
  }, [isMobileMenuOpen]);

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
            <div className="brand-icon" aria-hidden="true"><Home size={16} strokeWidth={2.3} /></div>
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
            className="navbar-desktop navbar-desktop-nav"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li key={item.path} variants={itemVariants}>
                  <MotionNavLink 
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
                  </MotionNavLink>
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
                type="button"
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
                      <button type="button" className="user-menu-item" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
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
          type="button"
          ref={mobileToggleRef}
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-dialog"
          aria-haspopup="dialog"
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
            onClick={closeMobileMenu}
            role="presentation"
          >
            <motion.div 
              ref={mobileMenuRef}
              id="mobile-nav-dialog"
              className="navbar-mobile glassmorphism-elevated"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Primary navigation menu"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="mobile-nav-links">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  );
                })}
                <li className="mobile-divider" />
                <li>
                  <button type="button" className="mobile-nav-link logout" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
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

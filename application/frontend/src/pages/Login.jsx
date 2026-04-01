import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Home, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authAPI.signup(email, password);
        const response = await authAPI.login(email, password);
        login(response.data.access_token);
      } else {
        const response = await authAPI.login(email, password);
        login(response.data.access_token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="auth-split-layout">
      {/* Left side: Cinematic Hero */}
      <div className="auth-hero">
        <motion.div 
          layoutId="global-brand-logo"
          className="auth-hero-content auth-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Home size={28} /> Home4U
        </motion.div>
        
        <motion.div 
          className="auth-hero-content auth-quote"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants}>
            Elevate your space.<br />Unleash your aesthetic.
          </motion.h2>
          <motion.p variants={itemVariants}>
            Join the premium platform for spatial design. Upload your room, explore curated styles, and generate AI-powered interior renovations instantly.
          </motion.p>
        </motion.div>
      </div>

      {/* Right side: Form Container */}
      <div className="auth-form-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? 'register' : 'login'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="auth-form-header">
              <h3>{isRegister ? 'Create Workspace' : 'Welcome Back'}</h3>
              <p>{isRegister ? 'Sign up to start designing your dream home.' : 'Enter your studio credentials to continue.'}</p>
            </div>

            {error && (
              <motion.div 
                className="error-message" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="modern-form">
              <div className="input-floating">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="email">Studio Email</label>
              </div>

              <div className="input-floating">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <button type="submit" className="btn-cinematic" disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} className="spin" /> Authenticating...</>
                ) : (
                  <>{isRegister ? 'Initialize Studio' : 'Enter Workspace'} <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="auth-switch">
              {isRegister ? 'Already a member?' : 'New to Home4U?'}
              <button onClick={() => setIsRegister(!isRegister)} type="button">
                {isRegister ? 'Sign In' : 'Create an Account'}
              </button>
            </div>

            <div className="auth-exploration">
              <button onClick={() => navigate('/about')} type="button">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Explore the platform
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;

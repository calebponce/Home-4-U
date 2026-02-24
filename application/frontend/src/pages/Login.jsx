import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
        // Auto-login after registration
        const response = await authAPI.login(email, password);
        login(response.data.access_token);
      } else {
        const response = await authAPI.login(email, password);
        login(response.data.access_token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Home4U</h1>
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : isRegister ? 'Sign Up' : 'Login'}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Sign Up'}
          </button>
        </p>
        
        <p className="toggle-auth">
          <button onClick={() => navigate('/about')}>
            Learn More About Home4U
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './About.css';

const About = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: '🏠',
      title: 'Room Projects',
      description: 'Create and manage projects for any room in your home.'
    },
    {
      icon: '💰',
      title: 'Budget Tracking',
      description: 'Set and track your renovation budget with real-time updates.'
    },
    {
      icon: '🎨',
      title: 'Style Exploration',
      description: 'Discover various interior design styles for your space.'
    },
    {
      icon: '💡',
      title: 'Smart Recommendations',
      description: 'Get personalized product recommendations based on your style.'
    },
    {
      icon: '✅',
      title: 'Task Management',
      description: 'Track your renovation progress with built-in checklists.'
    },
    {
      icon: '📱',
      title: 'Anywhere Access',
      description: 'Access your projects from any device, anytime.'
    }
  ];

  const steps = [
    { number: '01', title: 'Create a Project', description: 'Select your room type' },
    { number: '02', title: 'Set Your Budget', description: 'Define spending limits' },
    { number: '03', title: 'Explore Styles', description: 'Choose your style' },
    { number: '04', title: 'Get Recommendations', description: 'Receive suggestions' }
  ];

  const teamMembers = [
    { name: 'Caleb Ponce', role: 'Team Lead / System Architecture', emoji: '👨‍💼', color: '#4F46E5' },
    { name: 'Tyler Morris', role: 'Backend & AI Integration', emoji: '⚙️', color: '#10B981' },
    { name: 'Christopher Quach', role: 'Frontend Development', emoji: '🎨', color: '#F59E0B' },
    { name: 'Mason Lee', role: 'Data Modeling & Scoring Engine', emoji: '📊', color: '#EC4899' },
    { name: 'Dias Almat', role: 'Technical Writer', emoji: '📝', color: '#8B5CF6' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`about-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Header */}
      <header className="about-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate('/dashboard')}>
            <span>🏠</span> Home4U
          </h1>
          <nav className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">✨ Welcome to Home4U</span>
          <h2 className="hero-title">
            Design Your <span>Dream Space</span>
          </h2>
          <p className="hero-description">
            Your personal interior design assistant. Create room projects, set budgets, explore styles, and get smart recommendations.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/dashboard')} className="primary-btn">
              Get Started →
            </button>
            <button onClick={() => scrollToSection('features')} className="secondary-btn">
              Learn More
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="stat-number">6+</span><span className="stat-text">Room Types</span></div>
            <div className="hero-stat"><span className="stat-number">5+</span><span className="stat-text">Styles</span></div>
            <div className="hero-stat"><span className="stat-number">∞</span><span className="stat-text">Possibilities</span></div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-card">
            <div className="card-glow"></div>
            <div className="card-content">
              <div className="card-icon">🛋️</div>
              <div className="card-text">Living Room Makeover</div>
              <div className="card-progress"><div className="progress-fill"></div></div>
              <div className="card-meta">
                <span>💰 $5,000</span>
                <span>🎨 Modern</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h3>Features</h3>
          <h2>Everything You Need</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ transform: hoveredCard === index ? 'translateY(-8px)' : 'translateY(0)' }}
            >
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <h3>Meet Our Team</h3>
          <h2>The People Behind Home4U</h2>
        </div>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="team-card"
              style={{ '--member-color': member.color }}
              onMouseEnter={() => setHoveredCard(`team-${index}`)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ transform: hoveredCard === `team-${index}` ? 'translateY(-8px)' : 'translateY(0)' }}
            >
              <div className="team-avatar">{member.emoji}</div>
              <h4>{member.name}</h4>
              <span className="team-role">{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Company Section */}
      <section className="company-section">
        <div className="company-content">
          <div className="company-text">
            <h3>About Our Company</h3>
            <h2>Home4U</h2>
            <p>
              Founded in February 2026, Home4U was born from a simple idea: everyone deserves to live in a space they love. 
              We believe that interior design shouldn't be exclusive or overwhelming.
            </p>
            <div className="company-values">
              <div className="value-item">
                <span className="value-icon">🎯</span>
                <div><h4>Our Mission</h4><p>Make professional interior design accessible to everyone</p></div>
              </div>
              <div className="value-item">
                <span className="value-icon">💎</span>
                <div><h4>Our Values</h4><p>Innovation, Accessibility, Creativity</p></div>
              </div>
              <div className="value-item">
                <span className="value-icon">🌟</span>
                <div><h4>Our Vision</h4><p>A world where everyone lives in their dream home</p></div>
              </div>
            </div>
          </div>
          <div className="company-visual">
            <div className="company-badge">
              <span className="badge-year">2026</span>
              <span className="badge-text">Founded with ❤️</span>
            </div>
            <div className="company-stats">
              <div className="company-stat"><span className="stat-value">1,000+</span><span className="stat-name">Happy Users</span></div>
              <div className="company-stat"><span className="stat-value">500+</span><span className="stat-name">Projects</span></div>
              <div className="company-stat"><span className="stat-value">50+</span><span className="stat-name">Styles</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h3>How It Works</h3>
          <h2>Simple Process</h2>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <span className="step-number">{step.number}</span>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item"><span className="stat-number">6+</span><span className="stat-label">Room Types</span></div>
          <div className="stat-item"><span className="stat-number">5+</span><span className="stat-label">Design Styles</span></div>
          <div className="stat-item"><span className="stat-number">∞</span><span className="stat-label">Possibilities</span></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Start your interior design journey today.</p>
          <button onClick={() => navigate('/dashboard')} className="cta-btn">
            Go to Dashboard 🚀
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>🏠 Home4U</h3>
            <p>Your personal interior design assistant</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Navigation</h4>
              <button onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button onClick={() => navigate('/login')}>Login</button>
            </div>
            <div className="footer-column">
              <h4>About</h4>
              <p>Version 1.0.0</p>
              <p>Made with ❤️</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Home4U. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;


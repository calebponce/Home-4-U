import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './About.css';

const About = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: '🏠',
      title: 'Room Projects',
      description: 'Create and manage projects for any room in your home - bedrooms, living rooms, kitchens, and more.'
    },
    {
      icon: '💰',
      title: 'Budget Tracking',
      description: 'Set and track your renovation budget with real-time spending updates and visual breakdowns.'
    },
    {
      icon: '🎨',
      title: 'Style Exploration',
      description: 'Discover various interior design styles - from modern minimalism to cozy farmhouse aesthetics.'
    },
    {
      icon: '💡',
      title: 'Smart Recommendations',
      description: 'Get personalized product recommendations based on your room type, budget, and preferred style.'
    },
    {
      icon: '✅',
      title: 'Task Management',
      description: 'Track your renovation progress with a built-in checklist system for each project.'
    },
    {
      icon: '📱',
      title: 'Anywhere Access',
      description: 'Access your projects from any device - your design journey syncs seamlessly across all platforms.'
    }
  ];

  const steps = [
    { number: '01', title: 'Create a Project', description: 'Select your room type and start a new project' },
    { number: '02', title: 'Set Your Budget', description: 'Define your spending limits for the renovation' },
    { number: '03', title: 'Explore Styles', description: 'Browse and choose your preferred interior style' },
    { number: '04', title: 'Get Recommendations', description: 'Receive personalized product suggestions' }
  ];

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate('/dashboard')}>Home4U</h1>
          <nav className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
            <button onClick={logout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Welcome to Home4U</span>
          <h2>Design Your Dream Space,<br />One Room at a Time</h2>
          <p>
            Home4U is your personal interior design assistant. Create room projects, 
            set budgets, explore styles, and get smart recommendations - all in one beautiful app.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/dashboard')} className="primary-btn">
              Get Started
            </button>
            <button onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }} className="secondary-btn">
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-cards">
            <div className="float-card card-1">🏠 Bedroom</div>
            <div className="float-card card-2">🎨 Modern</div>
            <div className="float-card card-3">💰 $5,000</div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <h3>Everything You Need</h3>
          <h2>Powerful Features for Your Home Projects</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="team-section">
        <div className="section-header">
          <h3>Meet Our Team</h3>
          <h2>The People Behind Home4U</h2>
        </div>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">👨‍💼</div>
            <h4>Caleb Ponce</h4>
            <span className="team-role">Team Lead / System Architecture</span>
            <p>Leading the vision and technical architecture of Home4U to deliver a seamless user experience.</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">⚙️</div>
            <h4>Tyler Morris</h4>
            <span className="team-role">Backend & AI Integration</span>
            <p>Building robust APIs and integrating AI capabilities to power intelligent recommendations.</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">🎨</div>
            <h4>Christopher Quach</h4>
            <span className="team-role">Frontend Development</span>
            <p>Crafting beautiful, intuitive interfaces that make design accessible to everyone.</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">📊</div>
            <h4>Mason Lee</h4>
            <span className="team-role">Data Modeling & Scoring Engine</span>
            <p>Developing the algorithms that power our style matching and recommendation systems.</p>
          </div>
          <div className="team-card">
            <div className="team-avatar">📝</div>
            <h4>Dias Almat</h4>
            <span className="team-role">Technical Writer</span>
            <p>Ensuring clear documentation and communication throughout the project.</p>
          </div>
        </div>
      </section>

      <section className="company-section">
        <div className="company-content">
          <div className="company-text">
            <h3>About Our Company</h3>
            <h2>Home4U - AI-Assisted, Budget-Aware Interior Style Matching Platform</h2>
            <p>
              Founded in February 2026, Home4U was born from a simple idea: everyone deserves to live in a 
              space they love. We believe that interior design shouldn't be exclusive or overwhelming. Our 
              mission is to make professional-quality design guidance accessible to everyone.
            </p>
            <p>
              Combining cutting-edge AI technology with timeless design principles, we help homeowners, renters, 
              and design enthusiasts transform their spaces into reflections of their personality and lifestyle. 
              Our unique resemblance scoring algorithm quantifies how well a room matches selected styles, 
              while our budget-aware prioritization ensures you get maximum impact for your investment.
            </p>
            <div className="company-values">
              <div className="value-item">
                <span className="value-icon">🎯</span>
                <div>
                  <h4>Our Mission</h4>
                  <p>Make professional interior design accessible to everyone</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">💎</span>
                <div>
                  <h4>Our Values</h4>
                  <p>Innovation, Accessibility, Creativity</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">🌟</span>
                <div>
                  <h4>Our Vision</h4>
                  <p>A world where everyone lives in their dream home</p>
                </div>
              </div>
            </div>
          </div>
          <div className="company-visual">
            <div className="company-badge">
              <span className="badge-year">2026</span>
              <span className="badge-text">Founded with ❤️</span>
            </div>
            <div className="company-stats">
              <div className="company-stat">
                <span className="stat-value">1,000+</span>
                <span className="stat-name">Happy Users</span>
              </div>
              <div className="company-stat">
                <span className="stat-value">500+</span>
                <span className="stat-name">Projects Created</span>
              </div>
              <div className="company-stat">
                <span className="stat-value">50+</span>
                <span className="stat-name">Design Styles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-header">
          <h3>Simple Process</h3>
          <h2>How It Works</h2>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <span className="step-number">{step.number}</span>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">6+</span>
            <span className="stat-label">Room Types</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5+</span>
            <span className="stat-label">Design Styles</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">∞</span>
            <span className="stat-label">Possibilities</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Start your interior design journey today and create the home you've always dreamed of.</p>
          <button onClick={() => navigate('/dashboard')} className="cta-btn">
            Go to Dashboard
          </button>
        </div>
      </section>

      <footer className="about-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Home4U</h3>
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


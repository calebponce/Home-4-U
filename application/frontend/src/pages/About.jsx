
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './About.css';

const About = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatedCounters, setAnimatedCounters] = useState({});
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [formStatus, setFormStatus] = useState('');

  useEffect(() => {
    setIsLoaded(true);
    animateCounters();
  }, []);

  const animateCounters = () => {
    const targets = { users: 1000, projects: 500, styles: 50 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedCounters({
        users: Math.floor(targets.users * eased),
        projects: Math.floor(targets.projects * eased),
        styles: Math.floor(targets.styles * eased)
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => {
      setFormStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    }, 1500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks for subscribing with ${newsletterEmail}!`);
    setNewsletterEmail('');
  };

  const features = [
    { icon: '🏠', title: 'Room Projects', desc: 'Create and manage projects for any room in your home.' },
    { icon: '💰', title: 'Budget Tracking', desc: 'Set and track your renovation budget with real-time updates.' },
    { icon: '🎨', title: 'Style Exploration', desc: 'Discover various interior design styles for your space.' },
    { icon: '💡', title: 'Smart Recommendations', desc: 'Get personalized product recommendations based on your style.' },
    { icon: '✅', title: 'Task Management', desc: 'Track your renovation progress with built-in checklists.' },
    { icon: '📱', title: 'Anywhere Access', desc: 'Access your projects from any device, anytime.' }
  ];

  const steps = [
    { number: '01', title: 'Create Project', desc: 'Select your room type' },
    { number: '02', title: 'Set Budget', desc: 'Define spending limits' },
    { number: '03', title: 'Explore Styles', desc: 'Choose your style' },
    { number: '04', title: 'Get Recommendations', desc: 'Receive suggestions' }
  ];

  const teamMembers = [
    { name: 'Caleb Ponce', role: 'Team Lead / System Architecture', emoji: '👨‍💼', color: '#4F46E5' },
    { name: 'Tyler Morris', role: 'Backend & AI Integration', emoji: '⚙️', color: '#10B981' },
    { name: 'Christopher Quach', role: 'Frontend Development', emoji: '🎨', color: '#F59E0B' },
    { name: 'Mason Lee', role: 'Data Modeling & Scoring Engine', emoji: '📊', color: '#EC4899' },
    { name: 'Dias Almat', role: 'Technical Writer', emoji: '📝', color: '#8B5CF6' }
  ];

  const testimonials = [
    { quote: "Home4U transformed my living room! The budget tracking feature saved me thousands.", author: "Sarah M.", role: "Homeowner" },
    { quote: "Finally, an app that makes interior design accessible. Love the style recommendations!", author: "James K.", role: "First-time Buyer" },
    { quote: "The resemblance scoring is incredible. My home now matches my vision perfectly.", author: "Emily R.", role: "Design Enthusiast" }
  ];

  const faqs = [
    { question: "Is Home4U free to use?", answer: "Yes! Home4U offers a free tier with all core features. Premium features coming soon." },
    { question: "How does the AI recommendation work?", answer: "Our AI analyzes your room type, budget, and style preferences to suggest products that match your vision." },
    { question: "Can I use Home4U on multiple devices?", answer: "Absolutely! Your projects sync across all your devices via your account." },
    { question: "How accurate is the style matching?", answer: "Our resemblance scoring algorithm provides 85%+ accuracy based on user feedback and testing." }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`about-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Animated Background */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

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
          <span className="hero-badge animate-fade-in">✨ Welcome to Home4U</span>
          <h2 className="hero-title animate-fade-in delay-1">
            Design Your <span>Dream Space</span>
          </h2>
          <p className="hero-description animate-fade-in delay-2">
            Your personal interior design assistant. Create room projects, set budgets, explore styles, and get smart recommendations.
          </p>
          <div className="hero-buttons animate-fade-in delay-3">
            <button onClick={() => navigate('/dashboard')} className="primary-btn">Get Started →</button>
            <button onClick={() => scrollToSection('features')} className="secondary-btn">Learn More</button>
          </div>
          <div className="hero-stats animate-fade-in delay-4">
            <div className="hero-stat"><span className="stat-number">6+</span><span className="stat-text">Room Types</span></div>
            <div className="hero-stat"><span className="stat-number">5+</span><span className="stat-text">Styles</span></div>
            <div className="hero-stat"><span className="stat-number">∞</span><span className="stat-text">Possibilities</span></div>
          </div>
        </div>
        
        <div className="hero-visual animate-slide-in">
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

      {/* App Preview Section */}
      <section className="app-preview-section">
        <div className="section-header">
          <h3>See It In Action</h3>
          <h2>Your Design Journey Starts Here</h2>
        </div>
        <div className="app-preview">
          <div className="preview-mockup">
            <div className="mockup-header">
              <span className="mockup-dot"></span>
              <span className="mockup-dot"></span>
              <span className="mockup-dot"></span>
            </div>
            <div className="mockup-content">
              <div className="mockup-sidebar">
                <div className="mockup-nav-item active">Dashboard</div>
                <div className="mockup-nav-item">Projects</div>
                <div className="mockup-nav-item">Styles</div>
              </div>
              <div className="mockup-main">
                <div className="mockup-card">
                  <span className="mockup-icon">🛏️</span>
                  <span>Bedroom</span>
                </div>
                <div className="mockup-card">
                  <span className="mockup-icon">🛋️</span>
                  <span>Living Room</span>
                </div>
                <div className="mockup-card">
                  <span className="mockup-icon">🍳</span>
                  <span>Kitchen</span>
                </div>
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
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h3>Testimonials</h3>
          <h2>What Users Say</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-quote">"{testimonial.quote}"</div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.author[0]}</div>
                <div>
                  <div className="author-name">{testimonial.author}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Counter Stats */}
      <section className="counter-section">
        <div className="counter-grid">
          <div className="counter-item">
            <span className="counter-number">{animatedCounters.users || 0}+</span>
            <span className="counter-label">Happy Users</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{animatedCounters.projects || 0}+</span>
            <span className="counter-label">Projects Created</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{animatedCounters.styles || 0}+</span>
            <span className="counter-label">Design Styles</span>
          </div>
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
            <div key={index} className="team-card" style={{ '--member-color': member.color }}>
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
            <p>Founded in February 2026, Home4U was born from a simple idea: everyone deserves to live in a space they love.</p>
            <div className="company-values">
              <div className="value-item">
                <span className="value-icon">🎯</span>
                <div><h4>Our Mission</h4><p>Make professional interior design accessible</p></div>
              </div>
              <div className="value-item">
                <span className="value-icon">💎</span>
                <div><h4>Our Values</h4><p>Innovation, Accessibility, Creativity</p></div>
              </div>
              <div className="value-item">
                <span className="value-icon">🌟</span>
                <div><h4>Our Vision</h4><p>Everyone lives in their dream home</p></div>
              </div>
            </div>
          </div>
          <div className="company-visual">
            <div className="company-badge">
              <span className="badge-year">2026</span>
              <span className="badge-text">Founded with ❤️</span>
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
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-header">
          <h3>FAQ</h3>
          <h2>Common Questions</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFaq === index ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-section">
        <div className="section-header">
          <h3>Contact Us</h3>
          <h2>Get In Touch</h2>
        </div>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={contactForm.name}
              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              required 
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              required 
            />
          </div>
          <textarea 
            placeholder="Your Message"
            value={contactForm.message}
            onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
            required
          ></textarea>
          <button type="submit" className="submit-btn" disabled={formStatus === 'sending'}>
            {formStatus === 'sending' ? 'Sending...' : formStatus === 'success' ? 'Sent!' : 'Send Message →'}
          </button>
        </form>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for design tips and product updates.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required 
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Start your interior design journey today.</p>
          <button onClick={() => navigate('/dashboard')} className="cta-btn">Go to Dashboard 🚀</button>
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


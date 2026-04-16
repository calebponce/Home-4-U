import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, DollarSign, Palette, Lightbulb, CheckSquare, Smartphone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './About.css';

const About = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatedCounters, setAnimatedCounters] = useState({});
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formNotice, setFormNotice] = useState('');
  const [newsletterNotice, setNewsletterNotice] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  
  const bgShapesRef = useRef(null);
  const memberModalRef = useRef(null);
  const memberModalCloseRef = useRef(null);
  const previousFocusedRef = useRef(null);

  const closeMemberModal = () => setSelectedMember(null);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const prevScene = document.body.dataset.scene;
    document.body.dataset.scene = 'about';

    setIsLoaded(true);
    animateCounters();
    
    let rafId = 0;
    const updateBg = () => {
      rafId = 0;
      if (!bgShapesRef.current) return;
      bgShapesRef.current.style.transform = `translateY(${(window.scrollY || 0) * 0.3}px)`;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateBg);
    };

    updateBg();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (document.body.dataset.scene === 'about') {
        if (prevScene) document.body.dataset.scene = prevScene;
        else delete document.body.dataset.scene;
      }
    };
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
      setFormNotice('Contact form submissions are unavailable in this preview environment.');
      setTimeout(() => setFormNotice(''), 3500);
    }, 1000);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setNewsletterNotice(`Newsletter signup for ${newsletterEmail} is unavailable in this preview environment.`);
    setTimeout(() => setNewsletterNotice(''), 3500);
    setNewsletterEmail('');
  };

  const features = [
    { icon: <Home size={28} />, title: 'Room Projects', desc: 'Create and manage projects for any room in your home.' },
    { icon: <DollarSign size={28} />, title: 'Budget Tracking', desc: 'Set and track your renovation budget with real-time updates.' },
    { icon: <Palette size={28} />, title: 'Style Exploration', desc: 'Discover various interior design styles for your space.' },
    { icon: <Lightbulb size={28} />, title: 'Smart Recommendations', desc: 'Get personalized product recommendations based on your style.' },
    { icon: <CheckSquare size={28} />, title: 'Task Management', desc: 'Track your renovation progress with built-in checklists.' },
    { icon: <Smartphone size={28} />, title: 'Anywhere Access', desc: 'Access your projects from any device, anytime.' }
  ];

  const steps = [
    { number: '01', title: 'Create Project', desc: 'Select your room type' },
    { number: '02', title: 'Set Budget', desc: 'Define spending limits' },
    { number: '03', title: 'Explore Styles', desc: 'Choose your style' },
    { number: '04', title: 'Get Recommendations', desc: 'Receive suggestions' }
  ];

  const teamMembers = [
    { 
      name: 'Caleb Ponce', 
      role: 'Team Lead / System Architecture', 
      emoji: 'CP', 
      color: 'var(--color-camel-400)',
      bio: 'Computer Science student at SFSU with a passion for building scalable web applications. Leads the technical direction and architecture of Home4U.',
      skills: ['System Design', 'React', 'Node.js', 'Cloud Architecture'],
      linkedin: 'https://linkedin.com/in/calebponce',
      github: 'https://github.com/calebponce'
    },
    { 
      name: 'Tyler Morris', 
      role: 'Backend Development', 
      emoji: 'TM', 
      color: 'var(--color-primary-slate)',
      bio: 'Computer Science student at SFSU focused on backend architecture, API design, and reliable platform services.',
      skills: ['Python', 'FastAPI', 'Machine Learning', 'Database Design'],
      linkedin: 'https://linkedin.com/in/tylermorris',
      github: 'https://github.com/tylerrendon'
    },
    { 
      name: 'Christopher Quach', 
      role: 'Frontend Development', 
      emoji: 'CQ', 
      color: 'var(--color-action-emerald)',
      bio: 'Frontend engineer focused on responsive interfaces, interaction quality, and accessible user experiences.',
      skills: ['React', 'CSS/SASS', 'UI/UX Design', 'Animation'],
      linkedin: 'https://linkedin.com/in/christopherquach',
      github: 'https://github.com/christopherquach'
    },
    { 
      name: 'Mason Lee', 
      role: 'Data Modeling & Scoring Engine', 
      emoji: 'ML', 
      color: 'var(--color-chocolate-700)',
      bio: 'Data-focused engineer building the resemblance scoring engine for accurate and meaningful style matching.',
      skills: ['Data Science', 'Python', 'Algorithms', 'Analytics'],
      linkedin: 'https://linkedin.com/in/masonlee',
      github: 'https://github.com/mlee82'
    },
    { 
      name: 'Dias Almat', 
      role: 'Database Administrator', 
      emoji: 'DA', 
      color: 'var(--color-text-300)',
      bio: 'Designs and maintains the database architecture. Ensures data integrity, manages migrations, and optimizes queries to keep the app fast and reliable.',
      skills: ['SQLAlchemy', 'PostgreSQL', 'SQLite', 'Database Design', 'Python'],
      linkedin: 'https://www.linkedin.com/in/dias-almat/',
      github: 'https://github.com/vincivv'
    }
  ];

  const testimonials = [
    { quote: "Home4U transformed my living room! The budget tracking feature saved me thousands.", author: "Sarah M.", role: "Homeowner" },
    { quote: "Finally, an app that makes interior design accessible. Love the style recommendations!", author: "James K.", role: "First-time Buyer" },
    { quote: "The resemblance scoring is incredible. My home now matches my vision perfectly.", author: "Emily R.", role: "Design Enthusiast" }
  ];

  const faqs = [
    { question: "Is Home4U free to use?", answer: "Home4U includes a free tier with core features, with expanded capabilities planned." },
    { question: "How does the AI recommendation work?", answer: "Our AI analyzes your room type, budget, and style preferences to suggest products that match your vision." },
    { question: "Can I use Home4U on multiple devices?", answer: "Yes. Your projects sync across devices through your account." },
    { question: "How accurate is the style matching?", answer: "Our resemblance scoring algorithm provides 85%+ accuracy based on user feedback and testing." }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  useEffect(() => {
    if (!selectedMember) return;

    previousFocusedRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusFirstInDialog = () => {
      const root = memberModalRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll(focusableSelector);
      const firstFocusable = focusables[0] || memberModalCloseRef.current || root;
      if (firstFocusable?.focus) firstFocusable.focus();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMemberModal();
        return;
      }
      if (event.key !== 'Tab') return;

      const root = memberModalRef.current;
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
    window.requestAnimationFrame(focusFirstInDialog);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow || '';
      const previous = previousFocusedRef.current;
      if (previous?.focus) previous.focus();
    };
  }, [selectedMember]);

  return (
    <div className={`about-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="bg-shapes" ref={bgShapesRef}>
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <header className="about-header">
        <div className="header-content">
          <button type="button" className="logo" onClick={() => navigate('/dashboard')} aria-label="Go to dashboard">
            <Home size={16} aria-hidden="true" /> Home4U Studio
          </button>
          <nav className="header-nav">
            {token ? (
              <>
                <button type="button" onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
                <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <button type="button" onClick={() => navigate('/login')} className="nav-link">Login</button>
            )}
          </nav>
        </div>
      </header>

      <motion.section 
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="hero-content">
          <motion.span variants={itemVariants} className="hero-badge">Redefining Your Space</motion.span>
          <motion.h2 variants={itemVariants} className="hero-title">
            Design Your <span>Editorial Vision</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="hero-description">
            The world's first spatial design assistant. Leverage AI to curate, plan, and execute high-end interior transformations with professional precision.
          </motion.p>
          <motion.div variants={itemVariants} className="hero-buttons">
            <button type="button" onClick={() => navigate('/dashboard')} className="primary-btn">Get Started <ArrowRight size={18} inline /></button>
            <button type="button" onClick={() => scrollToSection('features')} className="secondary-btn">The Blueprint</button>
          </motion.div>
          <motion.div variants={itemVariants} className="hero-stats">
            <div className="hero-stat"><span className="stat-number">6+</span><span className="stat-text">Spatial Archetypes</span></div>
            <div className="hero-stat"><span className="stat-number">5+</span><span className="stat-text">Artistic Styles</span></div>
            <div className="hero-stat"><span className="stat-number">∞</span><span className="stat-text">Configurations</span></div>
          </motion.div>
        </div>
        
        <motion.div 
          className="hero-visual"
          variants={{
            hidden: { opacity: 0, scale: 0.9, x: 50 },
            visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
          }}
        >
          <div className="hero-card" data-parallax-card>
            <div className="card-glow"></div>
            <div className="card-content">
              <div className="card-icon">ST</div>
              <div className="card-text">Scandinavian Loft</div>
              <div className="card-progress"><div className="progress-fill"></div></div>
              <div className="card-meta">
                <span>Invested: $12,400</span>
                <span>Spatial: Nordic</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section 
        className="app-preview-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-header">
          <h3>Interface</h3>
          <h2>High-fidelity Studio</h2>
          <p className="section-subtitle">A seamless workflow designed for professional precision.</p>
        </div>
        
        <div className="app-preview-wrapper">
          <div className="app-preview">
            <div className="preview-header">
              <div className="preview-url-bar">
                <span className="url-dot"></span>
                <span className="url-dot"></span>
                <span className="url-dot"></span>
                <span className="url-bar">home4u.app/dashboard</span>
              </div>
            </div>
            
            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="preview-logo">Home4U</div>
                <nav className="preview-nav">
                  <div className="nav-item active">
                    <span className="nav-icon">DB</span>
                    <span>Dashboard</span>
                  </div>
                  <div className="nav-item">
                    <span className="nav-icon">PR</span>
                    <span>Projects</span>
                  </div>
                  <div className="nav-item">
                    <span className="nav-icon">ST</span>
                    <span>Styles</span>
                  </div>
                  <div className="nav-item">
                    <span className="nav-icon">AI</span>
                    <span>Recommendations</span>
                  </div>
                </nav>
              </div>
              
              <div className="preview-main">
                <div className="preview-header-bar">
                  <h3>My Dashboard</h3>
                  <div className="preview-user">User: John D.</div>
                </div>
                
                <div className="preview-cards">
                  <div className="preview-card">
                    <span className="card-emoji">BR</span>
                    <span className="card-name">Bedroom</span>
                    <span className="card-budget">$3,500</span>
                    <div className="card-progress-bar"><div className="progress" style={{width: '65%'}}></div></div>
                  </div>
                  <div className="preview-card">
                    <span className="card-emoji">LR</span>
                    <span className="card-name">Living Room</span>
                    <span className="card-budget">$5,000</span>
                    <div className="card-progress-bar"><div className="progress" style={{width: '40%'}}></div></div>
                  </div>
                  <div className="preview-card">
                    <span className="card-emoji">KT</span>
                    <span className="card-name">Kitchen</span>
                    <span className="card-budget">$8,000</span>
                    <div className="card-progress-bar"><div className="progress" style={{width: '80%'}}></div></div>
                  </div>
                </div>
                
                <div className="preview-recommendations">
                  <h4>Intelligence Feed</h4>
                  <div className="rec-items">
                    <div className="rec-item">
                      <span className="rec-img">CH</span>
                      <span className="rec-name">Vitra Chair</span>
                      <span className="rec-price">$1,299</span>
                    </div>
                    <div className="rec-item">
                      <span className="rec-img">LP</span>
                      <span className="rec-name">Arco Lamp</span>
                      <span className="rec-price">$2,149</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        id="features" 
        className="features-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="section-header">
          <h3>Capabilites</h3>
          <h2>Professional Suite</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="feature-card"
            >
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className="testimonials-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="section-header">
          <h3>Testimonials</h3>
          <h2>Professional Review</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="testimonial-card"
            >
              <div className="testimonial-quote">"{testimonial.quote}"</div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.author[0]}</div>
                <div>
                  <div className="author-name">{testimonial.author}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="counter-section">
        <div className="counter-grid">
          <div className="counter-item scroll-animate">
            <span className="counter-number">{animatedCounters.users || 0}+</span>
            <span className="counter-label">Happy Users</span>
          </div>
          <div className="counter-item scroll-animate" style={{ transitionDelay: '0.15s' }}>
            <span className="counter-number">{animatedCounters.projects || 0}+</span>
            <span className="counter-label">Projects Created</span>
          </div>
          <div className="counter-item scroll-animate" style={{ transitionDelay: '0.3s' }}>
            <span className="counter-number">{animatedCounters.styles || 0}+</span>
            <span className="counter-label">Design Styles</span>
          </div>
        </div>
      </section>

      <motion.section 
        className="team-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="section-header">
          <h3>The Curators</h3>
          <h2>Engineering Excellence</h2>
        </div>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <motion.button
              type="button"
              whileHover={{ y: -10, scale: 1.02 }}
              variants={itemVariants}
              key={index} 
              className="team-card"
              style={{ '--member-color': member.color }}
              onClick={() => setSelectedMember(member)}
              aria-haspopup="dialog"
            >
              <div className="team-avatar">{member.emoji}</div>
              <h4>{member.name}</h4>
              <span className="team-role">{member.role}</span>
              <span className="team-cta">Learn More →</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Team Member Modal */}
      {selectedMember && (
        <div className="member-modal-overlay" role="presentation" onClick={closeMemberModal}>
          <div
            ref={memberModalRef}
            className="member-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
            aria-describedby="member-modal-description"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" ref={memberModalCloseRef} className="modal-close" onClick={closeMemberModal} aria-label="Close profile dialog">×</button>
            <div className="modal-header">
              <div className="modal-avatar" style={{ background: selectedMember.color }}>
                {selectedMember.emoji}
              </div>
              <h2 id="member-modal-title">{selectedMember.name}</h2>
              <p className="modal-role">{selectedMember.role}</p>
            </div>
            <div className="modal-body">
              <p className="modal-bio" id="member-modal-description">{selectedMember.bio}</p>
              <div className="modal-skills">
                <h4>Skills</h4>
                <div className="skills-list">
                  {selectedMember.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="modal-links">
                <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  LinkedIn
                </a>
                <a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="social-link github">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.section 
        className="company-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="company-content">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" className="company-text">
            <motion.h3 variants={itemVariants}>Company</motion.h3>
            <motion.h2 variants={itemVariants}>Home4U Studio</motion.h2>
            <motion.p variants={itemVariants}>Founded in February 2026, Home4U was born from a simple idea: professional-grade interior design should be an effortless extension of the creative mind.</motion.p>
            <div className="company-values">
              <motion.div variants={itemVariants} className="value-item">
                <span className="value-icon">01</span>
                <div><h4>The Mission</h4><p>Democratize professional spatial excellence.</p></div>
              </motion.div>
              <motion.div variants={itemVariants} className="value-item">
                <span className="value-icon">02</span>
                <div><h4>The Values</h4><p>Precision, Aesthetics, Innovation.</p></div>
              </motion.div>
            </div>
          </motion.div>
          <motion.div 
            className="company-visual"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="company-badge">
              <span className="badge-year">2026</span>
              <span className="badge-text">Est. SF Studio</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="how-it-works-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="section-header">
          <h3>Methodology</h3>
          <h2>Operational Workflow</h2>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="step-card"
            >
              <span className="step-number">{step.number}</span>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className="faq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="section-header">
          <h3>FAQ</h3>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className={`faq-item ${openFaq === index ? 'open' : ''}`}
            >
              <button
                type="button"
                className="faq-question"
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="faq-answer"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="contact-section">
        <div className="section-header">
          <h3>Contact Us</h3>
          <h2>Get In Touch</h2>
        </div>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          {formNotice && <div className="form-notice">{formNotice}</div>}
          <div className="form-row">
            <label className="sr-only" htmlFor="contact-name">Your Name</label>
            <input 
              id="contact-name"
              type="text" 
              placeholder="Your Name" 
              value={contactForm.name}
              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              required 
            />
            <label className="sr-only" htmlFor="contact-email">Your Email</label>
            <input 
              id="contact-email"
              type="email" 
              placeholder="Your Email" 
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              required 
            />
          </div>
          <label className="sr-only" htmlFor="contact-message">Your Message</label>
          <textarea 
            id="contact-message"
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

      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for design tips and product updates.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <label className="sr-only" htmlFor="newsletter-email">Email Address</label>
            <input 
              id="newsletter-email"
              type="email" 
              placeholder="Enter your email" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required 
            />
            <button type="submit">Subscribe</button>
          </form>
          {newsletterNotice && <div className="form-notice">{newsletterNotice}</div>}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Start your interior design journey today.</p>
          <button type="button" onClick={() => navigate('/dashboard')} className="cta-btn">Go to Dashboard</button>
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
              <button type="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
              {token ? (
                <button type="button" onClick={handleLogout}>Logout</button>
              ) : (
                <button type="button" onClick={() => navigate('/login')}>Login</button>
              )}
            </div>
            <div className="footer-column">
              <h4>About</h4>
              <p>Version 1.0.0</p>
              <p>Built by the Home4U team</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Home4U. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;

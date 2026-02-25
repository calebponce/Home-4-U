import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, stylesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Room data for the interactive house tour
const tourRooms = [
  {
    id: 1,
    name: 'Design Studio',
    emoji: '🎨',
    description: 'Our expert designers craft personalized interior concepts tailored to your vision.',
    services: ['Custom Design Concepts', 'Color Palettes', '3D Visualizations', 'Style Consulting'],
    color: '#FF6B6B'
  },
  {
    id: 2,
    name: 'Budget Room',
    emoji: '💰',
    description: 'Smart budgeting tools help you maximize your renovation budget without compromising quality.',
    services: ['Cost Estimation', 'Vendor Discounts', 'DIY Guides', 'Expense Tracking'],
    color: '#4ECDC4'
  },
  {
    id: 3,
    name: 'Furniture Gallery',
    emoji: '🛋️',
    description: 'Curated furniture collections from top brands at competitive prices.',
    services: ['Furniture Sourcing', 'Custom Orders', 'Delivery & Setup', 'Quality Guarantee'],
    color: '#45B7D1'
  },
  {
    id: 4,
    name: 'Moodboard Lab',
    emoji: '✨',
    description: 'Create beautiful moodboards to visualize your dream space before committing.',
    services: ['Drag & Drop Interface', 'Image Library', 'Shareable Boards', 'Export Options'],
    color: '#96CEB4'
  },
  {
    id: 5,
    name: 'Project Hub',
    emoji: '📋',
    description: 'Manage all your renovation projects in one place with progress tracking.',
    services: ['Project Tracking', 'Task Lists', 'Timeline Views', 'Collaboration Tools'],
    color: '#FFEAA7'
  }
];

// Style previews for hover cards
const stylePreviews = {
  1: {
    images: ['🛋️', '🪑', '💡', '🖼️'],
    features: ['Minimal Furniture', 'Neutral Colors', 'Natural Light', 'Clean Lines']
  },
  2: {
    images: ['🏛️', '🕰️', '🪞', '🕯️'],
    features: ['Classic Details', 'Rich Colors', 'Elegant Fabrics', 'Antique Accents']
  },
  3: {
    images: ['🌿', '🪴', '☀️', '🌾'],
    features: ['Organic Materials', 'Earthy Tones', 'Indoor Plants', 'Rustic Textures']
  },
  4: {
    images: ['💎', '✨', '🌙', '🔮'],
    features: ['Bold Colors', 'Metallic Accents', 'Velvet Fabrics', 'Glam Lighting']
  },
  5: {
    images: ['🎭', '🎪', '🎨', '🪜'],
    features: ['Eclectic Mix', 'Vintage Finds', 'Art Displays', 'Playful Spaces']
  }
};

// Default styles with rich visuals
const defaultStyles = [
  { 
    id: 1, 
    name: 'Modern', 
    description: 'Clean lines, minimal clutter, and functional design with neutral colors',
    emoji: '🏢',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    previewEmojis: ['🛋️', '📐', '💡', '🪟'],
    previewFeatures: ['Clean Lines', 'Neutral Palette', 'Statement Lighting', 'Open Spaces']
  },
  { 
    id: 2, 
    name: 'Traditional', 
    description: 'Classic elegance with rich colors, ornate details, and quality craftsmanship',
    emoji: '🏛️',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    previewEmojis: ['🕰️', '🪞', '🕯️', '🏺'],
    previewFeatures: ['Rich Fabrics', 'Antique Details', 'Crown Molding', 'Classic Furniture']
  },
  { 
    id: 3, 
    name: 'Scandinavian', 
    description: 'Cozy minimalism with natural materials, light colors, and hygge atmosphere',
    emoji: '🌲',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    previewEmojis: ['🌿', '🪵', '🧸', '🕯️'],
    previewFeatures: ['Natural Wood', 'Indoor Plants', 'Cozy Textiles', 'Warm Lighting']
  },
  { 
    id: 4, 
    name: 'Industrial', 
    description: 'Raw materials, exposed elements, and urban-inspired aesthetics',
    emoji: '🏭',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    previewEmojis: ['⚙️', '🧱', '💡', '🪜'],
    previewFeatures: ['Exposed Brick', 'Metal Accents', ' Edison Bulbs', 'Open Ductwork']
  },
  { 
    id: 5, 
    name: 'Bohemian', 
    description: 'Eclectic, colorful, and free-spirited with layered textures and patterns',
    emoji: '🌸',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    previewEmojis: ['🌺', '💐', '🎭', '🪭'],
    previewFeatures: ['Layered Rugs', 'Vintage Finds', 'Art Displays', 'Pattern Mix']
  },
  { 
    id: 6, 
    name: 'Mid-Century', 
    description: 'Retro sophistication with bold colors, organic shapes, and timeless appeal',
    emoji: '🪚',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    previewEmojis: ['🪑', '📺', '🪵', '🌵'],
    previewFeatures: ['Tapered Legs', 'Bold Colors', 'Organic Curves', 'Retro Appliances']
  },
  { 
    id: 7, 
    name: 'Mediterranean', 
    description: 'Warm, inviting spaces with terracotta, wrought iron, and rustic textures',
    emoji: '🏺',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    previewEmojis: ['🌞', '🍋', '🏺', '🪴'],
    previewFeatures: ['Terracotta', 'Arched Doorways', 'Wrought Iron', 'Clay Tiles']
  },
  { 
    id: 8, 
    name: 'Japanese', 
    description: 'Serene simplicity with natural materials, clean spaces, and zen harmony',
    emoji: '⛩️',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    previewEmojis: ['🗿', '🎋', '🧘', '🍵'],
    previewFeatures: ['Shoji Screens', 'Floor Cushions', 'Zen Garden', 'Minimal Decor']
  }
];

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectType, setNewProjectType] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // House tour state
  const [tourMode, setTourMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const parallaxRef = useRef(null);

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  const fetchData = async () => {
    try {
      const [projectsRes, stylesRes] = await Promise.all([
        projectsAPI.getAll(),
        stylesAPI.getAll()
      ]);
      setProjects(projectsRes.data);
      // Use API styles or fall back to default styles
      setStyles(stylesRes.data && stylesRes.data.length > 0 ? stylesRes.data : defaultStyles);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Fall back to default styles on error
      setStyles(defaultStyles);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(newProjectType);
      setNewProjectType('');
      setShowNewProject(false);
      fetchData();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // House tour handlers
  const startTour = () => {
    setIsZooming(true);
    setTimeout(() => {
      setTourMode(true);
      setIsZooming(false);
    }, 800);
  };

  const exitTour = () => {
    setIsZooming(true);
    setTimeout(() => {
      setTourMode(false);
      setCurrentRoom(0);
      setIsZooming(false);
    }, 800);
  };

  const nextRoom = () => {
    setIsZooming(true);
    setTimeout(() => {
      setCurrentRoom((prev) => (prev + 1) % tourRooms.length);
      setIsZooming(false);
    }, 400);
  };

  const prevRoom = () => {
    setIsZooming(true);
    setTimeout(() => {
      setCurrentRoom((prev) => (prev - 1 + tourRooms.length) % tourRooms.length);
      setIsZooming(false);
    }, 400);
  };

  const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {/* Interactive House Tour Modal */}
      {(tourMode || isZooming) && (
        <div className={`house-tour-overlay ${tourMode ? 'active' : ''}`}>
          <div className={`tour-content ${isZooming ? 'zooming' : ''}`}>
            <button className="tour-exit-btn" onClick={exitTour}>
              ✕ Exit Tour
            </button>
            
            <div className="tour-room">
              <div 
                className="room-emoji" 
                style={{ background: `linear-gradient(135deg, ${tourRooms[currentRoom].color}40, ${tourRooms[currentRoom].color}20)` }}
              >
                {tourRooms[currentRoom].emoji}
              </div>
              
              <h2 className="room-name">{tourRooms[currentRoom].name}</h2>
              <p className="room-description">{tourRooms[currentRoom].description}</p>
              
              <div className="room-services">
                {tourRooms[currentRoom].services.map((service, idx) => (
                  <span 
                    key={idx} 
                    className="service-tag"
                    style={{ 
                      borderColor: tourRooms[currentRoom].color,
                      color: tourRooms[currentRoom].color
                    }}
                  >
                    {service}
                  </span>
                ))}
              </div>
              
              <div className="room-navigation">
                <button className="nav-arrow prev" onClick={prevRoom}>
                  ←
                </button>
                <div className="room-dots">
                  {tourRooms.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`dot ${idx === currentRoom ? 'active' : ''}`}
                      style={{ background: idx === currentRoom ? tourRooms[currentRoom].color : '' }}
                    />
                  ))}
                </div>
                <button className="nav-arrow next" onClick={nextRoom}>
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-left">
          <h1>My Dashboard</h1>
          <button onClick={() => navigate('/about')} className="about-btn">About</button>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {/* Parallax Hero Section */}
      <section className="parallax-hero" ref={parallaxRef}>
        <div 
          className="parallax-bg"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div 
          className="parallax-content"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <h1 className="hero-title">
            Welcome to <span className="brand-name">Home4U</span>
          </h1>
          <p className="hero-subtitle">
            Your dream home starts here
          </p>
          <div className="hero-cta">
            <button className="cta-primary" onClick={() => document.getElementById('what-we-do').scrollIntoView({ behavior: 'smooth' })}>
              Discover More
            </button>
            <button className="cta-secondary" onClick={() => setShowNewProject(true)}>
              Start a Project
            </button>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="mouse-icon">
            <div className="wheel"></div>
          </div>
        </div>
      </section>

      {/* What We Do - Introduction Section */}
      <section className="what-we-do-section" id="what-we-do">
        <div className="section-intro">
          <h2>What We Do</h2>
          <p>Transform your space with our comprehensive interior design services</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card" style={{ '--delay': '0s' }}>
            <div className="service-icon">🎨</div>
            <h3>Design Consultation</h3>
            <p>Expert advice to help you discover your perfect style and create a cohesive vision for your space.</p>
          </div>
          
          <div className="service-card" style={{ '--delay': '0.1s' }}>
            <div className="service-icon">💰</div>
            <h3>Budget Planning</h3>
            <p>Smart budgeting tools and vendor connections to maximize your renovation budget without compromising quality.</p>
          </div>
          
          <div className="service-card" style={{ '--delay': '0.2s' }}>
            <div className="service-icon">🛋️</div>
            <h3>Furniture Curation</h3>
            <p>Access to curated collections from top brands, with custom orders and professional delivery setup.</p>
          </div>
          
          <div className="service-card" style={{ '--delay': '0.3s' }}>
            <div className="service-icon">✨</div>
            <h3>Moodboard Creation</h3>
            <p>Visualize your dream space with interactive moodboards before committing to any changes.</p>
          </div>
          
          <div className="service-card" style={{ '--delay': '0.4s' }}>
            <div className="service-icon">📋</div>
            <h3>Project Management</h3>
            <p>Track progress, manage tasks, and collaborate with our team all in one organized hub.</p>
          </div>
          
          <div className="service-card" style={{ '--delay': '0.5s' }}>
            <div className="service-icon">🏠</div>
            <h3>Room Visualization</h3>
            <p>3D visualizations and virtual tours to see your new space before it's built.</p>
          </div>
        </div>
      </section>

      {/* Explore Design Styles with Hover Preview Cards */}
      <section className="styles-section">
        <div className="section-intro">
          <h2>Explore Design Styles</h2>
          <p>Hover over each style to preview what's possible</p>
        </div>
        
        <div className="styles-showcase">
          {styles.map((style, index) => (
            <div 
              key={style.id} 
              className="style-preview-card"
              style={{ '--index': index }}
            >
              <div 
                className="style-card-main"
                style={{ background: style.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <div className="style-icon-wrapper">
                  <span className="style-emoji">{style.emoji || '🏠'}</span>
                </div>
                <h3>{style.name}</h3>
                <p>{style.description || 'Modern interior style'}</p>
                <div className="style-glow"></div>
                
                {/* Key Elements - Shows on Hover */}
                <div className="style-key-elements">
                  <h4>Key Elements</h4>
                  <div className="key-elements-grid">
                    {(style.previewEmojis || ['🛋️', '💡', '🪟', '🪴']).map((emoji, i) => (
                      <div key={i} className="key-element">
                        <span className="key-emoji">{emoji}</span>
                        <span>{(style.previewFeatures || ['Element 1', 'Element 2', 'Element 3', 'Element 4'])[i]}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="explore-btn"
                    onClick={() => navigate(`/project/${style.id}`)}
                  >
                    Explore Style →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="section-header">
          <h2>My Room Projects</h2>
          <button 
            onClick={() => setShowNewProject(!showNewProject)}
            className="new-project-btn"
          >
            + New Project
          </button>
        </div>

        {showNewProject && (
          <form onSubmit={handleCreateProject} className="new-project-form">
            <select
              value={newProjectType}
              onChange={(e) => setNewProjectType(e.target.value)}
              required
            >
              <option value="">Select room type</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowNewProject(false)}>Cancel</button>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first room project!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.room_type}</h3>
                <p>Budget: ${project.budget || 0}</p>
                <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                <div className="project-actions">
                  <button onClick={() => navigate(`/project/${project.id}`)}>
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* House Tour Section - Now at the bottom */}
      <section className="house-tour-section">
        <div className="section-intro">
          <h2>Take a Virtual Tour</h2>
          <p>Explore our services in an interactive house tour</p>
        </div>
        
        <div className="tour-cta-container">
          <button className="tour-start-btn" onClick={startTour}>
            <span className="tour-emoji">🏠</span>
            <span className="tour-text">Start Virtual Tour</span>
            <span className="tour-rooms">{tourRooms.length} Rooms</span>
          </button>
          <div className="tour-preview-mini">
            {tourRooms.map((room, idx) => (
              <span 
                key={idx} 
                className="mini-room-dot"
                style={{ background: room.color }}
                title={room.name}
              >
                {room.emoji}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2024 Home4U - Your Dream Home Starts Here</p>
      </footer>
    </div>
  );
};

export default Dashboard;


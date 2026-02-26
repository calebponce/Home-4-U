import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, stylesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

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
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  
  // House tour state
  const [tourMode, setTourMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isEnteringTour, setIsEnteringTour] = useState(false);
  const [roomTransitioning, setRoomTransitioning] = useState(false);
  const [roomDirection, setRoomDirection] = useState('next');
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const parallaxRef = useRef(null);

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    
    // Trigger hero animation after component mounts
    setTimeout(() => setHeroLoaded(true), 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const root = parallaxRef.current;
    if (!root) return;

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    const onLeave = () => setMouseOffset({ x: 0, y: 0 });

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    return () => {
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [projects, styles, showNewProject]);

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
    if (isEnteringTour) return;
    setCurrentRoom(0);
    setIsEnteringTour(true);
    setTimeout(() => {
      setTourMode(true);
      setIsEnteringTour(false);
    }, 700);
  };

  const exitTour = () => {
    setIsEnteringTour(true);
    setTimeout(() => {
      setTourMode(false);
      setCurrentRoom(0);
      setRoomTransitioning(false);
      setIsEnteringTour(false);
    }, 450);
  };

  const transitionRoom = (direction) => {
    if (roomTransitioning) return;
    setRoomDirection(direction);
    setRoomTransitioning(true);
    setTimeout(() => {
      setCurrentRoom((prev) =>
        direction === 'next'
          ? (prev + 1) % tourRooms.length
          : (prev - 1 + tourRooms.length) % tourRooms.length
      );
    }, 190);
    setTimeout(() => {
      setRoomTransitioning(false);
    }, 430);
  };

  const nextRoom = () => transitionRoom('next');

  const prevRoom = () => {
    transitionRoom('prev');
  };

  const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {/* Interactive House Tour Modal */}
      {(tourMode || isEnteringTour) && (
        <div className={`house-tour-overlay ${tourMode ? 'active' : ''}`}>
          <div className={`tour-content ${isEnteringTour ? 'zooming' : ''}`}>
            <button className="tour-exit-btn" onClick={exitTour}>
              ✕ Exit Tour
            </button>
            
            <div className={`tour-room ${roomTransitioning ? `room-fading room-${roomDirection}` : ''}`}>
              <div className="room-progress">
                Room {currentRoom + 1} of {tourRooms.length}
              </div>
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
        <div className="parallax-grid-layer" />
        <div 
          className="parallax-bg"
          style={{ 
            transform: `translateY(${scrollY * 0.5}px) translateX(${mouseOffset.x * 8}px)`,
            opacity: 1 - scrollY / 700
          }}
        />
        {/* Additional parallax floating elements */}
        <div 
          className="parallax-float parallax-float-1"
          style={{ 
            transform: `translateY(${scrollY * -0.2 + mouseOffset.y * 18}px) translateX(${scrollY * 0.1 + mouseOffset.x * 24}px)`,
            opacity: Math.max(0, 1 - scrollY / 600)
          }}
        />
        <div 
          className="parallax-float parallax-float-2"
          style={{ 
            transform: `translateY(${scrollY * -0.3 + mouseOffset.y * -14}px) translateX(${scrollY * -0.15 + mouseOffset.x * -28}px)`,
            opacity: Math.max(0, 1 - scrollY / 800)
          }}
        />
        <div 
          className="parallax-float parallax-float-3"
          style={{ 
            transform: `translateY(${scrollY * -0.15 + mouseOffset.y * 22}px) translateX(${scrollY * 0.05 + mouseOffset.x * 16}px)`,
            opacity: Math.max(0, 1 - scrollY / 500)
          }}
        />
        <div 
          className={`parallax-content ${heroLoaded ? 'loaded' : ''}`}
          style={{ 
            transform: `translateY(${scrollY * 0.25 + mouseOffset.y * -8}px) translateX(${mouseOffset.x * -6}px)`,
            opacity: Math.max(0, 1 - scrollY / 500)
          }}
        >
          <h1 className={`hero-title ${heroLoaded ? 'fade-in' : ''}`}>
            <span className="title-line">Welcome to</span>
            <span className="brand-name brand-animate" data-text="Home4U">Home4U</span>
          </h1>
          <p className={`hero-subtitle ${heroLoaded ? 'fade-in' : ''}`}>
            Your dream home starts here
          </p>
          <div className={`hero-cta ${heroLoaded ? 'fade-in' : ''}`}>
            <button className="cta-primary" onClick={() => document.getElementById('what-we-do').scrollIntoView({ behavior: 'smooth' })}>
              Discover More
            </button>
            <button className="cta-secondary" onClick={() => setShowNewProject(true)}>
              Start a Project
            </button>
          </div>
        </div>
        <div 
          className="scroll-indicator"
          style={{ opacity: Math.max(0, 1 - scrollY / 300) }}
        >
          <span>Scroll to explore</span>
          <div className="mouse-icon">
            <div className="wheel"></div>
          </div>
        </div>
      </section>

      {/* What We Do - Introduction Section */}
      <section className="what-we-do-section reveal-on-scroll" id="what-we-do">
        <div className="section-intro">
          <h2>What We Do</h2>
          <p>Transform your space with our comprehensive interior design services</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card reveal-on-scroll" style={{ '--delay': '0s' }}>
            <div className="service-icon">🎨</div>
            <h3>Design Consultation</h3>
            <p>Expert advice to help you discover your perfect style and create a cohesive vision for your space.</p>
          </div>
          
          <div className="service-card reveal-on-scroll" style={{ '--delay': '0.1s' }}>
            <div className="service-icon">💰</div>
            <h3>Budget Planning</h3>
            <p>Smart budgeting tools and vendor connections to maximize your renovation budget without compromising quality.</p>
          </div>
          
          <div className="service-card reveal-on-scroll" style={{ '--delay': '0.2s' }}>
            <div className="service-icon">🛋️</div>
            <h3>Furniture Curation</h3>
            <p>Access to curated collections from top brands, with custom orders and professional delivery setup.</p>
          </div>
          
          <div className="service-card reveal-on-scroll" style={{ '--delay': '0.3s' }}>
            <div className="service-icon">✨</div>
            <h3>Moodboard Creation</h3>
            <p>Visualize your dream space with interactive moodboards before committing to any changes.</p>
          </div>
          
          <div className="service-card reveal-on-scroll" style={{ '--delay': '0.4s' }}>
            <div className="service-icon">📋</div>
            <h3>Project Management</h3>
            <p>Track progress, manage tasks, and collaborate with our team all in one organized hub.</p>
          </div>
          
          <div className="service-card reveal-on-scroll" style={{ '--delay': '0.5s' }}>
            <div className="service-icon">🏠</div>
            <h3>Room Visualization</h3>
            <p>3D visualizations and virtual tours to see your new space before it's built.</p>
          </div>
        </div>
      </section>

      {/* Explore Design Styles with Hover Preview Cards */}
      <section className="styles-section reveal-on-scroll">
        <div className="section-intro">
          <h2>Explore Design Styles</h2>
          <p>Hover over each style to preview what's possible</p>
        </div>
        
        <div className="styles-showcase">
          {styles.map((style, index) => (
            <div 
              key={style.id} 
              className="style-preview-card reveal-on-scroll"
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
      <section className="projects-section reveal-on-scroll">
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
              <div key={project.id} className="project-card reveal-on-scroll">
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
      <section className="house-tour-section reveal-on-scroll">
        <div className="section-intro">
          <h2>Take a Virtual Tour</h2>
          <p>Click the house to enter. Explore one room at a time to see what we do.</p>
        </div>
        
        <div className="tour-cta-container">
          <button className={`house-entry ${isEnteringTour ? 'entering' : ''}`} onClick={startTour}>
            <span className="house-roof" />
            <span className="house-body">
              <span className="house-window window-left" />
              <span className="house-window window-right" />
              <span className="house-door" />
            </span>
            <span className="house-hint">Enter the House</span>
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
        <p>© 2026 Home4U - Your Dream Home Starts Here</p>
      </footer>
    </div>
  );
};

export default Dashboard;

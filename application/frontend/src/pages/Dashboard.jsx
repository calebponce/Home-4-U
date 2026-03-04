import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI, stylesAPI, searchAPI } from '../services/api';
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
    color: '#FF6B6B',
    motifs: ['🧩', '📐', '🖌️', '🧠']
  },
  {
    id: 2,
    name: 'Budget Room',
    emoji: '💰',
    description: 'Smart budgeting tools help you maximize your renovation budget without compromising quality.',
    services: ['Cost Estimation', 'Vendor Discounts', 'DIY Guides', 'Expense Tracking'],
    color: '#4ECDC4',
    motifs: ['📊', '💳', '🧾', '🪙']
  },
  {
    id: 3,
    name: 'Furniture Gallery',
    emoji: '🛋️',
    description: 'Curated furniture collections from top brands at competitive prices.',
    services: ['Furniture Sourcing', 'Custom Orders', 'Delivery & Setup', 'Quality Guarantee'],
    color: '#45B7D1',
    motifs: ['🪑', '🛏️', '💡', '🪴']
  },
  {
    id: 4,
    name: 'Moodboard Lab',
    emoji: '✨',
    description: 'Create beautiful moodboards to visualize your dream space before committing.',
    services: ['Drag & Drop Interface', 'Image Library', 'Shareable Boards', 'Export Options'],
    color: '#96CEB4',
    motifs: ['🖼️', '🎞️', '📌', '🪄']
  },
  {
    id: 5,
    name: 'Project Hub',
    emoji: '📋',
    description: 'Manage all your renovation projects in one place with progress tracking.',
    services: ['Project Tracking', 'Task Lists', 'Timeline Views', 'Collaboration Tools'],
    color: '#FFEAA7',
    motifs: ['📅', '✅', '📎', '🧭']
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
    emoji: '🪟',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    previewEmojis: ['🛋️', '📐', '💡', '🪟'],
    previewFeatures: ['Clean Lines', 'Neutral Palette', 'Statement Lighting', 'Open Spaces']
  },
  { 
    id: 2, 
    name: 'Traditional', 
    description: 'Classic elegance with rich colors, ornate details, and quality craftsmanship',
    emoji: '🕰️',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    previewEmojis: ['🕰️', '🪞', '🕯️', '🏺'],
    previewFeatures: ['Rich Fabrics', 'Antique Details', 'Crown Molding', 'Classic Furniture']
  },
  { 
    id: 3, 
    name: 'Scandinavian', 
    description: 'Cozy minimalism with natural materials, light colors, and hygge atmosphere',
    emoji: '🪵',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    previewEmojis: ['🌿', '🪵', '🧸', '🕯️'],
    previewFeatures: ['Natural Wood', 'Indoor Plants', 'Cozy Textiles', 'Warm Lighting']
  },
  { 
    id: 4, 
    name: 'Industrial', 
    description: 'Raw materials, exposed elements, and urban-inspired aesthetics',
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    previewEmojis: ['⚙️', '🧱', '💡', '🪜'],
    previewFeatures: ['Exposed Brick', 'Metal Accents', ' Edison Bulbs', 'Open Ductwork']
  },
  { 
    id: 5, 
    name: 'Bohemian', 
    description: 'Eclectic, colorful, and free-spirited with layered textures and patterns',
    emoji: '🧶',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    previewEmojis: ['🌺', '💐', '🎭', '🪭'],
    previewFeatures: ['Layered Rugs', 'Vintage Finds', 'Art Displays', 'Pattern Mix']
  },
  { 
    id: 6, 
    name: 'Mid-Century', 
    description: 'Retro sophistication with bold colors, organic shapes, and timeless appeal',
    emoji: '🛋️',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    previewEmojis: ['🪑', '📺', '🪵', '🌵'],
    previewFeatures: ['Tapered Legs', 'Bold Colors', 'Organic Curves', 'Retro Appliances']
  },
  { 
    id: 7, 
    name: 'Mediterranean', 
    description: 'Warm, inviting spaces with terracotta, wrought iron, and rustic textures',
    emoji: '🍋',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    previewEmojis: ['🌞', '🍋', '🏺', '🪴'],
    previewFeatures: ['Terracotta', 'Arched Doorways', 'Wrought Iron', 'Clay Tiles']
  },
  { 
    id: 8, 
    name: 'Japanese', 
    description: 'Serene simplicity with natural materials, clean spaces, and zen harmony',
    emoji: '🎍',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    previewEmojis: ['🗿', '🎋', '🧘', '🍵'],
    previewFeatures: ['Shoji Screens', 'Floor Cushions', 'Zen Garden', 'Minimal Decor']
  }
];

const styleEmojiMap = {
  Modern: '🪟',
  Traditional: '🏛️',
  Scandinavian: '🪵',
  Industrial: '⚒️',
  Bohemian: '🧿',
  'Mid-Century': '📺',
  Mediterranean: '🫒',
  Japanese: '🎎',
};

const styleEmojiFallback = ['🪟', '🏛️', '🪵', '⚒️', '🧿', '📺', '🫒', '🎎', '🪴', '🧭'];

const resolveStyleEmoji = (style, index) => {
  const key = (style?.name || '').trim();
  if (styleEmojiMap[key]) return styleEmojiMap[key];
  if (style?.emoji) return style.emoji;
  return styleEmojiFallback[index % styleEmojiFallback.length];
};

const mergeStylesWithDefaults = (incoming = []) => {
  const merged = new Map();
  defaultStyles.forEach((s) => merged.set((s.name || '').toLowerCase(), s));
  incoming.forEach((s) => {
    const key = (s.name || '').toLowerCase();
    const base = merged.get(key) || {};
    merged.set(key, { ...base, ...s });
  });
  return Array.from(merged.values());
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [newProjectType, setNewProjectType] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState({ total: 0, page: 1, hasMore: false });
  const [searchError, setSearchError] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [initStyle, setInitStyle] = useState(null);
  const [initLoading, setInitLoading] = useState(false);
  const [selectedStyleDrawer, setSelectedStyleDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef(null);
  const drawerFirstFocusRef = useRef(null);
  const [drawerStages, setDrawerStages] = useState({ preview: false, compat: false, dna: false });
  const [hoveredTrait, setHoveredTrait] = useState('');
  
  // House tour state
  const [tourMode, setTourMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isEnteringTour, setIsEnteringTour] = useState(false);
  const [roomTransitioning, setRoomTransitioning] = useState(false);
  const [roomDirection, setRoomDirection] = useState('next');
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const parallaxRef = useRef(null);
  const initPanelRef = useRef(null);
  function styleSlug(name) {
    return (name || '').toLowerCase().replace(/\s+/g, '-');
  }

  function openDrawer(style, triggerEl) {
    setSelectedStyleDrawer(style);
    setIsDrawerOpen(true);
    drawerTriggerRef.current = triggerEl || document.activeElement;
    setDrawerStages({ preview: false, compat: false, dna: false });
    setTimeout(() => setDrawerStages((s) => ({ ...s, preview: true })), 150);
    setTimeout(() => setDrawerStages((s) => ({ ...s, compat: true })), 350);
    setTimeout(() => setDrawerStages((s) => ({ ...s, dna: true })), 500);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setSelectedStyleDrawer(null);
    if (drawerTriggerRef.current && drawerTriggerRef.current.focus) {
      drawerTriggerRef.current.focus();
    }
  }

  function handleStyleSelect(style, triggerEl) {
    openDrawer(style, triggerEl);
  }

  function startAiFromDrawer() {
    if (!selectedStyleDrawer) return;
    closeDrawer();
    navigate(`/workspace?style=${styleSlug(selectedStyleDrawer.name)}`);
  }

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    
    // Trigger hero animation after component mounts
    setTimeout(() => setHeroLoaded(true), 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!styles.length) return;
    const params = new URLSearchParams(location.search);
    const styleParam = params.get('style');
    if (!styleParam) {
      setInitStyle(null);
      setInitLoading(false);
      return;
    }
    const param = styleParam.toLowerCase();
    const match = styles.find((s) => {
      const byName = (s.name || '').toLowerCase();
      return byName === param || styleSlug(s.name) === param;
    });
    if (match) {
      setInitLoading(true);
      setInitStyle(match);
      setTimeout(() => setInitLoading(false), 800);
    } else {
      setInitStyle(null);
      setInitLoading(false);
    }
  }, [location.search, styles]);

  useEffect(() => {
    if (initStyle && !initLoading && initPanelRef.current) {
      initPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initStyle, initLoading]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflow || '';
    }
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
      if (e.key === 'Tab') {
        const drawer = document.querySelector('.style-drawer');
        if (!drawer) return;
        const focusables = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    setTimeout(() => {
      if (drawerFirstFocusRef.current) drawerFirstFocusRef.current.focus();
    }, 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);

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

  useEffect(() => {
    if (!tourMode) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        exitTour();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tourMode]);

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 2600);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const formatLoadError = (err) => {
    if (!err) return 'Could not load dashboard data.';

    const status = err.response?.status;
    if (status === 401) return 'Your session expired. Please log in again.';
    if (status === 403) return 'Access denied for this resource.';
    if (status && status >= 500) return 'Server error while loading dashboard data.';
    if (status && status >= 400) return err.response?.data?.detail || 'Request failed while loading dashboard data.';
    if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (err.message?.toLowerCase().includes('network')) {
      return 'Network issue: unable to reach API. Check backend/proxy configuration.';
    }
    return 'Could not load dashboard data. Please refresh.';
  };

  const withRetry = async (fn, retries = 2, delay = 350) => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < retries) await sleep(delay * (attempt + 1));
      }
    }
    throw lastError;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      setLoadError('');
      const [projectsResult, stylesResult] = await Promise.allSettled([
        withRetry(() => projectsAPI.getAll()),
        withRetry(() => stylesAPI.getAll()),
      ]);

      if (projectsResult.status === 'fulfilled') {
        setProjects(projectsResult.value.data);
        setLoadError('');
      } else {
        console.error('Error fetching projects:', projectsResult.reason);
        setProjects([]);
        const status = projectsResult.reason?.response?.status;
        if (status === 401 || status === 403) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setLoadError(formatLoadError(projectsResult.reason));
      }

      if (stylesResult.status === 'fulfilled') {
        const styleData = stylesResult.value.data;
        const merged = styleData && styleData.length > 0 ? mergeStylesWithDefaults(styleData) : defaultStyles;
        setStyles(merged);
      } else {
        console.error('Error fetching styles:', stylesResult.reason);
        // Non-blocking fallback for styles
        setStyles(defaultStyles);
        setActionMessage({
          type: 'error',
          text: 'Styles service unavailable. Showing default styles.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search hitting backend /search
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setSearching(false);
      setSearchError(null);
      setSearchMeta({ total: 0, page: 1, hasMore: false });
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);
        const res = await searchAPI.searchStyles(searchTerm.trim(), 20, 1);
        setSearchResults(res.data?.results || []);
        setSearchMeta({
          total: res.data?.total || 0,
          page: res.data?.page || 1,
          hasMore: res.data?.has_more || false,
        });
      } catch (err) {
        setSearchError(err?.response?.data?.detail || 'Search failed');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectType) {
      setActionMessage({ type: 'error', text: 'Please select a room type first.' });
      return;
    }

    setIsCreatingProject(true);
    try {
      await projectsAPI.create(newProjectType);
      setNewProjectType('');
      setShowNewProject(false);
      setActionMessage({ type: 'success', text: `${newProjectType} project created.` });
      await fetchData();
    } catch (err) {
      console.error('Error creating project:', err);
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Could not create project.' });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setDeletingProjectId(id);
    try {
      await projectsAPI.delete(id);
      setActionMessage({ type: 'success', text: 'Project deleted.' });
      await fetchData();
    } catch (err) {
      console.error('Error deleting project:', err);
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Could not delete project.' });
    } finally {
      setDeletingProjectId(null);
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
    setTourMode(false);
    setCurrentRoom(0);
    setRoomTransitioning(false);
    setIsEnteringTour(false);
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
  const totalBudget = projects.reduce((sum, project) => sum + (Number(project.budget) || 0), 0);
  const avgBudget = projects.length > 0 ? Math.round(totalBudget / projects.length) : 0;
  const latestProject = projects.length > 0
    ? [...projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null;
  const activeRoom = tourRooms[currentRoom];
  const tourProgress = ((currentRoom + 1) / tourRooms.length) * 100;

  const jumpToRoom = (index) => {
    if (roomTransitioning || index === currentRoom) return;
    setRoomDirection(index > currentRoom ? 'next' : 'prev');
    setRoomTransitioning(true);
    setTimeout(() => setCurrentRoom(index), 190);
    setTimeout(() => setRoomTransitioning(false), 430);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {/* Interactive House Tour Modal */}
      {(tourMode || isEnteringTour) && (
        <div className={`house-tour-overlay ${tourMode ? 'active' : ''}`} onClick={exitTour}>
          <div className={`tour-content ${isEnteringTour ? 'zooming' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="tour-exit-btn" onClick={exitTour}>
              ✕ Exit Tour
            </button>
            
            <div className={`tour-room ${roomTransitioning ? `room-fading room-${roomDirection}` : ''}`}>
              <div
                className="tour-ambient"
                style={{
                  background: `radial-gradient(circle at 20% 20%, ${activeRoom.color}44 0, transparent 46%), radial-gradient(circle at 80% 80%, ${activeRoom.color}2c 0, transparent 50%)`
                }}
              />
              <div className="room-progress-wrap">
                <div className="room-progress">
                  Room {currentRoom + 1} of {tourRooms.length}
                </div>
                <div className="tour-progress-track">
                  <span className="tour-progress-fill" style={{ width: `${tourProgress}%`, backgroundColor: activeRoom.color }} />
                </div>
              </div>
              <div className="tour-stage">
                <div className="motif-layer" aria-hidden="true">
                  {activeRoom.motifs.map((motif, idx) => (
                    <span
                      key={idx}
                      className={`motif motif-${idx + 1}`}
                      style={{ '--motif-color': `${activeRoom.color}55` }}
                    >
                      {motif}
                    </span>
                  ))}
                </div>
                <div 
                  className="room-emoji" 
                  style={{ background: `linear-gradient(135deg, ${activeRoom.color}50, ${activeRoom.color}22)` }}
                >
                  {activeRoom.emoji}
                </div>
                <h2 className="room-name">{activeRoom.name}</h2>
                <p className="room-description">{activeRoom.description}</p>
                
                <div className="room-services">
                  {activeRoom.services.map((service, idx) => (
                    <span 
                      key={idx} 
                      className="service-tag"
                      style={{ 
                        borderColor: activeRoom.color,
                        color: activeRoom.color
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="room-navigation">
                <button className="nav-arrow prev" onClick={prevRoom}>
                  ←
                </button>
                <div className="room-dots">
                  {tourRooms.map((room, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`dot ${idx === currentRoom ? 'active' : ''}`}
                      style={{ background: idx === currentRoom ? room.color : '' }}
                      onClick={() => jumpToRoom(idx)}
                      aria-label={`Go to ${room.name}`}
                    />
                  ))}
                </div>
                <button className="nav-arrow next" onClick={nextRoom}>
                  →
                </button>
              </div>
              <div className="tour-room-strip">
                {tourRooms.map((room, idx) => (
                  <button
                    type="button"
                    key={room.id}
                    className={`room-chip ${idx === currentRoom ? 'active' : ''}`}
                    onClick={() => jumpToRoom(idx)}
                  >
                    <span>{room.emoji}</span>
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-left">
              <h1>My Dashboard</h1>
              <span className="project-count-chip">{projects.length} Projects</span>
              <button onClick={() => navigate('/about')} className="about-btn">About</button>
            </div>
            <button onClick={logout} className="logout-btn">Logout</button>
          </header>
      {loadError && <div className="status-banner status-error">{loadError}</div>}
      {loadError && (
        <div className="status-banner-actions">
          <button className="status-retry-btn" onClick={fetchData}>
            Retry Loading
          </button>
        </div>
      )}
      {actionMessage && (
        <div className={`status-banner ${actionMessage.type === 'success' ? 'status-success' : 'status-error'}`}>
          {actionMessage.text}
        </div>
      )}

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
            <span className="title-line">Your Design Workspace</span>
          </h1>
          <p className={`hero-subtitle ${heroLoaded ? 'fade-in' : ''}`}>
            Create, explore, and transform spaces with AI.
          </p>
          <div className={`hero-cta ${heroLoaded ? 'fade-in' : ''}`}>
            <button className="cta-primary" onClick={() => setShowNewProject(true)}>
              Start a Project
            </button>
            <button className="cta-secondary" onClick={() => document.getElementById('what-we-do').scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
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

      {/* Quick Actions */}
      <section className="quick-actions reveal-on-scroll">
        <div className="quick-actions-head">
          <p className="virtual-eyebrow">Quick Actions</p>
          <h2>Jump right in</h2>
        </div>
        <div className="quick-actions-grid">
          <button
            className="quick-action-card"
            onClick={() => setShowNewProject(true)}
          >
            <span className="qa-icon">＋</span>
            <div>
              <h3>Create Project</h3>
              <p>Start a new room design.</p>
            </div>
          </button>
          <button
            className="quick-action-card"
            onClick={() => navigate('/workspace')}
          >
            <span className="qa-icon">📤</span>
            <div>
              <h3>Upload Room</h3>
              <p>Generate an AI transformation.</p>
            </div>
          </button>
          <button
            className="quick-action-card"
            onClick={() => document.getElementById('styles-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="qa-icon">🎨</span>
            <div>
              <h3>Explore Styles</h3>
              <p>Preview design aesthetics.</p>
            </div>
          </button>
        </div>
      </section>

      <div className="dashboard-grid">
        <aside className="metrics-rail">
          <div className="metrics-card reveal-on-scroll" style={{ '--delay': '0s' }}>
            <p className="metrics-label">Welcome Back</p>
            <h3 className="metrics-user">{user?.full_name || user?.email || 'Designer'}</h3>
            <p className="metrics-subtle">Keep building spaces your clients will love.</p>
          </div>
          <div className="metrics-stat-grid">
            <article className="metric-item reveal-on-scroll" style={{ '--delay': '0.06s' }}>
              <span className="metric-value">{projects.length}</span>
              <span className="metric-name">Projects</span>
            </article>
            <article className="metric-item reveal-on-scroll" style={{ '--delay': '0.12s' }}>
              <span className="metric-value">{styles.length}</span>
              <span className="metric-name">Styles</span>
            </article>
            <article className="metric-item reveal-on-scroll" style={{ '--delay': '0.18s' }}>
              <span className="metric-value">{tourRooms.length}</span>
              <span className="metric-name">Tour Rooms</span>
            </article>
            <article className="metric-item reveal-on-scroll" style={{ '--delay': '0.24s' }}>
              <span className="metric-value">${avgBudget}</span>
              <span className="metric-name">Avg Budget</span>
            </article>
          </div>
          <div className="metrics-card metrics-card-accent reveal-on-scroll" style={{ '--delay': '0.3s' }}>
            <p className="metrics-label">Latest Project</p>
            <h4>{latestProject ? latestProject.room_type : 'No projects yet'}</h4>
            <p className="metrics-subtle">
              {latestProject
                ? `Created ${new Date(latestProject.created_at).toLocaleDateString()}`
                : 'Start your first room plan to unlock recommendations.'}
            </p>
            <button className="rail-action-btn" onClick={() => setShowNewProject(true)}>
              + Create Project
            </button>
          </div>
        </aside>

      <div className="dashboard-main">
        {/* What We Do - Introduction Section */}
      <section className="what-we-do-section reveal-on-scroll" id="what-we-do">
          <div className="section-intro">
            <h2>What We Do</h2>
            <p>AI-powered services to design, plan, and manage your spaces end-to-end.</p>
          </div>

          {/* Search bar */}
          <div className="search-panel">
            <div className="search-row">
              <input
                type="search"
                placeholder="Search styles (e.g., modern, industrial, cozy)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="cta-secondary"
                onClick={() => setSearchTerm(searchTerm.trim())}
                disabled={!searchTerm.trim()}
              >
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>
            {searchError && <p className="search-error">{searchError}</p>}
            {!searching && searchTerm && searchResults.length === 0 && !searchError && (
              <p className="search-empty">No results yet. Try another term.</p>
            )}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((r) => (
                  <div key={`${r.type}-${r.id}`} className="search-result-card">
                    <div className="result-head">
                      <span className="result-rank">#{r.rank}</span>
                      <span className="result-type">{r.type}</span>
                      <span className="result-score">Score {r.score.toFixed(2)}</span>
                    </div>
                    <h4>{r.title}</h4>
                    {r.snippet && <p className="result-snippet">{r.snippet}</p>}
                    {r.tags?.length ? (
                      <div className="result-tags">
                        {r.tags.map((t) => (
                          <span key={t} className="tag-pill">{t}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                <div className="search-meta">
                  <span>{searchMeta.total} results</span>
                  {searchMeta.hasMore && <span>Showing first page</span>}
                </div>
              </div>
            )}
          </div>
            
            <div className="services-grid">
              <div className="service-card reveal-on-scroll" style={{ '--delay': '0.04s' }}>
                <div className="service-icon">🎨</div>
                <h3>Design Consultation</h3>
                <p>Expert advice to help you discover your perfect style and create a cohesive vision for your space.</p>
              </div>
              
              <div className="service-card reveal-on-scroll" style={{ '--delay': '0.08s' }}>
                <div className="service-icon">💰</div>
                <h3>Budget Planning</h3>
                <p>Smart budgeting tools and vendor connections to maximize your renovation budget without compromising quality.</p>
              </div>
              
              <div className="service-card reveal-on-scroll" style={{ '--delay': '0.12s' }}>
                <div className="service-icon">🛋️</div>
                <h3>Furniture Curation</h3>
                <p>Access to curated collections from top brands, with custom orders and professional delivery setup.</p>
              </div>
              
              <div className="service-card reveal-on-scroll" style={{ '--delay': '0.16s' }}>
                <div className="service-icon">✨</div>
                <h3>Moodboard Creation</h3>
                <p>Visualize your dream space with interactive moodboards before committing to any changes.</p>
              </div>
              
              <div className="service-card reveal-on-scroll" style={{ '--delay': '0.2s' }}>
                <div className="service-icon">📋</div>
                <h3>Project Management</h3>
                <p>Track progress, manage tasks, and collaborate with our team all in one organized hub.</p>
              </div>
              
              <div className="service-card reveal-on-scroll" style={{ '--delay': '0.24s' }}>
                <div className="service-icon">🏠</div>
                <h3>Room Visualization</h3>
                <p>3D visualizations and virtual tours to see your new space before it's built.</p>
              </div>
            </div>
          </section>

          {/* Explore Design Styles with Hover Preview Cards */}
          <section className="styles-section reveal-on-scroll" id="styles-section">
            <div className="section-intro">
              <h2>Explore Design Styles</h2>
              <p>Hover over each style to preview what's possible.</p>
            </div>
            
            {initStyle && (
              <section ref={initPanelRef} className={`style-init-panel inline ${initLoading ? 'is-loading' : ''}`}>
                {initLoading ? (
                  <p className="init-status">Initializing {initStyle.name} style parameters...</p>
                ) : (
                  <>
                    <p className="virtual-eyebrow">Style Activated</p>
                    <div className="init-head">
                      <h3>{initStyle.name} Style Activated</h3>
                      <span className="init-meta">{(initStyle.previewFeatures || initStyle.features || ['AI-guided layout']).slice(0, 3).join(' • ')}</span>
                    </div>
                    <p className="init-copy">AI will analyze your room geometry and apply {initStyle.name} design principles.</p>
                    <div className="init-actions">
                      <button
                        type="button"
                        className="init-primary"
                        onClick={() => navigate(`/virtual-tour?style=${styleSlug(initStyle.name)}`)}
                      >
                        Start AI Transformation
                      </button>
                      <div className="init-secondary">
                        <button type="button" onClick={() => setShowNewProject(true)}>Upload My Room</button>
                        <button type="button" onClick={() => navigate(`/virtual-tour?style=${styleSlug(initStyle.name)}&demo=1`)}>Preview Demo Room</button>
                      </div>
                    </div>
                    <div className="init-stats">
                      <span><strong>AI Confidence:</strong> 92%</span>
                      <span><strong>Detected Improvements:</strong> 4</span>
                      <ul>
                        <li>Lighting warmed by 18%</li>
                        <li>Wall tone adjusted to ivory</li>
                        <li>Layout symmetry optimized</li>
                        <li>Accent materials added</li>
                      </ul>
                    </div>
                  </>
                )}
              </section>
            )}
            
            <div className="styles-showcase">
              {styles.map((style, index) => (
                <div 
                  key={style.id} 
                  className="style-preview-card reveal-on-scroll"
                  style={{ '--index': index, '--delay': `${0.05 + index * 0.04}s` }}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleStyleSelect(style, e.currentTarget)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStyleSelect(style, e.currentTarget); }}
                >
                  {/** resolve per-card emoji with unique fallback */} 
                  {(() => {
                    const resolvedEmoji = resolveStyleEmoji(style, index);
                    return (
                      <div 
                        className={`style-card-main ${style.name === 'Modern' ? 'style-modern' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleStyleSelect(style)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStyleSelect(style); }}
                        style={{ 
                          background: style.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '--style-accent': style.accent || (style.name === 'Scandinavian' ? '#c9b5ff' : style.name === 'Industrial' ? '#7a74ff' : style.name === 'Bohemian' ? '#d78bff' : '#b18bff'),
                          '--style-accent-2': style.accentTwo || (style.name === 'Scandinavian' ? '#b39cf3' : style.name === 'Industrial' ? '#4c4a7a' : style.name === 'Bohemian' ? '#b66fd8' : '#9273d8'),
                          '--style-base': style.base || '#0c0a14'
                        }}
                      >
                        <div className="style-icon-wrapper">
                          <span className="style-emoji">{resolvedEmoji}</span>
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
                        <div
                          className="style-cta-strip"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); handleStyleSelect(style, e.currentTarget); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleStyleSelect(style, e.currentTarget); } }}
                        >
                          <span className="cta-label">Explore style</span>
                          <span className="cta-arrow">→</span>
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </section>

          {isDrawerOpen && selectedStyleDrawer && (
            <div className="style-drawer-backdrop" role="presentation" onClick={closeDrawer}>
              <aside
                className="style-drawer open"
                role="dialog"
                aria-label={`${selectedStyleDrawer.name} style details`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="drawer-header">
                  <div>
                    <p className="virtual-eyebrow">AI Style Lab</p>
                    <h3 className="drawer-title">{selectedStyleDrawer.name} Studio</h3>
                    <p className="drawer-tagline">
                      AI will adapt {selectedStyleDrawer.name} principles to your room layout.
                    </p>
                  </div>
                  <button className="drawer-close" onClick={closeDrawer} aria-label="Close style drawer">✕</button>
                </div>

                <div className="drawer-body">
                  <div className={`style-preview-card ${drawerStages.preview ? 'reveal-in' : 'pre-reveal'}`}>
                    <div className="style-preview-label">Style Preview</div>
                    <div
                      className={`style-preview-visual ${hoveredTrait ? 'preview-highlight' : ''}`}
                      style={{
                        backgroundImage: selectedStyleDrawer.previewImage
                          ? `linear-gradient(140deg, rgba(12,10,20,0.55), rgba(12,10,20,0.2)), url(${selectedStyleDrawer.previewImage})`
                          : 'linear-gradient(160deg, #20142f, #120c1e 40%, #0c0916)',
                      }}
                    >
                      <div className="style-preview-overlay" />
                      <div className="style-preview-grid" />
                      <div className="style-preview-geo" />
                      <div className="scan-line" />
                      <p className="style-preview-copy inline inside">
                        {(selectedStyleDrawer.description || 'Clean lines, minimal decor, balanced palette').slice(0, 110)}
                      </p>
                    </div>
                  </div>

                  <div className={`drawer-section ${drawerStages.compat ? 'reveal-in' : 'pre-reveal'}`}>
                    <div className="drawer-section-head">
                      <span className="section-label">AI Compatibility</span>
                      <span className="compat-value">92% Match</span>
                    </div>
                    <div className="compat-bar">
                      <span className="compat-fill" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className={`drawer-section ${drawerStages.compat ? 'reveal-in' : 'pre-reveal'}`}>
                    <div className="drawer-section-head">
                      <span className="section-label">AI Detected From Your Space</span>
                    </div>
                    <ul className="why-style-list detected-list">
                      {(selectedStyleDrawer.detected || [
                        'Natural lighting detected',
                        'Open wall layout',
                        'Neutral existing tones',
                        'Low furniture density',
                      ]).slice(0, 4).map((reason, idx) => (
                        <li key={idx} className="why-style-item">
                          <span className="reason-icon">🔍</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`drawer-section ${drawerStages.compat ? 'reveal-in' : 'pre-reveal'}`}>
                    <div className="drawer-section-head">
                      <span className="section-label">Why This Style Works</span>
                    </div>
                    <ul className="why-style-list">
                      {(selectedStyleDrawer.reasons || [
                        'Clean geometry improves spatial flow',
                        'Neutral palette adapts to most rooms',
                        'Minimal decor increases perceived space',
                        'Lighting-focused layouts enhance comfort',
                      ]).slice(0, 4).map((reason, idx) => (
                        <li
                          key={idx}
                          className={`why-style-item ${hoveredTrait && reason.toLowerCase().includes(hoveredTrait.toLowerCase()) ? 'reason-highlight' : ''}`}
                        >
                          <span className="reason-icon">🧠</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`drawer-section ${drawerStages.dna ? 'reveal-in' : 'pre-reveal'}`}>
                    <div className="drawer-section-head">
                      <span className="section-label">Style DNA</span>
                    </div>
                    <div className="drawer-dna">
                      {(selectedStyleDrawer.previewFeatures || selectedStyleDrawer.features || ['Clean Lines', 'Neutral Palette', 'Statement Lighting']).slice(0, 3).map((item, idx) => {
                        const icons = ['📐', '🎨', '💡', '🪵', '🪟', '🛋️'];
                        const icon = icons[idx % icons.length];
                        return (
                          <span
                            key={idx}
                            className="dna-chip dna-chip-interactive"
                            onMouseEnter={() => setHoveredTrait(item)}
                            onMouseLeave={() => setHoveredTrait('')}
                          >
                            <span className="dna-icon">{icon}</span>
                            <span>{item}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="drawer-section actions">
                    <p className="drawer-microcopy">Transform your room using AI-powered {selectedStyleDrawer.name} design principles.</p>
                  </div>
                </div>

                <div className="drawer-footer">
                  <button
                    ref={drawerFirstFocusRef}
                    type="button"
                    className="init-primary"
                    onClick={startAiFromDrawer}
                  >
                    Start AI Transformation
                  </button>
                  <div className="drawer-actions-inline">
                    <button type="button" className="drawer-secondary" onClick={() => navigate(`/virtual-tour?style=${styleSlug(selectedStyleDrawer.name)}&demo=1`)}>Preview Demo</button>
                    <button type="button" className="drawer-tertiary" onClick={() => setShowNewProject(true)}>Upload My Room</button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Projects Section */}
          <section className="projects-section reveal-on-scroll">
            <div className="section-header">
              <h2>My Room Projects</h2>
              <button 
                onClick={() => setShowNewProject(!showNewProject)}
                className="new-project-btn"
              >
                {showNewProject ? 'Close' : '+ New Project'}
              </button>
            </div>

            {showNewProject && (
              <form onSubmit={handleCreateProject} className="new-project-form">
                <div className="form-text">
                  <p className="form-title">Create a new room project</p>
                  <p className="form-subtitle">Pick a room to start your plan and recommendations.</p>
                </div>
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
                <button type="submit" disabled={isCreatingProject || !newProjectType}>
                  {isCreatingProject ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowNewProject(false)}>Cancel</button>
              </form>
            )}

            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet. Upload a room photo and let AI generate a design transformation.</p>
                <button className="new-project-btn" onClick={() => setShowNewProject(true)}>
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map((project, index) => (
                  <div key={project.id} className="project-card reveal-on-scroll" style={{ '--delay': `${0.04 + (index % 6) * 0.04}s` }}>
                    <h3>{project.room_type}</h3>
                    <p>Budget: ${project.budget || 0}</p>
                    <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                    <div className="project-actions">
                      <button onClick={() => navigate(`/project/${project.id}`)}>
                        Open Project
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="delete-btn"
                        disabled={deletingProjectId === project.id}
                      >
                        {deletingProjectId === project.id ? 'Deleting...' : 'Delete'}
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
              <span className="house-figure">
                <span className="house-roof" />
                <span className="house-body">
                  <span className="house-window window-left" />
                  <span className="house-window window-right" />
                  <span className="house-door" />
                </span>
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
            <button className="tour-immersive-btn" onClick={() => navigate('/virtual-tour')}>
              Launch Immersive 3D Tour
            </button>
          </div>
        </section>
      </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 Home4U - Your Dream Home Starts Here</p>
      </footer>
    </div>
  );
};

export default Dashboard;

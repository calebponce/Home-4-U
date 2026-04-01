import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DollarSign, FolderKanban, Home, Palette, PlayCircle, SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Default styles with rich visuals
const defaultStyles = [
  { 
    id: 1, 
    name: 'Modern', 
    description: 'Clean lines, minimal clutter, and functional design with neutral colors',
    emoji: '🪟',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    palette: ['#0b0f1a', '#667eea', '#c7d2fe', '#ffffff'],
    materials: ['Glass', 'Polished concrete'],
    signature: 'Statement lighting + negative space',
    previewEmojis: ['🛋️', '📐', '💡', '🪟'],
    previewFeatures: ['Clean Lines', 'Neutral Palette', 'Statement Lighting', 'Open Spaces']
  },
  { 
    id: 2, 
    name: 'Traditional', 
    description: 'Classic elegance with rich colors, ornate details, and quality craftsmanship',
    emoji: '🕰️',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    palette: ['#2b0f16', '#f5576c', '#fbcfe8', '#fdf2f8'],
    materials: ['Mahogany', 'Velvet'],
    signature: 'Molding, symmetry, and heirloom pieces',
    previewEmojis: ['🕰️', '🪞', '🕯️', '🏺'],
    previewFeatures: ['Rich Fabrics', 'Antique Details', 'Crown Molding', 'Classic Furniture']
  },
  { 
    id: 3, 
    name: 'Scandinavian', 
    description: 'Cozy minimalism with natural materials, light colors, and hygge atmosphere',
    emoji: '🪵',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    palette: ['#0b1116', '#00f2fe', '#e5e7eb', '#ffffff'],
    materials: ['Light oak', 'Linen'],
    signature: 'Warm neutrals + soft texture layers',
    previewEmojis: ['🌿', '🪵', '🧸', '🕯️'],
    previewFeatures: ['Natural Wood', 'Indoor Plants', 'Cozy Textiles', 'Warm Lighting']
  },
  { 
    id: 4, 
    name: 'Industrial', 
    description: 'Raw materials, exposed elements, and urban-inspired aesthetics',
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    palette: ['#0b0b0d', '#2a2a2f', '#8b8b96', '#f5f5f7'],
    materials: ['Steel', 'Brick'],
    signature: 'Raw texture + high contrast lighting',
    previewEmojis: ['⚙️', '🧱', '💡', '🪜'],
    previewFeatures: ['Exposed Brick', 'Metal Accents', 'Edison Bulbs', 'Open Ductwork']
  },
  { 
    id: 5, 
    name: 'Bohemian', 
    description: 'Eclectic, colorful, and free-spirited with layered textures and patterns',
    emoji: '🧶',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    palette: ['#1a0b12', '#fa709a', '#fee140', '#fff7ed'],
    materials: ['Rattan', 'Woven textiles'],
    signature: 'Layered patterns + collected decor',
    previewEmojis: ['🌺', '💐', '🎭', '🪭'],
    previewFeatures: ['Layered Rugs', 'Vintage Finds', 'Art Displays', 'Pattern Mix']
  },
  { 
    id: 6, 
    name: 'Mid-Century', 
    description: 'Retro sophistication with bold colors, organic shapes, and timeless appeal',
    emoji: '🛋️',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    palette: ['#1a0f11', '#ff9a9e', '#f59e0b', '#fff7ed'],
    materials: ['Teak', 'Leather'],
    signature: 'Tapered legs + warm wood tones',
    previewEmojis: ['🪑', '📺', '🪵', '🌵'],
    previewFeatures: ['Tapered Legs', 'Bold Colors', 'Organic Curves', 'Retro Appliances']
  },
  { 
    id: 7, 
    name: 'Mediterranean', 
    description: 'Warm, inviting spaces with terracotta, wrought iron, and rustic textures',
    emoji: '🍋',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    palette: ['#1a1208', '#fda085', '#f6d365', '#fff7ed'],
    materials: ['Terracotta', 'Wrought iron'],
    signature: 'Arches, tiles, and sun-washed warmth',
    previewEmojis: ['🌞', '🍋', '🏺', '🪴'],
    previewFeatures: ['Terracotta', 'Arched Doorways', 'Wrought Iron', 'Clay Tiles']
  },
  { 
    id: 8, 
    name: 'Japanese', 
    description: 'Serene simplicity with natural materials, clean spaces, and zen harmony',
    emoji: '🎍',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    palette: ['#070a0d', '#a8edea', '#e5e7eb', '#ffffff'],
    materials: ['Cedar', 'Rice paper'],
    signature: 'Low furniture + calm negative space',
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
  Minimalist: '⚪️',
  Farmhouse: '🏡',
};

const styleEmojiFallback = ['🪟', '🏛️', '🪵', '⚒️', '🧿', '📺', '🫒', '🎎', '🪴', '🧭'];

const normalizeStyleName = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const canonicalStyleKey = (name) => {
  const n = normalizeStyleName(name);
  if (!n) return '';
  if (n.includes('midcentury')) return 'midcentury';
  if (n.includes('scandinav')) return 'scandinavian';
  if (n.includes('mediterr')) return 'mediterranean';
  if (n.includes('industr')) return 'industrial';
  if (n.includes('bohem')) return 'bohemian';
  if (n.includes('minimal')) return 'minimalist';
  if (n.includes('farm')) return 'farmhouse';
  if (n.includes('japan') || n.includes('zen')) return 'japanese';
  if (n.includes('trad') || n.includes('classic')) return 'traditional';
  if (n.includes('modern')) return 'modern';
  return n;
};

// Style-specific fallback element sets (used when the API doesn't provide rich per-style details).
const styleElementSets = {
  modern: {
    previewEmojis: ['📐', '🪟', '💡', '⚪️'],
    previewFeatures: ['Clean Lines', 'Neutral Palette', 'Statement Lighting', 'Open Spaces'],
  },
  traditional: {
    previewEmojis: ['🕯️', '🏛️', '🪞', '🧵'],
    previewFeatures: ['Crown Molding', 'Classic Furniture', 'Rich Fabrics', 'Warm Woods'],
  },
  scandinavian: {
    previewEmojis: ['🪵', '🧸', '🕯️', '🌿'],
    previewFeatures: ['Light Wood', 'Cozy Textiles', 'Soft Lighting', 'Calm Neutrals'],
  },
  industrial: {
    previewEmojis: ['🧱', '🔩', '💡', '🪜'],
    previewFeatures: ['Exposed Brick', 'Metal Accents', 'Edison Bulbs', 'Open Ductwork'],
  },
  bohemian: {
    previewEmojis: ['🧶', '🎭', '🪭', '🌺'],
    previewFeatures: ['Layered Rugs', 'Pattern Mix', 'Vintage Finds', 'Art Displays'],
  },
  midcentury: {
    previewEmojis: ['🪑', '🪵', '🟧', '📺'],
    previewFeatures: ['Tapered Legs', 'Warm Woods', 'Bold Accents', 'Organic Curves'],
  },
  mediterranean: {
    previewEmojis: ['🏺', '🧱', '🌞', '🍋'],
    previewFeatures: ['Terracotta', 'Arched Doorways', 'Wrought Iron', 'Clay Tiles'],
  },
  japanese: {
    previewEmojis: ['🎋', '🍵', '🧘', '🪵'],
    previewFeatures: ['Shoji Screens', 'Low Furniture', 'Natural Materials', 'Zen Calm'],
  },
  minimalist: {
    previewEmojis: ['🗄️', '⚪️', '🪑', '🪟'],
    previewFeatures: ['Hidden Storage', 'Neutral Palette', 'Floating Furniture', 'Natural Light'],
  },
  farmhouse: {
    previewEmojis: ['🪵', '🚪', '🚰', '🔩'],
    previewFeatures: ['Reclaimed Wood', 'Barn Doors', 'Apron Sink', 'Vintage Metal'],
  },
};

const resolveStyleElements = (style) => {
  const key = canonicalStyleKey(style?.name);
  const fallback = styleElementSets[key] || {};

  const previewEmojisRaw = Array.isArray(style?.previewEmojis) && style.previewEmojis.length
    ? style.previewEmojis
    : fallback.previewEmojis;

  const previewFeaturesRaw =
    (Array.isArray(style?.previewFeatures) && style.previewFeatures.length ? style.previewFeatures : null) ||
    (Array.isArray(style?.features) && style.features.length ? style.features : null) ||
    fallback.previewFeatures;

  const previewEmojis = (previewEmojisRaw || ['📐', '🎨', '💡', '🧱']).slice(0, 4);
  const previewFeatures = (previewFeaturesRaw || ['Layout', 'Palette', 'Materials', 'Lighting']).slice(0, 4);

  return { key, previewEmojis, previewFeatures };
};

const resolveStyleEmoji = (style, index) => {
  const key = (style?.name || '').trim();
  if (styleEmojiMap[key]) return styleEmojiMap[key];
  const canonical = canonicalStyleKey(key);
  const canonicalMap = {
    modern: styleEmojiMap.Modern,
    traditional: styleEmojiMap.Traditional,
    scandinavian: styleEmojiMap.Scandinavian,
    industrial: styleEmojiMap.Industrial,
    bohemian: styleEmojiMap.Bohemian,
    midcentury: styleEmojiMap['Mid-Century'],
    mediterranean: styleEmojiMap.Mediterranean,
    japanese: styleEmojiMap.Japanese,
    minimalist: styleEmojiMap.Minimalist,
    farmhouse: styleEmojiMap.Farmhouse,
  };
  if (canonicalMap[canonical]) return canonicalMap[canonical];
  if (style?.emoji) return style.emoji;
  return styleEmojiFallback[index % styleEmojiFallback.length];
};

const mergeStylesWithDefaults = (incoming = []) => {
  const merged = new Map();
  defaultStyles.forEach((s) => merged.set(canonicalStyleKey(s.name), s));
  incoming.forEach((s) => {
    const key = canonicalStyleKey(s.name);
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
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [initStyle, setInitStyle] = useState(null);
  const [initLoading, setInitLoading] = useState(false);
  const [selectedStyleDrawer, setSelectedStyleDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef(null);
  const drawerFirstFocusRef = useRef(null);
  const [drawerStages, setDrawerStages] = useState({ preview: false, compat: false, dna: false });
  const [hoveredTrait, setHoveredTrait] = useState('');
  const [tourMode, setTourMode] = useState(false);
  const [isEnteringTour, setIsEnteringTour] = useState(false);
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const parallaxRef = useRef(null);
  const heroInViewRef = useRef(true);
  const initPanelRef = useRef(null);
  function styleSlug(name) {
    return (name || '').toLowerCase().replace(/\s+/g, '-');
  }

  function startTour() {
    setIsEnteringTour(true);
    setTimeout(() => {
      setTourMode(true);
      setIsEnteringTour(false);
      navigate('/virtual-tour');
    }, 600);
  }

  function exitTour() {
    setTourMode(false);
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
    
    // Trigger hero animation after component mounts
    setTimeout(() => setHeroLoaded(true), 100);
    
    return () => {};
  }, []);

  useEffect(() => {
    const prevScene = document.body.dataset.scene;
    document.body.dataset.scene = 'dashboard';
    return () => {
      if (document.body.dataset.scene === 'dashboard') {
        if (prevScene) document.body.dataset.scene = prevScene;
        else delete document.body.dataset.scene;
      }
    };
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
    const apply = (on) => {
      document.documentElement.classList.toggle('dash-snap', on);
      document.body.classList.toggle('dash-snap', on);
    };
    const update = () => apply(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => {
      mql.removeEventListener('change', update);
      apply(false);
    };
  }, []);

  useEffect(() => {
    const root = parallaxRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let rafId = 0;
    let pointer = { x: 0, y: 0, active: false };
    let io = null;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    const tick = () => {
      rafId = 0;
      if (!heroInViewRef.current) return;

      const rect = root.getBoundingClientRect();
      if (!rect.height) return;

      // 0 -> 1 as the hero scrolls past the top of the viewport; used for fade + depth.
      const progress = clamp((-rect.top) / rect.height, 0, 1);

      let mx = 0;
      let my = 0;
      if (pointer.active && rect.width > 0 && rect.height > 0) {
        mx = clamp(((pointer.x - rect.left) / rect.width - 0.5) * 2, -1, 1);
        my = clamp(((pointer.y - rect.top) / rect.height - 0.5) * 2, -1, 1);
      }

      root.style.setProperty('--p-s', progress.toFixed(4));
      root.style.setProperty('--p-mx', mx.toFixed(4));
      root.style.setProperty('--p-my', my.toFixed(4));
    };

    const requestTick = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(tick);
    };

    const onScroll = () => requestTick();
    const onResize = () => requestTick();

    const onPointerMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY, active: true };
      requestTick();
    };

    const onPointerLeave = () => {
      pointer = { x: 0, y: 0, active: false };
      requestTick();
    };

    // Initialize variables before first paint.
    root.style.setProperty('--p-s', '0');
    root.style.setProperty('--p-mx', '0');
    root.style.setProperty('--p-my', '0');
    requestTick();

    // Only update hero parallax while the hero is near the viewport.
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        heroInViewRef.current = !!entry?.isIntersecting;
        if (heroInViewRef.current) requestTick();
      },
      { threshold: 0, rootMargin: '240px 0px 240px 0px' }
    );
    io.observe(root);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    if (finePointer) {
      root.addEventListener('pointermove', onPointerMove, { passive: true });
      root.addEventListener('pointerleave', onPointerLeave, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (finePointer) {
        root.removeEventListener('pointermove', onPointerMove);
        root.removeEventListener('pointerleave', onPointerLeave);
      }
      if (rafId) window.cancelAnimationFrame(rafId);
      if (io) io.disconnect();
    };
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

  const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];
  const totalBudget = projects.reduce((sum, project) => sum + (Number(project.budget) || 0), 0);
  const avgBudget = projects.length > 0 ? Math.round(totalBudget / projects.length) : 0;
  const sortedProjects =
    projects.length > 0 ? [...projects].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)) : [];
  const recentProjects = sortedProjects.slice(0, 3);
  const dashboardStats = [
    { label: 'Projects', value: projects.length, icon: FolderKanban },
    { label: 'Styles', value: styles.length, icon: Palette },
    { label: 'Tour Rooms', value: tourRooms.length, icon: Home },
    { label: 'Avg Budget', value: `$${avgBudget}`, icon: DollarSign },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>My Dashboard</h1>
            <span className="project-count-chip">{projects.length} Projects</span>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="header-action header-action-primary"
              onClick={() => {
                setShowNewProject(true);
                // Keep user oriented: jump to the creation area.
                requestAnimationFrame(() => {
                  document.querySelector('.projects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
            >
              + New Project
            </button>
          </div>
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
        <div className="parallax-bg" aria-hidden="true" />
        <div 
          className={`parallax-content ${heroLoaded ? 'loaded' : ''}`}
        >
          <p className={`hero-eyebrow ${heroLoaded ? 'fade-in' : ''}`}>
            Home4U AI Studio
          </p>
          <h1 className={`hero-title ${heroLoaded ? 'fade-in' : ''}`}>
            <span className="title-line">
              Your <span className="hero-emphasis">Design</span> Workspace
            </span>
          </h1>
          <p className={`hero-subtitle ${heroLoaded ? 'fade-in' : ''}`}>
            Create, explore, and transform spaces with AI.
          </p>
          <div className={`hero-cta ${heroLoaded ? 'fade-in' : ''}`}>
            <button className="cta-primary" onClick={() => navigate('/workspace')}>
              Upload Room
            </button>
            <button
              className="cta-secondary"
              onClick={() => document.getElementById('styles-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Styles
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

      {/* Recent Projects */}
      <section className="recent-projects reveal-on-scroll">
        <div className="section-intro">
          <h2>Recent Projects</h2>
          <p>Pick up where you left off.</p>
        </div>
        {recentProjects.length ? (
          <div className="recent-projects-grid">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="recent-project-card"
                data-tilt
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="recent-project-top">
                  <span className="recent-project-title">{project.room_type || 'Project'}</span>
                  <span className="recent-project-date">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="recent-project-meta">
                  <span className="recent-project-chip">
                    Budget {project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'}
                  </span>
                  <span className="recent-project-chip subtle">Open</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recent projects. Create one above to get started.</p>
          </div>
        )}
      </section>

      <section className="stats-row-section reveal-on-scroll">
        <div className="stats-row" aria-label="Dashboard statistics">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="stats-row-item">
                <span className="stats-row-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2.1} />
                </span>
                <div className="stats-row-copy">
                  <span className="stats-row-value">{stat.value}</span>
                  <span className="stats-row-label">{stat.label}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

	      <div className="dashboard-grid">
	        <aside className="metrics-rail">
          <div className="metrics-card reveal-on-scroll" style={{ '--delay': '0s' }}>
            <p className="metrics-label">Welcome Back</p>
            <h3 className="metrics-user">{user?.full_name || user?.email || 'Designer'}</h3>
            <p className="metrics-subtle">Keep building spaces your clients will love.</p>
          </div>
        </aside>

	      <div className="dashboard-main">
          <section className="house-tour-section reveal-on-scroll">
            <div className="section-intro">
              <h2>Take a Virtual Tour</h2>
              <p>Walk through a sample interior experience and preview how Home4U presents design direction.</p>
            </div>

            <button
              type="button"
              className={`tour-media-card ${isEnteringTour ? 'entering' : ''}`}
              onClick={startTour}
            >
              <span className="tour-media-scrim" aria-hidden="true" />
              <span className="tour-media-play" aria-hidden="true">
                <PlayCircle size={72} strokeWidth={1.65} />
              </span>
              <span className="tour-media-copy">
                <span className="tour-media-kicker">Interactive walkthrough</span>
                <span className="tour-media-title">Enter the Home4U showcase house</span>
                <span className="tour-media-meta">{tourRooms.length} curated rooms ready to explore</span>
              </span>
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
          </section>

	        {/* What We Do - Introduction Section */}
	      <section className="search-section reveal-on-scroll" id="search-section">
          <div className="section-intro">
            <h2>Find Your Style</h2>
            <p>Search our database of interior design aesthetics.</p>
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
              <AnimatePresence>
                <motion.div 
                  className="search-empty-cinematic"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div 
                    className="empty-icon-glow"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <SearchX size={48} strokeWidth={1.5} />
                  </motion.div>
                  <h3>No Visions Found</h3>
                  <p>We couldn't find any styles matching "{searchTerm}". Try adjusting your keywords to discover new aesthetics.</p>
                </motion.div>
              </AnimatePresence>
            )}
            {searchResults.length > 0 && (
              <div className="search-gallery-grid">
                <AnimatePresence>
                  {searchResults.map((r, idx) => (
                    <motion.div 
                      key={`${r.type}-${r.id}`} 
                      className="search-gallery-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="gallery-card-backdrop" />
                      <div className="gallery-card-content">
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
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="search-meta gallery-meta">
                  <span>{searchMeta.total} results</span>
                  {searchMeta.hasMore && <span>Showing first page</span>}
                </div>
              </div>
            )}
          </div>
            
          </section>

          {/* Explore Design Styles with Hover Preview Cards */}
          <section className="styles-section reveal-on-scroll" id="styles-section">
            <div className="section-intro">
              <h2>Explore Design Styles</h2>
              <p>Select a style to preview palette, materials, and a tailored AI direction.</p>
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
                      <span className="init-meta">{resolveStyleElements(initStyle).previewFeatures.slice(0, 3).join(' • ')}</span>
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
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={`skel-style-${i}`} className="style-preview-card skeleton-card">
                    <div className="skeleton skeleton-img"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text-sm"></div>
                  </div>
                ))
              ) : (
                styles.map((style, index) => (
                  <div 
                    key={style.id} 
                    className="style-preview-card reveal-on-scroll"
                    style={{ '--index': index, '--delay': `${0.05 + index * 0.04}s` }}
                  >
                  {/** resolve per-card emoji with unique fallback */} 
                  {(() => {
                    const resolvedEmoji = resolveStyleEmoji(style, index);
                    const { key: styleKey, previewEmojis, previewFeatures } = resolveStyleElements(style);
                    const palette = Array.isArray(style.palette) && style.palette.length
                      ? style.palette.slice(0, 4)
                      : [style.accent || '#b18bff', style.accentTwo || '#9273d8', style.base || '#0c0a14', '#ffffff'].slice(0, 4);
                    const materials = Array.isArray(style.materials) && style.materials.length ? style.materials.slice(0, 2) : [];
                    return (
                      <button
                        type="button"
                        className={`style-card-main${styleKey ? ` style-${styleKey}` : ''}`}
                        data-tilt
                        aria-label={`Explore ${style.name} style`}
                        onClick={(e) => handleStyleSelect(style, e.currentTarget)}
                        style={{ 
                          '--card-bg': style.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '--style-accent': style.accent || (style.name === 'Scandinavian' ? '#c9b5ff' : style.name === 'Industrial' ? '#7a74ff' : style.name === 'Bohemian' ? '#d78bff' : '#b18bff'),
                          '--style-accent-2': style.accentTwo || (style.name === 'Scandinavian' ? '#b39cf3' : style.name === 'Industrial' ? '#4c4a7a' : style.name === 'Bohemian' ? '#b66fd8' : '#9273d8'),
                          '--style-base': style.base || '#0c0a14'
                        }}
                      >
                        <div className="style-card-head">
                          <div className="style-icon-wrapper" aria-hidden="true">
                            <span className="style-emoji">{resolvedEmoji}</span>
                          </div>
                          <div className="style-card-headtext">
                            <h3 className="style-card-title">{style.name}</h3>
                            <p className="style-card-desc">
                              {style.description || 'A modern interior style.'}
                            </p>
                            <div className="style-card-details">
                              <div className="style-palette" aria-label={`${style.name} palette`}>
                                {palette.map((color, i) => (
                                  <span key={`${style.id}-sw-${i}`} className="style-swatch" style={{ '--swatch': color }} aria-hidden="true" />
                                ))}
                              </div>
                              {style.signature ? (
                                <span className="style-signature" title={style.signature}>
                                  {style.signature}
                                </span>
                              ) : materials.length ? (
                                <span className="style-signature" title={materials.join(' + ')}>
                                  {materials.join(' + ')}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="style-chips" aria-label="Style highlights">
                          {previewEmojis.map((emoji, i) => (
                            <span
                              key={`${style.id}-chip-${i}`}
                              className="style-chip"
                              title={previewFeatures[i] || `Element ${i + 1}`}
                            >
                              <span className="chip-emoji" aria-hidden="true">{emoji}</span>
                              <span className="chip-text">
                                {previewFeatures[i] || `Element ${i + 1}`}
                              </span>
                            </span>
                          ))}
                        </div>

                        <div className="style-cta-strip" aria-hidden="true">
                          <span className="cta-left">
                            <span className="cta-label">Explore</span>
                            <span className="cta-tag">{style.name}</span>
                          </span>
                          <span className="cta-arrow">→</span>
                        </div>
                      </button>
                    );
                  })()}
                </div>
              )))}
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
                      {resolveStyleElements(selectedStyleDrawer).previewFeatures.slice(0, 3).map((item, idx) => {
                        const icons = resolveStyleElements(selectedStyleDrawer).previewEmojis;
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

            {loading ? (
              <div className="projects-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-proj-${i}`} className="project-card skeleton-card">
                    <div className="skeleton skeleton-text-lg"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-btn"></div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="empty-state projects-empty-state zero-state-onboarding">
                <div className="zero-state-header">
                  <span className="projects-empty-icon" aria-hidden="true">
                    <FolderKanban size={32} strokeWidth={1.5} />
                  </span>
                  <h3>Start Your First Project</h3>
                  <p>Select a room template or create a custom space.</p>
                </div>
                <div className="zero-state-templates">
                  <button className="template-card" onClick={() => { setNewProjectType('Living Room'); setShowNewProject(true); }}>
                    <div className="template-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583847268964-b28ce8f52f30?auto=format&fit=crop&q=80&w=600')" }}></div>
                    <span className="template-name">Living Room</span>
                  </button>
                  <button className="template-card" onClick={() => { setNewProjectType('Bedroom'); setShowNewProject(true); }}>
                    <div className="template-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600')" }}></div>
                    <span className="template-name">Bedroom</span>
                  </button>
                  <button className="template-card" onClick={() => { setNewProjectType('Kitchen'); setShowNewProject(true); }}>
                    <div className="template-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-15569101031-c02745a828?auto=format&fit=crop&q=80&w=600')" }}></div>
                    <span className="template-name">Kitchen</span>
                  </button>
                </div>
                <button className="new-project-btn cta-primary" onClick={() => setShowNewProject(true)}>
                  Create Custom Project
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map((project, index) => (
                  <div key={project.id} className="project-card reveal-on-scroll" data-tilt style={{ '--delay': `${0.04 + (index % 6) * 0.04}s` }}>
                    <div className="project-card-header">
                      <h3>{project.room_type}</h3>
                      <span className="status-badge">Open</span>
                    </div>
                    <div className="project-meta">
                      <p><strong>Budget:</strong> ${project.budget ? Number(project.budget).toLocaleString() : 0}</p>
                      <p><strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="project-actions">
                      <button className="open-btn" onClick={() => navigate(`/project/${project.id}`)}>
                        Open Project
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="delete-btn ghost-danger"
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
      </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 Home4U - Your Dream Home Starts Here</p>
      </footer>
      </div>
    </div>
  );
};

export default Dashboard;

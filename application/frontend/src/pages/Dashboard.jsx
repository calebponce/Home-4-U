import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DollarSign, FolderKanban, Home, Palette, PlayCircle, SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI, stylesAPI, searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// Marcelo's Cinematic Transition Configs (Extremely smooth, long sweep)
const marceloTransition = { duration: 1.6, ease: [0.16, 1, 0.3, 1] };
const marceloStagger = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};
const marceloItem = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: marceloTransition }
};

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
    gradient: 'linear-gradient(135deg, #24313a 0%, #53656e 100%)',
    palette: ['#172026', '#53656e', '#c8d0d5', '#ffffff'],
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
    gradient: 'linear-gradient(135deg, #5b4034 0%, #8c6a57 100%)',
    palette: ['#2b221d', '#8c6a57', '#d8c5b5', '#faf8f5'],
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
    gradient: 'linear-gradient(135deg, #8a958f 0%, #c7d0ca 100%)',
    palette: ['#334038', '#9aa69e', '#e7ece8', '#ffffff'],
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
    gradient: 'linear-gradient(135deg, #20252a 0%, #5e666d 100%)',
    palette: ['#16191c', '#565d63', '#a4abb1', '#f5f5f3'],
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
    gradient: 'linear-gradient(135deg, #7a5c44 0%, #b6946d 100%)',
    palette: ['#2b2118', '#a1784f', '#d7bc93', '#faf5ef'],
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
    gradient: 'linear-gradient(135deg, #5a6a55 0%, #a58b67 100%)',
    palette: ['#20241e', '#6f7b66', '#a58b67', '#f6f1eb'],
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
    gradient: 'linear-gradient(135deg, #6f8379 0%, #d2b48c 100%)',
    palette: ['#25312b', '#71857a', '#c8a67a', '#faf6f0'],
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
    gradient: 'linear-gradient(135deg, #3b4640 0%, #b3aa98 100%)',
    palette: ['#1e221e', '#5c655d', '#c6bcaa', '#faf9f6'],
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
    const heroTimer = setTimeout(() => setHeroLoaded(true), 100);
    
    return () => clearTimeout(heroTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initial dashboard load should run once on mount.
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

  const fetchData = useCallback(async () => {
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
  }, [logout, navigate]);

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

  // Set scene for atmosphere tinting
  useEffect(() => {
    const prev = document.body.dataset.scene;
    document.body.dataset.scene = 'dashboard';
    return () => {
      if (document.body.dataset.scene === 'dashboard') {
        if (prev) document.body.dataset.scene = prev;
        else delete document.body.dataset.scene;
      }
    };
  }, []);

  return (
    <motion.div 
      className="dashboard"
      initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
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
          <button type="button" className="status-retry-btn" onClick={fetchData}>
            Retry Loading
          </button>
        </div>
      )}
      {actionMessage && (
        <div className={`status-banner ${actionMessage.type === 'success' ? 'status-success' : 'status-error'}`}>
          {actionMessage.text}
        </div>
      )}

      {/* ── Adrien greeting strip (Marcelo type) ────────────────── */}
      <motion.section 
        className="dashboard-greeting" 
        aria-label="Workspace greeting"
        initial="initial"
        animate="animate"
        variants={marceloStagger}
      >
        <div className="greeting-left">
          <motion.p className="greeting-eyebrow" variants={marceloItem}>
            Home4U AI Studio
          </motion.p>
          <motion.h1 className="greeting-heading" variants={marceloItem}>
            Your&nbsp;<em>Design</em><br />Workspace
          </motion.h1>
        </div>
        <motion.div className="greeting-right" variants={marceloItem}>
          <button
            type="button"
            className="cta-primary"
            onClick={() => navigate('/workspace')}
          >
            Upload Room
          </button>
          <button
            type="button"
            className="cta-secondary"
            onClick={() => document.getElementById('styles-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Styles
          </button>
        </motion.div>
      </motion.section>

      {/* ── Stats band — Adrien: immediately visible after greeting ── */}
      <section className="stats-row-section" aria-label="Dashboard statistics">
        <div className="stats-row">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="stats-row-item">
                <span className="stats-row-icon" aria-hidden="true">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <span className="stats-row-label">{stat.label}</span>
                <span className="stats-row-value">{stat.value}</span>
              </article>
            );
          })}
        </div>
      </section>

      <motion.section
        className="recent-projects reveal-on-scroll"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="section-intro">
          <h2>Recent Activity</h2>
        </div>
        {recentProjects.length ? (
          <div className="recent-projects-grid">
            {recentProjects.map((project, idx) => (
              <motion.button
                key={project.id}
                type="button"
                className="recent-project-card"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ ...marceloTransition, delay: idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.4, ease: "backOut" } }}
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
                  <span className="recent-project-chip subtle">Active</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Your studio activity will appear here once you initiate a project.</p>
          </div>
        )}
      </motion.section>


	      <div className="dashboard-grid">
	        <aside className="metrics-rail">
          <div className="metrics-card reveal-on-scroll" style={{ '--delay': '0s' }}>
            <p className="metrics-label">Welcome Back</p>
            <h3 className="metrics-user">{user?.full_name || user?.email || 'Designer'}</h3>
            <p className="metrics-subtle">Keep building spaces your clients will love.</p>
          </div>
        </aside>

	      <div className="dashboard-main">
          <motion.section 
            className="house-tour-section reveal-on-scroll"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={marceloTransition}
          >
            <div className="section-intro">
              <h2>Spatial Walkthrough</h2>
            </div>

            <motion.button
              type="button"
              className={`tour-media-card ${isEnteringTour ? 'entering' : ''}`}
              onClick={startTour}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="tour-media-scrim" aria-hidden="true" />
              <div className="tour-media-play" aria-hidden="true">
                <PlayCircle size={72} strokeWidth={1} />
              </div>
              <div className="tour-media-copy">
                <span className="tour-media-kicker">Showcase House</span>
                <span className="tour-media-title">Immersive Studio Experience</span>
                <span className="tour-media-meta">{tourRooms.length} Curated Environments</span>
              </div>
            </motion.button>

            <div className="tour-preview-mini">
              {tourRooms.map((room, idx) => (
                <motion.span 
                  key={idx} 
                  className="mini-room-dot"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  style={{ background: room.color }}
                  title={room.name}
                >
                  {room.emoji}
                </motion.span>
              ))}
            </div>

            <button type="button" className="tour-immersive-btn" data-magnetic-button onClick={() => navigate('/virtual-tour')}>
              Open Virtual Tour
            </button>
          </motion.section>

	        {/* What We Do - Introduction Section */}
          <motion.section 
            className="search-section reveal-on-scroll" 
            id="search-section"
            initial={{ opacity: 0, scale: 0.98, y: 60 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={marceloTransition}
          >
            <div className="section-intro">
              <h2>Design Studio Explorer</h2>
              <p>Search over 4,000 architectural motifs and curated design signatures.</p>
            </div>

          {/* Search bar */}
          <div className="search-panel">
            <div className="search-row">
              <label className="sr-only" htmlFor="dashboard-style-search">
                Search design styles
              </label>
              <input
                id="dashboard-style-search"
                type="search"
                placeholder="Search styles (e.g., modern, industrial, cozy)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
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
                  <h3>No Results Found</h3>
                  <p>No styles matched "{searchTerm}". Try refining your search terms.</p>
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
            
          </motion.section>

          {/* Explore Design Styles with Hover Preview Cards */}
          <motion.section 
            className="styles-section reveal-on-scroll" 
            id="styles-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
          >
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
                        onClick={() => navigate(`/workspace?style=${styleSlug(initStyle.name)}`)}
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
                    data-parallax-card
                    style={{ '--index': index, '--delay': `${0.05 + index * 0.04}s` }}
                  >
                  {/** resolve per-card emoji with unique fallback */} 
                  {(() => {
                    const resolvedEmoji = resolveStyleEmoji(style, index);
                    const { key: styleKey, previewEmojis, previewFeatures } = resolveStyleElements(style);
                    const palette = Array.isArray(style.palette) && style.palette.length
                      ? style.palette.slice(0, 4)
                      : [
                          style.accent || 'var(--color-action-emerald)',
                          style.accentTwo || 'var(--color-camel-400)',
                          style.base || 'var(--color-primary-slate)',
                          'var(--color-secondary-arctic)',
                        ].slice(0, 4);
                    const materials = Array.isArray(style.materials) && style.materials.length ? style.materials.slice(0, 2) : [];
                    return (
                      <button
                        type="button"
                        className={`style-card-main${styleKey ? ` style-${styleKey}` : ''}`}
                        data-tilt
                        aria-label={`Explore ${style.name} style`}
                        onClick={(e) => handleStyleSelect(style, e.currentTarget)}
                        style={{ 
                          '--card-bg': style.gradient || 'linear-gradient(135deg, #24313a 0%, #53656e 100%)',
                          '--style-accent': style.accent || (style.name === 'Scandinavian' ? '#ffffff' : style.name === 'Industrial' ? '#a58b67' : style.name === 'Bohemian' ? '#53656e' : '#a58b67'),
                          '--style-accent-2': style.accentTwo || (style.name === 'Scandinavian' ? '#a58b67' : style.name === 'Industrial' ? '#1c2328' : style.name === 'Bohemian' ? '#42535b' : '#53656e'),
                          '--style-base': style.base || '#201915'
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
          </motion.section>

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
                  <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close style drawer">✕</button>
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
                          <span className="reason-icon">•</span>
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
                          <span className="reason-icon">•</span>
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
                          <button
                            key={idx}
                            className="dna-chip dna-chip-interactive"
                            type="button"
                            onMouseEnter={() => setHoveredTrait(item)}
                            onMouseLeave={() => setHoveredTrait('')}
                            onFocus={() => setHoveredTrait(item)}
                            onBlur={() => setHoveredTrait('')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setHoveredTrait(item);
                              }
                            }}
                          >
                            <span className="dna-icon">{icon}</span>
                            <span>{item}</span>
                          </button>
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
                type="button"
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-state projects-empty-state zero-state-onboarding"
              >
                <div className="zero-state-grid">
                  <div className="zero-state-header">
                    <motion.div 
                      initial={{ scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="projects-empty-icon" 
                      aria-hidden="true"
                    >
                      <FolderKanban size={32} strokeWidth={1.7} />
                    </motion.div>
                    <p className="zero-state-eyebrow">Project Setup</p>
                    <h3>Start Your First Room Project</h3>
                    <p>Pick a template to prefill your setup, then continue into budget and style planning.</p>
                  </div>

                  <ol className="zero-state-steps" aria-label="Project setup steps">
                    <li className="zero-state-step">
                      <span className="step-index">1</span>
                      <span>Choose room type</span>
                    </li>
                    <li className="zero-state-step">
                      <span className="step-index">2</span>
                      <span>Set your plan</span>
                    </li>
                    <li className="zero-state-step">
                      <span className="step-index">3</span>
                      <span>Open design studio</span>
                    </li>
                  </ol>

                  <div className="zero-state-templates">
                    <motion.button 
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className={`template-card ${newProjectType === 'Living Room' ? 'is-selected' : ''}`}
                      aria-pressed={newProjectType === 'Living Room'}
                      onClick={() => { setNewProjectType('Living Room'); setShowNewProject(true); }}
                    >
                      <div className="template-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1774551351897-c64cd76a7c22?auto=format&fit=crop&q=80&w=600&h=400')" }}></div>
                      <div className="template-copy">
                        <span className="template-name">Living Room</span>
                        <span className="template-meta">Best for social spaces, layout flow, and statement furniture planning.</span>
                      </div>
                    </motion.button>
                    <motion.button 
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className={`template-card ${newProjectType === 'Bedroom' ? 'is-selected' : ''}`}
                      aria-pressed={newProjectType === 'Bedroom'}
                      onClick={() => { setNewProjectType('Bedroom'); setShowNewProject(true); }}
                    >
                      <div className="template-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600')" }}></div>
                      <div className="template-copy">
                        <span className="template-name">Bedroom</span>
                        <span className="template-meta">Best for comfort layering, lighting mood, and restful color systems.</span>
                      </div>
                    </motion.button>
                  </div>

                  <div className="zero-state-actions">
                    <motion.button 
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="new-project-btn cta-primary" 
                      onClick={() => setShowNewProject(true)}
                    >
                      {newProjectType ? `Continue with ${newProjectType}` : 'Create Custom Project'}
                    </motion.button>
                    <p className="zero-state-note">You can refine room details, budget, and style before launch.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="projects-grid">
                <AnimatePresence>
                  {projects.map((project, index) => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="project-card"
                    >
                      <div className="project-card-header">
                        <h3>{project.room_type}</h3>
                        <span className="status-badge">Live</span>
                      </div>
                      <div className="project-meta">
                        <p><strong>Investment:</strong> ${project.budget ? Number(project.budget).toLocaleString() : 0}</p>
                        <p><strong>Initiated:</strong> {new Date(project.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="project-actions">
                        <button type="button" className="open-btn" onClick={() => navigate(`/project/${project.id}`)}>
                          Open Studio
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                          className="delete-btn ghost-danger"
                          disabled={deletingProjectId === project.id}
                        >
                          {deletingProjectId === project.id ? 'Removing...' : 'Archive'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
      </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 Home4U - Interior Design Assistant</p>
      </footer>
      </div>
    </motion.div>
  );
};

export default Dashboard;

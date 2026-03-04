import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VirtualTour3D.css';

const storyRooms = [
  {
    id: 'atrium',
    name: 'Bedroom Studio',
    title: 'Scan Your Bedroom, Get A Style Plan',
    emoji: '🏛️',
    icon: 'bed',
    promise: 'Point your camera at your bedroom and instantly receive style directions tailored to your layout.',
    proof: 'Room scanning captures structure and lighting so recommendations are grounded in your real space.',
    problem: 'Most bedroom makeovers start with random inspiration and no fit for the actual room.',
    method: 'We scan dimensions and surfaces, then generate matched design themes and furniture placement ideas.',
    nextStep: 'Scan your bedroom and save your first recommended style board.',
    metric: { label: 'Client Clarity', before: 42, after: 89, suffix: '%' },
    cta: 'Scan Bedroom',
    accent: '#a855f7',
    toneA: '#2b1d46',
    toneB: '#171028',
    glow: 'rgba(168, 85, 247, 0.16)',
    plan: { x: 22, y: 28, w: 20, h: 16 },
    scene: [
      { id: 'a-1', kind: 'panel', x: '22%', y: '42%', z: 42, r: -6, s: 1.1, px: 10, py: 7, w: 86, h: 46 },
      { id: 'a-2', kind: 'table', x: '55%', y: '64%', z: 18, r: 4, s: 1.02, px: 6, py: 4, w: 84, h: 18 },
      { id: 'a-3', kind: 'fixture', x: '80%', y: '38%', z: 22, r: 5, s: 0.96, px: 5, py: 4, w: 24, h: 34 },
    ],
  },
  {
    id: 'pain',
    name: 'Living Room Explorer',
    title: 'Scroll Through AI Ideas In Your Living Room',
    emoji: '⚠️',
    icon: 'sofa',
    promise: 'After scanning, you can browse living room concepts and compare layout directions instantly.',
    proof: 'A swipeable feed previews furniture, color palettes, and mood options over your scanned room.',
    problem: 'Users usually waste time jumping between apps and screenshots to compare living room ideas.',
    method: 'We keep everything in one room feed so you can test and shortlist directions quickly.',
    nextStep: 'Open your living room feed and shortlist your top three concepts.',
    metric: { label: 'Project Delay Risk', before: 61, after: 18, suffix: '%' },
    cta: 'Open Idea Feed',
    accent: '#9333ea',
    toneA: '#2a153f',
    toneB: '#140c24',
    glow: 'rgba(147, 51, 234, 0.14)',
    plan: { x: 48, y: 28, w: 20, h: 16 },
    scene: [
      { id: 'p-1', kind: 'panel', x: '24%', y: '38%', z: 44, r: -7, s: 1.08, px: 11, py: 7, w: 92, h: 44 },
      { id: 'p-2', kind: 'fixture', x: '53%', y: '24%', z: 20, r: 0, s: 0.95, px: 5, py: 5, w: 18, h: 42 },
      { id: 'p-3', kind: 'table', x: '79%', y: '61%', z: 18, r: 6, s: 1.0, px: 6, py: 4, w: 80, h: 16 },
    ],
  },
  {
    id: 'solution',
    name: 'Kitchen Planner',
    title: 'Plan Kitchen Upgrades With Smart Suggestions',
    emoji: '🧠',
    icon: 'kitchen',
    promise: 'Scan your kitchen to receive layout-friendly upgrade options based on circulation and storage.',
    proof: 'Recommendations align with cabinet zones, work triangle flow, and your selected style preferences.',
    problem: 'Kitchen ideas often look great online but fail when applied to real dimensions.',
    method: 'The app maps key zones and proposes upgrades that match function, style, and budget intent.',
    nextStep: 'Generate a kitchen concept set and compare functionality scores.',
    metric: { label: 'Revision Rounds', before: 7, after: 3, suffix: ' rounds' },
    cta: 'Generate Kitchen Plan',
    accent: '#7e22ce',
    toneA: '#27173a',
    toneB: '#130b22',
    glow: 'rgba(126, 34, 206, 0.14)',
    plan: { x: 74, y: 28, w: 20, h: 16 },
    scene: [
      { id: 's-1', kind: 'panel', x: '20%', y: '40%', z: 42, r: -6, s: 1.08, px: 10, py: 6, w: 88, h: 44 },
      { id: 's-2', kind: 'table', x: '54%', y: '63%', z: 18, r: 3, s: 1.04, px: 7, py: 4, w: 84, h: 18 },
      { id: 's-3', kind: 'fixture', x: '79%', y: '35%', z: 20, r: 6, s: 0.96, px: 6, py: 5, w: 24, h: 28 },
    ],
  },
  {
    id: 'transform',
    name: 'Bathroom Refresh',
    title: 'Preview Bathroom Before/After Instantly',
    emoji: '🖼️',
    icon: 'bath',
    promise: 'Use live before/after previews to evaluate tile, vanity, lighting, and fixture upgrades.',
    proof: 'Overlay comparisons show exactly how selected materials change your current bathroom.',
    problem: 'Bathroom choices are hard to approve when changes are only described, not visualized.',
    method: 'We render side-by-side comparisons so decisions are based on visible impact.',
    nextStep: 'Adjust the before/after slider and save your preferred bathroom concept.',
    metric: { label: 'Design Confidence', before: 48, after: 93, suffix: '%' },
    cta: 'Open Before/After',
    accent: '#c084fc',
    toneA: '#32214f',
    toneB: '#17122a',
    glow: 'rgba(192, 132, 252, 0.16)',
    plan: { x: 22, y: 55, w: 20, h: 16 },
    scene: [
      { id: 't-1', kind: 'panel', x: '25%', y: '39%', z: 44, r: -5, s: 1.1, px: 10, py: 7, w: 92, h: 48 },
      { id: 't-2', kind: 'fixture', x: '54%', y: '25%', z: 20, r: 0, s: 0.95, px: 5, py: 5, w: 18, h: 42 },
      { id: 't-3', kind: 'table', x: '79%', y: '61%', z: 18, r: 5, s: 1.02, px: 6, py: 4, w: 84, h: 16 },
    ],
  },
  {
    id: 'proof',
    name: 'Home Office Setup',
    title: 'Build A Productive Home Office Layout',
    emoji: '📈',
    icon: 'desk',
    promise: 'Design your office with productivity-first suggestions based on space and workflow.',
    proof: 'Desk placement, lighting angle, and storage recommendations are tuned to your room scan.',
    problem: 'Home office ideas often ignore real work habits and end up looking good but functioning poorly.',
    method: 'We pair visual style with usability metrics to improve focus and comfort.',
    nextStep: 'Review office layout options and select your productivity-ready setup.',
    metric: { label: 'Sign-off Speed', before: 11, after: 4, suffix: ' days' },
    cta: 'Review Office Setup',
    accent: '#a78bfa',
    toneA: '#2f2148',
    toneB: '#17112a',
    glow: 'rgba(167, 139, 250, 0.14)',
    plan: { x: 48, y: 55, w: 20, h: 16 },
    scene: [
      { id: 'r-1', kind: 'panel', x: '23%', y: '38%', z: 42, r: -4, s: 1.06, px: 10, py: 6, w: 90, h: 42 },
      { id: 'r-2', kind: 'table', x: '57%', y: '62%', z: 18, r: 4, s: 1.03, px: 6, py: 4, w: 86, h: 16 },
      { id: 'r-3', kind: 'fixture', x: '80%', y: '38%', z: 20, r: 6, s: 0.95, px: 5, py: 4, w: 24, h: 26 },
    ],
  },
  {
    id: 'action',
    name: 'Whole Home Plan',
    title: 'Connect Every Room Into One Home Style Plan',
    emoji: '🚀',
    icon: 'home',
    promise: 'Unify bedroom, living room, kitchen, bathroom, and office ideas into one cohesive plan.',
    proof: 'The app compiles saved concepts into a full-home style roadmap with phased actions.',
    problem: 'Even good room designs can clash when there is no whole-home direction.',
    method: 'We stitch room-level decisions into a single visual and execution plan.',
    nextStep: 'Book a consultation to finalize your complete home transformation roadmap.',
    metric: { label: 'Launch Readiness', before: 36, after: 95, suffix: '%' },
    cta: 'Book Whole-Home Consult',
    accent: '#8b5cf6',
    toneA: '#2b1b41',
    toneB: '#130d22',
    glow: 'rgba(139, 92, 246, 0.14)',
    plan: { x: 74, y: 55, w: 20, h: 16 },
    scene: [
      { id: 'c-1', kind: 'panel', x: '24%', y: '38%', z: 44, r: -5, s: 1.08, px: 10, py: 7, w: 92, h: 44 },
      { id: 'c-2', kind: 'fixture', x: '54%', y: '24%', z: 20, r: 0, s: 0.95, px: 5, py: 5, w: 18, h: 42 },
      { id: 'c-3', kind: 'table', x: '80%', y: '62%', z: 18, r: 5, s: 1.0, px: 6, py: 4, w: 84, h: 16 },
    ],
  },
];

const themePresets = {
  story: { bgA: '#08060f', bgB: '#181127', panel: '#141022' },
  minimal: { bgA: '#0a0a0c', bgB: '#151520', panel: '#13131a' },
  editorial: { bgA: '#0b0612', bgB: '#241236', panel: '#1b1028' },
};

const materialPresets = {
  walnut: { floor: '#3a274f', wall: '#2a1c42', roof: '#8b5cf6' },
  stone: { floor: '#44465a', wall: '#303244', roof: '#8a6fb2' },
  soft: { floor: '#51445d', wall: '#3d3350', roof: '#a879ff' },
};

const storyHotspots = {
  atrium: [
    { id: 'atr-1', title: 'Bed + Wall Scan', description: 'Scan the bed wall and floor area to generate realistic layout-safe bedroom styles.', x: 24, y: 30 },
    { id: 'atr-2', title: 'Style Match Results', description: 'The app returns curated bedroom themes based on your room size, light, and existing furniture.', x: 70, y: 42 },
  ],
  pain: [
    { id: 'pain-1', title: 'Scroll Idea Feed', description: 'Swipe through AI-generated living room layouts and compare mood, comfort, and style direction.', x: 30, y: 35 },
    { id: 'pain-2', title: 'Save + Compare', description: 'Pin your favorite options and compare them side-by-side before committing.', x: 66, y: 50 },
  ],
  solution: [
    { id: 'sol-1', title: 'Kitchen Zone Mapping', description: 'The scan maps prep, cook, and storage zones to guide practical kitchen upgrades.', x: 28, y: 48 },
    { id: 'sol-2', title: 'Smart Upgrade Picks', description: 'See cabinet, countertop, and lighting suggestions ranked by fit and impact.', x: 68, y: 30 },
  ],
  transform: [
    { id: 'tr-1', title: 'Before/After Overlay', description: 'Drag the slider to reveal how your bathroom changes with each selected finish package.', x: 36, y: 36 },
    { id: 'tr-2', title: 'Material Confidence', description: 'Review texture and color combinations in-context before you finalize selections.', x: 74, y: 56 },
  ],
  proof: [
    { id: 'pr-1', title: 'Workflow Fit', description: 'The office planner aligns desk orientation and lighting with your daily work pattern.', x: 36, y: 36 },
    { id: 'pr-2', title: 'Comfort + Focus Score', description: 'Each layout includes focus and ergonomics scoring so style also performs.', x: 74, y: 56 },
  ],
  action: [
    { id: 'ac-1', title: 'Whole-Home Sync', description: 'Combine saved room concepts into one cohesive style system for your home.', x: 36, y: 36 },
    { id: 'ac-2', title: 'Consultation Launch', description: 'Book your session to convert app-selected ideas into a final action-ready plan.', x: 74, y: 56 },
  ],
};

const blueprintNodeLabels = {
  atrium: 'Bedroom',
  pain: 'Living Room',
  solution: 'Kitchen',
  transform: 'Bathroom',
  proof: 'Office',
  action: 'Whole Home',
};

const RoomIcon = ({ name, className = '' }) => {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (name) {
    case 'bed':
      return (
        <svg className={className} {...common} aria-hidden="true">
          <rect x="3" y="11" width="18" height="7" rx="2" />
          <path d="M3 14h18M6 11V8.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 12 8.5V11M12 11V9.2A1.2 1.2 0 0 1 13.2 8h2.6A1.2 1.2 0 0 1 17 9.2V11" />
        </svg>
      );
    case 'sofa':
      return (
        <svg className={className} {...common} aria-hidden="true">
          <rect x="4" y="10" width="16" height="7" rx="2" />
          <path d="M6 10V8.7A1.7 1.7 0 0 1 7.7 7h2.6A1.7 1.7 0 0 1 12 8.7V10m0 0V8.7A1.7 1.7 0 0 1 13.7 7h2.6A1.7 1.7 0 0 1 18 8.7V10M5 17v2m14-2v2" />
        </svg>
      );
    case 'kitchen':
      return (
        <svg className={className} {...common} aria-hidden="true">
          <rect x="3.5" y="6" width="7.5" height="12" rx="1.5" />
          <rect x="13" y="9" width="7.5" height="9" rx="1.5" />
          <path d="M3.5 12h7.5m13-3h-4m0 0V6m0 3v9" />
        </svg>
      );
    case 'bath':
      return (
        <svg className={className} {...common} aria-hidden="true">
          <path d="M4 12h16v2.2A3.8 3.8 0 0 1 16.2 18H7.8A3.8 3.8 0 0 1 4 14.2V12Z" />
          <path d="M7 12V9.8a2.8 2.8 0 0 1 2.8-2.8h1.4A2.8 2.8 0 0 1 14 9.8V12m-7 6v1m10-1v1" />
        </svg>
      );
    case 'desk':
      return (
        <svg className={className} {...common} aria-hidden="true">
          <rect x="6" y="4.5" width="12" height="8.5" rx="1.5" />
          <path d="M9 18V13m6 5V13M4 18h16M10.5 8.7h3" />
        </svg>
      );
    case 'home':
      return (
        <svg className={className} {...common} aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-5.4v-6h-3.2v6H5a1 1 0 0 1-1-1v-8.5Z" />
        </svg>
      );
    default:
      return null;
  }
};

const renderRoomIllustration = (roomId) => {
  const baseScene = (content, figureClass, figureExtras = null) => (
    <svg className={`room-scene scene-${roomId}`} viewBox="0 0 640 360" aria-hidden="true">
      <rect x="86" y="72" width="468" height="228" rx="20" className="scene-shell" />
      <g className="scene-world">
        <polygon points="118,104 522,104 548,126 94,126" className="scene-ceiling" />
        <polygon points="94,126 118,104 118,262 94,286" className="scene-left-wall" />
        <polygon points="522,104 548,126 548,286 522,262" className="scene-right-wall" />
        <polygon points="118,262 522,262 548,286 94,286" className="scene-floor" />
        <rect x="118" y="104" width="404" height="158" rx="10" className="scene-backdrop" />
        <rect x="128" y="112" width="384" height="142" rx="9" className="scene-stage" />
        <path d="M144 132h352M144 148h352" className="scene-soft-lines" />
        <line x1="128" y1="246" x2="512" y2="246" className="scene-floor-line" />
        {content}
        <g className={`scene-figure ${figureClass || ''}`}>
          <circle cx="478" cy="178" r="13" className="scene-person-head" />
          <rect x="468" y="192" width="20" height="34" rx="8" className="scene-person-body" />
          <rect x="465" y="198" width="6" height="17" rx="3" className="scene-arm-left" />
          <rect x="485" y="198" width="6" height="17" rx="3" className="scene-arm-right" />
          <rect x="471" y="224" width="6" height="15" rx="3" className="scene-leg-left" />
          <rect x="481" y="224" width="6" height="15" rx="3" className="scene-leg-right" />
          <g className="scene-handset">
            <rect x="456" y="202" width="10" height="16" rx="3" className="scene-phone" />
            <circle cx="462" cy="210" r="1.7" className="scene-phone-dot" />
          </g>
          {figureExtras}
        </g>
      </g>
    </svg>
  );

  switch (roomId) {
    case 'atrium':
      return baseScene(
        <>
          <rect x="220" y="120" width="200" height="90" rx="10" className="scene-scan-frame" />
          <rect x="194" y="202" width="252" height="34" rx="10" className="scene-card scene-main" />
          <rect x="212" y="178" width="92" height="24" rx="8" className="scene-card scene-soft" />
          <rect x="336" y="178" width="92" height="24" rx="8" className="scene-card scene-soft" />
          <rect x="454" y="128" width="34" height="98" rx="16" className="scene-accent" />
        </>,
        'scene-figure-scan',
        <>
          <circle cx="452" cy="188" r="3.5" className="scene-camera-flash" />
          <line x1="446" y1="176" x2="424" y2="160" className="scene-scan-ray" />
        </>,
      );
    case 'pain':
      return baseScene(
        <>
          <rect x="176" y="192" width="290" height="42" rx="14" className="scene-card scene-main" />
          <rect x="206" y="164" width="90" height="24" rx="8" className="scene-card scene-soft" />
          <rect x="344" y="164" width="90" height="24" rx="8" className="scene-card scene-soft" />
          <ellipse cx="322" cy="262" rx="138" ry="16" className="scene-rug" />
        </>,
        'scene-figure-scroll',
        <>
          <rect x="451" y="204" width="2" height="12" rx="1" className="scene-scroll-indicator" />
          <path d="M446 208c5-2 9-1 13 2" className="scene-scroll-swipe" />
        </>,
      );
    case 'solution':
      return baseScene(
        <>
          <rect x="232" y="188" width="176" height="44" rx="10" className="scene-card scene-main" />
          <rect x="188" y="224" width="36" height="28" rx="7" className="scene-card scene-soft" />
          <rect x="416" y="224" width="36" height="28" rx="7" className="scene-card scene-soft" />
          <rect x="152" y="138" width="72" height="66" rx="8" className="scene-accent" />
          <rect x="238" y="142" width="164" height="34" rx="7" className="scene-screen" />
        </>,
        'scene-figure-place',
        <>
          <rect x="436" y="230" width="18" height="10" rx="3" className="scene-setdown-item" />
          <rect x="420" y="234" width="36" height="4" rx="2" className="scene-setdown-surface" />
        </>,
      );
    case 'transform':
      return baseScene(
        <>
          <rect x="236" y="198" width="168" height="36" rx="10" className="scene-card scene-main" />
          <ellipse cx="320" cy="146" rx="72" ry="38" className="scene-mirror" />
          <rect x="148" y="198" width="82" height="34" rx="17" className="scene-card scene-soft" />
          <rect x="438" y="138" width="48" height="78" rx="8" className="scene-accent" />
          <path d="M284 132c22-16 52-16 74 0" className="scene-soft-lines" />
        </>,
        'scene-figure-box',
        <>
          <rect x="442" y="220" width="20" height="14" rx="2" className="scene-box-body" />
          <path d="M442 220h20l-4-5h-12Z" className="scene-box-lid" />
        </>,
      );
    case 'proof':
      return baseScene(
        <>
          <rect x="212" y="196" width="216" height="34" rx="8" className="scene-card scene-main" />
          <rect x="270" y="156" width="100" height="34" rx="7" className="scene-screen" />
          <rect x="290" y="232" width="60" height="20" rx="10" className="scene-card scene-soft" />
          <rect x="450" y="126" width="64" height="78" rx="8" className="scene-accent" />
        </>,
        'scene-figure-sit',
        <g className="scene-thought">
          <circle cx="496" cy="163" r="3" />
          <circle cx="503" cy="154" r="4.5" />
          <circle cx="513" cy="146" r="6" />
        </g>,
      );
    case 'action':
      return baseScene(
        <>
          <rect x="214" y="136" width="212" height="108" rx="10" className="scene-map" />
          <circle cx="270" cy="176" r="10" className="scene-node scene-node-a" />
          <circle cx="334" cy="210" r="10" className="scene-node scene-node-b" />
          <circle cx="392" cy="168" r="10" className="scene-node scene-node-c" />
          <path d="M270 176 334 210 392 168" className="scene-link" />
        </>,
        'scene-figure-present',
        <>
          <path d="M460 206c16-6 30-14 38-24" className="scene-present-line" />
        </>,
      );
    default:
      return null;
  }
};

const VirtualTour3D = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('outside');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [visitedHotspots, setVisitedHotspots] = useState({});
  const [focusCue, setFocusCue] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [smoothTilt, setSmoothTilt] = useState({ x: 0, y: 0 });
  const [nudge, setNudge] = useState({ x: 0, y: 0 });
  const [doorZooming, setDoorZooming] = useState(false);
  const [roomZooming, setRoomZooming] = useState(false);
  const [phaseTransitioning, setPhaseTransitioning] = useState(false);
  const [blueprintEntered, setBlueprintEntered] = useState(false);
  const [blueprintMounted, setBlueprintMounted] = useState(false);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [pathTarget, setPathTarget] = useState({ x: 50, y: 50 });
  const [blueprintIntroTick, setBlueprintIntroTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [storyProgress, setStoryProgress] = useState(52);
  const [themeMode, setThemeMode] = useState('story');
  const [materialMode, setMaterialMode] = useState('walnut');
  const [narrativeEnabled, setNarrativeEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientMotion, setAmbientMotion] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [transformSweepTick, setTransformSweepTick] = useState(0);
  const [visitedRooms, setVisitedRooms] = useState(() => new Set());
  const [showProControls, setShowProControls] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    date: '',
    notes: '',
  });
  const [introPassed, setIntroPassed] = useState(false);
  const [introRevealing, setIntroRevealing] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const tiltStartRef = useRef({ x: 0, y: 0 });
  const audioCtxRef = useRef(null);
  const introAudioTimersRef = useRef([]);
  const detailScrollRef = useRef(null);
  const detailBodyRef = useRef(null);
  const introTimerRef = useRef(null);
  const detailScrollYRef = useRef(0);
  const detailRafRef = useRef(null);

  const activeRoom = storyRooms[activeIndex];
  const hotspots = storyHotspots[activeRoom.id] || [];
  const selectedHotspot = hotspots.find((spot) => spot.id === selectedHotspotId) || null;
  const visitedCount = visitedHotspots[activeRoom.id]?.size || 0;
  const roomComplete = hotspots.length > 0 && visitedCount === hotspots.length;
  const phaseSteps = ['outside', 'blueprint', 'room'];
  const currentPhaseStep = phaseSteps.indexOf(phase);
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 6 + ((i * 13) % 88),
        y: 8 + ((i * 17) % 82),
        d: 4 + (i % 5),
      })),
    [],
  );

  const chamberTransform = useMemo(() => {
    const rotateX = (-6 + smoothTilt.y * 8 + nudge.y).toFixed(2);
    const rotateY = (14 + smoothTilt.x * 14 + nudge.x).toFixed(2);
    const dolly = (10 + Math.abs(smoothTilt.x) * 5 + Math.abs(smoothTilt.y) * 4).toFixed(2);
    return `translateZ(${dolly}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, [smoothTilt, nudge]);

  const pathMetrics = useMemo(() => {
    const dx = pathTarget.x - 50;
    const dy = pathTarget.y - 50;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { length, angle };
  }, [pathTarget]);

  const narrativeLine = useMemo(() => {
    if (!narrativeEnabled) return null;
    if (phase === 'outside') return 'Narration: Begin at the front door to start a guided story of transformation.';
    if (phase === 'blueprint') return 'Narration: Choose the chapter you want to explore in our project journey.';
    return `Narration: ${activeRoom.promise}`;
  }, [phase, activeRoom.promise, narrativeEnabled]);

  const revealEvidence = activeRoom.id !== 'atrium';
  const revealOutcome = ['transform', 'proof', 'action'].includes(activeRoom.id);
  const revealDeepControls = ['solution', 'transform', 'proof', 'action'].includes(activeRoom.id);

  const storyMetric = useMemo(() => {
    const m = activeRoom.metric;
    const progress = storyProgress / 100;
    return Math.round(m.before + (m.after - m.before) * progress);
  }, [activeRoom.metric, storyProgress]);

  const achievements = useMemo(() => {
    const roomCount = visitedRooms.size;
    const hotspotCount = Object.values(visitedHotspots).reduce((sum, set) => sum + set.size, 0);
    return [
      { id: 'door', label: 'Tour Started', unlocked: phase !== 'outside' },
      { id: 'chapters', label: '3 Chapters Explored', unlocked: roomCount >= 3 },
      { id: 'story', label: 'Full Story Complete', unlocked: roomCount >= storyRooms.length },
      { id: 'insights', label: '6 Insights Viewed', unlocked: hotspotCount >= 6 },
    ];
  }, [phase, visitedRooms, visitedHotspots]);

  const playUiTone = (frequency = 420, duration = 0.06) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  useEffect(() => {
    if (phase === 'blueprint') {
      setBlueprintEntered(true);
    } else {
      setBlueprintEntered(false);
    }
  }, [phase]);

  useEffect(() => {
    setBlueprintMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (phase === 'room') {
          setPhase('blueprint');
          setSelectedHotspotId(null);
          return;
        }
        if (phase === 'blueprint') {
          setPhase('outside');
          return;
        }
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, navigate]);

  useEffect(() => {
    setSelectedHotspotId(null);
  }, [activeIndex, phase]);

  useEffect(() => {
    if (phase !== 'room') return;
    detailScrollYRef.current = 0;
    setIntroPassed(false);
    setIntroRevealing(true);
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
      detailScrollRef.current.style.setProperty('--scroll-y', '0');
    }
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    introTimerRef.current = setTimeout(() => {
      setIntroRevealing(false);
      introTimerRef.current = null;
    }, 520);
  }, [activeIndex, phase]);

  useEffect(() => {
    if (!showBookingModal) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowBookingModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showBookingModal]);

  useEffect(() => () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    if (detailRafRef.current) cancelAnimationFrame(detailRafRef.current);
  }, []);

  useEffect(() => {
    if (!(phase === 'room' && introRevealing)) return;
    if (!soundEnabled) return;
    playUiTone(280, 0.1);
    const t1 = setTimeout(() => playUiTone(360, 0.08), 170);
    const t2 = setTimeout(() => playUiTone(460, 0.08), 330);
    introAudioTimersRef.current = [t1, t2];
    return () => {
      introAudioTimersRef.current.forEach((timer) => clearTimeout(timer));
      introAudioTimersRef.current = [];
    };
  }, [phase, introRevealing, soundEnabled]);

  useEffect(() => {
    let frameId;
    const tick = () => {
      setSmoothTilt((prev) => ({
        x: prev.x + (tilt.x - prev.x) * 0.18,
        y: prev.y + (tilt.y - prev.y) * 0.18,
      }));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [tilt]);

  const enterHouse = () => {
    if (doorZooming) return;
    setPhaseTransitioning(true);
    playUiTone(360, 0.09);
    setDoorZooming(true);
    setTimeout(() => {
      setPhase('blueprint');
      setBlueprintIntroTick((prev) => prev + 1);
      setDoorZooming(false);
      setPhaseTransitioning(false);
    }, 620);
  };

  const openRoomFromBlueprint = (index) => {
    setPhaseTransitioning(true);
    playUiTone(520, 0.07);
    const plan = storyRooms[index].plan;
    setPathTarget({ x: plan.x + plan.w / 2, y: plan.y + plan.h / 2 });
    setRoomZooming(true);
    setTimeout(() => {
      setActiveIndex(index);
      setPhase('room');
      setVisitedRooms((prev) => new Set(prev).add(storyRooms[index].id));
      setRoomZooming(false);
      setPhaseTransitioning(false);
    }, 420);
  };

  const onPointerDown = (event) => {
    if (phase !== 'room') return;
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    tiltStartRef.current = { ...tilt };
  };

  const onPointerMove = (event) => {
    if (phase !== 'room') return;
    if (!isDragging) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ x, y });
      return;
    }
    const deltaX = (event.clientX - dragStartRef.current.x) / 180;
    const deltaY = (event.clientY - dragStartRef.current.y) / 180;
    setTilt({
      x: Math.max(-1.1, Math.min(1.1, tiltStartRef.current.x + deltaX)),
      y: Math.max(-1.1, Math.min(1.1, tiltStartRef.current.y + deltaY)),
    });
  };

  const onPointerUp = () => setIsDragging(false);

  const openHotspot = (hotspotId) => {
    playUiTone(660, 0.05);
    setSelectedHotspotId(hotspotId);
    setFocusCue((prev) => prev + 1);
    setVisitedHotspots((prev) => {
      const roomSet = new Set(prev[activeRoom.id] || []);
      roomSet.add(hotspotId);
      return { ...prev, [activeRoom.id]: roomSet };
    });
    setNudge({ x: 2.8, y: -1.4 });
    setTimeout(() => setNudge({ x: 0, y: 0 }), 240);
  };

  const onDetailScroll = (event) => {
    if (introRevealing) {
      event.currentTarget.scrollTop = 0;
      return;
    }
    const nextY = event.currentTarget.scrollTop || 0;
    detailScrollYRef.current = nextY;
    if (!detailRafRef.current) {
      detailRafRef.current = requestAnimationFrame(() => {
        if (detailScrollRef.current) {
          detailScrollRef.current.style.setProperty('--scroll-y', String(detailScrollYRef.current));
        }
        detailRafRef.current = null;
      });
    }
    setIntroPassed(nextY > 140);
  };

  const jumpToDetails = () => {
    if (introRevealing) return;
    if (!detailBodyRef.current) return;
    detailBodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRoomCta = () => {
    switch (activeRoom.id) {
      case 'atrium':
        setPhase('blueprint');
        break;
      case 'pain':
        setActiveIndex(2);
        break;
      case 'solution':
        setShowProControls(true);
        break;
      case 'transform':
        setStoryProgress(100);
        break;
      case 'proof':
        setStoryProgress(100);
        if (hotspots[0]) openHotspot(hotspots[0].id);
        break;
      case 'action':
        setBookingSubmitted(false);
        setShowBookingModal(true);
        break;
      default:
        setPhase('blueprint');
    }
  };

  const handleGeneratePlan = () => {
    if (isGeneratingPlan) return;
    setIsGeneratingPlan(true);
    setTransformSweepTick(0);
    setTimeout(() => {
      setIsGeneratingPlan(false);
      setTransformSweepTick((t) => t + 1);
    }, 1100);
  };

  const onBookingInput = (event) => {
    const { name, value } = event.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = (event) => {
    event.preventDefault();
    setBookingSubmitted(true);
  };

  return (
    <div
      className="virtual-tour-page"
      style={{
        '--room-accent-global': activeRoom.accent,
        '--room-tone-a': activeRoom.toneA,
        '--room-tone-b': activeRoom.toneB,
        '--room-glow': activeRoom.glow,
        '--theme-bg-a': themePresets[themeMode].bgA,
        '--theme-bg-b': themePresets[themeMode].bgB,
        '--theme-panel': themePresets[themeMode].panel,
        '--mat-floor': materialPresets[materialMode].floor,
        '--mat-wall': materialPresets[materialMode].wall,
        '--mat-roof': materialPresets[materialMode].roof,
      }}
    >
      <header className="virtual-tour-header">
        <button type="button" className="virtual-back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Story Home Tour</h1>
      </header>

      <main className={`virtual-tour-layout ${phase === 'room' ? 'phase-room-layout' : ''}`}>
        <section
          className={`virtual-stage phase-${phase} ${doorZooming ? 'door-zoom' : ''} ${roomZooming ? 'room-zoom' : ''} ${phaseTransitioning ? 'phase-transitioning' : ''} ${ambientMotion ? 'ambient-on' : ''} ${phase === 'room' && introRevealing ? 'intro-cam-active' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="virtual-grid" />
          <div className="stage-progress">
            {phaseSteps.map((step, index) => (
              <div key={step} className={`stage-step ${index <= currentPhaseStep ? 'active' : ''} ${index === currentPhaseStep ? 'current' : ''}`}>
                <span className="stage-dot">{index + 1}</span>
                <span className="stage-label">{step}</span>
              </div>
            ))}
          </div>
          <div className="stage-progress-track">
            <span className="stage-progress-fill" style={{ width: `${(currentPhaseStep / (phaseSteps.length - 1)) * 100}%` }} />
          </div>
          <div className="phase-transition-veil" />
          <div className="cinema-vignette" />
          <div className="virtual-particles" aria-hidden="true">
            {particles.map((p) => (
              <span key={p.id} className="particle-dot" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDuration: `${p.d}s` }} />
            ))}
          </div>

          <div className="outside-layer">
            <div className="outside-shell">
              <div className="house-structure">
                <div className="house-floor" />
                <div className="house-wall house-wall-back" />
                <div className="house-wall house-wall-left" />
                <div className="house-wall house-wall-right" />
                <div className="house-roof" />
                <div className="house-window house-window-a" />
                <div className="house-window house-window-b" />
                <button type="button" className="house-door-btn" onClick={enterHouse}>
                  Enter Story Home
                </button>
              </div>
            </div>
          </div>

          <div className={`blueprint-layer${blueprintMounted ? ' is-entered' : ''}`}>
            <div className="blueprint-shell-wrap">
              <div
                key={blueprintIntroTick}
                className={`blueprint-shell ${blueprintEntered ? 'is-entered' : ''} ${hoveredRoomId ? 'room-hovering' : ''}`}
                data-hovered-room={hoveredRoomId || ''}
              >
                <header className="blueprint-head">
                  <p className="blueprint-kicker">Phase 2 · Structure</p>
                  <h3>Home4U Story Blueprint</h3>
                  <p className="blueprint-subtitle">Pick a room to dive into its story — tailored to your space.</p>
                </header>

                <div className="blueprint-body">
                  <div className="blueprint-mini-card">
                    <svg className="mini-plan" viewBox="0 0 100 100" aria-hidden="true">
                      <rect x="8" y="8" width="84" height="84" className="bp-outer" />
                      <line x1="8" y1="52" x2="46" y2="52" className="bp-inner" />
                      <line x1="46" y1="8" x2="46" y2="52" className="bp-inner" />
                      <line x1="54" y1="8" x2="92" y2="8" className="bp-inner" />
                      <line x1="54" y1="8" x2="54" y2="48" className="bp-inner" />
                      <line x1="54" y1="48" x2="92" y2="48" className="bp-inner" />
                      <line x1="8" y1="60" x2="44" y2="60" className="bp-inner" />
                      <line x1="44" y1="60" x2="44" y2="92" className="bp-inner" />
                      <line x1="52" y1="60" x2="92" y2="60" className="bp-inner" />
                      <line x1="52" y1="60" x2="52" y2="92" className="bp-inner" />
                      <path d="M46 28 A8 8 0 0 1 38 36" className="bp-door" />
                      <path d="M54 28 A8 8 0 0 0 62 36" className="bp-door" />
                      <path d="M44 70 A8 8 0 0 0 52 78" className="bp-door" />
                    </svg>
                  </div>

                  <div className="blueprint-grid">
                    {storyRooms.map((room, index) => (
                      <button
                        key={room.id}
                        type="button"
                        className={`blueprint-room-node ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => openRoomFromBlueprint(index)}
                        style={{ transitionDelay: blueprintMounted ? `${index * 80}ms` : '0ms' }}
                        onMouseEnter={() => setHoveredRoomId(room.id)}
                        onMouseLeave={() => setHoveredRoomId(null)}
                      >
                        <span className="bp-node-main">
                          <span className="bp-node-name blueprint-room-node__label">{blueprintNodeLabels[room.id] || room.name}</span>
                          <span className="bp-node-meta">{room.title}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="room-layer">
            {hotspots.map((spot) => (
              <button
                type="button"
                key={spot.id}
                className={`virtual-hotspot ${selectedHotspotId === spot.id ? 'active' : ''}`}
                onClick={() => openHotspot(spot.id)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-label={spot.title}
              >
                <span className="virtual-hotspot-pulse" />
                <span className="virtual-hotspot-core" />
                <span className="virtual-hotspot-tag">{spot.title}</span>
              </button>
            ))}
            <div className={`room-shell room-shell-${activeRoom.id}`} style={{ transform: chamberTransform }}>
              <div className="room-depth-atmo" style={{ '--atmo-x': `${(smoothTilt.x * 14).toFixed(2)}px`, '--atmo-y': `${(smoothTilt.y * 10).toFixed(2)}px` }} />
              <div className="room-depth-shadow" />
              <div className="room-depth-foreground" />
              <div className="room-architect-lines" aria-hidden="true">
                <span className="arch-line arch-top" />
                <span className="arch-line arch-bottom" />
                <span className="arch-line arch-left" />
                <span className="arch-line arch-right" />
              </div>
              <div className="room-focal-ring" aria-hidden="true" />
              <div className="house-structure">
                <div className="house-floor" />
                <div className="house-wall house-wall-back" />
                <div className="house-wall house-wall-left" />
                <div className="house-wall house-wall-right" />
                <div className="house-window house-window-a" />
                <div className="house-window house-window-b" />
                <div className="house-door" />
                <div className="room-ceiling-cove" />
                <div className="room-wall-trim trim-left" />
                <div className="room-wall-trim trim-right" />
                <div className="room-light-beam beam-a" />
                <div className="room-back-grid" />
              </div>
              <div
                className={`room-illustration room-illustration-${activeRoom.id}`}
                aria-hidden="true"
              >
                {renderRoomIllustration(activeRoom.id)}
              </div>
              <div className="room-chamber">
                <RoomIcon name={activeRoom.icon} className="room-icon room-icon-lg" />
                <p className="chamber-kicker">Immersive Chapter</p>
                <p className="chamber-sub">{activeRoom.name}</p>
              </div>
            </div>
          </div>

          <div className="virtual-caption">
            {phase === 'outside' && 'Click the door to begin the story.'}
            {phase === 'blueprint' && 'Choose a room to enter.'}
            {phase === 'room' && 'Explore room insights and app-powered design ideas.'}
          </div>
          {phase === 'room' && (
            <div className="room-bottom-dock">
              <div className="dock-room-tabs">
                {storyRooms.map((room, idx) => (
                  <button key={room.id} type="button" className={`dock-room-tab ${idx === activeIndex ? 'active' : ''}`} onClick={() => setActiveIndex(idx)}>
                    <RoomIcon name={room.icon} className="room-icon room-icon-xs" />
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>
              <div className="dock-room-detail">
                <h4>{activeRoom.title}</h4>
                <p>{activeRoom.promise}</p>
                <div className="dock-geometry">
                  <span>clickable insights</span>
                  {hotspots.map((spot, idx) => (
                    <span key={spot.id} className="dock-geo-chip">{idx + 1}. {spot.title}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className={`virtual-info ${phase === 'room' ? 'room-info-mode' : ''}`}>
          {phase === 'outside' && (
            <section className="experience-panel">
              <p className="virtual-eyebrow">Story Start</p>
              <h2 className="experience-title">Welcome To Home4U</h2>
              <p className="experience-lead">Walk through the complete client journey from uncertainty to measurable transformation.</p>
              <div className="experience-pills">
                <span>{storyRooms.length} Guided Chapters</span>
                <span>Immersive 3D Tour</span>
                <span>Live Story Metrics</span>
              </div>
              <button type="button" className="virtual-nav-btn" onClick={enterHouse}>Begin Guided Story</button>
            </section>
          )}

          {phase === 'blueprint' && (
            <section className="experience-panel">
                  <p className="virtual-eyebrow room-chooser-kicker">Choose Room</p>
                  <h2 className="experience-title room-chooser-title">Story Map</h2>
                  <p className="experience-lead">Select any room to see how Home4U scanning and AI ideas guide your design choices.</p>
              <div className="virtual-room-grid">
                {storyRooms.map((room, index) => (
                  <button
                    type="button"
                    key={room.id}
                    className={`virtual-room-btn ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => openRoomFromBlueprint(index)}
                  >
                    <RoomIcon name={room.icon} className="room-icon room-icon-xs" />
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>
              <div className="secondary-controls">
                <button type="button" className="ghost-nav-btn" onClick={() => setPhase('outside')}>Back Outside</button>
                <button type="button" className="ghost-nav-btn" onClick={() => setShowProControls((v) => !v)}>
                  {showProControls ? 'Hide Pro Controls' : 'Show Pro Controls'}
                </button>
              </div>
            </section>
          )}

          {phase === 'room' && (
            <div ref={detailScrollRef} className={`room-detail-scroll ${introRevealing ? 'locked' : ''}`} onScroll={onDetailScroll}>
              <div
                className="room-detail-parallax room-detail-parallax-a"
                aria-hidden="true"
              />
              <div
                className="room-detail-parallax room-detail-parallax-b"
                aria-hidden="true"
              />
              <div
                className="room-detail-parallax room-detail-parallax-c"
                aria-hidden="true"
              />
              <div className={`room-detail-content ${introPassed ? 'intro-passed' : ''}`}>
                <section
                  key={activeRoom.id}
                  className={`room-intro-showcase ${introRevealing ? 'reveal-active' : ''}`}
                  style={{
                    '--room-accent': activeRoom.accent,
                    '--room-tone-a': activeRoom.toneA,
                    '--room-tone-b': activeRoom.toneB,
                    '--room-glow': activeRoom.glow,
                  }}
                >
                  <p className="virtual-eyebrow room-kicker">Room Showcase</p>
                  <h2 className="room-display-title">{activeRoom.title}</h2>
                  <p className="room-display-lead">{activeRoom.promise}</p>
                  <div className="room-intro-meta">
                    <span className="meta-label">{activeRoom.metric.label}</span>
                    <strong>{activeRoom.metric.after}{activeRoom.metric.suffix}</strong>
                  </div>
                  <button type="button" className="room-intro-cta" onClick={jumpToDetails}>Explore Details ↓</button>
                  <span className="room-intro-scrollhint">Scroll to move deeper into this chapter</span>
                  {introRevealing && <span className="room-intro-lock">Revealing room...</span>}
                </section>

                <div ref={detailBodyRef} className="room-detail-body">
                <div className="room-detail-head">
                  <p className="virtual-eyebrow section-kicker">Chapter Insight</p>
                  <h2 className="section-title">{activeRoom.title}</h2>
                  <p className="section-lead">{activeRoom.proof}</p>
                </div>
                <section className="story-framework">
                  <p className="virtual-eyebrow">Story Framework</p>
                  <div className="framework-grid">
                    <article className="framework-step">
                      <h4>Problem</h4>
                      <p>{activeRoom.problem}</p>
                    </article>
                    <article className="framework-step">
                      <h4>Method</h4>
                      <p>{activeRoom.method}</p>
                    </article>
                    <article className="framework-step">
                      <h4>Proof</h4>
                      <p>{activeRoom.proof}</p>
                    </article>
                    <article className="framework-step">
                      <h4>Next Step</h4>
                      <p>{activeRoom.nextStep}</p>
                    </article>
                  </div>
                  <button type="button" className="story-framework-cta" onClick={handleRoomCta}>{activeRoom.cta}</button>
                </section>
                {revealEvidence ? (
                  <>
                    <div className="virtual-room-progress">
                      <span>{visitedCount}/{hotspots.length} insights viewed</span>
                      <span className={`virtual-complete-pill ${roomComplete ? 'complete' : ''}`}>{roomComplete ? 'Room Complete' : 'In Progress'}</span>
                    </div>
                    <section className="virtual-hotspot-panel section-parallax section-parallax-fast">
                      <p className="virtual-eyebrow">Evidence Detail</p>
                      {selectedHotspot ? (
                        <div key={`${selectedHotspot.id}-${focusCue}`} className="hotspot-panel-inner">
                          <h3>{selectedHotspot.title}</h3>
                          <p>{selectedHotspot.description}</p>
                          <button type="button" className="virtual-hotspot-cta" onClick={handleRoomCta}>{activeRoom.cta}</button>
                        </div>
                      ) : (
                        <p>Click a hotspot in the room to reveal a specific evidence point.</p>
                      )}
                    </section>
                  </>
                ) : (
                  <p className="chapter-hint">Start with the story promise first. Evidence layers unlock in the next chapter.</p>
                )}

                {revealOutcome && (
                  <section className="before-after-panel section-parallax section-parallax-mid">
                    <div className={`transform-panel ${isGeneratingPlan ? 'is-processing' : ''} ${transformSweepTick ? 'sweep-once' : ''}`}>
                      <div className="transform-header">
                        <p className="virtual-eyebrow">Outcome Progress</p>
                        <button
                          type="button"
                          className="transform-cta"
                          onClick={handleGeneratePlan}
                          disabled={isGeneratingPlan}
                        >
                          {isGeneratingPlan ? 'Generating…' : 'Generate Design Plan'}
                        </button>
                      </div>
                      <div className="before-after-meta">
                        <span>{activeRoom.metric.label}</span>
                        <strong>{storyMetric}{activeRoom.metric.suffix}</strong>
                      </div>
                      <div className="transform-canvas">
                        <div className="before-after-stage">
                          <div className="before-layer">Baseline {activeRoom.metric.before}{activeRoom.metric.suffix}</div>
                          <div className="after-layer" style={{ width: `${storyProgress}%` }}>Current {storyMetric}{activeRoom.metric.suffix}</div>
                          <span className="split-line" style={{ left: `${storyProgress}%` }}><span className="split-handle">↔</span></span>
                        </div>

                        {isGeneratingPlan && (
                          <div className="transform-overlay">
                            <div className="transform-grid" />
                            <div className="transform-scan-line" />
                            <p className="transform-status">Analyzing spatial geometry…</p>
                          </div>
                        )}
                        {!isGeneratingPlan && transformSweepTick > 0 && (
                          <div key={transformSweepTick} className="transform-sweep" aria-hidden="true" />
                        )}
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={storyProgress}
                        onChange={(e) => setStoryProgress(Number(e.target.value))}
                        className="before-after-slider"
                      />
                      <div className="before-after-presets">
                        {[25, 50, 75, 100].map((value) => (
                          <button key={value} type="button" className="tiny-chip" onClick={() => setStoryProgress(value)}>{value}%</button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <div className="virtual-controls section-parallax section-parallax-slow">
                  <button type="button" className="virtual-nav-btn" onClick={() => setPhase('blueprint')}>← Story Map</button>
                  <button type="button" className="virtual-nav-btn" onClick={() => setActiveIndex((prev) => (prev + 1) % storyRooms.length)}>Next Room →</button>
                </div>

                {revealDeepControls && (
                  <div className="virtual-minimap">
                    {storyRooms.map((room, idx) => (
                      <span key={room.id} className={`virtual-minidot ${idx === activeIndex ? 'active' : ''} ${visitedRooms.has(room.id) ? 'visited' : ''}`} style={idx === activeIndex ? { backgroundColor: room.accent } : undefined} />
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {phase !== 'room' && (
            <>
              <div className="virtual-controls hero-cta-row">
                <button type="button" className="virtual-nav-btn primary-cta" onClick={() => setPhase('blueprint')}>Open Story Map</button>
              </div>
            </>
          )}

          <button type="button" className={`pro-controls-toggle ${showProControls ? 'active' : ''}`} onClick={() => setShowProControls((v) => !v)}>
            {showProControls ? 'Hide Pro Controls' : 'Show Pro Controls'}
          </button>

          {showProControls && (
            <>
              <section className="settings-panel">
                <p className="virtual-eyebrow">Experience Controls</p>
                <div className="settings-row">
                  <span>Theme</span>
                  <div className="chip-row">
                    {Object.keys(themePresets).map((mode) => (
                      <button key={mode} type="button" className={`tiny-chip ${themeMode === mode ? 'active' : ''}`} onClick={() => setThemeMode(mode)}>{mode}</button>
                    ))}
                  </div>
                </div>
                <div className="settings-row">
                  <span>Material</span>
                  <div className="chip-row">
                    {Object.keys(materialPresets).map((mode) => (
                      <button key={mode} type="button" className={`tiny-chip ${materialMode === mode ? 'active' : ''}`} onClick={() => setMaterialMode(mode)}>{mode}</button>
                    ))}
                  </div>
                </div>
                <div className="toggle-row">
                  <button type="button" className={`tiny-chip ${ambientMotion ? 'active' : ''}`} onClick={() => setAmbientMotion((v) => !v)}>Particles</button>
                  <button type="button" className={`tiny-chip ${narrativeEnabled ? 'active' : ''}`} onClick={() => setNarrativeEnabled((v) => !v)}>Narration</button>
                  <button type="button" className={`tiny-chip ${soundEnabled ? 'active' : ''}`} onClick={() => setSoundEnabled((v) => !v)}>Sound</button>
                </div>
              </section>
              <section className="achievement-panel">
                <p className="virtual-eyebrow">Progress Badges</p>
                <div className="achievement-list">
                  {achievements.map((item) => (
                    <span key={item.id} className={`achievement-badge ${item.unlocked ? 'unlocked' : ''}`}>{item.label}</span>
                  ))}
                </div>
              </section>
            </>
          )}

          {narrativeLine && <p className="narrative-line">{narrativeLine}</p>}
        </aside>
      </main>
      {showBookingModal && (
        <div className="booking-modal-overlay" role="presentation" onClick={() => setShowBookingModal(false)}>
          <section className="booking-modal" role="dialog" aria-modal="true" aria-label="Book Consultation" onClick={(event) => event.stopPropagation()}>
            <div className="booking-modal-head">
              <p className="virtual-eyebrow">Action Room</p>
              <h3>Book Your Consultation</h3>
              <button type="button" className="booking-close" onClick={() => setShowBookingModal(false)} aria-label="Close booking modal">✕</button>
            </div>
            {!bookingSubmitted ? (
              <form className="booking-form" onSubmit={submitBooking}>
                <label>
                  Full Name
                  <input name="name" type="text" value={bookingForm.name} onChange={onBookingInput} placeholder="Jane Doe" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" value={bookingForm.email} onChange={onBookingInput} placeholder="jane@email.com" required />
                </label>
                <label>
                  Preferred Date
                  <input name="date" type="date" value={bookingForm.date} onChange={onBookingInput} required />
                </label>
                <label>
                  Project Notes
                  <textarea name="notes" value={bookingForm.notes} onChange={onBookingInput} rows={3} placeholder="Tell us your project goals..." />
                </label>
                <button type="submit" className="booking-submit">Confirm Consultation</button>
              </form>
            ) : (
              <div className="booking-success">
                <h4>Consultation request sent</h4>
                <p>We received your details and will follow up with available time slots.</p>
                <button type="button" className="booking-submit" onClick={() => setShowBookingModal(false)}>Close</button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default VirtualTour3D;

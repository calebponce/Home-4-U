/**
 * A high-fidelity spatial narrative engine using Spline camera waypoints and React state-driven context.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VirtualTour3D.css';

const BRAND_AMBER = '#bb9457';
const BRAND_WINE = '#6f1d1b';
const BRAND_CHOCOLATE = '#99582a';
const BRAND_COFFEE = '#432818';
const TONE_WARM = '#2b1a12';
const TONE_DEEP = '#140a07';
const TONE_WINE = '#25130f';

const storyRooms = [
  {
    id: 'atrium',
    name: 'Bedroom Studio',
    title: 'Scan Your Bedroom. Get a Plan Built for It.',
    emoji: '🏛️',
    icon: 'bed',
    promise: 'Capture your bedroom once and receive a plan that already fits.',
    proof: 'The scan captures scale, openings, and light for room-true suggestions.',
    problem: 'Bedroom inspiration rarely matches real dimensions.',
    method: 'We map the room, then generate layout and style options for your footprint.',
    nextStep: 'Scan your bedroom and save your first tailored board.',
    summary: {
      purpose: 'Capture your bedroom once and get a plan that already fits.',
      features: ['Wall + floor mapping', 'Light + opening detection', 'Auto-fit layout proposals'],
      takeaway: 'You start with confidence before moving a single piece.',
    },
    metric: { label: 'Client Clarity', before: 42, after: 89, suffix: '%' },
    cta: 'Scan Bedroom',
    accent: BRAND_AMBER,
    toneA: TONE_WARM,
    toneB: TONE_DEEP,
    glow: 'rgba(255, 230, 167, 0.16)',
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
    title: 'Compare Living Room Concepts in Minutes',
    emoji: '⚠️',
    icon: 'sofa',
    promise: 'Compare living room concepts directly on your scanned space.',
    proof: 'A swipeable feed applies each idea to your real layout.',
    problem: 'People bounce between apps and screenshots just to compare ideas.',
    method: 'We keep every option in one room-true feed.',
    nextStep: 'Open the feed and pin three directions.',
    summary: {
      purpose: 'Compare living room ideas fast in your exact space.',
      features: ['Swipeable concept feed', 'Side-by-side pinning', 'Room-true scale previews'],
      takeaway: 'You pick a direction without second-guessing.',
    },
    metric: { label: 'Project Delay Risk', before: 61, after: 18, suffix: '%' },
    cta: 'Open Idea Feed',
    accent: BRAND_CHOCOLATE,
    toneA: TONE_WARM,
    toneB: TONE_DEEP,
    glow: 'rgba(187, 148, 87, 0.18)',
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
    title: 'Plan a Kitchen That Works as Good as It Looks',
    emoji: '🧠',
    icon: 'kitchen',
    promise: 'Get upgrade ideas that respect workflow, storage, and circulation.',
    proof: 'Suggestions align with zones and the work‑triangle flow.',
    problem: 'Great-looking kitchens can fail in daily use.',
    method: 'We score upgrades by function, style, and budget.',
    nextStep: 'Generate a plan and compare scores.',
    summary: {
      purpose: 'Balance beauty with workflow in a usable kitchen plan.',
      features: ['Zone mapping', 'Work‑triangle scoring', 'Budget-aware upgrades'],
      takeaway: 'Every choice feels practical and premium.',
    },
    metric: { label: 'Revision Rounds', before: 7, after: 3, suffix: ' rounds' },
    cta: 'Generate Kitchen Plan',
    accent: BRAND_WINE,
    toneA: TONE_WINE,
    toneB: TONE_DEEP,
    glow: 'rgba(111, 29, 27, 0.2)',
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
    title: 'See Your Bathroom Upgrade Before You Commit',
    emoji: '🖼️',
    icon: 'bath',
    promise: 'Preview finishes, vanity, and lighting as a live before/after.',
    proof: 'You see exactly how each material shifts the room.',
    problem: 'Bathroom decisions feel risky when changes are only described.',
    method: 'We render side‑by‑side comparisons for confident choices.',
    nextStep: 'Drag the slider and save your preferred concept.',
    summary: {
      purpose: 'See the before/after impact before you commit.',
      features: ['Live finish overlays', 'Material confidence cues', 'One-click saves'],
      takeaway: 'You decide with clarity, not risk.',
    },
    metric: { label: 'Design Confidence', before: 48, after: 93, suffix: '%' },
    cta: 'Open Before/After',
    accent: BRAND_AMBER,
    toneA: TONE_WARM,
    toneB: TONE_DEEP,
    glow: 'rgba(153, 88, 42, 0.2)',
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
    title: 'Build a Home Office That Improves Focus',
    emoji: '📈',
    icon: 'desk',
    promise: 'Design an office layout tuned to workflow, light, and space.',
    proof: 'Desk placement and lighting angles are optimized for the scan.',
    problem: 'Office inspiration looks good but underperforms in daily use.',
    method: 'We pair visual style with productivity metrics.',
    nextStep: 'Review layouts and select your focus-ready setup.',
    summary: {
      purpose: 'Design a workspace that improves focus.',
      features: ['Ergonomic layout checks', 'Light-angle guidance', 'Focus scoring'],
      takeaway: 'Work feels easier on day one.',
    },
    metric: { label: 'Sign-off Speed', before: 11, after: 4, suffix: ' days' },
    cta: 'Review Office Setup',
    accent: BRAND_CHOCOLATE,
    toneA: TONE_WARM,
    toneB: TONE_DEEP,
    glow: 'rgba(187, 148, 87, 0.18)',
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
    title: 'Unify Every Room Into One Cohesive Plan',
    emoji: '🚀',
    icon: 'home',
    promise: 'Combine all room decisions into a single style roadmap.',
    proof: 'The app compiles your choices into phases and next steps.',
    problem: 'Room‑by‑room designs clash without a whole‑home plan.',
    method: 'We stitch your selections into one cohesive direction.',
    nextStep: 'Book a consultation to finalize your roadmap.',
    summary: {
      purpose: 'Unify every room into one cohesive plan.',
      features: ['Cross-room palette alignment', 'Phased rollout steps', 'Consult-ready roadmap'],
      takeaway: 'Your home feels intentional end-to-end.',
    },
    metric: { label: 'Launch Readiness', before: 36, after: 95, suffix: '%' },
    cta: 'Book Whole-Home Consult',
    accent: BRAND_WINE,
    toneA: TONE_WINE,
    toneB: TONE_DEEP,
    glow: 'rgba(255, 230, 167, 0.16)',
    plan: { x: 74, y: 55, w: 20, h: 16 },
    scene: [
      { id: 'c-1', kind: 'panel', x: '24%', y: '38%', z: 44, r: -5, s: 1.08, px: 10, py: 7, w: 92, h: 44 },
      { id: 'c-2', kind: 'fixture', x: '54%', y: '24%', z: 20, r: 0, s: 0.95, px: 5, py: 5, w: 18, h: 42 },
      { id: 'c-3', kind: 'table', x: '80%', y: '62%', z: 18, r: 5, s: 1.0, px: 6, py: 4, w: 84, h: 16 },
    ],
  },
];

const themePresets = {
  story: { bgA: '#120a07', bgB: '#1b100b', panel: '#1a0f0b' },
  minimal: { bgA: '#0f0906', bgB: '#1a0f0b', panel: '#160c09' },
  editorial: { bgA: '#140b08', bgB: '#22140d', panel: '#1b100b' },
};

const materialPresets = {
  walnut: { floor: BRAND_COFFEE, wall: '#2f1b12', roof: BRAND_AMBER },
  stone: { floor: '#3a2418', wall: '#26160f', roof: BRAND_CHOCOLATE },
  soft: { floor: '#4a2f21', wall: '#2b1a12', roof: BRAND_WINE },
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

const CAMERA_EYE_LEVEL = 1.6;
const CAMERA_ANIMATION_DURATION = 2500;

const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

const createWaypoint = (x, z, y = CAMERA_EYE_LEVEL) => ({ x, y, z });

const mapPlanToCameraLane = (plan) => {
  const centerX = plan.x + plan.w / 2;
  const centerY = plan.y + plan.h / 2;
  return {
    x: Number((clampValue((centerX - 50) / 50, -1, 1) * 5.1).toFixed(2)),
    z: Number(clampValue(14 - ((centerY - 50) / 50) * 2.4, 9.5, 17.5).toFixed(2)),
  };
};

const buildRoomCameraPath = (room) => {
  const lane = mapPlanToCameraLane(room.plan);
  return [
    createWaypoint(0, 21.5),
    createWaypoint(lane.x * 0.3, 18.2),
    createWaypoint(lane.x * 0.7, 14.3),
    createWaypoint(lane.x, lane.z),
  ];
};

const subtractVector = (from, to) => ({
  x: to.x - from.x,
  y: to.y - from.y,
  z: to.z - from.z,
});

const normalizeVector = (vector) => {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
};

const catmullRomPoint = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    z: 0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  };
};

const sampleSplinePoint = (points, progress) => {
  if (points.length === 0) return createWaypoint(0, 50);
  if (points.length === 1) return points[0];

  const segmentCount = points.length - 1;
  const clampedProgress = clampValue(progress, 0, 1);
  const scaled = clampedProgress * segmentCount;
  const segmentIndex = Math.min(segmentCount - 1, Math.floor(scaled));
  const localT = scaled - segmentIndex;
  const p0 = points[Math.max(0, segmentIndex - 1)];
  const p1 = points[segmentIndex];
  const p2 = points[Math.min(segmentIndex + 1, points.length - 1)];
  const p3 = points[Math.min(segmentIndex + 2, points.length - 1)];
  return catmullRomPoint(p0, p1, p2, p3, localT);
};

const getSplinePose = (points, progress) => {
  const position = sampleSplinePoint(points, progress);
  const lookAhead = sampleSplinePoint(points, clampValue(progress + 0.035, 0, 1));
  return {
    position,
    tangent: normalizeVector(subtractVector(position, lookAhead)),
  };
};

const mapSplinePoseToStage = ({ position, tangent }) => {
  const lateralTurn = tangent.z === 0 ? tangent.x * 10 : (tangent.x / Math.abs(tangent.z)) * 8.5;
  const pitch = tangent.z === 0 ? 0 : (tangent.y / Math.abs(tangent.z)) * 8;
  return {
    cameraDolly: clampValue(position.z, 8, 60),
    lookAtOffset: {
      x: Number(clampValue(lateralTurn + position.x * 0.18, -8, 8).toFixed(2)),
      y: Number(clampValue(pitch, -3.5, 3.5).toFixed(2)),
    },
    nudge: {
      x: Number(clampValue(position.x * 0.22, -1.6, 1.6).toFixed(2)),
      y: Number(clampValue((CAMERA_EYE_LEVEL - position.y) * 2.2, -0.8, 0.8).toFixed(2)),
    },
    position,
  };
};

const storyChapters = [
  {
    id: 'outside',
    title: 'Outside Arrival',
    narrationText: 'Narration: Begin at the front door to start a guided story of transformation.',
    cameraPath: [
      createWaypoint(-0.45, 56),
      createWaypoint(-0.25, 52),
      createWaypoint(0.1, 47),
      createWaypoint(0, 42),
    ],
  },
  {
    id: 'foyer',
    title: 'The Foyer',
    narrationText: 'Narration: You are passing through the frosted entry and into the story map of the home.',
    cameraPath: [
      createWaypoint(0, 42),
      createWaypoint(0.2, 35),
      createWaypoint(0, 28),
      createWaypoint(0, 21.5),
    ],
  },
  ...storyRooms.map((room) => ({
    id: room.id,
    title: room.name,
    narrationText: `Narration: ${room.promise}`,
    cameraPath: buildRoomCameraPath(room),
    framework: {
      problem: room.problem,
      method: room.method,
      proof: room.proof,
      nextStep: room.nextStep,
    },
  })),
];

const initialStageCamera = mapSplinePoseToStage(getSplinePose(storyChapters[0].cameraPath, 0));

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
      <defs>
        <filter id="bloom-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
          <feFlood floodColor="var(--room-accent)" floodOpacity="0.4" result="offsetColor" />
          <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
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
  const [currentChapter, setCurrentChapter] = useState(0);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [visitedHotspots, setVisitedHotspots] = useState({});
  const [focusCue, setFocusCue] = useState(0);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [hotspotTransitioning, setHotspotTransitioning] = useState(false);
  const [doorZooming, setDoorZooming] = useState(false);
  const [isEnteringHome, setIsEnteringHome] = useState(false);
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
  const [activeSection, setActiveSection] = useState('problem');
  const [chapterChangeKey, setChapterChangeKey] = useState(0);
  const [autoOpenedSection, setAutoOpenedSection] = useState(null);
  const [showOrbitHint, setShowOrbitHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const tiltStartRef = useRef({ x: 0, y: 0 });
  const tiltTargetRef = useRef({ x: 0, y: 0 });
  const tiltCurrentRef = useRef({ x: 0, y: 0 });
  const nudgeRef = useRef({ x: 0, y: 0 });
  const lookAtOffsetRef = useRef(initialStageCamera.lookAtOffset);
  const cameraDollyRef = useRef(initialStageCamera.cameraDolly);
  const audioCtxRef = useRef(null);
  const introAudioTimersRef = useRef([]);
  const detailScrollRef = useRef(null);
  const detailBodyRef = useRef(null);
  const introTimerRef = useRef(null);
  const detailScrollYRef = useRef(0);
  const detailRafRef = useRef(null);
  const hotspotFocusTimerRef = useRef(null);
  const orbitHintTimerRef = useRef(null);
  const roomShellRef = useRef(null);
  const roomAtmoRef = useRef(null);
  const enterHomeTimersRef = useRef([]);
  const cameraAnimationFrameRef = useRef(null);
  const cameraPositionRef = useRef(initialStageCamera.position);
  const hasMountedCameraRef = useRef(false);
  const [userInterrupted, setUserInterrupted] = useState(false);
  const userInterruptedTimerRef = useRef(null);
  const userInterruptedRef = useRef(false);
  const phaseRef = useRef(phase);

  const activeRoom = storyRooms[activeIndex];
  const activeStoryChapter = storyChapters[currentChapter] || storyChapters[0];
  const activeFramework = activeStoryChapter.framework || {
    problem: activeRoom.problem,
    method: activeRoom.method,
    proof: activeRoom.proof,
    nextStep: activeRoom.nextStep,
  };
  const roomSummary = activeRoom.summary || {
    purpose: activeRoom.promise,
    features: [],
    takeaway: activeRoom.proof,
  };
  const hotspots = storyHotspots[activeRoom.id] || [];
  const selectedHotspot = hotspots.find((spot) => spot.id === selectedHotspotId) || null;
  const visitedCount = visitedHotspots[activeRoom.id]?.size || 0;
  const roomComplete = hotspots.length > 0 && visitedCount === hotspots.length;
  const phaseSteps = [
    { id: 'outside', label: 'Arrival' },
    { id: 'blueprint', label: 'Blueprint' },
    { id: 'room', label: 'Room' },
  ];
  const currentPhaseStep = phaseSteps.findIndex((step) => step.id === phase);
  const currentPhaseLabel = phaseSteps[currentPhaseStep]?.label || 'Arrival';
  const hasPrevRoom = activeIndex > 0;
  const hasNextRoom = activeIndex < storyRooms.length - 1;
  const dockBackLabel = phase === 'room' ? 'Prev Room' : phase === 'blueprint' ? 'Back Outside' : 'Back to Dashboard';
  const dockPrimaryLabel = phase === 'room' ? 'Next Room' : phase === 'blueprint' ? 'Enter Selected Room' : 'Begin Guided Story';
  const dockBackDisabled = phase === 'room' ? !hasPrevRoom : phaseTransitioning || isEnteringHome;
  const dockPrimaryDisabled = phase === 'room'
    ? !hasNextRoom
    : phase === 'blueprint'
      ? phaseTransitioning
      : isEnteringHome || phaseTransitioning;
  const dockOverviewDisabled = phase === 'blueprint' || phaseTransitioning || isEnteringHome;
  const insightsTotal = hotspots.length;
  const insightsValue = Math.min(visitedCount, Math.max(insightsTotal, 1));
  const insightsLabel = insightsTotal
    ? `${visitedCount}/${insightsTotal} insights viewed`
    : 'No insights available';
  const roomIllustration = useMemo(() => renderRoomIllustration(activeRoom.id), [activeRoom.id]);
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

  const pathMetrics = useMemo(() => {
    const dx = pathTarget.x - 50;
    const dy = pathTarget.y - 50;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return { length, angle };
  }, [pathTarget]);

  const narrativeLine = useMemo(() => {
    if (!narrativeEnabled) return null;
    return activeStoryChapter.narrationText;
  }, [activeStoryChapter, narrativeEnabled]);

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

  const frameworkPanels = useMemo(
    () => [
      { key: 'problem', label: 'Problem', content: activeFramework.problem },
      { key: 'method', label: 'Method', content: activeFramework.method },
      { key: 'proof', label: 'Proof', content: activeFramework.proof },
      { key: 'nextStep', label: 'Next Step', content: activeFramework.nextStep },
    ],
    [activeFramework],
  );

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

  const clearEnterHomeTimers = () => {
    enterHomeTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    enterHomeTimersRef.current = [];
  };

  const clearUserInterruptedTimer = () => {
    if (userInterruptedTimerRef.current) {
      window.clearTimeout(userInterruptedTimerRef.current);
      userInterruptedTimerRef.current = null;
    }
  };

  const stopCameraAnimation = () => {
    if (cameraAnimationFrameRef.current) {
      cancelAnimationFrame(cameraAnimationFrameRef.current);
      cameraAnimationFrameRef.current = null;
    }
  };

  const getChapterIndexById = (chapterId) => {
    const nextIndex = storyChapters.findIndex((chapter) => chapter.id === chapterId);
    return nextIndex === -1 ? 0 : nextIndex;
  };

  const applySplinePoseToStage = (pose) => {
    const stagePose = mapSplinePoseToStage(pose);
    cameraPositionRef.current = stagePose.position;
    cameraDollyRef.current = stagePose.cameraDolly;
    lookAtOffsetRef.current = stagePose.lookAtOffset;
    nudgeRef.current = stagePose.nudge;
  };

  const syncActiveSectionFromProgress = (progress) => {
    if (phaseRef.current !== 'room' || userInterruptedRef.current) return;

    if (progress >= 0.8) {
      setActiveSection((current) => {
        if (current !== 'proof') {
          setAutoOpenedSection('proof');
          return 'proof';
        }
        return current;
      });
      return;
    }

    if (progress >= 0.4) {
      setActiveSection((current) => {
        if (current !== 'method') {
          setAutoOpenedSection('method');
          return 'method';
        }
        return current;
      });
      return;
    }

    setActiveSection((current) => {
      if (current !== 'problem') {
        setAutoOpenedSection('problem');
        return 'problem';
      }
      return current;
    });
  };

  const handleManualSectionChange = (sectionKey) => {
    setActiveSection(sectionKey);
    setUserInterrupted(true);
    clearUserInterruptedTimer();
    userInterruptedTimerRef.current = window.setTimeout(() => {
      setUserInterrupted(false);
      userInterruptedTimerRef.current = null;
    }, 10000);
  };

  const goToPrevRoom = useCallback(() => {
    if (phase !== 'room') return;
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  }, [phase]);

  const goToNextRoom = useCallback(() => {
    if (phase !== 'room') return;
    setActiveIndex((prev) => Math.min(prev + 1, storyRooms.length - 1));
  }, [phase]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    userInterruptedRef.current = userInterrupted;
  }, [userInterrupted]);

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
    if (phase === 'outside' && !isEnteringHome) {
      setCurrentChapter(0);
      return;
    }
    if (phase === 'blueprint') {
      setCurrentChapter(1);
      return;
    }
    if (phase === 'room') {
      setCurrentChapter(getChapterIndexById(activeRoom.id));
    }
  }, [phase, activeRoom.id, isEnteringHome]);

  useEffect(() => {
    setActiveSection('problem');
    setChapterChangeKey((prev) => prev + 1);
  }, [currentChapter]);

  useEffect(() => {
    if (phase !== 'room') {
      setShowOrbitHint(false);
      return;
    }
    setShowOrbitHint(true);
    if (orbitHintTimerRef.current) {
      window.clearTimeout(orbitHintTimerRef.current);
    }
    orbitHintTimerRef.current = window.setTimeout(() => {
      setShowOrbitHint(false);
      orbitHintTimerRef.current = null;
    }, 4800);
    return () => {
      if (orbitHintTimerRef.current) {
        window.clearTimeout(orbitHintTimerRef.current);
        orbitHintTimerRef.current = null;
      }
    };
  }, [phase, activeRoom.id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const activeTag = document.activeElement?.tagName;
      const isTypingTarget = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag || '') || document.activeElement?.isContentEditable;

      if (showBookingModal) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setShowBookingModal(false);
        }
        return;
      }

      if (isTypingTarget) return;
      setHasInteracted(true);

      if (event.key === 'Escape') {
        if (phase === 'room') {
          event.preventDefault();
          setPhase('blueprint');
          setSelectedHotspotId(null);
          return;
        }
        if (phase === 'blueprint') {
          event.preventDefault();
          setPhase('outside');
          return;
        }
        navigate('/dashboard');
        return;
      }

      if (phase === 'room' && !phaseTransitioning) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goToNextRoom();
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goToPrevRoom();
          return;
        }
        if (event.key.toLowerCase() === 'm') {
          event.preventDefault();
          setPhase('blueprint');
          setSelectedHotspotId(null);
          return;
        }
      }

      if (phase === 'blueprint' && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setPhase('outside');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, navigate, showBookingModal, phaseTransitioning, goToNextRoom, goToPrevRoom]);

  useEffect(() => {
    setSelectedHotspotId(null);
    setHotspotTransitioning(false);
    nudgeRef.current = { x: 0, y: 0 };
  }, [activeIndex, phase]);

  useEffect(() => {
    if (phase !== 'room') return;
    setVisitedRooms((prev) => new Set(prev).add(activeRoom.id));
  }, [phase, activeRoom.id]);

  useEffect(() => {
    if (phase === 'room') return;
    tiltTargetRef.current = { x: 0, y: 0 };
    tiltCurrentRef.current = { x: 0, y: 0 };
  }, [phase]);

  useEffect(() => {
    setShowFullDetails(false);
  }, [activeRoom.id]);

  useEffect(() => () => {
    if (hotspotFocusTimerRef.current) window.clearTimeout(hotspotFocusTimerRef.current);
  }, []);

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
    clearEnterHomeTimers();
    clearUserInterruptedTimer();
    stopCameraAnimation();
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
    if (phase !== 'room') return undefined;
    let frameId;
    const tick = () => {
      const target = tiltTargetRef.current;
      const current = tiltCurrentRef.current;
      const nextX = current.x + (target.x - current.x) * 0.18;
      const nextY = current.y + (target.y - current.y) * 0.18;
      tiltCurrentRef.current = { x: nextX, y: nextY };

      const nudge = nudgeRef.current;
      const lookAt = lookAtOffsetRef.current;
      const cameraDolly = cameraDollyRef.current;
      const rotateX = -6 + nextY * 8 + nudge.y + lookAt.y;
      const rotateY = 14 + nextX * 14 + nudge.x + lookAt.x;
      const dolly = cameraDolly + Math.abs(nextX) * 5 + Math.abs(nextY) * 4;
      const perspectiveScale = 1 + (50 - cameraDolly) / 500;

      if (roomShellRef.current) {
        roomShellRef.current.style.transform = `translateZ(${dolly.toFixed(2)}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${perspectiveScale})`;
      }
      if (roomAtmoRef.current) {
        roomAtmoRef.current.style.setProperty('--atmo-x', `${(nextX * 14).toFixed(2)}px`);
        roomAtmoRef.current.style.setProperty('--atmo-y', `${(nextY * 10).toFixed(2)}px`);
      }

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [phase]);

  // AI-Driven Neural Sync: Maps spatial waypoints to narrative state.
  useEffect(() => {
    const chapter = storyChapters[currentChapter];
    if (!chapter?.cameraPath?.length) return undefined;

    stopCameraAnimation();
    const path = [cameraPositionRef.current, ...chapter.cameraPath];

    if (!hasMountedCameraRef.current) {
      applySplinePoseToStage(getSplinePose(path, 0));
      hasMountedCameraRef.current = true;
      return undefined;
    }

    const startTime = performance.now();
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = (now) => {
      const linearProgress = clampValue((now - startTime) / CAMERA_ANIMATION_DURATION, 0, 1);
      const easedProgress = easeInOutCubic(linearProgress);
      applySplinePoseToStage(getSplinePose(path, easedProgress));
      syncActiveSectionFromProgress(easedProgress);

      if (linearProgress < 1) {
        cameraAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        cameraAnimationFrameRef.current = null;
      }
    };

    cameraAnimationFrameRef.current = requestAnimationFrame(animate);

    return () => stopCameraAnimation();
  }, [currentChapter]);

  const enterHouse = () => {
    if (isEnteringHome || doorZooming) return;
    clearEnterHomeTimers();
    setPhaseTransitioning(true);
    playUiTone(360, 0.09);
    setIsEnteringHome(true);
    setHasInteracted(true);
    setCurrentChapter(0);

    const midFlightTimer = window.setTimeout(() => {
      setCurrentChapter(1);
      playUiTone(480, 0.08);
    }, 600);

    const finishTimer = window.setTimeout(() => {
      setPhase('blueprint');
      setBlueprintIntroTick((prev) => prev + 1);
      setIsEnteringHome(false);
      setPhaseTransitioning(false);
    }, 1200);

    enterHomeTimersRef.current = [midFlightTimer, finishTimer];
  };

  const goToOverview = () => {
    setHasInteracted(true);
    if (phase === 'blueprint') return;
    setSelectedHotspotId(null);
    setPhase('blueprint');
    setBlueprintIntroTick((prev) => prev + 1);
  };

  const resetTour = () => {
    clearEnterHomeTimers();
    clearUserInterruptedTimer();
    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    introAudioTimersRef.current.forEach((timer) => clearTimeout(timer));
    introAudioTimersRef.current = [];
    if (detailRafRef.current) cancelAnimationFrame(detailRafRef.current);
    stopCameraAnimation();
    setPhase('outside');
    setPhaseTransitioning(false);
    setDoorZooming(false);
    setRoomZooming(false);
    setIsEnteringHome(false);
    setActiveIndex(0);
    setCurrentChapter(0);
    setSelectedHotspotId(null);
    setVisitedHotspots({});
    setVisitedRooms(new Set());
    setShowFullDetails(false);
    setStoryProgress(52);
    setIsGeneratingPlan(false);
    setTransformSweepTick(0);
    setShowBookingModal(false);
    setBookingSubmitted(false);
    setBookingForm({ name: '', email: '', date: '', notes: '' });
    setIntroPassed(false);
    setIntroRevealing(false);
    setActiveSection('problem');
    setAutoOpenedSection(null);
    setShowOrbitHint(false);
    setIsDragging(false);
    setUserInterrupted(false);
    setShowProControls(false);
    setBlueprintEntered(false);
    setHoveredRoomId(null);
    setPathTarget({ x: 50, y: 50 });
    setHasInteracted(false);
  };

  const handleDockBack = () => {
    setHasInteracted(true);
    if (phase === 'room') {
      goToPrevRoom();
      return;
    }
    if (phase === 'blueprint') {
      setPhase('outside');
      return;
    }
    navigate('/dashboard');
  };

  const handleDockPrimary = () => {
    setHasInteracted(true);
    if (phase === 'room') {
      goToNextRoom();
      return;
    }
    if (phase === 'blueprint') {
      openRoomFromBlueprint(activeIndex);
      return;
    }
    enterHouse();
  };

  const openRoomFromBlueprint = (index) => {
    setPhaseTransitioning(true);
    playUiTone(520, 0.07);
    setHasInteracted(true);
    const plan = storyRooms[index].plan;
    setPathTarget({ x: plan.x + plan.w / 2, y: plan.y + plan.h / 2 });
    setRoomZooming(true);

    setTimeout(() => {
      const chapterIndex = getChapterIndexById(storyRooms[index].id);
      setActiveIndex(index);
      setCurrentChapter(chapterIndex);
      setPhase('room');
      setVisitedRooms((prev) => new Set(prev).add(storyRooms[index].id));
      setRoomZooming(false);
      setPhaseTransitioning(false);
    }, 420);
  };

  const onPointerDown = (event) => {
    if (phase !== 'room') return;
    stopCameraAnimation();
    setHasInteracted(true);
    setIsDragging(true);
    setShowOrbitHint(false);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    tiltStartRef.current = { ...tiltTargetRef.current };
  };

  const onPointerMove = (event) => {
    if (phase !== 'room') return;
    if (!isDragging) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      tiltTargetRef.current = { x, y };
      return;
    }
    const deltaX = (event.clientX - dragStartRef.current.x) / 180;
    const deltaY = (event.clientY - dragStartRef.current.y) / 180;
    tiltTargetRef.current = {
      x: Math.max(-1.1, Math.min(1.1, tiltStartRef.current.x + deltaX)),
      y: Math.max(-1.1, Math.min(1.1, tiltStartRef.current.y + deltaY)),
    };
  };

  const onPointerUp = () => setIsDragging(false);

  const openHotspot = (hotspotId) => {
    const hotspot = hotspots.find((spot) => spot.id === hotspotId);
    stopCameraAnimation();
    playUiTone(660, 0.05);
    setHasInteracted(true);
    setShowOrbitHint(false);
    setSelectedHotspotId(hotspotId);
    setFocusCue((prev) => prev + 1);
    setVisitedHotspots((prev) => {
      const roomSet = new Set(prev[activeRoom.id] || []);
      roomSet.add(hotspotId);
      return { ...prev, [activeRoom.id]: roomSet };
    });
    if (hotspot) {
      const xBias = (hotspot.x - 50) / 50;
      const yBias = (hotspot.y - 50) / 50;
      setHotspotTransitioning(true);
      lookAtOffsetRef.current = { x: xBias * 6, y: yBias * 4.2 };
      nudgeRef.current = { x: xBias * 1.25, y: yBias * 0.8 };
      if (hotspotFocusTimerRef.current) window.clearTimeout(hotspotFocusTimerRef.current);
      hotspotFocusTimerRef.current = window.setTimeout(() => {
        setHotspotTransitioning(false);
        nudgeRef.current = { x: 0, y: 0 };
      }, 600);
    }

    // Deep-link to evidence panel
    if (detailScrollRef.current) {
      const top = detailScrollRef.current.querySelector('.virtual-hotspot-panel')?.offsetTop || 0;
      detailScrollRef.current.scrollTo({ top: top - 100, behavior: 'smooth' });
    }
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
    setHasInteracted(true);
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
    setHasInteracted(true);
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
      className={`virtual-tour-page ${hasInteracted ? 'has-interaction' : 'no-interaction'}`}
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
          className={`virtual-stage phase-${phase} ${doorZooming ? 'door-zoom' : ''} ${roomZooming ? 'room-zoom' : ''} ${phaseTransitioning ? 'phase-transitioning' : ''} ${ambientMotion ? 'ambient-on' : ''} ${phase === 'room' && introRevealing ? 'intro-cam-active' : ''} ${isDragging ? 'is-dragging' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="virtual-grid" />
          <div className="stage-progress">
            {phaseSteps.map((step, index) => (
              <div key={step.id} className={`stage-step ${index <= currentPhaseStep ? 'active' : ''} ${index === currentPhaseStep ? 'current' : ''}`}>
                <span className="stage-dot">{index + 1}</span>
                <span className="stage-label">{step.label}</span>
              </div>
            ))}
          </div>
          <div className="stage-progress-track">
            <span className="stage-progress-fill" style={{ width: `${(currentPhaseStep / (phaseSteps.length - 1)) * 100}%` }} />
          </div>
          <div className="phase-transition-veil" />
          <div className="cinema-vignette" />
          <div className="virtual-particles" aria-hidden="true">
            {ambientMotion && particles.map((p) => (
              <span key={p.id} className="particle-dot" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDuration: `${p.d}s` }} />
            ))}
          </div>

          <div className="outside-layer">
            <div className={`outside-shell ${isEnteringHome ? 'house-zoom-in' : ''}`}>
              <div className="house-structure">
                <div className="house-floor" />
                <div className="house-wall house-wall-back" />
                <div className="house-wall house-wall-left" />
                <div className="house-wall house-wall-right" />
                <div className="house-roof" />
                <div className="house-window house-window-a" />
                <div className="house-window house-window-b" />
              </div>
            </div>
            <div className={`outside-entry-cta ${isEnteringHome ? 'is-hidden' : ''}`}>
              <button type="button" className="house-door-btn" onClick={enterHouse} disabled={isEnteringHome || phaseTransitioning}>
                Enter Story Home
              </button>
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
                        aria-current={index === activeIndex ? 'true' : undefined}
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
                aria-pressed={selectedHotspotId === spot.id}
              >
                <span className="virtual-hotspot-pulse" />
                <span className="virtual-hotspot-core" />
                <span className="virtual-hotspot-tag">{spot.title}</span>
              </button>
            ))}
            <div ref={roomShellRef} className={`room-shell room-shell-${activeRoom.id} ${hotspotTransitioning ? 'hotspot-transitioning' : ''}`}>
              <div ref={roomAtmoRef} className="room-depth-atmo" />
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
                {roomIllustration}
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
            {phase === 'room' && 'Drag to rotate. Click hotspots for evidence.'}
          </div>
          {phase === 'room' && showOrbitHint && (
            <div className="orbit-hint" aria-live="polite">
              Drag to rotate · Click hotspots to reveal evidence
            </div>
          )}
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
            </div>
          )}

          <nav className={`virtual-sticky-dock ${phaseTransitioning ? 'hidden' : ''}`}>
            <button className="dock-btn ghost" onClick={handleDockBack} disabled={dockBackDisabled}>← {dockBackLabel}</button>
            <button className="dock-btn ghost" onClick={goToOverview} disabled={dockOverviewDisabled}>Tour Overview</button>
            <button className="dock-btn primary" onClick={handleDockPrimary} disabled={dockPrimaryDisabled}>{dockPrimaryLabel} →</button>
          </nav>
        </section>

        <aside className={`virtual-info ${phase === 'room' ? 'room-info-mode' : ''}`}>
          {phase === 'outside' && (
            <section className="experience-panel">
              <p className="tour-progress">Phase {currentPhaseStep + 1} of {phaseSteps.length} · {currentPhaseLabel}</p>
              <p className="virtual-eyebrow">Story Start</p>
              <h2 className="experience-title">Welcome To Home4U</h2>
              <p className="experience-lead">Walk through the complete client journey from uncertainty to measurable transformation.</p>
              <div className="experience-pills">
                <span>{storyRooms.length} Guided Chapters</span>
                <span>Immersive 3D Tour</span>
                <span>Live Story Metrics</span>
              </div>
              <button type="button" className="virtual-nav-btn ghost-nav-btn" onClick={enterHouse} disabled={isEnteringHome || phaseTransitioning}>Begin Guided Story</button>
            </section>
          )}

          {phase === 'blueprint' && (
            <section className="experience-panel">
                  <p className="tour-progress">Phase {currentPhaseStep + 1} of {phaseSteps.length} · {currentPhaseLabel}</p>
                  <p className="virtual-eyebrow room-chooser-kicker">Choose Room</p>
                  <h2 className="experience-title room-chooser-title">Story Map</h2>
                  <p className="experience-lead">Select any room to see how Home4U scanning and AI ideas guide your design choices.</p>
                  <p className="blueprint-current">Current focus: {activeRoom.name}</p>
              <div className="virtual-room-grid">
                {storyRooms.map((room, index) => (
                  <button
                    type="button"
                    key={room.id}
                    className={`virtual-room-btn ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => openRoomFromBlueprint(index)}
                    aria-pressed={index === activeIndex}
                  >
                    <RoomIcon name={room.icon} className="room-icon room-icon-xs" />
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {phase === 'room' && (
            <>
              <section
                className="room-sidebar-header"
                style={{
                  '--room-accent': activeRoom.accent,
                  '--room-tone-a': activeRoom.toneA,
                  '--room-tone-b': activeRoom.toneB,
                }}
              >
                <div className="room-header-meta">
                  <p className="virtual-eyebrow section-kicker">Chapter Insight</p>
                  <span className="room-chapter-index">Chapter {activeIndex + 1} of {storyRooms.length}</span>
                </div>
                <p className="room-breadcrumb">You are here · {activeRoom.name}</p>
                <h2 className="section-title">{activeRoom.title}</h2>
                <p className="section-lead">{activeStoryChapter.narrationText.replace(/^Narration:\s*/, '')}</p>
                <div className="room-header-actions">
                  <button
                    type="button"
                    className="room-view-toggle"
                    onClick={() => setShowFullDetails((prev) => !prev)}
                    aria-pressed={showFullDetails}
                  >
                    {showFullDetails ? 'Collapse Details' : 'Expand Details'}
                  </button>
                </div>
              </section>

              <section className="room-summary-panel">
                <p className="virtual-eyebrow">Summary</p>
                <div className="summary-item">
                  <span className="summary-label">Purpose</span>
                  <p className="summary-text">{roomSummary.purpose}</p>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Key Features</span>
                  <div className="summary-tags">
                    {roomSummary.features.map((feature) => (
                      <span key={feature} className="summary-tag">{feature}</span>
                    ))}
                  </div>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Takeaway</span>
                  <p className="summary-text">{roomSummary.takeaway}</p>
                </div>
              </section>

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
                <div className="room-scroll-mask" aria-hidden="true" />
                <div key={chapterChangeKey} className={`room-detail-content ${introPassed ? 'intro-passed' : ''} ${introRevealing || phaseTransitioning ? 'is-loading' : ''}`}>
                  <section
                    key={activeRoom.id}
                    className={`room-intro-showcase sidebar-item-animate ${introRevealing ? 'reveal-active' : ''}`}
                    style={{
                      '--room-accent': activeRoom.accent,
                      '--room-tone-a': activeRoom.toneA,
                      '--room-tone-b': activeRoom.toneB,
                      '--room-glow': activeRoom.glow,
                    }}
                  >
                    <p className="virtual-eyebrow room-kicker">Room Showcase</p>
                    <p className="room-display-label">{activeRoom.name}</p>
                    <p className="room-display-lead">{activeRoom.promise}</p>
                    <div className="room-intro-meta">
                      <span className="meta-label">{activeRoom.metric.label}</span>
                      <strong>{activeRoom.metric.after}{activeRoom.metric.suffix}</strong>
                    </div>
                    <button type="button" className="room-intro-cta" onClick={jumpToDetails}>View Details ↓</button>
                    <span className="room-intro-scrollhint">Scroll to move deeper into this chapter</span>
                    {introRevealing && <span className="room-intro-lock">Revealing room...</span>}
                  </section>

                  <div ref={detailBodyRef} className="room-detail-body">
                    {!showFullDetails && (
                      <section className="room-detail-preview sidebar-item-animate">
                        <p className="virtual-eyebrow">Details</p>
                        <p className="section-lead">Expand to review the framework, evidence, and outcome metrics for this room.</p>
                        <button
                          type="button"
                          className="room-summary-cta"
                          onClick={() => setShowFullDetails(true)}
                        >
                          Expand Details
                        </button>
                      </section>
                    )}
                    {showFullDetails && (
                      <section className="story-framework sidebar-item-animate">
                        <p className="virtual-eyebrow">Story Framework</p>
                        <div key={activeStoryChapter.id} className="framework-accordion">
                          {frameworkPanels.map((panel) => {
                            const isOpen = activeSection === panel.key;
                            const buttonId = `framework-${activeStoryChapter.id}-${panel.key}`;
                            const panelId = `${buttonId}-panel`;
                            return (
                              <article key={panel.key} className={`framework-step ${isOpen ? 'is-open' : ''}`}>
                                <button
                                  type="button"
                                  id={buttonId}
                                  className={`framework-trigger accordion-header ${isOpen ? 'active shimmer-shine' : ''} ${autoOpenedSection === panel.key ? 'sync-highlight' : ''}`}
                                  aria-expanded={isOpen}
                                  aria-controls={panelId}
                                  onClick={() => {
                                    setAutoOpenedSection(null);
                                    handleManualSectionChange(panel.key);
                                  }}
                                >
                                  <span>{panel.label}</span>
                                  <span className="framework-chevron" aria-hidden="true">+</span>
                                </button>
                                <div
                                  id={panelId}
                                  className={`framework-panel ${isOpen ? 'is-open' : ''}`}
                                  role="region"
                                  aria-labelledby={buttonId}
                                >
                                  <div className="framework-panel-inner">
                                    <p>{panel.content}</p>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    )}
                    {showFullDetails && (revealEvidence ? (
                      <>
                        <div
                          className="virtual-room-progress sidebar-item-animate"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={Math.max(insightsTotal, 1)}
                          aria-valuenow={insightsValue}
                          aria-valuetext={insightsLabel}
                        >
                          <span>{insightsLabel}</span>
                          <span className={`virtual-complete-pill ${roomComplete ? 'complete' : ''}`}>{roomComplete ? 'Room Complete' : 'In Progress'}</span>
                        </div>
                        <section className="virtual-hotspot-panel section-parallax section-parallax-fast sidebar-item-animate">
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
                          {hotspots.length > 0 && (
                            <div className="hotspot-chip-row" aria-label="Room insights">
                              {hotspots.map((spot) => (
                                <button
                                  key={spot.id}
                                  type="button"
                                  className={`hotspot-chip ${selectedHotspotId === spot.id ? 'active' : ''}`}
                                  onClick={() => openHotspot(spot.id)}
                                  aria-pressed={selectedHotspotId === spot.id}
                                >
                                  {spot.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </section>
                      </>
                    ) : (
                      <p className="chapter-hint">Start with the story promise first. Evidence layers unlock in the next chapter.</p>
                    ))}

                    {showFullDetails && revealOutcome && (
                      <section className="before-after-panel section-parallax section-parallax-mid sidebar-item-animate">
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
                            aria-label="Outcome progress"
                            aria-valuetext={`Current ${storyMetric}${activeRoom.metric.suffix} of ${activeRoom.metric.after}${activeRoom.metric.suffix}`}
                          />
                          <div className="before-after-presets">
                            {[25, 50, 75, 100].map((value) => (
                              <button key={value} type="button" className="tiny-chip" onClick={() => setStoryProgress(value)}>{value}%</button>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {showFullDetails && revealDeepControls && (
                      <div className="virtual-minimap">
                        {storyRooms.map((room, idx) => (
                          <span key={room.id} className={`virtual-minidot ${idx === activeIndex ? 'active' : ''} ${visitedRooms.has(room.id) ? 'visited' : ''}`} style={idx === activeIndex ? { backgroundColor: room.accent } : undefined} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <section className="room-actions-panel">
                <p className="virtual-eyebrow">Actions</p>
                <div className="room-action-row">
                  <button type="button" className="room-summary-cta" onClick={handleRoomCta}>{activeRoom.cta}</button>
                </div>
                <details className="room-more-actions">
                  <summary>More actions</summary>
                  <div className="room-more-actions-body">
                    <button type="button" className="room-secondary-link" onClick={goToOverview}>Back to Tour Overview</button>
                    <button type="button" className="room-secondary-link" onClick={resetTour}>Restart Tour</button>
                  </div>
                </details>
              </section>
            </>
          )}

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

          {narrativeLine && (
            <p key={activeStoryChapter.id} className="narrative-line" role="status" aria-live="polite">
              {narrativeLine}
            </p>
          )}
          <button type="button" className="pro-controls-link" onClick={() => setShowProControls((v) => !v)}>
            {showProControls ? 'Hide Pro Controls' : 'Show Pro Controls'}
          </button>
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

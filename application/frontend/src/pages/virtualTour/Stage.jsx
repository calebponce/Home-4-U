import { RoomIcon } from './visuals';

const Stage = ({
  phase,
  doorZooming,
  roomZooming,
  phaseTransitioning,
  ambientMotion,
  introRevealing,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  phaseSteps,
  currentPhaseStep,
  particles,
  isEnteringHome,
  enterHouse,
  blueprintMounted,
  blueprintIntroTick,
  blueprintEntered,
  hoveredRoomId,
  storyRooms,
  activeIndex,
  openRoomFromBlueprint,
  setHoveredRoomId,
  blueprintNodeLabels,
  hotspots,
  selectedHotspotId,
  openHotspot,
  activeRoom,
  hotspotTransitioning,
  roomShellRef,
  roomAtmoRef,
  roomIllustration,
  showOrbitHint,
  goToRoomIndex,
  handleDockBack,
  dockBackDisabled,
  dockBackLabel,
  goToOverview,
  dockOverviewDisabled,
  handleDockPrimary,
  dockPrimaryDisabled,
  dockPrimaryLabel,
}) => (
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
        <div className={`room-illustration room-illustration-${activeRoom.id}`} aria-hidden="true">
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
            <button key={room.id} type="button" className={`dock-room-tab ${idx === activeIndex ? 'active' : ''}`} onClick={() => goToRoomIndex(idx)}>
              <RoomIcon name={room.icon} className="room-icon room-icon-xs" />
              <span>{room.name}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    {phase !== 'outside' && (
      <nav className={`virtual-sticky-dock phase-${phase} ${phaseTransitioning ? 'hidden' : ''}`}>
        <button className="dock-btn ghost" onClick={handleDockBack} disabled={dockBackDisabled}>← {dockBackLabel}</button>
        {phase === 'room' && (
          <button className="dock-btn ghost" onClick={goToOverview} disabled={dockOverviewDisabled}>Tour Overview</button>
        )}
        <button className="dock-btn primary" onClick={handleDockPrimary} disabled={dockPrimaryDisabled}>{dockPrimaryLabel} →</button>
      </nav>
    )}
  </section>
);

export default Stage;

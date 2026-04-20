import { useId } from 'react';
import { RoomIcon } from './visuals';

const Sidebar = ({
  phase,
  currentPhaseStep,
  phaseSteps,
  currentPhaseLabel,
  storyRooms,
  enterHouse,
  isEnteringHome,
  phaseTransitioning,
  activeRoom,
  activeIndex,
  openRoomFromBlueprint,
  showFullDetails,
  setShowFullDetails,
  activeStoryChapter,
  roomSummary,
  introRevealing,
  detailScrollRef,
  onDetailScroll,
  chapterChangeKey,
  introPassed,
  jumpToDetails,
  detailBodyRef,
  frameworkPanels,
  activeSection,
  autoOpenedSection,
  setAutoOpenedSection,
  handleManualSectionChange,
  revealEvidence,
  insightsTotal,
  insightsValue,
  insightsLabel,
  roomComplete,
  selectedHotspot,
  focusCue,
  handleRoomCta,
  hotspots,
  selectedHotspotId,
  openHotspot,
  revealOutcome,
  isGeneratingPlan,
  transformSweepTick,
  handleGeneratePlan,
  storyMetric,
  storyProgress,
  setStoryProgress,
  revealDeepControls,
  visitedRooms,
  goToOverview,
  resetTour,
  showProControls,
  themePresets,
  themeMode,
  setThemeMode,
  materialPresets,
  materialMode,
  setMaterialMode,
  ambientMotion,
  setAmbientMotion,
  resetPreferences,
  narrativeEnabled,
  setNarrativeEnabled,
  soundEnabled,
  setSoundEnabled,
  achievements,
  narrativeLine,
  setShowProControls,
  demoMode,
  demoStyleName,
}) => {
  const roomDetailsId = useId();
  const proControlsId = useId();
  const tourStatus = phase === 'room'
    ? `${activeRoom.name} room selected.${selectedHotspot ? ` ${selectedHotspot.title} insight is active.` : ''}`
    : phase === 'blueprint'
      ? `Room map view. Current focus is ${activeRoom.name}.`
      : 'Tour entry view.';

  return (
    <aside className={`virtual-info ${phase === 'room' ? 'room-info-mode' : ''}`}>
    {phase === 'outside' && (
      <section className="experience-panel">
        <p className="tour-progress">Phase {currentPhaseStep + 1} of {phaseSteps.length} · {currentPhaseLabel}</p>
        <p className="virtual-eyebrow">{demoMode ? 'Guided Demo' : 'Guided Tour'}</p>
        <h2 className="experience-title">{demoStyleName ? `Explore the ${demoStyleName} experience` : 'Explore the Home4U experience'}</h2>
        <p className="experience-lead">
          {demoStyleName
            ? `Review how Home4U guides a project from room selection to AI-assisted recommendations through a ${demoStyleName.toLowerCase()} style direction.`
            : 'Review how the platform guides a project from room selection to AI-assisted recommendations and delivery planning.'}
        </p>
        <div className="experience-pills">
          <span>{storyRooms.length} Room Reviews</span>
          <span>Immersive 3D Walkthrough</span>
          <span>Live Progress Tracking</span>
        </div>
        <button type="button" className="room-secondary-link outside-secondary-cta" onClick={enterHouse} disabled={isEnteringHome || phaseTransitioning}>Start Tour</button>
      </section>
    )}

    {phase === 'blueprint' && (
      <section className="experience-panel">
        <p className="tour-progress">Phase {currentPhaseStep + 1} of {phaseSteps.length} · {currentPhaseLabel}</p>
        <p className="virtual-eyebrow room-chooser-kicker">Select Room</p>
        <h2 className="experience-title room-chooser-title">Room Map</h2>
        <p className="experience-lead">Choose a room to review the design summary, supporting insights, and outcome metrics.</p>
        <p className="blueprint-current">Current focus: {activeRoom.name}</p>
        <div className="virtual-room-grid">
          {storyRooms.map((room, index) => (
            <button
              type="button"
              key={room.id}
              className={`virtual-room-btn ${index === activeIndex ? 'active' : ''}`}
              onClick={() => openRoomFromBlueprint(index)}
              aria-pressed={index === activeIndex}
              aria-current={index === activeIndex ? 'location' : undefined}
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
            <p className="virtual-eyebrow section-kicker">Room Insight</p>
            <span className="room-chapter-index">Room {activeIndex + 1} of {storyRooms.length}</span>
          </div>
          <p className="room-breadcrumb">Current room · {activeRoom.name}</p>
          <h2 className="section-title">{activeRoom.title}</h2>
          <p className="section-lead">{activeStoryChapter.narrationText.replace(/^[A-Za-z]+:\s*/, '')}</p>
          <div className="room-header-actions">
            <button
              type="button"
              className="room-view-toggle"
              onClick={() => setShowFullDetails((prev) => !prev)}
              aria-pressed={showFullDetails}
              aria-expanded={showFullDetails}
              aria-controls={roomDetailsId}
            >
              {showFullDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </section>

        <section className="room-summary-panel">
          <p className="virtual-eyebrow">Room Summary</p>
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

        <div id={roomDetailsId} ref={detailScrollRef} className={`room-detail-scroll ${introRevealing ? 'locked' : ''}`} onScroll={onDetailScroll}>
          <div className="room-detail-parallax room-detail-parallax-a" aria-hidden="true" />
          <div className="room-detail-parallax room-detail-parallax-b" aria-hidden="true" />
          <div className="room-detail-parallax room-detail-parallax-c" aria-hidden="true" />
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
              <p className="virtual-eyebrow room-kicker">Featured Room</p>
              <p className="room-display-label">{activeRoom.name}</p>
              <p className="room-display-lead">{activeRoom.promise}</p>
              <div className="room-intro-meta">
                <span className="meta-label">{activeRoom.metric.label}</span>
                <strong>{activeRoom.metric.after}{activeRoom.metric.suffix}</strong>
              </div>
              <button type="button" className="room-intro-cta" onClick={jumpToDetails}>Open Details</button>
              <span className="room-intro-scrollhint">Scroll to review the next detail level</span>
              {introRevealing && <span className="room-intro-lock">Revealing room...</span>}
            </section>

            <div ref={detailBodyRef} className="room-detail-body">
              {!showFullDetails && (
                <section className="room-detail-preview sidebar-item-animate">
                  <p className="virtual-eyebrow">Details</p>
                  <p className="section-lead">Expand to review the framework, supporting insights, and outcome metrics for this room.</p>
                  <button
                    type="button"
                    className="room-summary-cta"
                    onClick={() => setShowFullDetails(true)}
                    aria-controls={roomDetailsId}
                    aria-expanded={showFullDetails}
                  >
                    Show Details
                  </button>
                </section>
              )}
              {showFullDetails && (
                <section className="story-framework sidebar-item-animate">
                  <p className="virtual-eyebrow">Review Framework</p>
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
                    <span className={`virtual-complete-pill ${roomComplete ? 'complete' : ''}`}>{roomComplete ? 'Review Complete' : 'In Progress'}</span>
                  </div>
                  <section className="virtual-hotspot-panel section-parallax section-parallax-fast sidebar-item-animate">
                    <p className="virtual-eyebrow">Insight Detail</p>
                    {selectedHotspot ? (
                      <div key={`${selectedHotspot.id}-${focusCue}`} className="hotspot-panel-inner">
                        <h3>{selectedHotspot.title}</h3>
                        <p>{selectedHotspot.description}</p>
                        <button type="button" className="virtual-hotspot-cta" onClick={handleRoomCta}>{activeRoom.cta}</button>
                      </div>
                    ) : (
                      <p>Select a hotspot to review a specific room insight.</p>
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
                <p className="chapter-hint">This room starts with the design brief. Additional insights appear in the next room.</p>
              ))}

              {showFullDetails && revealOutcome && (
                <section className="before-after-panel section-parallax section-parallax-mid sidebar-item-animate">
                  <div className={`transform-panel ${isGeneratingPlan ? 'is-processing' : ''} ${transformSweepTick ? 'sweep-once' : ''}`}>
                    <div className="transform-header">
                      <p className="virtual-eyebrow">Concept Progress</p>
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
                      onChange={(event) => setStoryProgress(Number(event.target.value))}
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
            <button
              type="button"
              className={`room-summary-cta ${activeRoom.id === 'action' ? 'is-primary' : 'is-secondary'}`}
              onClick={handleRoomCta}
            >
              {activeRoom.cta}
            </button>
          </div>
          <details className="room-more-actions">
            <summary>More actions</summary>
            <div className="room-more-actions-body">
              <button type="button" className="room-secondary-link" onClick={goToOverview}>Back to Room Map</button>
              <button type="button" className="room-secondary-link" onClick={resetTour}>Restart Tour</button>
            </div>
          </details>
        </section>
      </>
    )}

    <div id={proControlsId} hidden={!showProControls}>
      <>
        <section className="settings-panel">
          <p className="virtual-eyebrow">Tour Controls</p>
          <div className="settings-row">
            <span>Theme</span>
            <div className="chip-row">
              {Object.keys(themePresets).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`tiny-chip ${themeMode === mode ? 'active' : ''}`}
                  onClick={() => setThemeMode(mode)}
                  aria-pressed={themeMode === mode}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span>Material</span>
            <div className="chip-row">
              {Object.keys(materialPresets).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`tiny-chip ${materialMode === mode ? 'active' : ''}`}
                  onClick={() => setMaterialMode(mode)}
                  aria-pressed={materialMode === mode}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="toggle-row">
            <button type="button" className={`tiny-chip ${ambientMotion ? 'active' : ''}`} onClick={() => setAmbientMotion((v) => !v)} aria-pressed={ambientMotion}>Motion</button>
            <button type="button" className={`tiny-chip ${narrativeEnabled ? 'active' : ''}`} onClick={() => setNarrativeEnabled((v) => !v)} aria-pressed={narrativeEnabled}>Guidance</button>
            <button type="button" className={`tiny-chip ${soundEnabled ? 'active' : ''}`} onClick={() => setSoundEnabled((v) => !v)} aria-pressed={soundEnabled}>Sound</button>
          </div>
          <div className="settings-row">
            <button type="button" className="room-secondary-link" onClick={resetPreferences}>
              Reset Preferences
            </button>
          </div>
        </section>
        <section className="achievement-panel">
          <p className="virtual-eyebrow">Progress</p>
          <div className="achievement-list">
            {achievements.map((item) => (
              <span key={item.id} className={`achievement-badge ${item.unlocked ? 'unlocked' : ''}`}>{item.label}</span>
            ))}
          </div>
        </section>
      </>
    </div>

    <p className="sr-only" role="status" aria-live="polite">
      {tourStatus}
    </p>
    {narrativeLine && (
      <p key={activeStoryChapter.id} className="narrative-line" role="status" aria-live="polite">
        {narrativeLine}
      </p>
    )}
    <button
      type="button"
      className="pro-controls-link"
      onClick={() => setShowProControls((v) => !v)}
      aria-expanded={showProControls}
      aria-controls={proControlsId}
    >
      {showProControls ? 'Hide Controls' : 'Show Controls'}
    </button>
    </aside>
  );
};

export default Sidebar;

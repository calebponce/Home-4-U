import React, { useEffect, useMemo, useState, useRef, useCallback, useId } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Wand2, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { projectsAPI, stylesAPI } from '../services/api';
import { resolveStyleContext, serializeStyleContext, styleSlug } from '../utils/styleContext';
import {
  extractImageProfile,
  getBudgetAmount,
  inferDetectedTags,
  renderConceptPreview,
} from '../utils/workspaceDesign';
import './Workspace.css';

const ROOM_TYPE_OPTIONS = [
  'Living Room',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Home Office',
  'Dining Room',
];

const Workspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const styleKey = (params.get('style') || '').toLowerCase();
  const selectedStyle = (
    location.state?.selectedStyle && typeof location.state.selectedStyle === 'object'
      ? location.state.selectedStyle
      : null
  );
  const [fetchedStyle, setFetchedStyle] = useState(null);
  const effectiveStyle = fetchedStyle || selectedStyle;
  const styleInfo = useMemo(
    () => resolveStyleContext({ styleKey, style: effectiveStyle }),
    [effectiveStyle, styleKey],
  );
  const selectedStyleId = fetchedStyle?.id ?? selectedStyle?.id ?? null;

  useEffect(() => {
    if (selectedStyle) {
      setFetchedStyle(selectedStyle);
      return undefined;
    }
    if (!styleKey) {
      setFetchedStyle(null);
      return undefined;
    }

    let cancelled = false;
    setFetchedStyle(null);

    stylesAPI.getAll()
      .then((response) => {
        if (cancelled) return;
        const match = (response.data || []).find((style) => (
          styleSlug(style?.name) === styleKey || String(style?.name || '').toLowerCase() === styleKey
        ));
        setFetchedStyle(match ? serializeStyleContext(match) : null);
      })
      .catch(() => {
        if (!cancelled) setFetchedStyle(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStyle, styleKey]);

  const [intensity, setIntensity] = useState(60);
  const [budget, setBudget] = useState('medium');
  const [lighting, setLighting] = useState('warm');
  const [roomType, setRoomType] = useState('Living Room');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewState, setPreviewState] = useState('before');
  const [status, setStatus] = useState('Awaiting upload');
  const [roomImage, setRoomImage] = useState(null);
  const [roomFile, setRoomFile] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [revealPct, setRevealPct] = useState(0); // 0=after fully, 100=before fully
  const [isRevealDragging, setIsRevealDragging] = useState(false);
  const [showSuccessGlow, setShowSuccessGlow] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisProject, setAnalysisProject] = useState(null);
  const [workspaceError, setWorkspaceError] = useState('');
  const shoppingPlanRef = useRef(null);
  const generateBtnRef = useRef(null);
  const previewComboRef = useRef(null);
  const comparisonHandleRef = useRef(null);
  const isMountedRef = useRef(false);
  const isRevealDraggingRef = useRef(false);
  const generationTimersRef = useRef({
    textInterval: null,
    completionTimeout: null,
    glowTimeout: null,
    revealRaf: null,
  });
  const revealHintId = useId();
  const budgetAmount = useMemo(() => getBudgetAmount(budget), [budget]);
  const selectedScore = useMemo(() => {
    if (!analysisResult?.style_scores?.length) return null;
    return analysisResult.style_scores.find((item) => item.style_name === (analysisResult.selected_style?.name || styleInfo.name))
      || analysisResult.style_scores[0];
  }, [analysisResult, styleInfo.name]);
  const workspaceTone = String(styleInfo.key || styleKey || 'default').toLowerCase();

  const steps = useMemo(() => {
    const uploadDone = !!roomImage;
    const generateDone = !!generatedImage;
    const reviewDone = generateDone && previewState === 'after';

    return [
      { key: 'upload', label: 'Upload Room Photo', done: uploadDone, icon: Upload },
      { key: 'generate', label: 'Generate Plan', done: generateDone, icon: Wand2 },
      { key: 'review', label: 'Review Result', done: reviewDone, icon: CheckCircle2 },
    ];
  }, [generatedImage, previewState, roomImage]);

  const activeStepIndex = useMemo(() => {
    const firstIncomplete = steps.findIndex((step) => !step.done);
    return firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;
  }, [steps]);

  const clearGenerationTimers = useCallback(() => {
    const timers = generationTimersRef.current;
    if (timers.textInterval) {
      window.clearInterval(timers.textInterval);
      timers.textInterval = null;
    }
    if (timers.completionTimeout) {
      window.clearTimeout(timers.completionTimeout);
      timers.completionTimeout = null;
    }
    if (timers.glowTimeout) {
      window.clearTimeout(timers.glowTimeout);
      timers.glowTimeout = null;
    }
    if (timers.revealRaf) {
      window.cancelAnimationFrame(timers.revealRaf);
      timers.revealRaf = null;
    }
  }, []);

  const clampRevealPct = useCallback((value) => {
    setRevealPct(Math.min(100, Math.max(0, value)));
  }, []);

  const updateRevealFromClientX = useCallback((clientX) => {
    const rect = previewComboRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const nextPct = ((clientX - rect.left) / rect.width) * 100;
    clampRevealPct(nextPct);
  }, [clampRevealPct]);

  const stopRevealDrag = useCallback((event) => {
    if (event?.currentTarget && event.pointerId !== undefined && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isRevealDraggingRef.current = false;
    setIsRevealDragging(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearGenerationTimers();
      stopRevealDrag();
    };
  }, [clearGenerationTimers, stopRevealDrag]);

  useEffect(() => {
    clearGenerationTimers();
    setIsGenerating(false);
    setShowSuccessGlow(false);
    setProcessingText('');
    setProcessingLevel(0);
    setStatus('Awaiting upload');
    setPreviewState('before');
    setGeneratedImage(null);
    setAnalysisResult(null);
    setWorkspaceError('');
    stopRevealDrag();
  }, [styleInfo.key, clearGenerationTimers, stopRevealDrag]);

  const loadDemo = (url, nextRoomType) => {
    clearGenerationTimers();
    setIsGenerating(false);
    setShowSuccessGlow(false);
    setProcessingText('');
    setProcessingLevel(0);
    setWorkspaceError('');
    setAnalysisResult(null);
    setAnalysisProject(null);
    setRoomImage(url);
    setRoomFile(null);
    setGeneratedImage(null);
    if (nextRoomType) setRoomType(nextRoomType);
    setPreviewState('before');
    setStatus('Sample room loaded');
  };

  const [processingText, setProcessingText] = useState('');
  const [processingLevel, setProcessingLevel] = useState(0);

  useEffect(() => {
    const prevScene = document.body.dataset.scene;
    const prevStyle = document.body.dataset.style;
    document.body.dataset.scene = 'workspace';
    document.body.dataset.style = String(styleInfo.key || styleKey || '').toLowerCase();

    return () => {
      if (document.body.dataset.scene === 'workspace') {
        if (prevScene) document.body.dataset.scene = prevScene;
        else delete document.body.dataset.scene;
      }
      if (document.body.dataset.style === String(styleInfo.key || styleKey || '').toLowerCase()) {
        if (prevStyle) document.body.dataset.style = prevStyle;
        else delete document.body.dataset.style;
      }
    };
  }, [styleInfo.key, styleKey]);

  useEffect(() => {
    if (generatedImage && previewState !== 'processing') return;
    stopRevealDrag();
  }, [generatedImage, previewState, stopRevealDrag]);

  const revealValueText = useMemo(() => {
    const beforePct = Math.round(revealPct);
    const afterPct = Math.max(0, 100 - beforePct);
    return `Before ${beforePct} percent visible, After ${afterPct} percent visible`;
  }, [revealPct]);

  const triggerSuccessState = useCallback(() => {
    setRevealPct(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const start = performance.now();
      const duration = 800;
      const animate = (now) => {
        if (!isMountedRef.current) return;
        const t = Math.min(1, (now - start) / duration);
        const easeOutQuart = 1 - Math.pow(1 - t, 4);
        setRevealPct(60 * easeOutQuart);
        if (t < 1) {
          generationTimersRef.current.revealRaf = window.requestAnimationFrame(animate);
        } else {
          generationTimersRef.current.revealRaf = null;
        }
      };
      generationTimersRef.current.revealRaf = window.requestAnimationFrame(animate);
    } else {
      setRevealPct(60);
    }

    setShowSuccessGlow(true);
    generationTimersRef.current.glowTimeout = window.setTimeout(() => {
      generationTimersRef.current.glowTimeout = null;
      if (!isMountedRef.current) return;
      setShowSuccessGlow(false);
    }, 2000);
  }, []);

  const handleGenerate = async () => {
    if (isGenerating || !roomImage) return;

    clearGenerationTimers();
    setIsGenerating(true);
    setWorkspaceError('');
    setAnalysisResult(null);
    setGeneratedImage(null);
    setShowSuccessGlow(false);
    setPreviewState('processing');
    setProcessingLevel(0.08);
    setProcessingText('Creating project workspace...');
    setStatus('Syncing project...');

    try {
      let project = analysisProject;
      if (!project) {
        const createdProject = await projectsAPI.create(roomType);
        project = createdProject.data;
      }

      const needsProjectUpdate = (
        project.room_type !== roomType
        || Math.round(Number(project.budget || 0)) !== budgetAmount
      );
      if (needsProjectUpdate) {
        setStatus('Updating project brief...');
        setProcessingText('Saving room type and budget constraints...');
        setProcessingLevel(0.18);
        const updatedProject = await projectsAPI.update(project.id, {
          room_type: roomType,
          budget: budgetAmount,
        });
        project = updatedProject.data;
      }

      setAnalysisProject(project);

      if (roomFile) {
        setStatus('Uploading room photo...');
        setProcessingText('Saving the selected room photo to the backend...');
        setProcessingLevel(0.32);
        const photoResponse = await projectsAPI.uploadPhoto(project.id, roomFile);
        project = photoResponse.data;
        setAnalysisProject(project);
      }

      setStatus('Extracting room signals...');
      setProcessingText('Reading light, color, and composition cues from the room image...');
      setProcessingLevel(0.5);
      const imageProfile = roomFile ? await extractImageProfile(roomImage) : null;
      const detectedTags = inferDetectedTags(imageProfile);

      setStatus('Calculating style scores...');
      setProcessingText(`Comparing the saved room with ${styleInfo.name} and the rest of the Home4U style library...`);
      setProcessingLevel(0.72);
      const analysisResponse = await projectsAPI.analyze(project.id, {
        style_id: selectedStyleId,
        style_slug: styleInfo.key || styleKey,
        style_name: styleInfo.name,
        room_type: roomType,
        intensity,
        lighting,
        budget_tier: budget,
        image_profile: imageProfile,
        detected_tags: detectedTags,
      });
      const nextAnalysis = analysisResponse.data;
      setAnalysisResult(nextAnalysis);
      setAnalysisProject(nextAnalysis.project);

      setStatus('Rendering concept board...');
      setProcessingText('Composing a presentation-ready concept board from the backend analysis...');
      setProcessingLevel(0.9);
      const conceptBoard = await renderConceptPreview({
        sourceUrl: roomImage,
        analysis: nextAnalysis,
        styleInfo,
      });

      if (!isMountedRef.current) return;
      setGeneratedImage(conceptBoard || roomImage);
      setStatus('Analysis ready');
      setProcessingText('Plan generated');
      setProcessingLevel(1);
      setPreviewState('after');
      triggerSuccessState();
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const fallbackMessage = roomFile
        ? 'The backend could not process this room right now.'
        : 'Sample rooms can generate a plan, but photo upload is only available for local images.';
      setWorkspaceError(typeof detail === 'string' ? detail : fallbackMessage);
      setStatus('Analysis failed');
      setPreviewState('before');
      setProcessingText('');
      setProcessingLevel(0);
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleMagneticMove = (e) => {
    if (!generateBtnRef.current || isGenerating || !roomImage) return;
    const btn = generateBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 100) {
      const moveX = deltaX * 0.2;
      const moveY = deltaY * 0.2;
      btn.style.transform = `translate(${moveX}px, ${moveY}px) translateY(-1px)`;
    } else {
      btn.style.transform = '';
    }
  };

  const handleMagneticLeave = () => {
    if (generateBtnRef.current) {
      generateBtnRef.current.style.transform = '';
    }
  };

  const handleOpenLinkedWalkthrough = () => {
    if (!analysisProject) return;

    const walkthroughParams = new URLSearchParams();
    const linkedStyle = analysisResult?.selected_style?.name || styleInfo.name;
    const linkedStyleSlug = linkedStyle ? styleSlug(linkedStyle) : '';
    if (linkedStyleSlug) walkthroughParams.set('style', linkedStyleSlug);
    walkthroughParams.set('project', String(analysisProject.id));

    navigate(`/virtual-tour?${walkthroughParams.toString()}`, {
      state: {
        ...(analysisResult?.selected_style ? { selectedStyle: analysisResult.selected_style } : {}),
        projectId: analysisProject.id,
      },
    });
  };

  return (
    <div
      className={`workspace ${showSuccessGlow ? 'success-glow-active' : ''}`}
      data-style={workspaceTone}
      onMouseMove={handleMagneticMove}
    >
      <div className="workspace-atmosphere" aria-hidden="true">
        <span className="workspace-orb workspace-orb-a"></span>
        <span className="workspace-orb workspace-orb-b"></span>
        <span className="workspace-orb workspace-orb-c"></span>
      </div>
      <div className="page-shell workspace-shell">
        <header className="workspace-header">
          <div className="workspace-header-copy">
            <p className="workspace-eyebrow">
              Design Workspace <span className="badge demo-badge">Studio Live</span>
            </p>
            <h1>{styleInfo.name}</h1>
            <p className="workspace-sub">
              {styleInfo.description} Upload a room, sync a real project to the backend, and generate a scored concept board with saved recommendations.
            </p>
            <div className="workspace-hero-metrics studio-hero-metrics" aria-label="Workspace overview">
              <div className="hero-metric-card studio-hero-card">
                <span className="hero-metric-label studio-hero-label">Budget Rail</span>
                <strong className="studio-hero-value">${budgetAmount.toLocaleString()}</strong>
              </div>
              <div className="hero-metric-card studio-hero-card">
                <span className="hero-metric-label studio-hero-label">Lighting Bias</span>
                <strong className="studio-hero-value">{lighting === 'warm' ? 'Warm ambient' : 'Cool focus'}</strong>
              </div>
              <div className="hero-metric-card studio-hero-card">
                <span className="hero-metric-label studio-hero-label">System State</span>
                <strong className="studio-hero-value">{analysisResult ? `${Math.round(selectedScore?.score_value || 0)}% aligned` : 'Ready to scan'}</strong>
              </div>
            </div>
          </div>
          <button type="button" className="back-btn studio-btn studio-btn--ghost" onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </header>

        <main className="workspace-main">
        <div className="design-timeline" aria-label="Design progress">
          {steps.map((step, idx) => (
            <div key={step.key} className="timeline-step" aria-current={idx === activeStepIndex ? 'step' : undefined}>
              <div
                className={`timeline-node ${step.done ? 'done' : ''} ${idx === activeStepIndex ? 'active' : ''}`}
                aria-label={`${step.label}${step.done ? ' complete' : idx === activeStepIndex ? ' current' : ''}`}
              >
                <step.icon size={14} className="step-icon" />
              </div>
              <span className="timeline-label">{step.label}</span>
              {idx < steps.length - 1 && <div className="timeline-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>

        <section className={`workspace-canvas state-${previewState}`} data-tilt>
          <div className="canvas-header">
            <span>Room Review</span>
            <span className="status">{status}</span>
          </div>
          <div className="canvas-body">
            <div
              ref={previewComboRef}
              className={`preview-combo ${previewState === 'processing' ? 'is-processing' : ''} ${generatedImage ? 'compare-enabled' : ''} ${isRevealDragging ? 'is-dragging' : ''}`}
              onPointerDown={(e) => {
                if (!generatedImage || previewState === 'processing') return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                e.preventDefault();
                e.currentTarget.setPointerCapture?.(e.pointerId);
                isRevealDraggingRef.current = true;
                setIsRevealDragging(true);
                comparisonHandleRef.current?.focus();
                updateRevealFromClientX(e.clientX);
              }}
              onPointerMove={(e) => {
                if (!isRevealDraggingRef.current) return;
                updateRevealFromClientX(e.clientX);
              }}
              onPointerUp={stopRevealDrag}
              onPointerCancel={stopRevealDrag}
            >
              <div className="preview before">
                <div className="preview-label badge">Before</div>
                {roomImage ? (
                  <img src={roomImage} alt="Uploaded room" className="preview-img" />
                ) : (
                  <span className="preview-placeholder">Upload a room photo to sync a real project and generate a backend-backed concept board.</span>
                )}
              </div>
              <div className="preview after base">
                <div className="preview-label badge">{previewState === 'processing' ? 'Processing…' : 'Concept Board'}</div>
                {previewState === 'processing' && (
                  <div className="processing-overlay" style={{ '--proc': processingLevel }}>
                    <div className="processing-scanner"></div>
                    <div className="processing-grid"></div>
                    <div className="processing-content">
                      <Sparkles className="processing-icon" size={32} />
                      <span className="processing-text">{processingText}</span>
                      <div className="processing-bar"><div className="processing-bar-fill"></div></div>
                    </div>
                  </div>
                )}
                {previewState !== 'processing' && generatedImage && (
                  <img src={generatedImage} alt="Generated concept board" className="preview-img styled-img" />
                )}
                {previewState !== 'processing' && !generatedImage && (
                  <span className="preview-placeholder">Your analyzed concept board will appear here once the backend returns scores and recommendations.</span>
                )}
              </div>
              {generatedImage && (
                <>
                  <div
                    className="reveal-layer"
                    style={{ width: `${revealPct}%` }}
                  >
                    <img src={roomImage} alt="" aria-hidden="true" className="preview-img" />
                  </div>
                  <div
                    ref={comparisonHandleRef}
                    className="preview-divider handle"
                    style={{ left: `${revealPct}%` }}
                    role="slider"
                    aria-label="Before and after comparison"
                    aria-describedby={revealHintId}
                    aria-orientation="horizontal"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(revealPct)}
                    aria-valuetext={revealValueText}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      const isSpaceKey = e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space';
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        clampRevealPct(revealPct - 3);
                      }
                      if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        clampRevealPct(revealPct + 3);
                      }
                      if (e.key === 'PageDown') {
                        e.preventDefault();
                        clampRevealPct(revealPct - 10);
                      }
                      if (e.key === 'PageUp') {
                        e.preventDefault();
                        clampRevealPct(revealPct + 10);
                      }
                      if (e.key === 'Home') {
                        e.preventDefault();
                        setRevealPct(0);
                      }
                      if (e.key === 'End') {
                        e.preventDefault();
                        setRevealPct(100);
                      }
                      if (isSpaceKey || e.key === 'Enter') {
                        e.preventDefault();
                        setRevealPct((current) => (current >= 50 ? 0 : 100));
                      }
                    }}
                  >
                    <span className="handle-knob" title="Drag to compare">
                      <ChevronLeft size={16} />
                      <ChevronRight size={16} />
                    </span>
                  </div>
                  <span id={revealHintId} className="hold-hint">Drag to compare • Space toggles full before and after</span>
                </>
              )}
            </div>
          </div>
          <div className="before-after-bar">
            <span>Original Room</span>
            <span>Concept Board</span>
          </div>
        </section>

        <aside className="workspace-controls" data-tilt>
          <div className="control-group">
            <div className="control-head">
              <span>Selected Style</span>
              <span className="pill">{styleInfo.name || styleKey || 'custom'}</span>
            </div>
            <p className="control-sub">This workspace now saves a real project, uploads local room photos, and persists recommendations to the backend.</p>
          </div>

          <div className="control-group">
            <label htmlFor="room-type">Room Type</label>
            <select id="room-type" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              {ROOM_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="intensity">Style Intensity</label>
            <input
              id="intensity"
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
            />
            <div className="slider-meta">
              <span>Subtle</span>
              <span>{intensity}</span>
              <span>Bold</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="budget">Budget Range</label>
            <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="budget-note">Backed by an estimated project budget of ${budgetAmount.toLocaleString()}.</div>
          </div>

          <div className="control-group toggle-group">
            <label>Lighting Preference</label>
            <div className="toggle-row">
              <button
                type="button"
                className={`toggle ${lighting === 'warm' ? 'active' : ''}`}
                onClick={() => setLighting('warm')}
                aria-pressed={lighting === 'warm'}
              >
                Warm
              </button>
              <button
                type="button"
                className={`toggle ${lighting === 'cool' ? 'active' : ''}`}
                onClick={() => setLighting('cool')}
                aria-pressed={lighting === 'cool'}
              >
                Cool
              </button>
            </div>
          </div>

          <div className="control-group actions">
            <div className="demo-rooms-section">
              <span className="demo-rooms-label">Load Sample Room</span>
              <div className="demo-rooms-buttons">
                <button type="button" className="demo-try-btn" onClick={() => loadDemo('https://images.unsplash.com/photo-1598928506311-c55dd12966c4?auto=format&fit=crop&q=80&w=800', 'Living Room')}>Living Room</button>
                <button type="button" className="demo-try-btn" onClick={() => loadDemo('https://images.unsplash.com/photo-15569101031-c02745a828?auto=format&fit=crop&q=80&w=800', 'Kitchen')}>Kitchen</button>
              </div>
              <p className="control-sub compact">Sample rooms stay local for preview, but they still generate a saved backend plan.</p>
            </div>
            <label className="secondary upload-btn">
              Upload Room Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  clearGenerationTimers();
                  setIsGenerating(false);
                  setShowSuccessGlow(false);
                  setProcessingText('');
                  setProcessingLevel(0);
                  setWorkspaceError('');
                  setAnalysisResult(null);
                  setAnalysisProject(null);
                  setRoomFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (!isMountedRef.current) return;
                    setRoomImage(ev.target?.result || null);
                    setGeneratedImage(null);
                    setPreviewState('before');
                    setStatus('Room loaded');
                  };
                  reader.readAsDataURL(file);
                }}
                hidden
              />
            </label>
            <button 
              type="button"
              ref={generateBtnRef}
              className="primary generate-btn" 
              onClick={handleGenerate} 
              disabled={isGenerating || !roomImage}
              onMouseLeave={handleMagneticLeave}
            >
              {isGenerating ? 'Syncing…' : 'Generate Plan'}
            </button>
            <button
              type="button"
              className="secondary-link-btn"
              onClick={() => shoppingPlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              disabled={!analysisResult?.shopping_plan?.length}
              aria-disabled={!analysisResult?.shopping_plan?.length}
              title={analysisResult?.shopping_plan?.length ? 'Jump to the shopping plan' : 'Run analysis to unlock sourcing'}
            >
              {analysisResult?.shopping_plan?.length ? 'Open Shopping Plan' : 'Run Analysis To Unlock Sourcing'}
            </button>
            {workspaceError && (
              <p className="workspace-error" role="alert">{workspaceError}</p>
            )}
          </div>

          <div className="control-group">
            <div className="control-head">
              <span>Project Sync</span>
              <span className="metric-pill">{analysisProject ? `#${analysisProject.id}` : 'Not saved yet'}</span>
            </div>
            <p className="control-sub">
              {analysisProject
                ? `Room type and budget are now linked to project #${analysisProject.id}.`
                : 'The next analysis run will create a real project record in the backend.'}
            </p>
            {analysisProject && (
              <>
                <button type="button" className="secondary-link-btn" onClick={() => navigate(`/project/${analysisProject.id}`)}>
                  Open Project Plan
                </button>
                <button
                  type="button"
                  className="secondary-link-btn"
                  onClick={handleOpenLinkedWalkthrough}
                  disabled={!analysisResult?.shopping_plan?.length}
                  aria-disabled={!analysisResult?.shopping_plan?.length}
                  title={analysisResult?.shopping_plan?.length ? 'Open the linked walkthrough for this saved project' : 'Run analysis to open a linked walkthrough'}
                >
                  {analysisResult?.shopping_plan?.length ? 'Open Linked Walkthrough' : 'Run Analysis To Link Walkthrough'}
                </button>
              </>
            )}
          </div>

          {analysisResult && (
            <div className="control-group analysis-group">
              <div className="control-head">
                <span>Analysis Snapshot</span>
                <span className="metric-pill">{Math.round(selectedScore?.score_value || 0)}% Match</span>
              </div>
              <p className="control-sub">{analysisResult.summary}</p>
              {analysisResult.image_profile?.dominant_hex && (
                <div className="analysis-chip-row studio-chip-row">
                  <span className="analysis-chip studio-chip">Dominant tone {analysisResult.image_profile.dominant_hex}</span>
                  <span className="analysis-chip studio-chip">Brightness {Math.round((analysisResult.image_profile.average_brightness || 0) * 100)}%</span>
                </div>
              )}
              {!!analysisResult.suggested_tags?.length && (
                <div className="analysis-chip-row studio-chip-row">
                  {analysisResult.suggested_tags.slice(0, 4).map((tag) => (
                    <span key={tag.id} className="analysis-chip studio-chip">{tag.name}</span>
                  ))}
                </div>
              )}
              {!!analysisResult.recommendations?.length && (
                <div className="analysis-list">
                  {analysisResult.recommendations.slice(0, 3).map((recommendation) => (
                    <div key={recommendation.id} className="analysis-list-item">
                      <span className="analysis-list-score">{recommendation.priority_score.toFixed(1)}</span>
                      <div>
                        <p>{recommendation.description}</p>
                        <span>${Number(recommendation.estimated_cost).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!!analysisResult.shopping_plan?.length && (
                <div ref={shoppingPlanRef} className="shopping-plan">
                  <div className="control-head">
                    <span>Shopping Plan</span>
                    <span className="metric-pill">
                      ${analysisResult.shopping_plan.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="control-sub">
                    Start with these purchases to move the room toward the {analysisResult.selected_style?.name || styleInfo.name} look while staying near the selected budget.
                  </p>
                  <div className="shopping-plan-list">
                    {analysisResult.shopping_plan.map((item) => (
                      <article key={item.key} className="shopping-plan-card">
                        <div className="shopping-plan-topline">
                          <span className="shopping-plan-step">{item.priority_label}</span>
                          <span className="shopping-plan-category">{item.category}</span>
                        </div>
                        <h4>{item.label}</h4>
                        <p>{item.purchase_reason}</p>
                        <div className="shopping-plan-meta">
                          <span>{item.room_zone}</span>
                          <span>${Number(item.estimated_cost).toLocaleString()}</span>
                          <span>{Math.round((item.budget_share || 0) * 100)}% of budget</span>
                        </div>
                        <div className="shopping-plan-query">
                          <span>Look for</span>
                          <strong>{item.search_query}</strong>
                        </div>
                        {!!item.products?.length && (
                          <div className="shopping-product-grid">
                            {item.products.slice(0, 2).map((product) => (
                              <article key={product.key} className="shopping-product-card">
                                <div className={`shopping-product-thumb ${product.image_url ? 'has-image' : 'is-placeholder'}`}>
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} loading="lazy" />
                                  ) : (
                                    <span>{product.retailer.slice(0, 1)}</span>
                                  )}
                                </div>
                                <div className="shopping-product-copy">
                                  <div className="shopping-product-topline">
                                    <span className="shopping-product-badge">{product.match_label}</span>
                                    <span className="shopping-product-retailer">{product.retailer}</span>
                                  </div>
                                  <h5>{product.name}</h5>
                                  <p>{product.match_reason}</p>
                                  <div className="shopping-product-meta">
                                    <span>{product.price_label}</span>
                                    <span>${Number(product.estimated_cost).toLocaleString()}</span>
                                  </div>
                                  <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shopping-product-link"
                                  >
                                    <span>View Pick</span>
                                    <ArrowUpRight size={14} />
                                  </a>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                        <div className="shopping-plan-sources">
                          {item.sources.map((source) => (
                            <a
                              key={`${item.key}-${source.retailer}`}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="shopping-source-link"
                            >
                              Search {source.retailer}
                            </a>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
        </main>
      </div>
    </div>
  );
};

export default Workspace;

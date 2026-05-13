import React, { useEffect, useMemo, useState, useRef, useCallback, useId } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Wand2, CheckCircle2, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { projectsAPI, stylesAPI } from '../services/api';
import { resolveStyleContext, serializeStyleContext, styleSlug } from '../utils/styleContext';
import {
  extractImageProfile,
  getBudgetAmount,
  inferDetectedTags,
  normalizeRoomUpload,
  renderConceptPreview,
  ROOM_UPLOAD_SOURCE_MAX_BYTES,
  ROOM_UPLOAD_TARGET_MAX_BYTES,
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

const ALLOWED_ROOM_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const resolveWorkspaceProjectImageUrl = (photoUrl) => {
  if (!photoUrl) return '';
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl;
  if (photoUrl.startsWith('/uploads')) return photoUrl;
  if (photoUrl.startsWith('uploads/')) return `/${photoUrl}`;
  return `/uploads/${photoUrl}`;
};

const formatWorkspaceRequestError = (error, stage = 'analyze-room') => {
  const detail = error?.response?.data?.detail;
  const status = error?.response?.status;
  const stageCopy = {
    'create-project': 'start your plan',
    'update-project': 'save your room settings',
    'upload-photo': 'upload the room photo',
    'extract-signals': 'read the room photo',
    'analyze-room': 'build the plan',
  };
  const action = stageCopy[stage] || 'complete this step';

  if (status === 401) return 'Your session expired. Please log in again.';
  if (status === 403) return 'Access denied for this room project.';
  if (status === 404) return detail || 'This room project could not be found.';
  if (status === 413) return 'The selected room photo is too large. Use an image under 20 MB.';
  if (status === 415) return 'Unsupported image format. Upload a PNG, JPG, or WebP file.';
  if (status && status >= 500) return detail || `Server error while trying to ${action}.`;
  if (status && status >= 400) return detail || `Could not ${action}.`;
  if (error?.code === 'ECONNABORTED') return `Request timed out while trying to ${action}.`;
  if (error?.message?.toLowerCase().includes('network')) {
    return `Network issue while trying to ${action}. Check your connection and try again.`;
  }
  return detail || `Could not ${action}. Please try again.`;
};

const Workspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const styleKey = (params.get('style') || '').toLowerCase();
  const incomingProjectId = Number(location.state?.projectId || 0) || null;
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

    let cancelled = false;
    setFetchedStyle(null);

    stylesAPI.getAll()
      .then((response) => {
        if (cancelled) return;
        const styles = response.data || [];
        const explicitMatch = styles.find((style) => (
          styleSlug(style?.name) === styleKey || String(style?.name || '').toLowerCase() === styleKey
        ));
        const defaultMatch = styles.find((style) => styleSlug(style?.name) === 'modern') || styles[0] || null;
        const resolvedStyle = styleKey ? explicitMatch : defaultMatch;
        setFetchedStyle(resolvedStyle ? serializeStyleContext(resolvedStyle) : null);
      })
      .catch(() => {
        if (!cancelled) setFetchedStyle(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStyle, styleKey]);

  const projectBudget = Number(location.state?.budget || 0);
  const inferredBudgetTier = projectBudget >= 5000 ? 'high' : projectBudget > 0 && projectBudget < 2000 ? 'low' : 'medium';
  const [intensity, setIntensity] = useState(60);
  const [budget, setBudget] = useState(inferredBudgetTier);
  const [lighting, setLighting] = useState('warm');
  const [roomType, setRoomType] = useState(location.state?.roomType || 'Living Room');
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
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const [selectedRoomLabel, setSelectedRoomLabel] = useState('');
  const shoppingPlanRef = useRef(null);
  const generateBtnRef = useRef(null);
  const previewComboRef = useRef(null);
  const comparisonHandleRef = useRef(null);
  const isMountedRef = useRef(false);
  const isRevealDraggingRef = useRef(false);
  const lastSuccessfulRunRef = useRef(null);
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
  const intensityGuidance = useMemo(() => {
    if (intensity <= 33) {
      return 'Low intensity keeps recommendations closer to the room you already have.';
    }
    if (intensity >= 67) {
      return 'High intensity pushes bolder style changes and more visible statement pieces.';
    }
    return 'Medium intensity balances practical updates with visible style change.';
  }, [intensity]);
  const generateGuidance = roomImage
    ? 'Generate Plan will review the room, save your plan, and build recommendations plus a shopping plan.'
    : 'Load a sample room or upload your own photo to enable Generate Plan.';
  const budgetGuidance = useMemo(
    () => `This sets the shopping-plan target at about $${budgetAmount.toLocaleString()}. It is guidance, not a required spend.`,
    [budgetAmount],
  );

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
    setWorkspaceNotice('');
    lastSuccessfulRunRef.current = null;
    stopRevealDrag();
  }, [styleInfo.key, clearGenerationTimers, stopRevealDrag]);

  useEffect(() => {
    if (location.state?.roomType) {
      setRoomType(location.state.roomType);
    }
    if (location.state?.budget) {
      const nextBudget = Number(location.state.budget || 0);
      setBudget(nextBudget >= 5000 ? 'high' : nextBudget > 0 && nextBudget < 2000 ? 'low' : 'medium');
    }
  }, [location.state]);

  useEffect(() => {
    if (!incomingProjectId) return undefined;

    let cancelled = false;

    projectsAPI.getById(incomingProjectId)
      .then((response) => {
        if (cancelled) return;
        const project = response.data;
        setAnalysisProject(project);
        if (project?.room_type) {
          setRoomType(project.room_type);
        }
        const nextBudget = Number(project?.budget || 0);
        if (Number.isFinite(nextBudget)) {
          setBudget(nextBudget >= 5000 ? 'high' : nextBudget > 0 && nextBudget < 2000 ? 'low' : 'medium');
        }
        if (!roomFile && !roomImage && project?.photo_url) {
          setRoomImage(resolveWorkspaceProjectImageUrl(project.photo_url));
          setSelectedRoomLabel(`${project.room_type || 'Room'} project photo`);
          setStatus('Project loaded');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkspaceNotice('Could not load the saved project. A new project will be created on the next plan run.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [incomingProjectId, roomFile, roomImage]);

  const loadDemo = (url, nextRoomType) => {
    clearGenerationTimers();
    setIsGenerating(false);
    setShowSuccessGlow(false);
    setProcessingText('');
    setProcessingLevel(0);
    setWorkspaceError('');
    setWorkspaceNotice('');
    setAnalysisResult(null);
    setRoomImage(url);
    setRoomFile(null);
    setGeneratedImage(null);
    setSelectedRoomLabel(`${nextRoomType || roomType} sample room`);
    lastSuccessfulRunRef.current = null;
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

  const handleRoomFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_ROOM_UPLOAD_TYPES.has(file.type)) {
      setWorkspaceNotice('');
      setWorkspaceError('Choose a PNG, JPG, or WebP image so Home4U can analyze the room.');
      setStatus('Room load failed');
      return;
    }

    setWorkspaceError('');
    setWorkspaceNotice('');
    setStatus(`Loading ${file.name}...`);

    try {
      const normalizedUpload = await normalizeRoomUpload(file, {
        targetMaxBytes: ROOM_UPLOAD_TARGET_MAX_BYTES,
        maxSourceBytes: ROOM_UPLOAD_SOURCE_MAX_BYTES,
      });
      if (!isMountedRef.current) return;

      clearGenerationTimers();
      setIsGenerating(false);
      setShowSuccessGlow(false);
      setProcessingText('');
      setProcessingLevel(0);
      setAnalysisResult(null);
      setRoomFile(normalizedUpload.file);
      setRoomImage(normalizedUpload.previewUrl || null);
      setGeneratedImage(null);
      setPreviewState('before');
      setSelectedRoomLabel(file.name);
      lastSuccessfulRunRef.current = null;
      setWorkspaceNotice(normalizedUpload.notice || '');
      setStatus('Room loaded');
    } catch (error) {
      if (!isMountedRef.current) return;
      setWorkspaceNotice('');
      if (error?.message === 'SOURCE_TOO_LARGE') {
        setWorkspaceError('Room photos over 40 MB are too large to optimize in the browser.');
      } else if (error?.message === 'CANVAS_UNAVAILABLE') {
        setWorkspaceError('This browser could not optimize the selected image. Try a smaller file.');
      } else if (error?.message === 'OPTIMIZE_FAILED') {
        setWorkspaceError('Home4U could not shrink that image enough. Try a slightly smaller photo.');
      } else {
        setWorkspaceError('Could not read the selected image file. Try a different image.');
      }
      setStatus('Room load failed');
    }
  };

  const handleGenerate = async () => {
    if (isGenerating || !roomImage) return;

    const previousSuccessfulRun = lastSuccessfulRunRef.current;
    let stage = 'create-project';

    clearGenerationTimers();
    setIsGenerating(true);
    setWorkspaceError('');
    setWorkspaceNotice('');
    setAnalysisResult(null);
    setGeneratedImage(null);
    setShowSuccessGlow(false);
    setPreviewState('processing');
    setProcessingLevel(0.08);
    setProcessingText('Preparing your saved plan...');
    setStatus('Syncing project...');

    try {
      let project = analysisProject;
      if (!project) {
        stage = 'create-project';
        const createdProject = await projectsAPI.create(roomType);
        project = createdProject.data;
      }

      const needsProjectUpdate = (
        project.room_type !== roomType
        || Math.round(Number(project.budget || 0)) !== budgetAmount
      );
      if (needsProjectUpdate) {
        stage = 'update-project';
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
        stage = 'upload-photo';
        setStatus('Uploading room photo...');
        setProcessingText('Saving the selected room photo...');
        setProcessingLevel(0.32);
        const photoResponse = await projectsAPI.uploadPhoto(project.id, roomFile);
        project = photoResponse.data;
        setAnalysisProject(project);
      }

      stage = 'extract-signals';
      setStatus('Extracting room signals...');
      setProcessingText('Reading light, color, and layout cues from the room image...');
      setProcessingLevel(0.5);
      const imageProfile = roomFile ? await extractImageProfile(roomImage) : null;
      const detectedTags = inferDetectedTags(imageProfile);

      stage = 'analyze-room';
      setStatus('Calculating style scores...');
      setProcessingText(`Comparing the room with ${styleInfo.name} and nearby style directions...`);
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
      setProcessingText('Turning the analysis into a visual plan preview...');
      setProcessingLevel(0.9);
      let conceptBoard = roomImage;
      try {
        conceptBoard = await renderConceptPreview({
          sourceUrl: roomImage,
          analysis: nextAnalysis,
          styleInfo,
        }) || roomImage;
      } catch {
        conceptBoard = roomImage;
        setWorkspaceNotice('Plan generated, but the visual preview used the original room image.');
      }

      if (!isMountedRef.current) return;
      setGeneratedImage(conceptBoard);
      setStatus('Analysis ready');
      setProcessingText('Plan generated');
      setProcessingLevel(1);
      setPreviewState('after');
      lastSuccessfulRunRef.current = {
        analysisResult: nextAnalysis,
        analysisProject: nextAnalysis.project,
        generatedImage: conceptBoard,
        revealPct: 60,
      };
      triggerSuccessState();
    } catch (error) {
      const recoveredPreviousPlan = Boolean(previousSuccessfulRun?.analysisResult && previousSuccessfulRun?.generatedImage);
      if (recoveredPreviousPlan) {
        setAnalysisResult(previousSuccessfulRun.analysisResult);
        setAnalysisProject(previousSuccessfulRun.analysisProject || null);
        setGeneratedImage(previousSuccessfulRun.generatedImage);
        setPreviewState('after');
        setRevealPct(previousSuccessfulRun.revealPct ?? 60);
        setStatus('Previous plan restored');
        setWorkspaceNotice('Your previous plan is still available while you retry.');
      } else {
        setStatus('Analysis failed');
        setPreviewState('before');
      }
      const message = formatWorkspaceRequestError(error, stage);
      setWorkspaceError(recoveredPreviousPlan ? `${message} Previous plan restored while you retry.` : message);
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
              {styleInfo.description} Upload a room, set your preferences, and generate a saved plan with tailored recommendations.
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

        <section className={`workspace-canvas state-${previewState}`}>
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
                  <span className="preview-placeholder">Upload a room photo or load a sample room to generate your plan preview.</span>
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
                  <span className="preview-placeholder"></span>
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

        <aside className="workspace-controls">
          <div className="control-group">
            <div className="control-head">
              <span>Selected Style</span>
              <span className="pill">{styleInfo.name || styleKey || 'custom'}</span>
            </div>
            <p className="control-sub">Set the room details below, then use a sample room or upload your own photo to generate a saved design plan.</p>
          </div>

          <div className="control-group">
            <label htmlFor="room-type">Room Type</label>
            <select id="room-type" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              {ROOM_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p className="control-sub compact">This helps Home4U prioritize the right layout, furniture, and styling moves for the room.</p>
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
              <span>{intensity}%</span>
              <span>Bold</span>
            </div>
            <p className="control-sub compact">{intensityGuidance}</p>
          </div>

          <div className="control-group">
            <label htmlFor="budget">Budget Range</label>
            <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="budget-note">{budgetGuidance}</div>
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
            <p className="control-sub compact">Choose the mood you want the finished room to support, not necessarily the current lighting in the photo.</p>
          </div>

          <div className="control-group actions">
            <div className="demo-rooms-section">
              <span className="demo-rooms-label">Load Sample Room</span>
              <p className="control-sub compact">Choose one room source: use a sample room to try the flow quickly, or upload your own photo for a personalized plan.</p>
              <div className="demo-rooms-buttons">
                <button type="button" className="demo-try-btn" onClick={() => loadDemo('https://images.unsplash.com/photo-1598928506311-c55dd12966c4?auto=format&fit=crop&q=80&w=800', 'Living Room')}>Living Room</button>
                <button type="button" className="demo-try-btn" onClick={() => loadDemo('https://images.unsplash.com/photo-15569101031-c02745a828?auto=format&fit=crop&q=80&w=800', 'Kitchen')}>Kitchen</button>
              </div>
              <p className="control-sub compact">Sample rooms are quick demos, but Home4U still saves the resulting plan so you can revisit it later.</p>
            </div>
            {selectedRoomLabel && (
              <p className="control-sub compact">Loaded asset: {selectedRoomLabel}</p>
            )}
            <label className="secondary upload-btn">
              Upload Room Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleRoomFileChange}
                hidden
              />
            </label>
            <p className="control-sub compact">PNG, JPG, or WebP. Large images are optimized automatically before upload when possible.</p>
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
            <p className="control-sub compact">{generateGuidance}</p>
            <button
              type="button"
              className="secondary-link-btn"
              onClick={() => shoppingPlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              disabled={!analysisResult?.shopping_plan?.length}
              aria-disabled={!analysisResult?.shopping_plan?.length}
              title={analysisResult?.shopping_plan?.length ? 'Jump to the shopping plan' : 'Finish a plan first to unlock the shopping plan'}
            >
              {analysisResult?.shopping_plan?.length ? 'Open Shopping Plan' : 'Unlock Shopping After Planning'}
            </button>
            {(workspaceError || workspaceNotice) && (
              <div className="workspace-feedback">
                {workspaceError && (
                  <>
                    <p className="workspace-error" role="alert">{workspaceError}</p>
                    {roomImage && (
                      <button
                        type="button"
                        className="secondary-link-btn workspace-retry-btn"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                      >
                        Retry Generate Plan
                      </button>
                    )}
                  </>
                )}
                {workspaceNotice && (
                  <p className="workspace-notice" role="status" aria-live="polite">{workspaceNotice}</p>
                )}
              </div>
            )}
          </div>

          <div className="control-group">
            <div className="control-head">
              <span>Saved Plan</span>
              <span className="metric-pill">{analysisProject ? `#${analysisProject.id}` : 'Ready to save'}</span>
            </div>
            <p className="control-sub">
              {analysisProject
                ? `Your room settings and latest plan are saved to project #${analysisProject.id}.`
                : 'Your first successful plan will be saved automatically so you can reopen it later.'}
            </p>
            {analysisProject && (
              <button type="button" className="secondary-link-btn" onClick={() => navigate(`/project/${analysisProject.id}`)}>
                Open Project Plan
              </button>
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
              {analysisResult.scan_assessment && (
                <div className="analysis-chip-row studio-chip-row">
                  <span className={`analysis-chip studio-chip scan-confidence-chip scan-confidence-${analysisResult.scan_assessment.confidence_label}`}>
                    Scan {analysisResult.scan_assessment.confidence_label} ({Math.round(analysisResult.scan_assessment.confidence_score * 100)}%)
                  </span>
                  {analysisResult.scan_assessment.signal_count > 0 && (
                    <span className="analysis-chip studio-chip">
                      {analysisResult.scan_assessment.signal_count} signal{analysisResult.scan_assessment.signal_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
              {!!analysisResult.suggested_tags?.length && (
                <div className="analysis-chip-row studio-chip-row">
                  {analysisResult.suggested_tags.slice(0, 4).map((tag) => (
                    <span key={tag.id} className="analysis-chip studio-chip">{tag.name}</span>
                  ))}
                </div>
              )}
              {analysisResult.room_state && (
                <div className="room-state-block">
                  <div className="analysis-chip-row studio-chip-row">
                    <span className="analysis-chip studio-chip">Open {analysisResult.room_state.openness}</span>
                    <span className="analysis-chip studio-chip">Clutter {analysisResult.room_state.clutter_level}</span>
                    <span className="analysis-chip studio-chip">Contrast {analysisResult.room_state.contrast_level}</span>
                  </div>
                  {analysisResult.room_state.cues?.[0] && (
                    <p className="control-sub compact">{analysisResult.room_state.cues[0]}</p>
                  )}
                </div>
              )}
              {!!analysisResult.recommendations?.length && (
                <div className="analysis-list">
                  {analysisResult.recommendations.slice(0, 3).map((recommendation) => (
                    <div key={recommendation.id} className="analysis-list-item">
                      <span className="analysis-list-score">{recommendation.priority_score.toFixed(1)}</span>
                      <div>
                        <p>{recommendation.description}</p>
                        {recommendation.reason_summary && (
                          <p className="analysis-rec-reason">{recommendation.reason_summary}</p>
                        )}
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

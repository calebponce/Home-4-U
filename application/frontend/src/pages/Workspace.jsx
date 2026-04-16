import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Wand2, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import './Workspace.css';

const fallbackStyles = {
  modern: {
    name: 'Modern Studio',
    description: 'Clean lines, minimal decor, neutral colors with bold accents.',
  },
  industrial: {
    name: 'Industrial Loft',
    description: 'Raw materials, bold textures, open layouts with character.',
  },
  traditional: {
    name: 'Traditional Classic',
    description: 'Warm materials, structured symmetry, timeless detailing.',
  },
};

const Workspace = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const styleKey = (params.get('style') || '').toLowerCase();
  const styleInfo = fallbackStyles[styleKey] || {
    name: 'Selected Style',
    description: 'AI will adapt this style to your room layout.',
  };

  const [intensity, setIntensity] = useState(60);
  const [budget, setBudget] = useState('medium');
  const [lighting, setLighting] = useState('warm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewState, setPreviewState] = useState('before');
  const [status, setStatus] = useState('AI Preview');
  const [roomImage, setRoomImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [revealPct, setRevealPct] = useState(0); // 0=before fully, 100=after fully
  const [showSuccessGlow, setShowSuccessGlow] = useState(false);
  const generateBtnRef = useRef(null);
  const isMountedRef = useRef(false);
  const generationTimersRef = useRef({
    textInterval: null,
    completionTimeout: null,
    glowTimeout: null,
    revealRaf: null,
  });

  const steps = useMemo(() => {
    const uploadDone = !!roomImage;
    const generateDone = !!generatedImage;
    const reviewDone = generateDone && previewState === 'after';

    return [
      { key: 'upload', label: 'Upload Room', done: uploadDone, icon: Upload },
      { key: 'generate', label: 'Generate AI Design', done: generateDone, icon: Wand2 },
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearGenerationTimers();
    };
  }, [clearGenerationTimers]);

  useEffect(() => {
    clearGenerationTimers();
    setIsGenerating(false);
    setShowSuccessGlow(false);
    setProcessingText('');
    setProcessingLevel(0);
    setStatus('AI Preview');
    setPreviewState('before');
  }, [styleKey, clearGenerationTimers]);

  const loadDemo = (url) => {
    clearGenerationTimers();
    setIsGenerating(false);
    setShowSuccessGlow(false);
    setProcessingText('');
    setProcessingLevel(0);
    setRoomImage(url);
    setGeneratedImage(null);
    setPreviewState('before');
    setStatus('AI Preview');
  };

  const [processingText, setProcessingText] = useState('');
  const [processingLevel, setProcessingLevel] = useState(0);

  useEffect(() => {
    const prevScene = document.body.dataset.scene;
    const prevStyle = document.body.dataset.style;
    document.body.dataset.scene = 'workspace';
    document.body.dataset.style = String(styleKey || '').toLowerCase();

    return () => {
      if (document.body.dataset.scene === 'workspace') {
        if (prevScene) document.body.dataset.scene = prevScene;
        else delete document.body.dataset.scene;
      }
      if (document.body.dataset.style === String(styleKey || '').toLowerCase()) {
        if (prevStyle) document.body.dataset.style = prevStyle;
        else delete document.body.dataset.style;
      }
    };
  }, [styleKey]);

  const handleGenerate = () => {
    if (isGenerating) return;
    if (!roomImage) return;
    clearGenerationTimers();
    setIsGenerating(true);
    setStatus(`Analyzing layout…`);
    setPreviewState('processing');
    setProcessingLevel(0);
    
    // Progressive status messages shown while the preview is generated.
    const texts = [
      "Analyzing spatial geometry...",
      "Detecting light sources...",
      "Mapping surface materials...",
      `Applying ${styleInfo.name} design principles...`,
      "Optimizing color palette...",
      "Rendering final output..."
    ];
    let i = 0;
    setProcessingText(texts[0]);
    setProcessingLevel(0);
    generationTimersRef.current.textInterval = window.setInterval(() => {
      if (!isMountedRef.current) return;
      i++;
      if (i < texts.length) {
        setProcessingText(texts[i]);
        setProcessingLevel(texts.length > 1 ? i / (texts.length - 1) : 1);
      }
    }, 450);

    generationTimersRef.current.completionTimeout = window.setTimeout(() => {
      generationTimersRef.current.completionTimeout = null;
      if (!isMountedRef.current) return;
      if (generationTimersRef.current.textInterval) {
        window.clearInterval(generationTimersRef.current.textInterval);
        generationTimersRef.current.textInterval = null;
      }
      setGeneratedImage(roomImage);
      setRevealPct(0);
      setStatus('AI Preview');
      setPreviewState('after');
      setIsGenerating(false);
      setProcessingLevel(1);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const start = performance.now();
        const duration = 800;
        const animate = (now) => {
          if (!isMountedRef.current) return;
          const t = Math.min(1, (now - start) / duration);
          // Easing function for smooth slide
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

      // Trigger Success Glow
      setShowSuccessGlow(true);
      generationTimersRef.current.glowTimeout = window.setTimeout(() => {
        generationTimersRef.current.glowTimeout = null;
        if (!isMountedRef.current) return;
        setShowSuccessGlow(false);
      }, 2000);
    }, 3000); // Simulated processing time for preview mode.
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
    <div className={`workspace ${showSuccessGlow ? 'success-glow-active' : ''}`} onMouseMove={handleMagneticMove}>
      <div className="page-shell workspace-shell">
        <header className="workspace-header">
          <div>
            <p className="workspace-eyebrow">
              AI Transformation Workspace <span className="badge demo-badge">Preview</span>
            </p>
            <h1>{styleInfo.name}</h1>
            <p className="workspace-sub">{styleInfo.description}</p>
          </div>
          <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
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
            <span>Room Preview</span>
            <span className="status">{status}</span>
          </div>
          <div className="canvas-body">
            <div
              className={`preview-combo ${previewState === 'processing' ? 'is-processing' : ''}`}
              onMouseMove={(e) => {
                if (!generatedImage || previewState === 'processing') return;
                if (e.buttons !== 1) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setRevealPct(Math.min(100, Math.max(0, pct)));
              }}
              onTouchMove={(e) => {
                if (!generatedImage || previewState === 'processing') return;
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((touch.clientX - rect.left) / rect.width) * 100;
                setRevealPct(Math.min(100, Math.max(0, pct)));
              }}
            >
              <div className="preview before">
                <div className="preview-label badge">Before</div>
                {roomImage ? (
                  <img src={roomImage} alt="Uploaded room" className="preview-img" />
                ) : (
                  <span className="preview-placeholder">Upload a photo of your room to generate an AI design preview.</span>
                )}
              </div>
              <div className="preview after base">
                <div className="preview-label badge">{previewState === 'processing' ? 'Processing…' : 'After'}</div>
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
                  <img src={generatedImage} alt="Styled room" className="preview-img styled-img" />
                )}
                {previewState !== 'processing' && !generatedImage && (
                  <span className="preview-placeholder">Your styled room will appear here.</span>
                )}
              </div>
              {generatedImage && (
                <>
                  <div
                    className="reveal-layer"
                    style={{ width: `${revealPct}%` }}
                  >
                    <img src={roomImage} alt="Before reveal" className="preview-img" />
                  </div>
                  <div
                    className="preview-divider handle"
                    style={{ left: `${revealPct}%` }}
                    role="slider"
                    aria-label="Reveal comparison"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(revealPct)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') setRevealPct((p) => Math.max(0, p - 3));
                      if (e.key === 'ArrowRight') setRevealPct((p) => Math.min(100, p + 3));
                      if (e.key === 'Home') setRevealPct(0);
                      if (e.key === 'End') setRevealPct(100);
                      if (e.code === 'Space') {
                        e.preventDefault();
                        setRevealPct(0);
                      }
                    }}
                  >
                    <span className="handle-knob" title="Drag to compare">
                      <ChevronLeft size={16} />
                      <ChevronRight size={16} />
                    </span>
                  </div>
                  <span className="hold-hint">Drag to compare • Press Space to see Before</span>
                </>
              )}
            </div>
          </div>
          <div className="before-after-bar">
            <span>Before</span>
            <span>After</span>
          </div>
        </section>

        <aside className="workspace-controls" data-tilt>
          <div className="control-group">
            <div className="control-head">
              <span>Selected Style</span>
              <span className="pill">{styleInfo.name || styleKey || 'custom'}</span>
            </div>
            <p className="control-sub">AI will adapt this style to your room layout.</p>
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
            <label htmlFor="budget">Budget Focus</label>
            <select id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
              <span className="demo-rooms-label">Try a Sample Room</span>
              <div className="demo-rooms-buttons">
                <button type="button" className="demo-try-btn" onClick={() => loadDemo('https://images.unsplash.com/photo-1598928506311-c55dd12966c4?auto=format&fit=crop&q=80&w=800')}>Living Room</button>
                <button type="button" className="demo-try-btn" onClick={() => loadDemo('https://images.unsplash.com/photo-15569101031-c02745a828?auto=format&fit=crop&q=80&w=800')}>Kitchen</button>
              </div>
            </div>
            <label className="secondary upload-btn">
              Upload My Room
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
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (!isMountedRef.current) return;
                    setRoomImage(ev.target?.result || null);
                    setGeneratedImage(null);
                    setPreviewState('before');
                    setStatus('AI Preview');
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
              {isGenerating ? 'Generating…' : 'Generate Preview'}
            </button>
            <button type="button" className="secondary ghost" disabled aria-disabled="true" title="Feature coming soon">
              Full AI Engine Coming Soon
            </button>
          </div>
        </aside>
        </main>
      </div>
    </div>
  );
};

export default Workspace;

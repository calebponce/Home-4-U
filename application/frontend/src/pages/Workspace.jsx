import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const steps = useMemo(() => {
    const uploadDone = !!roomImage;
    const generateDone = !!generatedImage;
    const reviewDone = generateDone && previewState === 'after';

    return [
      { key: 'upload', label: 'Upload Room', done: uploadDone },
      { key: 'generate', label: 'Generate AI Design', done: generateDone },
      { key: 'review', label: 'Review Result', done: reviewDone },
    ];
  }, [generatedImage, previewState, roomImage]);

  const activeStepIndex = useMemo(() => {
    const firstIncomplete = steps.findIndex((step) => !step.done);
    return firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;
  }, [steps]);

  useEffect(() => {
    setStatus('AI Preview');
    setPreviewState('before');
  }, [styleKey]);

  const handleGenerate = () => {
    if (isGenerating) return;
    if (!roomImage) return;
    setIsGenerating(true);
    setStatus(`Analyzing layout…`);
    setPreviewState('processing');
    setTimeout(() => {
      setStatus(`Applying ${styleInfo.name}…`);
    }, 450);
    setTimeout(() => {
      // fake styled result: reuse room image; After panel applies filter via CSS class
      setGeneratedImage(roomImage);
      setRevealPct(0);
      setStatus('AI Preview');
      setPreviewState('after');
      setIsGenerating(false);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const start = performance.now();
        const duration = 600;
        const animate = (now) => {
          const t = Math.min(1, (now - start) / duration);
          setRevealPct(60 * t);
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      } else {
        setRevealPct(60);
      }
    }, 1200);
  };

  return (
    <div className="workspace">
      <header className="workspace-header">
        <div>
          <p className="workspace-eyebrow">AI Transformation Workspace</p>
          <h1>{styleInfo.name}</h1>
          <p className="workspace-sub">{styleInfo.description}</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Styles</button>
      </header>

      <main className="workspace-main">
        <div className="design-timeline" aria-label="Design progress">
          {steps.map((step, idx) => (
            <div key={step.key} className="timeline-step">
              <div
                className={`timeline-node ${step.done ? 'done' : ''} ${idx === activeStepIndex ? 'active' : ''}`}
                aria-checked={step.done}
                role="checkbox"
              />
              <span className="timeline-label">{step.label}</span>
              {idx < steps.length - 1 && <div className="timeline-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>

        <section className={`workspace-canvas state-${previewState}`}>
          <div className="canvas-header">
            <span>Room Preview</span>
            <span className="status">{status}</span>
          </div>
          <div className="canvas-body">
            <div
              className="preview-combo"
              onMouseMove={(e) => {
                if (!generatedImage) return;
                if (e.buttons !== 1) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
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
                  <span className="preview-placeholder">
                    AI generating design…
                  </span>
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
                    role="separator"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(revealPct)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') setRevealPct((p) => Math.max(0, p - 3));
                      if (e.key === 'ArrowRight') setRevealPct((p) => Math.min(100, p + 3));
                      if (e.code === 'Space') {
                        e.preventDefault();
                        setRevealPct(0);
                      }
                    }}
                  >
                    <span className="handle-knob" title="Drag to compare">│</span>
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

        <aside className="workspace-controls">
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
              >
                Warm
              </button>
              <button
                type="button"
                className={`toggle ${lighting === 'cool' ? 'active' : ''}`}
                onClick={() => setLighting('cool')}
              >
                Cool
              </button>
            </div>
          </div>

          <div className="control-group actions">
            <label className="secondary upload-btn">
              Upload My Room
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
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
            <button className="primary" onClick={handleGenerate} disabled={isGenerating || !roomImage}>
              {isGenerating ? 'Generating…' : 'Generate Preview'}
            </button>
            <button className="secondary ghost">Preview Demo</button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Workspace;

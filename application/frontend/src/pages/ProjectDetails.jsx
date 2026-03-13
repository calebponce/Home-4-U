import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, recommendationsAPI } from '../services/api';
import { ChevronLeft, Plus, CheckCircle2, Circle, Clock, Target, CreditCard, LayoutDashboard, Sparkles } from 'lucide-react';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const prevScene = document.body.dataset.scene;
    document.body.dataset.scene = 'project';
    return () => {
      if (document.body.dataset.scene === 'project') {
        if (prevScene) document.body.dataset.scene = prevScene;
        else delete document.body.dataset.scene;
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const projectRes = await projectsAPI.getById(id);
      setProject(projectRes.data);
      try {
        const recsRes = await recommendationsAPI.getByProject(id);
        setRecommendations(recsRes.data);
      } catch {
        console.log('No recommendations yet');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      if (!budget) return;
      await projectsAPI.update(id, { budget: parseFloat(budget) });
      setBudget('');
      fetchData();
    } catch (err) {
      console.error('Error updating budget:', err);
    }
  };

  const handleGenerateRecommendations = async () => {
    setGenerating(true);
    try {
      await recommendationsAPI.generate(id);
      fetchData();
    } catch (err) {
      console.error('Error generating recommendations:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkComplete = async (recId) => {
    try {
      await recommendationsAPI.markComplete(recId);
      // Optimistic update
      setRecommendations(recs => recs.map(r => r.id === recId ? { ...r, is_completed: true } : r));
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="project-details">
        <div className="skeleton skeleton-text-lg"></div>
        <div className="canvas-grid" style={{ marginTop: '2rem' }}>
          <div className="skeleton" style={{ height: '300px' }}></div>
          <div className="skeleton" style={{ height: '600px' }}></div>
        </div>
      </div>
    );
  }

  if (!project) return <div className="project-details">Project not found</div>;

  // Derived budget math
  const maxBudget = Number(project.budget) || 0;
  const spent = recommendations.filter(r => r.is_completed).reduce((sum, r) => sum + Number(r.estimated_cost), 0);
  const remaining = maxBudget - spent;
  
  // Calculate percentage for Donut
  const budgetPct = maxBudget > 0 ? Math.min(100, (spent / maxBudget) * 100) : 0;
  const strokeDasharray = `${budgetPct * 2.83} 283`; // 2 * PI * r (r=45) = ~283

  // Kanban splits
  const todoRecs = recommendations.filter(r => !r.is_completed);
  const doneRecs = recommendations.filter(r => r.is_completed);

  // Fake Moodboard Data
  const moodboardImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80', title: 'Velvet Sofa', class: 'tall' },
    { id: 2, url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80', title: 'Edison Lighting', class: '' },
    { id: 3, url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80', title: 'Hardwood Texture', class: 'wide' },
    { id: 4, url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80', title: 'Minimalist Shelf', class: '' },
    { id: 5, url: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=500&q=80', title: 'Neutral Palette', class: 'tall' },
  ];

  return (
    <div className="project-details">
      <div className="page-shell project-shell">
        <header className="project-details-header">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-btn-ghost">
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="p-title">{project.room_type} Project</h1>
            <span className="p-meta">Created on {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <div className="header-right">
            {/* Action buttons could go here */}
          </div>
        </header>

        <div className="canvas-grid">
          {/* Sidebar: Budget Tracking */}
          <aside className="project-sidebar">
          <div className="finance-card" data-tilt>
            <div className="finance-head">
               <h3><CreditCard size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}/>Budget Tracker</h3>
               <p>Manage your renovation funds</p>
            </div>
            
            <div className="budget-donut-container">
              <svg viewBox="0 0 100 100" className="budget-svg">
                <circle cx="50" cy="50" r="45" className="budget-bg" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  className={`budget-progress ${budgetPct > 100 ? 'over-budget' : ''}`}
                  style={{ strokeDasharray }} 
                />
              </svg>
              <div className="budget-center">
                <span className="val">{Math.round(budgetPct)}%</span>
                <span className="lbl">Spent</span>
              </div>
            </div>

            <div className="budget-details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="lbl">Total Budget</span>
                <span className="val">${maxBudget.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                <span className="lbl">Remaining</span>
                <span className={`remaining ${remaining < 0 ? 'negative' : ''}`}>
                  ${remaining.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateBudget} className="budget-form">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Adjust budget..."
                min="0"
                step="0.01"
              />
              <button type="submit">Set</button>
            </form>
          </div>
        </aside>

        {/* Main Canvas: Kanban Tasks & Moodboard */}
        <main className="project-main">
          
          <div className="kanban-board">
            <div className="kanban-header">
              <h2><CheckSquare size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary-400)' }}/>Tasks & Recommendations</h2>
              <button 
                className="generate-tasks-btn"
                onClick={handleGenerateRecommendations}
                disabled={generating}
              >
                {generating ? <><Sparkles size={16} className="spin" /> Generating AI Tasks…</> : <><Sparkles size={16} /> Generate AI Plan</>}
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="empty-kanban">
                <LayoutDashboard size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <h3>Your board is empty</h3>
                <p>Click "Generate AI Plan" to let our engine break down your room design into actionable tasks.</p>
              </div>
            ) : (
              <div className="kanban-columns">
                
                {/* TO DO Column */}
                <div className="k-col todo-col">
                  <div className="k-col-head">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Circle size={14} color="#a5b4fc" /> To Do
                    </span>
                    <span className="count">{todoRecs.length}</span>
                  </div>
                  <div className="k-col-body">
                    {todoRecs.map(rec => (
                      <div key={rec.id} className="k-card" data-tilt>
                        <p className="k-card-desc">{rec.description}</p>
                        <div className="k-card-meta">
                          <span className="k-badge">Priority {rec.priority_score.toFixed(1)}</span>
                          <span>${rec.estimated_cost}</span>
                        </div>
                        <div className="k-card-actions">
                          <button className="k-action-btn" onClick={() => handleMarkComplete(rec.id)}>
                            <CheckCircle2 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Complete
                          </button>
                        </div>
                      </div>
                    ))}
                    {todoRecs.length === 0 && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'gray', padding: '1rem 0' }}>All Caught Up!</p>}
                  </div>
                </div>

                {/* IN PROGRESS Column (Mocked) */}
                <div className="k-col inprog-col" style={{ opacity: 0.8 }}>
                  <div className="k-col-head">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#fcd34d" /> In Progress (Demo)
                    </span>
                    <span className="count">0</span>
                  </div>
                  <div className="k-col-body" style={{ placeContent: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-400)' }}>Drop tasks here to track active work.</p>
                  </div>
                </div>

                {/* DONE Column */}
                <div className="k-col done-col">
                  <div className="k-col-head">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#6ee7b7" /> Done
                    </span>
                    <span className="count">{doneRecs.length}</span>
                  </div>
                  <div className="k-col-body">
                    {doneRecs.map(rec => (
                      <div key={rec.id} className="k-card completed" data-tilt>
                        <p className="k-card-desc" style={{ textDecoration: 'line-through' }}>{rec.description}</p>
                        <div className="k-card-meta">
                          <span>${rec.estimated_cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Feature: Moodboard */}
          <section className="moodboard-section">
            <div className="moodboard-header">
              <h2><Target size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-primary-400)' }}/> Inspiration Moodboard</h2>
              <p>Curated visual concepts for your {project.room_type}.</p>
            </div>
            
            <div className="masonry-grid">
              {moodboardImages.map(img => (
                <div key={img.id} className={`masonry-item ${img.class}`} data-tilt>
                  <img src={img.url} alt={img.title} className="masonry-img" />
                  <div className="masonry-overlay">
                    <span className="masonry-title">{img.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsAPI, recommendationsAPI } from '../services/api';
import { ChevronLeft, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SkeletonKanbanColumn, SkeletonCard } from '../components/Skeletons';
import './ProjectDetails.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
};

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
        setRecommendations(recsRes.data || []);
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
      setRecommendations(recs => recs.map(r => r.id === recId ? { ...r, is_completed: true } : r));
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="project-details">
        <div className="project-details-header">
          <div className="skeleton" style={{ width: '300px', height: '40px' }} />
        </div>
        <div className="canvas-grid">
          <div className="project-sidebar">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="kanban-board">
            <SkeletonKanbanColumn />
          </div>
        </div>
      </div>
    );
  }

  const projectBudget = Number(project?.budget) || 0;
  const spent = recommendations.filter(r => r.is_completed).reduce((sum, r) => sum + (Number(r.estimated_cost) || 0), 0);
  const remaining = projectBudget - spent;
  const percentSpent = projectBudget > 0 ? (spent / projectBudget) * 100 : 0;
  
  // Donut SVG logic
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (Math.min(percentSpent, 100) / 100) * circumference;

  return (
    <motion.div 
      className="project-details"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={sectionVariants} className="project-details-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn-ghost">
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="p-title">{project?.name}</h1>
          <div className="p-meta">{project?.room_type} — Spatial Canvas #{id}</div>
        </div>
      </motion.div>

      <div className="canvas-grid">
        <motion.div variants={sectionVariants} className="project-sidebar">
          <div className="finance-card" data-parallax-card>
            <div className="finance-head">
              <h3>Financial Pulse</h3>
              <p>Budget Performance</p>
            </div>
            
            <div className="budget-donut-container">
              <svg className="budget-svg" viewBox="0 0 160 160">
                <circle className="budget-bg" cx="80" cy="80" r="65" />
                <motion.circle 
                  className={`budget-progress ${remaining < 0 ? 'over-budget' : ''}`}
                  cx="80" cy="80" r="65"
                  initial={{ strokeDasharray: `0, ${circumference}` }}
                  animate={{ strokeDasharray: `${circumference - offset}, ${circumference}` }}
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                />
              </svg>
              <div className="budget-center">
                <span className="val">${spent.toLocaleString()}</span>
                <span className="lbl">{remaining < 0 ? 'Over' : 'Invested'}</span>
              </div>
            </div>

            <div className="budget-details">
              <div className="budget-item">
                <span className="lbl">Ceiling</span>
                <span className="val">${projectBudget.toLocaleString()}</span>
              </div>
              <div className="budget-item">
                <span className="lbl">Residual</span>
                <span className={`val ${remaining < 0 ? 'negative' : 'positive'}`}>
                  ${remaining.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateBudget} className="budget-form">
              <input 
                type="number" 
                placeholder="Adjust ceiling..." 
                value={budget} 
                onChange={(e) => setBudget(e.target.value)} 
              />
              <button type="submit">Update</button>
            </form>
          </div>
        </motion.div>

        <motion.div variants={sectionVariants} className="kanban-board">
          <div className="kanban-header">
            <h2>Spatial Strategy</h2>
            <button 
              className="generate-tasks-btn"
              onClick={handleGenerateRecommendations}
              disabled={generating}
            >
              {generating ? <Clock size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Calculating Strategy...' : 'Regenerate Blueprint'}
            </button>
          </div>

          <div className="kanban-columns">
            <div className="k-col">
              <div className="k-col-head">
                <span>Task Backlog</span>
                <span className="count">{recommendations.filter(r => !r.is_completed).length}</span>
              </div>
              <div className="k-col-body">
                {recommendations.filter(r => !r.is_completed).length === 0 ? (
                  <div className="empty-kanban">Your strategy is clean. No pending tasks.</div>
                ) : (
                  <AnimatePresence>
                    {recommendations.filter(r => !r.is_completed).map((rec, idx) => (
                      <motion.div 
                        key={rec.id}
                        initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 20, filter: 'blur(8px)', transition: { duration: 0.3 } }}
                        className="k-card"
                      >
                        <p className="k-card-desc">{rec.description}</p>
                        <div className="k-card-meta">
                          <span className="k-badge">${Number(rec.estimated_cost).toLocaleString()}</span>
                          <button onClick={() => handleMarkComplete(rec.id)} className="k-action-btn">
                            Complete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="k-col">
              <div className="k-col-head">
                <span>Success Log</span>
                <span className="count">{recommendations.filter(r => r.is_completed).length}</span>
              </div>
              <div className="k-col-body">
                <AnimatePresence>
                  {recommendations.filter(r => r.is_completed).reverse().map((rec, idx) => (
                    <motion.div 
                      key={rec.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="k-card completed"
                    >
                      <p className="k-card-desc">{rec.description}</p>
                      <div className="k-card-meta">
                        <span className="k-badge">${Number(rec.estimated_cost).toLocaleString()}</span>
                        <CheckCircle2 size={16} color="var(--color-action-emerald)" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectDetails;

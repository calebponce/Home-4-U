import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, recommendationsAPI, stylesAPI } from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, stylesRes] = await Promise.all([
        projectsAPI.getById(id),
        stylesAPI.getAll()
      ]);
      setProject(projectRes.data);
      setStyles(stylesRes.data);
      
      // Fetch recommendations
      try {
        const recsRes = await recommendationsAPI.getByProject(id);
        setRecommendations(recsRes.data);
      } catch (e) {
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
      await projectsAPI.update(id, { budget: parseFloat(budget) });
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
      fetchData();
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-details">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        ← Back to Dashboard
      </button>

      <header className="project-header">
        <h1>{project.room_type} Project</h1>
        <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
      </header>

      <section className="budget-section">
        <h2>Budget</h2>
        <p className="current-budget">Current Budget: ${project.budget || 0}</p>
        <form onSubmit={handleUpdateBudget} className="budget-form">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Enter new budget"
            min="0"
            step="0.01"
          />
          <button type="submit">Update Budget</button>
        </form>
      </section>

      <section className="recommendations-section">
        <div className="section-header">
          <h2>Recommendations</h2>
          <button 
            onClick={handleGenerateRecommendations}
            disabled={generating}
            className="generate-btn"
          >
            {generating ? 'Generating...' : 'Generate AI Recommendations'}
          </button>
        </div>

        {recommendations.length === 0 ? (
          <div className="empty-state">
            <p>No recommendations yet. Generate some!</p>
          </div>
        ) : (
          <div className="recommendations-list">
            {recommendations.map(rec => (
              <div key={rec.id} className={`recommendation-card ${rec.is_completed ? 'completed' : ''}`}>
                <p className="rec-description">{rec.description}</p>
                <div className="rec-meta">
                  <span>Priority Score: {rec.priority_score.toFixed(2)}</span>
                  <span>Est. Cost: ${rec.estimated_cost}</span>
                </div>
                {!rec.is_completed && (
                  <button 
                    onClick={() => handleMarkComplete(rec.id)}
                    className="complete-btn"
                  >
                    Mark Complete
                  </button>
                )}
                {rec.is_completed && <span className="completed-badge">✓ Completed</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="styles-section">
        <h2>Available Styles</h2>
        <div className="styles-list">
          {styles.map(style => (
            <div key={style.id} className="style-item">
              <strong>{style.name}</strong>
              <span>{style.description || 'No description'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectDetails;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, stylesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectType, setNewProjectType] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, stylesRes] = await Promise.all([
        projectsAPI.getAll(),
        stylesAPI.getAll()
      ]);
      setProjects(projectsRes.data);
      setStyles(stylesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.create(newProjectType);
      setNewProjectType('');
      setShowNewProject(false);
      fetchData();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <section className="projects-section">
        <div className="section-header">
          <h2>My Room Projects</h2>
          <button 
            onClick={() => setShowNewProject(!showNewProject)}
            className="new-project-btn"
          >
            + New Project
          </button>
        </div>

        {showNewProject && (
          <form onSubmit={handleCreateProject} className="new-project-form">
            <select
              value={newProjectType}
              onChange={(e) => setNewProjectType(e.target.value)}
              required
            >
              <option value="">Select room type</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowNewProject(false)}>Cancel</button>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first room project!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.room_type}</h3>
                <p>Budget: ${project.budget || 0}</p>
                <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                <div className="project-actions">
                  <button onClick={() => navigate(`/project/${project.id}`)}>
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="styles-section">
        <h2>Explore Styles</h2>
        <div className="styles-grid">
          {styles.map(style => (
            <div key={style.id} className="style-card">
              <h3>{style.name}</h3>
              <p>{style.description || 'No description'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;


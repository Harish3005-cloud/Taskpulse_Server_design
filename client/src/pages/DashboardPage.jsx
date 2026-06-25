import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWorkspaces();
  }, [isAuthenticated]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workspaces');
      setWorkspaces(data.workspaces);
    } catch (err) {
      setError('Failed to load workspaces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    setCreating(true);
    try {
      const { data } = await api.post('/workspaces', { name: newWorkspaceName });
      setWorkspaces(prev => [data.workspace, ...prev]);
      setNewWorkspaceName('');
      setShowCreate(false);
    } catch (err) {
      setError('Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'role-owner';
      case 'admin': return 'role-admin';
      default: return 'role-member';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="dashboard">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header animate-fade-in-up">
          <div className="dashboard-greeting">
            <h1 className="dashboard-title">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="dashboard-subtitle">
              Here's your workspace overview
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreate(true)}
            id="create-workspace-btn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Workspace
          </button>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-stats animate-fade-in-up delay-100">
          <div className="stat-card card">
            <div className="stat-card-icon">🏢</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{workspaces.length}</span>
              <span className="stat-card-label">Workspaces</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon">👤</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{user?.plan === 'pro' ? 'Pro' : 'Free'}</span>
              <span className="stat-card-label">Current Plan</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon">📋</div>
            <div className="stat-card-info">
              <span className="stat-card-value">0</span>
              <span className="stat-card-label">Total Tasks</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-card-icon">🤖</div>
            <div className="stat-card-info">
              <span className="stat-card-value">100</span>
              <span className="stat-card-label">AI Credits Left</span>
            </div>
          </div>
        </div>

        {/* Create Workspace Modal */}
        {showCreate && (
          <div className="modal-overlay animate-fade-in" onClick={() => setShowCreate(false)}>
            <div className="modal card-glass animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Create New Workspace</h2>
              <p className="modal-desc">A workspace is where your team organizes and manages tasks.</p>
              <form onSubmit={handleCreateWorkspace} className="modal-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="workspace-name">Workspace Name</label>
                  <input
                    id="workspace-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Product Team, Marketing"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={creating} id="submit-workspace-btn">
                    {creating ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="dashboard-error animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError('')} className="btn btn-ghost">✕</button>
          </div>
        )}

        {/* Workspace Grid */}
        <div className="workspace-section animate-fade-in-up delay-200">
          <h2 className="section-label">Your Workspaces</h2>
          
          {loading ? (
            <div className="workspace-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="workspace-card card skeleton-card">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-badge"></div>
                </div>
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">🏗️</div>
              <h3 className="empty-title">No workspaces yet</h3>
              <p className="empty-desc">Create your first workspace to start managing tasks with AI.</p>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Create Workspace
              </button>
            </div>
          ) : (
            <div className="workspace-grid">
              {workspaces.map((ws, index) => (
                <div 
                  key={ws._id} 
                  className="workspace-card card"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="workspace-card-header">
                    <div className="workspace-avatar">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`workspace-role ${getRoleColor(ws.currentUserRole)}`}>
                      {ws.currentUserRole}
                    </span>
                  </div>
                  <h3 className="workspace-name">{ws.name}</h3>
                  <div className="workspace-meta">
                    <span className="workspace-members">
                      👥 {ws.memberCount} {ws.memberCount === 1 ? 'member' : 'members'}
                    </span>
                    <span className="workspace-time">
                      Created {getTimeAgo(ws.createdAt)}
                    </span>
                  </div>
                  <div className="workspace-plan">
                    <span className={`plan-badge ${ws.plan === 'pro' ? 'plan-pro' : 'plan-free'}`}>
                      {ws.plan === 'pro' ? '⭐ Pro' : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

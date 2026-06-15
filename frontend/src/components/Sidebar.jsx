import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Clock, LogOut, LayoutDashboard, Lightbulb,
  Settings as SettingsIcon, User, BarChart3, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { listAnalyses, createAnalysis, listDatasets } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [datasets, setDatasets] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [an, ds] = await Promise.all([listAnalyses(), listDatasets()]);
      setAnalyses(an.data);
      setDatasets(ds.data);
    } catch (err) { /* silent */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNewAnalysis = async () => {
    if (datasets.length === 0) {
      navigate('/dashboard');
      toast.success('Upload a dataset first!');
      return;
    }
    try {
      const res = await createAnalysis(datasets[0].id, null);
      navigate(`/analysis/${res.data.id}`);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to create analysis');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-top">
        <Link to="/dashboard" className="sidebar-logo">
          <img src="/logo.png" alt="DataChat" />
          <span>DataChat</span>
        </Link>
        <button className="sidebar-new" onClick={handleNewAnalysis}>
          <Plus size={16} /> New Analysis
        </button>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        <div className="sidebar-list">
          <button
            className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutDashboard size={14} />
            <span className="sidebar-item-text">Dashboard</span>
          </button>
          <button
            className={`sidebar-item ${isActive('/analyses') ? 'active' : ''}`}
            onClick={() => navigate('/analyses')}
          >
            <BarChart3 size={14} />
            <span className="sidebar-item-text">Analyses</span>
          </button>
          <button
            className={`sidebar-item ${isActive('/insights') ? 'active' : ''}`}
            onClick={() => navigate('/insights')}
          >
            <Lightbulb size={14} />
            <span className="sidebar-item-text">Insights</span>
          </button>
          <button
            className={`sidebar-item ${isActive('/docs') ? 'active' : ''}`}
            onClick={() => navigate('/docs')}
          >
            <BookOpen size={14} />
            <span className="sidebar-item-text">Docs</span>
          </button>
          <button
            className={`sidebar-item ${isActive('/account') ? 'active' : ''}`}
            onClick={() => navigate('/account')}
          >
            <User size={14} />
            <span className="sidebar-item-text">Account</span>
          </button>
          <button
            className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <SettingsIcon size={14} />
            <span className="sidebar-item-text">Settings</span>
          </button>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="sidebar-section">
        <div className="sidebar-label">Recent Analyses</div>
        <div className="sidebar-list">
          {analyses.length === 0 ? (
            <div className="sidebar-empty">No analyses yet</div>
          ) : (
            analyses.slice(0, 8).map((a) => (
              <button
                key={a.id}
                className="sidebar-item"
                onClick={() => { navigate(`/analysis/${a.id}`); window.location.reload(); }}
              >
                <Clock size={14} />
                <span className="sidebar-item-text">{a.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Card */}
      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-plan">{user?.plan || 'Free'} Plan</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
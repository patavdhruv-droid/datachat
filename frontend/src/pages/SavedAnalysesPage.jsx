import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Loader2, Search, MessageSquare, Clock,
  FileSpreadsheet, Trash2, Plus, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { listAnalyses, deleteAnalysis } from '../utils/api';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';

const SavedAnalysesPage = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      const res = await listAnalyses();
      setAnalyses(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter on search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(analyses);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        analyses.filter(
          (a) =>
            a.title?.toLowerCase().includes(q) ||
            a.dataset_name?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, analyses]);

  const handleOpen = (id) => {
    navigate(`/analysis/${id}`);
    window.location.reload();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Analysis deleted');
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="chat-page">
        <Sidebar />
        <main className="settings-main">
          <div className="chat-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading analyses...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <Sidebar />

      <main className="settings-main">
        <div className="settings-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-header"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <h1>Saved Analyses</h1>
              <p>All your data conversations in one place</p>
            </div>
            <button
              className="upgrade-btn"
              onClick={() => navigate('/dashboard')}
            >
              <Plus size={16} /> New Analysis
            </button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="search-wrap"
          >
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search analyses by title or dataset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                Clear
              </button>
            )}
          </motion.div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="insight-page-empty">
              <BarChart3 size={48} />
              <h3>{search ? 'No matching analyses' : 'No analyses yet'}</h3>
              <p>
                {search
                  ? 'Try a different search term'
                  : 'Upload a dataset and start asking questions'}
              </p>
              {!search && (
                <button
                  className="upgrade-btn"
                  onClick={() => navigate('/dashboard')}
                >
                  <Plus size={16} /> Create First Analysis
                </button>
              )}
            </div>
          ) : (
            <motion.div
              className="analyses-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence>
                {filtered.map((a, i) => (
                  <motion.div
                    key={a.id}
                    className="analysis-card"
                    onClick={() => handleOpen(a.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    whileHover={{ y: -3 }}
                  >
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon">
                        <BarChart3 size={18} />
                      </div>
                      <button
                        className="analysis-card-delete"
                        onClick={(e) => handleDelete(e, a.id)}
                        disabled={deletingId === a.id}
                        title="Delete analysis"
                      >
                        {deletingId === a.id ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>

                    <h3 className="analysis-card-title">{a.title}</h3>

                    <div className="analysis-card-dataset">
                      <FileSpreadsheet size={12} />
                      <span>{a.dataset_name || 'Deleted dataset'}</span>
                    </div>

                    <div className="analysis-card-stats">
                      <div className="card-stat">
                        <MessageSquare size={12} />
                        <span>{a.message_count || 0} messages</span>
                      </div>
                      <div className="card-stat">
                        <Clock size={12} />
                        <span>{formatDate(a.updated_at)}</span>
                      </div>
                    </div>

                    <div className="analysis-card-footer">
                      <span>Open analysis</span>
                      <ArrowRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedAnalysesPage;
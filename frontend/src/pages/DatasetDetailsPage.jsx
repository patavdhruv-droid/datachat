import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database, Loader2, Hash, AlignLeft, AlertTriangle, HardDrive,
  ArrowLeft, MessageSquare, Trash2, Search, FileSpreadsheet,
  Calendar, Table
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDataset, deleteDataset, createAnalysis } from '../utils/api';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';

const DatasetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDataset(id);
        setDataset(res.data);
      } catch (err) {
        toast.error('Dataset not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleStartAnalysis = async () => {
    setCreating(true);
    try {
      const res = await createAnalysis(parseInt(id), null);
      navigate(`/analysis/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to start analysis');
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${dataset.filename}"? All analyses using this dataset will also be lost.`)) return;
    try {
      await deleteDataset(id);
      toast.success('Dataset deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const formatBytes = (mb) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const getTypeColor = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('int') || t.includes('float')) return 'type-number';
    if (t.includes('object') || t.includes('str')) return 'type-text';
    if (t.includes('date') || t.includes('time')) return 'type-date';
    if (t.includes('bool')) return 'type-bool';
    return 'type-other';
  };

  if (loading) {
    return (
      <div className="chat-page">
        <Sidebar />
        <main className="settings-main">
          <div className="chat-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading dataset...</p>
          </div>
        </main>
      </div>
    );
  }

  const filteredColumns = (dataset?.column_info || []).filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-page">
      <Sidebar />

      <main className="settings-main">
        <div className="settings-container">
          {/* Back Button */}
          <motion.button
            className="back-link"
            onClick={() => navigate('/dashboard')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-header"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <FileSpreadsheet size={28} style={{ color: 'var(--text-secondary)' }} />
                {dataset?.filename}
              </h1>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Calendar size={13} />
                Uploaded {new Date(dataset?.uploaded_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </button>
              <button className="upgrade-btn" onClick={handleStartAnalysis} disabled={creating}>
                {creating ? <Loader2 size={16} className="spin" /> : <MessageSquare size={16} />}
                {creating ? 'Starting...' : 'Start Analysis'}
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="stats-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32 }}
          >
            <motion.div className="usage-card" whileHover={{ y: -3 }}>
              <div className="usage-icon"><Hash size={18} /></div>
              <div className="usage-label">Rows</div>
              <div className="usage-value">{dataset?.rows?.toLocaleString() || 0}</div>
              <div className="usage-limit">Total records</div>
            </motion.div>

            <motion.div className="usage-card" whileHover={{ y: -3 }}>
              <div className="usage-icon"><AlignLeft size={18} /></div>
              <div className="usage-label">Columns</div>
              <div className="usage-value">{dataset?.columns || 0}</div>
              <div className="usage-limit">Data fields</div>
            </motion.div>

            <motion.div className="usage-card" whileHover={{ y: -3 }}>
              <div className="usage-icon"><AlertTriangle size={18} /></div>
              <div className="usage-label">Missing Values</div>
              <div className="usage-value">{dataset?.missing_values?.toLocaleString() || 0}</div>
              <div className="usage-limit">Cells without data</div>
            </motion.div>

            <motion.div className="usage-card" whileHover={{ y: -3 }}>
              <div className="usage-icon"><HardDrive size={18} /></div>
              <div className="usage-label">File Size</div>
              <div className="usage-value">{formatBytes(dataset?.size_mb || 0)}</div>
              <div className="usage-limit">On disk</div>
            </motion.div>
          </motion.div>

          {/* Column Explorer */}
          <motion.div
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-head">
              <Database size={18} />
              <h2>Column Explorer</h2>
            </div>

            <div className="search-wrap" style={{ marginBottom: 14 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search columns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="columns-table-wrap">
              <table className="columns-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Missing</th>
                    <th>Unique Values</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColumns.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>
                        No columns found
                      </td>
                    </tr>
                  ) : (
                    filteredColumns.map((col, i) => (
                      <tr key={i}>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{col.name}</strong>
                        </td>
                        <td>
                          <span className={`type-badge ${getTypeColor(col.dtype)}`}>
                            {col.dtype}
                          </span>
                        </td>
                        <td>
                          {col.missing > 0 ? (
                            <span style={{ color: 'var(--warning)' }}>{col.missing}</span>
                          ) : (
                            <span style={{ color: 'var(--success)' }}>0</span>
                          )}
                        </td>
                        <td>{col.unique?.toLocaleString() || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Data Preview */}
          {dataset?.preview && dataset.preview.length > 0 && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="section-head">
                <Table size={18} />
                <h2>Data Preview <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 13 }}>(first 5 rows)</span></h2>
              </div>

              <div className="columns-table-wrap">
                <table className="columns-table preview-table">
                  <thead>
                    <tr>
                      {Object.keys(dataset.preview[0]).map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{String(val).slice(0, 50)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DatasetDetailsPage;
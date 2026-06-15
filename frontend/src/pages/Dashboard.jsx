import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, TrendingUp, BarChart3, Trophy, Activity,
  Database, Loader2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadDataset, listDatasets, listAnalyses, createAnalysis } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = useCallback(async () => {
    try {
      const [dsRes, anRes] = await Promise.all([listDatasets(), listAnalyses()]);
      setDatasets(dsRes.data);
      setAnalyses(anRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validTypes = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error('Only CSV and Excel files are supported');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Uploading and analyzing file...');

    try {
      const res = await uploadDataset(file);
      const dataset = res.data;
      toast.success(`${dataset.filename} uploaded successfully!`, { id: loadingToast });

      const analysisRes = await createAnalysis(dataset.id, null);
      navigate(`/analysis/${analysisRes.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed';
      toast.error(msg, { id: loadingToast });
    } finally {
      setUploading(false);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleSuggestedAction = (action) => {
    if (datasets.length === 0) {
      toast.error('Upload a dataset first!');
      return;
    }
    const recentDataset = datasets[0];
    handleStartAnalysis(recentDataset.id);
  };

  const handleStartAnalysis = async (datasetId) => {
    try {
      const res = await createAnalysis(datasetId, null);
      navigate(`/analysis/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to start analysis');
    }
  };

  return (
    <div className="dashboard">
      {/* Use shared Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-bg">
          <div className="dash-glow"></div>
        </div>

        <div className="dash-content">
          <motion.div
            className="dash-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
            <p>What would you like to analyze today?</p>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input {...getInputProps()} id="upload-input" />
            <div className="upload-icon">
              {uploading ? <Loader2 size={36} className="spin" /> : <Upload size={36} />}
            </div>
            <h3>
              {uploading ? 'Uploading...' : isDragActive ? 'Drop your file here' : 'Drop CSV or Excel file here'}
            </h3>
            <p>{uploading ? 'Analyzing your data...' : 'or click to browse · Max 200MB'}</p>
            {!uploading && (
              <button className="upload-btn" type="button">
                <FileText size={16} /> Choose File
              </button>
            )}
          </motion.div>

          {/* Suggested Actions */}
          <motion.div
            className="suggested-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="section-mini-title">
              <Sparkles size={16} /> Suggested Actions
            </h2>
            <div className="suggested-grid">
              {[
                { icon: <TrendingUp size={20} />, title: 'Analyze Sales', desc: 'Find revenue trends' },
                { icon: <BarChart3 size={20} />, title: 'Create Dashboard', desc: 'Build visual reports' },
                { icon: <Trophy size={20} />, title: 'Top Performers', desc: 'Identify the leaders' },
                { icon: <Activity size={20} />, title: 'Forecast Trends', desc: 'Predict the future' },
              ].map((s, i) => (
                <motion.button
                  key={i}
                  className="suggested-card"
                  onClick={() => handleSuggestedAction(s.title)}
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="suggested-icon">{s.icon}</div>
                  <div className="suggested-text">
                    <div className="suggested-title">{s.title}</div>
                    <div className="suggested-desc">{s.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          {!loading && (
            <motion.div
              className="stats-row"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="stat-card">
                <div className="stat-icon"><Database size={18} /></div>
                <div>
                  <div className="stat-num">{datasets.length}</div>
                  <div className="stat-label">Datasets</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><BarChart3 size={18} /></div>
                <div>
                  <div className="stat-num">{analyses.length}</div>
                  <div className="stat-label">Analyses</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Activity size={18} /></div>
                <div>
                  <div className="stat-num">{analyses.reduce((sum, a) => sum + (a.message_count || 0), 0)}</div>
                  <div className="stat-label">Questions Asked</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
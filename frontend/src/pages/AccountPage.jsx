import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database, BarChart3, MessageSquare, Lightbulb, Sparkles,
  Check, TrendingUp, Loader2, Zap, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAccountStats } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';

const AccountPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getAccountStats();
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load account stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleUpgrade = () => {
    toast.success('🚀 Pro plan launching soon!');
  };

  // Calculate usage percentage
  const getUsagePercent = (used, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  if (loading) {
    return (
      <div className="chat-page">
        <Sidebar />
        <main className="settings-main">
          <div className="chat-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading account...</p>
          </div>
        </main>
      </div>
    );
  }

  const planFeatures = {
    free: [
      '5 datasets',
      '100 analyses per month',
      'AI-powered chart generation',
      'Business insights',
      'Email support',
    ],
    pro: [
      'Unlimited datasets',
      'Unlimited analyses',
      'Advanced AI models',
      'Priority support',
      'Custom chart styles',
      'Export to PDF/PowerPoint',
    ],
  };

  const currentPlan = (stats?.plan || user?.plan || 'free').toLowerCase();
  const features = planFeatures[currentPlan] || planFeatures.free;

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
          >
            <h1>Account</h1>
            <p>Your plan, usage statistics, and limits</p>
          </motion.div>

          {/* Plan Card */}
          <motion.div
            className="plan-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="plan-name">Current Plan</div>
            <div className="plan-title">
              {currentPlan === 'free' ? (
                <>Free Plan <Sparkles size={24} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} /></>
              ) : (
                <>Pro Plan <Crown size={24} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} /></>
              )}
            </div>
            <div className="plan-price">
              {currentPlan === 'free' ? '$0 / month · Forever free' : '$19 / month · Premium features'}
            </div>

            <div className="plan-features">
              {features.map((f, i) => (
                <div key={i} className="plan-feature">
                  <Check size={16} /> {f}
                </div>
              ))}
            </div>

            {currentPlan === 'free' && (
              <button className="upgrade-btn" onClick={handleUpgrade}>
                <Zap size={16} /> Upgrade to Pro
              </button>
            )}
          </motion.div>

          {/* Usage Section */}
          <motion.div
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-head">
              <TrendingUp size={18} />
              <h2>Usage This Month</h2>
            </div>

            <div className="stats-grid">
              {/* Datasets */}
              <motion.div
                className="usage-card"
                whileHover={{ y: -3 }}
              >
                <div className="usage-icon"><Database size={18} /></div>
                <div className="usage-label">Datasets</div>
                <div className="usage-value">{stats?.datasets || 0}</div>
                <div className="usage-limit">
                  of {stats?.limits?.datasets || 5} allowed
                </div>
                <div className="usage-bar">
                  <motion.div
                    className="usage-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${getUsagePercent(stats?.datasets, stats?.limits?.datasets)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* Analyses */}
              <motion.div
                className="usage-card"
                whileHover={{ y: -3 }}
              >
                <div className="usage-icon"><BarChart3 size={18} /></div>
                <div className="usage-label">Analyses</div>
                <div className="usage-value">{stats?.analyses || 0}</div>
                <div className="usage-limit">
                  of {stats?.limits?.analyses_per_month || 100} per month
                </div>
                <div className="usage-bar">
                  <motion.div
                    className="usage-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${getUsagePercent(stats?.analyses, stats?.limits?.analyses_per_month)}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </div>
              </motion.div>

              {/* Messages */}
              <motion.div
                className="usage-card"
                whileHover={{ y: -3 }}
              >
                <div className="usage-icon"><MessageSquare size={18} /></div>
                <div className="usage-label">Questions Asked</div>
                <div className="usage-value">{stats?.messages || 0}</div>
                <div className="usage-limit">
                  Total messages
                </div>
                <div className="usage-bar">
                  <motion.div
                    className="usage-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats?.messages || 0) / 5)}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </div>
              </motion.div>

              {/* Insights */}
              <motion.div
                className="usage-card"
                whileHover={{ y: -3 }}
              >
                <div className="usage-icon"><Lightbulb size={18} /></div>
                <div className="usage-label">AI Insights</div>
                <div className="usage-value">{stats?.insights || 0}</div>
                <div className="usage-limit">
                  Generated by AI
                </div>
                <div className="usage-bar">
                  <motion.div
                    className="usage-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats?.insights || 0) * 2)}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.section
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-head">
              <Sparkles size={18} />
              <h2>Account Details</h2>
            </div>

            <div className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <label>Account Name</label>
                  <p>Your display name</p>
                </div>
                <div className="setting-value">
                  <span className="plan-badge">{user?.name}</span>
                </div>
              </div>

              <div className="setting-divider" />

              <div className="setting-row">
                <div className="setting-info">
                  <label>Email</label>
                  <p>Account login email</p>
                </div>
                <div className="setting-value">
                  <span className="plan-badge" style={{ textTransform: 'none' }}>
                    {user?.email}
                  </span>
                </div>
              </div>

              <div className="setting-divider" />

              <div className="setting-row">
                <div className="setting-info">
                  <label>Member Since</label>
                  <p>The day you joined DataChat</p>
                </div>
                <div className="setting-value">
                  <span className="plan-badge">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
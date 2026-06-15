import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    insights: true,
    weeklyReport: false,
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme} mode coming soon!`);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preference saved');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = () => {
    toast.error('Contact support to delete your account');
  };

  return (
    <div className="chat-page">
      <Sidebar />

      <main className="settings-main">
        <div className="settings-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="settings-header"
          >
            <h1>Settings</h1>
            <p>Manage your account preferences and DataChat configuration</p>
          </motion.div>

          {/* Profile Section */}
          <motion.section
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="section-head">
              <User size={18} />
              <h2>Profile</h2>
            </div>

            <div className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <label>Full Name</label>
                  <p>Your display name across DataChat</p>
                </div>
                <div className="setting-value">
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="setting-divider" />

              <div className="setting-row">
                <div className="setting-info">
                  <label>Email Address</label>
                  <p>Used for login and notifications</p>
                </div>
                <div className="setting-value">
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="setting-divider" />

              <div className="setting-row">
                <div className="setting-info">
                  <label>Current Plan</label>
                  <p>Your active subscription</p>
                </div>
                <div className="setting-value">
                  <span className="plan-badge">
                    <Sparkles size={12} />
                    {user?.plan || 'Free'} Plan
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Appearance Section */}
          <motion.section
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-head">
              <Moon size={18} />
              <h2>Appearance</h2>
            </div>

            <div className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <label>Theme</label>
                  <p>Choose how DataChat looks to you</p>
                </div>
                <div className="setting-value">
                  <div className="theme-toggle">
                    <button
                      className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <Moon size={14} /> Dark
                    </button>
                    <button
                      className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <Sun size={14} /> Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Notifications Section */}
          <motion.section
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-head">
              <Bell size={18} />
              <h2>Notifications</h2>
            </div>

            <div className="settings-card">
              {[
                { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive product news and updates' },
                { key: 'insights', label: 'Insight Alerts', desc: 'Get notified about important data insights' },
                { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Summary of your analyses every Monday' },
              ].map((item, i) => (
                <React.Fragment key={item.key}>
                  <div className="setting-row">
                    <div className="setting-info">
                      <label>{item.label}</label>
                      <p>{item.desc}</p>
                    </div>
                    <div className="setting-value">
                      <button
                        className={`toggle-switch ${notifications[item.key] ? 'on' : ''}`}
                        onClick={() => toggleNotification(item.key)}
                      >
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  </div>
                  {i < 2 && <div className="setting-divider" />}
                </React.Fragment>
              ))}
            </div>
          </motion.section>

          {/* AI & Privacy */}
          <motion.section
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="section-head">
              <Shield size={18} />
              <h2>AI & Privacy</h2>
            </div>

            <div className="settings-card">
              <div className="setting-row">
                <div className="setting-info">
                  <label>AI Model</label>
                  <p>Powered by Groq's Llama 3.3 70B for lightning-fast analysis</p>
                </div>
                <div className="setting-value">
                  <span className="model-badge">
                    <Sparkles size={12} />
                    Llama 3.3 70B
                  </span>
                </div>
              </div>

              <div className="setting-divider" />

              <div className="setting-row">
                <div className="setting-info">
                  <label>Data Privacy</label>
                  <p>Your raw data is never sent to AI. Only column metadata is shared.</p>
                </div>
                <div className="setting-value">
                  <span className="privacy-badge">
                    <Check size={12} />
                    100% Private
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-head danger">
              <Shield size={18} />
              <h2>Danger Zone</h2>
            </div>

            <div className="settings-card danger-card">
              <div className="setting-row">
                <div className="setting-info">
                  <label>Logout</label>
                  <p>Sign out of DataChat on this device</p>
                </div>
                <div className="setting-value">
                  <button className="btn-warn" onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>

              <div className="setting-divider" />

              <div className="setting-row">
                <div className="setting-info">
                  <label>Delete Account</label>
                  <p>Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <div className="setting-value">
                  <button className="btn-danger" onClick={handleDeleteAccount}>
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
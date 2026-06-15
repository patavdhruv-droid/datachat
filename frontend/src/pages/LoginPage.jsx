import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login as loginAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAPI(email, password);
      const { access_token, user } = res.data;
      login(access_token, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow"></div>
        <div className="auth-grid"></div>
      </div>

      {/* Top logo bar */}
      <div className="auth-topbar">
        <Link to="/" className="auth-logo">
          <img src="/logo.png" alt="DataChat" />
          <span>DataChat</span>
        </Link>
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Log in to continue analyzing your data</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </div>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="spin" /> Logging in...</>
            ) : (
              <>Log In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-social">
          <button className="social-btn" disabled>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Google
          </button>
          <button className="social-btn" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416c-.546-1.387-1.333-1.756-1.333-1.756c-1.089-.745.083-.729.083-.729c1.205.084 1.839 1.237 1.839 1.237c1.07 1.834 2.807 1.304 3.492.997c.107-.775.418-1.305.762-1.604c-2.665-.305-5.467-1.334-5.467-5.931c0-1.311.469-2.381 1.236-3.221c-.124-.303-.535-1.524.117-3.176c0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404c2.291-1.552 3.297-1.23 3.297-1.23c.653 1.653.242 2.874.118 3.176c.77.84 1.235 1.911 1.235 3.221c0 4.609-2.807 5.624-5.479 5.921c.43.372.823 1.102.823 2.222v3.293c0 .319.218.694.825.576C20.565 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
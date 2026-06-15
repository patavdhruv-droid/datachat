import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { signup as signupAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    length: password.length >= 6,
    match: password && password === confirmPassword,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await signupAPI({ name, email, password });
      const { access_token, user } = res.data;
      login(access_token, user);
      toast.success(`Welcome to DataChat, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Signup failed';
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
          <h1>Create your account</h1>
          <p>Start analyzing data in plain English</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Dhruv Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

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
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          {password && (
            <div className="password-checks">
              <div className={`check-item ${passwordChecks.length ? 'valid' : ''}`}>
                <Check size={14} /> At least 6 characters
              </div>
              <div className={`check-item ${passwordChecks.match ? 'valid' : ''}`}>
                <Check size={14} /> Passwords match
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="spin" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-terms">
          By signing up, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
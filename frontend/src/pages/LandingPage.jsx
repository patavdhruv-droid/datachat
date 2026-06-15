import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, Lock, Zap, ArrowRight, Play,
  BarChart3, Sparkles, TrendingUp, Database, Brain, Shield
} from 'lucide-react';
import '../styles/landing.css';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing">
      {/* ========== NAVIGATION ========== */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src="/logo.png" alt="DataChat" className="nav-logo-img" />
            <span className="nav-logo-text">DataChat</span>
          </Link>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">Login</Link>
            <Link to="/signup" className="nav-cta">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow"></div>
          <div className="hero-grid"></div>
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={14} />
            <span>Powered by Groq · 100% Private</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Talk to Your <span className="gradient-text">Data.</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Upload any spreadsheet and ask questions in plain English. Get charts,
            insights, and answers instantly — without writing a single line of code.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/signup" className="btn-primary">
              Start Free <ArrowRight size={18} />
            </Link>
            <a href="#demo" className="btn-secondary">
              <Play size={16} /> Watch Demo
            </a>
          </motion.div>

          <motion.div
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="trust-item">
              <Shield size={14} /> No credit card required
            </div>
            <div className="trust-item">
              <Zap size={14} /> Setup in 30 seconds
            </div>
            <div className="trust-item">
              <Lock size={14} /> Your data stays private
            </div>
          </motion.div>
        </motion.div>

        {/* ========== HERO DEMO CHAT PREVIEW ========== */}
        <motion.div
          className="hero-demo"
          id="demo"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="demo-window">
            <div className="demo-header">
              <div className="demo-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="demo-url">datachat.app/analysis</div>
            </div>

            <div className="demo-chat">
              <div className="demo-msg demo-msg-user">
                <div className="demo-avatar">D</div>
                <div className="demo-bubble">
                  Show me monthly revenue trend for 2024
                </div>
              </div>

              <div className="demo-msg demo-msg-ai">
                <div className="demo-avatar demo-avatar-ai">
                  <img src="/logo.png" alt="AI" />
                </div>
                <div className="demo-bubble demo-bubble-ai">
                  <div className="demo-chart">
                    <div className="chart-bars">
                      {[40, 55, 48, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                        <motion.div
                          key={i}
                          className="chart-bar"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + i * 0.05, duration: 0.5 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="demo-insight">
                    <TrendingUp size={14} />
                    Revenue increased <strong>28%</strong> from January to December.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="features" id="features">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-tag">Why DataChat</div>
            <h2 className="section-title">Built for the way you think.</h2>
            <p className="section-subtitle">
              No formulas. No SQL. No code. Just ask questions like you would to a human analyst.
            </p>
          </motion.div>

          <div className="features-grid">
            {[
              {
                icon: <MessageSquare size={28} />,
                title: 'Zero Learning Curve',
                desc: 'If you can type a question, you can analyze data. No Excel formulas, no Python, no SQL required.',
              },
              {
                icon: <Lock size={28} />,
                title: 'Privacy First',
                desc: 'Your data never leaves your device. We only send column names to the AI — never the actual data.',
              },
              {
                icon: <Zap size={28} />,
                title: 'Lightning Fast',
                desc: 'Powered by Groq LPU. Get charts and insights in milliseconds, not minutes.',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="how" id="how">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-tag">How It Works</div>
            <h2 className="section-title">From spreadsheet to insight in 3 steps.</h2>
          </motion.div>

          <div className="steps-grid">
            {[
              { num: '01', icon: <Database size={24} />, title: 'Upload your file', desc: 'Drag and drop any CSV or Excel file. Up to 200MB supported.' },
              { num: '02', icon: <Brain size={24} />, title: 'Ask anything', desc: 'Type questions naturally. "Top customers", "Revenue trend", anything.' },
              { num: '03', icon: <BarChart3 size={24} />, title: 'Get instant answers', desc: 'Charts, tables, and insights appear in seconds — beautifully formatted.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="cta">
        <div className="cta-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Stop drowning in spreadsheets.</h2>
            <p className="cta-subtitle">
              Join thousands of professionals who analyze data the smart way.
            </p>
            <Link to="/signup" className="btn-primary btn-large">
              Start Free Today <ArrowRight size={20} />
            </Link>
            <p className="cta-note">Free forever · No credit card · Setup in 30 seconds</p>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="DataChat" />
              <span>DataChat</span>
            </div>
            <p>AI-powered data analyst for everyone.</p>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Documentation</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <a href="#blog">Blog</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#terms">Terms</a>
              <a href="#privacy">Privacy</a>
              <a href="#security">Security</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 DataChat. Built with ❤️ for data lovers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
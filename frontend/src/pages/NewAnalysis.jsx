import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, ArrowLeft, Database, Sparkles, TrendingUp,
  Copy, Check, AlertCircle, BarChart3, FileSpreadsheet,
  Plus, Clock, LogOut, Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAnalysis, sendMessage, getDataset, listAnalyses, listDatasets, createAnalysis, API_BASE_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';

const NewAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [messages, setMessages] = useState([]);
  const [insights, setInsights] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAnalysis = useCallback(async () => {
    try {
      const res = await getAnalysis(id);
      setAnalysis(res.data);
      setMessages(res.data.messages || []);
      setInsights(res.data.insights || []);

      if (res.data.dataset_id) {
        const dsRes = await getDataset(res.data.dataset_id);
        setDataset(dsRes.data);
      }
    } catch (err) {
      toast.error('Failed to load analysis');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadSidebar = useCallback(async () => {
    try {
      const [anRes, dsRes] = await Promise.all([listAnalyses(), listDatasets()]);
      setAnalyses(anRes.data);
      setDatasets(dsRes.data);
    } catch (err) { /* silent */ }
  }, []);

  useEffect(() => {
    loadAnalysis();
    loadSidebar();
  }, [id, loadAnalysis, loadSidebar]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async () => {
    if (!question.trim() || sending) return;

    const userQuestion = question.trim();
    setQuestion('');

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userQuestion,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const res = await sendMessage(parseInt(id), userQuestion);
      const data = res.data;

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [
          ...withoutTemp,
          { id: `user-${Date.now()}`, role: 'user', content: userQuestion, created_at: new Date().toISOString() },
          {
            id: data.message_id,
            role: 'assistant',
            content: data.content,
            code: data.code,
            chart_url: data.chart_url,
            result_data: data.result_data,
            output_type: data.output_type,
            success: data.success,
            error: data.error,
            created_at: new Date().toISOString(),
          },
        ];
      });

      if (data.insights && data.insights.length > 0) {
        setInsights((prev) => [
          ...data.insights.map((text, i) => ({
            id: `new-${Date.now()}-${i}`,
            description: text,
            title: text.slice(0, 80),
          })),
          ...prev,
        ]);
      }

      if (data.analysis_title && analysis) {
        setAnalysis({ ...analysis, title: data.analysis_title });
        loadSidebar();
      }

      if (!data.success) {
        toast.error('Analysis failed — try rephrasing your question');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send message';
      toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (code, msgId) => {
    navigator.clipboard.writeText(code);
    setCopiedId(msgId);
    toast.success('Code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestion = (text) => {
    setQuestion(text);
    inputRef.current?.focus();
  };

  const handleNewAnalysis = async () => {
    if (datasets.length === 0) {
      navigate('/dashboard');
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

  const renderResultData = (data, outputType) => {
    if (!data) return null;

    if (outputType === 'number') {
      return (
        <div className="result-number">
          {typeof data === 'number' ? data.toLocaleString(undefined, { maximumFractionDigits: 2 }) : data}
        </div>
      );
    }

    if (outputType === 'table' && Array.isArray(data) && data.length > 0) {
      const cols = Object.keys(data[0]);
      return (
        <div className="result-table-wrap">
          <table className="result-table">
            <thead>
              <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((row, i) => (
                <tr key={i}>
                  {cols.map((c) => <td key={c}>{String(row[c]).slice(0, 100)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 20 && (
            <div className="result-table-more">+ {data.length - 20} more rows</div>
          )}
        </div>
      );
    }

    if (outputType === 'table' && typeof data === 'object') {
      const entries = Object.entries(data).slice(0, 20);
      return (
        <div className="result-table-wrap">
          <table className="result-table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {entries.map(([k, v], i) => (
                <tr key={i}><td>{k}</td><td>{String(v).slice(0, 100)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <Loader2 size={32} className="spin" />
        <p>Loading analysis...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* SIDEBAR */}
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

        <div className="sidebar-section">
          <div className="sidebar-label">Recent Analyses</div>
          <div className="sidebar-list">
            {analyses.length === 0 ? (
              <div className="sidebar-empty">No analyses yet</div>
            ) : (
              analyses.slice(0, 12).map((a) => (
                <button
                  key={a.id}
                  className={`sidebar-item ${a.id === parseInt(id) ? 'active' : ''}`}
                  onClick={() => { navigate(`/analysis/${a.id}`); window.location.reload(); }}
                >
                  <Clock size={14} />
                  <span className="sidebar-item-text">{a.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

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

      {/* MAIN CHAT */}
      <main className="chat-main">
        <div className="chat-topbar">
          <button className="chat-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
          </button>
          <div className="chat-title-wrap">
            <h2 className="chat-title">{analysis?.title || 'New Analysis'}</h2>
            {dataset && (
              <div className="chat-subtitle">
                <FileSpreadsheet size={12} />
                <span>{dataset.filename}</span>
                <span className="dot">·</span>
                <span>{dataset.rows?.toLocaleString()} rows</span>
                <span className="dot">·</span>
                <span>{dataset.columns} columns</span>
              </div>
            )}
          </div>
        </div>

        <div className="chat-area">
          {messages.length === 0 && !sending ? (
            <div className="chat-empty">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-content"
              >
                <div className="empty-logo">
                  <img src="/logo.png" alt="DataChat" />
                </div>
                <h1>Ask anything about your data</h1>
                <p>Type a question in plain English. Get charts, tables, and insights instantly.</p>

                <div className="suggestions-grid">
                  {[
                    { icon: <TrendingUp size={16} />, text: 'Show me a summary of this data' },
                    { icon: <BarChart3 size={16} />, text: 'Create a chart of the most important column' },
                    { icon: <Sparkles size={16} />, text: 'Find the top 10 records' },
                    { icon: <Database size={16} />, text: 'How many rows and columns are there?' },
                  ].map((s, i) => (
                    <button key={i} className="suggestion-btn" onClick={() => handleSuggestion(s.text)}>
                      {s.icon}
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="messages-container">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`message message-${msg.role}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-avatar">
                      {msg.role === 'user' ? (
                        user?.name?.[0]?.toUpperCase() || 'U'
                      ) : (
                        <img src="/logo.png" alt="AI" />
                      )}
                    </div>

                    <div className="message-content">
                      <div className="message-role">
                        {msg.role === 'user' ? user?.name || 'You' : 'DataChat'}
                      </div>
                      <div className="message-body">
                        <p className="message-text">{msg.content}</p>

                        {msg.chart_url && (
                          <div className="message-chart">
                            <img src={`${API_BASE_URL}${msg.chart_url}`} alt="Chart" />
                          </div>
                        )}

                        {msg.result_data && renderResultData(msg.result_data, msg.output_type)}

                        {msg.code && (
                          <details className="message-code-wrap">
                            <summary className="code-summary">
                              <span>View generated code</span>
                            </summary>
                            <div className="code-block">
                              <button
                                className="code-copy"
                                onClick={() => handleCopyCode(msg.code, msg.id)}
                              >
                                {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                                {copiedId === msg.id ? 'Copied' : 'Copy'}
                              </button>
                              <pre><code>{msg.code}</code></pre>
                            </div>
                          </details>
                        )}

                        {msg.error && (
                          <div className="message-error">
                            <AlertCircle size={14} />
                            <span>{msg.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {sending && (
                  <motion.div
                    className="message message-assistant"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-avatar">
                      <img src="/logo.png" alt="AI" />
                    </div>
                    <div className="message-content">
                      <div className="message-role">DataChat</div>
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-box">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask anything about your data..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
            />
            <button
              className="chat-send"
              onClick={handleSend}
              disabled={!question.trim() || sending}
            >
              {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
            </button>
          </div>
          <div className="chat-footer-hint">
            DataChat may produce inaccurate results. Always verify important insights.
          </div>
        </div>
      </main>

      {insights.length > 0 && (
        <aside className="insights-panel">
          <div className="insights-header">
            <Lightbulb size={16} />
            <span>Insights</span>
          </div>
          <div className="insights-list">
            {insights.slice(0, 10).map((ins) => (
              <motion.div
                key={ins.id}
                className="insight-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p>{ins.description}</p>
              </motion.div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default NewAnalysis;
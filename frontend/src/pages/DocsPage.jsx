import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Rocket, Shield, FileSpreadsheet, HelpCircle,
  MessageCircle, Mail, ChevronDown, Sparkles, Zap, Lock,
  Database, BarChart3, Lightbulb, Check, ExternalLink
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';
import '../styles/docs.css';

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState(0);

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: <Rocket size={14} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={14} /> },
    { id: 'files', label: 'Supported Files', icon: <FileSpreadsheet size={14} /> },
    { id: 'examples', label: 'Example Prompts', icon: <Sparkles size={14} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={14} /> },
    { id: 'support', label: 'Support', icon: <MessageCircle size={14} /> },
  ];

  const faqs = [
    {
      q: 'Is my data really private?',
      a: 'Yes! DataChat never sends your raw data to the AI. We only share column names and data types so the AI can understand the structure. The actual data processing happens locally on your machine. Your spreadsheets never leave the secure environment.',
    },
    {
      q: 'What file formats are supported?',
      a: 'DataChat supports CSV (.csv), Excel (.xlsx, .xls) files. Maximum file size is 200MB. We recommend cleaning your data (consistent headers, proper data types) for best results.',
    },
    {
      q: 'How fast is DataChat?',
      a: 'Thanks to Groq\'s LPU inference engine, AI code generation typically takes 200-500ms. The total response time (including chart generation) is usually under 3 seconds.',
    },
    {
      q: 'What AI model powers DataChat?',
      a: 'DataChat uses Llama 3.3 70B Versatile model via Groq. It\'s one of the most capable open-source LLMs, fine-tuned for code generation and data analysis tasks.',
    },
    {
      q: 'Can I export my analyses?',
      a: 'Currently you can copy generated Python code. Export to PDF/PowerPoint is coming in the Pro plan. Charts are saved as PNG files automatically.',
    },
    {
      q: 'Are there any usage limits?',
      a: 'Free plan: 5 datasets, 100 analyses/month. Pro plan: Unlimited everything. Both plans have access to all AI features.',
    },
    {
      q: 'What if AI gives wrong results?',
      a: 'AI can make mistakes! Always verify important insights. You can rephrase your question or click "View generated code" to see exactly what was computed. We\'re continuously improving accuracy.',
    },
  ];

  const examples = [
    { icon: <BarChart3 size={16} />, prompt: 'Show me the top 10 customers by revenue' },
    { icon: <BarChart3 size={16} />, prompt: 'Plot a bar chart of sales by category' },
    { icon: <Lightbulb size={16} />, prompt: 'What are the key trends in this data?' },
    { icon: <Database size={16} />, prompt: 'How many rows have missing values?' },
    { icon: <BarChart3 size={16} />, prompt: 'Create a pie chart of revenue by region' },
    { icon: <Lightbulb size={16} />, prompt: 'Find the average order value per month' },
    { icon: <BarChart3 size={16} />, prompt: 'Show monthly revenue trend as a line chart' },
    { icon: <Database size={16} />, prompt: 'Which product has the highest growth rate?' },
  ];

  return (
    <div className="chat-page">
      <Sidebar />

      <main className="settings-main">
        <div className="docs-layout">
          {/* Docs Sidebar */}
          <aside className="docs-sidebar">
            <div className="docs-sidebar-title">
              <BookOpen size={16} />
              Documentation
            </div>
            <nav className="docs-nav">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`docs-nav-item ${activeSection === s.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          {/* Docs Content */}
          <div className="docs-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="settings-header"
            >
              <h1>
                Documentation <BookOpen size={28} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6, color: 'var(--text-secondary)' }} />
              </h1>
              <p>Everything you need to master DataChat</p>
            </motion.div>

            {/* Getting Started */}
            <motion.section
              id="getting-started"
              className="docs-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="docs-section-head">
                <Rocket size={20} />
                <h2>Getting Started</h2>
              </div>
              <p className="docs-intro">
                DataChat lets you analyze any spreadsheet using plain English. Here's how to get started in 3 simple steps:
              </p>

              <div className="docs-steps">
                <div className="docs-step">
                  <div className="docs-step-num">1</div>
                  <div>
                    <h3>Upload Your Data</h3>
                    <p>Go to the Dashboard and drag-and-drop your CSV or Excel file. Or click "Choose File" to browse. Max file size is 200MB.</p>
                  </div>
                </div>
                <div className="docs-step">
                  <div className="docs-step-num">2</div>
                  <div>
                    <h3>Ask Questions</h3>
                    <p>Type questions in plain English. No SQL, no formulas, no code needed. Just ask like you would ask a colleague.</p>
                  </div>
                </div>
                <div className="docs-step">
                  <div className="docs-step-num">3</div>
                  <div>
                    <h3>Get Instant Insights</h3>
                    <p>DataChat generates charts, tables, and business insights in seconds. Review the results and refine your questions.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Privacy */}
            <motion.section
              id="privacy"
              className="docs-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="docs-section-head">
                <Shield size={20} />
                <h2>Privacy & Security</h2>
              </div>
              <p className="docs-intro">
                Your data privacy is our top priority. Here's exactly how DataChat handles your information:
              </p>

              <div className="docs-feature-list">
                <div className="docs-feature">
                  <Check size={16} />
                  <div>
                    <strong>Data Stays Local</strong>
                    <p>Your spreadsheet data is processed on our server but never sent to the AI. Only metadata (column names, types) is shared.</p>
                  </div>
                </div>
                <div className="docs-feature">
                  <Check size={16} />
                  <div>
                    <strong>Secure Code Execution</strong>
                    <p>AI-generated code runs in a sandboxed environment with blocked access to file system, network, and dangerous functions.</p>
                  </div>
                </div>
                <div className="docs-feature">
                  <Check size={16} />
                  <div>
                    <strong>Encrypted Authentication</strong>
                    <p>Passwords are hashed with bcrypt. Sessions use JWT tokens with industry-standard encryption.</p>
                  </div>
                </div>
                <div className="docs-feature">
                  <Check size={16} />
                  <div>
                    <strong>No Data Selling</strong>
                    <p>We will never sell, share, or use your data for advertising. You can delete your data anytime.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Supported Files */}
            <motion.section
              id="files"
              className="docs-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="docs-section-head">
                <FileSpreadsheet size={20} />
                <h2>Supported Files</h2>
              </div>

              <div className="docs-file-grid">
                <div className="docs-file-card">
                  <div className="docs-file-icon">.csv</div>
                  <strong>CSV Files</strong>
                  <p>Comma-separated values. Most common format. UTF-8 and Latin-1 encodings supported.</p>
                </div>
                <div className="docs-file-card">
                  <div className="docs-file-icon">.xlsx</div>
                  <strong>Excel 2007+</strong>
                  <p>Modern Excel format. First sheet is automatically used for analysis.</p>
                </div>
                <div className="docs-file-card">
                  <div className="docs-file-icon">.xls</div>
                  <strong>Excel 97-2003</strong>
                  <p>Legacy Excel format. Fully supported for compatibility with older files.</p>
                </div>
              </div>

              <div className="docs-tip">
                <Zap size={16} />
                <div>
                  <strong>Pro Tip:</strong> Clean headers and consistent data types give the AI the best context for accurate analysis.
                </div>
              </div>
            </motion.section>

            {/* Examples */}
            <motion.section
              id="examples"
              className="docs-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="docs-section-head">
                <Sparkles size={20} />
                <h2>Example Prompts</h2>
              </div>
              <p className="docs-intro">
                Not sure what to ask? Try these proven prompts that work great with most datasets:
              </p>

              <div className="docs-examples-grid">
                {examples.map((ex, i) => (
                  <div key={i} className="docs-example">
                    {ex.icon}
                    <span>"{ex.prompt}"</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* FAQ */}
            <motion.section
              id="faq"
              className="docs-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="docs-section-head">
                <HelpCircle size={20} />
                <h2>Frequently Asked Questions</h2>
              </div>

              <div className="docs-faq-list">
                {faqs.map((faq, i) => (
                  <div key={i} className={`docs-faq ${openFaq === i ? 'open' : ''}`}>
                    <button
                      className="docs-faq-question"
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="docs-faq-answer-wrap"
                        >
                          <div className="docs-faq-answer">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Support */}
            <motion.section
              id="support"
              className="docs-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="docs-section-head">
                <MessageCircle size={20} />
                <h2>Need Help?</h2>
              </div>
              <p className="docs-intro">
                Can't find what you're looking for? We're here to help!
              </p>

              <div className="docs-support-grid">
                <a href="mailto:support@datachat.app" className="docs-support-card">
                  <Mail size={20} />
                  <strong>Email Support</strong>
                  <p>support@datachat.app</p>
                  <span className="docs-support-link">
                    Send email <ExternalLink size={12} />
                  </span>
                </a>
                <a href="#community" className="docs-support-card">
                  <MessageCircle size={20} />
                  <strong>Community</strong>
                  <p>Join our Discord community</p>
                  <span className="docs-support-link">
                    Join now <ExternalLink size={12} />
                  </span>
                </a>
                <a href="#docs" className="docs-support-card">
                  <Lock size={20} />
                  <strong>Security Report</strong>
                  <p>Found a vulnerability? Tell us</p>
                  <span className="docs-support-link">
                    Report <ExternalLink size={12} />
                  </span>
                </a>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocsPage;
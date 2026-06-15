<div align="center">
  <img src="frontend/public/logo.png" alt="DataChat Logo" width="120" />
  
  # DataChat
  
  ### Talk to Your Data.
  
  AI-powered data analyst that lets you query spreadsheets in plain English.  
  Upload any CSV, ask questions, get instant charts and insights.
  
  [Features](#features) · [Tech Stack](#tech-stack) · [Demo](#demo)
</div>

---

## ✨ Features

- 💬 **Zero Learning Curve** — Ask questions in plain English. No SQL, no Python, no Excel formulas.
- ⚡ **Lightning Fast** — Powered by Groq's LPU. AI responses in milliseconds.
- 🔒 **100% Private** — Your data never leaves the server. Only column metadata is sent to AI.
- 📊 **Beautiful Charts** — Automatic chart generation with premium styling.
- 💡 **AI Insights** — Business insights generated automatically from your queries.
- 🛡️ **Safe Execution** — All AI-generated code runs in a secure sandbox.

---

## 🚀 Tech Stack

### Backend
- **FastAPI** — Modern Python web framework
- **Groq** — Llama 3.3 70B for AI code generation
- **Pandas** — Data manipulation
- **Matplotlib + Seaborn** — Chart generation
- **SQLite** — Database
- **JWT** — Authentication

### Frontend
- **React 18** — UI framework
- **React Router** — Routing
- **Framer Motion** — Animations
- **Lucide React** — Icons
- **Axios** — API calls

---

## 🎯 How It Works

1. **Upload** your CSV/Excel file (up to 200MB)
2. **Ask** any question in plain English
3. **AI writes Python code** in 200ms via Groq
4. **Code executes safely** on your data
5. **Get charts, tables, and insights** instantly

---

## 🛠️ Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Add your Groq API key to .env
uvicorn app:app --reload

## 👨‍💻 Author & Owner

**Dhruv Patav** — Founder & Sole Creator  
GitHub: [@patavdhruv-droid](https://github.com/patavdhruv-droid)  
Built at **age 15** 🚀

© 2026 Dhruv Patav. All rights reserved.

---

*Developed with AI-assisted pair programming.*


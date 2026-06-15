---
title: DataChat API
emoji: 📊
colorFrom: gray
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# DataChat API

Backend API for DataChat — AI-powered data analyst.

## Tech Stack
- FastAPI
- Groq (Llama 3.3 70B)
- Pandas + Matplotlib
- SQLite + JWT Auth

## Endpoints
- `/docs` — Interactive API documentation
- `/health` — Health check
- `/api/auth/*` — Authentication
- `/api/datasets/*` — Dataset management
- `/api/analyses/*` — Analysis sessions
- `/api/chat` — Main chat endpoint

Built with ❤️ by [Dhruv Patav](https://github.com/patavdhruv-droid)
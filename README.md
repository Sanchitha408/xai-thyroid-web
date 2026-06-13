# XAI Thyroid — Intelligent Thyroid Diagnosis Platform
> **"Predict. Explain. Trust."**

A production-ready, OWASP-secured full-stack web application for AI-powered thyroid disease detection with SHAP explainability, a Groq-powered multilingual chatbot, and a cinematic scroll-animated React frontend.

---

## 🏗️ Architecture

```
React 18 + Vite (port 5173)
     │
     ▼ REST API (Axios)
Node.js + Express (port 5000)  ←→  PostgreSQL 15
     │                         ←→  Groq API (llama3-8b-8192)
     ▼ HTTP
Python FastAPI ML Service (port 8000)
     └── scikit-learn / xgboost + SHAP
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20 LTS
- Python 3.10+
- PostgreSQL 15 (local or via Docker)

### 1. Clone & Setup
```bash
git clone <repo-url>
cd xai-thyroid-web
```

### 2. Database (Docker — recommended)
```bash
docker-compose up postgres -d
```
Or use an existing PostgreSQL instance and update `server/.env`.

### 3. Backend
```bash
cd server
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run migrate     # runs Sequelize migrations
npm run seed        # optional: seeds demo data
npm run dev         # starts on port 5000
```

### 4. Python ML Service
```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Place your trained model at ml-service/models/best_model.pkl
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. Frontend
```bash
cd client
cp .env.example .env    # set VITE_API_BASE_URL
npm install
npm run dev             # starts on port 5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

### `server/.env`
| Variable | Description |
|---|---|
| `PORT` | Backend port (default 5000) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | PostgreSQL connection |
| `JWT_SECRET` | Min 64 chars — generate with `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | Token TTL (default `7d`) |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) |
| `ML_SERVICE_URL` | Python service URL (default `http://localhost:8000`) |
| `FRONTEND_URL` | CORS whitelist (default `http://localhost:5173`) |

### `client/.env`
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base (default `http://localhost:5000/api/v1`) |

---

## 🤖 ML Model

Place your pre-trained model at `ml-service/models/best_model.pkl`.

The model must:
- Accept features: `[tsh, t3, tt4, fti, age, sex]` (sex: Female=1, Male=0)
- Be a scikit-learn or XGBoost classifier with `predict()` and `predict_proba()`
- Output classes: `['Normal', 'Hypothyroid', 'Hyperthyroid']`
- Be compatible with `shap.TreeExplainer`

---

## 🔒 Security (OWASP Top 10)

| Control | Implementation |
|---|---|
| Injection | Sequelize ORM parameterized queries only |
| Broken Auth | bcrypt (rounds=12), JWT HS256 7d, rate limiting |
| Broken Access Control | JWT middleware on all protected routes, ownership checks |
| Security Misconfiguration | helmet.js strict CSP, CORS whitelist, no stack traces |
| XSS | express-validator escape + React JSX auto-escape |
| Sensitive Data | HTTPS in prod, no plain-text PII in logs, GROQ key server-only |
| Rate Limiting | global 200/15min, auth 10/15min, predict 30/hr, chat 20/5min |
| Logging | Winston structured JSON, sensitive fields masked |
| LLM Injection | Prompt injection keyword blocklist on chat endpoint |

> ⚠️ **Before production deploy:** Run `npm audit` in both `server/` and `client/` and apply `npm audit fix`.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, GSAP v3 |
| Animation | GSAP ScrollTrigger, TextPlugin |
| Charts | Recharts |
| Icons | Lucide React |
| i18n | react-i18next (EN, HI, KN, TA, FR, ES) |
| PDF | jsPDF + html2canvas |
| Backend | Node.js v20, Express.js v4 |
| ORM | Sequelize v6 + PostgreSQL 15 |
| Auth | JWT + bcryptjs |
| AI | Groq API (llama3-8b-8192) |
| ML Service | Python FastAPI, scikit-learn, XGBoost, SHAP |

---

## 🌍 Supported Languages
English · हिन्दी (Hindi) · ಕನ್ನಡ (Kannada) · தமிழ் (Tamil) · Français · Español

---

## 📊 Dataset
Based on the [UCI Thyroid Disease Dataset](https://archive.ics.uci.edu/ml/datasets/thyroid+disease). Model trained offline — see `ml-service/` for inference code.

---

## 📜 License
MIT — see LICENSE file.

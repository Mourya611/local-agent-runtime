# Public Demo Deployment Architecture (Vercel + Render)

This document outlines how to deploy a public web link (`https://your-agent.vercel.app`) for recruiters and visitors while keeping your personal Chrome CDP control and filesystem local.

---

## System Architecture

```text
                         INTERNET
                            │
                            ▼
                    ┌──────────────┐
                    │    Vercel    │
                    │  Next.js UI  │
                    └──────┬───────┘
                           │
                         HTTPS
                           │
                           ▼
                    ┌──────────────┐
                    │    Render    │
                    │   FastAPI    │
                    └──────┬───────┘
                           │
                  ┌────────┼─────────┐
                  ▼        ▼         ▼
               Agent    Gemini    Tavily
               Core       API       API
                  │
          ┌───────┼─────────┐
          ▼       ▼         ▼
       Planner  Research  Verify
                  │
                  ▼
               Evidence
                  │
                  ▼
               Result
```

---

## 1. Deploying Backend to Render

1. Log into [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`local-agent-runtime`).
4. Configure service settings:
   - **Name**: `local-agent-runtime-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `AGENT_MODE`: `public`
   - `GEMINI_API_KEY`: `<your_gemini_key>`
   - `TAVILY_API_KEY`: `<your_tavily_key>`
   - `CORS_ORIGINS`: `https://your-agent.vercel.app` (or Vercel preview domain)
   - `MAX_TASK_DURATION_SECONDS`: `120`
   - `MAX_TOOL_CALLS_PER_TASK`: `20`
   - `MAX_SEARCHES_PER_TASK`: `8`
   - `MAX_LLM_CALLS_PER_TASK`: `10`
   - `MAX_CONCURRENT_PUBLIC_TASKS`: `3`
   - `RATE_LIMIT_REQUESTS_PER_MIN`: `5`
6. Click **Create Web Service**.
7. Copy your backend HTTPS URL (e.g. `https://local-agent-runtime-backend.onrender.com`).

---

## 2. Deploying Frontend to Vercel

1. Log into [Vercel.com](https://vercel.com/new).
2. Import your GitHub repository (`local-agent-runtime`).
3. Set **Framework Preset**: `Next.js`
4. Set **Root Directory**: `frontend`
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://local-agent-runtime-backend.onrender.com`
   - `NEXT_PUBLIC_WS_URL`: `wss://local-agent-runtime-backend.onrender.com`
6. Click **Deploy**.

---

## 3. Security Boundary Summary

| Feature | Local Mode (`AGENT_MODE=local`) | Public Demo Mode (`AGENT_MODE=public`) |
| :--- | :--- | :--- |
| **Chrome CDP Control** | Allowed (`127.0.0.1:9222`) | **Strictly Denied** |
| **Personal Sessions & Cookies** | Reused from local Chrome | **Strictly Denied** |
| **Tool Execution** | All tools enabled | **Strict Allowlist** (`web_search`, `web_extract`, `safe_http_get`, `source_analysis`, `verification`) |
| **Rate Limiting** | Disabled | **Enforced** (5 req/min/IP) |
| **Execution Budgets** | Unlimited | **Enforced** (120s timeout, max 10 LLM calls, max 3 concurrent tasks) |
| **Memory Persistence** | Saved to `data/agent_runtime.db` | **Ephemeral task context** |

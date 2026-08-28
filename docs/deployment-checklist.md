# Production Deployment Checklist

Before announcing your public demo URL (`https://your-agent.vercel.app`), complete and verify this checklist:

---

## 1. Security & Configuration Checks

- [ ] **GitHub Repository Clean**: Verified zero `.env` or hardcoded API keys in tracked files.
- [ ] **AGENT_MODE Enforced**: Backend configured with `AGENT_MODE=public`.
- [ ] **Public Tool Allowlist Active**: `web_search`, `web_extract`, `safe_http_get`, `source_analysis`, `verification` allowed; local Chrome CDP and shell strictly denied.
- [ ] **CORS Configured**: `CORS_ORIGINS` set to Vercel domain (`https://your-agent.vercel.app`) without wildcard `*`.
- [ ] **API Keys Isolated**: `GEMINI_API_KEY` and `TAVILY_API_KEY` configured strictly on Render backend. No keys in Vercel environment.
- [ ] **IP Rate Limit**: 5 requests/minute limit active.
- [ ] **Execution Budgets**: Max task duration 120s, max LLM calls 10, max searches 8, max concurrent public tasks 3.
- [ ] **Untrusted Data Boundary**: Web page search content treated strictly as untrusted data.

---

## 2. Health & Live Testing

- [ ] **Backend Health Endpoint**: `GET https://your-backend.onrender.com/health` returns `200 OK` with `mode: "public"`.
- [ ] **Diagnostics Endpoint**: `GET https://your-backend.onrender.com/api/diagnostics` returns `200 OK`.
- [ ] **Frontend Vercel Build**: Next.js production build completes with 0 errors.
- [ ] **WebSocket Live Events**: Execution timeline updates via WebSocket in public mode.
- [ ] **Public Demo Banner**: Header displays amber "PUBLIC DEMO - Cloud Research Sandbox" banner.
- [ ] **Local Mode Regression**: `AGENT_MODE=local` still connects to host Chrome CDP (`port 9222`) and passes all automated tests.

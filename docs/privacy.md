# Privacy Architecture

## Data Privacy Model

The Open-Source Agent Runtime follows a **Local-First** design model:

```text
Local Computer (Host Machine)
 ├── Next.js Dashboard UI (Port 3000)
 ├── FastAPI Agent Core (Port 8000)
 ├── SQLite Local Database (data/agent_runtime.db)
 ├── Evidence Vault & Screenshots (runs/<run_id>/)
 └── Host Chrome CDP Session (Port 9222)
```

---

## What Stays 100% Local

* **Local Browser Cookies & Authentication**: Logged-in web sessions (e.g., LinkedIn, GitHub, internal dashboards) remain inside your local Chrome profile.
* **Evidence Screenshots & Artifacts**: All captured PNG screenshots and execution history files are written strictly to your local filesystem inside `runs/`.
* **Database Records**: Task run history and preference memories are saved locally in SQLite (`data/agent_runtime.db`).

---

## What Is Sent to External APIs

* **Prompts & Search Queries**: Task prompts and search strings are transmitted to:
  * Google Gemini API (`generativelanguage.googleapis.com`)
  * Tavily Search API (`api.tavily.com`)
  * Groq API (if configured)
* No browser cookies, session tokens, or local credentials are ever sent to external LLM or search APIs.

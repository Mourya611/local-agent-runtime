# Open-Source Local-First AI Agent Runtime

An open-source, local-first, model-agnostic AI agent runtime that can research, operate browsers, use tools, verify results, and provide evidence-backed execution.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-indigo.svg)](docs/requirements.md)
[![Next.js 16](https://img.shields.io/badge/next.js-16.3-black.svg)](frontend/package.json)

---

## Key Differentiators

* **Local-First & Privacy-Conscious**: All browser automation, evidence storage, database state, and session logs reside on your local machine.
* **Existing Browser Session Reuse**: Connects directly to your running local Chrome via Remote Debugging CDP (`port 9222`) without requiring password logins.
* **Model Independence**: Swappable LLM provider abstraction supporting **Google Gemini** and **Groq** with automatic rate-limit fallback.
* **Modular Skill Engine**: Extensible YAML skill definitions allowing developers to register domain-specific workflows (e.g., `skills/recruiter_scout/`, `skills/example_researcher/`).
* **Empirical Evidence & Verification**: Captures screenshots for every browser action and audits output validity (`Verified`, `Likely`, `Unverified`).
* **Human-in-the-Loop Policy Control**: Policy engine prompts for human approval before executing sensitive browser actions.

---

## What This Project Is NOT

> This project is not intended to be a clone of any specific commercial AI assistant. It provides an open-source runtime where developers can control the models, tools, skills, policies, browser environment, and execution behavior.

---

## System Architecture Overview

```text
                    USER
                      │
                      ▼
                NEXT.JS UI (Port 3000)
                      │
                WebSocket / REST API
                      │
                      ▼
            AGENT RUNTIME (FastAPI Port 8000)
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    PLANNER         SKILLS         MEMORY
       │              │              │
       └──────────────┼──────────────┘
                      ▼
                POLICY ENGINE
                      │
                      ▼
                 TOOL ROUTER
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    BROWSER         SEARCH          HTTP
       │              │
       ▼              ▼
     CHROME         TAVILY
       │
       ▼
   OBSERVATION
       │
       ▼
   VERIFICATION ENGINE
       │
       ▼
  EVIDENCE VAULT (Screenshots & Sources)
       │
       ▼
   EXECUTIVE ABSTRACT & DIRECT LINKS
```

---

## Quick Start Guide

### 1. Requirements

* **Node.js**: v18.0.0 or higher
* **Python**: v3.10 or higher
* **Chrome / Chromium Browser**
* **API Keys**:
  * `GEMINI_API_KEY` (Required for primary planning)
  * `TAVILY_API_KEY` (Required for web search)
  * `GROQ_API_KEY` (Optional for fast inference fallback)

For full platform specifications, see [docs/requirements.md](docs/requirements.md).

---

### 2. Clone & Setup Environment

```bash
# Clone the repository
git clone https://github.com/your-org/browsing-agent.git
cd browsing-agent

# Create copy of environment file
cp .env.example .env
```

Edit `.env` and insert your API credentials:
```env
GEMINI_API_KEY=your_actual_gemini_key
TAVILY_API_KEY=your_actual_tavily_key
GROQ_API_KEY=your_optional_groq_key
```

---

### 3. Install & Start Backend

```bash
# Setup Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

---

### 4. Install & Start Frontend

In a separate terminal window:

```bash
cd frontend

# Install Node modules
npm install

# Start Next.js dev server on port 3000
npm run dev
```

---

### 5. Launch Chrome with Remote Debugging (Optional for Live Browser Control)

To enable live session reuse in your local Chrome browser:

**Windows PowerShell:**
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:LOCALAPPDATA\Google\Chrome\User Data"
```

**macOS:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Linux:**
```bash
google-chrome --remote-debugging-port=9222
```

---

### 6. Open Application & Run Your First Task

1. Open your browser to [http://localhost:3000](http://localhost:3000).
2. Enter an objective, e.g.:
   > *"Give me the best Clinical decision support tools in India developed by pharma and AI healthcare companies"*
3. Click **Execute Goal** and watch the agent create a plan, execute web search, capture screenshots, and display verified direct source links!

---

## Documentation

* [Architecture Overview](docs/architecture.md)
* [System Requirements](docs/requirements.md)
* [Security & Threat Model](docs/security.md)
* [Privacy & Data Flow](docs/privacy.md)
* [Chrome CDP Setup Guide](docs/browser-setup.md)
* [Modular Skill Development Guide](skills/example_researcher/README.md)
* [Tool Development Guide](docs/tools.md)
* [Policy Engine Guide](docs/policies.md)
* [Evidence Vault Documentation](docs/evidence.md)

---

## Testing

Run the automated backend test suite:

```bash
$env:PYTHONPATH="."
pytest backend/tests
```

---

## Contributing

We welcome community contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting Pull Requests.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

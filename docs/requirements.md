# System & Environment Requirements

## Required Runtime Environment

### Core Prerequisites
* **Python**: `v3.10` or higher (Python 3.11 / 3.12 / 3.13 recommended)
* **Node.js**: `v18.0.0` or higher (Node 20+ LTS recommended)
* **npm**: `v9.0.0` or higher
* **Google Chrome**: Latest stable version (for local CDP session control)

---

## Required API Keys

To execute research and planning workflows, you must provide valid credentials in your `.env` file:

| API Key | Required/Optional | Purpose | Free Tier Available |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Required** | Primary task planning & synthesis | Yes ([Google AI Studio](https://aistudio.google.com/)) |
| `TAVILY_API_KEY` | **Required** | Web search & URL discovery | Yes ([Tavily AI](https://tavily.com/)) |
| `GROQ_API_KEY` | *Optional* | Fast LLM inference fallback | Yes ([Groq Console](https://console.groq.com/)) |

---

## Operating System Compatibility

* **Windows 10/11**: Fully supported (PowerShell & Command Prompt)
* **macOS 12+ (Intel & Apple Silicon)**: Fully supported (zsh & bash)
* **Linux (Ubuntu 20.04+, Debian 11+, Fedora)**: Fully supported (bash)

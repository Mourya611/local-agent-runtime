# Project Roadmap

This document outlines the strategic development milestones for the Open-Source Local-First Agent Runtime.

---

## v0.1 — Open-Source Foundation (Current Release)

* [x] Core FastAPI Agent Runtime & Next.js dashboard
* [x] Gemini & Groq model provider integration with rate-limit retries
* [x] Host Chrome CDP session reuse (`port 9222`) & Playwright fallback
* [x] Tavily web search integration
* [x] Empirical evidence vault (screenshot capture + audit verifier)
* [x] Policy Engine with Human-in-the-Loop confirmation
* [x] Modular Skill Loader (`recruiter_scout`, `example_researcher`)
* [x] Developer diagnostics & health endpoints

---

## v0.2 — Agent Platform & Extended Tooling (Planned)

* [ ] **Ollama & Local LLM Provider**: Enable 100% offline local model execution (Llama 3, DeepSeek-R1).
* [ ] **Extended Search Providers**: Brave Search, Serper, and Exa provider integration.
* [ ] **Enhanced Memory Store**: Vector-based local semantic memory for cross-session knowledge retrieval.
* [ ] **Interactive Tool Marketplace**: Dynamic skill installation directly from community repositories.

---

## v0.3 — Multi-Agent Workflows & Scheduled Execution (Planned)

* [ ] **Multi-Agent Collaboration**: Parallel subagent task delegation for complex long-running research.
* [ ] **Scheduled & Recurring Cron Tasks**: Background execution for periodic monitoring & report generation.
* [ ] **Headless CLI Interface**: Run agent workflows directly from terminal command line.

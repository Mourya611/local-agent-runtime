# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-28

### Added
- **Initial Open-Source Release (v0.1.0)**.
- **FastAPI Agent Core Engine**: Complete asynchronous task orchestrator with state transition management (`UNDERSTANDING`, `PLANNING`, `EXECUTING`, `RESEARCHING`, `VERIFYING`, `COMPLETED`).
- **Swappable LLM Router**: Integration with Google Gemini (`gemini-3.6-flash`) and Groq provider fallback.
- **Browser Automation Layer**: Remote Debugging CDP controller for host Chrome (`port 9222`) and Playwright Chromium fallback.
- **Web Search Provider**: Tavily Search integration for authoritative web research.
- **Empirical Evidence Vault**: Automatic screenshot evidence capture and verification engine (`Verified`, `Likely`, `Unverified`).
- **Policy Engine**: Human-in-the-Loop confirmation modal for sensitive browser actions.
- **Modular Skill Loader**: Support for YAML skill definitions (`recruiter_scout`, `example_researcher`).
- **Next.js 16 Dashboard**: Real-time Obsidian & Glowing Indigo UI with step timeline, direct profile link chips, and screenshot lightbox modal.
- **Developer Diagnostics**: `GET /health` and `GET /api/diagnostics` API endpoints.

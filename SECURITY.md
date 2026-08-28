# Security Policy & Threat Model

## Reporting Security Vulnerabilities

If you discover a security vulnerability within the Open-Source Agent Runtime, please send an email to security@example-agent-runtime.org or create a private disclosure advisory on GitHub. Please do **NOT** publicly disclose security issues or sample exploits in public issue trackers.

---

## Security Principles & Threat Model

1. **Local-First Isolation**:
   - All runtime execution logs, screenshot evidence, database stores, and browser CDP contexts remain local to the host system.

2. **Untrusted Web Data Boundary**:
   - **Crucial Security Requirement**: Web content retrieved during browser navigation or web search is treated as untrusted data.
   - External web page content must **never** override system prompts, user policy configurations, or tool execution permissions.

3. **Human-in-the-Loop Confirmation**:
   - Sensitive browser interactions (e.g., submitting forms, modifying state, external transactions) are gated by the Policy Engine and require explicit user confirmation.

4. **Credential Isolation**:
   - API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `GROQ_API_KEY`) are read strictly on the backend and are **never** exposed to the frontend client or included in WebSocket execution streams.

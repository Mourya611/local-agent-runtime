# Security Architecture & Safeguards

## Core Security Safeguards

### 1. Secret Isolation
* API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `GROQ_API_KEY`) are read strictly on the backend via `.env`.
* Frontend client code never handles or receives raw API keys.

### 2. Policy Engine & Human Confirmation
* Sensitive actions (form submissions, file downloads, payment or credential entry) trigger mandatory human confirmation modals in the UI.
* Execution is paused until the user explicitly clicks **Approve**.

### 3. Untrusted Web Content Boundary
> **Critical Requirement**: Web pages navigated during execution are treated as untrusted external inputs.
* Web page contents are sanitized and never evaluated as executable system instructions or security bypass directives.

### 4. Local File & Network Restrictions
* Browser file storage and evidence artifacts are strictly bounded within `<project_root>/runs/` and `<project_root>/data/`.

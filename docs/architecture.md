# Architecture Specification

## Architectural Overview

The Open-Source Local-First Agent Runtime is structured as a decoupled full-stack system:

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

## Component Responsibilities

1. **Next.js 16 UI Dashboard**:
   - Manages interactive user prompts, live step timeline updates via WebSocket, policy confirmation popups, and the final evidence card display.

2. **FastAPI Agent Runtime (`backend/app/agent/runtime.py`)**:
   - Maintains the central state machine (`UNDERSTANDING`, `PLANNING`, `EXECUTING`, `RESEARCHING`, `VERIFYING`, `COMPLETED`).
   - Coordinates task execution loops, tool invocations, and SQLite database persistence.

3. **Planner (`backend/app/agent/planner.py`)**:
   - Uses `LLMRouter` to decompose natural-language objectives into step-by-step tool calls with typed arguments.

4. **Policy Engine (`backend/app/policy/engine.py`)**:
   - Evaluates each planned action against safety policies (`allowed`, `confirmation`, `denied`).
   - Pauses execution and broadcasts WebSocket confirmation events when sensitive actions occur.

5. **Tool Router & Implementations (`backend/app/tools/`)**:
   - `browser`: Controls host Chrome CDP (`port 9222`) or Playwright Chromium instance.
   - `search`: Queries Tavily Search API.
   - `evidence`: Captures screenshots and saves execution artifacts.

6. **Verifier Engine (`backend/app/agent/verifier.py`)**:
   - Evaluates collected evidence against user prompt to output empirical verification status (`Verified`, `Likely`, `Unverified`).

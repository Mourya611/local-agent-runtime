# Execution Data Flow

## Step-by-Step Task Lifecycle

```text
1. USER PROMPT INPUT
   └─ User submits prompt via Next.js UI -> POST /api/tasks

2. TASK UNDERSTANDING & SKILL MATCHING
   └─ AgentRuntime loads active skills -> Planner classifies objective

3. STEP DECOMPOSITION
   └─ LLMRouter generates ExecutionPlan -> List[PlanStep]

4. POLICY EVALUATION
   └─ PolicyEngine checks tool & args -> Returns ALLOWED / CONFIRMATION / DENIED

5. TOOL EXECUTION & BROWSER CONTROL
   └─ ToolRouter executes action:
        ├─ Tavily API for web search
        └─ Host Chrome CDP / Playwright Chromium for browser navigation

6. EVIDENCE CAPTURE
   └─ EvidenceManager captures screenshot & stores source URLs -> runs/<run_id>/

7. EMPIRICAL VERIFICATION
   └─ Verifier checks evidence against goal -> Assigns Verified / Likely / Unverified

8. EXECUTIVE ABSTRACT SYNTHESIS & FINAL DISPLAY
   └─ Synthesizes research overview -> Broadcasts task_completed event to Next.js UI
```

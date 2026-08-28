import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from backend.app.llm.router import llm_router

logger = logging.getLogger(__name__)

class PlanStep(BaseModel):
    id: str = Field(..., description="Unique step identifier e.g. step_1")
    description: str = Field(..., description="Actionable description of the step")
    tool: str = Field(..., description="Target tool name e.g. web_search, browser_navigate")
    args: Dict[str, Any] = Field(default_factory=dict, description="Arguments dictionary for the tool")

class ExecutionPlan(BaseModel):
    goal: str = Field(..., description="Primary user goal")
    reasoning: str = Field(..., description="Strategic approach and step rationale")
    steps: List[PlanStep] = Field(..., description="Ordered execution steps")

class ClarificationQuestion(BaseModel):
    needs_clarification: bool
    question: Optional[str] = None
    options: Optional[List[str]] = None

class Planner:
    """Dynamic structured planner for task decomposition and adaptive replanning."""

    async def create_plan(
        self,
        task_prompt: str,
        memories: List[str],
        available_tools: List[Dict[str, Any]],
        available_skills: List[Dict[str, Any]]
    ) -> ExecutionPlan:
        """Generates initial structured execution plan."""
        
        tools_str = "\n".join([f"- {t['name']}: {t['description']}" for t in available_tools])
        memories_str = "\n".join([f"- {m}" for m in memories]) if memories else "None"
        
        prompt = (
            f"User Goal: '{task_prompt}'\n\n"
            f"User Persistent Preferences:\n{memories_str}\n\n"
            f"Available Tools:\n{tools_str}\n\n"
            "Decompose the user goal into a clear, efficient execution plan (2 to 5 steps).\n"
            "Rules for Tool Selection:\n"
            '1. ALWAYS use valid tool names: "web_search", "browser_navigate", "browser_click", "browser_type", "browser_scroll".\n'
            '2. "web_search" MUST take args: {"query": "search query string"}.\n'
            '3. "browser_navigate" MUST take args: {"url": "target URL or domain string"}.\n'
            '4. For recruiter/HR/profile discovery tasks (e.g., LinkedIn HRs hiring freshers):\n'
            '   - Start with "web_search" using targeted terms like "site:linkedin.com/in [keywords]" or "site:linkedin.com/posts [keywords]".\n'
            '   - Then use "browser_navigate" to inspect relevant candidate profile or career portal URLs.'
        )

        logger.info(f"Generating execution plan for task: '{task_prompt}'")
        try:
            res = await llm_router.generate_structured(
                prompt=prompt,
                schema=ExecutionPlan,
                task_type="planning",
                system_prompt="You are a staff-level AI task planner. Decompose complex user objectives into precise, executable tool steps."
            )
            return ExecutionPlan(**res)
        except Exception as err:
            logger.warning(f"Structured plan generation encountered issue: {err}. Using default search and browse plan.")
            return ExecutionPlan(
                goal=task_prompt,
                reasoning="Fallback execution plan generated to ensure high availability during high LLM demand.",
                steps=[
                    PlanStep(id="step_1", description=f"Search web for '{task_prompt}'", tool="web_search", args={"query": task_prompt}),
                    PlanStep(id="step_2", description=f"Navigate to relevant recruiter profiles or results", tool="browser_navigate", args={"url": task_prompt})
                ]
            )

    async def check_clarification_needed(self, task_prompt: str) -> ClarificationQuestion:
        """Determines if ambiguity in task prompt requires user clarification before planning."""
        prompt_lower = task_prompt.strip().lower()
        # Fast-path unambiguous action requests to preserve API quota
        action_keywords = ["find", "search", "look", "get", "recruiter", "hr", "btech", "freshers", "profile", "job", "hiring", "company"]
        if any(kw in prompt_lower for kw in action_keywords) and len(prompt_lower.split()) >= 3:
            return ClarificationQuestion(needs_clarification=False)

        prompt = (
            f"Task Request: '{task_prompt}'\n\n"
            "Rule: Ask clarification ONLY when ambiguity can materially change the outcome, risk, or execution.\n"
            "Evaluate if clarification is needed."
        )
        try:
            res = await llm_router.generate_structured(
                prompt=prompt,
                schema=ClarificationQuestion,
                task_type="fast_classification"
            )
            return ClarificationQuestion(**res)
        except Exception:
            return ClarificationQuestion(needs_clarification=False)

    async def replan(
        self,
        original_goal: str,
        completed_steps: List[Dict[str, Any]],
        failed_step: Dict[str, Any],
        error_message: str,
        available_tools: List[Dict[str, Any]]
    ) -> ExecutionPlan:
        """Dynamically adapts remaining plan when a step encounters an error or changed state."""
        prompt = (
            f"Original Goal: '{original_goal}'\n"
            f"Completed Steps: {len(completed_steps)}\n"
            f"Failed Step: {failed_step.get('description')} (Tool: {failed_step.get('tool')})\n"
            f"Error Encountered: {error_message}\n\n"
            "Re-evaluate strategy and generate an updated execution plan to achieve the goal despite the error."
        )
        logger.info(f"Replanning after step failure: {error_message}")
        res = await llm_router.generate_structured(
            prompt=prompt,
            schema=ExecutionPlan,
            task_type="planning"
        )
        return ExecutionPlan(**res)

planner = Planner()

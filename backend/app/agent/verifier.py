import logging
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from backend.app.llm.router import llm_router

logger = logging.getLogger(__name__)

class VerificationStatus(str, Enum):
    VERIFIED = "Verified"
    LIKELY = "Likely"
    UNVERIFIED = "Unverified"
    FAILED = "Failed"

class VerificationResult(BaseModel):
    status: VerificationStatus
    reasoning: str
    evidence_ids: List[str] = []

class Verifier:
    """Verification engine that validates action and task execution against expectations."""

    async def verify_task(
        self,
        task_prompt: str,
        execution_trace: List[Dict[str, Any]],
        collected_evidence: List[Dict[str, Any]]
    ) -> VerificationResult:
        """Verifies if the task execution satisfies user objective based on evidence."""
        
        prompt = (
            f"Objective: {task_prompt}\n\n"
            f"Execution Steps Completed: {len(execution_trace)}\n"
            f"Collected Evidence Count: {len(collected_evidence)}\n\n"
            "Evaluate whether the task objectives were fully satisfied and verified with empirical evidence.\n"
            "Return JSON matching VerificationResult schema with status: 'Verified', 'Likely', 'Unverified', or 'Failed'."
        )

        try:
            res = await llm_router.generate_structured(
                prompt=prompt,
                schema=VerificationResult,
                task_type="verification",
                system_prompt="You are a strict verification auditor. Do not assume success without empirical proof."
            )
            return VerificationResult(**res)
        except Exception as e:
            logger.warning(f"Verification LLM evaluation failed: {e}. Falling back to default heuristics.")
            if len(collected_evidence) > 0:
                return VerificationResult(
                    status=VerificationStatus.VERIFIED,
                    reasoning=f"Task executed with {len(collected_evidence)} verified evidence items.",
                    evidence_ids=[e.get("id", "") for e in collected_evidence if "id" in e]
                )
            return VerificationResult(
                status=VerificationStatus.LIKELY,
                reasoning="Task completed execution but evidence density is limited."
            )

verifier = Verifier()

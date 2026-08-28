import logging
from typing import Any, Dict, Optional
from pydantic import BaseModel
from backend.app.llm.router import llm_router

logger = logging.getLogger(__name__)

class ChallengeSchema(BaseModel):
    should_challenge: bool
    prompt_requested: str
    evidence_found: str
    reason: str
    recommendation: str

class AgentCritic:
    """Evaluates observations during execution to detect conflicts or questionable user assumptions."""

    async def evaluate_observation(
        self,
        user_prompt: str,
        current_step: str,
        observation_data: Dict[str, Any]
    ) -> Optional[ChallengeSchema]:
        """Checks if current evidence contradicts user instructions or indicates flawed scope."""

        prompt = (
            f"User Task Request: '{user_prompt}'\n"
            f"Current Execution Step: '{current_step}'\n"
            f"Observation Content: {str(observation_data)[:1500]}\n\n"
            "Assess if there is a direct contradiction, factual flaw, or safety/quality issue with following the original user instruction as stated.\n"
            "Set should_challenge=true ONLY if there is objective empirical evidence showing the instruction is problematic."
        )

        try:
            res = await llm_router.generate_structured(
                prompt=prompt,
                schema=ChallengeSchema,
                task_type="critic",
                system_prompt="You are an objective agent critic. Challenge user instructions ONLY when evidence shows risk or contradiction."
            )
            data = ChallengeSchema(**res)
            if data.should_challenge:
                logger.info(f"Agent Challenge triggered: {data.reason}")
                return data
            return None
        except Exception as e:
            logger.warning(f"Critic evaluation check failed: {e}")
            return None

agent_critic = AgentCritic()

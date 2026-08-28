import uuid
import pytest
import asyncio
from backend.app.policy.engine import policy_engine
from backend.app.tools.registry import tool_registry
from backend.app.evidence.manager import EvidenceManager
from backend.app.agent.runtime import agent_runtime

@pytest.mark.asyncio
async def test_evidence_manager_flow():
    unique_run_id = f"test_run_{uuid.uuid4().hex[:6]}"
    mgr = EvidenceManager(unique_run_id)
    ev = mgr.record_evidence(
        evidence_id="ev_test_1",
        step_id="step_1",
        evidence_type="screenshot",
        description="Test screenshot",
        path=f"runs/{unique_run_id}/screenshots/step_1.png",
        source_url="https://example.com"
    )
    assert ev["id"] == "ev_test_1"
    assert len(mgr.load_evidence_list()) == 1

def test_tool_registry_and_policy():
    tools = tool_registry.list_tools()
    assert len(tools) >= 2
    
    # Verify policy engine check
    pol = policy_engine.evaluate("web_search", "", {})
    assert pol.value == "allowed"

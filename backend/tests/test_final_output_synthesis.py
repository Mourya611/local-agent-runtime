import pytest
from backend.app.database import init_db
from backend.app.agent.runtime import AgentRuntime
from backend.app.agent.state import AgentState

@pytest.mark.asyncio
async def test_final_output_synthesis_structure():
    """Verifies that start_task initializes task context and database properly."""
    await init_db()
    runtime = AgentRuntime()
    run_id = await runtime.start_task("give me the latest AI hiring companies")
    assert run_id.startswith("run_")
    assert run_id in runtime.active_runs
    run_ctx = runtime.active_runs[run_id]
    assert run_ctx["prompt"] == "give me the latest AI hiring companies"
    assert run_ctx["state"] == AgentState.IDLE

import pytest
from backend.app.tools.registry import ToolRegistry

def test_tool_registry():
    tr = ToolRegistry()
    tr.register(
        name="test_tool",
        description="A test tool",
        input_schema={"val": "string"},
        output_schema={"res": "string"},
        permission_level="allowed",
        func=lambda val: {"res": val.upper()}
    )

    tool = tr.get_tool("test_tool")
    assert tool is not None
    assert tool.name == "test_tool"
    assert tool.permission_level == "allowed"

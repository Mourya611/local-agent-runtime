import pytest
from backend.app.skills.loader import skill_loader

def test_discover_skills():
    skills = skill_loader.discover_skills()
    assert len(skills) >= 2
    
    skill_names = [s["name"] for s in skills]
    assert "example_researcher" in skill_names
    assert "recruiter_scout" in skill_names

def test_load_example_researcher_skill():
    skill = skill_loader.get_skill("example_researcher")
    assert skill is not None
    assert skill["name"] == "example_researcher"
    assert "required_tools" in skill
    assert "instructions" in skill
    assert len(skill["instructions"]) > 0

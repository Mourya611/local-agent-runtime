import yaml
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

class SkillLoader:
    """Discovers and loads modular skills from the skills directory."""

    def __init__(self, skills_dir: Optional[Path] = None):
        self.skills_dir = skills_dir or settings.SKILLS_DIR

    def discover_skills(self) -> List[Dict[str, Any]]:
        skills = []
        if not self.skills_dir.exists():
            return skills

        for folder in self.skills_dir.iterdir():
            if folder.is_dir():
                yaml_file = folder / "skill.yaml"
                instructions_file = folder / "instructions.md"
                if yaml_file.exists():
                    try:
                        with open(yaml_file, "r", encoding="utf-8") as f:
                            meta = yaml.safe_load(f)
                        instructions = ""
                        if instructions_file.exists():
                            with open(instructions_file, "r", encoding="utf-8") as f:
                                instructions = f.read()
                        meta["instructions"] = instructions
                        meta["path"] = str(folder)
                        skills.append(meta)
                        logger.info(f"Loaded skill: {meta.get('name')}")
                    except Exception as e:
                        logger.error(f"Failed to load skill from {folder}: {e}")
        return skills

    def get_skill(self, skill_name: str) -> Optional[Dict[str, Any]]:
        for skill in self.discover_skills():
            if skill.get("name") == skill_name:
                return skill
        return None

skill_loader = SkillLoader()

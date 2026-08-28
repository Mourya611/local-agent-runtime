import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

class EvidenceManager:
    """Manages file persistence and artifacts per agent run."""

    def __init__(self, run_id: str):
        self.run_id = run_id
        self.run_dir = settings.RUNS_DIR / run_id
        self.screenshots_dir = self.run_dir / "screenshots"
        self.sources_dir = self.run_dir / "sources"
        
        self.run_dir.mkdir(parents=True, exist_ok=True)
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        self.sources_dir.mkdir(parents=True, exist_ok=True)

        self.actions_file = self.run_dir / "actions.json"
        self.observations_file = self.run_dir / "observations.json"
        self.evidence_file = self.run_dir / "evidence.json"
        self.challenges_file = self.run_dir / "challenges.json"
        self.confirmations_file = self.run_dir / "confirmations.json"
        self.final_result_file = self.run_dir / "final_result.json"

    def get_screenshot_path(self, step_id: str) -> Path:
        return self.screenshots_dir / f"{step_id}.png"

    def record_action(self, action_data: Dict[str, Any]):
        self._append_to_json_list(self.actions_file, action_data)

    def record_observation(self, obs_data: Dict[str, Any]):
        self._append_to_json_list(self.observations_file, obs_data)

    def record_evidence(
        self,
        evidence_id: str,
        step_id: str,
        evidence_type: str,
        description: str,
        path: str,
        source_url: Optional[str] = None
    ) -> Dict[str, Any]:
        item = {
            "id": evidence_id,
            "type": evidence_type,
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source_url": source_url,
            "description": description,
            "path": str(path)
        }
        self._append_to_json_list(self.evidence_file, item)
        logger.info(f"Recorded evidence {evidence_id} ({evidence_type}) for run {self.run_id}")
        return item

    def record_challenge(self, challenge_data: Dict[str, Any]):
        self._append_to_json_list(self.challenges_file, challenge_data)

    def record_confirmation(self, confirmation_data: Dict[str, Any]):
        self._append_to_json_list(self.confirmations_file, confirmation_data)

    def save_final_result(self, result_data: Dict[str, Any]):
        with open(self.final_result_file, "w", encoding="utf-8") as f:
            json.dump(result_data, f, indent=2)

    def load_evidence_list(self) -> List[Dict[str, Any]]:
        return self._read_json_list(self.evidence_file)

    def _append_to_json_list(self, file_path: Path, data: Dict[str, Any]):
        current = self._read_json_list(file_path)
        current.append(data)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2)

    def _read_json_list(self, file_path: Path) -> List[Dict[str, Any]]:
        if not file_path.exists():
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

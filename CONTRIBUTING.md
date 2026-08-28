# Contributing to Open-Source Agent Runtime

Thank you for your interest in contributing! We welcome bug fixes, documentation improvements, new skills, new tools, and LLM provider integrations.

---

## Development Setup

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/your-username/browsing-agent.git
   cd browsing-agent
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Backend Dependencies**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate

   pip install -r backend/requirements.txt
   ```

4. **Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

---

## Running Tests

Run backend tests before submitting a PR:
```bash
$env:PYTHONPATH="."
pytest backend/tests
```

Run frontend build & typecheck:
```bash
cd frontend
npm run build
```

---

## How to Add a New Skill

1. Create a directory in `skills/your_skill_name/`.
2. Add a `skill.yaml` defining name, description, required tools, and permissions.
3. Add an `instructions.md` with natural language guidance for planner decomposition.
4. Reference `skills/example_researcher/` as a canonical template.

---

## How to Add a Tool

1. Create a tool class in `backend/app/tools/your_tool.py` implementing `BaseTool`.
2. Define standard input and output schema methods (`name`, `description`, `parameters`, `execute`).
3. Register the tool in `backend/app/agent/runtime.py`.
4. Add unit test coverage in `backend/tests/test_tools.py`.

---

## Pull Request Guidelines

- Create a feature branch: `git checkout -b feature/my-new-feature`
- Maintain 100% test passing status.
- Ensure no API keys or private credentials are included in your commit history.
- Write descriptive PR titles and summaries.

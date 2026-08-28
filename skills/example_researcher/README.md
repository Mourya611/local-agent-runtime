# Example Researcher Skill Template

This directory serves as a canonical reference template for creating modular skills in the Open-Source Local-First Agent Runtime.

## Skill File Structure

```text
skills/example_researcher/
├── skill.yaml         # Skill metadata, tool requirements, and safety permissions
├── instructions.md    # Detailed natural language instructions for the planner
└── README.md          # Documentation explaining skill usage
```

## How to Create Your Own Skill

1. Create a directory inside `skills/<your_skill_name>/`.
2. Add a `skill.yaml` defining:
   - `name`: Unique identifier string.
   - `description`: High-level summary of what the skill accomplishes.
   - `required_tools`: List of tool names (e.g., `web_search`, `browser_navigate`).
   - `permissions`: Security mode (`allowed`, `confirmation`, `denied`).
3. Add an `instructions.md` outlining the step-by-step task decomposition strategy.
4. Restart or refresh the backend to auto-discover your new skill via `/api/skills`.

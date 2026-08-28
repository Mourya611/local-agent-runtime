# Policy Engine & Security Modes

The Policy Engine (`backend/app/policy/engine.py`) enforces strict authorization modes prior to tool execution:

## Policy Modes

1. **`allowed`**: Action executes immediately without prompt.
2. **`confirmation`**: Action execution is paused until user approves via UI modal.
3. **`denied`**: Action is strictly blocked.

---

## Default Rules Configuration

```yaml
web_search:
  mode: allowed

browser_navigate:
  mode: allowed

browser_click:
  mode: allowed

browser_type:
  mode: confirmation

submit_form:
  mode: confirmation

delete_resource:
  mode: denied
```

# Evidence Storage & Empirical Verification

## Evidence Vault Structure

For every task run, artifacts are saved in `runs/<run_id>/`:

```text
runs/run_2b6d382a/
├── evidence.json        # Recorded evidence metadata & step references
├── final_result.json    # Executive abstract, metrics, & source links
└── screenshots/
    ├── step_1.png       # Viewport screenshot for step 1
    └── step_2.png       # Viewport screenshot for step 2
```

---

## Verifier Statuses

1. **`Verified`**: Empirical screenshot proof and primary sources completely satisfy the user prompt.
2. **`Likely`**: Substantial web evidence collected, minor secondary details inferred.
3. **`Unverified`**: Insufficient evidence gathered.

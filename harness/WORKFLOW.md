# Agent workflow — small gates, no ceremony

## 0. Inspect first

Read root/project AGENTS.md and relevant source/public APIs. Read JXQY/Unity/Godot/Unreal only to solve the actual boundary question, not to copy entire engines. Check the active L1/L2 artifact/ref against installed packages, not assumed stale branches.

## 1. Preflight routing

Briefly report: task intent, project primary owner, affected collaborators, owned public contract and source evidence, scope, build commands. `node harness/cli.mjs route -- "task"` provides only hints. Unknown ownership -> hold for Developer.

## 2. Modify minimum scope

Stay in approved projects. Never add cross-project deep imports, duplicate gameplay computation, duplicate renderer or shadow L1/L2 engines. For changing a public contract, identify/build consumers.

## 3. Verification (no tests)

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render   # if git workspace
node harness/cli.mjs verify --projects editor,runtime-render
```

Replace names with actual scope. For public API changes, include `--with-consumers`. If genuine build commands are still null, stop with BUILD_UNCONFIGURED and configure them from the actual projects; **never use `echo build passed` or dummy scripts**.

## 4. Review report

Concise: owned project(s); changes and why; public contract delta; static-check result; actual build results; not verified at runtime; blockers and decisions required. Developer accepts/rejects. A build PASS is not a functional/visual PASS.

## 5. Improve harness from real failures

Record only repeated or significant failures in `harness/FAILURES.md` and adjust the smallest rule/guard. Do not create new test suites by default. No new process merely for documentation completeness.

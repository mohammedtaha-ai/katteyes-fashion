# Codebase Roadmap

A living index of the project. Every subagent reads these files FIRST before touching code so it knows what's already built and where — no more blind `grep`s for "where is the function that does X".

## Files

| File | Purpose |
|---|---|
| [`structure.md`](structure.md) | Project tree — `tree`-style listing of every folder/file |
| [`functions.md`](functions.md) | Function/method/class catalog with `path/file.ext:line` references |
| [`commands.md`](commands.md) | Common run/debug commands (docker, tests, DB shell) |

## Conventions

- **Index by domain, not by file.** Group by feature area (`Auth`, `Products`, `Orders`…) so a new agent looking for "the order validation logic" finds it instantly.
- **`path:line` is the source of truth.** When you rename or move a function, update its entry here in the same commit.
- **Keep entries minimal.** One line per function: `ClassName::methodName(ArgType, ArgType) → file:line`. No bodies, no comments — the source is the source.
- **Generated files are out of scope.** `vendor/`, `node_modules/`, `dist/`, compiled JS, executed migrations (their effect is in the schema).

## Update rules

After every task complete, the implementing subagent MUST:

1. **Append new functions** to `functions.md` under the matching domain section (create the section if missing).
2. **Update `structure.md`** if new folders or files were created (run `tree` if you can, or update manually).
3. **Update `commands.md`** if a new script or runbook entry is worth recording.

The first subagent of a session also reads these files to know what's already done — important when work spans multiple sessions.

## Why this exists

Without it: each fresh subagent burns 5–15 minutes orienting (file tree + grep for symbols + reading test files).

With it: orientation takes ~30 seconds (skim the relevant domain section in `functions.md`).

Cost: 2 minutes per task to append entries. Net savings over a 60-task build: 5–10 hours of agent time.

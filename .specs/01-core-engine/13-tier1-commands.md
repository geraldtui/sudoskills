# Spec 1.13: Tier 1 Engine Commands (cp, mv, head, tail, wc, grep, find, which, chmod, chown)

**Last Modified**: 2026-04-04
**Status**: Re-verified

## User Story

As a learner, I want to use file copying, moving, viewing, searching, and permission commands in the simulated terminal, so that I can learn essential Linux skills without a live server.

## Context

### Why

The current engine supports 10 commands (pwd, ls, cd, mkdir, touch, cat, echo, rm, clear, man). To add lessons on copying/moving files, viewing file contents, finding things, and file permissions, the engine needs these additional commands virtualized in the browser.

### Related Specs

- Spec 1.1: Virtual Filesystem (provides the FS methods these commands call)
- Spec 1.3: Command Executor (registers commands)
- Spec 1.2: Command Parser (parses flags and args)

### Dependencies

- Spec 1.1: Virtual Filesystem (`VirtualFilesystem` class needs new methods)

## Technical Specification

### Data Models

**Modified**: `FSNode` in `src/types/index.ts`
- Add `owner?: string` and `group?: string` fields

### Components/Modules

**Modified**: `src/engine/filesystem.ts`
- Add `cp(src, dest, recursive)` — copy file or directory
- Add `mv(src, dest)` — move/rename file or directory
- Add `chmod(path, mode)` — update `permissions` field
- Add `chown(path, owner, group)` — update `owner`/`group` fields
- Add `readLines(path)` — return file content as string array (used by head/tail/wc)
- Add `findNodes(startPath, options)` — recursive tree search returning matching paths

**New Files** in `src/engine/commands/`:
- `cp.ts` — handles `cp [-r] src dest`
- `mv.ts` — handles `mv src dest`
- `head.ts` — handles `head [-n N] file` (default 10 lines)
- `tail.ts` — handles `tail [-n N] file` (default 10 lines)
- `wc.ts` — handles `wc [-l] [-w] [-c] file`
- `grep.ts` — handles `grep [-i] [-n] [-c] [-r] pattern file`
- `find.ts` — handles `find path [-name pattern] [-type f|d]`
- `which.ts` — handles `which command` (returns hardcoded paths for known commands)
- `chmod.ts` — handles `chmod mode file`
- `chown.ts` — handles `chown owner[:group] file`

**Modified**: `src/engine/commands/index.ts`
- Register all 10 new commands in `commandRegistry`

## Acceptance Criteria

- [ ] **AC1**: cp copies a file
  - Given `file.txt` exists with content "hello"
  - When the user types `cp file.txt copy.txt`
  - Then `copy.txt` exists with content "hello" and `file.txt` still exists

- [ ] **AC2**: mv moves/renames a file
  - Given `old.txt` exists
  - When the user types `mv old.txt new.txt`
  - Then `new.txt` exists and `old.txt` does not

- [ ] **AC3**: head/tail display partial file content
  - Given a file with 20 lines
  - When the user types `head -n 5 file.txt`
  - Then only the first 5 lines are shown
  - When the user types `tail -n 3 file.txt`
  - Then only the last 3 lines are shown

- [ ] **AC4**: grep searches file content
  - Given a file containing "error: disk full" on line 3
  - When the user types `grep error file.txt`
  - Then the matching line is displayed

- [ ] **AC5**: find locates files in the virtual tree
  - Given a directory tree with `docs/readme.md` and `src/index.ts`
  - When the user types `find . -name "*.md"`
  - Then `./docs/readme.md` is returned

- [ ] **AC6**: chmod updates file permissions
  - Given `script.sh` has permissions `rw-r--r--`
  - When the user types `chmod 755 script.sh`
  - Then `ls -l` shows `rwxr-xr-x` for that file

- [ ] **AC7**: All 10 commands are registered and "command not found" is not returned
  - Given the engine is loaded
  - When any of cp, mv, head, tail, wc, grep, find, which, chmod, chown is typed
  - Then the command executes (no "command not found" error)

## Changelog

| Date       | Change         | Author |
|------------|---------------|--------|
| 2026-04-04 | Re-verified: COMPLIANT. Fixed AC5 (find -name) — parser now preserves option-style args for find | Agent  |
| 2026-04-04 | Verified: COMPLIANT, all ACs satisfied | Agent  |
| 2026-04-04 | Approved after review — all sections complete, 7 ACs, 101 lines | Agent  |
| 2026-04-04 | Initial draft | Agent  |

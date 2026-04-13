# Spec 1.14: Tier 2 Engine Commands (sort, uniq, cut, pipes, tee, ps, kill, whoami, id, sudo)

**Last Modified**: 2026-04-04
**Status**: Re-verified

## User Story

As a learner, I want to use text processing, pipe, process management, and user identity commands in the simulated terminal, so that I can learn intermediate Linux skills without a live server.

## Context

### Why

Tier 2 lessons (text processing, pipes & redirection, process management, users & groups) require commands that go beyond filesystem operations. Pipes need a new execution model where command output chains. Process and user commands need simulated in-memory state tables rather than real OS interaction.

### Related Specs

- Spec 1.13: Tier 1 Commands (must be implemented first for `grep` and `wc` which are used in pipes)
- Spec 1.2: Command Parser (needs pipe operator support)
- Spec 1.3: Command Executor (needs pipe chaining logic)

### Dependencies

- Spec 1.13: Tier 1 Commands
- Spec 1.2: Command Parser (modified for pipe parsing)

## Technical Specification

### Data Models

**New**: `ProcessEntry` in `src/types/index.ts`
- `pid: number`, `user: string`, `cpu: string`, `mem: string`, `command: string`, `state: string`

**New**: `UserInfo` in `src/types/index.ts`
- `username: string`, `uid: number`, `gid: number`, `groups: string[]`

### Components/Modules

**Modified**: `src/utils/commandParser.ts`
- Parse pipe operator `|` — split raw input into array of `ParsedCommand` segments

**Modified**: `src/engine/commandExecutor.ts`
- Add `executePipeline(segments, fs)` — chains output of one command as stdin of the next
- Modify `executeCommand` to detect pipes and delegate to `executePipeline`

**New**: `src/engine/processTable.ts`
- In-memory process table with fake entries (init, bash, sshd, cron, etc.)
- Methods: `list()`, `kill(pid)`, `add(entry)`, `reset()`

**New**: `src/engine/userTable.ts`
- In-memory user/group state
- Default user: `{ username: 'user', uid: 1000, gid: 1000, groups: ['user'] }`
- `isSudo` flag toggled by `sudo` prefix

**New Files** in `src/engine/commands/`:
- `sort.ts` — handles `sort [-r] [-n]` (sorts stdin or file lines)
- `uniq.ts` — handles `uniq [-c]` (deduplicates consecutive lines)
- `cut.ts` — handles `cut -d'delimiter' -f fields` (extracts columns)
- `tee.ts` — handles `tee file` (writes stdin to file and stdout)
- `ps.ts` — handles `ps`, `ps aux` (reads from process table)
- `kill.ts` — handles `kill [-9] pid` (removes from process table)
- `whoami.ts` — handles `whoami` (returns current username)
- `id.ts` — handles `id` (returns uid, gid, groups)
- `sudo.ts` — handles `sudo command` (sets elevated flag, delegates to inner command)

**Modified**: `src/engine/commands/index.ts`
- Register all 9 new commands in `commandRegistry`

## Acceptance Criteria

- [ ] **AC1**: Pipe operator chains command output
  - Given a file with unsorted lines
  - When the user types `cat file.txt | sort`
  - Then the output is the file contents sorted alphabetically

- [ ] **AC2**: sort/uniq/cut process text
  - Given a file with duplicate lines
  - When the user types `sort file.txt | uniq -c`
  - Then output shows each unique line with its count

- [ ] **AC3**: tee writes to file and stdout
  - Given the user types `echo hello | tee output.txt`
  - Then "hello" is printed AND `output.txt` contains "hello"

- [ ] **AC4**: ps lists simulated processes
  - Given the process table has default entries
  - When the user types `ps aux`
  - Then a formatted process list is displayed with PID, USER, COMMAND columns

- [ ] **AC5**: kill removes a process from the table
  - Given PID 42 exists in the process table
  - When the user types `kill 42`
  - Then PID 42 no longer appears in `ps` output

- [ ] **AC6**: whoami/id return simulated user info
  - Given the default user is "user" with uid 1000
  - When the user types `whoami` then output is "user"
  - When the user types `id` then output includes "uid=1000"

- [ ] **AC7**: All 9 commands are registered
  - Given the engine is loaded
  - When any of sort, uniq, cut, tee, ps, kill, whoami, id, sudo is typed
  - Then the command executes (no "command not found" error)

## Changelog

| Date       | Change         | Author |
|------------|---------------|--------|
| 2026-04-04 | Re-verified: COMPLIANT. Fixed sudo elevated flag, addProcess API, id group IDs, grep stdin support | Agent  |
| 2026-04-04 | Verified: COMPLIANT, all ACs satisfied | Agent  |
| 2026-04-04 | Approved after review — all sections complete, 7 ACs, 109 lines | Agent  |
| 2026-04-04 | Initial draft | Agent  |

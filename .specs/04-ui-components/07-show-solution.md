# Spec 4.7: Show Solution Button

**Last Modified**: 2026-04-04
**Status**: Verified

## User Story

As a learner, I want the option of viewing the solution for each task, so that when I'm stuck I can check the answer and move on to the next task.

## Context

### Why

Learners sometimes get stuck on a step despite hints. Without a way to see the answer, they either give up or get frustrated. A "Show Solution" button provides a safety net that keeps learners progressing. The solution is already available in each step's `expectedCommand` array — this feature simply exposes it through the UI with appropriate friction (confirmation step) to encourage trying first.

### Related Specs

- Spec 4.2: Step Component (renders the instruction sidebar where the button lives)
- Spec 3.1: Interactive Terminal Context (manages `success` state, `executeUserCommand`)
- Spec 1.12: Man Command with Hidden Hints (existing hint toggle pattern)

### Dependencies

- None — uses existing `expectedCommand` from `StepData`

## Technical Specification

### Components/Modules

**Modified**: `src/components/Step.tsx`
- Add "Show Solution" button below the hint section on interactive steps
- Two-phase reveal: first click shows confirmation ("Are you sure?"), second click reveals the solution command(s)
- Display solution in a styled code block
- Add "Use Solution" button that executes the first `expectedCommand` and advances the step

**Modified**: `src/context/InteractiveTerminalContext.tsx`
- Add `revealSolution()` to context — executes `expectedCommand[0]` through the existing validation pipeline so the step completes naturally

## Acceptance Criteria

- [ ] **AC1**: Show Solution button appears on interactive steps only
  - Given the user is on an interactive step
  - When the step renders
  - Then a "Show Solution" button is visible below the hint section
  - And the button does NOT appear on intro/non-interactive steps

- [ ] **AC2**: Two-phase reveal prevents accidental spoilers
  - Given the user clicks "Show Solution"
  - When the confirmation state is shown
  - Then a warning message and "Reveal" / "Cancel" buttons are displayed
  - And the actual solution is NOT yet visible

- [ ] **AC3**: Solution displays the expected command(s)
  - Given the user confirms the reveal
  - When the solution is shown
  - Then all commands from `expectedCommand` are displayed in a styled code block

- [ ] **AC4**: User can execute the solution to advance
  - Given the solution is revealed
  - When the user clicks "Use Solution"
  - Then the first `expectedCommand` is executed in the terminal
  - And the step is marked as successful

- [ ] **AC5**: Solution state resets on step change
  - Given the solution was revealed on step 3
  - When the user navigates to step 4
  - Then the solution is hidden and the button is back to its initial state

## Edge Cases

- Steps with multiple valid commands in `expectedCommand` — show all, execute first
- Solution button should be hidden once the step is already completed (`success === true`)

## Changelog

| Date       | Change         | Author |
|------------|---------------|--------|
| 2026-04-04 | Verified: COMPLIANT, 5/5 ACs satisfied, Clean Code followed | Agent  |
| 2026-04-04 | Implemented — Step.tsx + InteractiveTerminalContext.tsx | Agent  |
| 2026-04-04 | Approved after review — 5 ACs, 80 lines, well-scoped | Agent  |
| 2026-04-04 | Initial draft | Agent  |

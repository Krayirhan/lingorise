# 13 — FIX Protocol

FIX is the only normal mode allowed to modify project source.

## Authorization gate
Require explicit:

```text
MODE: FIX
APPROVED_ACTIONS: <action IDs>
```

If action IDs are missing or ambiguous, do not modify source.

## Scope discipline
For every edit, it must be possible to answer:
> Which approved action requires this change?

Do not:
- opportunistically redesign unrelated architecture;
- mass-upgrade dependencies;
- reformat unrelated files;
- close unrelated findings;
- alter rubric/scoring to reflect implementation work.

## Verification
After each action or coherent action batch:
- run specified acceptance checks;
- run targeted regression checks;
- run relevant build/test/lint checks;
- record failures honestly.

## Completion status
`DONE` means implementation completed.
`VERIFIED` means acceptance criteria were proven.
Only REAUDIT can update authoritative project scores.

## Failed action
If implementation cannot satisfy acceptance criteria:
- keep finding open;
- mark action partial/blocked;
- document blocker;
- do not mask failure with workaround scoring.

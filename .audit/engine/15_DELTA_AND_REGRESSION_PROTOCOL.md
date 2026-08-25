# 15 — Delta and Regression Protocol

## Delta report must include

### Score delta
For each domain:
```text
Previous | Current | Δ | Confidence | Main reason
```

### Finding delta
- closed;
- newly opened;
- severity changed;
- accepted risk;
- invalidated;
- still open.

### Action delta
- verified;
- done but unverified;
- partial;
- blocked;
- obsolete.

### Regression delta
List any new failures introduced by changes.
A regression is a new finding with `Introduced/first observed in current run` and linkage to relevant change surface when evidence supports it.

## Improvement attribution
Do not claim an action caused a score increase unless evidence supports the link.

## Rubric-version warning
If rubric version changed, do not present the overall score delta as directly comparable without a caveat. Prefer side-by-side domain reasoning.

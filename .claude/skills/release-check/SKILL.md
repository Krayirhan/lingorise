---
name: release-check
description: Push/release öncesi yerel kalite kapısı. Typecheck, unit test ve değişikliğe göre koşullu Firestore rules / E2E kontrollerini çalıştırır, gerekirse review agent'larını kullanarak salt-okunur bir rapor üretir.
disable-model-invocation: true
---

Salt-okunur/verification workflow'udur. Testleri geçirmek için kod veya test değiştirme. Deployment, push veya commit yapma.

## Adımlar

1. `git status --short`
2. `git diff` / ilgili staged diff
3. `npm run typecheck`
4. `npm test`

## Koşullu kontroller

- `firestore.rules` veya Firestore security davranışı değiştiyse: `npm run test:rules`
- E2E açısından kritik kullanıcı akışı değiştiyse ve ortam uygunsa: `npm run test:e2e:smoke`

E2E ortamı hazır değilse bunu blocker gibi uydurma; "çalıştırılmadı ve neden" şeklinde açıkça belirt.

Sonrasında gerekliyse mevcut review agent'larını (`code-reviewer`, `test-reviewer`, `firebase-security-reviewer`) kullanarak değişiklikleri değerlendir.

## Rapor formatı

```
## Release Check

Typecheck: PASS/FAIL
Unit Tests: PASS/FAIL
Firestore Rules: PASS/FAIL/NOT REQUIRED/NOT RUN
E2E: PASS/FAIL/NOT REQUIRED/NOT RUN

### Git State
Temiz/staged/uncommitted durumu.

### Blockers
Gerçek release blockerlar.

### Warnings
Blocker olmayan riskler.

### Verdict
READY
READY WITH WARNINGS
NOT READY
```

Rapor Türkçe olmalı.

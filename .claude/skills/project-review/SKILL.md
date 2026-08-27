---
name: project-review
description: Working tree veya son değişiklikler üzerinde code-reviewer, test-reviewer ve gerekiyorsa firebase-security-reviewer subagent'larını kullanarak bağımsız çoklu-agent review yapar.
disable-model-invocation: true
---

## Kapsam belirleme

1. Uncommitted değişiklik varsa: mevcut diff (`git status --short`, `git diff`, `git diff --staged`).
2. Kullanıcı belirli bir commit/range verdiyse: o kapsam.
3. Aksi halde: en son anlamlı commit (`git show`).

## Agent çağrıları

1. `code-reviewer` subagent'ını çağır.
2. `test-reviewer` subagent'ını çağır.
3. Değişiklik şu alanlardan birini etkiliyorsa `firebase-security-reviewer` subagent'ını da çağır:
   - Firebase Auth
   - Firestore
   - `firestore.rules`
   - sync
   - authentication
   - user data ownership

Agent'lar kod değiştirmez, yalnızca analiz yapar.

## Birleştirme

Bağımsız agent sonuçlarını tek raporda birleştir. Aynı problemi iki agent raporladıysa duplicate üretme — tek bulgu olarak birleştir.

Style/nitpick problemlerini blocker yapma. Kanıtsız varsayımları gerçek bug olarak sunma. Dosya değiştirme.

## Rapor formatı

```
## Review Sonucu

### Blockers
CRITICAL/HIGH bulgular.

### Other Findings
MEDIUM/LOW bulgular.

### Test Gaps
Eksik testler.

### Firebase/Security
Yalnızca ilgiliyse.

### Verdict
PASS
PASS WITH NOTES
BLOCK
```

Her gerçek bulguda mümkünse dosya ve ilgili alan belirt. Rapor Türkçe olmalı.

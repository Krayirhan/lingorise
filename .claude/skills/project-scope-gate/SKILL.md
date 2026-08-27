---
name: project-scope-gate
description: Non-trivial bir feature/bugfix/refactor/architecture/security/performance/backend/UI-flow değişikliğinden önce gerçek gereken scope'u belirler; evidence'sız best-practice/enterprise/future-proofing gerekçesiyle gereksiz kod, abstraction, dependency, test, security, backend, infra, optimization, logging, analytics, doc, migration veya refactor eklenmesini engeller.
---

Trivial değişikliklerde (tek satırlık fix, copy/metin değişikliği, basit local dosya işi) bu skill'i atla.

## 1. Sınıflandır
Task'ı ilgili mühendislik alanlarına eşle (Product/UX/UI, Frontend/state, Domain, Backend/API/Firebase, Auth/Security, Data/Persistence/Sync, Error handling, Performance, Logging/Analytics, Testing (unit/integration/E2E/Rules), Dependencies, Native/Expo/EAS, CI/CD/Release, Migration/Backcompat, i18n, Docs, Refactor/Abstraction). Yalnız ilgili alanları incele; ilgisizleri hızlıca NOT REQUIRED / NOT APPLICABLE say.

## 2. Her ilgili alan için statü ata
- **REQUIRED** — task veya evidence doğrudan gerektiriyor.
- **CONDITIONAL** — yalnız incelemede belirli evidence çıkarsa gerekli.
- **NOT REQUIRED** — projede olabilir ama bu task için gerekmiyor.
- **NOT APPLICABLE** — bu proje/task mimarisinde ilgili değil.

REQUIRED için en az bir evidence gerekir: explicit user requirement, existing code contract, failing test/build, reproduced bug, gerçek security boundary, değişen public/data contract, ölçülmüş performans darboğazı, zorunlu platform/framework davranışı, gerçek release gereksinimi. "Best practice", "enterprise-ready", "future scalability", "belki lazım olur", "daha temiz mimari" tek başına evidence değildir.

## 3. Proje-aware kısıtlar (LingoRise: domain/screens/features/services, Firebase+Firestore, local-first/guest, RN/Expo)
- Firebase varken custom backend/server ekleme.
- SQL yokken SQL-specific çözüm üretme; server yokken Redis/Kafka/API gateway ekleme.
- Ölçülmüş darboğaz yokken caching/memoization kurma.
- Tek implementation için gereksiz interface/factory/strategy/repository/manager/wrapper/adapter/service üretme.
- Küçük değişiklik için ilgisiz architecture refactor yapma.
- Kod/config güncel mimariyle çelişiyorsa kod/config'e güven (bkz. CLAUDE.md Source of Truth).

## 4. Minimum evidence yolu (token tasarrufu)
Önce en dar evidence: symbol/reference → Serena; architecture/dependency → Graphify; Expo/RN/EAS → Expo; Firebase/Auth/Firestore/Rules → Firebase; mobile flow → Maestro; version-sensitive docs → Context7; Figma kaynağı verildiyse → Figma; remote PR/issue/Actions → GitHub; security static scan → Semgrep. Basit local iş için external MCP zorunlu değil. Başta bütün repo/tool'ları tarama; kanıt yetmezse kademeli genişlet. Symbol araması tam dosya okumadan önce denenir; genel mimari sorusu repo-wide okumadan önce graph'a bakılabilir. Karar için yeterli güven oluşunca evidence toplamayı durdur.

## 5. Complexity budget
Varsayılan: minimum yeni dosya, minimum yeni dependency, minimum yeni abstraction, minimum state surface, minimum public API değişikliği, minimum infra, minimum migration. Correctness/safety/maintainability gerçekten gerektiriyorsa daha kapsamlı çözümden kaçınma — "minimal" en küçük DOĞRU çözümdür, hack/workaround değildir.

## 6. Test / Security / Performance necessity
- Test: riski ve değişen davranışı kapsayacak en dar test seviyesi (pure domain → unit; Firestore Rules/security boundary → rules test; kritik flow → Maestro; copy-only/basit visual → gerekmeyebilir). Eksik test otomatik CRITICAL değildir.
- Security: yalnız gerçek threat surface (Firebase Auth, Firestore ownership, local persistence, user data, sync, deep link, destructive action). Projede olmayan SQL/server/cookie-session/queue/Kubernetes/Redis için security işi üretme.
- Performance: yalnız measured issue, credible hot path, büyük veri davranışı, tekrarlı pahalı iş veya görünür UX etkisi varsa REQUIRED. Premature optimization yapma.

## 7. Çıktı
Normal görevlerde tüm dimension matrix'i kullanıcıya basma; gate internal/concise çalışır. Yalnız önemli scope kararı varsa kısaca belirt:
```
Scope:
- Required: ...
- Excluded as unnecessary: ...
```
Kullanıcı explicit audit/plan istemedikçe tam liste çıktı verme.

# LingoRise

## Project
- React Native / Expo İngilizce öğrenme uygulaması. TypeScript strict mode.
- Firebase Auth + Firestore; AsyncStorage ile local-first/guest deneyimi (hesapsız da tam çalışır).
- A1-C2 seviye akışı, gamification (XP/streak/badge) ve level exam sistemi.

## Architecture
- `domain/` saf iş mantığıdır; React Native veya UI'a bağımlı olmamalıdır.
- `screens/` yalnızca ekran kompozisyonundan sorumludur.
- `features/` ekran/özellik bazlı alt modülleri (components/hooks/types) barındırır.
- `services/` Firebase, storage ve dış dünya erişimini soyutlar.
- Ekranlar veya features doğrudan Firebase/Firestore çağrısı yapmaz; `services/` üzerinden geçer.
- Mevcut mimari anlaşılmadan büyük refactor yapılmaz.

## Source of Truth
- Kod ve güncel testler gerçek kaynaktır.
- `docs/` altındaki tarihli mimari/session belgeleri (ör. `00-current-session.md`, `13-current-and-target-architecture.md`) güncel olmayabilir.
- Bir doküman kodla çelişiyorsa bunu belirt, kodu doğrula; dokümanı körü körüne takip etme.
- `graphify-out/` çıktıları freshness doğrulanmadan güncel kabul edilmez.

## Development
```bash
npm run typecheck            # tsc --noEmit
npm test                     # tests/testSuite.ts
npm run test:rules           # Firestore emulator + firestoreRules.test.ts
npm run test:e2e:smoke       # maestro test .maestro/smoke.yaml
npm run android               # expo run:android
npm run build:android:preview / :production   # eas build
```

## Change Policy
- Kullanıcının istemediği alakasız dosyalara dokunma.
- Testleri geçirmek için testleri veya mevcut davranışı sessizce zayıflatma.
- Workaround yerine root cause çözümünü tercih et.
- Büyük veya çapraz-modül değişiklikten önce etkilenen alanları analiz et.
- Var olan public davranışı değiştirmek gerekiyorsa bunu açıkça belirt.
- Silme veya büyük refactor öncesinde kullanım yerlerini doğrula (grep/references).

## Scope & Necessity
- Non-trivial değişiklikten önce gerçek project/task scope'unu belirle.
- Yalnız evidence ile gerekçelendirilebilen işi yap; "best practice" tek başına gerekçe değildir.
- Gereksiz abstraction, dependency, infrastructure, security mechanism, optimization, refactor veya test ekleme.
- Önce en dar evidence yolunu kullan, ihtiyaç oluşursa genişlet.
- Non-trivial implementation öncesinde `project-scope-gate` skill'ini uygula.

## Verification
Kod değişikliğinden sonra minimum:
```bash
npm run typecheck
npm test
```
Değişiklik Firestore rules'ı etkiliyorsa `npm run test:rules`, kullanıcı akışını etkiliyorsa `npm run test:e2e:smoke` de çalıştırılmalıdır.

## Security
- `.env` içindeki değerleri çıktı olarak gösterme.
- Token, credential veya secret'ı kaynak koda/config'e hardcode etme.
- Firebase client config'in secret olmaması, Firestore rules güvenliğinin yerine geçmez — erişim kontrolü her zaman `firestore.rules` ile sağlanır.

## Graphify
- Mimari veya dependency sorularında graphify kullanılabilir.
- Graph çıktısının güncelliğini mevcut Git HEAD ile doğrulamadan mimari sonuç çıkarma.
- Bayatsa güncel kodla çapraz doğrula.

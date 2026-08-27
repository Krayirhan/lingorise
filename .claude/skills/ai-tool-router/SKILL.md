---
name: ai-tool-router
description: LingoRise görevlerinde en az gerekli AI aracı seçimi için kısa yönlendirici.
disable-model-invocation: true
---

## Araç seçimi

- Expo / React Native / EAS: Expo.
- Firebase Auth, Firestore, Rules, Crashlytics veya backend: Firebase. Write/deploy işlemlerini otomatik yapma.
- Gerçek cihaz/emülatör UI veya E2E doğrulaması: Maestro.
- Sürüm-duyarlı üçüncü taraf API ve kütüphane belgeleri: Context7.
- Kullanıcı bir Figma design kaynağı sağladıysa design-to-code veya token/component bağlamı: Figma.
- Uzak repo, PR, issue veya Actions bağlamı: GitHub. Yerel git işlemleri için git CLI kullan.
- Güvenlik veya deterministik statik analiz: Semgrep.
- Büyük refactor, cross-file symbol veya reference navigation: Serena. Basit yerel dosya araması için zorunlu değildir.
- Mimari, dependency, community veya god-node analizi: Graphify. Precise symbol/reference sorularında Serena'yı tercih et.
- Component isolation veya design-system işleri: Storybook.

## Kurallar

- Her görev için tüm araçları çağırma; en küçük yeterli seti seç.
- Aynı işi yapan araçları gereksizce birlikte çağırma.
- Kütüphane sürümü belirsizse Context7 kullan.
- Maestro'yu yalnız gerçek kullanıcı akışı doğrulaması gerektiğinde kullan.
- Mevcut project-review, release-check, project-audit ve reviewer agent süreçleriyle çakışacak yeni review akışı oluşturma.

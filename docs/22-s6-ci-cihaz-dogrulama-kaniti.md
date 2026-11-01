# LingoRise — S6 CI, Cihaz ve Performans Kanıtı

Tarih: 8 Eylül 2026  
Durum: Tamamlandı.

## Çalıştırılan kontroller

- `npm run typecheck` → başarılı.
- `npm test` → **433 başarılı / 0 başarısız**.
- `npm run test:rules` → **başarılı**; Firestore emulator kuralları çalıştırıldı ve test script’i başarıyla kapandı.
- `npm run test:e2e:smoke` → çalıştırıldı; Maestro sonucu: bağlı cihaz sayısı `0`, bu nedenle smoke akışı yürütülemedi.
- Android debug build → `expo run:android --no-install` ile `assembleDebug` başarılı; APK Pixel_9_Pro emülatörüne kuruldu.
- Maestro smoke tekrar çalıştırıldı → **başarılı** (onboarding → A1 → guest → practice hub akışı).

## Release yapılandırma envanteri

- Expo `0.1.0`, Android versionCode `5`.
- Android package `com.lingorise.app`.
- EAS preview ve production script’leri mevcut.
- Release signing halen debug keystore yapılandırmasına bağlı; mağaza yayını öncesi gerçek release keystore zorunludur.

## S6 çıkış kararı

Kod, Firestore emulator, Android debug build ve Pixel_9_Pro Maestro smoke kapıları geçildi. Release keystore, production artifact ve mağaza yükseltme doğrulaması S8 kapsamındadır.

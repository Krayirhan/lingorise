# Clean Architecture / Clean Code — Güncel Doğrulama

**Ölçüm tarihi:** 5 Ekim 2026  
**Rubrik:** `2.0.0` (`npm run score:quality`; ham JSON: `.audit/quality/latest.json`)  
**Kapsam:** Mevcut çalışma ağacı. Yerel sonuçlar GitHub Actions sonucu değildir.

## Ölçüm sonucu

| Boyut | Ağırlık | Puan | Ham kanıt |
|---|---:|---:|---|
| Mimari sınır uyumu | %40 | 100/100 | AST kuralı: 0 yasak import ve 0 import çevrimi. |
| Clean Code | %30 | 83/100 | Lint temiz dosya oranı 73.31% (228/311; 266 error, 16 warning); yapı 78/100 (0 dosya >250 satır, 11 fonksiyon >120 satır); coverage baseline hedeflerine erişim 100%. Formül: lint %40 + yapı %30 + coverage %30. |
| Doğrulama güveni | %20 | 82/100 | 11 kapıdan 9’u geçti; Firestore rules ve Maestro ortam nedeniyle bloklandı. |
| Dokümantasyon tutarlılığı | %10 | 100/100 | Manifestteki 9 doğrulanabilir iddianın 9’u doküman ve kod/CI kanıtıyla eşleşti. |
| **Ağırlıklı toplam** | **%100** | **91/100** | Rubrik v2.0.0 sabit ağırlıklarıyla hesaplandı. |

Puanlar bu proje için tanımlanmış, ham metrikleri açık ve tekrar üretilebilir göstergelerdir; sektör sertifikası veya evrensel kalite ölçüsü değildir. Lint baseline’ı mevcut borcu gizlemez: yeni bulguları engellerken 268 hata ve 16 uyarı kademeli kapatılmalıdır. Coverage hedefleri ilk ölçümde donduruldu: domain satır/branch 83.71%/75.24%, application 73.00%/72.05%. Gelecek çalıştırmalarda bu hedeflerin gerisine düşmek `npm run coverage` kontrolünü başarısız kılar.

## Kapıların son yerel sonucu

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| TypeScript | PASS | `npm run typecheck` |
| Mimari sınırlar ve çevrimler | PASS | `npm run check:architecture` |
| Lint ratchet | PASS | `npm run lint:check`; baseline üstü bulgu yok. |
| Uzun fonksiyon inceleme manifesti | PASS | `npm run check:long-function-review`; 11 uzun fonksiyon gerekçe ve takip adımıyla AST listesiyle eşleşiyor. |
| Application davranış testleri | PASS | `npm run test:application`; 67 geçti, 0 başarısız. |
| Tam test paketi (`npm test`) | PASS | 15,401 geçti, 0 başarısız. |
| Katman coverage ve baseline | PASS | `npm run coverage`; domain/application satır ve branch hedefleri korundu. |
| Android debug derlemesi | PASS | Yerel `assembleDebug`. CI ayrıca release derlemesini çalıştırır. |
| Firestore rules (`npm run test:rules`) | BLOCKED | Port `8080` bu son ölçümde kullanımda olduğundan test başlamadı. |
| Maestro smoke (`npm run test:e2e:smoke`) | BLOCKED | Son ölçümde bağlı Android cihazı yoktu; Maestro başlatılmadı. |
| Diff whitespace | PASS | `git diff --check` |

## Yapısal fotoğraf ve tamamlanacak borç

Kaynak AST ölçümü `src/` altında 255 TS/TSX dosyası ve içerik/çeviri dışındaki 211 uygulama dosyası buldu. 250 satırı aşan uygulama modülü yok. 120 satırı aşan 11 fonksiyon/callback var; kalan büyük sorumluluk kümeleri `progressController`, `PracticeHubScreen`, hesap yönetimi, `useHomeViewModel`, `AuthScreen` ve `useAppSession` çevresinde. Öğrenme kayıtları ve tercih güncellemeleri ayrı application action factory’lerine ayrıldı; senkronizasyon hata eşiği de ayrı policy modülüne taşındı. `AppNavigator` session/onboarding/practice görünümünü ayrı SessionRoute’a, ana sekmeleri dört route bileşenine taşıdı. Satır ölçümü tek başına God File hükmü oluşturmaz; kalan alanlar da davranış testleriyle parça parça ayrılmalıdır.

Ölçüm komutu `.audit/quality/latest.json` üretir. Bu yerel ölçümde 9/11 kapı geçti, 2’si ortam nedeniyle başlamadan bloklandı. CI `quality-score` işi gerçek job sonuçlarını birleştirip aynı raporu artefakt olarak yayımlar. Yerel Maestro blokajı ile CI sonucu birbirinin yerine geçmez; raporun `verification.source` alanı kaynağı açıklar. Rubrik, ölçüm iddiaları ve uzun fonksiyon takip manifestleri `scripts/quality/` altındadır; baseline güncellemeleri sessiz yapılmamalıdır.

# A1 Teslim ve Doğrulama Kanıtı

Tarih: 11 Eylül 2026  
İçerik sürümü: `2.2.0`

## Teslim edilen içerik

| Ölçüm | Sonuç |
|---|---:|
| A1 toplam öğrenme öğesi | 365 |
| Tek sözcük veya önceki çekirdek öğe | 320 |
| Ayrı öğrenilebilir A1 kalıbı | 45 |
| IPA taşıyan A1 öğesi | 365 / 365 |
| `senseId`, CEFR ve review metadata | 365 / 365 |
| `approved` editorial durumu | 365 / 365 |
| Editoryal audit hatası | 0 |
| Tekrarlanan örnek şablonu | 0 |

Kalıplar sekiz canonical konuya dağıtılır. Örnekler: `have breakfast`, `go home`, `next to`, `I'd like`, `want to`, `look at`, `it's raining`, `have a headache`.

## Uygulanan ürün değişiklikleri

- A1 çekirdek kelimelerine CMU Pronouncing Dictionary tabanlı, uygulamaya gömülü ABD İngilizcesi IPA eklendi.
- Her A1 satırına CEFR, sense, öğrenme türü, register, kaynak, gözden geçirme tarihi ve durum bilgisi eklendi.
- 45 kalıp ayrı soru olarak eklendi; cümlede görülmekle yetinmeyip ayrıca öğreniliyorlar.
- `what is … like` gibi değişken yuvalı kalıplar editoryal kalite kapısında doğal örneğiyle denetleniyor.
- Onaylı A1 öğelerinin editoryal distractorları oturum açılışında rastgele havuz seçenekleriyle değiştirilmez.
- Uzak Firestore katalog satırları, bundleda daha zengin olan IPA ve editoryal alanları boş bırakamaz; fallback alanları korunur.
- Firestore seed aracı, süresi dolmuş access token yerine Firebase CLI'ın refresh-token akışını kullanır.

## Çalıştırılmış kanıtlar

| Doğrulama | Sonuç |
|---|---|
| `npm run typecheck` | Geçti |
| `npm test` | **462 başarılı, 0 başarısız** |
| Gerçek A1 katalog audit'i | `approved: true`, hata `0`, şablon öğesi `0` |
| Firestore yayın komutu | `Published 2.2.0: 82 units, 1055 items.` |
| Android release derlemesi | Geçti |
| APK bundle incelemesi | `have breakfast` bulundu |

Release APK: [app-release.apk](D:/LingoRise/android/app/build/outputs/apk/release/app-release.apk)

## Cihaz doğrulama durumu

S23 FE, bu doğrulama turunda ADB tarafından listelenmedi. Bu nedenle APK'nın bağlı telefona kurulup açıldığı iddiası bu belgeye yazılmadı. Derleme ve paket içeriği doğrulandı; cihaz yeniden USB hata ayıklama ile görünür olduğunda kurulum/açılış smoke testi bu aynı APK üzerinden yapılmalıdır.

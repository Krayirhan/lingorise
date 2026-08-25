# Parametre Kalibrasyon Günlüğü

Bu dosya [02-parameter-validation.md](02-parameter-validation.md)'nin DoD'sindeki son maddeyi karşılar: "Parametre değişiklik kararları bir log/changelog'da gerekçesiyle tutuluyor (hangi veri, hangi tarih, ne değişti)."

**Şu ana kadar hiçbir parametre değiştirilmedi.** Bu bilinçli bir karar: roadmap'in kendi 2.3 maddesi gerçek kullanım verisi olmadan tahminle parametre değiştirmeyi açıkça yasaklıyor — "Mevcut değerlerle yayına çık (bunlar zaten 'makul' tahminler, kötü başlangıç noktası değiller)." Bu proje henüz gerçek kullanıcıya dağıtılmadı; Sprint 7'de kurulan telemetri altyapısı hiç üretim verisi biriktirmedi. Aşağıdaki tablo, veri geldiğinde hangi sinyalin hangi eşiği aşınca hangi parametrenin gözden geçirileceğini önceden sabitliyor — kararın kendisini değil, kararın *kriterini* şimdiden yazıyoruz.

## Mevcut temel değerler (S0-S9 sonu itibarıyla, hiç değişmedi)

| Parametre | Değer | Konum |
|---|---|---|
| Mastery eşiği | 3 ardışık doğru + 2 farklı gün | `src/domain/learning/mastery.ts` (`MASTERED_THRESHOLD`, `MASTERED_MIN_DISTINCT_DAYS`) |
| Tekrar borcu limiti | 40 kelime | `src/state/useAppSession.ts` (`REVIEW_DEBT_LIMIT`) |
| Tekrar borcu kademeli azalma başlangıcı | 20 kelime | `src/state/useAppSession.ts` (`REVIEW_DEBT_TAPER_START`) |
| Bölüm boyutu | 30 kelime | `src/content/questions/index.ts` (`CONTENT_UNIT_SIZE`) |
| Terfi eşiği | %80 mastery | `src/domain/learning/promotion.ts` (`PROMOTION_THRESHOLD_PERCENT`) |
| Yeniden öğrenme gecikmesi | 20 dakika | `src/domain/review/spacedRepetition.ts` (`RELEARN_DELAY_MS`) |

## Ölçüm altyapısı durumu (Sprint 10'da tamamlandı)

Her sinyal, `src/services/telemetry.ts`'teki hangi event(ler)den hesaplanacak:

| Parametre | Sinyal | Kaynak event(ler) | Durum |
|---|---|---|---|
| Mastery eşiği | Mastered olduktan N gün sonra hâlâ doğru bilinme oranı | `word_mastery_changed` (mastered anı) + sonraki `question_answered` (artık `questionId` taşıyor, aynı kelimeye eşlenebiliyor) | ✅ Hesaplanabilir |
| Tekrar borcu limiti | Limit aşıldığında terk oranı vs. aşılmadığında | `review_debt_capped` + aynı oturumdaki `session_abandoned` **veya** `practice_session_completed` (ikisi de S9/S10'da eklendi — önceden sadece terk edilen oturumlar görünüyordu, tamamlanan oturumlar hiç kayıt bırakmıyordu, bu da terk *oranını* hesaplamayı imkansız kılıyordu) | ✅ Hesaplanabilir |
| Bölüm boyutu | Bir bölümü bitirme süresi (gün) dağılımı | `unit_completed` (Sprint 10'da eklendi — önceden bu event hiç yoktu) — ardışık iki `unit_completed`/`session_started` arası gün farkı | ✅ Hesaplanabilir |
| Terfi eşiği | Terfi sonrası yeni seviyede doğruluk oranı | `level_promotion_advanced` + sonraki `question_answered` (level alanına göre filtrelenmiş) | ✅ Zaten hesaplanabiliyordu (S7'den beri) |
| Yeniden öğrenme gecikmesi | 20 dk sonra tekrar sorulan kelimenin doğru bilinme oranı | Yanlış `question_answered` (artık `questionId` taşıyor) + ~20 dk sonraki aynı `questionId`'li `question_answered` | ✅ Hesaplanabilir (S10'da `questionId` eklenmeden önce mümkün değildi) |

**Sprint 10'da kapatılan gerçek boşluk:** `question_answered` event'i `questionId` taşımıyordu — bu, mastery ve relearn-gecikmesi sinyallerinin ikisini de hesaplanamaz kılıyordu (bir cevabı hangi kelimeye ait olduğunu event verisinden ayırt etmek mümkün değildi). `unit_completed` ve `practice_session_completed` event'leri hiç yoktu. Üçü de eklendi; hiçbir mevcut parametre değeri değiştirilmedi.

## Değişiklik günlüğü

*(Henüz boş. İlk girdi, en az 2-4 haftalık gerçek kullanım verisi toplandıktan ve yukarıdaki sinyallerden biri roadmap'in [02-parameter-validation.md](02-parameter-validation.md) §2.4'teki öncelik sırasına göre net bir yöne işaret ettikten sonra eklenecek. Format:)*

| Tarih | Parametre | Eski değer | Yeni değer | Dayanak veri | Gerekçe |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

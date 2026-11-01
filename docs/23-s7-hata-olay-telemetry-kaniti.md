# LingoRise — S7 Hata Görünürlüğü ve Telemetry Kanıtı

Tarih: 9 Eylül 2026  
Durum: Tamamlandı.

## Kapatılanlar

- Yerel kayıt hataları `local_save_failed` olayıyla ring buffer’a yazılıyor.
- Bulut senkron hataları `cloud_sync_failed` olayıyla ardışık hata sayısıyla kaydediliyor.
- Firestore silme tamamlanıp Auth silinemediğinde `account_deletion_partial` olayı üretiliyor.
- Hatalar kullanıcıya mevcut Türkçe uyarı kanallarıyla gösteriliyor; telemetry hatası kullanıcı akışını durdurmuyor.
- Telemetry olayları AsyncStorage üzerinde 200 kayıtlık ring buffer’da tutuluyor ve `getRecentEvents` ile incelenebiliyor.
- Olay adları ve parametreleri TypeScript union sözlüğünde tanımlı.

## Kanıt

- `npm run typecheck` başarılı.
- `npm test` **433 başarılı / 0 başarısız**.
- Mevcut test matrisi save/cloud sync hata görünürlüğü, partial deletion ve telemetry ring buffer davranışlarını kapsıyor.

## Kapsam sınırı

Bu sprintte olaylar yerel ve denetlenebilir biçimde saklanıyor. Üçüncü taraf analytics SDK’sı veya merkezi destek/ticket entegrasyonu eklenmedi; bu karar kişisel veri ve servis yetkilendirmesi netleşene kadar S8 sonrası ürün kararına bırakıldı.


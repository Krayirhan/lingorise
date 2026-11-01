# LingoRise — S3 Senkron, Silme ve Çevrimdışı Kanıtı

Tarih: 8 Eylül 2026  
Durum: Çekirdek uygulama tamamlandı.

## Kapatılan davranışlar

- Remote fetch başarısızlığı, remote hesabın yokluğu gibi ele alınmıyor; kör push/overwrite yapılmıyor.
- İki cihaz merge’i XP, sınav geçişleri, öğrenme kayıtları, görevler, bookmark ve geçmiş alanlarını kaybetmeden birleştiriyor.
- Merge idempotent; aynı birleşik durum tekrar birleştirildiğinde XP, sınav geçişi ve öğrenme kayıtları şişmiyor.
- Local-only reset bulut hesabını silmeden yalnızca cihazdaki veriyi yeniliyor; sıfırlanmış local veri buluta yazılmıyor.
- Firestore yazıları retry ile çalışıyor; başarısızlık yerel ilerlemeyi koruyor ve kullanıcıya bulut senkron uyarısı gösteriyor.
- Hesap silme akışında Firestore silinip Auth silinemediğinde kısmi silme hatası açıkça ayrıştırılıyor.
- Günlük rollover ve merge sırası, eski streak veya günlük review XP kayıtlarının yeniden dirilmesini engelliyor.

## Kanıt

- `npm run typecheck` başarılı.
- `npm test` **433 başarılı / 0 başarısız**.
- Test matrisi remote absent / remote found / remote fetch failed, A→B→A round-trip, stale snapshot, local-only reset ve cross-day merge senaryolarını içeriyor.

## Devredilen fiziksel kanıtlar

Gerçek iki cihaz senkronu, Firebase emulator/rules çalıştırması, ağ kesintisi altında fiziksel retry ve release cihaz kurulumu bu sprintte statik/otomatik kanıtla sınırlıdır. Bunlar S6/S8 cihaz ve yayın kapılarında tamamlanacaktır.


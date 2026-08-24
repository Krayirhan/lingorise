# Birim 6 — Sessiz Davranış Boşlukları

**Puan (mevcut durum):** 4/10 · **Öncelik:** P1 — küçük, hızlı, bağımsız

## Problem

Sprint 2'nin Definition of Done'ında şu madde vardı: *"Borç eşiği aşıldığında yeni kelime akışı duruyor ve kullanıcıya sebebi söyleniyor."* Kod tarafı (`buildDailySession`, `REVIEW_DEBT_LIMIT = 40`) doğru çalışıyor ama **arayüzde bunu açıklayan hiçbir mesaj yazılmadı**. Kullanıcı bir gün "neden hep aynı kelimeler geliyor, yeni kelime yok" diye şaşırabilir — davranış doğru ama sessiz.

Bu, verilen bir sözün tutulmamış hali. Benzer sessiz boşluklar başka yerlerde de olabilir — bu birim onları tarayıp kapatıyor.

## Kapsam

### 6.1 — Tekrar borcu limiti mesajı (P1)

`src/screens/PracticeHubScreen.tsx` içindeki `sessionSummary` hesaplamasına, borç limiti aşıldığında özel bir dal ekle:

```
dueInSession >= REVIEW_DEBT_LIMIT
  → "Bugün {count} kelime tekrar bekliyor. Önce bunları tazele, yeni kelimeler yarın seni bekliyor."
```

Bu mesaj hem `PracticeHubScreen`'de hem ana ekrandaki hero kartta (`GardenHeroCard`) tutarlı şekilde görünmeli — kullanıcı hangi ekrandan girerse girsin aynı açıklamayı görmeli.

**Kabul kriteri:** `REVIEW_DEBT_LIMIT`'i aşan bir test profiliyle (`buildDailySession` testindeki "backloggedSession" senaryosuna benzer) cihazda gerçek mesajın göründüğü doğrulanmalı.

### 6.2 — Diğer sessiz durumları tara

Aşağıdaki durumların her biri için "kullanıcı bunu görünce şaşırır mı" testi uygula:

| Durum | Şu an ne oluyor | Öneri |
|---|---|---|
| Hiç vadesi gelen kelime yok, ünitede de yeni kelime yok | `buildDailySession` en yakın zamanda gelecek kelimeleri XP'siz gösteriyor | Bunun neden 0 XP verdiği açıklanmalı — "Bu kelimeler henüz tekrar zamanı gelmedi, erken pratik XP kazandırmaz" |
| Seviye terfi kutlaması bir sonraki seviye hazır değilken çıkıyor | "A2 henüz hazırlanıyor" mesajı var (bkz. `LevelPromotionModal`) | Zaten kapalı ✅ — referans olarak iyi örnek |
| `dailyReviewXpIds` günlük sıfırlanıyor ama kullanıcı bunu nereden bilecek | Hiçbir yerde açıklanmıyor | Düşük öncelik — arka plan mekaniği, kullanıcının bilmesi gerekmeyebilir |
| Görev satırları artık tıklanamıyor (Sprint 5) | Sessizce buton olmaktan çıktı | Düşük risk — zaten hero kart net bir CTA sağlıyor, muhtemelen sorun değil ama kullanıcı testinde gözlemlenmeli |

### 6.3 — Sistematik tarama süreci

Gelecekte benzer boşlukların tekrarlanmaması için: her yeni "sessiz kural" (bir eşik aşılınca davranış değişen her yer) eklendiğinde, PR açıklamasında şu soru zorunlu olsun: **"Bu davranış değişikliğini kullanıcı fark edecek mi, ve fark ederse neden olduğunu anlayacak mı?"**

## Definition of Done

- [ ] Tekrar borcu limiti mesajı `PracticeHubScreen` ve `GardenHeroCard`'da tutarlı şekilde görünüyor
- [ ] 6.2 tablosundaki her durum gözden geçirildi, gerekli olanlar için mesaj eklendi
- [ ] Cihazda, borç limitini aşan bir test profiliyle mesaj doğrulandı

## Bağımlılıklar

- Yok — tamamen bağımsız, herhangi bir zamanda yapılabilir. Küçük efor, yüksek kullanıcı güveni etkisi.

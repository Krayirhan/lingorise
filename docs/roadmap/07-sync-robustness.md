# Birim 7 — Senkron Sağlamlığı

**Puan (mevcut durum):** 4/10 · **Öncelik:** P1 — çoklu cihaz kullanımı yaygınlaşmadan önce

## Problem

`src/services/firestore.ts` içindeki `mergeAndSyncUserData` ve `mergeLearningProgress` (`src/domain/learning/mastery.ts`), iki cihaz/oturum arasındaki `learningProgress` çakışmasını şu heuristik ile çözüyor:

```typescript
const localIsRicher =
  localItem.attempts > remoteItem.attempts ||
  (localItem.attempts === remoteItem.attempts &&
    (localItem.lastAnsweredAt || 0) >= (remoteItem.lastAnsweredAt || 0));
```

Bu, **hiç test edilmedi**:
- İki cihaz aynı anda offline çalışıp sonra senkronize olursa ne olur?
- Cihazlar arası saat kayması (clock skew) varsa `lastAnsweredAt` karşılaştırması yanlış sonuç verir mi?
- Network sırası bozulup eski bir senkron yeni bir senkrondan sonra gelirse veri kaybı olur mu?

## Kapsam

### 7.1 — Çakışma senaryolarını birim testiyle kapsa (P1)

`tests/testSuite.ts` madde 26'da temel birleştirme testi var ama şu senaryolar eksik:

- **Eşit attempts, ters zaman damgası**: İki kayıt aynı `attempts` sayısına sahip ama `lastAnsweredAt` cihaz saatine göre "yanlış" sırada (clock skew simülasyonu).
- **Bir cihaz offline'ken diğerinde ilerleme**: Cihaz A 3 gün offline pratik yapıyor, cihaz B aynı süre online farklı kelimeler çalışıyor, sonra A online olup senkronize oluyor.
- **Review queue + learningProgress tutarlılığı**: Sprint 2'de `reviewQueue` kaldırılıp her şey `learningProgress`'e taşındı — bu, çakışma yüzeyini küçülttü ama tam sıfırlamadı; `nextReviewAt` alanının birleşmede doğru seçildiğinden emin olunmalı (zengin kayıt = daha çok deneme, ama zamanlaması daha mı doğru?).

### 7.2 — Sunucu zaman damgası kullan, cihaz saatine güvenme (P1)

Şu an `lastAnsweredAt: Date.now()` **cihaz saatini** kullanıyor. Cihaz saati yanlış ayarlanmışsa (kullanıcı manuel değiştirmiş, saat dilimi sorunu) birleştirme mantığı yanlış karar verebilir.

**Öneri:** Firestore'a yazarken `serverTimestamp()` kullan (zaten `syncLearningItemProgress` içinde `lastAnsweredAt: serverTimestamp()` var — ama bu sadece Firestore'a yazılan kopyada, yerel `learningProgress`'teki `lastAnsweredAt` hâlâ cihaz saati). İkisini tutarlı hale getir: birleştirme kararı için sunucu zaman damgasını otorite kabul et, cihaz saatini sadece yerel gösterim için kullan.

### 7.3 — Gerçek çoklu cihaz testi (P1)

İki fiziksel cihazda (veya bir cihaz + bir emülatör) aynı hesapla:
1. Cihaz A'da 10 kelime pratik yap, offline'a al.
2. Cihaz B'de farklı 10 kelime pratik yap, online kalsın.
3. Cihaz A'yı tekrar online yap, senkronu gözlemle.
4. Her iki cihazda da 20 kelimenin de `learningProgress`'te olduğunu doğrula.
5. Aynı kelimeyi her iki cihazda farklı sonuçla (biri doğru biri yanlış) cevaplayıp hangi kaydın kazandığını gözlemle — beklenen davranışla eşleşiyor mu?

### 7.4 — Çakışma durumunda veri kaybı için savunma hattı (P2)

En kötü senaryoda bile veri kaybını önlemek için: birleştirme öncesi hem yerel hem uzak `learningProgress`'in bir kopyası (timestamp'li) geçici olarak saklanabilir (örn. AsyncStorage'da `@lingorise_merge_backup_v1`), böylece bir birleştirme hatası fark edilirse geri dönülebilir. Bu, karmaşıklık ekler — sadece 7.1-7.3'te gerçek bir veri kaybı riski gözlemlenirse uygulanmalı.

## Definition of Done

- [ ] 7.1'deki üç senaryo birim testiyle kapsandı
- [ ] `lastAnsweredAt` birleştirme kararında sunucu zaman damgası kullanıyor
- [ ] Gerçek iki cihazlı senkron testi yapıldı ve belgelendi
- [ ] Veri kaybı riski gözlemlenirse 7.4 değerlendirildi

## Bağımlılıklar

- Yok — bağımsız, ama çoklu cihaz kullanımı arttıkça önceliği yükselir. Hesap oluşturma özelliği (`onOpenAuth`) zaten var, yani bu risk şu an bile teorik değil.

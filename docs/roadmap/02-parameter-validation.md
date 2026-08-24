# Birim 2 — Parametre Doğrulaması

**Puan (mevcut durum):** 3/10 · **Öncelik:** P1 — Birim 3 (Telemetri) ve gerçek kullanıcı verisi olmadan başlanamaz

## Problem

Sistemde beş "keyfi" sayı var. Hepsi mantıklı gerekçeyle seçildi ama **hiçbiri veriyle doğrulanmadı**:

| Parametre | Değer | Konum | Neden keyfi |
|---|---|---|---|
| Mastery eşiği | 3 ardışık doğru + 2 farklı gün | `src/domain/learning/mastery.ts` (`MASTERED_THRESHOLD`, `MASTERED_MIN_DISTINCT_DAYS`) | "2 gün" neden yeterli, neden 3 değil? |
| Tekrar borcu limiti | 40 kelime | `src/state/useAppSession.ts` (`REVIEW_DEBT_LIMIT`) | Neden 40, neden 25 veya 60 değil? |
| Bölüm boyutu | 30 kelime | `src/content/questions/index.ts` (`CONTENT_UNIT_SIZE`) | "3 günde biter" varsayımı hiç test edilmedi |
| Terfi eşiği | %80 mastery | `src/domain/learning/promotion.ts` (`PROMOTION_THRESHOLD_PERCENT`) | Neden 80, neden 75 veya 90 değil? |
| Yeniden öğrenme gecikmesi | 20 dakika | `src/domain/review/spacedRepetition.ts` (`RELEARN_DELAY_MS`) | Rastgele "makul" bir süre |

## Neden bu sırayla değil de burada

Bu birim, **Birim 3 (Telemetri)** kurulmadan anlamsız. Ölçmeden "40 mu 60 mu daha iyi" sorusuna cevap veremeyiz — sadece tahmin ederiz, ki zaten şu anki durum bu.

## Yaklaşım: Kademeli kalibrasyon, büyük sıçrama değil

### 2.1 — Ölçüm çerçevesini kur (Birim 3'e bağımlı)

Her parametre için izlenecek metrik tanımlanmalı **önce**:

| Parametre | İzlenecek metrik | Sinyal |
|---|---|---|
| Mastery eşiği | Bir kelime "mastered" olduktan N gün sonra hâlâ doğru bilinme oranı | Düşükse eşik çok gevşek |
| Tekrar borcu limiti | Limit aşıldığında oturum terk etme oranı vs. limit aşılmadığında | Terk oranı yüksekse limit çok yüksek (kullanıcı boğuluyor) |
| Bölüm boyutu | Bir bölümü bitirme süresi (gün) dağılımı | Medyan 3 günden çok uzaksa boyut yanlış |
| Terfi eşiği | Terfi sonrası yeni seviyede doğruluk oranı | Düşükse eşik çok erken |
| Yeniden öğrenme gecikmesi | 20 dk sonra tekrar sorulan kelimenin doğru bilinme oranı | Çok yüksekse gecikme fazla (kolay), çok düşükse yetersiz |

### 2.2 — A/B test altyapısı değerlendir (P1)

Şu an kod tabanında hiçbir feature flag / experiment sistemi yok. İki seçenek:
- **Basit:** Kullanıcı ID'sine göre deterministik bölme (örn. `hash(userId) % 2`), iki parametre setini paralel çalıştır.
- **Daha sonra:** GrowthBook veya benzeri bir deney platformu (proje CLAUDE.md'sinde zaten GrowthBook referansı var, oradan devam edilebilir).

İlk yayında kullanıcı sayısı düşükse A/B testi anlamlı olmayabilir — bu durumda **tek kollu, gözlemsel kalibrasyon** (aşağıdaki 2.3) yeterli.

### 2.3 — Gözlemsel kalibrasyon (kullanıcı sayısı düşükken)

1. Mevcut değerlerle yayına çık (bunlar zaten "makul" tahminler, kötü başlangıç noktası değiller).
2. Birim 3'teki event'leri 2-4 hafta topla.
3. Her parametre için yukarıdaki tabloda tanımlı sinyali kontrol et.
4. Sinyal net bir yöne işaret ediyorsa (örn. terfi sonrası doğruluk oranı %50'nin altına düşüyorsa "terfi çok erken") **tek bir parametreyi** değiştir, izlemeye devam et.
5. Bir seferde birden fazla parametre değiştirmeyin — hangi değişikliğin etkiyi yarattığını ayırt edemezsiniz.

### 2.4 — Öncelik sırası (hangi parametre önce kalibre edilmeli)

1. **Tekrar borcu limiti (40)** — en yüksek terk riski taşıyor, yanlışsa kullanıcı kaybı doğrudan.
2. **Terfi eşiği (%80)** — yanlışsa kullanıcı güveni kırılır (çok erken terfi → yeni seviyede boğulma).
3. **Mastery eşiği (3+2 gün)** — yanlışsa "pekişen" sayısı ya çok yavaş ya çok hızlı artar, motivasyonu etkiler.
4. **Bölüm boyutu (30)** — düşük risk, deneyim kalitesini etkiler ama terk sebebi olması az olası.
5. **Yeniden öğrenme gecikmesi (20 dk)** — en düşük risk, kullanıcı muhtemelen hiç fark etmez.

## Definition of Done

- [ ] Her 5 parametre için izlenecek metrik tanımlı ve Birim 3 event'lerine bağlı
- [ ] En az 2 hafta gerçek kullanım verisi toplandı
- [ ] Tekrar borcu limiti ve terfi eşiği en az bir kez veriyle gözden geçirildi
- [ ] Parametre değişiklik kararları bir log/changelog'da gerekçesiyle tutuluyor (hangi veri, hangi tarih, ne değişti)

## Bağımlılıklar

- **Gerektirir:** Birim 3 (Telemetri) tamamlanmış olmalı.
- **Faydalanır:** Birim 1 (İçerik) — A2/B1 olmadan terfi eşiği gözlemlenemez.

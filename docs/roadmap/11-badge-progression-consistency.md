# Birim 11 — Rozet ve İlerleme Tutarlılığı

**Puan (mevcut durum):** 5/10 · **Öncelik:** P2 — Sprint 0-5 sonrası bir "kendi kendini denetleme" turu

## Problem

Sprint 0-5 boyunca ilerlemeyi göstermek için **dört ayrı sistem** ortaya çıktı:

1. **Bahçe evreleri** (Tohum & Filiz → Ulu Ağaç) — mastered kelime sayısına bağlı
2. **Bölümler** (A1 · Bölüm 3/11) — ünitedeki görülen kelime sayısına bağlı
3. **Seviye terfisi** (%80 mastery rozeti) — seviye bazlı mastery yüzdesine bağlı
4. **Rozetler** (İlk Adım, Hızlı İlerleme, Kelime Sever, 3 Gün Seri, Usta Tekrarcı) — çeşitli ad-hoc eşiklere bağlı (`src/domain/gamification/badges.ts`)

Bunların her biri **kendi içinde tutarlı** (Sprint 5'te ekran-içi tutarlılık sorunlarını çözdük — #62, #63). Ama **birbirleriyle** tutarlı mı, hiç sistematik olarak kontrol edilmedi. Risk: S5'te düzelttiğimiz "aynı şeyi farklı yerlerde farklı gösterme" sorununu, bu sefer dört farklı sistemle yeniden üretmiş olabiliriz.

## Kapsam

### 11.1 — Çapraz tutarlılık matrisi çıkar (P1)

Aşağıdaki soruları her ikili için cevapla:

| Çift | Soru | Şu anki durum |
|---|---|---|
| Bahçe ↔ Terfi | Bahçe "Ulu Ağaç" evresine geçtiğinde (275+ mastered, çok seviyeli toplam) kullanıcı hangi seviyede olursa olsun mu bu evrede, yoksa seviye bazlı mı olmalı? | Bahçe **tüm seviyeler toplamı**, terfi **tek seviye** bazlı — kasıtlı ayrım ama kullanıcıya hiç açıklanmadı. Kafa karıştırabilir: "A1'i tamamladım ama bahçem hâlâ Tohum & Filiz'de" senaryosu mümkün. |
| Bölüm ↔ Terfi | Bir kullanıcı seviyenin tüm bölümlerini bitirmeden (görülen anlamında) ama mastery %80'e ulaşarak terfi edebilir mi? | Evet, mümkün — bölüm "görülen", terfi "mastered". Biri diğerini önkoşul yapmıyor. Bu doğru olabilir (görmeden mastered olunamaz zaten) ama hiç doğrulanmadı. |
| Rozet ↔ Mastery | "Kelime Sever" rozeti (5 kelime öğren) `solvedQuestionIds` sayısına mı yoksa mastered sayısına mı bakıyor? | `badges.ts`'e bakılmalı — Sprint 1'de mastery kavramı gelince rozet eşiklerinin hangilerinin güncellendiği net değil. |
| Rozet ↔ Terfi | Seviye terfisi kendi başına bir rozet mi, yoksa sadece modal kutlaması mı? | Şu an **sadece modal**, `unlockedBadges`'e eklenmiyor. Rozet koleksiyonunda görünmüyor — kullanıcı terfisini "kazandığı" bir şey olarak koleksiyonunda göremiyor. |

### 11.2 — Rozet eşiklerini mastery sistemine göre denetle (P1)

`src/domain/gamification/badges.ts` içindeki `evaluateBadges` fonksiyonunu satır satır gözden geçir:

- `badge_first_step`: `xp > 0 || solvedQuestionIds.length > 0` — hâlâ eski `solvedQuestionIds` kullanıyor, mastery'ye taşınmalı mı yoksa "ilk adım" için "görülen" yeterli mi (muhtemelen yeterli, düşük öncelik).
- `badge_garden_lover`: `solvedQuestionIds.length >= 5` — aynı soru.
- `badge_master_review`: Sprint 2'de `repetitions >= 2` sayısı 25'e çıkarılmıştı (#23) — bu güncel mi, kontrol et.

Karar ilkesi: **düşük eşikli, erken motivasyon rozetleri** ("İlk Adım" gibi) "görülen" bazlı kalabilir — amaçları hızlı bir ilk zafer hissi vermek. **Yüksek eşikli, anlamlı rozetler** ("Usta Tekrarcı" gibi) mastery bazlı olmalı — aksi halde rozet enflasyonu geri gelir (tam olarak denetimde bulduğumuz #23 sorunu).

### 11.3 — Seviye terfisini rozet koleksiyonuna ekle (P2)

Her terfi edilen seviye için bir rozet oluştur (`badge_level_a1_complete`, `badge_level_a2_complete` gibi) ve `markLevelCelebrated` çağrıldığında `unlockedBadges`'e ekle. Bu, terfinin geçici bir modal anından kalıcı bir koleksiyon parçasına dönüşmesini sağlar — kullanıcı Profil/İlerleme ekranında geçmiş başarılarını görebilir.

### 11.4 — Bahçe/terfi ilişkisini kullanıcıya açıkla (P2)

11.1'deki "Bahçe ↔ Terfi" karışıklığını gidermek için: bahçe kartına küçük bir açıklama eklenebilir — "Bahçen tüm seviyelerdeki pekişmiş kelimelerinle büyür" gibi bir ipucu (ilk kez görüldüğünde bir kez gösterilen tooltip, her seferinde değil).

## Definition of Done

- [ ] 11.1'deki matris tamamlandı, her hücre için bilinçli bir karar verildi (değişiklik gerekmeyebilir, ama karar belgeli olmalı)
- [ ] Rozet eşikleri mastery sistemiyle tutarlı hale getirildi
- [ ] Seviye terfisi rozet koleksiyonuna ekleniyor
- [ ] Bahçe/terfi ilişkisi kullanıcıya en az bir kez açıklanıyor

## Bağımlılıklar

- **Faydalanır:** Birim 1 (birden fazla seviye olmadan bahçe/terfi ayrımı test edilemez).
- Bağımsız olarak başlanabilir (11.1, 11.2 kod incelemesi, içerik gerektirmez).

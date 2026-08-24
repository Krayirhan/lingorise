# Birim 5 — Telemetri ve Analitik

**Puan (mevcut durum):** 2/10 · **Öncelik:** P0 — içerikle birlikte, paralel başlanabilir

## Problem

Bu sistemin tüm amacı "retention'ı artırmak, unutmayı azaltmak, motivasyonu korumak". Ama **hiçbir ölçüm event'i yok**. Şu sorulara cevap veremiyoruz:

- Kullanıcı gerçekten daha çok mu hatırlıyor (mastery sonrası hatırlama oranı)?
- Terfi kutlaması motive mi ediyor, kafa mı karıştırıyor?
- Bahçe metaforu XP'den kopunca kullanıcı daha mı bağlı kalıyor, yoksa "sayı artmıyor, sıkıcı" mı diyor?
- Tekrar borcu limiti (40) kullanıcıyı koruyor mu, yoksa engelliyor mu?
- Hangi ekranda, hangi adımda kullanıcılar uygulamayı bırakıyor?

Bunların hiçbiri şu an ölçülemez. Sprint 0-5'te yazılan her "iyi tasarım kararı" aslında **doğrulanmamış bir hipotez**.

## Kapsam

### 5.1 — Event altyapısını seç ve kur (P0)

Proje zaten Firebase kullanıyor (`src/services/firebase.ts`, `firestore.ts`) — **Firebase Analytics** en düşük entegrasyon maliyetli seçenek. Alternatif olarak PostHog (self-hosted veya cloud) daha zengin funnel/retention analizi sunar ama ek altyapı gerektirir.

**Öneri:** Firebase Analytics ile başla (zaten kurulu SDK, ek maliyet yok), ihtiyaç büyürse PostHog'a geçiş değerlendirilir.

### 5.2 — Temel event seti (P0)

| Event | Ne zaman | Parametreler |
|---|---|---|
| `session_started` | Uygulama açıldığında | `days_since_last_open` |
| `daily_rollover_applied` | Yeni gün tespit edildiğinde | `streak_before`, `streak_after`, `pending_reviews_at_open` |
| `practice_session_started` | `startPractice`/`startReview` çağrıldığında | `session_type` (mixed/review-only/new-only), `due_count`, `fresh_count` |
| `question_answered` | Her cevapta | `is_correct`, `is_first_encounter`, `was_due`, `response_time_ms`, `used_hint`, `question_id`, `level` |
| `word_mastery_changed` | `deriveStatus` değişince | `from_status`, `to_status`, `question_id`, `repetitions`, `distinct_days` |
| `garden_stage_changed` | Bahçe evresi değişince | `from_stage`, `to_stage`, `mastered_words_count` |
| `review_debt_capped` | Yeni kelime akışı borç yüzünden durunca | `due_count`, `session_size` |
| `level_promotion_shown` | Terfi modalı açılınca | `level`, `mastered_percent`, `next_level_ready` |
| `level_promotion_advanced` | Kullanıcı "devam et" derse | `from_level`, `to_level` |
| `level_switch_warning_shown` | Yumuşak kapı uyarısı görününce | `current_level`, `target_level`, `current_mastered_percent` |
| `level_switch_confirmed_ahead` | Uyarıya rağmen devam edilirse | `current_level`, `target_level` |
| `daily_quest_completed` | Görev tamamlanınca | `quest_id`, `xp_earned` |
| `session_abandoned` | Oturum tamamlanmadan çıkılırsa | `questions_answered`, `questions_total` |

### 5.3 — Retention/funnel raporları (P1)

Event'ler toplanmaya başladıktan sonra:
- **D1/D7/D30 retention**: Kaç kullanıcı 1, 7, 30 gün sonra geri dönüyor.
- **Mastery hunisi**: `new` → `learning` → `review` → `mastered` geçiş oranları, her adımda ne kadar kayıp var.
- **Oturum tamamlama oranı**: `practice_session_started` / tamamlanan oturum oranı, `session_type`'a göre kırılım (review-only oturumlar daha mı sık terk ediliyor?).
- **Terfi sonrası davranış**: `level_promotion_advanced` sonrası 7 gün içindeki doğruluk oranı ve retention — terfi eşiğinin doğru kalibre edilip edilmediğinin ana sinyali.

### 5.4 — Gizlilik ve KVKK/GDPR uyumu (P0, gözden kaçırılmamalı)

- Kullanıcı kimliği anonim/pseudonymous olmalı (Firebase zaten cihaz bazlı ID kullanır).
- Toplanan veriler için bir gizlilik politikası güncellemesi gerekebilir — bu bir hukuki/ürün kararı, mühendislik kapsamının dışında ama unutulmamalı.
- Hassas veri toplanmıyor (kelime cevapları hassas değil) ama yine de "hangi veriyi ne kadar süre tutuyoruz" sorusu net olmalı.

## Definition of Done

- [ ] Firebase Analytics (veya seçilen alternatif) entegre
- [ ] 5.2'deki tüm event'ler kodda tetikleniyor ve Firebase konsolunda görünüyor
- [ ] En az bir retention dashboard'u (D1/D7/D30) kurulu
- [ ] Mastery hunisi raporu erişilebilir
- [ ] Gizlilik politikası gözden geçirildi

## Bağımlılıklar

- **Bağımsız** — herhangi bir zamanda, içerikle paralel başlanabilir. Hatta içerik hazır olmadan bile mevcut A1 kullanıcılarından veri toplamaya başlanabilir.
- **Bloke ettiği:** Birim 2 (Parametre Doğrulaması) bu olmadan tamamen kör.

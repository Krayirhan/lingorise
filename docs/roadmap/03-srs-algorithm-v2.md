# Birim 3 — SRS Algoritması v2 (Gerçek SM-2)

**Puan (mevcut durum):** 4/10 · **Öncelik:** P2 — Birim 2'den veri gelmeye başlayınca

## Problem

Şu anki `scheduleNextReview` (`src/domain/review/spacedRepetition.ts`) SM-2'nin **basitleştirilmiş** bir versiyonu:

```
Doğru cevap  → easeFactor += 0.1  (sabit)
Yanlış cevap → easeFactor -= 0.2  (sabit)
```

Gerçek SM-2 algoritması, kullanıcıdan **0-5 arası bir kalite puanı** alır (ne kadar kolay hatırladın) ve ease factor'ü buna göre ayarlar:

```
EF' = EF + (0.1 - (5-q) × (0.08 + (5-q) × 0.02))
```

Bizim sistemimizde sadece ikili sinyal var: doğru/yanlış. "Zorlanarak doğru bildim" ile "anında doğru bildim" arasında **hiçbir fark yok** — ikisi de aynı ease bonusunu alıyor.

## Neden şimdi değil

Bu değişiklik **kullanıcı arayüzüne yeni bir etkileşim ekliyor** (kalite puanı nasıl toplanacak?) ve mevcut ikili modelin "yetersiz ama çalışır" olduğu bir durumda risk/getiri oranı düşük. Önce gerçek kullanım verisiyle mevcut modelin ne kadar kötü performans gösterdiğini görmek (Birim 2) daha değerli.

## Kapsam

### 3.1 — Kalite sinyalini arayüzden sızdırmadan çıkar (P2, ilk adım — risksiz)

Kullanıcıya yeni bir soru sormadan da dolaylı kalite sinyali toplanabilir:

- **Cevap süresi**: Hızlı doğru cevap = yüksek kalite, yavaş doğru cevap (uzun düşünme) = düşük kalite.
- **İpucu kullanımı**: İpucu ile doğru bilinen cevap zaten düşük XP alıyor (`usePracticeSession.ts`) — aynı sinyali ease factor hesabına da bağla.
- **"Tekrar Dene" sayısı**: Bir soruda kaç kez yanlış deneme yapıldığı.

Bu üç sinyali birleştirip 0-5 yerine basit bir "yüksek/orta/düşük kalite" sınıflandırması yapılabilir — kullanıcıya hiçbir yeni UI yükü bindirmeden.

```
// Taslak yaklaşım
function inferQuality(responseTimeMs: number, usedHint: boolean, isCorrect: boolean): 0-5 {
  if (!isCorrect) return usedHint ? 1 : 0
  if (usedHint) return 3
  if (responseTimeMs < 3000) return 5  // hızlı ve doğru
  if (responseTimeMs < 8000) return 4
  return 3  // doğru ama yavaş
}
```

### 3.2 — Gerçek SM-2 formülünü uygula (P2)

`scheduleNextReview` fonksiyonunu, çıkarılan kalite puanını kullanacak şekilde güncelle:

```
EF' = max(1.3, EF + (0.1 - (5-q) × (0.08 + (5-q) × 0.02)))
```

`nextIntervalDays` fonksiyonu zaten `repetitions` ve `easeFactor`'e göre çalışıyor — sadece `easeFactor` hesaplama mantığı değişecek, aralık hesaplama mimarisi (1 gün → 3 gün → önceki × ease) korunabilir.

### 3.3 — Geriye dönük uyumluluk

- Mevcut `learningProgress` kayıtlarındaki `easeFactor` değerleri (hepsi `DEFAULT_EASE_FACTOR = 2.5`'ten başlayıp ikili modelle güncellenmiş) yeni formülle uyumlu — migration gerekmez, sadece ileriye dönük hesaplamalar değişir.
- `tests/testSuite.ts` madde 2'deki (Spaced Repetition Interval Enforcement) testler yeni kalite bazlı hesaplamayla güncellenmeli.

### 3.4 — A/B karşılaştırması (Birim 2 ile birlikte)

Yeni algoritmayı direkt herkese açmak yerine:
1. Küçük bir kullanıcı yüzdesinde dene.
2. Birim 2'nin izleme çerçevesiyle (mastery sonrası hatırlama oranı) iki modeli karşılaştır.
3. Gerçek SM-2 daha iyi performans gösteriyorsa tam açılır.

## Definition of Done

- [ ] Dolaylı kalite sinyali (süre + ipucu + deneme sayısı) hesaplanıyor
- [ ] `scheduleNextReview` gerçek SM-2 formülüyle güncellendi
- [ ] Testler yeni formülle güncellendi ve geçiyor
- [ ] Eski ve yeni modelin karşılaştırmalı verisi en az 2 hafta toplandı
- [ ] Karar: yeni model tam açıldı veya mevcut ikili model yeterli bulunup kapatıldı (ikisi de geçerli sonuç)

## Bağımlılıklar

- **Gerektirir:** Birim 2 — Parametre Doğrulaması (`02-parameter-validation.md`, ölçüm çerçevesi) ve Telemetri (`05-telemetry-analytics.md`, event altyapısı).
- **Bloke etmez:** Diğer hiçbir birim buna bağımlı değil, ötelenebilir.

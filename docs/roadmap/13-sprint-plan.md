# Sprint Planı — Birimlerin Sprint'lere Dağılımı

Bu dosya, `00-INDEX.md`'deki 11 uygulanabilir birimin (Birim 12 hariç — o bir kapı, iş kalemi değil) somut sprint'lere dağılımını tutar. Mevcut projede zaten **6 sprint** (S0-S5) tamamlanmış durumda; buradaki plan **S6'dan başlar**.

## Önceki sprintler (tamamlandı, referans için)

| Sprint | Odak | Kalem | Durum |
|---|---|---|---|
| S0 | Acil Tamir | 9 | ✅ |
| S1 | Mastery Temeli | 5 | ✅ |
| S2 | SRS Onarımı | 9 | ✅ |
| S3 | Bahçe & Bölümler | 9 | ✅ |
| S4 | Terfi & Seviye | 5 | ✅ |
| S5 | Tutarlılık | 12 | ✅ |

## Yeni sprintler (planlandı)

### S6 — İçerik Genişletme + Hızlı Kazanımlar

| Kaynak | Kalem |
|---|---|
| [01-content-expansion.md](01-content-expansion.md) §1.1-1.4 | A2 → 250+ kelime, A1'in 315 şablon cümlesinin gerçek cümlelerle değiştirilmesi |
| [06-behavior-messaging-gaps.md](06-behavior-messaging-gaps.md) §6.1-6.3 | Tekrar borcu limiti mesajı, sessiz davranış taraması |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.2 | Zorluk ölçeklemesi — içerik üretimiyle birlikte yapılmalı |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.3 | Pick the Word modu — mevcut veriden türetilir |

**9 kalem · içerik-ağırlıklı, haftalarca sürebilir · kritik yolun başlangıcı**

### S7 — Doğrulama Altyapısı

| Kaynak | Kalem |
|---|---|
| [04-multiday-verification.md](04-multiday-verification.md) §4.1-4.4 | Dev zaman kaydırma aracı, çok günlü simülasyon testleri, beta rollout |
| [05-telemetry-analytics.md](05-telemetry-analytics.md) §5.1-5.4 | Event altyapısı, temel event seti, retention raporları, gizlilik kontrolü |

**8 kalem · S6'nın ürettiği içerikle test edilir**

### S8 — Sağlamlaştırma

| Kaynak | Kalem |
|---|---|
| [07-sync-robustness.md](07-sync-robustness.md) §7.1-7.4 | Çoklu cihaz çakışma senaryoları, sunucu zaman damgası, gerçek çoklu cihaz testi |
| [08-migration-cleanup.md](08-migration-cleanup.md) §8.1-8.4 | Versiyonlu göç sistemi, mevcut üç göç yolunun toparlanması |

**8 kalem · bağımsız, S6-S7 ile paralel yürütülebilir**

### S9 — Erişilebilirlik + Çeşitlilik

| Kaynak | Kalem |
|---|---|
| [09-accessibility.md](09-accessibility.md) §9.1-9.5 | TalkBack, dinamik yazı tipi, kontrast, `reduceMotion` taraması |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.1 | Rastgele çeldirici — düşük efor, yüksek etki |

**6 kalem · bağımsız, S6-S8 ile paralel yürütülebilir**

### S10 — Parametre Kalibrasyonu

| Kaynak | Kalem |
|---|---|
| [02-parameter-validation.md](02-parameter-validation.md) §2.1-2.4 | 5 keyfi sayının (mastery eşiği, borç limiti, bölüm boyutu, terfi eşiği, gecikme) veriyle ayarlanması |

**4 kalem · S7'nin telemetrisi en az 2 hafta veri biriktirdikten sonra başlar — kod değil, analiz ağırlıklı**

### S11 — Tutarlılık + SM-2 Başlangıcı

| Kaynak | Kalem |
|---|---|
| [11-badge-progression-consistency.md](11-badge-progression-consistency.md) §11.1-11.4 | Bahçe/bölüm/terfi/rozet çapraz tutarlılık matrisi |
| [03-srs-algorithm-v2.md](03-srs-algorithm-v2.md) §3.1 | Dolaylı kalite sinyali (süre, ipucu, deneme sayısı) |

**5 kalem · S6'nın çoklu seviye verisine bağımlı**

### S12 — SM-2 Tamamlama + Yayın Kapısı

| Kaynak | Kalem |
|---|---|
| [03-srs-algorithm-v2.md](03-srs-algorithm-v2.md) §3.2-3.4 | Gerçek SM-2 formülü, geriye uyumluluk, A/B karşılaştırma |
| [12-launch-readiness-checklist.md](12-launch-readiness-checklist.md) | Yayına hazırlık checklist'i, ilk 30 gün planı |

**3 kalem + kapı kontrolü · projenin bu fazdaki son sprint'i**

## Bilinçli olarak sprint dışı bırakılan tek kalem

[10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) **§10.4 — Quick Review modu**: dokümanda zaten "P3, uzun vadeli" olarak işaretli. Backlog'da kalması bilinçli bir karar — S6-S12 tamamlandıktan sonra ayrı değerlendirilir, unutulmuş bir kalem değil.

## Kapsama doğrulaması

| Dosya | Sprint |
|---|---|
| 01-content-expansion.md | S6 |
| 02-parameter-validation.md | S10 |
| 03-srs-algorithm-v2.md | S11 + S12 |
| 04-multiday-verification.md | S7 |
| 05-telemetry-analytics.md | S7 |
| 06-behavior-messaging-gaps.md | S6 |
| 07-sync-robustness.md | S8 |
| 08-migration-cleanup.md | S8 |
| 09-accessibility.md | S9 |
| 10-game-variety-and-content-quality.md | S6 + S9 (§10.4 bilinçli olarak backlog'da) |
| 11-badge-progression-consistency.md | S11 |
| 12-launch-readiness-checklist.md | S12 |

**11/11 uygulanabilir birim bir sprint'e bağlı.** Toplam proje: 6 tamamlanmış + 7 planlanmış = **13 sprint**.

## Zaman çizelgesi (paralellik dahil)

```
S6  ██████████████████████████████████████  İçerik + hızlı kazanımlar
S7          ░░░░████████████████            Doğrulama altyapısı (S6'ya bağımlı)
S8  ██████████████████                      Sağlamlaştırma (bağımsız, paralel)
S9  ████████████                            Erişilebilirlik + çeşitlilik (bağımsız, paralel)
S10                          ░░░░░░████████  Parametre kalibrasyonu (S7 verisine bağımlı, 2 hafta bekleme)
S11         ░░░░░░░░████████                Tutarlılık + SM-2 başlangıcı (S6 verisine bağımlı)
S12                                  ██████  SM-2 tamamlama + yayın kapısı
```

Küçük/tek kişilik ekipte sıralı gidilirse toplam **~7 sprint** ekleniyor. Takım büyükse S8 ve S9'un S6-S7 ile paralel yürütülmesiyle takvim kısalır.

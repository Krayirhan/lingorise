# LingoRise — Bitirme Yol Haritası

**Amaç:** Sprint 0–5'te kurulan ilerleme sistemi mimarisi doğru ama **ampirik olarak sınanmamış**. Bu klasör, "teorik olarak doğru" olandan "gerçekten çalışan ve ölçülen" olana geçiş planını tutar.

**Nereden geldi:** Bu yol haritası, `progression-audit` ve `progression-roadmap` artifact'lerinde yapılan 74 kalemlik kod denetiminin ve Sprint 0–5 uygulamasının ardından yapılan acımasız değerlendirmenin doğrudan devamıdır. Oradaki puanlar burada birim birim çözüm planına dönüştürüldü.

## Nasıl okunmalı

Her dosya bağımsız bir **birim** — kendi başına planlanabilir, kendi başına teslim edilebilir. Ama aralarında gerçek bağımlılıklar var; sıralama tesadüfi değil.

## Birimler ve öncelik sırası

| # | Birim | Dosya | Sprint | Neden bu sırada |
|---|---|---|---|---|
| 1 | İçerik Genişletme | [01-content-expansion.md](01-content-expansion.md) | S6 | **Her şeyin önkoşulu.** İçerik olmadan hiçbir parametre gerçek veriyle sınanamaz. |
| 2 | Çok Günlü Doğrulama Altyapısı | [04-multiday-verification.md](04-multiday-verification.md) | S7 | İçerik gelince hemen ihtiyaç duyulacak — mastery/terfi/bahçe zincirini gerçek zamanda test etme aracı olmadan hiçbir parametre kalibre edilemez. |
| 3 | Telemetri ve Analitik | [05-telemetry-analytics.md](05-telemetry-analytics.md) | S7 | Parametreleri doğrulamanın **tek yolu** ölçmek. Bu olmadan #2 sadece "bende çalıştı" seviyesinde kalır. |
| 4 | Parametre Doğrulaması | [02-parameter-validation.md](02-parameter-validation.md) | S10 | #2 ve #3 hazır olunca asıl kalibrasyon işi burada yapılır. |
| 5 | SRS Algoritması v2 | [03-srs-algorithm-v2.md](03-srs-algorithm-v2.md) | S11-S12 | Parametre verisi gelmeye başlayınca ikili (doğru/yanlış) modelden kaliteli SM-2'ye geçiş. |
| 6 | Sessiz Davranış Boşlukları | [06-behavior-messaging-gaps.md](06-behavior-messaging-gaps.md) | S6 | Küçük ama kullanıcı güvenini doğrudan etkiliyor — bağımsız, hızlı kapatılabilir. |
| 7 | Senkron Sağlamlığı | [07-sync-robustness.md](07-sync-robustness.md) | S8 | Çoklu cihaz kullanımı yaygınlaşmadan önce kapatılmalı. |
| 8 | Migration Temizliği | [08-migration-cleanup.md](08-migration-cleanup.md) | S8 | Teknik borç — birikmeye devam etmeden bir kerede toparlanmalı. |
| 9 | Erişilebilirlik Doğrulaması | [09-accessibility.md](09-accessibility.md) | S9 | Yayın öncesi zorunlu, ama diğer birimlerden bağımsız yürütülebilir. |
| 10 | Oyun Çeşitliliği ve İçerik Kalitesi | [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) | S6 + S9 | #1 ile birlikte yürür (§10.2, §10.3), ayrıca §10.1 bağımsız hızlı kazanım olarak S9'da. §10.4 bilinçli olarak backlog'da (P3). |
| 11 | Rozet/İlerleme Tutarlılığı | [11-badge-progression-consistency.md](11-badge-progression-consistency.md) | S11 | Dört ayrı ilerleme göstergesinin (bahçe, bölüm, terfi, rozet) birbiriyle çelişmediğinden emin olma turu. |
| 12 | Yayına Hazırlık Kapısı | [12-launch-readiness-checklist.md](12-launch-readiness-checklist.md) | S12 | Hepsinin toplandığı son kontrol listesi — "yayınla" demeden önce. |

**Sprint'lere tam dağılım, kalem sayıları ve zaman çizelgesi için:** [13-sprint-plan.md](13-sprint-plan.md)

**Parametre değişiklik kararlarının günlüğü (Birim 2 §2.4 DoD'si) için:** [14-parameter-calibration-log.md](14-parameter-calibration-log.md)

**S0-S12 tamamlandıktan sonra kalan işler için (Faz 2, Birim 13-20):** [15-phase2-roadmap.md](15-phase2-roadmap.md)

**Faz 2'nin sprint dağılımı (S13-S18) için:** [16-phase2-sprint-plan.md](16-phase2-sprint-plan.md)

**Günlük akış ve SRS sağlamlaştırması (yeni denetim bulguları) için:** [18-srs-flow-hardening.md](18-srs-flow-hardening.md)

## Zaman çizelgesi (kabaca)

```
Hafta 1-3   ██████████████████████████████████  İçerik Genişletme (paralel: Çok Günlü Altyapı)
Hafta 2-3           ████████████████            Telemetri
Hafta 4     ░░░░████████░░░░                    Parametre Doğrulaması (veri birikmeye başlayınca)
Hafta 4-5              ░░░░██████████            SRS v2
Hafta 1 (paralel)  ███                          Sessiz Davranış Boşlukları
Hafta 5     ░░░░░░░░░░░░████████                Senkron Sağlamlığı
Hafta 5-6                       ██████          Migration Temizliği
Hafta 6                              ████        Erişilebilirlik
Hafta 2-6   (içerikle paralel yürür)  Oyun Çeşitliliği
Hafta 6                                    ████  Rozet/İlerleme Tutarlılığı
Hafta 7                                       ██ Yayına Hazırlık Kapısı
```

**Kritik yol:** İçerik → Çok Günlü Altyapı + Telemetri → Parametre Doğrulaması → Yayına Hazırlık. Geri kalanı bu hatta paralel yürüyebilir.

## Prensipler (her birimde geçerli)

1. **Tahmin etme, ölç.** Her parametre değişikliği bir telemetri event'iyle desteklenmeli.
2. **Küçük, geri alınabilir adımlar.** Büyük parametre sıçramaları yerine kademeli ayar.
3. **İçerik önce.** Motor ne kadar iyi olursa olsun, yakıtı yoksa hiçbir şey ifade etmiyor.
4. **Cihazda gördüm ≠ doğru.** Tek oturumluk manuel test, çok günlük gerçek kullanımın yerini tutmaz.

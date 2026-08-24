# Birim 12 — Yayına Hazırlık Kapısı

**Öncelik:** Son adım — diğer tüm birimlerin toplandığı kontrol listesi

## Amaç

Bu dosya bir "birim" değil, bir **kapı**. Diğer 11 birimden hangilerinin yayın için **zorunlu**, hangilerinin **yayından sonra da sürebilir** olduğunu netleştirir. Hiçbir yazılım "tamamen bitmiş" olmaz — burada amaç, "yeterince hazır" ile "hâlâ eksik ama kabul edilebilir" arasındaki çizgiyi bilinçli çizmek.

## Zorunlu (yayın öncesi kapatılmalı)

| Birim | Neden zorunlu |
|---|---|
| [01 — İçerik Genişletme](01-content-expansion.md) — en az A2 250+ kelime | İçeriksiz uygulama yayınlanamaz, bu tartışmasız |
| [01.2 — Şablon cümlelerin temizlenmesi](01-content-expansion.md#12--a1in-315-şablon-cümlesini-gerçek-cümlelerle-değiştir-p1-1-hafta) | Kullanıcı karşısına "Learn and use the word 'x'..." çıkması profesyonel değil |
| [06 — Sessiz Davranış Boşlukları](06-behavior-messaging-gaps.md) | Küçük efor, kullanıcı güvenini doğrudan etkiliyor |
| [09 — Erişilebilirlik](09-accessibility.md) | Yasal/etik asgari, mağaza politikaları da bunu bekleyebilir |
| [05 — Telemetri (temel event seti)](05-telemetry-analytics.md) | Yayın sonrası kör uçmamak için minimum şart |

## Güçlü tavsiye (yayın öncesi olsa iyi olur, olmazsa da göz göre göre risk alınmış olur)

| Birim | Risk, yapılmazsa |
|---|---|
| [04 — Çok Günlü Doğrulama](04-multiday-verification.md) | Mastery/terfi/bahçe zinciri production'da ilk kez gerçek kullanıcılarda test edilmiş olur |
| [07 — Senkron Sağlamlığı](07-sync-robustness.md) | Çoklu cihaz kullanan ilk kullanıcılar veri kaybı yaşayabilir |
| [11 — Rozet/İlerleme Tutarlılığı (11.1 matris)](11-badge-progression-consistency.md) | Kullanıcı dört farklı ilerleme göstergesi arasında çelişki fark edip güven kaybedebilir |

## Yayından sonra da sürebilir (iteratif)

| Birim | Neden ertelenebilir |
|---|---|
| [02 — Parametre Doğrulaması](02-parameter-validation.md) | Zaten gerçek veri gerektiriyor, sadece yayından sonra mümkün |
| [03 — SRS Algoritması v2](03-srs-algorithm-v2.md) | Mevcut ikili model "yetersiz ama çalışır", risk/getiri düşük |
| [08 — Migration Temizliği](08-migration-cleanup.md) | Teknik borç, kullanıcı deneyimini etkilemiyor |
| [10 — Oyun Çeşitliliği](10-game-variety-and-content-quality.md) | 10.1 (çeldirici rastgeleleştirme) hariç, çoğu içerik derinliği geldikçe daha anlamlı olur |

## Yayın öncesi son kontrol listesi (checklist)

```
İçerik
[ ] A2 ≥ 250 kelime, isLevelReady("A2") === true
[ ] A1'in tüm örnek cümleleri gerçek (şablon değil)
[ ] validateQuestionDatabase() 0 hata veriyor

Davranış tutarlılığı
[ ] Tekrar borcu limiti mesajı görünüyor
[ ] Ana ekran / İlerleme ekranı / Pratik Merkezi aynı sayıları gösteriyor
[ ] Terfi kutlaması, hazır olmayan seviyede doğru "yakında" mesajı veriyor

Erişilebilirlik
[ ] TalkBack ile 5 ana akış test edildi
[ ] Dinamik yazı tipi maksimumda kesilme yok
[ ] Accessibility Scanner kritik bulgusu yok

Telemetri
[ ] Temel event seti (05-telemetry-analytics.md §5.2) production'da tetikleniyor
[ ] En az bir retention dashboard'u kurulu

Kalite kapıları
[ ] npm run typecheck — 0 hata
[ ] npm test — tüm testler geçiyor
[ ] Gerçek cihazda release build kurulup ana akışlar (onboarding → pratik → tekrar → ilerleme → seviye değiştirme) uçtan uca denendi

Hukuki/Politik
[ ] Gizlilik politikası telemetri toplama ile güncel
[ ] (Varsa) mağaza politikalarına uygunluk kontrolü
```

## Yayın sonrası ilk 30 gün planı

1. **Hafta 1**: Telemetri verisini izle, kritik hata/çökme olmadığından emin ol (bu bir crash-reporting konusu, bu roadmap'in kapsamı dışında ama unutulmamalı — Firebase Crashlytics zaten kurulabilir).
2. **Hafta 2-3**: [02 — Parametre Doğrulaması](02-parameter-validation.md) için ilk veri birikimi, retention/funnel raporlarını (05.3) gözden geçir.
3. **Hafta 4**: İlk parametre ayarı (muhtemelen tekrar borcu limiti veya terfi eşiği) — veriye dayalı, tek parametre, izlemeye devam.
4. Bu noktadan sonra [00-INDEX.md](00-INDEX.md)'deki kalan birimler öncelik sırasına göre sürekli iyileştirme döngüsüne girer.

## Bu doküman ne değildir

Bu bir "her şey mükemmel olmadan yayınlama" listesi değil. **Hiçbir yazılım parametresi gerçek kullanıcı olmadan doğrulanamaz** — bu yüzden Birim 2 ve 3 kasıtlı olarak "yayından sonra" kategorisinde. Asıl disiplin, hangi eksikliklerin **bilinçli kabul edildiğini** ve hangilerinin **kapatılmadan geçilemeyeceğini** net ayırmak.

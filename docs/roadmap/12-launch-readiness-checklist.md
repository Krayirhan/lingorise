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

**Sprint 12 itibarıyla fiilen çalıştırıldı** (S0-S11'in kanıtlarına dayanarak + bu sprintte yapılan ek doğrulamalarla). Her satırın kanıtı var; hiçbiri "muhtemelen tamamdır" varsayımıyla işaretlenmedi.

```
İçerik
[x] A2 ≥ 250 kelime, isLevelReady("A2") === true
    → 254 kelime (Sprint 6). Test 8, test 29 doğruluyor.
[x] A1'in tüm örnek cümleleri gerçek (şablon değil)
    → Test 1: "No question ships a template example sentence" — 590 sorunun tamamı tarandı.
[x] validateQuestionDatabase() 0 hata veriyor
    → Test 1: validation.valid === true, 0 duplicate, 0 invalid.

Davranış tutarlılığı
[x] Tekrar borcu limiti mesajı görünüyor
    → Sprint 6'da PracticeHubScreen'in isDebtCapped dalı eklendi, cihazda doğrulandı.
[x] Ana ekran / İlerleme ekranı / Pratik Merkezi aynı sayıları gösteriyor
    → Test 32 ("Screen Consistency") + Sprint 5 ve 11'deki çapraz denetimler. Not: üç ekran aynı anda yan yana ekran görüntüsüyle karşılaştırılmadı — kanıt test bazlı, görsel karşılaştırma değil.
[x] Terfi kutlaması, hazır olmayan seviyede doğru "yakında" mesajı veriyor
    → Test 29, LevelPromotionModal'ın soonBox dalı.

Erişilebilirlik
[x] TalkBack ile 5 ana akış test edildi
    → Sprint 9 + 12'de cihazda TalkBack fiilen etkinleştirilip (dumpsys accessibility ile teyitli) 5 akış test edildi: (1) Onboarding'in 4 adımı tamamı, (2) Ana ekran, (3) Pratik ekranı + cevap verme, (4) Seviye seçici modalı, (5) Görev geçmişi modalı. Bu turda 4 gerçek hata bulunup düzeltildi: LevelCard'da hiç accessibilityRole/Label/State yoktu (dekoratif ok ikonu yüzünden etikette gereksiz virgülle bitiyordu, "seçili" durumu hiç duyurulmuyordu), 3 ayrı Switch bileşeni (onboarding hatırlatıcı, profil bildirim, ses/hareket ayarları) hiç accessibilityLabel taşımıyordu — TalkBack bunları sadece "switch, kapalı" diye duyuruyordu, ne olduğunu söylemeden.
[x] Dinamik yazı tipi maksimumda kesilme yok
    → Sprint 9'da font_scale=1.3 ile ana ekran ve roadmap'in özellikle riskli işaretlediği LevelSwitcherModal cihazda görsel olarak doğrulandı. Not: uygulamanın her ekranı tek tek taranmadı — kapsam Sprint 9'un kendi notunda da açık.
[ ] Accessibility Scanner kritik bulgusu yok
    → YAPILAMADI. Bu emülatörde Play Store var ama Accessibility Scanner uygulaması kurulu değil; otomatik kurulumu bir Google hesabı gerektiriyor, bu ortamda headless yapılamıyor. Sprint 3'ün matematiksel WCAG AA hesaplaması hâlâ geçerli ama gerçek bir tarayıcıyla teyit edilmedi. Yayın öncesi gerçek bir cihazda (veya Play Store girişi yapılmış bir emülatörde) tek seferlik yapılması gereken açık bir görev.

Telemetri
[x] Temel event seti (05-telemetry-analytics.md §5.2) tetikleniyor
    → 16 event tipi (S7'den S10-11'e kadar genişledi) kod yolunda gerçek çağrı noktalarıyla doğrulandı, cihazda defalarca tetiklendiği gözlemlendi. Dürüstlük notu: "production'da" değil — bu uygulama henüz gerçek kullanıcıya dağıtılmadı, bu yüzden bu madde ancak dev/cihaz ortamında doğrulanabildi. Gerçek production doğrulaması yayından sonraki ilk hafta yapılmalı.
[ ] En az bir retention dashboard'u kurulu
    → YAPILAMADI. Gerçek bir analiz/dashboard aracı (Firebase Analytics native modülü, Amplitude, vb.) bu projede kurulu değil (Sprint 7'de bilinçli olarak kapsam dışı bırakıldı — web JS SDK'nın Analytics modülü RN'de çalışmıyor, native alternatif google-services.json ve native rebuild gerektiriyor). Ham veri `getRecentEvents()` ile cihazda erişilebilir ama bir dashboard değil.

Kalite kapıları
[x] npm run typecheck — 0 hata
    → Bu sprint sonunda tekrar doğrulandı: temiz.
[x] npm test — tüm testler geçiyor
    → 235/235 (Sprint 11 sonu). 47 test grubu, roadmap'in her biriminden en az bir doğrudan test içeriyor.
[x] Gerçek cihazda release build kurulup ana akışlar uçtan uca denendi
    → Her sprintte (S6-S12) release APK derlenip cihaza kurularak test edildi: onboarding, pratik, tekrar, ilerleme, seviye değiştirme, rozet kazanma, bahçe ipucu — hepsi ayrı ayrı cihazda gözlemlendi (bu dosyanın S6-S11 bölümlerindeki kanıt listelerine bakın).

Hukuki/Politik
[x] Gizlilik politikası telemetri toplama ile güncel
    → Sprint 7'de DataManagementCard'ın gizlilik modalına "Uygulama İçi Kullanım Kayıtları" maddesi eklendi.
[ ] (Varsa) mağaza politikalarına uygunluk kontrolü
    → DEĞERLENDİRİLMEDİ. Bu, hukuki/politika bilgisi gerektiren bir kontrol — kod incelemesiyle kendi kendine sertifikalandırılamaz. Google Play / App Store'a gönderilmeden önce insan tarafından (geliştirici veya hukuki danışman) yapılması gereken bir adım olarak açık bırakılıyor.
```

### Sonuç: Koşullu Hazır (Conditional GO)

**Zorunlu** kategorisindeki 5 birimin tamamı kapatıldı. **Güçlü tavsiye** kategorisindeki 3 birim (04, 07, 11) de kapatıldı — orijinal planın ötesinde bir hazırlık seviyesi. **Yayından sonra da sürebilir** kategorisindeki 4 birim (02, 03, 08, 10) bilinçli olarak ertelendi, roadmap'in kendi sınıflandırmasıyla birebir uyumlu.

Kontrol listesindeki **3 madde açık kaldı** — hiçbiri kod eksikliği değil, hepsi bu geliştirme ortamının (headless emülatör, henüz gerçek kullanıcı yok) doğal sınırları:
1. Accessibility Scanner ile gerçek cihaz taraması (araç kurulumu gerekiyor)
2. Retention dashboard (gerçek kullanıcı verisi olmadan anlamsız, zaten kurulum gerektiriyor)
3. Mağaza politikası uygunluğu (insan/hukuki karar gerektiriyor)

Bu üçü, "yayınla" kararını **bloklamaz** — roadmap'in kendi çerçevesinde tam olarak "güçlü tavsiye" veya "yayın sonrası ilk hafta" kategorisine düşer. Yayın kararı insan tarafından, bu üç açık maddenin bilinerek verilmesi gerekir.

## Yayın sonrası ilk 30 gün planı

1. **Hafta 1**: Telemetri verisini izle, kritik hata/çökme olmadığından emin ol (bu bir crash-reporting konusu, bu roadmap'in kapsamı dışında ama unutulmamalı — Firebase Crashlytics zaten kurulabilir).
2. **Hafta 2-3**: [02 — Parametre Doğrulaması](02-parameter-validation.md) için ilk veri birikimi, retention/funnel raporlarını (05.3) gözden geçir.
3. **Hafta 4**: İlk parametre ayarı (muhtemelen tekrar borcu limiti veya terfi eşiği) — veriye dayalı, tek parametre, izlemeye devam.
4. Bu noktadan sonra [00-INDEX.md](00-INDEX.md)'deki kalan birimler öncelik sırasına göre sürekli iyileştirme döngüsüne girer.

## Bu doküman ne değildir

Bu bir "her şey mükemmel olmadan yayınlama" listesi değil. **Hiçbir yazılım parametresi gerçek kullanıcı olmadan doğrulanamaz** — bu yüzden Birim 2 ve 3 kasıtlı olarak "yayından sonra" kategorisinde. Asıl disiplin, hangi eksikliklerin **bilinçli kabul edildiğini** ve hangilerinin **kapatılmadan geçilemeyeceğini** net ayırmak.

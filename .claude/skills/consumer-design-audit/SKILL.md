---
name: consumer-design-audit
description: LingoRise ekranlarını gerçek tüketici algısı açısından değerlendirir — teknik UI denetimi değil, "hedef kullanıcı bunu sever mi, kullanmak ister mi, premium bulur mu, akılda kalır mı" sorusuna cevap verir. `/consumer-design-audit` ile manuel çağrılır.
disable-model-invocation: true
---

# Consumer Design Audit

Ana soru: *"Normal bir hedef kullanıcı bu ürünü görse sever mi, kullanmak ister mi, kaliteli/premium bulur mu, aklında kalır mı ve rakipler yerine bunu seçmesi için tasarımda ne değişmeli?"*

**Temel felsefe:** Technically correct does not mean consumers will like it. Doğru spacing, doğru contrast, doğru touch target sahibi bir UI; sıkıcı, jenerik, çocukça, soğuk, ucuz, AI-template veya karakterden yoksun görünebilir ve consumer score düşük olabilir. Technical compliance bu audit'in ana belirleyicisi DEĞİLDİR.

Bu skill application code'u değiştirmez. Yalnız READ-ONLY değerlendirme yapar — kullanıcı özellikle "record", "baseline oluştur", "raporu kaydet" demedikçe dosya/artifact üretmez.

## Önce

Non-trivial bir audit öncesi `project-scope-gate` mantığıyla gereksiz araç çağrısından kaçın (bkz. `ai-tool-router`). Firebase/GitHub/Semgrep/Serena/Context7 bu task için gerekmiyorsa çağırma.

## Mod seç

Kullanıcı belirtmediyse **STANDARD**. Detaylar: [references/research-protocol.md](references/research-protocol.md) § Mod bazlı derinlik.

- **QUICK** — tek ekran, mevcut artifact, web araştırması yok.
- **STANDARD** (default) — ana ekran/flow, gerekirse Figma + Maestro, 3-5 rakip.
- **DEEP** — kullanıcı açıkça isterse: tüm core screens, geniş araştırma, cross-screen consistency.

## Kanıt sırası

REAL PRODUCT (Maestro) > DESIGN SOURCE (Figma) > PRODUCT CONTEXT > COMPETITOR EVIDENCE > USER VOICE > DESIGN EXPERTISE (`design-taste` skill). Tam protokol ve token hygiene kuralları: [references/research-protocol.md](references/research-protocol.md).

`design-taste` skill'i ana puanlayıcı DEĞİLDİR — yalnız visual taste, aesthetic direction, brand distinctiveness ve AI/generic-template anti-pattern (`design-taste/reference/anti-slop.md`) konusunda uzman referans olarak kullanılır. REAL PRODUCT (gerçek emulator/device state) ve gerçek hedef kullanıcı kanıtı (user voice, product context) her zaman `design-taste` skill'inin genel görüşünden üstündür — ikisi çelişirse gerçek kanıt kazanır, `design-taste`'in önerisi not olarak düşülür ama skoru değiştirmez.

`design-taste` skill'i web/CSS ekosistemine göre yazılmıştır (Playwright, Tailwind, CSS `clamp()`/`@container`, web breakpoint'leri gibi). LingoRise React Native/Expo projesidir — bu skill'den yalnız taşınabilir taste prensiplerini al (renk stratejisi, tipografi karakteri, spacing ritmi, anti-slop kalıpları, brand yönü); CSS-specific veya web-only teknik önerileri (Tailwind sınıfları, `clamp()`, Playwright screenshot akışı, web breakpoint sayıları) körlemesine RN bağlamına taşıma. RN'de gerçek doğrulama Maestro/emulator screenshot ile yapılır, Playwright değil.

## Hedef kitle ayrımı

"Halk sever mi" ifadesini herkese hitap etme olarak yorumlama. Önce LingoRise'ın gerçek hedef kullanıcısını belirle. TARGET USER APPEAL ve BROAD MARKET APPEAL ayrı değerlendirilir; ana Consumer Appeal skoru TARGET USER APPEAL'i esas alır.

## Rakip araştırması sınırı

Rakipleri incele, kopyalama. Rakipte işe yarayan mekanizmayı soyutla, LingoRise'ın kendi brand diliyle nasıl çözülebileceğini öner. Detay: [references/research-protocol.md](references/research-protocol.md).

## Puanlama

Tam rubric (CONSUMER-RUBRIC-v1.0, 100 puan + ayrı AI/TEMPLATE RISK metriği): [references/rubric.md](references/rubric.md). Bu rubric sessizce değiştirilmez; aynı versiyonla yapılan auditler karşılaştırılabilir olmalı.

## Öneri kalitesi

Her TOP CHANGES maddesi için IMPACT / CONFIDENCE / EFFORT / EVIDENCE belirt. Sahte kesinlik iddiası ("+7.3 puan artırır") üretme; bunun yerine "expected impact HIGH, confidence MEDIUM" kullan.

## Bağımsız reviewer

Audit tamamlandıktan sonra `consumer-design-reviewer` subagent'ını çağır. Ham repo taraması yaptırma — yalnız audit'in evidence pack'ini (rubric skorları, kanıt kaynakları, önerilen değişiklikler) ver ve AGREE/ADJUST/REJECT verdict'i al. Verdict'i rapora kısa not olarak ekle.

## Çıktı formatı

Tam şablon: [references/output-template.md](references/output-template.md). Özet sırası: skor özeti → scorecard → WHAT WORKS → WHAT HURTS APPEAL → TOP CHANGES → DO NOT CHANGE → COMPETITOR INSIGHT → USER VOICE → EXPECTED DIRECTION.

## Audit history

Varsayılan davranış READ-ONLY'dir. Kayıt politikası moda göre değişir: QUICK asla kaydetmez; STANDARD yalnız kullanıcı "record/kaydet/baseline oluştur" derse kaydeder; DEEP tamamlandığında otomatik kaydeder (kullanıcı açıkça "kaydetme/read-only" demedikçe). Audit yarım kaldıysa (emulator yok, evidence eksik, iptal) hiçbir modda kayıt oluşturma. Kayıt yapılacaksa klasör yapısı, run numaralama, immutability, revision doğruluğu ve SUMMARY.md şablonu için: [references/history-protocol.md](references/history-protocol.md) — bu dosyayı yalnız bir kayıt işlemi tetiklendiğinde yükle.

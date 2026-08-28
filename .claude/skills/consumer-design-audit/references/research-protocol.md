# Research Protocol

## Kanıt sırası (mümkün olan en gerçek kanıtı tercih et)

1. **REAL PRODUCT** — gerçek emulator/device ekranı ve gerçek navigation state. Gerekirse Maestro MCP ile uygulamayı çalıştır ve ekran görüntüsü al. Sabit/statik screenshot değil, gerçek çalışan state tercih edilir.
2. **DESIGN SOURCE** — Figma link/source kullanıcı tarafından verildiyse Figma MCP (`get_design_context`, `get_screenshot`).
3. **PRODUCT CONTEXT** — ürünün amacı, hedef kullanıcısı, mevcut marka dili (CLAUDE.md, mevcut i18n/copy, brand karakteri).
4. **COMPETITOR EVIDENCE** — gerçek rakip ürünler (bkz. aşağı).
5. **USER VOICE** — App Store / Play Store / Reddit / güvenilir kullanıcı yorumları.
6. **DESIGN EXPERTISE** — `design-taste` skill'i (yalnız visual taste / anti-slop / brand distinctiveness referansı olarak).

Kod yalnız kullanıcıya görünen davranışı anlamak gerektiğinde okunur (örn. bir ekranın hangi state'leri olduğunu anlamak için `screens/`, `features/*/components` kısaca taranabilir) — tüm UI source'unu okuma, screenshot/Figma yeterliyse onu tercih et.

## Rakip/kopyalama sınırı

Rakipleri incele ama **kopyalama**. Yanlış: "Duolingo yeşil → LingoRise da yeşil olsun." Doğru: rakipte işe yarayan mekanizmayı soyutla ("ilerlemenin görünürlüğü motivasyonu destekliyor"), sonra LingoRise'ın kendi brand diliyle (garden/sprig teması) nasıl çözülebileceğini öner.

## Market/user research — STANDARD mod

- 3-5 gerçekten alakalı rakip seç (dil öğrenme kategorisinde — örn. Duolingo, Babbel, Busuu, Memrise, Drops — task'a göre daralt).
- Rakiplerin güncel ürün ekranlarını/konumlandırmasını incele (WebSearch / WebFetch; gerekirse App Store/Play Store sayfaları).
- Mümkünse olumlu ve olumsuz gerçek kullanıcı görüşlerini araştır (App Store, Google Play, Reddit, güvenilir review kaynakları).
- Tek bir viral/aşırı yorumu genel kullanıcı görüşü gibi sunma.
- Tekrar eden theme/pattern ara; yeterli thematic saturation oluşunca (aynı tema 2-3 farklı kaynakta tekrar ediyorsa) araştırmayı durdur.
- Aynı rakibi birden fazla kez araştırma; bir audit içinde her rakip için tek geçiş yeterli.

## Mod bazlı derinlik

- **QUICK** — tek ekran, mevcut artifact/screenshot, web araştırması yok. Hızlı consumer impression.
- **STANDARD** (default) — ana ekran/flow, gerekiyorsa Figma + Maestro, 3-5 rakip, sınırlı user-voice research.
- **DEEP** — kullanıcı açıkça istediğinde: tüm core screens, geniş rakip ve kullanıcı araştırması, cross-screen consistency, consumer positioning.

## Token hygiene

- Screenshot/Figma varken tüm UI source'unu okuma.
- İstenmeden competitor research yapma (QUICK modda hiç yapma).
- Aynı rakibi tekrar tekrar araştırma.
- Yeterli evidence oluşunca dur — thematic saturation bir stop sinyalidir, tam kapsama değil.
- Yalnız consumer impact'i olan teknik konuyu değerlendirmeye dahil et; ilgisiz teknik detaya girme.

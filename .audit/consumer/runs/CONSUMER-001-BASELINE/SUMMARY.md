# CONSUMER-001-BASELINE

## Audit Identity

- **Run ID:** CONSUMER-001-BASELINE
- **Date/time:** 2026-08-28
- **Revision:** working tree on top of `5e09358` (dirty). Uncommitted changes present at audit time in `src/app/AppNavigator.tsx`, `src/features/home/components/GardenHeroCard.tsx`, `src/features/home/home.types.ts`, `src/features/home/hooks/useHomeViewModel.ts`, `src/i18n/home.ts`, `src/i18n/practice.ts`, `src/screens/HomeScreen.tsx`, `src/screens/PracticeHubScreen.tsx`, `src/state/useAppSession.ts`, `tests/testSuite.ts` and various `.audit/state/*` files — these were part of the app's in-progress work at the time, **evaluated as-is on the built APK running on the emulator**, not certified as a different (e.g. clean/committed) revision.
- **Mode:** DEEP
- **Scope:** Tüm core ekranlar (Onboarding, Home/Garden, Practice Hub, Quiz oturumu, Progress, Profile, Auth) + sistem dialogları
- **Rubric version:** CONSUMER-RUBRIC-v1.0
- **Consumer Appeal:** 70/100
- **AI/Template Risk:** 18/100
- **Target Fit:** STRONG
- **Confidence:** HIGH

## Evidence

| Kanıt türü | Kullanıldı mı | Not |
|---|---|---|
| REAL PRODUCT | ✅ Kullanıldı | Birincil kanıt. Bağlı Android emulator (`emulator-5554`, Pixel 9 Pro) üzerinde Maestro ile alınan gerçek ekran görüntüleri ve gerçek navigation state. `adb pm clear` ile temiz kurulumdan Onboarding dahil. |
| FIGMA | ❌ N/A | Kullanıcı bir Figma dosyası/linki sağlamadı; bu audit'te hiç kullanılmadı. |
| COMPETITOR | ✅ Kullanıldı | WebSearch ile Duolingo, Babbel, Busuu, Memrise, Drops — marka imzası, etkileşim mekanizması, repositioning. |
| USER VOICE | ✅ Kullanıldı | App Store/Play Store/Reddit temelli ikincil kaynaklardan, tematik doygunluğa ulaşılana kadar. LingoRise'a özgü canlı kullanıcı geri bildirimi (henüz yok) değil, rakip uygulamalar üzerinden dolaylı kanıt. |
| DESIGN EXPERTISE (design-taste) | ✅ Sınırlı kullanıldı | Yalnız `anti-slop.md` kontrol listesi olarak AI/Template Risk metriğinde. Ana puanlayıcı değil. |
| INFERENCE | ✅ Sınırlı kullanıldı, düşük ağırlıklı | Yalnız doğrudan gözlemden çıkarım gereken birkaç noktada (bkz. Score Loss Ledger) — hiçbiri HIGH confidence almadı. |

Not: Önceki bir kod-tabanlı (REAL PRODUCT olmayan) audit denemesi kullanıcı talimatıyla tamamen reddedildi ve bu baseline'a hiçbir şekilde anchor edilmedi.

## Screens Observed

Yalnız gerçekten gözlemlenen ekranlar/durumlar listelenir:

1. Onboarding — Adım 1/4 (Hoş geldin, mascot)
2. Onboarding — Adım 2/4 (Günlük hedef seçimi, mascot yok)
3. Onboarding — Adım 3/4 (Seviye seçimi, mascot yok)
4. Onboarding — Adım 4/4 (Misafir/Hesap seçimi, mascot)
5. Home (Garden) — aktif ilerleme durumu (1/20, 2/20, 3/30 kelime)
6. Home (Garden) — boş/fresh state ("Öğrenmeye hazır mısın?")
7. Practice Hub
8. Quiz oturumu — soru ekranı
9. Quiz oturumu — doğru cevap feedback
10. Quiz oturumu — yanlış cevap feedback
11. Sistem dialog — "Pratikten çıkmak istiyor musun?" (exit-practice confirm)
12. Progress (İlerleme) — üst bölüm (stats + hero + haftalık aktivite)
13. Progress (İlerleme) — alt bölüm (seviye/konu yetkinliği + rozet koleksiyonu)
14. Profile — üst bölüm (avatar, hesap, dil)
15. Profile — alt bölüm (bildirimler, ses/animasyon, veri/gizlilik, hakkında)
16. Sistem dialog — "Verileri Sıfırla" (reset-data confirm)
17. Sistem dialog — "Başarılı / Yerel veriler sıfırlandı" (success alert)
18. Auth/Kayıt ekranı

**Gözlemlenmeyen** (görüldü diye yazılmadı): level-up/promotion modal, badge-unlock celebration animasyonu, level switcher modal, "coming soon" ekranı, kelime detay modalı, quest history ekranı, sınav (exam) akışı, GameScreen (PracticeScreen ile aynı akış varsayıldı, ayrıca doğrulanmadı).

## Full Scorecard

CONSUMER-RUBRIC-v1.0, 100 puan üzerinden:

| Boyut | Puan | Max |
|---|---|---|
| First impression / first 3 seconds | 12 | 15 |
| Visual attractiveness | 10 | 15 |
| Desire / motivation to use | 7 | 10 |
| Premium / quality perception | 6 | 10 |
| Brand character / memorability | 7 | 10 |
| Immediate clarity | 8 | 10 |
| Flow comfort / cognitive ease | 6 | 10 |
| Competitive differentiation | 6 | 8 |
| Emotional warmth / personality | 4 | 5 |
| Trust perception | 3 | 4 |
| User-visible technical friction | 1 | 3 |
| **TOPLAM** | **70** | **100** |

AI/TEMPLATE RISK: 18/100 (düşük). TARGET FIT: STRONG. BROAD MARKET APPEAL (bilgi amaçlı): MEDIUM.

## Score Loss Ledger

`100 − 70 = 30` puan kayıp. Matematik doğrulaması: Σ(lost) = 3+5+3+4+3+2+4+2+1+1+2 = **30** ✓

| Boyut | Score | Max | Lost | Reasons | Evidence | Confidence | Affected screens |
|---|---|---|---|---|---|---|---|
| First impression | 12 | 15 | 3 | Home'da günlük görevler ve günün kelimesi ilk 3 saniyede görünmüyor, scroll gerektiriyor; kart yoğunluğu ilk bakışı bölüyor | REAL PRODUCT + INFERENCE (yoğunluğun etkisi) | HIGH (gözlem) / MEDIUM (yorum) | Home |
| Visual attractiveness | 10 | 15 | 5 | 3 unstyled sistem dialog; Profile jenerik/maskotsuz; Auth+onboarding adım 2'de aşırı boş alan | REAL PRODUCT | HIGH / HIGH / MEDIUM | Quiz, Profile, Auth, Onboarding |
| Desire / motivation | 7 | 10 | 3 | Practice Hub config'i CTA'dan önce sunuyor; top bar ile tekrar eden pill satırı | REAL PRODUCT + COMPETITOR (Drops teardown insight) | HIGH / MEDIUM | Practice Hub |
| Premium / quality perception | 6 | 10 | 4 | Unstyled dialoglar en yüksek riskli anlarda; jenerik Profile; siyah CTA'ların sıcak palete göre "soğuk" hissi | REAL PRODUCT / REAL PRODUCT / INFERENCE | HIGH / HIGH / LOW | Quiz, Profile, Onboarding |
| Brand character | 7 | 10 | 3 | Maskot Profile'da ve onboarding 2-3'te yok (8 gözlemden 2'sinde eksik); Memrise'in benzer metaforu | REAL PRODUCT / COMPETITOR + INFERENCE (dilution derecesi) | HIGH / MEDIUM | Profile, Onboarding |
| Immediate clarity | 8 | 10 | 2 | Practice Hub'da hedefe ulaşmadan önce iki ayrı karar noktası (süre + yön) | REAL PRODUCT | MEDIUM | Practice Hub |
| Flow comfort | 6 | 10 | 4 | Practice Hub sıralaması; tekrar eden pill satırı; sistem dialoglarının akışı native chrome'a ani kesmesi | REAL PRODUCT | HIGH / HIGH / HIGH | Practice Hub, Quiz, Profile |
| Competitive differentiation | 6 | 8 | 2 | Memrise'in aynı kategori metaforunu zaten kullanması; dilution derecesi | COMPETITOR + INFERENCE | HIGH (gözlem) / MEDIUM (yorum) | — (pozisyonlama, ekrana özgü değil) |
| Emotional warmth | 4 | 5 | 1 | Maskotun onboarding boyunca tutarsız görünmesi sürekli sıcaklığı hafifçe kesiyor | REAL PRODUCT | MEDIUM | Onboarding |
| Trust perception | 3 | 4 | 1 | Geri alınamaz veri-sıfırlama kararında unstyled onay dialogu, iyi şeffaflık copy'sine rağmen | REAL PRODUCT | HIGH | Profile |
| User-visible technical friction | 1 | 3 | 2 | 3 ayrı unstyled sistem dialogu, cihazda doğrudan 3 kez doğrulandı — en az çıkarımsal bulgu | REAL PRODUCT | HIGH | Quiz, Profile |

**Kanıt türüne göre kayıp dağılımı:** REAL PRODUCT ~22-23 puan (baskın kaynak), COMPETITOR ~2-3 puan (Memrise örtüşmesi), salt INFERENCE ~2-3 puan (hepsi LOW/MEDIUM confidence, hiçbiri HIGH almadı). USER VOICE hiçbir puan kaybını doğrudan açıklamadı — yalnız DO NOT CHANGE maddelerini doğrulamak için kullanıldı.

## Screen-by-Screen Assessment

Niteliksel değerlendirme — ayrı bir sayısal rubric değil, yukarıdaki bulguların ekran bazında dağılımı:

| Ekran | Değerlendirme | Gerekçe |
|---|---|---|
| Home (Garden) | **STRONG** | Tutarlı plum hero, mascot, non-punitive progress bar, net CTA; tek eksik ilk-3-saniyede scroll gerekliliği |
| Quiz oturumu | **STRONG** | En iyi duygusal-tasarım uygulaması — su damlası rozeti, sakin ton, örnek cümle bağlamı; rakiplere karşı en net farklılaşma noktası |
| Progress | **GOOD** | Hero ve maskot tutarlı tekrarlanıyor; anlamlı stats + rozet koleksiyonu |
| Auth/Kayıt | **GOOD** | Maskot var, sıcak copy; aşırı boş dikey alan hafif eksiklik |
| Onboarding | **FAIR** | Adım 3 (seviye seçimi) iyi doldurulmuş; adım 2'de boş alan ve maskot süreklilik kaybı |
| Practice Hub | **FAIR** | Config-önce-CTA sıralaması ve tekrar eden pill satırı motivasyonu geciktiriyor |
| Profile | **WEAK** | Tamamen jenerik ayarlar listesi, maskot/marka dili yok — uygulamanın en az marka-belirgin ekranı |
| Sistem dialogları (3x) | **WEAK** | Markanın en keskin gerçek-ürün kopukluğu, en yüksek riskli anlarda beliriyor |

## Findings

### CD-001 — Native unstyled system AlertDialogs
- **Affected screens:** Quiz oturumu (exit-practice confirm), Profile (reset-data confirm, reset-success)
- **Evidence:** REAL PRODUCT — 3 ayrı native Android AlertDialog doğrudan cihazda yakalandı; düz beyaz Material chrome, teal/green metin butonları
- **Root cause:** Bu üç onay/bildirim akışı muhtemelen platform varsayılan `Alert.alert()` (React Native) kullanıyor, markalı modal bileşeni yerine
- **Affected rubric dimensions:** Visual attractiveness, Premium/quality perception, Flow comfort, Trust perception, User-visible technical friction
- **Impact:** HIGH
- **Confidence:** HIGH
- **Effort:** LOW-MEDIUM
- **Status:** OPEN

### CD-002 — Practice Hub hierarchy inversion
- **Affected screens:** Practice Hub
- **Evidence:** REAL PRODUCT (session-length picker + yön anahtarı hero CTA'dan önce; Seviye/XP/streak pill satırı top bar'ı tekrarlıyor) + COMPETITOR (Drops'un kendi teardown'unda config-önce-ödül sıralamasının motive edici ilk izlenimi zayıflattığı işaretlenmiş)
- **Root cause:** Ekran, kullanıcı tercihini önce toplayıp sonra CTA'yı gösterecek şekilde düzenlenmiş; motivasyon kaynağı (hero card) bu tercihlerin altına yerleştirilmiş
- **Affected rubric dimensions:** Desire/motivation, Immediate clarity, Flow comfort
- **Impact:** MEDIUM
- **Confidence:** MEDIUM
- **Effort:** LOW
- **Status:** OPEN

### CD-003 — Mascot/brand continuity gap
- **Affected screens:** Profile, Onboarding adım 2 (günlük hedef), Onboarding adım 3 (seviye seçimi)
- **Evidence:** REAL PRODUCT — maskot gözlemlenen 8 ekran/adımdan 6'sında mevcut, bu 3 noktada yok (Profile geniş anlamda ayrı bir "ekran", onboarding 2 adım aynı akışın parçası)
- **Root cause:** Bu ekranlar muhtemelen daha sonra/ayrı olarak inşa edilmiş, hero-card/mascot deseni bunlara taşınmamış
- **Affected rubric dimensions:** Brand character/memorability, Emotional warmth/personality
- **Impact:** MEDIUM
- **Confidence:** MEDIUM (independent reviewer notu: fayda "brand continuity" gerekçesine dayanıyor, ölçülebilir kullanıcı-değeri kanıtlanmamış)
- **Effort:** LOW-MEDIUM
- **Status:** OPEN

### CD-004 — Memrise garden-metaphor overlap
- **Affected screens:** — (pozisyonlama/konsept seviyesinde, tek bir ekrana özgü değil)
- **Evidence:** COMPETITOR — Memrise, kelime öğrenmeyi "ekme/büyütme" metaforuyla zaten sunuyor
- **Root cause:** LingoRise'ın çekirdek "garden" konsepti, kategori içinde tamamen özgün değil; farklılaşma mekanizma seviyesinde (non-punitive ton, Sprig, plum/cream/gold) sağlanıyor, metafor seviyesinde değil
- **Affected rubric dimensions:** Brand character/memorability, Competitive differentiation
- **Impact:** LOW-MEDIUM
- **Confidence:** MEDIUM (rakip gözlemi gerçek; LingoRise üzerindeki dilution derecesi kısmen çıkarımsal)
- **Effort:** MEDIUM (tek bir UI düzeltmesi değil, sürekli mekanizma-seviyesi farklılaştırma çalışması gerektiriyor)
- **Status:** OPEN

## What Works

- **Sprig maskotu + yanlış cevapta su damlası rozeti** — gerçek cihazda doğrulanmış, cezalandırıcı olmayan başarısızlık durumu; rakip uygulamalardaki #1 tekrar eden şikayete doğrudan, kanıtlanmış bir karşı örnek.
- **Özgün plum/cream/gold palet**, Home/Practice Hub/Progress hero kartlarında tutarlı — hem AI-gradient sloptan hem generic sage-green wellness klişesinden kaçınıyor.
- **Asla amber/kırmızıya dönmeyen ilerleme çubuğu** — loss-aversion renklendirmesinin bilinçli reddi, streak-shaming yorgunluğuna dair kullanıcı-görüşü araştırmasıyla doğrulanmış.

## What Hurts Appeal

- 3 unstyled native sistem dialogu (CD-001) — en keskin gerçek-ürün kopukluğu.
- Practice Hub'ın config-önce-CTA sıralaması ve tekrar eden pill satırı (CD-002).
- Profile'ın tam jenerikliği ve onboarding boyunca maskot süreklilik kaybı (CD-003).

## Change Impact Map

| Finding | Etkilediği boyutlar | Etkilediği ekranlar |
|---|---|---|
| CD-001 | Visual attractiveness, Premium perception, Flow comfort, Trust perception, Technical friction | Quiz, Profile |
| CD-002 | Desire/motivation, Immediate clarity, Flow comfort | Practice Hub |
| CD-003 | Brand character, Emotional warmth | Profile, Onboarding |
| CD-004 | Brand character, Competitive differentiation | (pozisyonlama, ekrana özgü değil) |

## Top Changes

1. **CD-001'i çöz: native AlertDialog'ları markalı modal ile değiştir.** IMPACT: HIGH · CONFIDENCE: HIGH · EFFORT: LOW-MEDIUM · EVIDENCE: REAL PRODUCT (3x doğrulandı).
2. **CD-002'yi çöz: Practice Hub'ı yeniden sırala.** IMPACT: MEDIUM · CONFIDENCE: MEDIUM · EFFORT: LOW · EVIDENCE: REAL PRODUCT + COMPETITOR.
3. **CD-003'ü çöz: maskotu Profile ve onboarding 2-3'e getir.** IMPACT: MEDIUM · CONFIDENCE: MEDIUM · EFFORT: LOW-MEDIUM · EVIDENCE: REAL PRODUCT.

CD-004 bilinçli olarak TOP CHANGES'e dahil edilmedi — tek bir UI değişikliği değil, sürekli bir pozisyonlama/mekanizma farklılaştırma çalışması; ilerleyen reaudit'lerde izlenmeli.

## Do Not Change

- Her zaman pozitif kalan ilerleme çubuğu renklendirmesi ve cezalandırıcı olmayan yanlış-cevap tasarımı.
- Sıcak plum/cream/gold palet.
- Sprig maskot tasarımı ve sesi/tonu.

## Competitor Insights

- **Duolingo**: maskot-odaklı akılda kalıcılık "kaotik" bir kişilikte bile işliyor — LingoRise bu kaldıraca Sprig ile zaten sahip; eksik tutarlılık, kavram değil.
- **Babbel/Busuu**: gamification baskısından kaçınmak yetişkin öğreniciler için geçerli bir premium konumlandırma.
- **Memrise**: zaten "kelime ekme" garden-growth metaforunu kullanıyor — gerçek örtüşme riski (CD-004).
- **Drops**: tek bir kelimeyi küçük, tasarlanmış bir an olarak ele alıyor — Günün Kelimesi kartını güçlendirmek için ilgili.

## User Voice

Tematik doygunluğa ulaşıldı: (pozitif) görünür ilerleme/streak gururu, kişilikli maskot bağlılığı, düşük bilişsel yük, yapılandırılmış "amaçlı" kurs tasarımı, öğrenme birimi başına görsel keyif. (negatif) cezalandırıcı fail-state'ler, agresif reklam/paywall, streak-kaybı suçluluğu, özellik düzleştirme, gerçek ustalık hissine bağlı olmayan gamification'ın gimmick algılanması.

## AI / Template Risk Analysis

**Skor: 18/100** (düşük). `anti-slop.md` kontrol listesine göre: AI-gradient hero YOK, generic sage-green wellness YOK, generic card grid YOK, maskot özgün el illüstrasyonu. Ana risk noktası: sistem varsayılanı markalanmamış AlertDialog kullanımı — klasik "AI-template" göstergesi değil ama "işi bitirmemiş" izlenimi veren lokalize bir tutarsızlık.

## Strongest Screen

**Quiz oturumu** — en iyi duygusal-tasarım uygulaması, rakiplere karşı en net, kanıtlanmış farklılaşma noktası.

## Weakest Screen

**Sistem dialogları (3x)** — markanın en keskin, en yüksek riskli anlarda ortaya çıkan gerçek-ürün kopukluğu.

## Biggest Cross-Screen Inconsistency

Aynı kırık desen (unstyled native AlertDialog) hem Quiz akışında hem Profile akışında — iki tamamen farklı özellik alanında — aynı şekilde tekrarlanıyor. Bu, tek bir ekrana özgü bir kusurdan çok, uygulama genelinde markalı modal bileşeni bulunmadığına işaret eden sistemik bir tutarsızlık.

## Path to 80

CD-001 (branded dialogs) tek başına çözülürse: en geniş etki alanına sahip bulgu (5 boyutu etkiliyor: visual attractiveness, premium perception, flow comfort, trust perception, technical friction). Expected impact: HIGH, confidence: MEDIUM. **Garanti bir puan artışı yok** — gerçek hareket ancak bir reaudit ile doğrulanabilir.

## Path to 85

CD-001 + CD-002 birlikte çözülürse: yukarıdakine ek olarak desire/motivation ve immediate clarity boyutları da etkilenir. Expected impact: HIGH (birleşik), confidence: MEDIUM. **Garanti bir puan artışı yok.**

## Path to 90

CD-001 + CD-002 + CD-003 çözülür ve CD-004 için mekanizma-seviyesi farklılaştırma çalışması (örn. Sprig'in mastery ile ilişkisinin daha görünür kılınması) yapılırsa: brand character ve competitive differentiation boyutları da etkilenir. Expected impact: MEDIUM-HIGH, confidence: LOW-MEDIUM (CD-003/CD-004 faydası daha çok çıkarımsal, doğrudan ölçülmüş değil). **Garanti bir puan artışı yok** — bu bir tavan değil, olası bir yörüngedir.

## Why Not Higher

Üç somut, doğrulanmış kusur (3x unstyled sistem dialogu, Practice Hub sıralama tersine dönmesi, tamamen jenerik Profile ekranı) uygulamanın en yüksek riskli/en sık kullanılan anlarında ortaya çıkıyor ve 5 farklı rubric boyutunu aynı anda etkiliyor. Bunlar temel marka çalışmasının zayıflığından değil, birkaç yoğunlaşmış, düzeltilebilir noktadan kaynaklanıyor — ama bu noktalar tam olarak kullanıcının güven/kalite algısını test ettiği anlarda.

## Why Not Lower

Çekirdek farklılaştırıcılar (non-punitive tasarım, özgün palet, 6/8 ekranda tutarlı maskot, net CTA'lar) gerçek, kanıtlanmış ve rakiplerdeki en sık şikayetlere doğrudan karşı duruyor. Bu jenerik veya kötü uygulanmış bir ürün değil — sistemik değil, az sayıda yoğunlaşmış kusuru olan, temelde güçlü bir marka çalışması.

## Independent Reviewer Verdict

**Verdict: ADJUST** (`consumer-design-reviewer` subagent). Skorlama ve üç TOP CHANGE önerisi kanıta dayalı ve DO NOT CHANGE listesiyle çelişmediği doğrulandı. Tek düzeltme: Trust perception (3/4) boyutunun gerekçesi ilk pass'te evidence pack'te açıkça karşılanmamıştı — bu SUMMARY'de (§ Score Loss Ledger, Trust perception satırı) somut kanıtla (yerel-öncelikli şeffaflık copy'si + görünür yedekleme/gizlilik kontrolleri, unstyled reset-onay dialoguyla dengelenmiş) tamamlanarak düzeltildi. Rakip kopyalama riski bulunmadı; kanıtsız/sahte kesinlik iddiası bulunmadı; TOP CHANGES ile DO NOT CHANGE arasında çelişki bulunmadı.

## Known Limitations

- Şu durumlar bu oturumda tetiklenmedi/gözlemlenmedi: level-up/promotion modal, badge-unlock celebration animasyonu, level switcher modal, "coming soon" ekranı, kelime detay modalı, quest history ekranı, sınav (exam) akışı.
- Kullanıcı-görüşü araştırması ikincil/genel kaynaklardan yapıldı (App Store/Play Store/Reddit temaları) — LingoRise'a özel canlı kullanıcı geri bildirimi mevcut değil.
- Tek bir cihaz/form faktöründe (Pixel 9 Pro emulator, Android) gözlem yapıldı; farklı ekran boyutları veya iOS'ta görsel tutarlılık doğrulanmadı.
- CD-003 ve CD-004 için fayda gerekçesi kısmen çıkarımsal (brand continuity, dilution derecesi) — ölçülebilir kullanıcı-değeri kanıtı yok, bu nedenle her ikisi de CONFIDENCE: MEDIUM ile işaretli, HIGH değil.
- Çalışma ağacı audit anında temiz değildi (bkz. Audit Identity § Revision) — değerlendirilen build, bu uncommitted değişiklikleri içeren haldeydi.

## Reaudit Criteria

1. Rubric versiyonu aynı kalmalı (CONSUMER-RUBRIC-v1.0) — değiştiyse sayısal delta karşılaştırılamaz, bkz. `references/history-protocol.md` § Rubric version mismatch.
2. Reaudit REAL PRODUCT kanıtına dayanmalı (kod-tabanlı bir reaudit bu baseline ile karşılaştırılamaz).
3. Reaudit, CD-001 → CD-004 finding'lerinin durumunu (OPEN/CLOSED) özellikle kontrol etmeli ve etkilenen ekranları yeniden gözlemlemeli.
4. DO NOT CHANGE listesindeki öğelerin korunup korunmadığı doğrulanmalı; değiştiyse kasıtlı bir yön değişikliği olarak işaretlenmeli, regresyon olarak değil.
5. Delta raporu hem toplam skoru hem boyut bazlı puanları karşılaştırmalı.

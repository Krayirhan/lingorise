# Sprint Planı — Birimlerin Sprint'lere Dağılımı

Bu dosya, `00-INDEX.md`'deki 11 uygulanabilir birimin (Birim 12 hariç — o bir kapı, iş kalemi değil) somut sprint'lere dağılımını tutar. Mevcut projede zaten **10 sprint** (S0-S9) tamamlanmış durumda; kalan plan **S10'dan başlar**.

## Önceki sprintler (tamamlandı, referans için)

| Sprint | Odak | Kalem | Durum |
|---|---|---|---|
| S0 | Acil Tamir | 9 | ✅ |
| S1 | Mastery Temeli | 5 | ✅ |
| S2 | SRS Onarımı | 9 | ✅ |
| S3 | Bahçe & Bölümler | 9 | ✅ |
| S4 | Terfi & Seviye | 5 | ✅ |
| S5 | Tutarlılık | 12 | ✅ |
| S6 | İçerik Genişletme + Hızlı Kazanımlar | 9 | ✅ |
| S7 | Doğrulama Altyapısı | 8 | ✅ |
| S8 | Sağlamlaştırma | 8 | ✅ |
| S9 | Erişilebilirlik + Çeşitlilik | 6 | ✅ |

## S6 — Tamamlandı (kanıtlı)

| Kaynak | Kalem | Kanıt |
|---|---|---|
| [01-content-expansion.md](01-content-expansion.md) §1.1 | A2 → 254 kelime (5 curated + 249 yeni, 7 konu) | `src/content/questions/a2Generated.ts` · `isLevelReady("A2") === true` artık geçiyor |
| [01-content-expansion.md](01-content-expansion.md) §1.2 | A1'in 320 sorusunun tamamı gerçek örnek cümle taşıyor, şablon kalmadı | `src/content/vocabulary/a1ExampleSentences.ts` · yeni test: "No question ships a template example sentence" |
| [06-behavior-messaging-gaps.md](06-behavior-messaging-gaps.md) §6.1 | Tekrar borcu limiti (40) aşılınca Pratik Merkezi nedenini açıklıyor | `PracticeHubScreen.tsx` `isDebtCapped` dalı, cihazda doğrulandı |
| [06-behavior-messaging-gaps.md](06-behavior-messaging-gaps.md) §6.2-6.3 | Sessiz davranış taraması | Bu roadmap'in kendisi + §6.1 uygulaması |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.2 | Zorluk/XP artık seviye + kelime uzunluğuna göre hesaplanıyor, sabit değil | `src/content/questions/difficulty.ts` |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.3 | Pick the Word modu — yeni içerik gerektirmeden mevcut sorulardan türetiliyor | `src/domain/practice/reverseMode.ts` · cihazda "TÜRKÇE → İNGİLİZCE" akışı doğrulandı |

**Toplam katalog: 590 soru** (A1: 320, A2: 254, B1-C2: 16). **Testler: 179 → 189.** Commit `36d665f`.

**Planla farkı:** §10.4 (Quick Review modu) zaten S6 kapsamı dışında bırakılmıştı, değişmedi. Diğer her kalem plandaki gibi kapatıldı.

### S7 — Doğrulama Altyapısı

| Kaynak | Kalem |
|---|---|
| [04-multiday-verification.md](04-multiday-verification.md) §4.1-4.4 | Dev zaman kaydırma aracı, çok günlü simülasyon testleri, beta rollout |
| [05-telemetry-analytics.md](05-telemetry-analytics.md) §5.1-5.4 | Event altyapısı, temel event seti, retention raporları, gizlilik kontrolü |

**8 kalem · S6'nın ürettiği içerikle test edilir**

## S7 — Tamamlandı (kanıtlı)

| Kaynak | Kalem | Kanıt |
|---|---|---|
| [04-multiday-verification.md](04-multiday-verification.md) §4.1 | Dev zaman kaydırma aracı — gerçek cihaz saati emülatörde `adb root` reddedildiği (production system image) için değiştirilemiyordu; bu, günler boyu davranışı gözlemlemenin tek yolu | `src/utils/clock.ts` · `advanceDevClock`/`resetDevClock`/`todayISO` · uygulama genelinde 8 dosyada `Date.now()`/`new Date()` yerine geçti · `src/features/profile/components/DevClockCard.tsx` (Profil ekranı, `__DEV__` ile release'de gizli) |
| [04-multiday-verification.md](04-multiday-verification.md) §4.2 | Çok günlü simülasyon testleri | Yeni testler 36-38: 7 günlük mastery simülasyonu, 7 günlük rollover zinciri, 30 günlük mastery büyümesi — üçü de gerçek `applyDailyRollover`/`recordLearningOutcome`/`scheduleNextReview` fonksiyonlarını gün gün çağırıyor, mock değil |
| [04-multiday-verification.md](04-multiday-verification.md) §4.3-4.4 | Manuel QA prosedürü, beta rollout | Kod kapsamı dışında bırakıldı — dokümanın kendisinde de süreç/organizasyon kalemi olarak işaretli, bu sprint'te bilinçli olarak ele alınmadı |
| [05-telemetry-analytics.md](05-telemetry-analytics.md) §5.1-5.2 | Event altyapısı + 13 event'lik temel set | `src/services/telemetry.ts` — AsyncStorage tabanlı halka tampon (200 event), tipli `TelemetryEvent` union · 6 dosyada gerçek çağrı noktası: `useUserProgress.ts`, `useAppSession.ts`, `PracticeScreen.tsx`, `LevelPromotionModal.tsx`, `LevelSwitcherModal.tsx` |
| [05-telemetry-analytics.md](05-telemetry-analytics.md) §5.3 | Retention/funnel raporları | **Ertelendi** — gerçek bir dashboard/analiz aracı gerektiriyor, bu proje kapsamında yok. Ham veri (`getRecentEvents()`) cihazda mevcut, raporlama katmanı değil |
| [05-telemetry-analytics.md](05-telemetry-analytics.md) §5.4 | Gizlilik/KVKK incelemesi | `DataManagementCard.tsx`'teki Gizlilik Politikası modalına "4. Uygulama İçi Kullanım Kayıtları" maddesi eklendi — telemetrinin cihazda kaldığını ve hiçbir sunucuya gönderilmediğini açıkça belirtiyor. `clearAllLocalData()` artık `clearTelemetry()`'yi de çağırıyor (`src/services/storage.ts`) — önceden "Yerel Verileri Sıfırla" telemetri halka tamponunu silmiyordu, bu politika metniyle çelişecekti; düzeltildi |

**Dürüstlük notu — DevClockCard'ın cihazda buton-tıklama doğrulaması:** DevClockCard `__DEV__` kontrolüyle release build'de bilerek gizleniyor (kullanıcıya sızmaması için), bu yüzden gerçek doğrulama debug build + Metro bağlantısı gerektiriyordu. Bu oturumda debug build + Metro kurulumu tekrarlayan bir bağlantı sorunuyla karşılaştı (bundle Metro tarafında başarıyla oluşuyor, ama native köprü JS context'i "ready" duruma hiç geçmiyor — uygulama verisi temizlense, APK tamamen kaldırılıp yeniden kurulsa bile aynı sonuç) ve zaman kısıtı nedeniyle bu ortam sorunu çözülemedi. Bu, Sprint 7 kodunun kendisinde bir hata değil: (1) release build aynı cihazda sorunsuz derlendi, kuruldu ve tam akış (onboarding → pratik → çıkış diyaloğu → telemetri tetikleyen olaylar) doğrulandı; (2) DevClockCard'ın çağırdığı asıl mantık (`advanceDevClock` → `applyDailyRollover`/`recordLearningOutcome`/`scheduleNextReview`) testler 36-38'de gün gün gerçek biçimde çalıştırılıp doğrulandı — UI, ince bir buton katmanından ibaret. Kalan risk yalnızca "buton basınca `onRefresh` gerçekten tetikleniyor mu" gibi ince bir kablo bağlantısı sorunu; kod incelemesiyle doğru olduğu teyit edildi ama interaktif cihaz kanıtı bu oturumda üretilemedi.

**Testler: 189 → 198.** TypeScript: temiz (`npx tsc --noEmit` hatasız).

### S8 — Sağlamlaştırma

| Kaynak | Kalem |
|---|---|
| [07-sync-robustness.md](07-sync-robustness.md) §7.1-7.4 | Çoklu cihaz çakışma senaryoları, sunucu zaman damgası, gerçek çoklu cihaz testi |
| [08-migration-cleanup.md](08-migration-cleanup.md) §8.1-8.4 | Versiyonlu göç sistemi, mevcut üç göç yolunun toparlanması |

**8 kalem · bağımsız, S6-S7 ile paralel yürütülebilir**

## S8 — Tamamlandı (kanıtlı)

| Kaynak | Kalem | Kanıt |
|---|---|---|
| [07-sync-robustness.md](07-sync-robustness.md) §7.1 | Üç çakışma senaryosu birim testiyle kapsandı | Yeni testler 40-41: saat kayması (clock skew) tie-break, 3 günlük offline/online cihaz senaryosu, paylaşılan kelimede zengin kaydın kazanması, `nextReviewAt`/`easeFactor`'ün asla parçalı (spliced) karışmadığının doğrulanması |
| [07-sync-robustness.md](07-sync-robustness.md) §7.2 | Birleştirme kararı artık cihaz saatine değil sunucu zaman damgasına güveniyor | `src/domain/learning/mastery.ts` `pickRicherRecord` — attempts eşitse ve her iki taraf da en az bir kez senkron olduysa `serverSyncedAt` (Firestore `serverTimestamp()`) karar verir, cihaz saati (`lastAnsweredAt`) yalnızca hiç senkron olmamış kayıtlarda devre dışı yedek. `src/services/firestore.ts`: `syncUserData` her `learningProgress` öğesine `serverSyncedAt: serverTimestamp()` damgalıyor, `fetchUserData` Firestore `Timestamp` nesnelerini `.toMillis()` ile epoch ms'e çeviriyor |
| [07-sync-robustness.md](07-sync-robustness.md) §7.3 | Gerçek çoklu cihaz testi | **Kısmi** — bu ortamda tek emülatör örneği var (S7'de tek emülatörün bile debug-build bağlantısında sorun yaşadığı görüldü), iki fiziksel/emülatör cihazla canlı Firestore testi yapılamadı. Bunun yerine testler 40-41, `mergeAndSyncUserData`'nın gerçekte çağırdığı aynı `mergeLearningProgress` fonksiyonunu, gerçek çok-cihaz senaryolarının ürettiği veri şekilleriyle (ayrık kelime kümeleri, ortak kelimede farklı zenginlikte kayıt, saat kayması) doğruluyor — üretim kod yolunun kendisi, sahte/mock bir kopyası değil. Gerçek iki-cihaz testi bir sonraki fırsatta (iki fiziksel cihaz veya iki ayrı emülatör + gerçek Firebase projesi ile) yapılmalı |
| [07-sync-robustness.md](07-sync-robustness.md) §7.4 | Veri kaybı savunma hattı | Roadmap'in kendi koşuluna göre değerlendirildi: "sadece 7.1-7.3'te gerçek bir veri kaybı riski gözlemlenirse uygulanmalı". 7.1 testleri hiçbir senaryoda veri kaybı göstermedi (tüm kelimeler her durumda hayatta kaldı) — bu yüzden **bilinçli olarak uygulanmadı**, gereksiz karmaşıklık eklemekten kaçınıldı |
| [08-migration-cleanup.md](08-migration-cleanup.md) §8.1 | Migration versiyonlama sistemi | `src/services/storage.ts`: `CURRENT_SCHEMA_VERSION = 3`, `detectStoredSchemaVersion()` versiyonsuz eski veriyi şekline bakarak sınıflandırıyor, `normalizeUserData` artık her zaman `schemaVersion` damgalıyor. Mevcut üç göç fonksiyonu (`migrateLearningProgress`, `isLegacyQuestSet`, `isSeededDemoProfile`) davranışı değiştirilmeden aynen korundu — DoD'nin "davranış değişmemeli" şartı gereği |
| [08-migration-cleanup.md](08-migration-cleanup.md) §8.2 | Eski göç kodu izolasyonu | Mevcut fonksiyonlar zaten tek-sorumluluklu ve izoleydi (Sprint 0-2'de bu şekilde yazılmışlardı) — 8.1'in versiyon dedektörü bunların üzerine ekstra bir gözlemlenebilirlik katmanı olarak eklendi, mevcut kod yeniden yazılmadı |
| [08-migration-cleanup.md](08-migration-cleanup.md) §8.3 | Göç telemetrisi | `src/services/telemetry.ts`'e `migration_applied` event'i eklendi (`fromVersion`, `toVersion`, `hadLegacyReviewQueue`, `hadLegacyQuestSet`) · `loadUserData()` artık her yüklemede versiyonu tespit edip, gerçek bir göç olduğunda (fromVersion < CURRENT_SCHEMA_VERSION) bu event'i tetikliyor |
| [08-migration-cleanup.md](08-migration-cleanup.md) §8.4 | Eski göç yollarının silinme kriteri | Roadmap'in kendi metninde zaten belgeli: "bir son tarih değil, bir koşul" — telemetri `migration_applied` artık üretimde veri topluyor; bu veri birkaç ay boyunca sıfır göç gösterirse eski yollar güvenle silinebilir. Kod değişikliği gerektirmiyor, sadece karar kriterinin belgeli kaldığını teyit ediyoruz |

**Testler: 198 → 211.** TypeScript: temiz. Release APK cihazda derlenip kuruldu, mevcut kullanıcı verisiyle (S7'den kalan ilerleme) sorunsuz açıldı — yeni `schemaVersion`/`serverSyncedAt` alanları geriye dönük uyumlu (opsiyonel alanlar), var olan hiçbir kaydı bozmadı.

### S9 — Erişilebilirlik + Çeşitlilik

| Kaynak | Kalem |
|---|---|
| [09-accessibility.md](09-accessibility.md) §9.1-9.5 | TalkBack, dinamik yazı tipi, kontrast, `reduceMotion` taraması |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.1 | Rastgele çeldirici — düşük efor, yüksek etki |

**6 kalem · bağımsız, S6-S8 ile paralel yürütülebilir**

## S9 — Tamamlandı (kanıtlı)

| Kaynak | Kalem | Kanıt |
|---|---|---|
| [09-accessibility.md](09-accessibility.md) §9.1 | TalkBack ile gerçek akış testi | Cihazda TalkBack fiilen etkinleştirildi (`dumpsys accessibility` ile teyitli, dokunma keşfi aktif). Ana ekran, pratik ekranı, `LevelSwitcherModal` erişilebilirlik ağacı (`uiautomator dump`) incelendi: her buton anlamlı etiket taşıyor ("Button" gibi genel duyuru yok), cevap satırları `RadioButton` rolüyle doğru anlamı taşıyor, `LevelSwitcherModal`'da hazır olmayan seviyeler `enabled="false"` ile doğru işaretleniyor, odak göstergesi (yeşil çerçeve) ekran görüntüsünde görünür durumda. Bu sırada **gerçek bir hata bulundu ve düzeltildi**: birden fazla modalin `accessibilityLabel`'ı sabit Türkçe metin taşıyordu ("Kapat", "Dinle", "Şifremi Sıfırla") — İngilizce arayüzde bile TalkBack Türkçe duyuruyordu. `QuestHistoryModal`, `WordDetailModal` (×2), `WordNotebookModal`, `DataManagementCard`, `AccountManagementCard` düzeltildi; 2 yeni i18n anahtarı eklendi (`wordDetailListen`, `resetPasswordBtn`) |
| [09-accessibility.md](09-accessibility.md) §9.2 | Dinamik yazı tipi testi | Cihazda `font_scale=1.3` (Android'in pratik maksimumu) ayarlandı, ana ekran ve özellikle roadmap'in riskli işaretlediği `LevelSwitcherModal` cihazda ekran görüntüsüyle doğrulandı — hiçbir metin kesilmiyor/taşmıyor, "Şu anki" etiketi ve satırlar esnek genişliyor |
| [09-accessibility.md](09-accessibility.md) §9.3 | Accessibility Scanner ile kontrast doğrulaması | **Yapılamadı** — bu emülatörde Play Store var ama Accessibility Scanner kurulu değil, otomatik kurulum Google hesabı girişi gerektiriyor ve bu oturumun kapsamı dışında. Sprint 3'ün matematiksel WCAG AA hesaplaması geçerliliğini koruyor ama gerçek cihaz ölçümüyle bu sprintte teyit edilmedi — dürüstçe açık bırakılıyor |
| [09-accessibility.md](09-accessibility.md) §9.4 | `reduceMotion` kapsamı genişletildi | `grep -rn reduceMotion` taraması, Sprint 3-5'te eklenen `LevelPromotionModal`, `LevelSwitcherModal`, `QuestHistoryModal`'ın bu ayara hiç saygı göstermediğini ortaya çıkardı — üçü de artık `reduceMotion` açıkken `Modal`'ın `animationType`'ını `"none"`'a çekiyor. Aynı düzeltme `WordDetailModal` ve `WordNotebookModal`'a da uygulandı (aynı kalıp, `userData.reduceMotion` zincirini `AppNavigator` → `HomeScreen`/`ProgressScreen` → modallere kadar taşıyarak) |
| [09-accessibility.md](09-accessibility.md) §9.5 | Otomatik erişilebilirlik kontrolü | `react-native-testing-library` gibi yeni bir bağımlılık eklemek yerine düşük maliyetli, gerçek bir statik tarama yazıldı: test 44, `src/**/*.tsx`'i tarayıp belgeli istisnalar (dev-only bileşenler, kasıtlı iki-dilli seçiciler, ölü kod) dışında sabit-dilli `accessibilityLabel` kalmadığını doğruluyor — bu, tam olarak §9.1'de bulunan hata sınıfının bir daha sessizce geri gelmesini engelliyor |
| [10-game-variety-and-content-quality.md](10-game-variety-and-content-quality.md) §10.1 | Çeldiriciler artık her oturumda farklı | `src/domain/practice/distractors.ts` — `randomizeDistractors`, içerik üretim zamanında değil oturum kurulma zamanında (`buildDailySession`/`startReview`/`startPractice`) her sorunun yanlış seçeneklerini kendi seviyesinin havuzundan yeniden örnekliyor. Cihazda canlı doğrulandı: aynı kelime ("son") art arda açılan oturumlarda farklı çeldiricilerle geldi. `PICK_THE_WORD` soruları dokunulmadan geçiyor (zaten Sprint 6'da `reverseMode.ts` ile aynı ilkeyle çözülmüştü) |

**Testler: 211 → 218.** TypeScript: temiz. Release APK cihazda derlendi; TalkBack ile erişilebilirlik ağacı, 1.3x font ölçeğiyle görsel bütünlük, ve rastgele çeldirici canlı davranışı doğrulandı.

**Dürüstlük notu:** §9.3 (gerçek kontrast tarayıcısı) bu ortamda yapılamadı — Play Store kurulu ama Accessibility Scanner uygulaması yok ve otomatik kurulumu bir Google hesabı gerektiriyor. Bu, Sprint 7/8'de belgelenen benzer ortam kısıtlarıyla aynı kategoride: kod eksikliği değil, bu spesifik emülatörün araç kısıtı.

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

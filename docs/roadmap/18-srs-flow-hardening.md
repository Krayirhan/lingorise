# Günlük Akış ve SRS Sağlamlaştırması

Günlük oturum kurulumu (`buildDailySession`) ve tekrar zamanlama (`spacedRepetition.ts`, `mastery.ts`) mantığının uçtan uca denetiminde bulunan, roadmap'in geri kalanında yer almayan beş somut eksik ve bunların satır satır çözümü. Genel puan 6.2/10 — mimari doğru, ama beş nokta kodla kapatılabilir.

Beşinin **dördü** gerçek kullanıcı verisi gerektirmiyor — tamamen algoritmik/deterministik düzeltmeler, hemen yapılabilir. **Biri** (gün geçişinde cihaz saatine güven) düşük öncelikli ama yine veri gerektirmiyor. İncelemede ortaya çıkan iki ek nokta da burada belgeli: biri aslında hiç hata değilmiş (mastery'nin ardışık gün şartı), diğeri zaten roadmap'in başka bir yerinde tanımlı ve bilinçli olarak bekletiliyor (kalite-puanı bazlı ease formülü) — ikisi de sessizce atlanmadı.

---

## 1. Aralık Rastgeleliği (Interval Jitter / Yük Dengeleme)

**Sorun:** `nextIntervalDays()` tamamen deterministik. Aynı gün 20 kelime öğrenen biri için hepsi **tam olarak aynı gün** tekrar due olur — yapay bir yığılma yaratır, borç limitinin önlemeye çalıştığı sorunun bir başka kaynağı. Anki bu yüzden ±%5-10 rastgele sapma ("fuzz") ekler.

**Nasıl yapılmalı:**

1. `src/domain/review/spacedRepetition.ts`'e yeni bir saf fonksiyon ekle:
   ```typescript
   const JITTER_RATIO = 0.05; // ±%5
   const JITTER_MIN_DAYS = 4; // bundan kısa aralıklar sallanmaz (1 ve 3 günlük sabit adımlar dokunulmaz kalır)

   /** Aynı gün zamanlanan çok sayıda kelimenin aynı günde tekrar birikmesini önler. Test edilebilirlik için random enjekte edilebilir. */
   export function applyIntervalJitter(days: number, random: () => number = Math.random): number {
     if (days < JITTER_MIN_DAYS) return days;
     const range = Math.max(1, Math.round(days * JITTER_RATIO));
     const offset = Math.floor(random() * (2 * range + 1)) - range;
     return Math.max(JITTER_MIN_DAYS, days + offset);
   }
   ```
2. `nextIntervalDays()`'in **sadece** `grown` dalında (yani `repetitions > 2`, ease-bazlı büyüme) `applyIntervalJitter` çağır — 1 ve 3 günlük sabit adımlara dokunma:
   ```typescript
   const grown = Math.round(Math.max(previousInterval, SECOND_INTERVAL_DAYS) * easeFactor);
   const clamped = Math.min(MAX_INTERVAL_DAYS, Math.max(SECOND_INTERVAL_DAYS + 1, grown));
   return applyIntervalJitter(clamped);
   ```
3. **Neden testler kırılmaz:** `tests/testSuite.ts`'deki mevcut aralık testleri sadece 1. ve 3. gün için tam eşitlik (`=== 1`, `=== 3`) kontrol ediyor — jitter bu iki sabit adıma hiç dokunmuyor. Sonraki tüm testler zaten eşitsizlik kullanıyor (`> 3`, `>= 21`, `>= 8`) — ±%5 sapma bu eşiklerin altına düşmeyecek kadar büyük bir marj bırakıyor (kanıt: mevcut testlerde `longTerm.intervalDays` en az 21 gün, %5'i ~1 gün, eşiğin çok altında kalıyor).
4. Yeni test ekle: `applyIntervalJitter` deterministik bir `random` enjekte edilerek (örn. hep 1.0 dönen bir fonksiyon → maksimum sapma, hep 0 dönen → maksimum negatif sapma) sınırların doğru çalıştığı doğrulanmalı; ayrıca `JITTER_MIN_DAYS`'in altındaki değerlerin hiç değişmediği ayrı bir testle kanıtlanmalı.

**Bitti sayılır ne zaman:** Aynı gün zamanlanan 20 simüle kelimenin tekrar tarihlerinin en az %30'unun farklı günlere dağıldığı bir test (test 36 tarzı çok-günlü simülasyona ek).

---

## 2. Kronik Hata (Leech) Tespiti

**Sorun:** Bir kelime 50 kez art arda yanlış bilinse bile sistem hiçbir şey değiştirmiyor — her seferinde aynı 20 dakikalık döngüye giriyor, sonsuza kadar borç kuyruğunu şişirebilir. Anki'nin "leech" mekanizmasının bir eşdeğeri yok.

**Nasıl yapılmalı:**

1. `src/types/user.ts`'teki `LearningItemProgress`'e yeni bir alan ekle:
   ```typescript
   /** Consecutive wrong answers. Mirrors `repetitions` (consecutive correct) but counts the opposite streak — resets to 0 on any correct answer. */
   consecutiveWrongCount?: number;
   ```
2. `src/domain/learning/mastery.ts`'teki `recordLearningOutcome`'a bu sayacı ekle:
   ```typescript
   const consecutiveWrongCount = isCorrect ? 0 : (base.consecutiveWrongCount || 0) + 1;
   // ...next nesnesine ekle: consecutiveWrongCount,
   ```
3. Aynı dosyaya bir eşik ve saf bir tespit fonksiyonu ekle:
   ```typescript
   /** Anki'nin varsayılan leech eşiğiyle aynı — art arda 8 yanlıştan sonra bir kelime "kronik zor" sayılır. */
   export const LEECH_THRESHOLD = 8;

   export function isLeech(item: LearningItemProgress): boolean {
     return (item.consecutiveWrongCount || 0) >= LEECH_THRESHOLD;
   }
   ```
4. **Ne yapılmamalı:** Kelimeyi kuyrukdan çıkarma, kullanıcının önüne gelmesini engelleme. Bu projenin tüm boyunca uyguladığı ilke ("asla seçimi bloke etme, sadece dürüstçe bilgilendir") burada da geçerli — leech tespiti öğrenmeyi durdurmaz, sadece görünür kılar.
5. `src/state/useUserProgress.ts`'teki `recordAnswer`'a bir telemetri çağrısı ekle (yeni `word_marked_leech` event'i, `src/services/telemetry.ts`'e eklenir): `fromStatus`/`toStatus` gibi mevcut geçiş-tespiti deseniyle aynı — sadece `isLeech(prevItem)` false iken `isLeech(nextItem)` true olduğunda bir kez tetiklenir (tekrar tekrar değil).
6. **UI tarafı (opsiyonel, düşük öncelik):** `FeedbackCard.tsx` veya `WordPrompt.tsx`'te, `isLeech(item)` true olan bir kelime cevaplanırken küçük bir ipucu satırı gösterilebilir ("Bu kelime sana zor geliyor gibi — ipucunu kullanmayı dener misin?"). Bu tamamen kozmetik, zorunlu değil.

**Bitti sayılır ne zaman:** `isLeech()` saf fonksiyonu test edilmiş (8. yanlıştan önce false, 8. ve sonrasında true, bir doğru cevap sayaç sıfırlıyor), `word_marked_leech` telemetrisi doğru anda bir kez tetikleniyor.

---

## 3. Zorluk Verisiyle Yeni Kelime Sıralaması

**Sorun:** `computeDifficulty()` (Sprint 6) her A1/A2 sorusuna `difficulty: 1-5` damgalıyor (~590 sorunun ~574'ünde mevcut, doğrulandı) ama **hiçbir yerde** kullanılmıyor — sadece XP hesabında. `buildDailySessionCore`'daki yeni kelime seçimi tamamen rastgele (`sort(() => Math.random() - 0.5)`), bir bölüm içinde kolaydan-zora bir ilerleme yok. Hesaplanan bir veri, hesaplandığı amaç dışında hiçbir yerde iş görmüyor.

**Nasıl yapılmalı:**

1. `src/state/useAppSession.ts`'teki `buildDailySessionCore`'da `freshWords`'ün seçimini değiştir — saf rastgele yerine, **zorluk grubu içinde rastgele, gruplar arasında artan zorluk sırayla**:
   ```typescript
   function pickNewWords(freshWords: MeaningMatchQuestion[], count: number): MeaningMatchQuestion[] {
     const byDifficulty = new Map<number, MeaningMatchQuestion[]>();
     for (const q of freshWords) {
       const d = q.difficulty || 1;
       if (!byDifficulty.has(d)) byDifficulty.set(d, []);
       byDifficulty.get(d)!.push(q);
     }
     const ordered = [...byDifficulty.keys()].sort((a, b) => a - b).flatMap((d) => {
       const group = byDifficulty.get(d)!;
       return [...group].sort(() => Math.random() - 0.5); // grup içinde hâlâ rastgele — ezber riski kalmıyor
     });
     return ordered.slice(0, count);
   }
   ```
2. `buildDailySessionCore`'daki satırı değiştir:
   ```typescript
   const newPortion = pickNewWords(freshWords, remainingSlots);
   ```
3. **Neden bu tasarım:** Tamamen zorluğa göre sıralamak (grup içi rastgelelik olmadan) ezber riskini geri getirir — "her zaman aynı sırayla geliyor" sorunu, tam da çeldirici rastgeleleştirmesiyle çözülmeye çalışılan şeyin bir başka biçimi. Grup-içi rastgelelik + grup-arası artan zorluk, ikisinin de iyi yanını korur.
4. Yeni test: aynı zorluk seviyesindeki kelimelerin farklı çağrılarda farklı sırada geldiğini (varyasyon), ama zorluk 1'in zorluk 3'ten hep önce geldiğini (sıralama) doğrulayan bir test.

**Bitti sayılır ne zaman:** Bir bölümdeki yeni kelimeler artan zorluk sırasıyla (grup içi varyasyonla) geliyor; test bunu doğruluyor.

---

## 4. Tekrar Borcu Kademeli Azalma

**Sorun:** `REVIEW_DEBT_LIMIT = 40`'a tam ulaşıldığında yeni kelime tanıtımı aniden sıfıra düşüyor — keskin bir uçurum, kademeli bir azalma yok.

**Nasıl yapılmalı:**

1. `src/state/useAppSession.ts`'e yeni bir sabit ekle:
   ```typescript
   /** Bu noktadan REVIEW_DEBT_LIMIT'e kadar yeni kelime kotası doğrusal olarak azalır — ani bir kesim yerine yumuşak bir fren. */
   export const REVIEW_DEBT_TAPER_START = 20;
   ```
2. `buildDailySessionCore`'daki mantığı değiştir:
   ```typescript
   const totalDue = getDueReviewItems(userData.learningProgress || {}).length;
   if (totalDue >= REVIEW_DEBT_LIMIT) return dueQuestions; // mevcut sert sınır korunuyor

   let newWordBudget = remainingSlots;
   if (totalDue > REVIEW_DEBT_TAPER_START) {
     const taperRatio = 1 - (totalDue - REVIEW_DEBT_TAPER_START) / (REVIEW_DEBT_LIMIT - REVIEW_DEBT_TAPER_START);
     newWordBudget = Math.max(0, Math.round(remainingSlots * taperRatio));
   }
   // ...newPortion = pickNewWords(freshWords, newWordBudget);
   ```
3. **Önemli:** `REVIEW_DEBT_TAPER_START = 20` da tıpkı diğer parametreler gibi tahmini bir değer — [14-parameter-calibration-log.md](14-parameter-calibration-log.md)'ye yeni bir parametre olarak eklenmeli, aynı disiplinle (gerçek veri gelene kadar değiştirilmez, sadece izlenir).
4. Yeni test: `totalDue = 30` (taper aralığının ortası) için yeni kelime kotasının `remainingSlots`'un yaklaşık yarısı olduğunu, `totalDue = 40` için sıfır olduğunu, `totalDue = 10` için tam kota olduğunu doğrulayan bir test.

**Bitti sayılır ne zaman:** Borç 20-40 arasında doğrusal azalan bir yeni-kelime kotası var; testler bunu doğruluyor.

---

## 5. Gün Geçişinde Cihaz Saatine Güven (düşük öncelik)

**Sorun:** Streak ve günlük rollover tamamen cihaz saatine bağlı (`todayISO()`). Saatini ileri alan bir kullanıcı günü "atlatıp" seriyi manipüle edebilir. Düşük ciddiyet (kullanıcı kendine zarar veriyor, başkasına değil) ama senkron/migration çalışmasının sunucu-zaman-damgası disipliniyle tutarsız.

**Nasıl yapılmalı (sadece hesap açmış kullanıcılar için mümkün — misafir modunda sunucu referansı yok):**

1. `src/services/firestore.ts`'e, her `syncUserData` çağrısında `lastKnownServerDate: serverTimestamp()` alanı ekle (ayrı bir alan, mevcut `updatedAt`'ten farklı — günlük rollover mantığına özel).
2. `useUserProgress.ts`'in `init()`/`refresh()` fonksiyonlarında, hesap açmış bir kullanıcı için cihaz tarihini son bilinen sunucu tarihiyle karşılaştır: cihaz tarihi sunucu tarihinden **1 günden fazla ileriyse**, rollover'ı cihaz tarihine göre değil sunucudan gelen tarihe göre uygula (ya da en azından bir günlük anomali telemetrisi — `suspicious_date_jump` — tetikle).
3. **Misafir mod için:** Düzeltilemez, açıkça belgelenir — bu, yerel-öncelikli mimarinin kabul edilmiş bir sınırıdır, sahte bir çözümle kapatılmamalı.

**Bitti sayılır ne zaman:** Hesap açmış bir kullanıcı için cihaz-sunucu tarih sapması tespit ediliyor ve telemetriye düşüyor. Misafir mod sınırı belgeli.

---

## Ayrıca incelendi

**"Mastery için ardışık gün şartı" — kapatıldı, eylem gerekmiyor.** İlk bakışta eksiklik gibi görünen bir madde: `distinctCorrectDays` şartı, iki farklı günün **ardışık** olmasını istemiyor — 1. gün ve 30. gün doğru bilinse bile "2 farklı gün" sayılıyor. Daha yakından bakıldığında bu bir hata değil: spaced-repetition teorisinde, bir kelimenin **uzun aralıklarla** doğru hatırlanması, ardışık günlerde hatırlanmasından **daha güçlü** bir kalıcılık sinyalidir — zaten SRS'in zamanlama algoritması bu kelimeyi doğal olarak günler/haftalar sonrasına erteliyor, yani "30. günde tekrar geldi ve doğru bildi" senaryosu sistemin kendi zamanlamasının bir sonucu, bir açık değil. Bu yüzden burada "düzeltilecek" olarak listelenmiyor — neden listelenmediği belgeli.

**Kalite-puanı bazlı ease formülü — zaten başka bir yerde tanımlı, burada tekrarlanmıyor.** SRS'in kalite-puanına (0-5) dayalı gerçek SM-2 formülüne geçmesi zaten roadmap'in SRS algoritması dosyasında ve faz 2 sprint planında kapsanıyor. Burada tekrarlanmıyor, sadece tetikleyici koşul tek cümleyle yineleniyor: **gerçek analitik altyapısı kurulup en az 2 hafta karşılaştırmalı veri birikene kadar dokunulmaz.** Bu bir eksik değil, bilinçli bir bekleme durumu — yukarıdaki beş maddenin aksine gerçek kullanıcı verisi gerektiriyor.

---

## Özet

| # | Konu | Veri gerektiriyor mu | Öncelik |
|---|---|---|---|
| 1 | Aralık jitter'ı | Hayır | Yüksek |
| 2 | Leech tespiti | Hayır | Yüksek |
| 3 | Zorluk-bazlı sıralama | Hayır | Orta |
| 4 | Borç kademeli azalma | Hayır | Orta |
| 5 | Sunucu-tarih çapraz kontrolü | Hayır | Düşük |
| — | Mastery ardışık gün şartı | — | Kapatıldı, eylem yok |
| — | Kalite-puanı bazlı ease formülü | Evet | Bilinçli bekleme |

---

## Doğrulama (kanıtlı)

Beş maddenin tamamı uygulandı ve aşağıdaki kanıtlarla doğrulandı (2026-08-25):

1. **Kod incelemesi** — `spacedRepetition.ts` (jitter), `mastery.ts` (leech), `useAppSession.ts` (zorluk sıralaması + borç kademeli azalma), `firestore.ts`/`useUserProgress.ts`/`AppBootstrap.tsx` (sunucu-tarih çapraz kontrolü), `types/user.ts`, `telemetry.ts` — tek tek okunup madde madde bu belgedeki spesifikasyonla karşılaştırıldı. Beşi de birebir eşleşiyor; jitter maddesi spesifikasyonu aşarak `nextIntervalDays()` seviyesinde de `random` enjekte edilebilir hale getirilmiş.
2. **Testler** — `tests/testSuite.ts`'e madde başına ayrı test blokları eklenmiş (49-53 numaralı bloklar): jitter sınırları ve sabit adımların dokunulmazlığı, leech eşiğinin 1'den 9'a kadar her adımı + sıfırlanma, zorluk-sıralamalı seçimin hem artan sıra hem grup-içi varyasyon garantisi, borç kademeli azalmanın üç noktası (10/30/40 due), sunucu-tarih anomali event'inin çağrılabilirliği. `npm test` → **283/283 PASS, 0 FAIL** (önceki: 240 — bu çalışmayla 43 yeni test eklendi).
3. **Tip kontrolü** — `npx tsc --noEmit -p tsconfig.json` → hatasız.
4. **Parametre günlüğü** — [14-parameter-calibration-log.md](14-parameter-calibration-log.md) güncellenmiş: `REVIEW_DEBT_TAPER_START` hem "Mevcut temel değerler" tablosuna hem konumuna eklenmiş, madde 4'ün istediği disiplin korunmuş (değer değiştirilmeden sadece izleme listesine giriyor).
5. **Cihaz doğrulaması** — Release APK derlendi (`assembleRelease`, BUILD SUCCESSFUL), Pixel_9_Pro emülatörüne kuruldu, uygulama çöküşsüz açıldı, gerçek bir pratik oturumu başlatılıp yanlış cevap verildi (yeni `consecutiveWrongCount`/`isLeech` yolunu tetikleyen kod yolu) ve bir sonraki soruya geçildi — logcat'te uygulamaya ait hiçbir hata/exception/fatal görülmedi (yalnızca zararsız bir HWUI uyarısı).

**Ek düzeltme — yerel `lastKnownServerDate` tazeleme (2026-08-25):** İnceleme sırasında madde 5'te bir incelik fark edildi — `syncUserData()` her senkronizasyonda sunucu tarafında `lastKnownServerDate`'i yeniden damgalıyor, ama `checkServerDateAnomaly()` bu değeri sadece **yerel** depodan okuyor ve yerel kopya önceden sadece oturum açma/uygulama soğuk başlangıcında (`AppBootstrap.tsx`'in `onAuthStateChanged` akışı) tazeleniyordu — uzun bir oturumda (`refresh()` hiç çağrılmadan) yerel değer gitgide bayatlayabiliyordu. Düşük ciddiyetli bir pencereydi (bir sonraki soğuk başlangıçta zaten kendiliğinden düzeliyordu) ama kullanıcı isteği üzerine kapatıldı: `useUserProgress.ts`'teki `refresh()` artık signed-in kullanıcılar için `fetchUserData()` ile Firestore'dan gerçek `lastKnownServerDate`'i çekip hem anomali kontrolünde hem yerel kayıtta kullanıyor — `refresh()` zaten seyrek/kasıtlı bir eylem olduğu için (pull-to-refresh, oturum açma) ek bir Firestore okuması ucuz. `npm test` (283/283) ve `tsc --noEmit` bu değişiklikten sonra da temiz.

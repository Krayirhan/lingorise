# Faz 2 Yol Haritası — Kalan İşler

**Nereden geldi:** S0-S12'nin tamamlanmasının ardından yapılan taze, acımasız bir yeniden puanlamanın doğrudan devamı. O puanlamada 12 birimin hiçbiri 10/10 değildi; ortalama 6.9/10 çıktı. Bu dosya, o puanların altında yatan **somut açık kalemleri** iki gerçek kategoriye ayırıp bir sıraya koyar.

## Neden iki faz

S0-S12 boyunca tekrar eden bir örüntü ortaya çıktı: bazı eksikler **kod yazarak şimdi kapatılabilir**, bazıları **yapısal olarak kapatılamaz** — çünkü gerçek kullanıcı, gerçek cihaz veya insan kararı gerektiriyor. Bu ayrımı bulanıklaştırmak (örn. "parametre kalibrasyonu"nu sahte veriyle yapmış gibi göstermek) S10 ve S12'de bilinçli olarak reddedildi. Bu doküman aynı disiplini sürdürüyor.

- **Faz 2A — Yayın öncesi, şimdi yapılabilir**: araç/ortam eksikliği yüzünden ertelenmiş ama veriye bağımlı olmayan işler.
- **Faz 2B — Yayın sonrası, veriye bağımlı**: gerçek kullanıcı olmadan dürüstçe yapılamayacak işler. Bunlar zaten `02-parameter-validation.md` ve `03-srs-algorithm-v2.md`'de tanımlı — burada sadece *ne zaman* ve *nasıl* tetiklenecekleri planlanıyor.

---

## Faz 2A — Yayın Öncesi (S13-S15)

### Birim 13 — Mağaza ve Hukuki Uygunluk İncelemesi

**Puan (mevcut durum):** 0/10 — hiç değerlendirilmedi · **Öncelik:** P0, gerçek bir yayın engelleyicisi olabilir

**Problem:** `12-launch-readiness-checklist.md`'deki üç açık maddeden en riskli olanı bu — çünkü diğer ikisinin (Accessibility Scanner, retention dashboard) aksine bu, kod incelemesiyle kapatılamaz. Google Play / App Store politikalarına uygunluk, gizlilik beyanlarının mağaza formlarıyla eşleşmesi, veri toplama beyanları (Data Safety formu) hiç doldurulmadı.

**Kapsam:**
- 13.1 — Google Play Data Safety formunu doldur (telemetri, Firebase Auth/Firestore, hangi veri toplanıyor, kiminle paylaşılıyor).
- 13.2 — Gizlilik politikasının gerçek, herkese açık bir URL'de yayında olduğunu doğrula (şu an sadece uygulama içi modal metni var — mağaza bir dış URL isteyecek).
- 13.3 — Hesap silme akışının mağaza politikalarının gerektirdiği "hesap içi kendi kendine silme" şartını karşıladığını doğrula (kod var — `AccountManagementCard.tsx`'teki `deleteAccountBtn` — ama politika diliyle çapraz kontrol edilmedi).
- 13.4 — Uygulama içi satın alma/reklam yoksa bunun mağaza formlarında doğru beyan edildiğini kontrol et.

**Definition of Done:**
- [ ] Data Safety formu dolduruldu ve kod tabanının gerçek davranışıyla birebir eşleşiyor
- [ ] Gizlilik politikası herkese açık bir URL'de yayında
- [ ] Hesap silme akışı politika diliyle karşılaştırıldı

**Bağımlılıklar:** Yok — kod gerektirmiyor, insan/hukuki karar gerektiriyor. Claude bunu kendi başına sertifikalandıramaz, sadece hazırlık malzemesini üretebilir.

---

### Birim 14 — Gerçek Çoklu Cihaz Senkron Testi

**Puan (mevcut durum):** 7/10 (birim 7'nin devamı) · **Öncelik:** P1

**Problem:** S8'de `mergeLearningProgress`/sunucu zaman damgası düzeltmesi yapıldı ve testler 40-41 ile doğrulandı — ama bunlar üretim `mergeAndSyncUserData` fonksiyonunun **simülasyonu**, gerçek iki cihazın Firestore üzerinden canlı çakışması değil. Bu ortamda tek emülatör var.

**Kapsam:**
- 14.1 — İkinci bir emülatör örneği (veya bir fiziksel cihaz + emülatör) başlat, aynı hesapla giriş yap.
- 14.2 — Cihaz A'yı offline'a al, 10 kelime pratik yap. Cihaz B'de farklı 10 kelime çalış, online kalsın.
- 14.3 — Cihaz A'yı tekrar online yap, senkronu gözlemle — her iki cihazda da 20 kelimenin `learningProgress`'te olduğunu doğrula.
- 14.4 — Aynı kelimeyi iki cihazda farklı sonuçla cevaplayıp hangi kaydın kazandığını (serverSyncedAt tie-break) canlı gözlemle.

**Definition of Done:**
- [ ] İki gerçek/emüle cihaz arasında canlı bir senkron döngüsü gözlemlendi ve ekran görüntüsüyle belgelendi
- [ ] `07-sync-robustness.md`'deki §7.3 kapatıldı olarak işaretlendi

**Bağımlılıklar:** İkinci bir emülatör/cihaz kurulumu — teknik olarak mümkün, sadece bu oturumda yapılmadı.

---

### Birim 15 — Erişilebilirlik Tarayıcı Kapanışı

**Puan (mevcut durum):** 7/10 (birim 9'un devamı) · **Öncelik:** P1, mağaza politikaları bunu bekleyebilir

**Problem:** TalkBack ile 5 akış artık test edildi (S9+S12), ama Google'ın Accessibility Scanner uygulaması hiç çalıştırılamadı — bu emülatörde Play Store var ama uygulama kurulu değil, kurulumu bir Google hesabı gerektiriyor.

**Kapsam:**
- 15.1 — Bir Google hesabıyla giriş yapılmış bir emülatör/cihazda Accessibility Scanner'ı kur.
- 15.2 — Ana ekran, Pratik ekranı, İlerleme ekranı, Profil ekranı, ve S9/S12'de düzeltilen modallerin (LevelSwitcherModal, QuestHistoryModal, onboarding adımları) her birini tarat.
- 15.3 — Kritik/yüksek öncelikli bulguları kapat; düşük öncelikli/gürültü bulguları (varsa) gerekçesiyle belgele.
- 15.4 — Sprint 3'ün matematiksel WCAG AA kontrast hesaplamasını gerçek tarayıcı sonuçlarıyla karşılaştır — fark varsa (yarı saydam katmanlar, gölgeler) not al.

**Definition of Done:**
- [ ] Accessibility Scanner taraması yapıldı, kritik bulgu 0
- [ ] `12-launch-readiness-checklist.md`'deki ilgili madde kapatıldı olarak işaretlendi

**Bağımlılıklar:** Google hesabı erişimi olan bir ortam.

---

### Birim 16 — Dev Araç Ortamı Onarımı (opsiyonel, düşük öncelik)

**Puan (mevcut durum):** kapsam dışı, bir engel · **Öncelik:** P3

**Problem:** S7'de debug build + Metro bağlantısı bu ortamda tekrarlayan bir sorunla tıkandı (bundle Metro'da oluşuyor ama native köprü JS context'i hiç "ready" olmuyor). Bu, DevClockCard'ın buton-tıklama etkileşiminin hiçbir zaman interaktif olarak cihazda doğrulanamamasına yol açtı — sadece kod incelemesi + release build sağlık kontrolü yapıldı.

**Kapsam:**
- 16.1 — Kök nedeni bul (Hermes debugger portu çakışması, New Architecture/Bridgeless mod uyumsuzluğu, veya emülatör-özel bir sorun olabilir).
- 16.2 — Debug build + Metro bağlantısını sağlıklı hale getir.
- 16.3 — DevClockCard'ın "+1/+7/+30 gün" butonlarına gerçekten basıp `onRefresh`'in tetiklendiğini, günlük rollover'ın UI'da göründüğünü cihazda doğrula.

**Definition of Done:**
- [ ] Debug build + Metro güvenilir şekilde çalışıyor
- [ ] DevClockCard etkileşimi cihazda interaktif olarak doğrulandı, ekran görüntüsüyle belgelendi

**Bağımlılıklar:** Yok, ama zaman/sabır gerektiren bir ortam hata ayıklaması — önceki oturumda zaman kısıtı nedeniyle bırakılmıştı.

---

## Faz 2B — Yayın Sonrası (S16+, veriye bağımlı)

Bu birimler zaten tam olarak tanımlı (`02-parameter-validation.md`, `03-srs-algorithm-v2.md`) — burada sadece tetikleyici süreç planlanıyor.

### Birim 17 — Gerçek Analitik Altyapısı ve Retention Dashboard

**Puan (mevcut durum):** 7/10 (birim 5'in devamı) · **Öncelik:** P1, veri toplamanın önkoşulu

**Problem:** Telemetri şu an sadece cihaz-yerel bir halka tampon (`AsyncStorage`, 200 event). Hiçbir merkezi toplama/aggregation yok — bu yüzden Birim 2 ve 3'ün ihtiyaç duyduğu "gerçek kullanım verisi" fiilen hiçbir yerde toplanmıyor, sadece her kullanıcının kendi cihazında dağınık duruyor.

**Kapsam:**
- 17.1 — Native Firebase Analytics'i kur (`@react-native-firebase/analytics` + `google-services.json` — native rebuild gerektirir, S7'de bilinçli olarak kapsam dışı bırakılmıştı).
  - **Alternatif:** PostHog, Amplitude gibi RN-native bir analiz SDK'sı (native rebuild gerekmeyebilir, daha hızlı entegre olabilir).
- 17.2 — `telemetry.ts`'in `emit()` fonksiyonunu gerçek sink'e bağla — tasarım gereği bu tek satırlık bir değişiklik olmalı (S7'nin kendi notu).
- 17.3 — Temel bir retention/funnel dashboard'u kur (seçilen aracın kendi paneli, veya BigQuery export + basit bir sorgu seti).
- 17.4 — `migration_applied` event'inin gerçekten sıfıra düştüğünü göstermesi için en az bir haftalık gerçek veri biriktir (Birim 8 §8.4'ün silme kriteri için).

**Definition of Done:**
- [ ] Gerçek bir analiz SDK'sı production'da event topluyor
- [ ] En az bir dashboard/rapor kurulu ve erişilebilir
- [ ] `12-launch-readiness-checklist.md`'deki "retention dashboard" maddesi kapatıldı

**Bağımlılıklar:** Yayına çıkmış olmak (gerçek kullanıcı trafiği olmadan bir dashboard'un anlamı yok).

---

### Birim 18 — Parametre Kalibrasyonu (Birim 2'nin gerçek teslimatı)

**Puan (mevcut durum):** 4/10 · **Öncelik:** P1, ama zaman kilitli

**Problem:** Ölçüm altyapısı hazır (S10) ama sıfır gerçek veri var. Bu birim, Birim 17 devreye girip en az 2-4 hafta gerçek kullanım verisi biriktikten **sonra** başlayabilir — daha erken başlamak tahmin üretir, kalibrasyon değil.

**Kapsam (zaten `02-parameter-validation.md`'de tanımlı, burada sadece sıralama):**
1. Yayına çık, Birim 17'nin dashboard'unu izlemeye başla.
2. 2-4 hafta bekle — bu bir kod adımı değil, bir takvim adımı.
3. `14-parameter-calibration-log.md`'deki 5 sinyali gerçek verilerle doldur.
4. Roadmap'in kendi öncelik sırasına göre (tekrar borcu limiti → terfi eşiği → mastery eşiği → bölüm boyutu → yeniden öğrenme gecikmesi) **tek seferde bir parametre** değiştir, izlemeye devam et.
5. Her değişikliği `14-parameter-calibration-log.md`'ye tarihle ve gerekçesiyle işle.

**Definition of Done:** `02-parameter-validation.md`'nin kendi DoD'si — değişmedi, hâlâ geçerli.

**Bağımlılıklar:** Birim 17 (analitik altyapısı) + gerçek yayın + takvim zamanı.

---

### Birim 19 — SM-2 v2 Rollout (Birim 3'ün gerçek teslimatı)

**Puan (mevcut durum):** 5/10 · **Öncelik:** P2

**Problem:** `inferQuality()` (S11) hazır ve gözlemsel olarak telemetriye ekleniyor ama `scheduleNextReview`'a hiç bağlanmadı. Roadmap'in kendi §3.4'ü, ikili modelle karşılaştırmalı en az 2 haftalık veri istiyor.

**Kapsam (zaten `03-srs-algorithm-v2.md`'de tanımlı):**
1. Birim 18 ile paralel — Birim 17'nin verisi birikirken `inferredQuality` dağılımını izle (çoğunlukla 5 mi çıkıyor, yoksa gerçek bir varyans mı var?).
2. Eğer sinyal anlamlıysa: `scheduleNextReview`'ı gerçek SM-2 formülüne geçir (§3.2), küçük bir kullanıcı yüzdesinde dene (§3.4'ün A/B önerisi, kullanıcı sayısı yeterince büyüdüyse).
3. Kullanıcı sayısı hâlâ küçükse: tek kollu, gözlemsel karşılaştırma yap (Birim 2'nin 2.3 yaklaşımıyla aynı mantık).
4. Karar: yeni model tam açılır veya ikili model yeterli bulunup resmen kapatılır — ikisi de geçerli, belgeli bir sonuç.

**Definition of Done:** `03-srs-algorithm-v2.md`'nin kendi DoD'si — değişmedi.

**Bağımlılıklar:** Birim 17 + Birim 18'in en az bir turu tamamlanmış olmalı (aynı ölçüm altyapısını paylaşıyorlar).

---

### Birim 20 — Migration Kod Temizliği (teknik borç, düşük öncelik)

**Puan (mevcut durum):** 6/10 · **Öncelik:** P3

**Problem:** S8'de versiyon takibi eklendi ama bilinçli olarak ince bir katman olarak — mevcut üç göç fonksiyonu (`migrateLearningProgress`, `isLegacyQuestSet`, `isSeededDemoProfile`) davranış riski almamak için yeniden yazılmadı. Roadmap'in orijinal isteği ("her göç izole bir fonksiyon") tam anlamıyla gerçekleşmedi.

**Kapsam:**
- 20.1 — `migration_applied` telemetrisi birkaç ay boyunca sıfır göç gösterirse (Birim 8 §8.4'ün kendi kriteri), eski göç yollarını güvenle sil.
- 20.2 — Kalan göç kodunu roadmap'in orijinal taslağındaki gibi tam izole `migrateV0ToV1`/`migrateV1ToV2` fonksiyonlarına ayır (davranış testleri 16, 25, 28-31 değişmeden geçmeli).

**Definition of Done:** `08-migration-cleanup.md`'nin kendi DoD'si.

**Bağımlılıklar:** Birim 17'nin verisi (silme kararı için) + zaman (aylar, hafta değil).

---

## Sprint Eşlemesi

| Sprint | Odak | Faz | Bağımlılık |
|---|---|---|---|
| S13 | Mağaza/Hukuki İnceleme (Birim 13) | 2A | Yok — hemen başlanabilir |
| S14 | Gerçek Çoklu Cihaz Testi (Birim 14) | 2A | İkinci cihaz/emülatör kurulumu |
| S15 | Erişilebilirlik Tarayıcı + Dev Ortam Onarımı (Birim 15, 16) | 2A | Google hesabı erişimi |
| S16 | Analitik Altyapısı (Birim 17) | 2B başlangıcı | Yayına çıkmış olmak |
| S17+ | Parametre Kalibrasyonu + SM-2 Rollout (Birim 18, 19) | 2B | S16 + 2-4 hafta takvim süresi |
| Sürekli | Migration Temizliği (Birim 20) | 2B | Aylar süren telemetri birikimi |

## Öncelik sırası (hangi birim önce)

1. **Birim 13** — en yüksek risk, tek başına yayını bloklayabilir, kod gerektirmiyor, hemen başlanabilir.
2. **Birim 15** — mağaza politikaları bunu talep edebilir, orta efor.
3. **Birim 14** — düşük olasılıklı ama yüksek etkili bir veri kaybı riskini kapatıyor.
4. **Birim 16** — opsiyonel, sadece geliştirici deneyimini iyileştirir, kullanıcıyı etkilemez.
5. **Birim 17-20** — yayın sonrası, zaten kendi doğal sırasında.

## Bu doküman ne değildir

Bu bir "şimdi hepsini yap" listesi değil. Faz 2A bile hepsi aynı anda gerekli değil — Birim 13 gerçekten yayın öncesi zorunlu, geri kalanı ("güçlü tavsiye" seviyesinde) yayınla paralel de yürüyebilir. Faz 2B zaten tanım gereği yayından önce başlayamaz. Asıl disiplin yine aynı: hangi eksikliğin ne zaman, hangi önkoşulla kapanabileceğini net tutmak.

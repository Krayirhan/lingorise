# LingoRise — Birim Bazlı Geliştirme ve Sprint Planı

Tarih: 8 Eylül 2026  
Durum: S1 çekirdek uygulaması tamamlandı; S0 ve sonraki sprintler kanıt bekliyor.  
Referans: `b82a280` HEAD ve inceleme sırasında mevcut olan commit edilmemiş çalışma kopyası.  
Kapsam: Önceki değerlendirmedeki **33 birimin tamamı**.  
Başlangıç puanı: **58,4/100** — kod temelli, ağırlıklı değerlendirme; cihaz performansı ve canlı servis denetimi değildir.

## 1. Bu belge nasıl kullanılacak?

Bu dosya yapılacak işleri, neden gerekli olduklarını, şimdi yapılmayacak işleri, kabul kriterlerini ve uygulama sırasını tek yerde toplar. Kod, güncel testler ve yeniden üretilebilir davranışlar asıl kaynaktır. Eski yol haritalarındaki “tamamlandı” ifadeleri tek başına kanıt değildir.

### Sprint 1 durumu — tamamlandı (kod düzeltmesi ve yerel doğrulama)

- U09/U11/U06.1'in ilk çekirdek işleri uygulandı: cevap başına gerçek XP farkı ortak hesaplayıcıdan üretiliyor; feedback ve oturum özeti bu kaydı kullanıyor; sınavda tekrar deneme kapalı. Aktif oturum artık seçilen cevap, gönderilmişlik durumu, kalıcı oturum kimliği ve katalog sürümünü de saklıyor; katalog sürümü değişmiş eski oturum güvenle restore edilmiyor.
- Eklenen davranış testleri: yanlış cevapta 0 XP, pratikte görev bonusu dahil gerçek fark, sınavda görev bonusu olmadan gerçek fark ve sınav tekrar aksiyonunun kapalı olması.
- Doğrulama: `npm run typecheck` başarılı; `npm test` **430 başarılı / 0 başarısız**.
- S1 çekirdek çıkış kriterleri kapandı: yanlış/tekrar cevap 0 XP, görev bonusu doğru, 49/50 sınırı ve tek soru/tek puanlama için kod ve davranış testleri mevcut. Server taraflı sınav otoritesi ile gerçek cihaz/CI doğrulaması S3/S6/S8 yayın kapılarında takip edilir.

### Güncel sprint durumu

| Sprint | Durum | Kanıt / kalan ana iş |
|---|---|---|
| S0 | **Tamamlandı** | [S0 kapanış ve başlangıç kanıtı](19-s0-kapanis-ve-baslangic-kaniti.md); cihaz üzerinde doğrulanmamış noktalar S6/S8’e devredildi. |
| S1 | **Tamamlandı** | `npm run typecheck` ve `npm test` (431/0) geçti; exam duplicate kayıtları tekilleştirilerek 49/50 sınırı korunuyor. Server otoritesi ve cihaz/CI kanıtı yayın kapılarında takip edilir. |
| S2 | **Tamamlandı** | Storage migration/normalizasyonu, bozuk aktif oturum sanitizasyonu ve restart devamlılığı tamamlandı; `npm test` 433/0. Canlı hesap değişimi ve fiziksel cihaz kanıtı S3/S6’da doğrulanacak. |
| S3 | **Tamamlandı** | Merge/senkron kararları, local-only reset koruması, retry ve unknown-remote-state ayrımı testlerle doğrulandı; `npm test` 433/0. Gerçek iki cihaz, canlı rules ve offline fiziksel cihaz kanıtı S6/S8 yayın kapısıdır. |
| S4 | **Tamamlandı** | Tek katalog/runtime fallback, içerik sürümü, remote katalog duplicate/malformed filtreleme, tekrar planı ve seviye hazır olma kuralları doğrulandı; `npm test` 433/0. |
| S5 | **Tamamlandı** | TR/EN parity, accessibility roles/labels, 44px touch target, reduceMotion ve tercih aktarımı mevcut testlerle doğrulandı; `npm test` 433/0. Fiziksel TalkBack/büyük yazı kanıtı S6’da. |
| S6 | **Tamamlandı** | Typecheck, 433 test, Firestore rules emulator, Android debug build ve Pixel_9_Pro Maestro smoke geçti. Release keystore/artifact yayın kapısı S8’de. |
| S7 | **Tamamlandı** | Local/cloud save failure ve partial account deletion olayları telemetry sözlüğüne eklendi; kullanıcı uyarıları ve yerel event ring buffer mevcut. `npm test` 433/0. Merkezi analytics/support kanalı S8 sonrası ürün kararıdır. |
| S8 | **Kısmi tamamlandı / dış bağımlılık bekliyor** | Production-mode Android AAB yerelde üretildi ve hash’lendi; gerçek upload keystore’u, EAS production build ve Play Console yetkili hesabı olmadan uçtan uca yayın kapatılamıyor. |
| E1 | **Blokajlı — içerik üretimi bekliyor** | B1: 5, B2: 4 soru; kabul eşiği seviye başına 100 doğrulanmış soru. Eksik 191 sorunun uzman üretim ve dil incelemesi olmadan doldurulması güvenli değil. |
| E2 | Koşullu, başlamadı | C1/C2 içerik genişletmesi; E1 kapanışından sonra. |

- **Gerekli:** Mevcut kullanıcı vaadini yerine getirmek, doğrulanmış tutarsızlığı gidermek veya yayın için kritik davranışı doğrulamak için yapılır.
- **Koşullu:** Yalnız belirtilen ihtiyaç veya kanıt oluşursa yapılır. Ana sprintin zorunlu teslimatı değildir.
- **Şimdi gereksiz:** Mevcut hedefe katkısı kanıtlanmamış iş; sonsuza kadar yasak anlamına gelmez.
- **P0:** Yanlış sonuç, veri kaybı/karışması veya uygulamaya erişememe riski. Öncelikle doğrulanır ve çözülür.
- **P1:** Temel kullanıcı deneyimi, öğrenme tutarlılığı ve yayın için gerekli kalite.
- **P2:** Çekirdek doğruluğu sağlandıktan sonra yapılabilecek iyileştirme.
- **Kabul kriteri:** İşin tamamlanmış sayılması için görülebilir sonuç.
- **Doğrulama:** Sonucun hangi test veya gözlemle kanıtlanacağı.

Bir işin “gerekli” olması, önerilen teknik çözümün peşinen doğru olduğu anlamına gelmez. Önce sorun yeniden üretilir; ardından en dar yeterli çözüm uygulanır. Hesap, platform veya öğrenme davranışı değişiyorsa değişiklik ayrıca kayda geçirilir.

### Kapsam dışında kalan otomatik varsayımlar

Ödeme, reklam, sosyal ligler, sohbet, yapay zekâ öğretmeni, biyometrik giriş, karanlık tema, mikroservisler ve yeni bir yönetim paneli her mobil uygulama için zorunlu değildir. Bunların yokluğu bu planda otomatik iş oluşturmaz. Uygulama içindeki eksik dinleme bölümü, yeni bir dinleme ürünü inşa edilerek değil, mevcut kapsamın dürüst gösterilmesiyle de çözülebilir.

## 2. Başlangıç kanıtı ve belirsizlikler

### Koddan doğrulananlar

- Paket içeriği: A1 **320**, A2 **254**, B1 **5**, B2 **4**, C1 **4**, C2 **3**; toplam **590 soru**. Uzak katalogda aynı sayılar bulunduğu varsayılmayacak.
- `useAppSession.ts`: günlük pratik yalnız henüz ödüllendirilmemiş kelimeleri seçiyor; mevcut bölüm 30 kelime.
- `levelExam.ts`: hedef 60 soru, geçme eşiği 50 doğru; sınav bulunabilirliği şu an 50 sorudan başlıyor.
- `PracticeScreen.tsx` ve `FeedbackCard.tsx`: sınavda da doğru cevap gösterimi ve tekrar denemesi mümkün.
- `AppNavigator.tsx`: oturum kaydına gerçek XP farkı yerine soru ödülü gönderiliyor. Domain kontrolünde yanlış cevabın ve aynı gün hemen tekrarın gerçek XP farkı 0 olarak doğrulandı.
- `dailyRollover.ts`: tekrar zamanı gelen kelimeler varsa tekrar görevi üretiyor; günlük soru seçimi bu kuyruğu kullanmıyor.
- `ActiveSessionState`: ters yön ve gönderilmiş cevap durumu saklanmıyor.
- `LevelStep.tsx`: onboarding seviyelerini içerik hazırlığına göre engellemiyor; `LevelSwitcherModal.tsx` engelliyor.
- `WordNotebookModal.tsx` ve bazı navigator yolları sabit `allQuestions` kullanıyor.
- Önceki turda tip kontrolü geçti, test paketi **422 başarılı / 0 başarısız** raporladı. Bunların bir kısmı kaynak metni kontrolüdür; 422 uçtan uca senaryo değildir.

### Yeniden üretim veya canlı kanıt gerektirenler

- Aynı cihazda hesap değiştirme, giriş sırasında devam eden cevap ve sıfırlamadan sonra geç tamamlanan bulut yazılarının etkisi.
- İki cihazın eşzamanlı değişikliklerinin korunması; mevcut birleştirme fonksiyonunun varlığı uçtan uca güvence değildir.
- Android App Check başlangıcının paketlenmiş uygulamada davranışı; desteklenecekse iOS/web uyumu.
- Gerçek cihazda açılış süresi, kare hızı, bellek, büyük yazı ve ekran okuyucu kullanımı.
- Güncel CI, Play Console, dağıtılmış binary, Firebase rules ve App Check enforcement durumu.

Bu ikinci listedeki konular “kesin arıza” diye raporlanmayacak. Önce kanıt üretilecek; sorun yoksa yeni kod yerine doğrulama kaydı yeterlidir.

## 3. S0'da netleşecek ürün kararları

| Karar | Planın önerdiği başlangıç | Etkilenen birimler |
|---|---|---|
| D01 — İlk yayın kapsamı | Android, A1–A2; B1–C2 hazır görünmez. iOS/web desteği ayrıca doğrulanır. | U02, U08, U22, U30 |
| D02 — Günlük öğrenme | Günlük pratik yeni kelime odaklı kalır. Otomatik tekrar görevi ve çalışmayan hatırlatma vaadi kaldırılır/gizlenir. Eski kayıtlar korunur. Ayrı tekrar modu koşulludur. | U06, U10, U12 |
| D03 — Sınav | Tam 60 benzersiz soru, soru başına tek puanlanan cevap, en az 50 doğru. Cevap açıklamaları sınav sonunda; ipucu/tekrar sınav sonucunu etkileyemez. | U09, U11, U22 |
| D04 — Seri ve gün | Seri en az bir tamamlanmış öğrenme eylemiyle ilerler. Kullanıcının yerel takvim günü esas alınır; saat dilimi değişimi davranışı belgelenir. | U12, U14, U15 |
| D05 — Hesap değiştirme | Misafir kaydı ve hesap kayıtları ayrıdır. Bir hesabın verisi başka hesaba otomatik taşınmaz. Misafir ilerlemesinin bağlanması açık bir akıştır. | U13–U17, U33 |
| D06 — Yayın kontrolü | Otomatik derleme ile mağazada yayın farklı aşamalardır. Dağıtım, hesap bağlantısı, ücretli servis ve dışarı veri aktarımı ayrıca somut olarak değerlendirilir. | U16, U27–U30 |

Bu tablo kullanıcı tarafından verilmiş kararların yerine geçmez. Öneriler uygulamaya başlamadan önce mevcut talimatlarla karşılaştırılır. Mevcut davranışı değiştiren D02–D05 için kabul edilen sonuç kaydedilir. Karar bekleyen iş, karar dışındaki okuma/test hazırlığını engellemez.

## 4. Birim bazlı iş listesi

Her `Uxx.n` benzersiz iş kimliğidir. Sprintler bu işleri tekrar yazmak yerine kimlikleriyle referans alır. Birim birden fazla sprintte ilerleyebilir; tamamlanma bütün gerekli maddeler ve kabul kriteri sağlanınca verilir.

### U01 — Ürün amacı ve marka bütünlüğü · 85/100 · P2 · S0 / S5

**Gerekli**
- [ ] U01.1 — Bir sayfalık güncel ürün sözleşmesi yaz: hedef kullanıcı, gerçekten sunulan seviyeler, günlük eylem, öğrenildi ve sınavı geçildi ayrımı.
- [ ] U01.2 — Bahçe, XP, seri ve seviye terimlerini aynı anlamla kullanan küçük bir metin sözlüğü oluştur; görünür metinleri buna göre kontrol et.

**Koşullu:** Yeni hedef kitleye açılma veya kullanıcıların metaforu anlamaması halinde kısa kullanılabilirlik çalışması.

**Şimdi gereksiz:** Yeni marka adı, maskotun baştan çizimi, tam görsel kimlik yenileme.

**Kabul / doğrulama:** Ana ekran, pratik ve ilerleme aynı başarıyı farklı anlamlarla anlatmaz. Beş temel akışın ekran metinleri ürün sözleşmesiyle karşılaştırılır.

**Kod alanı:** `src/i18n/`, `src/features/home/`, `docs/17-lingorise-learning-garden-product-rule.md`.

### U02 — Onboarding · 70/100 · P1 · S4

**Gerekli**
- [ ] U02.1 — Onboarding ve sonraki seviye seçicisinde tek hazırlık kuralı kullan; hazır olmayan seviyeye yanıltıcı başlangıç sunma.
- [ ] U02.2 — İleri, geri, atla, misafir ve hesap yollarının seçilen hedef/seviyeyi koruduğunu doğrula.
- [ ] U02.3 — Bildirim reddini normal durum olarak işle; izin verilmeden açık tercih kaydetme.

**Koşullu:** Ölçülen başlangıç terk oranı yüksekse adım sayısını azalt.

**Şimdi gereksiz:** Yeni tanıtım animasyonları, zorunlu kayıt, ihtiyaç kanıtı olmayan seviye tespit sınavı.

**Kabul / doğrulama:** Yeni kurulumdan hazır bir seviyede ilk soruya ulaşılır; geri/atla yolları boş veya içeriksiz oturum açmaz. Maestro ve izin reddi cihaz kontrolü.

**Kod alanı:** `OnboardingScreen.tsx`, `features/onboarding/`, `LevelCard.tsx`.

### U03 — Navigasyon · 75/100 · P1 · S2 / S5

**Gerekli**
- [ ] U03.1 — Sekme, donanım geri tuşu, modal kapatma, pratikten çıkma ve oturum bitişi için geçiş tablosu oluştur.
- [ ] U03.2 — `lingorise://` bağlantılarını yeni kurulum, açık uygulama ve aktif oturumda sınırla; onboarding veya oturum kararını sessizce atlamasın.
- [ ] U03.3 — Tanınmayan bağlantı ve hızlı tekrarlanan geçişlerin güvenli davranışını doğrula.

**Koşullu:** Mevcut geçiş modeli somut biçimde yetersiz kalırsa navigasyon kütüphanesi değerlendir.

**Şimdi gereksiz:** Yalnız standart olsun diye tüm yönlendirmeyi yeniden yazmak.

**Kabul / doğrulama:** Geçiş matrisi için çıkmaz ekran, kaybolan aktif oturum veya çift tamamlama yok. S2 oturum testleri ve S5 cihaz geri tuşu testleri.

**Kod alanı:** `AppNavigator.tsx`, `AppBootstrap.tsx`, `useAppSession.ts`.

### U04 — Ana ekran ve eylem önceliği · 78/100 · P1 · S4 / S5

**Gerekli**
- [ ] U04.1 — Sıfır ilerleme, devam eden gün, günlük hedef bitişi, kelimelerin tükenmesi ve sınavın geçilmesi durumlarını ayrı tanımla.
- [ ] U04.2 — Her durumda yapılabilir bir sonraki eylem göster; “sırada sınav var” mesajı sınavı geçmiş kullanıcıya kalmasın.
- [ ] U04.3 — Günlük XP hedefini gerçek ödül politikasıyla uzlaştır; kesin olmayan tahmini kesin kazanç gibi sunma.

**Koşullu:** Cihaz incelemesi temel eylemin görünmediğini gösterirse kart sırasını değiştir.

**Şimdi gereksiz:** Yeni dashboard kartları, sosyal akış veya daha fazla sayaç.

**Kabul / doğrulama:** Beş durum için eylem ve sayaç kontrolü; kelimesi biten kullanıcıya “yarın yeni kelimeler” vaadi yok.

**Kod alanı:** `useHomeViewModel.ts`, `HomeScreen.tsx`, `GardenHeroCard.tsx`.

### U05 — Görsel sistem ve bileşen tutarlılığı · 68/100 · P2 · S5

**Gerekli**
- [ ] U05.1 — Aynı görevi yapan ana/ikincil/tehlikeli eylemler için mevcut bileşenleri tutarlı kullan.
- [ ] U05.2 — Görünür metin, boşluk, renk ve diyalog farklılıklarını ekran bazında düzelt; yalnız kanıtlı tekrarları ortaklaştır.

**Koşullu:** Çok sayıda ekranda aynı değişiklik gerekiyorsa ilgili stil için ortak token çıkar.

**Şimdi gereksiz:** Yeni tasarım sistemi paketi, tüm StyleSheet'leri taşımak, görsel moda değişiklikleri.

**Kabul / doğrulama:** Ana ekranlar ve hata/onay durumlarının güncel ekran görüntüsü karşılaştırması; anlamı aynı düğmeler aynı hiyerarşide.

**Kod alanı:** `src/theme/`, `PrimaryButton.tsx`, `AppDialog.tsx`, ekran stilleri.

### U06 — Temel kelime pratiği · 76/100 · P1 · S1 / S4

**Gerekli**
- [ ] U06.1 — Tek dokunuşun tek cevap üretmesini sağla; gecikmeli kontrol, çift basma ve ekrandan çıkma yarışlarını doğrula.
- [ ] U06.2 — Son bölümde seçilen oturum boyutundan az kelime kaldığında gerçek soru sayısını göster; boş oturumu açıklamalı sonuca yönlendir.
- [ ] U06.3 — Ters yönde yeterli seçenek yoksa modu sessizce değiştirme; açıklamalı davranış belirle. Klavye kısayolları varsa ekrandaki karıştırılmış sıra ile eşleştir.

**Koşullu:** Kullanım verisi veya açık ürün isteği varsa yeni soru türü.

**Şimdi gereksiz:** Yazma, konuşma, cümle sıralama modlarını mevcut sorunlar çözülmeden eklemek.

**Kabul / doğrulama:** 1–2 kelime kalan bölüm, iki yön, hızlı dokunma ve çıkış sırasında cevap kontrolleri geçer; bir eylem iki ödül oluşturmaz.

**Kod alanı:** `usePracticeSession.ts`, `useAppSession.ts`, `PracticeScreen.tsx`, `reverseMode.ts`.

### U07 — Açıklamalar ve içerik niteliği · 60/100 · P1 · S4 / E1 / E2

**Gerekli**
- [ ] U07.1 — A1–A2 içeriklerini anlam, sözcük türü, doğal örnek, çeviri ve aynı anda doğru olabilecek seçenekler bakımından incele; sorunları kelime kimliğiyle kaydet.
- [ ] U07.2 — Genel ipuçlarını yanıltıcı olmayan faydalı metinle değiştir veya kaldır; ipucu cevabı doğrudan vermesin.
- [ ] U07.3 — Zorluk/XP formülünü pedagojik sertifika gibi sunma; belirsiz seviye etiketlerini içerik incelemesinde düzelt.

**Koşullu:** CEFR kapsamı iddiası için yetkin dil incelemesi; yeni içerik dalgaları E1/E2'de.

**Şimdi gereksiz:** Kalite incelemesiz toplu kelime üretimi, metin dolu olsun diye şablon örnekler.

**Kabul / doğrulama:** Yapısal doğrulama bütün kayıtları kapsar; anlam/örnek incelemesi kaydı vardır. Otomatik testler dilsel doğruluğun kanıtı sayılmaz; dil incelemesi bitmediyse kapsam açıkça belirtilir.

**Kod alanı:** `src/content/questions/`, `src/content/vocabulary/`.

### U08 — Müfredat kapsamı · 38/100 · P1 · S0 / S4 / E1 / E2

**Gerekli**
- [ ] U08.1 — İlk yayın kapsamını uygulama ve mağaza metninde gerçek içerikle eşleştir.
- [ ] U08.2 — Hazırlık eşiğini bütün giriş yollarında uygula; 100 soru bulunmasını pedagojik seviye tamamlığıyla eşitleme.
- [ ] U08.3 — Uzak ve paket kataloglarının seviye/sürüm kapsamını ayrı doğrula; seviye bitince sonraki hazır eylemi göster.

**Koşullu:** Tam A1–C2 hedefi korunursa E1/E2 zorunlu genişletme aşamasına dönüşür; A1–A2 yayınının önkoşulu değildir.

**Şimdi gereksiz:** Sırf eşiği geçmek için benzer veya düşük kaliteli sorularla sayıyı artırmak.

**Kabul / doğrulama:** Kullanıcı içeriksiz seviyeye gönderilmez. Gösterilen kapsam hem çevrimiçi hem çevrimdışı katalogda karşılanır.

**Kod alanı:** `content/questions/index.ts`, `LevelStep.tsx`, `LevelSwitcherModal.tsx`, mağaza metinleri.

### U09 — Sınav ve ölçme güvenilirliği · 40/100 · P0 · S1

**Gerekli**
- [ ] U09.1 — D03'e göre her soru için tek puanlanan cevap ve benzersiz sınav kimliği kullan; yanlış sonrası öğrenme denemesi sınav puanına eklenmesin.
- [ ] U09.2 — İpucu, doğru cevabı gösterme ve tekrar denemeyi sınavın değerlendirme aşamasından ayır.
- [ ] U09.3 — 60 soruluk sınav için 60 benzersiz geçerli soru şartı koy; 50–59 soruluk katalog davranışını düzelt.
- [ ] U09.4 — Geçme kaydını yalnız tamamlanmış geçerli oturumdan bir kez üret; yeniden açılış ve tekrar gönderim aynı sınavı iki kez bitirmesin.

**Koşullu:** Belgeli sertifika/yarışma ürünü olursa sunucuda sınav otoritesi. Mevcut kişisel öğrenme için zorunlu değildir.

**Şimdi gereksiz:** Gözetmenlik, kamera, cihaz parmak izi veya karmaşık hile önleme sistemi.

**Kabul / doğrulama:** 49 doğru kalır, 50 doğru geçer; 60 soruda en fazla 60 puanlanan cevap vardır. Cevabı görüp yeniden deneme, çift dokunma ve restart geçişi manipüle edemez.

**Kod alanı:** `levelExam.ts`, `useAppSession.ts`, `AppNavigator.tsx`, `PracticeScreen.tsx`.

### U10 — Tekrar ve kalıcı öğrenme · 42/100 · P1 · S0 / S4

**Gerekli**
- [ ] U10.1 — D02 sonucunu günlük seçim, görev üretimi, hatırlatma düğmesi ve metinlerde birlikte uygula.
- [ ] U10.2 — Varsayılan yeni-kelime modelinde otomatik tekrar görevi üretme; işlevsiz “tekrar listeme ekle” vaadini kaldır/gizle. Kelime defterinden bilinçli çalışma korunabilir.
- [ ] U10.3 — Eski learningProgress kayıtlarını koru; SRS kodunu silmeden önce kullanım ve migration bağımlılıklarını doğrula.

**Koşullu:** Ayrı tekrar modu seçilirse kuyruğa giriş, boş durum, seviye kapsamı, ödül ve tamamlanma birlikte tasarlanır; yalnız düğme eklenmez.

**Şimdi gereksiz:** SM-2 yerine yeni algoritma, veri olmadan kalite katsayısı kalibrasyonu, FSRS geçişi.

**Kabul / doğrulama:** Dün doğru öğrenilmiş kelimeyle ertesi gün açılışta erişilemeyen görev oluşmaz. Hatırlatma varsa gerçek tüketici akışı test edilir; yoksa vaat görünmez.

**Kod alanı:** `dailyRollover.ts`, `badges.ts`, `useAppSession.ts`, `bookmarkQuestion`, `spacedRepetition.ts`.

### U11 — XP ve ödül tutarlılığı · 50/100 · P0 · S1

**Gerekli**
- [ ] U11.1 — Cevap sonucunu doğru/yanlış, kelime XP'si, görev bonusu ve toplam farkla tek hesaplama sonucundan üret.
- [ ] U11.2 — Feedback, oturum özeti, günlük geçmiş ve toplam XP aynı gerçek farkı kullansın; yanlış ve ödülsüz tekrar 0 gösterilsin.
- [ ] U11.3 — İpucunun kullanılmış olduğunu görünürlükten ayrı takip et; ipucunu kapatmak ödül indirimini geri almasın.
- [ ] U11.4 — Oturum cevap kaydı tekrar denemeleri ve görev bonuslarını çift saymasın; eski oturumların dönüştürülmesini U22 ile birlikte ele al.

**Koşullu:** Kullanıcıların davranışına ilişkin veri oluşursa ödül miktarlarını kalibre et.

**Şimdi gereksiz:** Yeni para birimi, mağaza, ücretli ödül veya XP ekonomisini baştan kurmak.

**Kabul / doğrulama:** Test matrisinde oturum sonu XP toplamı ile başlangıç/son kullanıcı XP farkı eşittir. Yanlış, tekrar, ipucu, son görev cevabı ve sınav ayrı kapsanır.

**Kod alanı:** `answer.ts`, `useUserProgress.ts`, `AppNavigator.tsx`, `FeedbackCard.tsx`, `SessionSummaryCard.tsx`.

### U12 — Günlük görev, seri ve rozet · 65/100 · P1 · S2 / S4

**Gerekli**
- [ ] U12.1 — D04'e göre uygulamayı açma ile öğrenme etkinliğini ayır; eski seri kayıtlarına geçiş davranışını belirle.
- [ ] U12.2 — Yerel gün hesabını tek yerden yürüt; uygulama açıkken gece yarısı ve arka plandan dönüşte görev devrini kontrol et.
- [ ] U12.3 — Oturum boyutu gün içinde değiştiğinde görev hedefinin ne olacağını açıklaştır; başlamış görevi sessizce değiştirme.
- [ ] U12.4 — Sınav geçildiği anda ilgili rozetleri yeniden değerlendir; sonraki soruyu beklemesin. Kutlamaları bir kez göster.

**Koşullu:** Gerçek kullanıcı ihtiyacı varsa seri dondurma.

**Şimdi gereksiz:** Ligler, cezalar, kullanıcıyı zorlayan günlük bildirimler.

**Kabul / doğrulama:** Açılış tek başına çalışma serisini artırmaz; gece yarısı, saat dilimi değişimi, görev bonusu ve ikinci sınav rozeti senaryoları geçer. Eski kazanımlar migration'da kaybolmaz.

**Kod alanı:** `clock.ts`, `streak.ts`, `dailyRollover.ts`, `badges.ts`, `useUserProgress.ts`.

### U13 — Kayıt, giriş ve hesap yönetimi · 72/100 · P1 · S2 / S3

**Gerekli**
- [ ] U13.1 — Kayıt/giriş/sıfırlama/doğrulama/çıkış akışlarını başarılı ve başarısız servis yanıtlarıyla test et; gönderim sırasında çift işlem oluşmasın.
- [ ] U13.2 — Firebase kimlik doğrulaması başarılı fakat ilerleme birleştirmesi başarısız olduğunda durumu ayrı göster.
- [ ] U13.3 — Profil adı güncelleme hatasını başarı gibi kapatma; alan doğrulaması ve dil uyumunu sağla.

**Koşullu:** Kullanıcı talebi veya ölçülen giriş sürtünmesi varsa sosyal giriş.

**Şimdi gereksiz:** Zorunlu hesap, özel kimlik doğrulama sunucusu, kişisel kelime uygulaması için zorunlu MFA.

**Kabul / doğrulama:** Ağ reddi, hatalı parola, profil güncelleme hatası ve merge hatası anlaşılırdır; hesap değişimi U17'deki ayrımı korur.

**Kod alanı:** `auth.ts`, `AuthScreen.tsx`, `AccountManagementCard.tsx`, `AppBootstrap.tsx`.

### U14 — Yerel kayıt ve migration · 60/100 · P0 · S2

**Gerekli**
- [ ] U14.1 — UserData alanlarını normalizasyonla karşılaştır; örneğin `consecutiveWrongCount` gibi geçerli alanlar load/save döngüsünde kaybolmasın.
- [ ] U14.2 — Bozuk, eksik, eski ve gelecekteki şema verisini ayırt et; bozuk ham kaydı sessizce varsayılanla ezmeden korunabilir hata davranışı sağla.
- [ ] U14.3 — Arka arkaya yerel yazıların eski snapshot'ı en son kalıcılaştırmadığını doğrula; gerekiyorsa dar bir yazma sıralaması uygula.
- [ ] U14.4 — Migration'ları tekrar çalıştırmanın sonucu değiştirmediğini ve depolama hatasının kullanıcıya doğru bildirildiğini test et.

**Koşullu:** Ölçülen veri hacmi/işlem ihtiyacı AsyncStorage'ı aşarsa SQLite.

**Şimdi gereksiz:** Veritabanı değiştirmek, genel repository framework'ü kurmak.

**Kabul / doğrulama:** v1/v2/v3, bozuk JSON, geçersiz alan, yazı reddi ve peş peşe cevap fixture'larında geçerli ilerleme korunur; sessiz sıfırlama yok.

**Kod alanı:** `storage.ts`, `types/user.ts`, `useUserProgress.ts`.

### U15 — Bulut senkronizasyonu · 55/100 · P0 · S3

**Gerekli**
- [ ] U15.1 — İki cihaz ve yavaş ağ ile aynı anda cevap, ayar değişimi, login merge ve geç yazı senaryolarını yeniden üret.
- [ ] U15.2 — Hesap başına son bekleyen snapshot ve senkron durumunu kalıcı tut; hata sonrası sonraki açılış/bağlantı fırsatında kontrollü yeniden dene.
- [ ] U15.3 — Girişte/yeniden bağlanmada okuma-birleştirme-yazma politikasını uygula; eski snapshot yeni öğrenmeyi ezmesin. Tek taraflı kör tam durum yazısını sınırla.
- [ ] U15.4 — Sıralama, yeniden deneme ve duplicate isteklerde idempotency doğrula; logout/reset/delete bekleyen işleri ilgili hesap için geçersiz kılsın.
- [ ] U15.5 — Bekliyor, eşitlendi ve başarısız durumlarını gerçek başarıyla göster; oturum açmış olmak senkron başarısı sayılmasın.

**Koşullu:** İki cihaz testleri snapshot yaklaşımının yetersizliğini gösterirse transaction veya olay kimlikli kayıt; gerçek zamanlı dinleyici ancak ürün ihtiyacı varsa.

**Şimdi gereksiz:** CRDT, event-sourcing platformu, her alan için ayrı kuyruk altyapısı.

**Kabul / doğrulama:** İki cihazda farklı kelimeler ve aynı kelime cevapları kaybolmaz; ağ geri geldiğinde son değişiklikler birleşir. Sayaçlar için “birleştirme” anlamı açık ve testlidir; çift sayma yok.

**Kod alanı:** `firestore.ts`, `progressMerge.ts`, `remoteSync.ts`, `useUserProgress.ts`, `AppBootstrap.tsx`.

### U16 — Erişim kontrolü ve güvenlik · 62/100 · P0/P1 · S0 / S3 / S8

**Gerekli**
- [ ] U16.1 — Sahip/başka kullanıcı/misafir erişimi ile create/update/delete senaryolarını rules emülatöründe doğrula; kullanılan alt koleksiyonları dahil et.
- [ ] U16.2 — İstemci tarafından yazılan alanların gerçek veri şekline göre makul tip/sınır kontrollerini tamamla; server otoritesi varmış gibi iddia etme.
- [ ] U16.3 — App Check köprüsünü native dağıtımda doğrula; doğrulanmış token üretimi görülmeden enforcement açma. Başlangıç hatasını gözlenebilir kıl.
- [ ] U16.4 — Yayın artifact'inde debug seçenekleri, imza kaynağı, izinler ve gömülü sırlar bakımından denetim yap; kimlik bilgilerini rapora kopyalama.

**Koşullu:** Rekabet, ödeme veya sertifika eklenirse sunucu taraflı sonuç doğrulama.

**Şimdi gereksiz:** Firebase client config'i sır sayarak bütün mimariyi değiştirmek, ihtiyacsız anti-cheat sistemi.

**Kabul / doğrulama:** Yetkisiz çapraz hesap okuma/yazma/silme reddedilir; yayın binary'sinin kimliği kayıtlıdır. Canlı enforcement durumu doğrulanmadıysa açık bırakılan iş olarak görünür.

**Kod alanı:** `firestore.rules`, `firestoreRules.test.ts`, `appCheck.ts`, Android/EAS yapılandırması.

### U17 — Hesaplar arası veri ayrımı · 55/100 · P0 · S2 / S3

**Gerekli**
- [ ] U17.1 — Yerel hesap sahipliğini belirle; misafir ve UID bazlı kayıtları ayır. Eski ortak kaydın sahipliği belirsizse otomatik olarak başka hesaba atama.
- [ ] U17.2 — Misafir ilerlemesini hesaba bağlama davranışını D05'e göre uygula; mevcut hesap verisiyle birleştirme açık olsun.
- [ ] U17.3 — Hesap değiştiğinde state, aktif oturum ve bekleyen yazılar doğru hesaba bağlansın; önceki hesaba ait geç callback yeni hesaba etki etmesin.

**Koşullu:** Açık kullanıcı talebi varsa cihaz üzerinde profil seçicisi.

**Şimdi gereksiz:** Çok kiracılı kurumsal hesap sistemi veya aile paketi.

**Kabul / doğrulama:** Misafir → A → çıkış → B → A döngüsü, çevrimdışı geçiş ve gecikmiş yazıyla test edilir; B, A'nın ilerlemesini devralmaz.

**Kod alanı:** `storage.ts`, `auth.ts`, `AppBootstrap.tsx`, `useUserProgress.ts`.

### U18 — Çevrimdışı kullanım ve açılış · 70/100 · P1 · S0 / S3

**Gerekli**
- [ ] U18.1 — Yeni kurulum, önbellekli kurulum ve oturum açmış cihazda internet yokken paket içeriğine erişimi doğrula.
- [ ] U18.2 — Firebase/App Check/katalog yüklemesi için başlangıç hata sınırlarını gözden geçir; sonsuz spinner veya yakalanmayan modül başlangıç hatası olmasın.
- [ ] U18.3 — Toplam açılış beklemesini ölç; ayrı timeout'ların birikmesini yönet. Önbellek doğrulaması başarısızsa paket içeriğine dön.

**Koşullu:** Ölçülen bekleme uzunsa önce yerel içerikle açıp uzaktaki kataloğu kontrollü yenile.

**Şimdi gereksiz:** Büyük çevrimdışı framework, bütün veriyi önceden indirmek.

**Kabul / doğrulama:** Uçak modunda hesap zorunluluğu olmadan pratik yapılır; çevrimdışı yazılar korunur. Eksik deployment config'i anlaşılır hata üretir; çalışma ortamında otomatik düzeltilmiş sayılmaz.

**Kod alanı:** `AppBootstrap.tsx`, `firebase.ts`, `appCheck.ts`, `catalogueService.ts`.

### U19 — Ekran ve klavye uyumu · 65/100 · P1 · S5

**Gerekli**
- [ ] U19.1 — Küçük Android ekranı, yaygın telefon, büyük yazı ve klavye açıkken kritik ekranları kontrol et.
- [ ] U19.2 — Taşan buton, kesilen metin, erişilemeyen modal ve klavye altında kalan form alanlarını düzelt.
- [ ] U19.3 — Dokunma alanını görsel boyuttan bağımsız kontrol et; yatay ekran desteklenmiyorsa kilidi tutarlı koru.

**Koşullu:** Tablet pazarlaması yapılacaksa tablet yerleşim testi ve gerekirse düzenleme.

**Şimdi gereksiz:** Telefon odaklı ürün için masaüstü dashboard veya katlanabilir cihaza özel tasarım.

**Kabul / doğrulama:** Destek matrisi üzerindeki temel eylemler kaydırma/klavye nedeniyle erişilemez olmaz; cihaz ve yazı boyutu kanıtı kaydedilir.

**Kod alanı:** `screens/`, `features/`, `GlobalAppLayout.tsx`, modal bileşenleri.

### U20 — Erişilebilirlik · 60/100 · P1 · S5 / S6

**Gerekli**
- [ ] U20.1 — Temel akışları TalkBack ile baştan sona dene; seçenek durumu, cevap geri bildirimi, hata ve modal odağı anlaşılır olsun.
- [ ] U20.2 — Sistem hareket azaltma tercihi ile uygulama tercihini tutarlı birleştir; varsayılan false sistem tercihini sessizce geçersiz kılmasın.
- [ ] U20.3 — Renk dışında doğru/yanlış bilgisi, anlamlı etiketler, büyük yazı ve eylem hedeflerini düzelt.

**Koşullu:** iOS destek kapsamına alınırsa VoiceOver doğrulaması.

**Şimdi gereksiz:** Çalışan etkileşimi sınamadan yalnız etiket sayısını artırmak; özel erişilebilirlik modu yapmak.

**Kabul / doğrulama:** Ekran okuyucuyla onboarding → pratik → sonuç → profil tamamlanır. Kaynak kodda etiket bulunması tek başına yeterli değildir.

**Kod alanı:** `AnswerList.tsx`, `AppDialog.tsx`, `usePracticeFeedback.ts`, ekranlar.

### U21 — Performans ve kaynak kullanımı · 60/100 · P1 · S6

**Gerekli**
- [ ] U21.1 — Release build'de düşük/orta cihaz için soğuk açılış, soru geçişi, liste kaydırma, bellek ve oturum başına ağ çağrısı temel ölçümünü al.
- [ ] U21.2 — Profillemede görülen gereksiz yeniden render, tekrarlanan tam veri yazısı, pahalı liste hesabı veya büyük görseli hedefli düzelt.
- [ ] U21.3 — Uzun oturum ve çok kez aç/kapat döngüsünde timer, ses, animasyon ve listener temizliğini doğrula.

**Koşullu:** Ölçüme göre indeksleme, memoization veya görsel boyutu azaltma.

**Şimdi gereksiz:** Her yere useMemo/useCallback koymak, ölçmeden storage/mimari değiştirmek.

**Kabul / doğrulama:** Öncesi/sonrası ölçümleri aynı cihaz/build şartında kaydedilir; yeni takılma/kalıcı bellek artışı yok. Sayısal bütçeler S0/S6 temel ölçümünden sonra kararlaştırılır; ölçülmemiş performans iddiası yok.

**Kod alanı:** `useUserProgress.ts`, `useAppSession.ts`, `WordNotebookModal.tsx`, görseller.

### U22 — Oturum devamlılığı ve platform uyumu · 35/100 · P0 · S0 / S2 / S6

**Gerekli**
- [ ] U22.1 — Aktif oturum şemasına yön, puanlanan cevap kimliği, gönderilmişlik, sınav kimliği ve gerekli katalog sürümü bilgisini ekle; eski kayda migration tanımla.
- [ ] U22.2 — Soru gösterimi, cevap gönderimi, son soru ve tamamlanma anlarında zorla kapatıp açma senaryolarını test et; yeniden ödül/puan üretme.
- [ ] U22.3 — Katalogdan kaldırılmış soru veya eksik kayıt için açıklamalı devam/sonlandırma davranışı belirle.
- [ ] U22.4 — Desteklenen platformlarda native modül yüklemelerini doğrula. Desteklenmeyen platformu yanlışlıkla çalışır ilan etme.

**Koşullu:** iOS/web yayın kararı varsa o platformda native sağlayıcı/alternatif ve ayrı build doğrulaması.

**Şimdi gereksiz:** Android yayınına yetişmek için üç platformu aynı anda tamamlamak.

**Kabul / doğrulama:** Ters oturum ters kalır; cevap sonrası yeniden açılış aynı soruyu ikinci kez puanlamaz. Eski oturum fixture'ları güvenli dönüştürülür veya açıklamalı kapatılır.

**Kod alanı:** `ActiveSessionState`, `useAppSession.ts`, `storage.ts`, `appCheck.ts`.

### U23 — Mimari ve sorumluluklar · 72/100 · P2 · S1 / S2 / S3

**Gerekli**
- [ ] U23.1 — Cevap değerlendirme, kalıcı yazı ve UI bildirimi sınırlarını düzelt; React state updater içindeki yan etkileri ilgili hata düzeltmeleriyle birlikte ayır.
- [ ] U23.2 — Saf veri normalizasyonunu I/O'dan ayırarak domain → AsyncStorage dolaylı bağımlılığını azalt; aynı iş mantığını iki kez yazma.
- [ ] U23.3 — Değiştirilen hesap yollarındaki doğrudan Firebase çağrılarını mevcut servis katmanından geçir.

**Koşullu:** Tek dosya değişiklikleri sürekli çakışıyorsa küçük sorumluluk parçalarına ayır.

**Şimdi gereksiz:** Redux/Zustand geçişi, dependency-injection framework'ü, tüm klasör ağacını yeniden adlandırma.

**Kabul / doğrulama:** Etkilenen domain fonksiyonları native/ağ ortamı olmadan davranış testine girer; aynı cevap için iki ayrı XP hesabı kalmaz.

**Kod alanı:** `useUserProgress.ts`, `remoteSync.ts`, `storage.ts`, hesap bileşenleri.

### U24 — Kod bakımı ve tip güvenliği · 65/100 · P2 · S1–S6

**Gerekli**
- [ ] U24.1 — Değiştirilen alanlarda `any`, doğrulanmadan cast edilen veriler ve yanlış yorumları temizle; sınır verilerini çalışma zamanında kontrol et.
- [ ] U24.2 — Kullanılmayan öğeleri yalnız referans taraması ve davranış doğrulaması sonrası kaldır; eski export uyumluluğunu koru.
- [ ] U24.3 — Ürün sözleşmesi, README ve değiştirilen kod yorumlarını yeni davranışla eşleştir; eski tarihli raporları geriye dönük yeniden yazma.

**Koşullu:** Mevcut ihtiyaçla gerekçelenen dar lint kuralları.

**Şimdi gereksiz:** Bütün depoyu biçimlendirme, toplu rename, test geçsin diye tip güvenliğini gevşetme.

**Kabul / doğrulama:** Tip kontrolü temiz; değiştirilen davranışın açıklaması doğru. Diff yalnız hedef işleri ve doğrudan gerekli refactor'u kapsar.

**Kod alanı:** Sprintte değişen dosyalar, `tsconfig.json`, güncel kullanım belgeleri.

### U25 — Davranış testleri · 55/100 · P0/P1 · S1–S6

**Gerekli**
- [ ] U25.1 — P0 sorunlar için düzeltmeden önce başarısız davranış senaryosu oluştur; XP, sınav, migration, hesap ayrımı ve restart öncelikli.
- [ ] U25.2 — Kaynak metni arayan kontrolleri gerçek davranış testleriyle destekle; davranışı zaten test edilen kırılgan metin kontrollerini gerekçeyle azalt.
- [ ] U25.3 — Auth/AsyncStorage/Firestore sınırlarını hata, gecikme ve yarış koşuluyla test et; mock sonucunu gerçek servis doğrulaması gibi raporlama.
- [ ] U25.4 — Maestro kapsamına gerçek cevap, oturum sonucu, restart ve temel ayar akışları ekle; sadece pratik merkezine ulaşmayı yeterli sayma.

**Koşullu:** Mevcut test çalıştırıcısı gerçek ihtiyaçları karşılamazsa küçük bir test runner geçişi.

**Şimdi gereksiz:** Yüzde 100 coverage hedefi, implementation'ı kopyalayan test, her stil satırına test.

**Kabul / doğrulama:** Kritik hata matrisi gerçek fonksiyon/akışlarla doğrulanır. Toplam test sayısı başarı ölçütü değildir; yeni testin neyi yakaladığı belgelenir.

**Kod alanı:** `tests/`, `.maestro/`, gerekli test edilebilir sınırlar.

### U26 — İçerik kaynağının bütünlüğü · 55/100 · P1 · S4

**Gerekli**
- [ ] U26.1 — Pratik, kelime defteri, önerilen kelime eylemi ve konu dağılımında aynı aktif katalog erişimini kullan.
- [ ] U26.2 — Kelime metniyle eşleştirme yerine kimlik taşı; farklı seviyelerde aynı kelime yanlış soruya yönlendirmesin.
- [ ] U26.3 — Uzak sürüm/önbellek/paket birleştirmesinde eksik alan, duplicate ID, geçersiz kayıt ve sadece uzakta bulunan kelime senaryolarını doğrula.
- [ ] U26.4 — Aktif oturum sırasında katalog değişimini sabitle veya güvenli geçiş tanımla; kayıtlı soru aniden anlam değiştirmesin.

**Koşullu:** Ölçülen okuma maliyeti artarsa sürüm+seviye sorgusu ve ilgili indeks.

**Şimdi gereksiz:** Yeni CMS, GraphQL veya içerik yönetim sunucusu.

**Kabul / doğrulama:** Yalnız uzak katalogda bulunan kelime defterde görünür, kendi kimliğiyle çalışılır ve doğru konuya sayılır. Offline fallback aynı sözleşmeyi korur.

**Kod alanı:** `catalogueService.ts`, `content/questions/index.ts`, `WordNotebookModal.tsx`, `AppNavigator.tsx`.

### U27 — Analitik ve ürün ölçümü · 30/100 · P1/P2 · S7

**Gerekli**
- [ ] U27.1 — Ölçülecek kararları tanımla: başlangıçtan ilk pratiğe geçiş, oturum tamamlama, günlere göre geri dönüş, sınav başarısı ve senkron hata sıklığı.
- [ ] U27.2 — Mevcut event'lerin anlamını yeni ürün modeline uyarla; `masteredWords`, `wasDue` gibi eski anlam taşıyan alanları sürümle/düzelt.
- [ ] U27.3 — Olay kimliği, zaman ve oturum bağlamıyla çift kayıtları önle; kelime cevap metni, e-posta ve parola toplamadan ölçüm yap.

**Koşullu:** Merkezi analitik sağlayıcısı, veri kapsamı ve bildirim/izin ihtiyacı kararlaştırılırsa dışa aktarım ekle. O zamana kadar yerel pilot verisiyle sınırlı kal ve bunu açıkça belirt.

**Şimdi gereksiz:** Session replay, reklam kimliği, kapsamlı kullanıcı profilleme, çok sayıda dashboard.

**Kabul / doğrulama:** Bilinen örnek oturumdan beklenen event dizisi çıkar; tekrar açılış çift olay üretmez. Dış aktarım yoksa retention ölçümünün sınırı raporlanır.

**Kod alanı:** `telemetry.ts`, event çağrı noktaları, veri açıklamaları.

### U28 — Çökme ve hata görünürlüğü · 20/100 · P1 · S7

**Gerekli**
- [ ] U28.1 — Render hatası, async işlem hatası, native başlangıç ve senkron hatasını ayır; ErrorBoundary kapsam dışındaki hataları da güvenli bildir.
- [ ] U28.2 — Hata mesajlarını seçilen dile bağla; veri güvende deniyorsa bu iddianın doğruluğunu kontrol et.
- [ ] U28.3 — Sürüm/build, hata türü ve stack gibi gerekli teknik bağlamı hassas veri olmadan üret.

**Koşullu:** Sağlayıcı ve veri aktarımı kabul edilince merkezi crash reporting bağla; kontrollü test hatasının doğru build ve kaynak haritasıyla ulaştığını doğrula. Geniş yayın öncesi ya bu görünürlük ya da eşdeğer işletim çözümü gerekir.

**Şimdi gereksiz:** Birden fazla hata SDK'sı, özel log sunucusu veya olay yönetim platformu.

**Kabul / doğrulama:** Kontrollü hata sonrası kullanılabilir toparlanma ve hata kaydı kanıtı vardır; yalnız console çıktısı merkezi izleme diye sunulmaz.

**Kod alanı:** `ErrorBoundary.tsx`, `errorReporter.ts`, `AppBootstrap.tsx`, async sınırlar.

### U29 — CI ve derleme otomasyonu · 70/100 · P1 · S6 / S8

**Gerekli**
- [ ] U29.1 — Güncel branch/çalışma kopyasının tekrarlanabilir temiz kurulumunu doğrula; gerekli config dosyaları ve ortam değişkenleri belgeli olsun.
- [ ] U29.2 — Tip, davranış testi, rules ve Android derlemeyi ilgili PR kapıları olarak koru; Maestro genişletilmiş akışını CI'ye bağla.
- [ ] U29.3 — Başarısız koşulun gerçekten job'ı kırdığını, artifact'lerin screenshot/log içerdiğini kontrol et.

**Koşullu:** Süre ölçümü gerektirirse cache veya job paralelliği düzenle.

**Şimdi gereksiz:** Yeni CI sağlayıcısı, Kubernetes, kapsam dışı platform matrisi.

**Kabul / doğrulama:** Tek bir kaynak revizyonuna bağlı başarılı raporlar ve indirilebilir hata kanıtı vardır; yerel test sonucu CI sonucu yerine geçmez.

**Kod alanı:** `.github/workflows/ci.yml`, `package.json`, `.maestro/`, Android config.

### U30 — Mağaza ve dağıtım · 50/100 · P1 · S0 / S8

**Gerekli**
- [ ] U30.1 — Mevcut dağıtım track'i, sürüm/build ve kalan Console işlerini canlı doğrula; eski audit sonuçlarını güncel kabul etme.
- [ ] U30.2 — Mağaza açıklaması, ekran görüntüsü, izin ve veri beyanlarını gerçekten dağıtılacak build ile eşleştir.
- [ ] U30.3 — Release adayının kaynak SHA'sı, çalışma kopyası durumu, build ID'si, imza kaynağı ve artifact özeti kaydedilsin.
- [ ] U30.4 — İç test kurulumu, yükseltme, durdurma/önceki sağlam sürüme dönüş prosedürü ve kademeli yayın kontrolünü hazırla; veri migration'ının geri uyumluluğunu belirt.

**Koşullu:** Hesabın güncel mağaza kapıları gerektiriyorsa kapalı test süreci. Süre ve şartlar canlı doğrulanır.

**Şimdi gereksiz:** Temel kalite kapanmadan ülke/dil sayısını artırmak veya otomatik üretim yayını.

**Kabul / doğrulama:** Test edilen artifact ile dağıtıma gönderilen artifact ilişkilidir; dışarıya yayın yapılmadıysa “yayında” yazmaz. Mağaza sahibi işlemleri ayrı açık maddelerdir.

**Kod alanı:** `eas.json`, `app.json`, Android sürüm bilgisi, `.store/`, yayın kayıtları.

### U31 — Ayarlar, ses ve bildirim · 65/100 · P1 · S5

**Gerekli**
- [ ] U31.1 — Ses ve hareket tercihlerinin pratik/kelime detayı/defterde ne anlama geldiğini tekleştir; elle dinleme istisnası varsa metinde açıkla.
- [ ] U31.2 — Bildirim izin reddi, işletim sisteminden iptal, tercih kapatma ve saat dilimi değişiminde kayıtlı tercihi gerçek durumla eşleştir.
- [ ] U31.3 — TR/EN seçiminde görünür metin, hata, erişilebilirlik etiketi ve bildirim metnini kontrol et; sabit Türkçe metinleri düzelt.

**Koşullu:** Kullanıcı ihtiyacı varsa hatırlatma saati seçimi ve bildirime basınca pratik merkezine yönlendirme.

**Şimdi gereksiz:** Yeni dil paketleri, çoklu günlük bildirim, remote push kampanyası.

**Kabul / doğrulama:** Dil değişince temel akışta karışık dil yok; reddedilen bildirim açık görünmez; aynı hatırlatıcı çoğalmaz; kapatınca iptal olur.

**Kod alanı:** `notificationService.ts`, `speechService.ts`, ses hook'u, profil ve sözlükler.

### U32 — Yardım ve geri bildirim · 30/100 · P2 · S7

**Gerekli**
- [ ] U32.1 — Profilde kısa yardım ve gerçek, sahibi belli destek kanalı ekle; adres veya alıcı uydurma.
- [ ] U32.2 — “İlerlemem kayıp”, “senkron bekliyor”, “sınav nasıl geçilir” ve hesap silme için kısa doğru açıklamalar hazırla.
- [ ] U32.3 — Kullanıcı isterse sürüm/build/platform bilgisini içeren hassas verisiz destek metni hazırlayabilsin; otomatik mesaj gönderme.

**Koşullu:** Destek hacmi bunu gerektirirse ticket sistemi.

**Şimdi gereksiz:** Canlı sohbet, chatbot veya kapsamlı yardım merkezi.

**Kabul / doğrulama:** Destek eylemi gerçek kanala gider; otomatik credential/veri paylaşımı yok. Kanal yoksa metin taslağı hazır olur fakat gönderim özelliği tamamlandı sayılmaz.

**Kod alanı:** `ProfileScreen.tsx`, `src/i18n/profile.ts`, uygulama sürüm bilgisi.

### U33 — Dışa aktarma, silme ve şeffaflık · 60/100 · P0/P1 · S3 / S7

**Gerekli**
- [ ] U33.1 — Yerel sıfırlama, bulut hesabı silme ve çıkışın kapsamını ayrı tanımla; kullanıcı mesajlarını gerçek davranışa bağla.
- [ ] U33.2 — Hesap silme/yerel sıfırlama sırasında bekleyen yazıları ve eski state'i geçersiz kıl; silinen verinin geç işlemle yeniden yazılmasını engelle.
- [ ] U33.3 — Kısmi Auth/Firestore silme başarısızlığında yeniden deneme ve yakın zamanda giriş ihtiyacını güvenli yönet; veri silinmişse geri dönmüş gibi davranma.
- [ ] U33.4 — JSON dışa aktarım şemasını, hassas veri içermemesini ve paylaşım iptalini doğrula; içe aktarma UI'sı yoksa destekleniyor deme.
- [ ] U33.5 — Yerel sıfırlamadan sonra bulut ilerlemesinin nasıl geri geleceğini doğrula; normal mutation boş veriyi buluta yazmasın. Gizlilik metnini gerçek veri akışıyla eşleştir.

**Koşullu:** Kullanıcı ihtiyacı varsa doğrulanmış şemalı içe aktarma arayüzü. Merkezi analitik/hata servisi eklenirse veri açıklamaları yeniden değerlendirilir.

**Şimdi gereksiz:** Özel yedek bulutu, uygulamanın kullanmadığı veriler için genel uyumluluk platformu.

**Kabul / doğrulama:** Silme, yeniden başlatma ve geç ağ yanıtı sonrası veri yeniden oluşmaz. Yerel sıfırlama bulutu sıfırlamaz; geri yükleme davranışı kanıtlıdır. Gizlilik değerlendirmesi hukuk sertifikası diye sunulmaz.

**Kod alanı:** `DataManagementCard.tsx`, `auth.ts`, `firestore.ts`, `storage.ts`, `useUserProgress.ts`.

## 5. Sprint planı

### Kapasite ve tahmin varsayımı

Plan bir geliştiricinin odaklı çalışması, sınırlı QA desteği ve erişilebilir Android test cihazı varsayımıyla hazırlanmıştır. Süreler **iş günü tahminidir**, taahhüt değildir. Takvim sprinti iki haftaysa işler kapasiteye göre bölünür; bitmeyen iş kabul kriteri düşürülerek kapatılmaz. Mağaza bekleme süreleri, kullanıcı kararı, servis bağlantısı ve dil incelemesi bu tahminlere dahil değildir.

Ana yol yaklaşık **41–58 iş günü**; kapsam/yeniden üretim sonuçları S0 sonunda yeniden tahmin edilir. E1/E2 ayrı içerik aşamalarıdır. Aynı kişinin iki işi paralel yapacağı varsayılmamıştır.

### S0 — Kaynak durumu, kritik yeniden üretim ve kararlar · 2–3 gün

**Amaç:** Yanlış varsayımlarla uygulamaya başlamamak.

- U01.1 ve U08.1 için ürün/kapsam taslağı; D01–D06 karar kaydı.
- U09, U11, U14, U15, U17, U22 ve U33 için küçük hata/yarış senaryoları ve fixture listesi.
- U16.3, U18.1–2 ve U22.4 için Android release başlangıç kontrolü; P0 başlangıç arızası bulunursa takip eden bütün işlerden önce giderilir.
- U29/U30 için HEAD, değişmiş dosyalar, mevcut build ve test kanıtı envanteri; var olan kullanıcı değişikliklerini koru.

**Bağımlılık:** Yok. Dış servis erişimi olmadan yerel kanıt çalışması sürer.

**Teslim:** Onaylanmış/karar bekleyen ayrımıyla karar günlüğü, P0 yeniden üretim listesi, desteklenen cihaz/platform matrisi.

**Çıkış:** Uygulanacak davranışlar açık; kesin hata ile araştırılacak risk ayrılmış. Dış erişim yokluğu gizlenmemiş.

### S1 — Cevap, sınav ve XP doğruluğu · 5–7 gün

**İşler:** U09.1–4, U11.1–4, U06.1; bunlarla gerekli U23.1, U24.1 ve U25.1 testleri.

**Sıra:** Tek cevap sonucu → gerçek XP farkı → oturum kayıt tüketicileri → sınav tek cevap kuralı → sonuç ekranları.

**Bağımlılık:** D03, S0 örnekleri. Sınav oturum kimliği şeması S2 ile uyumlu tasarlanır.

**Teslim:** Doğru ödül gösteren pratik, güvenilir sınav sonucu, sınır testleri.

**Çıkış:** Yanlış/tekrar 0 XP; görev bonusu doğru; 49/50 doğru sınırı ve tek soru/tek puanlama kanıtlı.

### S2 — Yerel veri, hesap sahipliği ve oturum kurtarma · 6–8 gün

**İşler:** U14.1–4, U17.1–3, U22.1–3, U03.1–2'nin oturum kısmı, U12.1–2; ilgili U13.1, U23.2 ve U25 testleri.

**Sıra:** Sahiplik/şema → normalizasyon → kalıcı kayıt → session restore → günlük zaman davranışı → hesap değişimi.

**Bağımlılık:** S1 cevap kaydı; D04/D05. Eski kaydın sahibi bilinmiyorsa karar gerektiren durum olarak korunur.

**Teslim:** Migration fixture'ları, hesap ayrımı, restart senaryoları, yerel gün davranışı.

**Çıkış:** Ters oturum korunur; restart duplicate XP üretmez; A/B hesabı ayrılır; geçerli veriler normalizasyonda kaybolmaz.

### S3 — Senkron, silme ve çevrimdışı güvenilirlik · 6–8 gün

**İşler:** U15.1–5, U16.1–3, U18.1–3, U33.1–3 ve U33.5'in veri kısmı; U13.2–3, U17.3 ve U23.3 tamamlanır.

**Sıra:** Hesap bağlamı → bekleyen kayıt/sıralama → merge → hata durumu → reset/delete iptali → iki cihaz testi.

**Bağımlılık:** S2 hesap ve storage sözleşmesi. Rules testleri emülatörde; canlı App Check doğrulaması erişime bağlı.

**Teslim:** İki cihaz test raporu, offline senkron davranışı, kısmi silme kurtarma akışı, rules kanıtı.

**Çıkış:** Veri kaybı/hesap karışması senaryoları geçer; silinen veri geç yazıyla dönmez; senkron rozeti gerçek durumdur.

### S4 — Öğrenme modeli ve katalog bütünlüğü · 5–7 gün

**İşler:** U10.1–3, U12.3–4, U26.1–4, U02.1–3, U06.2–3, U04.1–3, U08.2–3; U07 yapısal inceleme ve içerik hata listesi.

**Sıra:** D02 tekrar kararı → görevler → tek katalog → seviye hazırlığı → oturum sonu/ana ekran mesajları.

**Bağımlılık:** S1 puanlama, S2 zaman/oturum ve S3 cache/senkron sınırları.

**Teslim:** Tek öğrenme sözleşmesi, bütün girişlerde aynı seviye kuralı, uzaktaki kelimeyi tutarlı kullanan ekranlar.

**Çıkış:** Erişilemeyen tekrar görevi yok; hazır olmayan seviye açılamaz; remote-only kelime baştan sona çalışır. U07 dil incelemesi bitmediyse ayrıca açık tutulur; bu sürede tamamlandı varsayılmaz.

### S5 — Ekranlar, dil, erişilebilirlik ve tercihler · 5–7 gün

**İşler:** U01.2, U03.1–3'ün cihaz kısmı, U05.1–2, U19.1–3, U20.1–3, U31.1–3; U04 görsel durum kontrolleri.

**Bağımlılık:** S4'te davranış ve metriklerin sabitlenmesi.

**Teslim:** TR/EN temel akışları, büyük yazı/TalkBack kanıtı, tutarlı hata/onay/boş durumlar, çalışan bildirim tercihleri.

**Çıkış:** Ana eylemler küçük ekranda erişilebilir; ekran okuyucu akışı bitirir; sistem hareket tercihi ve uygulama ayarları tutarlıdır.

### S6 — Gerçek cihaz doğrulaması, performans ve CI · 5–7 gün

**İşler:** U21.1–3, U25.2–4, U29.1–3; U20/U22 destek matrisi doğrulaması, U24.2–3.

**Bağımlılık:** S1–S5 davranış düzeltmeleri.

**Teslim:** Genişletilmiş Maestro akışı, temiz kurulum CI kanıtı, release cihaz performans raporu, kalan regresyon listesi.

**Çıkış:** Kritik kullanıcı akışları geçer; performans verileri ölçülüdür. Sadece test sayısı artmış olması teslim değildir.

### S7 — Hata görünürlüğü, ölçüm ve destek · 4–6 gün

**İşler:** U27.1–3, U28.1–3, U32.1–3, U33.4–5'in dışa aktarma/metin kısmı.

**Bağımlılık:** Yeni olay anlamları için S4; SDK eklenirse S6 doğrulamaları etkilenen kapsamda tekrarlanır.

**Teslim:** Olay sözlüğü, kontrollü hata kaydı, gerçek destek kanalı, doğru veri açıklamaları.

**Çıkış:** Merkezi hizmet seçildiyse gerçek teslim doğrulanır. Bağlantı/izin yoksa yerel hazırlık teslim edilir ancak merkezi görünürlük açık kalır; geniş yayın kapısı geçilmiş sayılmaz.

### S8 — Release adayı ve yayın kararı · 3–5 gün

**İşler:** U30.1–4, U16.4, U29 son kaynak/artifact kontrolü; aşağıdaki yayın kapılarının tamamı.

**Bağımlılık:** S1–S7 gerekli kabul kriterleri; çözülmemiş P0 bulunmaması.

**Teslim:** Tek release adayına bağlı test/artifact kaydı, doğru mağaza materyalleri, açık sahip işlemleri ve yayın/durdurma prosedürü.

**Çıkış:** İç test sonucu ve yükseltme doğrulaması tamamlanır. Gerçek mağaza yayını ayrıca yetkilendirilmiş eylemdir; belge oluşturulması yayın yetkisi değildir.

### E1 — B1 ve B2 içerik genişletme · Koşullu · İlk tahmin 10–15 gün

**İşler:** U07.1–3 ve U08 kapsamının B1/B2 ayağı. Konu/öğrenme hedefleri → kelime listesi → özgün örnek/çeviri → seçenek incelemesi → yapısal doğrulama → dil incelemesi → katalog sürümü → cihaz testi.

**Bağımlılık:** S4 katalog altyapısı, D01 kapsam kararı, içerik incelemesini yapacak yetkin kişinin kapasitesi.

**Çıkış:** Her seviye teknik olarak en az 100 geçerli soru ve 60 soruluk sınavı destekler; bu sayı tek başına B1/B2 yetkinliği öğretildiği iddiasını sağlamaz. İçerik hedefleri ve inceleme tamamlanmadan seviye hazır açılmaz.

### E2 — C1 ve C2 içerik genişletme · Koşullu · İlk tahmin 15–25 gün

**İşler:** U07/U08'in C1/C2 ayağı; yakın anlam, bağlam, nüans, doğal kullanım ve seçenek belirsizliği özellikle incelenir.

**Bağımlılık:** E1'den öğrenilen içerik üretim/inceleme süreci. Gerçek içerik hedefi belirlendiğinde süre yeniden tahmin edilir.

**Çıkış:** Seviye etiketleri gerekçeli, örnekler dil incelemesinden geçmiş, sınav geçerli; incelemesiz toplu üretim kabul edilmez. Tam A1–C2 vaadi ancak bu aşamalar karşılandıktan sonra değerlendirilir.

## 6. Ortak test ve yayın kapıları

### Her kod değişikliğinde

1. Değişikliğe uygun davranış testi; basit görsel/metin değişikliğinde gereksiz yeni test yerine doğrudan kontrol.
2. `npm run typecheck` ve `npm test`.
3. Rules değiştiyse `npm run test:rules`.
4. Kullanıcı akışı değiştiyse `npm run test:e2e:smoke` ve smoke'un kapsamadığı ilgili senaryo.
5. Native/config değiştiyse ilgili Android build ve cihaz başlangıcı.
6. Test sonucu, kaynak revizyonu ve başarısız/çalıştırılamayan kontroller açık kaydedilir.

### Release adayı için asgari senaryo matrisi

| Alan | Zorunlu senaryolar | Kanıt |
|---|---|---|
| Başlangıç | Temiz kurulum, güncelleme, uçak modu, yavaş ağ, config hatası | Release cihaz kaydı |
| Pratik | İki yön, doğru/yanlış, ipucu, çift dokunma, bölüm sonu, kelimelerin tükenmesi | Domain + UI testi |
| Sınav | 49/50 doğru, tekrar denemesi, 60'tan az katalog, son soruda restart | Davranış + UI testi |
| XP | İlk doğru, yanlış, ödülsüz tekrar, görev bonusu, sınav | Hesaplanan delta eşitliği |
| Oturum | Cevap öncesi/sonrası kill, ters mod, eski kayıt, katalog değişimi | Yeniden açılış kanıtı |
| Hesap | Misafir → A → B → A, login merge hatası, gecikmiş callback | Entegrasyon testi |
| Senkron | İki cihaz, offline/reconnect, aynı/farklı kelime, ayar değişimi | Emülatör/cihaz raporu |
| Silme | Yerel reset, kalıcı hesap silme, kısmi hata, geç yazı, tekrar açılış | Veri kalıcılığı denetimi |
| Gün | Yerel gece yarısı, arka plandan dönüş, saat dilimi değişimi | Sabit saat fixture + cihaz |
| Erişilebilirlik | TalkBack, büyük yazı, hareket azaltma, modal odağı | Manuel akış raporu |
| Tercihler | TR/EN, ses, bildirim reddi/iptali | Cihaz kontrolü |
| Güvenlik | Başka kullanıcının read/write/delete girişimleri | Rules emülatörü |
| Yayın | Kaynak ↔ artifact ↔ dağıtım kimliği; yükseltme | Release kaydı |

### Yayını durduran koşullar

- Açık P0 yanlış puanlama, veri kaybı/karışması veya başlangıç arızası.
- Kullanıcıya tamamlandı/silindi/eşitlendi denip gerçek sonuçla çelişmesi.
- Test edilen kaynak ile yayın artifact'i arasında açıklanmayan fark.
- İlk yayında kullanılacağı belirtilen platform/seviyenin doğrulanmamış olması.
- Merkezi veri aktarımı varsa kapsamı ve hata toplama davranışı belirsiz olması.
- Mağaza tarafında zorunlu olduğu canlı doğrulanan işlemlerin tamamlanmaması.

## 7. Sprint çalışma kuralları ve takip şablonu

- Aynı hata farklı birimlerde görünse bile tek değişiklik/tek ana iş kaydıyla çözülür; ilgili birimlere kanıt bağlanır.
- Önce doğrudan davranış düzeltmesi; refactor yalnız o düzeltme için gerekliyse yapılır.
- Mevcut kullanıcı değişiklikleri, hesaplar, bulut verisi ve yayın durumu plan oluşturuldu diye değiştirilmez.
- Veri fixture'ları yapay kullanıcılar içerir; gerçek parola, token ve kişisel kayıt rapora yazılmaz.
- Her sprint sonunda puan değil kabul kriterleri kapanır. İstenirse aynı rubrikle yeniden puanlanır; belirli puana ulaşma garantisi verilmez.
- Bir kontrolü çalıştıramamak başarısızlıkla aynı değildir; fakat “geçti” de değildir. Kanıt bekliyor olarak işaretlenir.
- Dış bağımlılık varsa gerekli hesap/cihaz/karar tam adıyla yazılır; beklemeyen işler sürdürülür.

Her iş için kullanılacak kayıt:

```markdown
### İş: Uxx.n — Kısa başlık
- Durum: Yapılacak / Devam ediyor / Kanıt bekliyor / Tamamlandı
- Sorumlu:
- Sprint:
- Öncelik:
- Kanıtlanan sorun veya kullanıcı ihtiyacı:
- Önkoşul / ürün kararı:
- Değişen dosyalar:
- Uygulanan en dar çözüm:
- Kullanıcı davranışında değişiklik:
- Kabul kriteri sonucu:
- Çalıştırılan testler ve sonuçları:
- Çalıştırılamayan kontroller:
- Veri göçü / eski sürüm etkisi:
- Kaynak revizyonu ve varsa artifact:
- Kalan risk / sonraki iş:
```

## 8. Tamamlama özeti

İlk aşamanın hedefi, bütün isteğe bağlı özelliklere sahip bir uygulama değil; **A1–A2 kapsamında doğru sonuç gösteren, veriyi koruyan, telefon üzerinde doğrulanmış ve sorunları takip edilebilir bir Android uygulaması**dır.

S0–S8 bu çekirdeği tamamlar. E1/E2, tam A1–C2 hedefi seçildiğinde kapsamı genişletir. Yeni seviyeler eklemek mevcut sınav/XP/veri hatalarının çözümü yerine geçmez; tasarım cilası da test ve veri güvenilirliğinin yerine geçmez.

Bu dosya oluşturulduğunda hiçbir görev tamamlanmış işaretlenmemiştir. Uygulama kodu, servisler ve yayın ayarları bu doküman çalışmasının parçası olarak değiştirilmemiştir.

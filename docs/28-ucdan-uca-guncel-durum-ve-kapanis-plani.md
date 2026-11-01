# LingoRise — 11 Eylül 2026 Uçtan Uca Durum Fotoğrafı (Tarihsel)

Tarih: 11 Eylül 2026  
Denetim kapsamı: kaynak katalog, müfredat ve öğrenme akışı, tüm ana ekranlar, yerel/bulut veri akışı, testler, Android build ve bağlı Samsung S23 FE.  
Bu belge, kodda bulunan bir şeyin kullanıcının telefonuna ulaştığı anlamına gelmediğini özellikle ayırır.

> Bu rapor 11 Eylül 2026 tarihindeki cihaz/yayın durumunun tarihsel anlık görüntüsüdür; güncel branch, paket kimliği, build veya test sonucu olarak kullanılmamalıdır. Güncel mimari için [Clean Architecture referansına](CLEAN_ARCHITECTURE.md), güncel doğrulamalar için [verification kaydına](CLEAN_ARCHITECTURE_VERIFICATION.md) bakın.

## Önce gerçek durum

S23 FE'ye kurulu uygulama `com.lingorise.app`, `versionCode=5` ve `versionName=0.1.0` sürümünde. Son güncellemesi 7 Eylül 2026. Bu kurulum, çalışma alanında üretilen güncel APK ile **aynı imzaya sahip değil**. Hem debug hem release APK için yapılan güncelleme denemesi Android tarafından şu nedenle reddedildi:

```text
INSTALL_FAILED_UPDATE_INCOMPATIBLE
Existing package com.lingorise.app signatures do not match newer version
```

Bu nedenle telefonda görülen B1/B2/C1/C2 `Yakında` kartları eski pakettendir. Kaynak kodda bu seviyeler artık soru sayısı eşiğini geçmektedir; güncel paket telefona yüklenmediği için bunu cihazda görmedin. Bu bir kullanıcı hatası değildir ve mevcut durum “telefona güncel build gönderildi” diye kapatılamaz.

## Kaynak katalog: miktar var, yayın kalitesi henüz yok

`11 Eylül 2026` tarihinde doğrudan çalışma zamanındaki bundled katalogdan ölçülen değerler:

| Seviye | Soru | `isLevelReady` | Konu | Hatalı seçenek yapısı geçerli | Yayın kararı |
|---|---:|---|---:|---:|---|
| A1 | 320 | Evet | 15 ham etiket / 8 canonical konu | 320/320 | Koşullu hazır |
| A2 | 254 | Evet | 12 ham etiket / 7 canonical konu | 254/254 | Koşullu hazır |
| B1 | 120 | Evet | 4 | 120/120 | Editoryal inceleme olmadan yayımlanamaz |
| B2 | 108 | Evet | 3 | 108/108 | Editoryal inceleme olmadan yayımlanamaz |
| C1 | 108 | Evet | 3 | 108/108 | Editoryal inceleme olmadan yayımlanamaz |
| C2 | 100 | Evet | 2 | 100/100 | Editoryal inceleme olmadan yayımlanamaz |
| **Toplam** | **1.010** | — | — | **1.010/1.010** | — |

`isLevelReady` bugün yalnızca `getQuestionsByLevel(level).length >= 100` kontrolüdür. Bu, seviye için 100 soru olduğu bilgisini verir; CEFR uygunluğu, özgün örnek, çeviri doğruluğu, distractor kalitesi veya yayımlama onayı vermez.

### P0 — üst seviye içerik kalite borcu

B1, B2, C1 ve C2 dosyaları veri üretim döngüleriyle yazılmıştır. Her kelimenin ekranda farklı görünen cümlesi olsa da cümle gövdesi konuya göre tekrarlanan tek bir şablondur:

| Seviye | Kodun gerçek davranışı | Öğrenci etkisi | Yapılacak iş |
|---|---|---|---|
| B1 | Konu başına tek cümle çerçevesi; ör. proje toplantısı veya yolculuk çerçevesine kelime yerleştiriliyor. | Fiil, sıfat ve isimler dilbilgisel olarak doğal olmayan bağlamlarda görülebilir. | Her öğe için ayrı, doğal B1 örneği ve Türkçe karşılığı yazılacak. |
| B2 | Konu başına tek İngilizce çerçeve ve aynı tür genel Türkçe açıklama. | İleri bağlam ve kullanım ayrımı öğretmiyor. | Her kelime/kalıp için kullanım amacı, register ve örnek yazılacak. |
| C1 | Tüm kelimeler `The report uses … in its central analysis.` kalıbına yerleştiriliyor. | Nüans, üslup ve eleştirel analiz hedefi fiilen öğretilmiyor. | Akademik, profesyonel ve tartışma bağlamları öğe bazında yazılacak. |
| C2 | Tüm kelimeler uzman sunumu kalıbına yerleştiriliyor. | C2’nin register, kesinlik ve söylem farkı ölçülmüyor. | Uzmanlık alanı, retorik ve farklı register senaryoları yazılacak. |

Ek olarak yanlış seçenekler, kelime anlamı havuzunun sıradaki iki değerinden otomatik alınıyor. Teknik olarak iki farklı ve doğru cevaptan farklı seçenek üretiliyor; pedagojik olarak yakın anlamlılık, seviye uygunluğu ve yanıltıcılık denetlenmiyor. Aynı kelime/anlam bazı seviye veya konularda tekrar ediyor. Bunların her biri editoryal karar ile ya ayrıştırılmalı ya da bilerek tekrar olarak etiketlenmeli.

**Kabul kriteri:** B1–C2’deki her yayınlanmış öğe için insan tarafından onaylanmış benzersiz örnek, doğru çeviri, bağlam notu, telaffuz, iki anlamlı distractor ve CEFR/difficulty gerekçesi bulunacak. Bu doğrulama veri dosyasına `editorialStatus`, `reviewedAt`, `reviewer` alanlarıyla kaydedilecek. Bu alanlar olmadan seviye seçici “hazır” demeyecek.

## Birim birim denetim

| Birim | Şu an çalışan taraf | Açık eksik / risk | Öncelik |
|---|---|---|---|
| Başlangıç ve katalog yükleme | Offline bundled fallback var; Firestore isteği 8 saniye sonra cache/bundled'a dönebiliyor. | Uzak katalogda hangi `activeVersion` ve hangi seviyelerin gerçekten yayınlandığı cihazda doğrulanmadı. Eski cache yeni bundle davranışını maskeleyebilir. | P0 |
| Onboarding / seviye seçimi | Kullanıcı A1–C2 seçebiliyor. | Başlangıç seviye tespiti yok; kalite onayı olmadan ileri seviyeye doğrudan girilebiliyor. `LevelStep` hazır olma/kalite durumunu kararına katmıyor. | P1 |
| Seviye değiştirici | Sayı eşiği altındaki seviyeyi `Yakında` yapıyor; kaynak katalogda bugün altı seviye de açık olmalı. | Kullanıcıya “içerik sayısı”, “editoryal hazır”, “kilit/ön koşul” ayrımını anlatmıyor. Eski APK nedeniyle cihazda yanlış durum görüldü. | P0 |
| Müfredat / konu akışı | `topicId`, `unitId`, `lessonId`, konu kilidi ve konu kontrolü altyapısı var. | Ünite 15, ders 10 öğelik otomatik dilim. İsim, hedef, öğe listesi ve değerlendirme seçimi açık katalog varlıkları değil. Dokümantasyonun vaat ettiği gerçek ünite sözleşmesi uygulanmış değil. | P1 |
| Günlük pratik | Sıradaki açık konu/ders seçiliyor; konu kontrolü bekliyorsa yeni konuya kaçmıyor. | Tekrarların yeni dersle öncelik ve oranı ürün kuralı olarak net/test edilmiş değil. Ders tamamlanma ekranı ve açık hedef geri bildirimi sınırlı. | P1 |
| Konu kontrolü | 10 soru, %80 geçme eşiği, kalıcı `topicAssessments`, geçince sonraki konu açma çalışıyor. | Kontrol soruları konu havuzundan rastgele seçiliyor; soru kalitesi/dengesi ve tekrar denemesi pedagojik olarak tasarlanmamış. Sonuç/geri bildirim i18n'e taşınmamış. | P1 |
| Seviye sınavı ve terfi | 60 soru, 50 doğru geçiş; seviyeye göre sınav oluşturuluyor. | Kod konulara dengeli dağıtım yapmıyor; yalnızca easy/medium/hard bandı seçiyor. `difficulty`, CEFR yerine seviye tabanı + kelime uzunluğundan türetiliyor. Bu nedenle C1/C2 sınavı gerçek seviye ölçümü değildir. | P0 |
| Home | Konu kontrolü veya sıradaki ders CTA'sı bağlanmış. | Öğrenciye seçilen seviyenin kalite/yayın durumu, sıradaki somut ders çıktısı ve sınav yolu tam görünür değil. | P1 |
| Practice hub ve oturum | Müfredata devam CTA'sı, checkpoint yönlendirmesi ve session version kontrolü var. | Serbest pratik/tekrar/müfredat oturumu ayrımı kullanıcı için net değil; bütün rota cihazda güncel APK ile henüz smoke edilmedi. | P0 |
| Practice / cevaplama | Tekrar cevap koruması, session modları ve sonuç kartı var. | Sadece `MEANING_MATCH` etkin; dinleme kartı metinde hâlâ “Yakında eklenecek”. Soru tipi çeşitliliği ürün kapsamı olarak ya kaldırılmalı ya da tamamlanmalı. | P1 |
| Progress | Seviye görülen kelime sayısı, konu kartları, notebook, rozet ve aktivite var. | Konu kartı `seen/total` ve `Kontrol` gösteriyor; güvenilir hatırlama, başarısız kontrol, zayıf konu ve gerçek ünite ilerlemesini göstermiyor. Eski paket burayı da `Yakında` gösterebilir. | P1 |
| Word notebook | Arama ve pratik çağrısı bulunuyor. | Kelimenin konu → ünite → ders bağlamı kullanıcıya gösterilmiyor; mevcut mimari belgesindeki vaat karşılanmamış. | P2 |
| Yerel kayıt / migration | Storage schema v4, topic assessment persist ve katalog sürümünde eski oturum iptali var. | Şema normalizasyonu ve sync için birden çok elle yazılmış alan listesi var; her yeni alanın her yerde ele alınması derleyici tarafından garanti edilmiyor. | P1 |
| Firebase auth / senkron | Girişte local + remote merge, hata halinde local veriyi koruma yaklaşımı var. | Gerçek Firebase kayıt/giriş/silme ve production kural/index deploy doğrulanmadı. Kullanıcı kendi ilerlemesini değiştirebilecek client-trust alanları mevcut. | P1 |
| Bildirim / deep link | Günlük hatırlatıcı ve `home/practice/progress/profile` deep link hedefi var. | Fiziksel cihazda izin, zamanlama, kapalı uygulamada tıklama ve doğru rota doğrulanmadı. | P2 |
| Erişilebilirlik ve dil | Çoğu CTA için erişilebilir etiketler, TR/EN kopya yapısı var. | Checkpoint ve konu ilerleme metinlerinin bir bölümü doğrudan Türkçe kodlanmış; TalkBack ve büyük font cihazda denetlenmedi. | P2 |
| Otomatik test | TypeScript suite ve Firestore rules/maestro komutları var. | Suite örnek şablonunu yalnızca eski `Learn and use the word` ifadesiyle arıyor; B1–C2 şablonlarını yakalamıyor. Gerçek cihazda güncel buildle E2E yok. | P0 |
| Android release | `arm64-v8a` S23 FE için yapılandırılmış; yerel APK ve bundle üretilebiliyor. | Release build debug keystore ile imzalanıyor, versionCode/versionName hâlâ 5/0.1.0, EAS production AAB/Play internal test yok. Güncel APK mevcut kurulumun üstüne yüklenemiyor. | P0 |
| Dokümantasyon ve kanıt | Mimari, sprint ve release belgeleri mevcut. | Birbirleriyle çelişen eski sayılar/durumlar var: ör. bazı belgelerde 433 test, bazı yerlerde 452; `27` numaralı belge B1–C2 tamamlandı derken kendi hedef kararları ile çelişiyor. | P1 |

## “Yakında” metinlerinin envanteri

Bu metinlerin hepsi aynı anlama gelmiyor:

| Yer | Şimdiki anlamı | Karar |
|---|---|---|
| Seviye değiştirici ve seviye yetkinliği | Seviyede 100'den az soru var. | Kalite/yayın durumu ile değiştirilecek; telefon güncellenince mevcut kaynakta B1–C2 için görünmemeli. |
| Dinleme kartı | Dinleme özelliği uygulanmamış. | Özelliği tamamla veya kartı kaldır; yayımlı üründe belirsiz “Yakında” bırakma. |
| Placeholder tab modal | Uygulanmamış sekme/özellik için genel modal. | Hangi sekmenin buna bağlandığını doğrula; menüden kaldır veya gerçek ekranı tamamla. |

## P0: Yayından önce kapatılacak işler

### R0. Gerçek Android dağıtımı ve imza sürekliliği

1. Mevcut `com.lingorise.app` paketinin orijinal upload/release keystore'unu veya Play App Signing sürecini bul.
2. `release` build türündeki `signingConfigs.debug` kullanımını kaldır; anahtarı repo dışındaki güvenli CI/EAS secret'a taşı.
3. Sürümü en az `versionCode=6` ve anlamlı `versionName` ile güncelle; `app.json` ve `android/app/build.gradle` aynı değeri taşısın.
4. Production AAB üret, Play Console internal track'e yükle ve aynı S23 FE üzerinde Play/internal test üzerinden güncelle.
5. Orijinal anahtar geri alınamıyorsa karar ver: kullanıcı verisini kaybettirecek kontrollü uninstall + yeni kurulum, ya da yeni `applicationId` ile ayrı uygulama. Bunlar eşdeğer değildir.
6. Cihazda doğrula: B1, B2, C1, C2 seviye değiştiricide seçilebilir; Progress ekranında `Yakında` yok; B1 practice başlatılır; uygulama kapatılıp açıldığında durum kalır.

**Kabul kriteri:** S23 FE'deki `lastUpdateTime` yeni build zamanını gösterir, package sürümü günceldir, mevcut uygulamanın üstüne veri kaybetmeden güncellenmiştir veya veri kaybı için kullanıcıdan açık onay alınmış ve yedek planı uygulanmıştır.

### R1. İçeriği “100 satır var” seviyesinden yayınlanabilir seviyeye çıkar

1. B1–C2'yi geçici olarak `draft`/`needs_review` durumuna al; readiness hesabı yalnızca `published + editorialApproved` öğeleri saysın.
2. Her B1–C2 öğesi için benzersiz doğal örnek, doğru Türkçe çeviri, kullanım notu, part of speech, telaffuz ve anlam ayrımı yaz.
3. Distractor'ları aynı bağlamda makul fakat yanlış seçenekler olarak editoryal seç; rastgele havuz dilimleme kodunu kaldır.
4. Kelime, anlam, çeviri, örnek, konu ve seviyede duplicate/near-duplicate raporu üret; her tekrar için gerekçe tut.
5. Her seviyede CEFR hedefi, sözcük türü dengesi, konu kapsaması ve 60 soruluk sınav kapsaması editoryal rubrikle onaylansın.
6. Teste şu zorunlu kuralları ekle: aynı normalize edilmiş örnek gövdesi eşiği, boş/genel çeviri, generic context note, duplicate word/meaning, geçersiz distractor, review alanı eksikliği ve konu başına minimum dağılım.

**Kabul kriteri:** Editoryal CSV/JSON onay kaydı, otomatik quality gate ve örneklem insan incelemesi olmadan hiçbir B1–C2 öğesi `published` olmaz.

### R2. Gerçek müfredat ve sınav sözleşmesi

1. `curriculum.ts` içindeki otomatik 15/10 bölmeyi yayın katalogundaki açık `Topic`, `Unit`, `Lesson` kayıtlarıyla değiştir.
2. Her dersin başlığı, ölçülebilir amacı, öğe kimlikleri, ön koşulu ve değerlendirme soru havuzu ayrı yazılsın.
3. Konu kontrolü rastgele kelime listesi değil, ders hedeflerini kapsayan tanımlı soru seti kullansın.
4. Seviye sınavını konu kotası + dil becerisi/öğe türü + editoryal difficulty ile kur; bir konudan aşırı soru gelmesini engelle.
5. “Geçti” sonucu için zayıf konu geri bildirimi ve tekrar rotası ekle.

**Kabul kriteri:** Katalog sırası değişse bile aynı `topicId/unitId/lessonId` ile ilerleme korunur; sınavın her konu dağılımı testte deterministik doğrulanır.

### R3. Uzak katalog ve cihaz E2E kanıtı

1. Firestore `contentMeta/current.activeVersion` ile tüm yayınlı `items` sayısını sorgula; bundle `2.1.0` ile karşılaştır.
2. Uzaktan gelen veri için schema + editorial quality validation uygula. Cache anahtarına katalog sürümünü ve kalite sürümünü ekle; geçersiz/eski cache'i at.
3. S23 FE üzerinde online, offline, eski cache, level değişimi, checkpoint, exam, uygulamayı öldür-aç ve guest/account geçişi senaryolarını çalıştır.
4. Ekran görüntüsü/video ve package/version çıktısını release kanıtına ekle.

**Kabul kriteri:** Her test senaryosunda katalog kaynağı (`remote/cache/bundled`) görünür log/telemetry olarak kaydedilir; kullanıcı yanlışlıkla eski içerikte kalmaz.

## P1: P0 sonrası tamamlanacak ürün işleri

1. Onboarding'e seviye tespit akışı veya en azından “başlangıç / mevcut seviye / sınavla belirle” seçimi ekle.
2. Home, Practice Hub ve Progress'te aynı rota bilgisini göster: aktif konu, aktif ünite, ders hedefi, tekrar yükü, checkpoint ve level exam yolu.
3. Progress'te görülen kelime ile güvenilir hatırlamayı ayır; başarısız assessment için hedefli tekrar CTA'sı ekle.
4. Notebook'a level → konu → ünite → ders bağlamı, kullanım örneği ve tekrar durumu ekle.
5. Sync/storage normalizasyonu için `UserData` alanlarının tek şemadan türetilmesini sağla; yeni alan için migration, serialize, normalize, merge ve Firestore yazımının eksik kalmasını testte engelle.
6. Firebase auth kayıt/giriş/şifre hatası/hesap silme/çevrimdışı merge ve production Firestore rule/index deployment'ını gerçek proje üzerinde doğrula.
7. Stale dokümanları tek kaynakla güncelle: `18`, `24`, `25`, `26`, `27`, `IMPLEMENTATION_AUDIT`, `RELEASE_CHECKLIST`; eski test adetleri ve “tamamlandı” işaretleri kanıtla uyumlu olsun.

## P2: Yayın kalitesini yükseltecek işler

1. Dinleme özelliğini gerçek ses, izin, hata ve değerlendirme akışıyla tamamla ya da tüm “Yakında” girişlerini ürün yüzeyinden kaldır.
2. Checkpoint, konu durumları ve sonuç metinlerini TR/EN sözlüklerine taşı; TalkBack, font scaling ve düşük hareket ayarını fiziksel cihazlarda doğrula.
3. Bildirim izni, zamanlama, uygulama kapalıyken notification tap ve deep link rotasını S23 FE'de test et.
4. Maestro akışını güncel build, B1 seviye değişimi, checkpoint, exam ve cache/offline senaryolarıyla genişlet; screenshot assertion ekle.
5. CI'da gerçek release imzası kullanılmadan imzalama yapma; ayrı unsigned/preview iş akışı ve secret tabanlı production job kur.

## Uygulanma sırası

| Sıra | Paket | Bağımlılık | Çıktı |
|---:|---|---|---|
| 1 | Android imza ve sürüm keşfi | Mevcut release/Play anahtarı erişimi | S23 FE'ye gerçekten güncellenebilir build |
| 2 | Yayın kalite kapısı | İçerik editoryal şeması | “Hazır” durumunun güvenilir tanımı |
| 3 | B1 editoryal pilot | Kalite kapısı | Tam onaylı B1, gerçek cihaz smoke |
| 4 | B2/C1/C2 editoryal üretim | B1 pilot ve review akışı | Onaylı üst seviye katalog |
| 5 | Açık Unit/Lesson + dengeli exam | Onaylı içerik kimlikleri | Pedagojik olarak izlenebilir rota |
| 6 | Firestore yayınlama ve cache migration | Katalog sürümleme | Remote/bundled eşdeğerliği |
| 7 | Tam cihaz E2E ve internal release | 1–6 | İç yayın kararı için kanıt |
| 8 | P1/P2 deneyim ve bakım işleri | Stabil yayın adayı | Ürün kalitesi ve işletilebilirlik |

## Denetim sonucu

Kaynak kodda üst seviye soru sayısı artık var; bu, cihazda güncel ürün olduğu veya içeriklerin eğitimsel olarak tamamlandığı anlamına gelmiyor. Güncel durumdaki iki gerçek yayın engeli şunlardır: **S23 FE'ye güncel paketin imza nedeniyle yüklenememesi** ve **B1–C2 içeriğinin otomatik şablon üretimi nedeniyle editoryal kalite kapısından geçmemiş olması**. Bu iki konu kapanmadan B1–C2 için “tamamlandı” veya uygulama için “uçtan uca hazır” denemez.

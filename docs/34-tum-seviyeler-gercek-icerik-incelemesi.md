# LingoRise — Tüm Seviyeler Gerçek İçerik İncelemesi

Tarih: 12 Eylül 2026  
Kapsam: Uygulamanın çalışma zamanındaki 1.105 soru, soru üretim kaynakları, öğrenme akışı ve Firestore'a yayımlanan 2.2.0 katalog.

## Bu raporun ölçütü

Bir satırın TypeScript derlenmesi veya otomatik audit'ten geçmesi içerik kalitesi değildir. Bu rapor puanı şu altı başlıktan verir: anlam doğruluğu %25, doğal bağlam %25, distractor/ölçme %15, CEFR ve spiral düzen %15, telaffuz/metadata %10, phrase-collocation ve üretim %10.

| Seviye | Gerçek puan | Otomatik audit | Ana hüküm |
|---|---:|---:|---|
| A1 | 76/100 | Geçiyor | Sağlam başlangıç havuzu; çekirdek distractor ve anlam ayrımı eksik. |
| A2 | 68/100 | Geçiyor | İşlevsel örnekler var; phrase ölçümü ve A2–B1 sınırı zayıf. |
| B1 | 25/100 | Yanıltıcı biçimde geçiyor | 120 satır yapay üç cümle iskeletinde; üretim öğretmiyor. |
| B2 | 24/100 | Yanıltıcı biçimde geçiyor | B1'in daha soyut, aynı derecede yapay sürümü. |
| C1 | 20/100 | Geçmiyor | 108 satır tek rapor cümlesine sıkışmış. |
| C2 | 16/100 | Geçmiyor | Jargon listesi var; C2 kullanım, register ve nüans yok. |

`approved` etiketi A1/A2/B1/B2 için insan editoryal review kanıtı değildir. Kod bunu otomatik bir durum olarak atadı. Bu durum, gerçek insan kontrolü yapılana kadar güvenilir yayın işareti sayılmamalıdır.

## Uygulama akışı ve sistem etkisi

Home → Practice Hub → ders → 10 soruluk topic checkpoint → 60 soruluk seviye sınavı teknik olarak çalışır. Ancak checkpoint ve sınav, yalnızca meaning-match soruları kullandığı için kelimeyi bağlamda üretmeyi, register seçmeyi veya collocation kurmayı kanıtlamaz.

`randomizeDistractors`, `approved` görünen sorularda çalışmaz. Bu nedenle A1/A2/B1/B2'de kötü yazılmış onaylı distractorlar oturumda da aynen kalır. C1/C2 ise `needs_review` durumunda kaldığı için teknik olarak farklı davranış riski taşır.

## A1 — 76/100

### Kanıt

- 365 öğe: 320 çekirdek öğe ve 45 ayrı phrase/collocation.
- IPA ve metadata 365/365; örnek şablon tekrarı yok.
- Sözcük türü: 180 isim, 40 fiil, 86 sıfat, 7 zarf, 52 `phrase` etiketi.
- 45 phrase arasında `have breakfast`, `go home`, `in front of`, `I'd like`, `need to`, `have a headache` gibi gerçek başlangıç kalıpları var.

### İyi taraflar

Somut günlük yaşam alanları, ayrı örnek bankası ve başlangıç için doğru seçilmiş kalıplar var. Phrase satırlarının büyük bölümünde yanlış seçenekler hedefe yakın ve Türkçe anlam ayrımı anlaşılır.

### Açıklar

1. Çekirdek içerik isim ağırlıklı; öğrenci nesne tanır ama eylem cümlesi üretimi daha az pratik edilir.
2. Çekirdek 320 kelimenin distractorları otomatik genel havuzdan gelir. Aynı tür, yakın anlam ve gerçek öğrenen hatası garantisi yoktur.
3. `home/house`, `rain` isim-fiil, `look/see/watch`, `make/do`, `good/nice` gibi temel çiftler ayrı karşılaştırma dersi değildir.
4. Bazı örnekler hedef A1'in üstünde destek sözcüğü kullanır: `university`, `photosynthesis`, `vibrant`, `essential nutrients`.
5. IPA CMU sözlüğünden mekanik üretildi; vurgu ve Britanya/Amerika farkları editörce doğrulanmadı.

### Gerçek kapanış kriteri

320 çekirdek satırda semantik distractor yazımı, A1 dışı destek kelimelerinin azaltılması, 25 anlam-çifti karşılaştırma görevi ve insan review kaydı gerekir.

## A2 — 68/100

### Kanıt

- 304 öğe: 254 çekirdek öğe ve 50 phrase/collocation.
- IPA/metadata 304/304; şablon tekrarı yok.
- Sözcük türü: 174 isim, 32 fiil, 42 sıfat, 1 zarf, 55 phrase etiketi.

### İyi taraflar

Seyahat, teknoloji, ödeme, görüş ve sosyal yaşam kalıpları işlevsel. `book a flight`, `check in`, `pay by card`, `agree with`, `keep in touch` gibi satırlar gerçek A2 ihtiyacına hizmet eder. Örneklerin çoğu doğal ve kısa.

### Açıklar

1. 50 yeni phrase'in tamamı aynı distractorları kullanır: `ertelemek` ve `vazgeçmek`. Bu, ölçmeyi neredeyse geçersiz kılar.
2. 174 isim karşısında 32 fiil vardır; A2 üretim ihtiyacı için dengesizdir.
3. `deadline`, `report`, `contract`, `reservation`, `itinerary`, `argument`, `sustainable` A2 ile üst seviyeler arasında tekrar eder; yeni sense veya kullanım amacı yazılı değildir.
4. `invoice`, `warranty`, `accommodation`, `itinerary` gibi bazı öğeler A2'nin pratik çekirdeğinde tartışmalıdır.
5. `approved` etiketi insan review değildir.

### Gerçek kapanış kriteri

50 phrase için ayrı distractor çiftleri; A2–B1 tekrar matrisi; en az 30 fiil/kalıp değişimi ve her üst seviye tekrarına yeni usage goal gerekir.

## B1 — 25/100

### Kanıt

- 120 öğe, 4 konu, 32 fiil/72 isim/16 sıfat; phrase 0.
- IPA/metadata var; ancak örnekler üç üretici cümleden türetiliyor.
- Kod şu biçimleri üretiyor: `The team will {verb} during …`, `The {noun} affected …`, `Their response to … was {adjective}`.
- Cümlelere `in case 1`…`in case 120` eklenmiş. Bu öğretim bağlamı değildir; audit tekrarını saklamak için eklenmiş yapay metindir.
- Seviye içi tekrarlar: `volunteer`, `opportunity`, `outcome`.

### Neden başarısız

`The team will delegate during Monday's planning session`, `Their response … was crowded`, `The remote response …` doğal değildir. Hedef kelimenin hangi tamlayıcı, register veya collocation ile kullanıldığını öğretmez. Distractorlar genel havuzdan gelir; fiil sorusunda isim seçeneği oluşabilir. `approved` durumu geri alınmalıdır.

### Gerçek kapanış kriteri

Her 120 satır için bağımsız, doğal örnek; konuya ve türüne uygun iki distractor; en az 40 B1 phrase/collocation; üç tekrarın sense ayrımı veya kaldırılması gerekir.

## B2 — 24/100

### Kanıt

- 108 öğe, 52 isim/35 fiil/21 sıfat; phrase 0; IPA/metadata var.
- Kod üç iskelet üretir: `They will {verb} during …`, `The {noun} shaped …`, `The response … was {adjective}`.
- `in case N` eki B1 ile aynı şekilde kullanılır.

### Neden başarısız

B2'nin hedefi argüman kurmak, karşı argümanı tartmak, resmî iletişim kurmaktır. Mevcut cümleler `justify`, `concede`, `confidential`, `bias`, `inquiry` gibi kelimelerin doğal kullanımını göstermiyor. Örnekten söz dizimi veya collocation öğrenilemez. Yanlış seçenekler otomatik havuzdan gelir.

### Gerçek kapanış kriteri

108 özgün örnek, en az 36 tartışma/mesleki kalıp, bağlam seçimi ve yeniden ifade soru tipleri, anlam/tür uyumlu distractorlar gerekir.

## C1 — 20/100

### Kanıt

- 108 öğe; IPA 0; phrase 0; `approved` 0.
- 108 satır tek iskelet kullanır: `The report uses {word} in its central analysis.`
- Otomatik audit 649 hata ve 108 template satırı bulur.

### Neden başarısız

`subtle`, `irony`, `empathy`, `scrutinize`, `refute` ve `coherent` aynı rapor yapısında öğretilemez. C1'in hedge, concession, stance, register dönüşümü ve akademik paragraf becerisi yoktur. `objective` hem isim hem sıfat olarak iki kez geçer; sense ayrımı yoktur.

### Gerçek kapanış kriteri

108 özgün metin bağlamı; noun/verb/adjective sense kimliği; en az 30 hedge/discourse/collocation; akademik, toplantı, e-posta ve eleştiri register'ları gerekir.

## C2 — 16/100

### Kanıt

- 100 öğe; IPA 0; phrase 0; `approved` 0.
- 99 satır tek iskelet kullanır: `The specialist presentation addressed {word} with precision.`
- Audit 601 hata, 99 template satırı bulur.
- `differentiate` ve `tentative` iki kez geçer; `due diligence` dışında çok sözcüklü hedef yoktur.

### Neden başarısız

C2 jargon tanıma değil, alan ve ton seçme becerisidir. `provision`, `moderate`, `extrapolate`, `contingent`, `triage` gibi çok anlamlı öğeler sense/register ayrımı olmadan sunuluyor. Hukuki, teknik, diplomatik ve akademik kullanımlar birbirinden ayrılmıyor. Sınav meaning-match olduğu için C2 üretimi ölçmüyor.

### Gerçek kapanış kriteri

Çift satırların sense ayrımı; 100 özgün alan bağlamı; 40 retorik/hedge/collocation; bağlama göre yeniden ifade ve register seçimi soru tipleri gerekir.

## Dürüst teslim sırası

1. B1/B2'deki sahte `approved` durumlarını geri al ve canlı katalogdan kaldır.
2. B1'i 30 satırlık gerçek editoryal batchlerle yeniden yaz; bir batch audit + insan review olmadan yayınlama.
3. B2'yi aynı süreçle yeniden yaz.
4. A2 phrase distractorlarını düzelt ve A2–B1 geçiş matrisini uygula.
5. A1 çekirdek distractorları ve anlam çiftlerini düzelt.
6. C1/C2 için önce soru türlerini genişlet, sonra içerik rewrite'ını yap.

Bu sıradan önce hiçbir seviyeye “tamamlandı” etiketi verilmemelidir.

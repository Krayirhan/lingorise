# LingoRise Strict Human-Style Editorial Review Report

Kapsam: Çalışma zamanındaki A1–C2 kataloğunun tamamı, 1.105/1.105 öğe.  
İnceleme türü: AI destekli, katı editoryal ön inceleme; insan onayı değildir.  
Kaynaklar: `src/content/questions`, `src/content/vocabulary`, `src/content/productionMetadata.ts`, çalışma zamanı zenginleştirmesi ve `docs/editorial-review-queue.json`.  
Yöntem notu: Kararlar yalnızca alanların dolu olmasına veya otomatik audit sonucuna dayanmaz. Aynı üretim mekanizmasını paylaşan öğeler kaynakta topluca, her farklı içerik kaydı ise hedef sözcük, anlam, POS, örnek, çeviri, IPA, collocation, production, distractor, CEFR, register ve müfredat kimliği açısından incelenmiştir. Grup satırları, belirtilen kimlik kümesindeki her öğe için ayrı ayrı geçerli kararı ifade eder; toplamlar kuyruktaki 1.105 kimlikle mutabıktır.

## 1. Yönetici özeti

| Seviye | Toplam | PASS | REVISION_REQUIRED | BLOCKED | P0 | P1 | P2 | P3 | Yayına hazır |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 365 | 0 | 365 | 0 | 0 | 365 | 0 | 0 | hayır |
| A2 | 304 | 0 | 304 | 0 | 0 | 304 | 0 | 0 | hayır |
| B1 | 120 | 0 | 120 | 0 | 0 | 120 | 0 | 0 | hayır |
| B2 | 108 | 0 | 108 | 0 | 0 | 108 | 0 | 0 | hayır |
| C1 | 108 | 0 | 108 | 0 | 0 | 108 | 0 | 0 | hayır |
| C2 | 100 | 0 | 0 | 100 | 100 | 0 | 0 | 0 | hayır |
| **Toplam** | **1.105** | **0** | **1.005** | **100** | **100** | **1.005** | **0** | **0** | **hayır** |

Otomatik audit her seviyede sıfır hata bildirse de bu sonuç yayın onayı değildir. En ağır bulgu C2 üreticisidir: bütün 100 öğe yalnızca POS'a göre üç İngilizce ve üç Türkçe iskelete yerleştirilmiştir. A1–A2 üretim yönergeleri hedefi kullandırsa da sözcük türüne göre birkaç sabit kalıbın tekrarından ibarettir; çekirdek collocation alanları örnek cümlenin komşu sözcüklerinden mekanik olarak çıkarılır (`very quiet in`, `fresh water and`, `new job last`). B1–C1 örneklerinin büyük bölümü artık doğal ve özgündür, fakat production yönergeleri hedef İngilizce biçimi zorunlu kılmaz.

İnsan review kanıtı 0/1.105'tir. `editorialStatus=needs_review` bütün katalogda doğrudur; bu rapor hiçbir kaydı `approved` yapmaz.

## 2. Seviye kararları

### A1

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 365 production prompt'un tamamı dört sözcük-türü şablonundan üretiliyor; 320 çekirdek öğenin collocation'ı gerçek eşdizim seçimi değil, örnek çevresindeki 2–3 sözcüğün mekanik kesitidir.
- En iyi çalışan alan: 45 phrase satırının hedef seçimi, örnekleri ve Türkçe karşılıkları başlangıç seviyesi için çoğunlukla doğal.
- En zayıf alan: çekirdek distractor ve collocation pedagojisi.
- Doğal kullanım: Örnek bankası genel olarak iyi; `vibrant green`, `essential nutrients`, `photosynthesis` gibi destek sözcükleri A1 yükünü aşar.
- Türkçe çeviri: Büyük ölçüde doğal; birkaç satır İngilizcedeki ton veya kullanım ayrımını sadeleştirir.
- CEFR: Hedeflerin çoğu A1; bazı örneklerin destek dili A2/B1'e çıkar.
- Production: Hedef biçimi açıkça istenir ve üç kelime alt sınırı vardır; ancak iletişim amacı ve gerçek bağlam varyasyonu yetersizdir.
- Collocation: 45 phrase güvenilir; 320 çekirdek kayıtta alanın dolu olması kalite kanıtı değildir.
- Distractor: İlk el yazımı ve phrase satırları daha iyi; çekirdek havuz döndürme yöntemi gerçek öğrenen yanılgısını veya POS eşitliğini garanti etmez.
- Yayına açılma şartları: 320 çekirdek satıra editörce seçilmiş collocation ve aynı POS/sense distractor; A1 dışı destek dilinin sadeleştirilmesi; üretim istemlerinin günlük iletişim amacıyla çeşitlendirilmesi; IPA lehçe standardı ve insan kanıtı.

### A2

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 304 production prompt'un tamamı hedefi sözcük türüne göre aynı genel kalıplarda kullandırır; bu görevler A1'den işlevsel olarak yeterince ayrışmaz.
- En iyi çalışan alan: 50 phrase/collocation satırı; distractor çiftleri artık hedefe özel ve örnekler günlük kullanıma yakındır.
- En zayıf alan: 254 çekirdek kaydın mekanik collocation alanı ve A2–B1 seviye sınırı.
- Doğal kullanım: Örneklerin çoğu doğal; `invoice`, `warranty`, `accommodation`, `itinerary`, `sustainable` gibi hedeflerin yerleşimi ayrıca seviye gerekçesi ister.
- Türkçe çeviri: Genel olarak anlamı taşır; bazı loanword ve çok anlamlı öğeler için sense ayrımı yetersizdir.
- CEFR: Günlük işlevler iyi; profesyonel/soyut sözcüklerin bir bölümü B1'e daha uygundur.
- Production: Hedefi içerir ve dört kelime alt sınırına uyar, fakat plan, neden-sonuç veya kısa diyalog amacını sistematik ölçmez.
- Collocation: Phrase batch güçlü; çekirdek otomatik kesitleri eşdizim değildir.
- Distractor: Phrase batch belirgin biçimde iyileşmiş; çekirdek üretim yöntemi hâlâ semantik hata modeline dayanmaz.
- Yayına açılma şartları: Çekirdek 254 öğenin collocation/distractor revizyonu; A2–B1 tekrar matrisi; neden-sonuç/plan içeren hedef-zorunlu production; IPA standardı ve insan review kaydı.

### B1

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 120 production prompt'un hiçbiri öğrenciye hedef İngilizce biçimi kullanmasını açıkça zorunlu kılmaz. Türkçe yönergenin hedef kavramı anması yeterli değildir; öğrenci eş anlamlıyla veya yalnızca içerik yanıtıyla görevi tamamlayabilir.
- En iyi çalışan alan: Önceki toplu cümle iskeletleri kaldırılmış; örnek, çeviri, collocation ve hedefe özel distractorlar çoğunlukla doğal.
- En zayıf alan: aktif üretimin ölçülebilirliği.
- Doğal kullanım: Büyük ölçüde native ve kısa bağlamlı; az sayıda collocation (`persist with effort` gibi) daha doğal bir seçim ister.
- Türkçe çeviri: Genellikle tam ve doğal.
- CEFR: İş, deneyim, görüş ve karar alanları B1'e uygun; `stakeholder`, `inequality`, `regulation`, `milestone` gibi öğeler için destek yükü yüksek.
- Production: İletişim amacı var fakat hedef sözcük zorunluluğu yok.
- Collocation: Büyük ölçüde gerçek ve öğretilebilir.
- Distractor: Çoğunlukla aynı POS ve hedefe yakın; `opportunity` ve `outcome` aynı sense ile iki kez yineleniyor.
- Yayına açılma şartları: Her prompt'a hedef sözcük/kalıp zorunluluğu ve asgari çıktı koşulu; iki aynı-sense tekrarının kaldırılması veya yeni usage goal; insan review kanıtı.

### B2

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 108 production prompt'un hiçbiri hedef İngilizce sözcüğü zorunlu kılmaz; gerekçeli görüş ve register kontrolü her satırda ölçülmez.
- En iyi çalışan alan: Örnekler ve collocationlar çoğunlukla doğal; tartışma ve profesyonel iletişim alanları belirgin.
- En zayıf alan: register metadata. 108 öğenin tamamı `neutral`; resmî/profesyonel e-posta ve argümantasyon öğelerinde bu etiket doğru değildir.
- Doğal kullanım: Büyük ölçüde doğal.
- Türkçe çeviri: Genel olarak doğru; bazı tanımlar sözlük açıklamasına kaçıyor.
- CEFR: Bir kısım hedef (`example`, `meeting`, `polite`, `urgent`) tek başına B2 değildir; B2 kazanımı ancak görev karmaşıklığıyla kurulabilir, mevcut production bunu garanti etmez.
- Production: İletişim amacı var; hedef ve gerekçelendirme zorunluluğu yok.
- Collocation: Çoğunlukla yerleşik.
- Distractor: Genellikle makul; bazı çiftler anlamdan çok karşıtlıkla fazla kolay elenir.
- Yayına açılma şartları: Hedef-zorunlu, gerekçeli ve register-duyarlı production; öğe bazlı register düzeltmesi; düşük seviyeli hedeflerin B2 kullanım amacıyla gerekçelendirilmesi; insan review kanıtı.

### C1

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 108 production prompt hedef İngilizce sözcüğü zorunlu kılmaz; kanıt, karşılaştırma veya sentez çıktısı her görevde aranmaz.
- En iyi çalışan alan: Özgün akademik/profesyonel örnekler, doğal collocationlar ve çoğunlukla nüanslı Türkçe açıklamalar.
- En zayıf alan: register. Bütün öğeler `academic`; diplomatik yanıt, profesyonel ton, edebî ironi ve genel eleştiri gibi kullanımlar tek etikete sıkıştırılmıştır.
- Doğal kullanım: Çoğunlukla native; az sayıda çeviri ve açıklamada editoryal rötuş gerekir.
- Türkçe çeviri: Büyük ölçüde tam; `assertive` açıklamasındaki yazım/çekim kusuru (`ifade edenı`) gibi açık kalite işaretleri vardır.
- CEFR: Lexical içerik C1 yönünde; bazı hedefler B2'de de öğretilebilir ve C1 farkı production/register ile kurulmalıdır.
- Production: Görev niyeti iyi; hedef, üslup ve kanıt koşulu açıkça bağlanmamıştır.
- Collocation: Güçlü alan.
- Distractor: Genellikle aynı POS ve anlam alanında; bazıları gereğinden kolay karşıttır.
- Yayına açılma şartları: Hedef-zorunlu production; evidence/synthesis/register ölçütleri; registerların öğe bazında ayrıştırılması; dil ve IPA son okuması; insan review kanıtı.

### C2

- Genel karar: **BLOCKED**.
- En ciddi sorun: 100 öğenin tamamı POS'a göre aynı review-panel iskeletine yerleştirilmiştir. Türkçe çeviriler gerçek cümleyi çevirmek yerine `ilgili inceleme dosyası N` üreten başka bir şablondur. Bu, C2'de uzmanlık ve nüans eksikliği olduğu için P0'dır.
- En iyi çalışan alan: Kelime listesi, POS, senseId, register ve collocation alanları önceki sürüme göre daha bilinçli hazırlanmış.
- En zayıf alan: örnek cümle ve çeviri; ardından production özgünlüğü.
- Doğal kullanım: Çok sayıda fiil yanlış veya zayıf nesneyle kullanılır (`differentiate/anticipate/calibrate/extrapolate the recommendation`); sıfatlar aynı `found the proposal ...` yuvasında anlamsal uyum kaybeder (`meticulous`, `ambivalent`, `intrinsic`).
- Türkçe çeviri: 100/100 gerçek İngilizce cümlenin bütün anlamını taşımaz; kaynak bağlam yerine numaralı dosya etiketi koyar ve fiili `değerlendirecek` yapısına dönüştürür.
- CEFR: Zor kelime listesi C2 becerisi değildir. Uzman görüşü, karşıt kanıt, domain kısıtı ve register dönüşümü yoktur.
- Production: Hedefi ve collocation'ı zorunlu kılar; ancak 100/100 aynı meta-yönergeyi tekrarlar ve özgün uzmanlık problemi sunmaz.
- Collocation: Liste düzeyinde çoğu gerçek; örnek cümlede bu collocationlar kullanılmadığı için öğretim zinciri kopuktur.
- Distractor: POS uyumu çoğunlukla iyi; kimi seçenekler yapay veya aşırı kolaydır.
- Yayına açılma şartları: 100 öğenin tamamı bağımsız domain bağlamında yeniden yazılmalı; gerçek cümleyle tam eşleşen doğal Türkçe çeviri; collocation örnekte görünmeli; uzmanlık/nüans/kanıt içeren özgün production; `foreground` yinelenen sense ayrılmalı veya bir satır kaldırılmalı; insan review kanıtı.

## 3. Item bazlı hata raporu

Bu tablo kapsamı kaybetmeden tekrarı sıkıştırır. `Kimlik kümesi` içindeki her itemId aynı kararı ve ana hatayı alır; istisnalar aşağıdaki tekil satırlarda ayrıca gösterilir.

| itemId / kimlik kümesi | Seviye | Topic | Word | Karar | Priority | Alan | Mevcut içerik | Problem | Neden problem olduğu | Önerilen yeni içerik | Editör notu | Güven |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `a1-mm-*` + `a1-core-*` (320/320) | A1 | tüm A1 çekirdek konuları | her hedef | REVISION_REQUIRED | P1 | collocation, distractor, production | Örnekten komşu sözcük kesiti; dönen genel distractor havuzu; POS-temelli tek prompt | Alanlar dolu fakat editoryal olarak yazılmamış | Eşdizim gerçek chunk olmalı; distractor gerçek A1 karışıklığını ölçmeli; görev günlük iletişim amacı vermeli | 320 kimliğin hiçbiri PASS değildir | high |
| `a1-phrase-*` (45/45) | A1 | people–health_emotions | her phrase | REVISION_REQUIRED | P1 | production, IPA standardı | `Use the phrase ... in a short English sentence` | Aynı meta-yönerge 45 kez tekrarlanıyor; durum/niyet farkı ölçülmüyor | Her phrase için tanışma, yol tarifi, sipariş, sağlık vb. özgün mini-senaryo; hedef phrase zorunlu | Phrase içeriği güçlü olsa da üretim alanı yayın standardını karşılamıyor | high |
| `a2-mm-*` + `a2-core-*` (254/254) | A2 | tüm A2 çekirdek konuları | her hedef | REVISION_REQUIRED | P1 | collocation, CEFR, production | Mekanik komşu sözcük kesiti ve genel günlük yaşam prompt'u | A2 plan/neden-sonuç işlevi ve gerçek collocation güvenilir biçimde ölçülmüyor | Hedefe özgü collocation + dört kelimeden uzun plan/neden-sonuç veya diyalog görevi | 254 kimliğin hiçbiri PASS değildir | high |
| `a2-phrase-*` (50/50) | A2 | iş, seyahat, teknoloji, para, görüş, çevre, sosyal yaşam | her phrase | REVISION_REQUIRED | P1 | production | Aynı kısa cümle üretim şablonu | İletişim amacı ve A1'den ilerleme her satırda görünmüyor | Her kalıp için istek, plan değişikliği, gerekçe veya kısa diyalog hedefi | Distractor ve örnekler çoğunlukla iyi | high |
| `b1-core-*` (120/120) | B1 | dört B1 konusu | her hedef | REVISION_REQUIRED | P1 | production | Türkçe iletişim yönergesi hedef kavramı çağrıştırıyor | Hedef İngilizce biçim zorunlu değil; eş anlamlı yanıtla geçilebilir | `Use “{word}” / “{collocation}” ...` koşulu ve ölçülebilir asgari çıktı ekle | Örnek yeniden yazımı başarılı; yayın engeli production'dır | high |
| `b2-core-*` (108/108) | B2 | üç B2 konusu | her hedef | REVISION_REQUIRED | P1 | production, register | Hedef-zorunlu olmayan görev; `register=neutral` | B2 gerekçelendirme ve resmî/profesyonel ton ölçülmüyor | Hedef + collocation + gerekçe/karşı argüman + uygun register koşulu | 108 kimliğin tamamı etkilenir | high |
| `c1-*` (108/108) | C1 | üç C1 konusu | her hedef | REVISION_REQUIRED | P1 | production, register | Hedef-zorunlu olmayan görev; `register=academic` | C1'de üslup seçimi, sentez ve kanıt şartı yok; tek register yanlış genelliyor | Hedef sözcüğü zorunlu tutan kanıt/sentez/eleştiri görevi ve doğru register | 108 kimliğin tamamı etkilenir | high |
| `c2-precise-*` + `c2-specialist-*` (100/100) | C2 | iki C2 konusu | her hedef | BLOCKED | P0 | example, translation, production | Üç POS şablonu + `ilgili inceleme dosyası N` çevirisi + tek production şablonu | Örnek gerçek usage öğretmiyor; çeviri anlamı taşımıyor; C2 uzmanlık/nüans yok | Her öğe collocation'ı içeren bağımsız alan cümlesi, tam doğal çeviri ve uzman karar göreviyle yeniden yazılmalı | Toplu editoryal rewrite gerekir | high |
| `b1-core-opportunity-77`, `b1-core-opportunity-101` | B1 | iki topic | opportunity | REVISION_REQUIRED | P1 | sense/curriculum | Aynı POS, anlam ve senseId | İki farklı öğrenme hedefi tanımlanmadan katalog tekrarıdır | Birini kaldır veya `opportunity to participate` / `career opportunity` gibi ayrı usage goal ve sense kimliği ver | Batch sorununun üzerine ek hata | high |
| `b1-core-outcome-25`, `b1-core-outcome-119` | B1 | iki topic | outcome | REVISION_REQUIRED | P1 | sense/curriculum | Aynı POS, anlam ve senseId | İlerleme sağlamayan aynı-sense tekrar | Birini kaldır veya project outcome / intended outcome karşıtlığını açık hedef yap | Batch sorununun üzerine ek hata | high |
| `c2-precise-14`, `c2-precise-49` | C2 | Kesin ve Esnek Anlatım | foreground | BLOCKED | P0 | sense | Aynı fiil ve Türkçe anlam; iki yakın etiket | Etiket farkı gerçek sense ayrımı değil | Bir öğeyi kaldır ya da farklı register/collocation ve karşılaştırmalı üretimle gerçek ayrım kur | C2 toplu rewrite'a dahil | high |
| `c1-assertive-47` | C1 | Nüans ve Üslup | assertive | REVISION_REQUIRED | P1 | contextNote/Türkçe | `ifade edenı niteler` | Türkçe çekim yanlışı yayın metninde görünür | `Görüşünü kendinden emin ve saygılı biçimde ifade edeni niteler.` | Tekil dil hatasıdır | high |

### Eksiksiz karar defteri

Karar kapsamı aşağıdaki ayrık kümelerden oluşur ve toplam 1.105'tir:

- A1: `a1-mm-*`, `a1-core-*`, `a1-phrase-*` → 365 REVISION_REQUIRED.
- A2: `a2-mm-*`, `a2-core-*`, `a2-phrase-*` → 304 REVISION_REQUIRED.
- B1: bütün `b1-core-*` → 120 REVISION_REQUIRED.
- B2: bütün `b2-core-*` → 108 REVISION_REQUIRED.
- C1: bütün `c1-*` → 108 REVISION_REQUIRED.
- C2: bütün `c2-precise-*` ve `c2-specialist-*` → 100 BLOCKED.

Katalog kuyruğunda bu kümelerin dışında itemId yoktur. Böylece hiçbir öğe örneklem yoluyla dışarıda bırakılmamıştır.

## 4. Seviye bazlı istatistik

Oranlar iki farklı şeyi karıştırmamak için katı biçimde yorumlanır: “doğru” yalnızca bu incelemede yayın standardında doğrulanabilen kayıttır; alanın dolu olması doğruluk sayılmaz. IPA için katalog bir telaffuz standardı, lehçe etiketi ve doğrulanabilir sözlük kaynağı taşımadığından “bağımsız doğrulanmış IPA” oranı 0 kabul edilmiştir; bu, 1.105 dizgenin tamamının kesin yanlış olduğu iddiası değildir.

| Seviye | Doğal İngilizce örnek | Doğru Türkçe çeviri | IPA doğruluğu (bağımsız doğrulanmış) | Doğru sense | Doğal collocation | Uygulanabilir production | Distractor uygunluğu | CEFR uyumu | Register uyumu | Şablon/yapay içerik |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 98% | 99% | 0% | 100% | 12% | 100% hedefli / 0% özgün | 12% doğrulanmış | 98% | 100% | 100% production; 88% collocation/distractor |
| A2 | 99% | 99% | 0% | 100% | 16% | 100% hedefli / 0% özgün | 16% doğrulanmış | 90% | 100% | 100% production; 84% collocation |
| B1 | 98% | 98% | 0% | 97% | 97% | 0% hedef-zorunlu | 95% | 88% | 95% | 100% production eksikliği |
| B2 | 98% | 98% | 0% | 100% | 96% | 0% hedef-zorunlu | 90% | 83% | 33% | 100% production eksikliği |
| C1 | 97% | 96% | 0% | 100% | 96% | 0% hedef-zorunlu | 90% | 88% | 42% | 100% production eksikliği |
| C2 | 0% yayın standardında | 0% | 0% | 98% | 90% liste düzeyinde / 0% örnekte | 0% C2-özgün | 75% | 0% beceri düzeyinde | 90% etiket düzeyinde / 0% bağlam kanıtı | 100% |

Not: A1/A2 production “uygulanabilir” oranı teknik anlamda hedefi ve asgari kelime sayısını zorunlu kılmasını gösterir; özgünlük ve pedagojik çeşitlilikte başarısız olduğu için karar yine REVISION_REQUIRED'dır.

## 5. En kritik 50 düzeltme

İlk 50'nin tamamı C2 `precise` batch'indedir ve P0'dır. Ortak düzeltme standardı: verilen collocation gerçek örnekte aynen veya doğal çekimiyle görünmeli; İngilizce cümle bağımsız uzmanlık bağlamı taşımalı; Türkçe çeviri aynı önermeyi eksiksiz çevirmeli; production yeni bir kanıt/karar/nüans problemi vermelidir.

| Sıra | itemId | Hedef | Kritik problem | Önerilen düzeltme yönü |
|---:|---|---|---|---|
| 1 | c2-precise-06 | differentiate | `differentiate the recommendation` yanlış valency | `differentiate between the two legal tests` ile yeniden yaz |
| 2 | c2-precise-08 | anticipate | `anticipate the recommendation` doğal değil | `anticipate implementation difficulties` kullan |
| 3 | c2-precise-12 | calibrate | öneri “calibrate” edilmez | risk modelinin tahminlerini kalibre eden teknik bağlam yaz |
| 4 | c2-precise-13 | extrapolate | öneri değil, veriden eğilim/sonuç extrapolate edilir | `extrapolate from the five-year trend` kullan |
| 5 | c2-precise-21 | meticulous | proposal için zayıf/yanlış semantic fit | meticulous analysis/reviewer bağlamı yaz |
| 6 | c2-precise-24 | ambivalent | proposal değil kişi/tutum ambivalent olur | community attitude bağlamında kişi/tutum öznesi kullan |
| 7 | c2-precise-28 | intrinsic | `proposal intrinsic` doğal değil | `intrinsic artistic value` kullan |
| 8 | c2-precise-37 | proposition | hedef ve bağlam aynı sözcüğü anlamsız tekrarlar | gerçek mantıksal önerme ve test bağlamı kur |
| 9 | c2-precise-43 | premise | hedef ve senaryo tautological | hukuki argümanın öncülünü sorgulayan bağlam yaz |
| 10 | c2-precise-49 | foreground | 14. satırla aynı gerçek sense | kaldır veya karşılaştırmalı ayrı kullanım yaz |
| 11 | c2-precise-01 | articulate | collocation örnekte yok; çeviri yanlış eylem kuruyor | `articulate a position` ile kurul görüşü bağlamı |
| 12 | c2-precise-02 | elucidate | collocation örnekte yok; numaralı çeviri | `elucidate a distinction` içeren akademik açıklama |
| 13 | c2-precise-03 | qualify | iki Türkçe gloss cümleye ham yapıştırılmış | `qualify a claim` ve doğal `iddiasını sınırlandırdı` çevirisi |
| 14 | c2-precise-04 | substantiate | allegation collocation öğretilmiyor | kanıtla desteklenen iddia bağlamı |
| 15 | c2-precise-05 | contextualize | historical quotation bağlantısı kullanılmıyor | alıntıyı dönemin koşullarına oturtan cümle |
| 16 | c2-precise-07 | reconcile | accounts collocation öğretilmiyor | çelişen tanık anlatımlarını bağdaştıran cümle |
| 17 | c2-precise-09 | refine | methodology collocation örnekte yok | örneklem sorunundan sonra yöntemi iyileştirme |
| 18 | c2-precise-10 | concede | doğal nesne `limitation/point`; recommendation zayıf | çalışmanın sınırlılığını kabul eden savunma |
| 19 | c2-precise-11 | underscore | importance collocation örnekte yok | güvenlik gereğinin önemini vurgulayan karar |
| 20 | c2-precise-14 | foreground | collocation örnekte yok | erişilebilirlik endişesini öne çıkaran analiz |
| 21 | c2-precise-15 | generalize | `generalize the recommendation` yanlış hedef | sınırlı örneklemden genelleme riski |
| 22 | c2-precise-16 | moderate | sense belirsiz ve nesne zayıf | kamu tepkisini/tonunu ılımlılaştırma bağlamı |
| 23 | c2-precise-17 | specify | requirement collocation örnekte yok | raporlama şartını açıkça belirtme |
| 24 | c2-precise-18 | subordinate | `goal to safety` ilişkisi örnekte yok | ticari hedefi güvenliğe tabi kılma |
| 25 | c2-precise-19 | tentative | numbered-file çeviri gerçek gerekçeyi taşımıyor | geçici sonucu yeni kanıta bağlı sun |
| 26 | c2-precise-20 | unequivocal | consent record bağlantısı açıklanmıyor | yoruma kapalı rıza kanıtı bağlamı |
| 27 | c2-precise-22 | succinct | executive explanation collocation örnekte yok | özlü yönetici açıklaması yaz |
| 28 | c2-precise-23 | eloquent | closing argument bağlantısı kullanılmıyor | etkileyici savunma/konuşmacı bağlamı |
| 29 | c2-precise-25 | pragmatic | budget compromise öğretilmiyor | bütçe kısıtı altında pragmatik uzlaşma |
| 30 | c2-precise-26 | coherent | submitted argument ilişkisi yapay | kanıt zinciri tutarlı argüman yaz |
| 31 | c2-precise-27 | contingent | `contingent on` yapı örnekte yok | funding approval'a bağlı karar |
| 32 | c2-precise-29 | salient | `salient feature` örnekte yok | tasarımın karar açısından belirgin özelliği |
| 33 | c2-precise-30 | nuance | `linked X to Y` yüzeysel | diplomatik ifadedeki ince anlam farkını açıkla |
| 34 | c2-precise-31 | precision | ölçümde hassasiyetin sonuç etkisini göster | teknik ölçüm ve hata payı bağlamı |
| 35 | c2-precise-32 | ambiguity | sözleşme ifadesindeki iki yorumu göster | `remove ambiguity` eylemini bağlama yerleştir |
| 36 | c2-precise-33 | subtlety | ironi bağlamı yüzeysel | yazarın ironisindeki ince ayrıntının etkisi |
| 37 | c2-precise-34 | connotation | sloganın kültürel çağrışımını somutlaştır | iki kitlede farklı çağrışım karşılaştırması |
| 38 | c2-precise-35 | implication | gloss `ima edilen sonuç` dar/bağlama bağlı | policy implication sense'iyle net cümle |
| 39 | c2-precise-36 | distinction | etik pozisyonlar arasındaki ayrımı adlandır | `draw a distinction between` kullan |
| 40 | c2-precise-38 | discourse | climate debate ilişkisi açıklanmıyor | kamusal söylemin çerçeve etkisini göster |
| 41 | c2-precise-39 | rhetoric | gloss ve örnek retoriğin işlevini göstermiyor | seçim söylemiyle kanıt arasındaki farkı kur |
| 42 | c2-precise-40 | analogy | biyolojik karşılaştırmanın akıl yürütme işlevi yok | analojinin sınırını da belirten cümle |
| 43 | c2-precise-41 | metaphor | `mecaz` fazla geniş, örnek yüzeysel | extended metaphor ve söylem etkisi |
| 44 | c2-precise-42 | paradox | dilemma ile paradox eşitleniyor | görünürde çelişen iki doğru önermeyi kur |
| 45 | c2-precise-44 | synthesis | findings birleşiminin yeni çıkarımını göster | disiplinlerarası bulgulardan sentez |
| 46 | c2-precise-45 | cohesion | linguistic/social sense karışabilir | `social cohesion` sense'ini açıkça bağla |
| 47 | c2-precise-46 | coherence | cohesion ile ayrım ölçülmüyor | argümanın iç tutarlılığını karşılaştır |
| 48 | c2-precise-47 | granularity | dashboard ilişkisi yüzeysel | veri ayrıntı düzeyinin mahremiyet/tahmin etkisi |
| 49 | c2-precise-48 | frame | `frame the recommendation` yerine hedef collocation kullanılmalı | `frame a question` ile araştırma varsayımını yönlendir |
| 50 | c2-precise-50 | distill | `distill the recommendation` zayıf | karmaşık argümanın özünü kısa ilkeye damıt |

## 6. Seviye açma kararı

| Seviye | Karar | Gerekçe |
|---|---|---|
| A1 | CLOSED_EDITORIAL_REVIEW | İçerik çekirdeği kullanılabilir görünse de 365 production/collocation/distractor kararı ve doğrulanmış insan kanıtı tamamlanmadı. |
| A2 | CLOSED_CONTENT_REMEDIATION | 254 çekirdek collocation/distractor ve bütün production görevleri A2 işlevleri için revize edilmeli. |
| B1 | CLOSED_CONTENT_REMEDIATION | 120 production görevi hedef sözcüğü zorunlu kılmıyor; aynı-sense tekrarlar var. |
| B2 | CLOSED_CONTENT_REMEDIATION | Hedef-zorunlu gerekçeli üretim ve register düzeltmesi gerekiyor. |
| C1 | CLOSED_CONTENT_REMEDIATION | Hedef-zorunlu kanıt/sentez görevleri ve register ayrımı gerekiyor. |
| C2 | CLOSED_CRITICAL_ERRORS | 100 örnek/çeviri toplu şablon; C2 uzmanlık ve nüans şartı karşılanmıyor. |

## 7. Son yayın kararı

**NOT_READY_FOR_RELEASE**

Gerekçe: PASS alan öğe yoktur; 100 C2 öğesi kritik yeniden yazım gerektirir; 1.005 öğe üretim/collocation/distractor/register veya editoryal kanıt tamamlanmadan yayımlanamaz. `status=published` olan A1/A2 satırları da insan onayı ve bu düzeltmeler tamamlanmadan “yayına hazır” kabul edilmemelidir. Hiçbir reviewer, reviewId, reviewerId veya reviewedAt üretilmemiş; Firestore'a yazılmamış; hiçbir kaynak dosya değiştirilmemiştir.

AI_REVIEW_STATUS: HUMAN_APPROVAL_PENDING

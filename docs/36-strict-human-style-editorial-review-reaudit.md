# LingoRise Strict Human-Style Editorial Review Report

Kapsam: 12 Eylül 2026 güncel çalışma zamanı kataloğu; A1–C2, 1.105/1.105 öğe.
İnceleme türü: katı AI editoryal ön inceleme; insan onayı değildir.
Sürüm notu: Bu rapor, üretim ve C2 kaynakları değiştirildikten sonra hazırlanmış yeniden incelemedir ve `35-strict-human-style-editorial-review-report.md` belgesinin yerine geçer.
Değişiklik sınırı: Kod/içerik değiştirilmedi, Firestore'a yazılmadı, reviewer/reviewId/reviewerId/reviewedAt üretilmedi.

## 1. Yönetici özeti

| Seviye | Toplam | PASS | REVISION_REQUIRED | BLOCKED | P0 | P1 | P2 | P3 | Yayına hazır |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 365 | 0 | 365 | 0 | 0 | 365 | 0 | 0 | hayır |
| A2 | 304 | 0 | 304 | 0 | 0 | 304 | 0 | 0 | hayır |
| B1 | 120 | 0 | 64 | 56 | 56 | 64 | 0 | 0 | hayır |
| B2 | 108 | 0 | 108 | 0 | 0 | 108 | 0 | 0 | hayır |
| C1 | 108 | 0 | 108 | 0 | 0 | 108 | 0 | 0 | hayır |
| C2 | 100 | 0 | 97 | 3 | 3 | 97 | 0 | 0 | hayır |
| **Toplam** | **1.105** | **0** | **1.046** | **59** | **59** | **1.046** | **0** | **0** | **hayır** |

Otomatik sonuç: 591 test geçti, TypeScript kontrolü geçti ve katalog audit'i 0 yapısal hata bildirdi. Bu sonuç PASS değildir. Audit, B1'deki `Explain how to heavy workload`, C2'deki `the candidate woven ...` ve Türkçe sense kaymalarını yakalamamaktadır.

İnsan onayı: 0/1.105. Bütün öğeler `needs_review` durumundadır. IPA dizgeleri dolu olsa da katalog tek bir lehçe standardı ve doğrulanabilir sözlük kaynağı belirtmediğinden bu inceleme IPA'yı bağımsız olarak doğrulanmış saymamıştır. Kullanıcının “şüphede PASS verme” kuralı gereği bu tek başına dahi nihai PASS'i engeller.

## 2. Seviye kararları

### A1

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 320 çekirdek öğede hazırlanan `A1_COLLOCATIONS` haritası çalışma zamanında öncelik almıyor; kod önce `exampleCollocation()` sonucunu seçiyor. Bu nedenle `fresh water and`, `small seed and`, `this year I`, `lot yesterday` gibi cümle parçaları collocation olarak kalıyor.
- En iyi çalışan alan: Örnek cümle bankası ve 45 temel phrase satırı.
- En zayıf alan: çekirdek collocation ve gerçek öğrenen hatasına dayanmayan distractor üretimi.
- Doğal kullanım değerlendirmesi: Örneklerin çoğu doğal; `vibrant`, `photosynthesis`, `essential nutrients` gibi destek dili A1'i aşıyor.
- Türkçe çeviri değerlendirmesi: Büyük ölçüde tam ve doğal.
- CEFR değerlendirmesi: Hedefler çoğunlukla A1; bazı destek cümleleri gereğinden zor.
- Production değerlendirmesi: Hedef ve üç kelime şartı var; ancak 328 civarı öğe yalnızca topic/POS şablonunu tekrarlar. Phrase batch de tek meta-yönerge kullanır.
- Collocation değerlendirmesi: 45 phrase güvenilir; çekirdek alanın doluluğu kalite kanıtı değil. Ayrıca haritada `today morning` ve `yesterday night` açıkça doğal değildir; doğru biçimler `this morning` ve `last night`tır.
- Distractor değerlendirmesi: POS/topic filtresi iyileştirilmiş olsa da hash ile döndürme gerçek learner-confusion verisi değildir.
- Yayına açılma şartları: collocation öncelik hatası düzeltilmeli, 320 çekirdek eşdizim gerçek usage olarak gözden geçirilmeli, distractorlar öğrenen hatalarına göre yazılmalı, IPA standardı ve dört insan rolü doğrulanmalı.

### A2

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 254 çekirdek öğede collocation hâlâ örnek cümlenin komşu sözcüklerinden mekanik çıkarılıyor (`new job last`, `our office is`, `the salary is`).
- En iyi çalışan alan: 50 phrase/collocation öğesinin örnekleri ve hedefe özel distractorları.
- En zayıf alan: çekirdek collocation ve A2–B1 lexical sınırı.
- Doğal kullanım değerlendirmesi: Örneklerin çoğu doğal.
- Türkçe çeviri değerlendirmesi: Büyük ölçüde doğru; birkaç loanword ve profesyonel terim için doğal Türkçe tercih kontrolü gerekir.
- CEFR değerlendirmesi: İşlevsel alanlar doğru; `invoice`, `warranty`, `accommodation`, `itinerary`, `sustainable` gibi hedefler A2 çekirdeğinde tartışmalıdır.
- Production değerlendirmesi: Hedef ve dört kelime şartı var; topic şablonları neden/plan/çözüm amacı ekliyor. Ancak `Suggest a helpful download an app action...` doğal İngilizce değildir.
- Collocation değerlendirmesi: Phrase set güçlü, çekirdek set mekanik.
- Distractor değerlendirmesi: Phrase set hedefe özel; çekirdek set POS/topic havuzundan algoritmik seçiliyor ve gerçek öğrenen hatası kanıtı yok.
- Yayına açılma şartları: 254 çekirdek eşdizim ve distractor insan editörce yazılmalı; A2–B1 progression gerekçeleri tek tek doğrulanmalı; bozuk production düzeltilmeli; IPA ve insan onayı tamamlanmalı.

### B1

- Genel karar: **56 BLOCKED, 64 REVISION_REQUIRED**.
- En ciddi sorun: `getB1ProductionPrompt` her collocation'ı körlemesine `Explain how to` arkasına koyuyor. Fiil öbeği olmayan 56 kayıt dilbilgisel olarak bozuk ve P0'dır.
- En iyi çalışan alan: 120 özgün örnek cümle, doğal Türkçe çeviri ve çoğunlukla gerçek collocation.
- En zayıf alan: production üreticisi.
- Doğal kullanım değerlendirmesi: Örneklerin çoğu native ve B1 bağlamına uygun.
- Türkçe çeviri değerlendirmesi: Büyük ölçüde doğru.
- CEFR değerlendirmesi: Genel yapı uygun; bazı profesyonel/soyut hedefler güçlü destek gerektirir.
- Production değerlendirmesi: 56/120 anlamsız veya bozuk; kalan 64 hedefi zorunlu kılsa da aynı dört alan cümlesini tekrarlar (`during a travel journey` ayrıca gereksiz yinelenmiştir).
- Collocation değerlendirmesi: Çoğunlukla doğal; `persist with effort` zayıf, `take a route` bağlama göre yapaydır.
- Distractor değerlendirmesi: Önceki sürüme göre daha iyi ve çoğunlukla aynı POS'tadır; doğrudan learner-error kanıtı yine yoktur.
- Yayına açılma şartları: production jeneratörü POS/collocation türünü anlamalı veya 120 özgün prompt yazılmalı; bozuk 56 öğe yeniden audit edilmeden B1 açılamaz.

### B2

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 108 prompt tek bir yapı ailesinden türetiliyor: `State and justify your perspective on "{collocation}" {goal}...`. `on "develop a theory" analyzing...`, `on "imply that" constructing...` gibi sonuçlar doğal bir görev yönergesi değildir.
- En iyi çalışan alan: Örnek, çeviri, collocation ve topic bazlı register ayrımı (`academic/formal/professional`).
- En zayıf alan: production görevlerinin doğal İngilizcesi ve öğeye özgü iletişim amacı.
- Doğal kullanım değerlendirmesi: Örnekler çoğunlukla doğal.
- Türkçe çeviri değerlendirmesi: Büyük ölçüde anlamı taşır.
- CEFR değerlendirmesi: Üç alan B2 yönünde; `example`, `meeting`, `polite`, `urgent` gibi düşük lexical hedeflerin B2 değeri yalnızca görev karmaşıklığıyla kurulabilir.
- Production değerlendirmesi: Hedef zorunlu ve gerekçe isteniyor; fakat prompt sözdizimi/semantiği 108 öğede doğal değil.
- Collocation değerlendirmesi: Çoğunlukla gerçek ve yaygın.
- Distractor değerlendirmesi: Çoğunlukla POS uyumlu fakat kimi çiftler yalnızca bariz karşıtlıkla elenir.
- Yayına açılma şartları: collocation'ın türüne göre özgün, doğal ve gerçekten gerekçeli 108 production görevi; düşük seviye hedeflere B2 usage goal; IPA ve insan onayı.

### C1

- Genel karar: **REVISION_REQUIRED**.
- En ciddi sorun: 108 production prompt üç konu şablonuna sıkışmış; collocation metin olarak tırnak içine ekleniyor fakat görev çoğu öğede gerçek kullanım durumuna dönüşmüyor.
- En iyi çalışan alan: Özgün örnekler, collocationlar ve akademik/formal register ayrımı.
- En zayıf alan: production özgünlüğü ve Türkçe son okuma.
- Doğal kullanım değerlendirmesi: Örneklerin çoğu doğal ve C1 işlevlerine uygundur.
- Türkçe çeviri değerlendirmesi: Genel olarak güçlü; `ifade edenı`, `ikna edebilenı`, `Bildigin` açık yazım/çekim hatalarıdır.
- CEFR değerlendirmesi: İçerik büyük ölçüde C1 yönünde; bazı B2 hedeflerin C1 farkı yalnızca görev ve register ile oluşur.
- Production değerlendirmesi: Hedef ve altı kelime şartı var; evidence/synthesis/nuance amaçları şablon düzeyindedir.
- Collocation değerlendirmesi: Güçlü; `critical critique` gereksiz tekrarlı ve doğal tercih `critical analysis/critique` olmalıdır.
- Distractor değerlendirmesi: Çoğunlukla aynı POS, bazıları fazla kolay karşıtlık.
- Yayına açılma şartları: 108 görevin hedefe özgü yeniden yazımı; üç Türkçe hata ve zayıf collocation düzeltmesi; IPA standardı ve insan onayı.

### C2

- Genel karar: **3 BLOCKED, 97 REVISION_REQUIRED**.
- En ciddi sorun: Toplu eski şablon gerçekten kaldırılmıştır; ancak kritik tekil hatalar kalmıştır.
- En iyi çalışan alan: 100 bağımsız uzmanlık örneği, hedefe özgü production, senseId/register ve collocation çeşitliliği.
- En zayıf alan: son native/Türkçe redaksiyon ve doğrulanabilir IPA kaynağı.
- Doğal kullanım değerlendirmesi: Çok büyük ilerleme; yine de `the candidate woven five ...` açık dilbilgisi hatasıdır. Bazı cümleler gereğinden yapay biçimde teknik ve yoğun yazılmıştır.
- Türkçe çeviri değerlendirmesi: Çoğunlukla nüanslı; `subordinate` örneğinde İngilizcede olmayan “ticari hedefler” eklenir. `social cohesion` için `bağlaşıklık` dilbilimsel sense'i çağrıştırır; doğru ana karşılık `toplumsal uyum/kenetlenme`dir.
- CEFR değerlendirmesi: Uzmanlık, kanıt ve register artık belirgindir.
- Production değerlendirmesi: Hedefi aktif kullandırır ve çoğunlukla gerçek uzman kararı ister. Az sayıda görev teknik gerçeklik açısından uzman doğrulaması ister (`automated boreholes monitor...`).
- Collocation değerlendirmesi: Büyük ölçüde doğal; `moderate a response`, `refine a methodology` gibi birkaç seçim son okuma ister.
- Distractor değerlendirmesi: POS biçimi çoğunlukla uyumlu, ancak birçok distractor C2 öğrenen yanılgısından çok bariz karşıt/ilgisiz seçenektir.
- Yayına açılma şartları: üç P0 düzeltilmeli; 97 öğe için IPA/dialect ve uzman alan doğrulaması, distractor sertleştirmesi ve accountable human review tamamlanmalı.

## 3. Item bazlı hata raporu

| itemId | Seviye | Kelime | Karar | Öncelik | Alan | Problem | Önerilen düzeltme |
|---|---|---|---|---|---|---|---|
| `a1-mm-*`, `a1-core-*` (320) | A1 | tüm çekirdek hedefler | REVISION_REQUIRED | P1 | collocation/distractor | `exampleCollocation()` kürasyon haritasından önce çalışıyor; cümle parçaları eşdizim diye kaydediliyor | `A1_COLLOCATIONS[word]` öncelikli olmalı; 320 değer insan editörce doğrulanmalı |
| `a1-phrase-*` (45) | A1 | tüm phrase hedefler | REVISION_REQUIRED | P1 | production/IPA | Tek prompt şablonu ve doğrulanmamış IPA standardı | Phrase'e özgü mini-senaryo ve kaynaklı IPA |
| `a2-mm-*`, `a2-core-*` (254) | A2 | tüm çekirdek hedefler | REVISION_REQUIRED | P1 | collocation/distractor | Mekanik komşu-sözcük eşdizimi ve algoritmik distractor | 254 hedefe özgü collocation ve learner-confusion distractor |
| `a2-phrase-*` (50) | A2 | phrase seti | REVISION_REQUIRED | P1 | IPA/production | İnsan IPA kanıtı yok; en az bir bozuk prompt var | IPA kaynağı ekle; her prompt'u native son okumadan geçir |
| Aşağıdaki 56 B1 kimliği | B1 | çeşitli | BLOCKED | P0 | production | `Explain how to {noun/adjective phrase}` dilbilgisel olarak bozuk | İletişim amacına göre bağımsız prompt yaz |
| Kalan 64 `b1-core-*` | B1 | çeşitli | REVISION_REQUIRED | P1 | production | Hedef zorunlu fakat dört alan şablonu tekrar ediyor | Hedef/collocation'a özgü deneyim, görüş veya karar görevi |
| Tüm `b2-core-*` (108) | B2 | tüm hedefler | REVISION_REQUIRED | P1 | production | Tek şablon, collocation'ı doğal görev nesnesine dönüştürmüyor | 108 doğal, gerekçeli, register-duyarlı görev |
| Tüm `c1-*` (108) | C1 | tüm hedefler | REVISION_REQUIRED | P1 | production/IPA | Üç topic şablonu; IPA doğrulama kaynağı yok | Özgün kanıt/sentez/nüans görevi ve kaynaklı IPA |
| `c1-assertive-47` | C1 | assertive | REVISION_REQUIRED | P1 | Türkçe | `ifade edenı` | `ifade edeni` |
| `c1-persuasive-66` | C1 | persuasive | REVISION_REQUIRED | P1 | Türkçe | `ikna edebilenı` | `ikna edebileni` |
| `c1-idiom-57` | C1 | idiom | REVISION_REQUIRED | P1 | production/Türkçe | `Bildigin` | `Bildiğin` |
| `c1-critique-73` | C1 | critique | REVISION_REQUIRED | P1 | collocation | `critical critique` gereksiz tekrar | `incisive critique` veya `critical analysis` |
| `c2-precise-18` | C2 | subordinate | BLOCKED | P0 | translation/sense | İngilizce `a goal`; Türkçe “ticari hedefler” ekliyor | İngilizceye `commercial goals` ekle veya Türkçeden “ticari”yi çıkar |
| `c2-precise-26` | C2 | coherent | BLOCKED | P0 | English grammar | `the candidate woven five ...` | `the candidate wove five ...` veya `had woven ...` |
| `c2-precise-45` | C2 | cohesion | BLOCKED | P0 | Turkish sense | `social cohesion` için ana karşılık `bağlaşıklık` verilmiş | `toplumsal uyum; toplumsal kenetlenme` |
| Kalan 97 `c2-*` | C2 | çeşitli | REVISION_REQUIRED | P1 | IPA/distractor/final edit | Uzman/dialect kaynağı ve insan son okuması yok; distractorlar yer yer aşırı kolay | Yetkili sözlük/alan uzmanı doğrulaması ve gerçek C2 confusion seti |

### B1 P0 kimlikleri — eksiksiz liste (56)

`b1-core-workload-7`, `b1-core-stakeholder-8`, `b1-core-minutes-10`, `b1-core-priority-15`, `b1-core-efficient-16`, `b1-core-flexible-17`, `b1-core-reliable-18`, `b1-core-outcome-25`, `b1-core-training-28`, `b1-core-workplace-30`, `b1-core-scenery-33`, `b1-core-landmark-34`, `b1-core-remote-35`, `b1-core-crowded-36`, `b1-core-delay-37`, `b1-core-insurance-40`, `b1-core-departure-42`, `b1-core-arrival-43`, `b1-core-destination-45`, `b1-core-memorable-48`, `b1-core-authentic-49`, `b1-core-heritage-50`, `b1-core-custom-51`, `b1-core-guidebook-56`, `b1-core-journey-57`, `b1-core-adventure-58`, `b1-core-hospitality-60`, `b1-core-broadcast-62`, `b1-core-source-63`, `b1-core-accurate-64`, `b1-core-biased-65`, `b1-core-audience-68`, `b1-core-trend-70`, `b1-core-access-73`, `b1-core-community-75`, `b1-core-inequality-76`, `b1-core-opportunity-77`, `b1-core-volunteer-79`, `b1-core-protest-81`, `b1-core-regulation-82`, `b1-core-public-83`, `b1-core-debate-84`, `b1-core-responsible-89`, `b1-core-diverse-90`, `b1-core-option-96`, `b1-core-consequence-97`, `b1-core-advantage-98`, `b1-core-drawback-99`, `b1-core-opportunity-101`, `b1-core-strategy-102`, `b1-core-practical-111`, `b1-core-realistic-112`, `b1-core-ambitious-113`, `b1-core-independent-114`, `b1-core-alternative-118`, `b1-core-outcome-119`.

## 4. Seviye bazlı istatistik

“IPA doğruluğu” bağımsız kaynakla doğrulanmış oranı gösterir; 0%, dizgelerin kesinlikle yanlış olduğu anlamına gelmez. “Production” hücrelerinde ilk oran hedefin açıkça zorunlu olmasını, ikinci oran yayın standardında doğal/uygulanabilir görevi gösterir.

| Seviye | Doğal İngilizce örnek | Doğru Türkçe çeviri | IPA doğruluk | Doğru sense | Doğal collocation | Production | Distractor uygunluğu | CEFR uyumu | Register uyumu | Şablon/yapay içerik |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 98% | 99% | 0% doğrulanmış | 99% | 12% doğrulanmış | 100% hedef / 10% özgün | 20% doğrulanmış | 98% | 100% | 88% metadata/prompt |
| A2 | 99% | 99% | 0% doğrulanmış | 98% | 16% doğrulanmış | 100% hedef / 35% özgün | 30% doğrulanmış | 90% | 100% | 84% collocation; 85% prompt ailesi |
| B1 | 98% | 98% | 0% doğrulanmış | 100% kimlik / 98% pedagojik ayrım | 96% | 100% hedef / 53% dilbilgisel | 90% | 90% | 95% | 100% production ailesi |
| B2 | 98% | 98% | 0% doğrulanmış | 99% | 96% | 100% hedef / 0% son-onaylı | 88% | 88% | 100% | 100% production ailesi |
| C1 | 97% | 96% | 0% doğrulanmış | 99% | 95% | 100% hedef / 0% son-onaylı | 88% | 92% | 95% | 100% production ailesi |
| C2 | 99% | 97% | 0% doğrulanmış | 99% | 97% | 100% hedef / 97% içerikçe uygulanabilir | 85% | 100% | 95% | 0% eski şablon; tekil hatalar var |

## 5. En kritik 50 düzeltme

İlk 47 kayıt B1 production P0'larıdır; son üçü C2 P0'lardır. B1 için ortak öneri, `Explain how to {collocation}` yerine hedefe özgü doğal görev yazmaktır.

| Sıra | itemId | Sorunlu bölüm | Önerilen düzeltme |
|---:|---|---|---|
| 1 | b1-core-workload-7 | `how to heavy workload` | `Describe a heavy workload and explain how you manage it. Use "workload".` |
| 2 | b1-core-stakeholder-8 | `how to key stakeholder` | `Identify a key stakeholder and explain their interest. Use "stakeholder".` |
| 3 | b1-core-minutes-10 | `how to meeting minutes` | `Summarize one decision for the meeting minutes. Use "minutes".` |
| 4 | b1-core-priority-15 | `how to top priority` | `State your top priority and give a reason. Use "priority".` |
| 5 | b1-core-efficient-16 | `how to efficient process` | `Describe an efficient process. Use "efficient".` |
| 6 | b1-core-flexible-17 | `how to flexible schedule` | `Explain why you need a flexible schedule. Use "flexible".` |
| 7 | b1-core-reliable-18 | `how to reliable supplier` | `Describe what makes a supplier reliable. Use "reliable".` |
| 8 | b1-core-outcome-25 | `how to positive outcome` | `Describe a positive outcome of a team decision. Use "outcome".` |
| 9 | b1-core-training-28 | `how to staff training` | `Explain why staff training is necessary. Use "training".` |
| 10 | b1-core-workplace-30 | `how to respectful workplace` | `Give one rule for a respectful workplace. Use "workplace".` |
| 11 | b1-core-scenery-33 | `how to mountain scenery` | `Describe the mountain scenery from a trip. Use "scenery".` |
| 12 | b1-core-landmark-34 | `how to famous landmark` | `Recommend a famous landmark and explain why. Use "landmark".` |
| 13 | b1-core-remote-35 | `how to remote village` | `Describe a problem you faced in a remote village. Use "remote".` |
| 14 | b1-core-crowded-36 | `how to crowded museum` | `Explain what you did when the museum was crowded. Use "crowded".` |
| 15 | b1-core-delay-37 | `how to train delay` | `Report a train delay to another traveler. Use "delay".` |
| 16 | b1-core-insurance-40 | `how to travel insurance` | `Explain why you bought travel insurance. Use "insurance".` |
| 17 | b1-core-departure-42 | `how to departure time` | `Confirm the departure time. Use "departure".` |
| 18 | b1-core-arrival-43 | `how to on arrival` | `Explain what you did on arrival. Use "arrival".` |
| 19 | b1-core-destination-45 | `how to final destination` | `Describe your final destination. Use "destination".` |
| 20 | b1-core-memorable-48 | `how to memorable experience` | `Describe a memorable travel experience. Use "memorable".` |
| 21 | b1-core-authentic-49 | `how to authentic local food` | `Recommend authentic local food. Use "authentic".` |
| 22 | b1-core-heritage-50 | `how to cultural heritage` | `Explain why cultural heritage should be protected. Use "heritage".` |
| 23 | b1-core-custom-51 | `how to local custom` | `Describe a local custom you observed. Use "custom".` |
| 24 | b1-core-guidebook-56 | `how to travel guidebook` | `Explain how a guidebook helped you. Use "guidebook".` |
| 25 | b1-core-journey-57 | `how to long journey` | `Describe a problem during a long journey. Use "journey".` |
| 26 | b1-core-adventure-58 | `how to outdoor adventure` | `Describe an outdoor adventure. Use "adventure".` |
| 27 | b1-core-hospitality-60 | `how to warm hospitality` | `Describe the warm hospitality you received. Use "hospitality".` |
| 28 | b1-core-broadcast-62 | `how to live broadcast` | `Describe what happened during a live broadcast. Use "broadcast".` |
| 29 | b1-core-source-63 | `how to reliable source` | `Explain why you trust a reliable source. Use "source".` |
| 30 | b1-core-accurate-64 | `how to accurate information` | `Explain how you check that information is accurate. Use "accurate".` |
| 31 | b1-core-biased-65 | `how to biased opinion` | `Identify a biased opinion and explain why. Use "biased".` |
| 32 | b1-core-audience-68 | `how to target audience` | `Describe the target audience for a campaign. Use "audience".` |
| 33 | b1-core-trend-70 | `how to growing trend` | `Describe a growing trend in social media. Use "trend".` |
| 34 | b1-core-access-73 | `how to access to information` | `Explain why access to information matters. Use "access".` |
| 35 | b1-core-community-75 | `how to local community` | `Describe a need in your local community. Use "community".` |
| 36 | b1-core-inequality-76 | `how to social inequality` | `Suggest one way to reduce social inequality. Use "inequality".` |
| 37 | b1-core-opportunity-77 | `how to job opportunity` | `Describe a job opportunity and why it interests you. Use "opportunity".` |
| 38 | b1-core-volunteer-79 | `how to community volunteer` | `Describe a community volunteer's role. Use "volunteer".` |
| 39 | b1-core-protest-81 | `how to peaceful protest` | `Describe the goal of a peaceful protest. Use "protest".` |
| 40 | b1-core-regulation-82 | `how to safety regulation` | `Explain why a safety regulation is needed. Use "regulation".` |
| 41 | b1-core-public-83 | `how to public meeting` | `Describe a question for a public meeting. Use "public".` |
| 42 | b1-core-debate-84 | `how to public debate` | `State one rule for a public debate. Use "debate".` |
| 43 | b1-core-responsible-89 | `how to responsible journalism` | `Explain one rule of responsible journalism. Use "responsible".` |
| 44 | b1-core-diverse-90 | `how to diverse community` | `Explain one benefit of a diverse community. Use "diverse".` |
| 45 | b1-core-option-96 | `how to best option` | `Choose the best option and justify it. Use "option".` |
| 46 | b1-core-consequence-97 | `how to serious consequence` | `Describe a serious consequence of the decision. Use "consequence".` |
| 47 | b1-core-advantage-98 | `how to main advantage` | `Explain the main advantage of your choice. Use "advantage".` |
| 48 | c2-precise-26 | `candidate woven` | `the candidate wove` veya `had woven` |
| 49 | c2-precise-18 | Çeviride olmayan “ticari” sense'i | Kaynak ve çeviriyi aynı önermede hizala |
| 50 | c2-precise-45 | `social cohesion` → `bağlaşıklık` | `toplumsal uyum/kenetlenme` kullan |

## 6. Seviye açma kararı

| Seviye | Karar | Gerekçe |
|---|---|---|
| A1 | CLOSED_CONTENT_REMEDIATION | Çekirdek collocation öncelik hatası ve distractor/production insan kontrolü tamamlanmadı. |
| A2 | CLOSED_CONTENT_REMEDIATION | 254 mekanik collocation ve learner-error kanıtı olmayan distractorlar var. |
| B1 | CLOSED_CRITICAL_ERRORS | 56 production görevi dilbilgisel olarak bozuk. |
| B2 | CLOSED_CONTENT_REMEDIATION | 108 production görevi doğal, öğeye özgü B2 iletişim amacı taşımıyor. |
| C1 | CLOSED_CONTENT_REMEDIATION | Production şablonu, Türkçe hatalar ve IPA doğrulaması açık. |
| C2 | CLOSED_CRITICAL_ERRORS | Üç P0 ve insan/IPA/uzman doğrulaması tamamlanmadı. |

## 7. Son yayın kararı

**NOT_READY_FOR_RELEASE**

Gerekçe: 59 P0 kritik öğe vardır; PASS verilen öğe yoktur; 1.105 öğenin hiçbirinde dört rollü doğrulanabilir insan onayı bulunmamaktadır. Otomatik audit ve test başarısı bu editoryal engelleri kaldırmaz.

AI_REVIEW_STATUS: HUMAN_APPROVAL_PENDING

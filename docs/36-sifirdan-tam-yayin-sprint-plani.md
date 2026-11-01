# LingoRise — Sıfırdan Eksiksiz Yayın Sprint Planı

**Plan tipi:** içerik + pedagojik kalite + ürün + Firestore + release  
**Başlangıç durumu:** Strict human-style editorial raporuna göre 1.105 öğenin 0'ı PASS; 100 C2 öğesi P0 BLOCKED, 1.005 öğe P1 REVISION_REQUIRED.  
**Ana kural:** teknik testin geçmesi editoryal olarak hazır olmak değildir. Gerçek reviewer kanıtı olmadan hiçbir öğe `approved` yapılmaz ve hiçbir seviye canlıya açılmaz.

## 1. Nihai yayın hedefi

Bir seviyenin canlıya açılabilmesi için aşağıdaki koşulların tamamı sağlanır:

1. Seviyedeki bütün öğeler içerik şemasını doldurur.
2. Her öğede doğal İngilizce örnek, doğru Türkçe çeviri, gerçek IPA, doğru sense/POS, CEFR, register, collocation, distractor ve production prompt bulunur.
3. Otomatik audit hatası ve yayın engelleyici uyarı sayısı 0'dır.
4. Her öğe dört editoryal rolden geçer:
   - English usage editor
   - Turkish translation editor
   - CEFR/curriculum expert
   - Final decider
5. Her karar doğrulanabilir kanıt taşır: `reviewId`, `reviewerId`, `reviewedAt`, `rubricVersion`, `decision`.
6. Local bundle ve Firestore aynı `contentVersion` ve aynı içerik hash'ine sahiptir.
7. Checkpoint ve level exam üretim becerisini ölçer.
8. Release checklist, otomatik test sonucu ile editoryal hazır sonucu ayrı gösterir.

## 2. Başlangıç envanteri

| Seviye | Öğe | Mevcut kritik durum | Sprint hedefi |
|---|---:|---|---|
| A1 | 365 | 320 core collocation/distractor/production revizyonu; 45 phrase production revizyonu | Temel günlük iletişim, gerçek chunk ve kısa üretim |
| A2 | 304 | 254 core collocation/distractor/production revizyonu; 50 phrase production revizyonu | Plan, neden-sonuç, hizmet ve problem çözme |
| B1 | 120 | Production hedef kelimeyi zorunlu kılmıyor; 2 sense tekrarı | Hedef-zorunlu bağlamlı üretim |
| B2 | 108 | Gerekçeli production ve register ayrımı eksik | Resmî/profesyonel gerekçeli yanıt |
| C1 | 108 | Kanıt/sentez/register production eksik | Eleştirel ve akademik üretim |
| C2 | 100 | P0: şablon örnek, yapay çeviri, zayıf uzmanlık bağlamı | Tam bağımsız yeniden yazım |
| **Toplam** | **1.105** | İnsan review kanıtı 0/1.105 | İnsan review + yayın |

## 3. Sprint yönetim kuralları

- Her sprint sonunda `npm run typecheck`, `npm test`, `npm run editorial:report` çalışır.
- İçerik değişince kalite raporu yeniden üretilir; eski rapor geçerli sayılmaz.
- Bir item PASS değilse yayınlanmaz.
- Bir seviyede tek bir P0 kalırsa seviye kapalı kalır.
- `status=published` tek başına yayın yetkisi değildir.
- `editorialStatus=approved` yalnızca dört rolün doğrulanabilir kanıtından sonra yazılabilir.
- AI/otomatik üretim, insan reviewer kanıtı yerine kullanılamaz.
- Her sprintte değişen item ID listesi ve önce/sonra hash'i saklanır.
- Reviewer kararları immutable tutulur; sonradan güncelleme yerine yeni review kaydı açılır.

## 4. Sprint planı

### S0 — Baseline, kilitleme ve çalışma sözleşmesi

**Amaç:** Mevcut durumu sabitlemek ve yanlış yayın riskini kapatmak.

**İşler**

- İçerik branch'ini yayın kilidine almak.
- Strict human-style raporunu baseline kabul etmek.
- 1.105 item için immutable başlangıç manifesti oluşturmak.
- `contentVersion`, item ID listesi, içerik hash'i ve alan dağılımını kaydetmek.
- A1–C2 level selector ve Firestore yayın kapısını doğrulamak.
- Release checklist'e “automated tests passed” ve “editorially ready” ayrımını eklemek.

**Çıkış kriterleri**

- Baseline raporu mevcut.
- Yayınlanmamış/insan onaysız içerik canlıya çıkamıyor.
- Local ve Firestore karşılaştırma komutu çalışıyor.
- Değişiklik olmadan tekrar çalıştırılan audit aynı sonucu veriyor.

**Kanıtlar**

- `docs/36-baseline-manifest.json`
- `docs/36-sifirdan-tam-yayin-sprint-plani.md`
- `docs/editorial-level-readiness-report.md`

### S1 — Editoryal veri modeli ve reviewer operasyonu

**Amaç:** İnsan review sürecinin gerçek ve denetlenebilir altyapısını kurmak.

**İşler**

- `EDITORIAL_REVIEWER` rolünün trusted provisioning akışını tamamlamak.
- Reviewer profiline rol, yetki ve atanmış seviye eklemek.
- Review başlatma, kaydetme, revision ve final karar akışını tanımlamak.
- Dört rol için zorunlu rubric alanlarını oluşturmak.
- Her item için review state: `queued`, `in_review`, `revision_required`, `approved`, `blocked`.
- Reviewer aynı item için önceki kararı silememeli; yeni karar eklemeli.
- Review kanıtı olmayan `approved` kayıtları release-time reject edilmeli.

**Rubric zorunluları**

- English naturalness
- Turkish meaning fidelity
- POS/syntax
- IPA
- sense
- CEFR
- register
- collocation
- distractors
- example sentence
- production prompt
- reviewer notes

**Çıkış kriterleri**

- Reviewer olmayan kullanıcı review yazamıyor.
- Atanmadığı seviyeye reviewer karar yazamıyor.
- Final decider yetkisi ayrı kontrol ediliyor.
- Sahte/generic reviewer ID reddediliyor.
- Firestore rules emulator testi geçiyor.

### S2 — İçerik standardı, örnekler ve otomatik kalite kapısı

**Amaç:** Bütün seviyelerin kullanacağı tek item sözleşmesini kesinleştirmek.

**İşler**

- Item şemasında zorunlu ve seviyeye özel alanları kesinleştirmek.
- POS uyumlu örnek cümle kontrolü.
- Example–translation anlam eşleşmesi kontrolü.
- Gerçek IPA ve aksan standardı/provenance alanı.
- Collocation'ın örnek veya production görevinde gerçekten görünmesi.
- Production prompt'ın hedef kelimeyi/phrase'i zorunlu kılması.
- Distractorların aynı POS ve gerçek öğrenen yanılgısı olması.
- Şablon, tekrar, numaralı sahte bağlam ve yapay çeviri auditlerini genişletmek.
- Otomatik audit'in yanlış pozitif/negatif kalibrasyon veri setini oluşturmak.

**Item Definition of Done**

- `exampleSentence` doğal ve target sense'i kullanıyor.
- `exampleTranslation` aynı önermeyi doğal Türkçeyle taşıyor.
- `phonetic` güvenilir kaynağa bağlı.
- `senseId` benzersiz ve gerçek kullanım hedefini temsil ediyor.
- `collocation` doğal bir chunk.
- `productionPrompt` hedef kullanımı zorunlu kılıyor.
- İki distractor aynı POS'ta ve anlamca yakın.
- Otomatik audit 0.
- Dört reviewer kararı tamam.

### S3 — C2 P0 tam yeniden yazım

**Amaç:** C2'yi mevcut şablonlardan tamamen kurtarmak.

**Kapsam:** 100 öğe; 50 Precise Expression, 50 Specialist Discourse.

**Her öğe için yapılacaklar**

- Bağımsız domain bağlamı seçmek.
- Hedef kelimenin gerçek valency ve sözdizimini doğrulamak.
- Collocation'ı cümlede aynen veya doğal çekimiyle kullanmak.
- Native-level İngilizce örnek yazmak.
- Gerçek Türkçe çeviri yazmak; numaralı veya dosya-şablon dili kullanmamak.
- Sense ID'yi gerçek kullanım ayrımına bağlamak.
- Register'ı item bazında doğrulamak.
- Uzmanlık söylemi içeren production görevi yazmak.
- Evidence, karar, nüans veya karşılaştırma kriteri eklemek.
- `foreground` gibi duplicate sense'leri ayırmak veya bir öğeyi kaldırmak.

**Kabul kapısı**

- C2 audit error: 0
- Repeated example: 0
- Repeated translation: 0
- Repeated distractor pair: 0
- Collocation in example: 100/100
- Production prompt: 100/100
- Independent editorial review: 100/100

### S4 — A1 temel üretim ve collocation yeniden yazımı

**Amaç:** A1'i gerçek günlük kullanım öğreten bir başlangıç seviyesi yapmak.

**Kapsam:** 320 core + 45 phrase.

**İşler**

- 320 core öğe için tek tek doğal collocation seçmek.
- Örnek komşuluğundan mekanik collocation çıkarımını kaldırmak.
- POS ve sense uyumlu distractor yazmak.
- A1 dışı destek kelimeleri sadeleştirmek.
- Her production prompt'ı gerçek iletişim amacıyla çeşitlendirmek:
  - tanışma
  - sipariş
  - yol sorma
  - günlük rutin
  - duygu belirtme
  - sağlık ihtiyacı
  - ev ve şehir tanımlama
- Phrase öğelerine phrase'e özgü mini senaryo yazmak.
- A1 üretim rubriği: hedef kullanım + minimum 3 kelime + anlaşılır cümle.

**Kabul kapısı**

- 365/365 collocation editoryal olarak doğrulanmış.
- 365/365 production prompt amaca uygun.
- A1 dışı destek dili kritik değil.
- Distractorların tamamı POS/sense uyumlu.
- Dört rol review tamam.

### S5 — A2 işlevsel üretim ve A1→A2 ilerlemesi

**Amaç:** A2'yi A1 tekrarı olmaktan çıkarıp plan, neden-sonuç ve problem çözme seviyesine taşımak.

**Kapsam:** 254 core + 50 phrase.

**İşler**

- A2–B1 duplicate ve progression matrisi oluşturmak.
- 304 öğede gerçek collocation doğrulamak.
- Production prompt'ları şu işlevlerden biriyle yazmak:
  - plan yapma
  - plan değiştirme
  - neden açıklama
  - basit problem çözme
  - hizmet isteme
  - davet ve yanıt
  - seyahat durumu anlatma
- Minimum 4 kelime ve hedef kelime/phrase zorunluluğu.
- A1 ile aynı anlamı tekrar eden öğeleri kaldırmak veya yeni usage goal vermek.
- Phrase distractorlarını gerçek confusion pair'lerle düzeltmek.

**Kabul kapısı**

- 304/304 production uygulanabilir ve hedef-zorunlu.
- A1→A2 tekrar matrisi temiz.
- A2 CEFR uyumu reviewer tarafından onaylı.
- Dört rol review tamam.

### S6 — B1 bağlamlı üretim ve sense tekrarları

**Amaç:** B1'in üretim görevlerini gerçek hedef kullanımına bağlamak.

**Kapsam:** 120 öğe.

**İşler**

- Her prompt'a `Use "{target}"` veya hedef phrase zorunluluğu eklemek.
- Collocation'ı production görevine bağlamak.
- Minimum çıktı ölçütü eklemek.
- `opportunity` iki kaydı için ayrı usage goal veya bir kaydı kaldırmak.
- `outcome` iki kaydı için ayrı sense/usage goal veya bir kaydı kaldırmak.
- B1 görev türleri: deneyim, seyahat, iş birliği, medya, hedef ve karar.

**Kabul kapısı**

- 120/120 target-enforced production.
- Duplicate sense: 0.
- B1 CEFR review tamam.
- Dört rol review tamam.

### S7 — B2 gerekçeli ve register-duyarlı üretim

**Amaç:** B2'de salt cümle kurmayı değil, gerekçeli iletişimi ölçmek.

**Kapsam:** 108 öğe.

**İşler**

- Her prompt hedef kelimeyi ve mümkünse collocation'ı zorunlu kılsın.
- Öğrenciden gerekçe, karşı görüş veya resmî yanıt istensin.
- `neutral` register'ı item bazında yeniden değerlendirmek.
- Formal/professional/academic ayrımını gerçek bağlama bağlamak.
- Rubric: target used, collocation accurate, reason/evidence, register.

**Kabul kapısı**

- 108/108 hedef-zorunlu production.
- B2 register uyumsuzluğu 0.
- Her görev en az bir iletişim amacı taşıyor.
- Dört rol review tamam.

### S8 — C1 kanıt, sentez ve nüans üretimi

**Amaç:** C1 production görevlerini akademik/profesyonel düşünme becerisine dönüştürmek.

**Kapsam:** 108 öğe.

**İşler**

- Hedef kelimeyi zorunlu kılan prompt yazmak.
- Kanıt, karşılaştırma, sentez veya eleştirel değerlendirme şartı eklemek.
- Academic/professional/neutral register'ı item bazında düzeltmek.
- Türkçe çeviride nüans ve ton kontrolü yapmak.
- Rubric: target, collocation, evidence, nuance/register.

**Kabul kapısı**

- 108/108 target-enforced production.
- C1 register ve CEFR reviewer onayı.
- Kanıt/sentez kriteri olan görevler 108/108.
- Dört rol review tamam.

### S9 — Üretim etkileşimi ve ölçme entegrasyonu

**Amaç:** Production prompt'ı yalnızca metin alanı olmaktan çıkarıp öğrenme ölçümüne bağlamak.

**İşler**

- Practice ekranında serbest yazma veya sentence builder.
- Minimum kelime ve hedef kelime kontrolü.
- Collocation doğruluğu.
- Rubric puanı ve geri bildirim.
- Retry akışı.
- `ProductionAttempt` öğrenme kaydına bağlama.
- Topic checkpoint'e en az bir production görevi ekleme.
- Level exam'e seviyeye uygun production bölümü ekleme:
  - B1: kısa bağlamlı cümle
  - B2: gerekçeli görüş/resmî yanıt
  - C1: kanıt, nüans, register
  - C2: uzmanlık söylemi ve hassas sense ayrımı
- Production sonuçlarını telemetry ve progress merge'e bağlama.

**Kabul kapısı**

- Practice, checkpoint ve exam üretim sonucu kaydediyor.
- Retry puanı değiştirmeden yeni attempt olarak tutuluyor.
- Öğrenme kaydında yanıt, puan, hedef kullanım, collocation ve timestamp var.
- E2E production senaryosu geçiyor.

### S10 — Dört aşamalı insan editoryal review

**Amaç:** İçerik düzeltmelerini gerçek reviewer kararlarıyla kapatmak.

**Sıra**

1. English usage editor.
2. Turkish translation editor.
3. CEFR/curriculum expert.
4. Final decider.

**İşleyiş**

- Review queue seviyeye göre A1 → A2 → B1 → B2 → C1 → C2 işlenir.
- Her reviewer yalnızca atanmış role ve seviyeye karar verir.
- Revision gereken item üretim sprintine geri döner.
- Final decider yalnızca bütün roller PASS ise onaylar.
- Reviewer kanıtı Firestore/local bundle'a yazılır.
- `editorialStatus=approved` yalnızca final karardan sonra oluşur.

**Kabul kapısı**

- 1.105 öğede review kararı mevcut.
- Approved öğelerin tamamında kanıt alanları eşleşiyor.
- Generic/team/AI reviewer ID yok.
- Revision kuyruğu 0.

### S11 — Local bundle, Firestore ve release candidate

**Amaç:** Editoryal olarak onaylanan içeriğin canlı katalogla birebir aynı olduğunu kanıtlamak.

**İşler**

- Local item count ile Firestore item count karşılaştırması.
- Sorted item ID eşitliği.
- Content hash eşitliği.
- `status` ve `editorialStatus` dağılım eşitliği.
- IPA/example/collocation/production kapsaması eşitliği.
- Fark varsa Firestore seed ve release başarısız olmalı.
- Seed yalnızca approved + kanıtlı + audit temiz öğeleri yüklemeli.
- Firestore rules production testi.
- Offline bundle testi.
- Catalogue fallback testi.

**Kabul kapısı**

- Local/Firestore farkı 0.
- Integrity snapshot aynı versiyonu gösteriyor.
- Seed dry-run beklenen öğe sayısını veriyor.
- Release candidate build başarılı.

### S12 — Final release, açılış ve sonrası

**Amaç:** Seviyeleri kontrollü biçimde açmak ve geri dönüş planını hazır tutmak.

**İşler**

- Seviyeleri tek tek açmak; toplu açmamak.
- Önce A1, sonra A2, sonra B1, B2, C1, C2.
- Her seviye açılışında smoke test.
- Level selector, topic checkpoint ve exam kontrolü.
- Production attempt canlı telemetry kontrolü.
- Firestore seed sonrası remote catalogue fetch kontrolü.
- Rollback versiyonunu saklamak.
- İlk 24 saat hata/cevap/production metriği izlemek.
- Editoryal hata çıkarsa ilgili itemi anında quarantine etmek.

**Kabul kapısı**

- Release checklist tamamen imzalı.
- Her seviyenin açılış kanıtı var.
- Rollback prosedürü test edilmiş.
- İnsan editoryal kanıtları archive edilmiş.

## 5. Paralellik ve bağımlılık matrisi

| İş | Bağımlılık | Paralel yapılabilir mi? |
|---|---|---|
| S1 reviewer altyapısı | S0 | S2 ile paralel |
| S2 kalite standardı | S0 | S1 ile paralel |
| S3 C2 rewrite | S2 | Reviewer altyapısı ile paralel authoring |
| S4 A1 | S2 | S3 ile paralel authoring |
| S5 A2 | S2 | S3/S4 ile paralel authoring |
| S6 B1 | S2 | S3–S5 ile paralel authoring |
| S7 B2 | S2 | S3–S6 ile paralel authoring |
| S8 C1 | S2 | S3–S7 ile paralel authoring |
| S9 production UI | S2 | S3–S8 ile paralel |
| S10 final review | S3–S8 ilgili batch tamamlandıktan sonra | Seviyeler batch bazında paralel review edilebilir |
| S11 Firestore release candidate | S10 | Hayır |
| S12 release | S11 | Hayır |

## 6. Her item için teslim formu

Her item teslim edilirken aşağıdaki satırlar bulunmalı:

```text
itemId:
level:
topic:
word:
meaning:
partOfSpeech:
senseId:
exampleSentence:
exampleTranslation:
phonetic:
collocation:
productionPrompt:
wrongOptions:
register:
cefr:
source:
automaticAudit: pass/fail
englishUsageReview: pass/revision_required
turkishTranslationReview: pass/revision_required
cefrReview: pass/revision_required
finalDecision: approved/revision_required/blocked
reviewId:
reviewerId:
reviewedAt:
rubricVersion:
```

## 7. Her seviye için Definition of Done

- Öğelerin tamamı item sözleşmesini dolduruyor.
- P0/P1 hata yok.
- Audit error 0.
- Tekrarlanan template 0.
- Aynı-sense duplicate 0 veya belgeli usage goal farkı var.
- Production görevleri hedef kullanımını zorunlu kılıyor.
- Checkpoint ve exam production ölçüyor.
- Dört editoryal rolün kararı var.
- Local/Firestore integrity farkı 0.
- Level selector yalnızca bu şartlardan sonra açılıyor.

## 8. Release checklist

- [ ] S0 baseline manifest kaydedildi.
- [ ] S1 reviewer rolü ve rules test edildi.
- [ ] S2 kalite audit ve rubric sabitlendi.
- [ ] S3 C2 100/100 yeniden yazıldı ve review edildi.
- [ ] S4 A1 365/365 tamamlandı ve review edildi.
- [ ] S5 A2 304/304 tamamlandı ve review edildi.
- [ ] S6 B1 120/120 tamamlandı ve review edildi.
- [ ] S7 B2 108/108 tamamlandı ve review edildi.
- [ ] S8 C1 108/108 tamamlandı ve review edildi.
- [ ] S9 practice/checkpoint/exam production ölçüyor.
- [ ] S10 review kanıtı 1.105/1.105.
- [ ] S11 local/Firestore hash eşit.
- [ ] S11 seed dry-run temiz.
- [ ] S11 typecheck/test/rules/E2E başarılı.
- [ ] S12 rollback versiyonu saklandı.
- [ ] S12 seviyeler kontrollü açıldı.

## 9. Şu an yapılacak ilk adım

İlk uygulanacak iş S0'dır: mevcut içerik ve release durumunu baseline olarak sabitlemek. S0 tamamlanmadan C2 veya başka bir seviyeyi `approved`/canlı kabul etmek yasaktır. S0'dan sonra içerik authoring S3–S8 paralel yürütülebilir; ancak her batch tamamlanmadan S10 review kuyruğuna alınmaz.

**Nihai release sonucu ancak şu şekilde verilebilir:**

```text
AUTOMATED_TESTS: PASS/FAIL
EDITORIAL_READINESS: READY/NOT_READY
HUMAN_REVIEW_EVIDENCE: x/1105
LOCAL_FIRESTORE_INTEGRITY: PASS/FAIL
RELEASE_DECISION: OPEN/CLOSED
```

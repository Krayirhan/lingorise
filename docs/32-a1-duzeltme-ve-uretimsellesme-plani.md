# LingoRise — A1 Düzeltme ve Üretimselleşme Planı

Tarih: 11 Eylül 2026  
Başlangıç puanı: **79/100**  
Hedef: **ilk editoryal yayın sonunda en az 88/100**

## 1. Amaç ve sınır

A1'in sorunu kelime sayısı değildir. Uygulamada 320 erişilebilir soru, sekiz konu, konu sırası, dersler ve checkpoint akışı vardır. Sorun; öğrencinin kelimeyi görüp Türkçe karşılığını işaretlemesinden sonra onu **duyabilmesi, doğru kalıpla kurabilmesi ve yakın anlamlardan ayırabilmesi** için gereken içeriğin eksik olmasıdır.

Bu plan mevcut kelimeleri topluca silmez. Önce içerik envanterini sabitler, sonra her satırı editoryal şemaya taşır; gerekli yerlerde kelimeyi ayrı anlamlara böler ve eksik kalıp öğelerini ekler. A1 yayınlanmaya devam eder; fakat yalnızca audit'i geçen batch'ler `approved` olur. `isLevelReady` erişilebilirliği, `editorialStatus` ise insan editoryal onayını gösterir; ikisi birbirinin yerine kullanılmaz.

## 2. Başlangıç envanteri

| Alan | Mevcut durum | Öğrenme riski | Hedef durum |
|---|---:|---|---:|
| Toplam öğe | 320 | Sayı yeterli görünür, üretim yetersiz kalır | 345–360: çekirdek kelimeler + 40–50 gerçek kalıp |
| Konu | 8 | Kaynakta ilk özel satırların serbest topic kalıntısı var | Sekiz canonical `topicId`, istisna 0 |
| IPA | 7/320 | Öğrenci yazılışı Türkçe sesletir | 320/320 |
| Gerçek çok sözcüklü hedef | 0 | `have breakfast`, `go home` gibi doğal üretim oluşmaz | En az 45 |
| Sense kimliği | Yok | `home/house`, `work/job`, `open` gibi ayrımlar belirsiz | Her satırda `senseId` |
| Bağlam | Tekil örnekler, şablon sorunu yok | Örnek var ama kalıp/amaç bağı zayıf | Her satırda hedef anlamı gösteren kısa doğal örnek |
| Distractor gerekçesi | Teknik olarak geçerli | Öğrenci seçenek türünden eleme yapabilir | Aynı türde, gerçek hata çiftlerinden iki seçenek |
| Editoryal kayıt | Eski katalog için `needs_review` | İnsan kontrolü görünmez | Batch bazında kaynak, editör, tarih ve `approved` |

## 3. A1'in öğrenme tasarımı

A1 rotası sekiz konu olarak kalacak, ancak her konudaki öğrenme sırası aynı olacak:

1. **Tanıma:** Somut ana kelime, sesletim ve tek cümlelik anlam.
2. **Bağlam:** Kelimenin bulunduğu kısa, doğal cümle.
3. **Kalıp:** Kelimeyle birlikte kullanılan temel fiil, edat veya sıfat.
4. **Ayırma:** Yakın iki kelime arasında gerçek bir ayrım.
5. **Kullanma:** Çok kısa boşluk doldurma ya da bağlam seçimi.
6. **Geri çağırma:** Konu checkpoint'i, önceki konudan az sayıda tekrar içerir.

Bu sıralama Home → konu → ders → checkpoint → seviye sınavındaki mevcut akışı değiştirmez. İçeriğin neyi ölçtüğünü değiştirir: yalnızca `English word → Turkish meaning` yerine ses, bağlam ve kullanım kanıtı ekler.

## 4. Konu bazlı içerik düzeltme haritası

| Sıra | Konu | Korunacak çekirdek | Eklenecek kalıp/işlev | Özellikle ayrıştırılacak anlamlar |
|---:|---|---|---|---|
| 1 | İnsanlar ve Kimlik | kişi, aile, meslek, zamirler | `my name is`, `I am`, `This is my…`, `nice to meet you` | `person/people`, `man/boy`, `woman/girl`, `family/parent` |
| 2 | Günlük Rutinler | gün, saat, okul, çalışma, öğünler | `get up`, `go to school`, `have breakfast`, `at night`, `every day` | `work/job`, `lesson/class`, `morning/evening/night` |
| 3 | Ev ve Şehir | ev, oda, yerler, ulaşım | `go home`, `live in`, `next to`, `in front of`, `turn left/right` | `home/house`, `road/street`, `town/city`, `near/far` |
| 4 | Yemek ve Alışveriş | yiyecek, içecek, kaplar, ihtiyaç | `I'd like…`, `have a coffee`, `a bottle of`, `How much is…?`, `pay for` | `hungry/thirsty`, `hot/warm`, `shop/store`, `some/any` |
| 5 | Temel Eylemler | yüksek frekanslı eylemler | `want to`, `need to`, `can/can't`, `like + -ing`, `go by` | `make/do`, `look/see/watch`, `listen/hear`, `bring/take` |
| 6 | Tanımlamalar | renk, boyut, temel nitelikler | `very + adjective`, `a little`, `look + adjective`, `What is … like?` | `good/nice`, `big/large`, `old/young`, `beautiful/pretty` |
| 7 | Doğa ve Hava | hava, hayvan, doğa | `It's sunny`, `It's raining`, `go for a walk`, `in the park` | `weather/whether` öğretilmez; `rain` isim/fiil ayrı sense olur |
| 8 | Sağlık ve Duygular | vücut, temel durum, hisler | `I feel…`, `have a headache`, `I'm tired`, `Are you okay?` | `ill/sick`, `hurt/ache`, `happy/excited`, `afraid/scared` |

Kalıplar yeni “süs” satırları değildir. Her biri `learningItemKind: "phrase"` olacak, kendi IPA'sını, örneğini ve seçeneklerini taşıyacak. Bir kelimenin örnek cümlesinde kalıp geçmesi o kalıbın ayrıca öğrenildiği anlamına gelmez.

## 5. Satır düzeyi zorunlu şema

Her A1 öğesi `createEditorialQuestion` üzerinden ya da aynı doğrulama alanlarını sağlayarak hazırlanır:

```ts
{
  id: "a1-daily-routines-have-breakfast",
  level: "A1", cefr: "A1",
  topicId: "a1.daily_routines",
  unitId: "a1.daily_routines.u01",
  lessonId: "a1.daily_routines.l01",
  senseId: "have-breakfast.fixed-phrase",
  learningItemKind: "phrase",
  register: "neutral",
  word: "have breakfast",
  meaning: "kahvaltı yapmak",
  pronunciation: "have breakfast",
  ipa: "/hæv ˈbrekfəst/",
  exampleSentence: "I have breakfast at seven.",
  exampleTranslation: "Saat yedide kahvaltı yaparım.",
  wrongOptions: ["kahvaltı hazırlamak", "kahvaltıyı atlamak"],
  contextNote: "Günlük rutinlerde öğünler için have kullanılır.",
  hint: "Sabah öğününü yapmak için kullanılan kalıbı seç.",
  source: "A1 editorial batch 02",
  reviewer: "atanmış editör",
  reviewedAt: "2026-09-11"
}
```

### Zorunlu editoryal kararlar

- Türkçe anlam tek ve hedef kullanımı göstermeli; sözlükteki bütün anlamlar tek hücreye yığılmamalı.
- Çok anlamlı kelime iki farklı A1 anlamıyla öğretilecekse iki `senseId`, iki örnek ve iki farklı hedef gerekir. Örnek: `rain.n.weather` ve `rain.v.weather`.
- Örnek en fazla 8–10 kelime olmalı; hedef sözcük cümlede gerçekten kullanılmalı ve A1 dışı açıklama kelimeleriyle taşınmamalı.
- Yanlış seçenekler doğru cevaptan farklı olmalı, aynı sözcük türünde olmalı ve “rastgele konu havuzu”ndan gelmemeli.
- IPA İngilizce telaffuzu göstermeli. Türkçe okunuş yazımı IPA'nın yerine geçmez.
- `approved`, yalnızca editör adı, tarih, kaynak ve otomatik kalite raporu hatasızsa atanır.

## 6. İçerik dönüştürme fazları

### Faz A — Envanter ve karar tablosu (1 gün)

Her 320 satır için tek bir çalışma tablosu çıkarılır: mevcut id, kelime, Türkçe anlam, konu, tür, örnek, IPA, hedef sense, karar (`koru`, `yeniden yaz`, `birleştir`, `iki sense'e böl`, `kaldır`) ve gerekçe. Bu tablo içerik değişikliğinin izini tutar.

**Çıkış kriteri:** 320 satırın tamamında karar vardır; serbest topic etiketi kalmaz; `home/house`, `work/job`, `open`, `rain`, `left/right` gibi belirsiz çiftler ayrıca işaretlenir.

### Faz B — Sesletim ve metadata tamamlama (1 gün)

320 mevcut satır için IPA, CEFR, item kind, register, sense id, kaynak ve gözden geçirme alanı tamamlanır. Telaffuz spot kontrolü, özellikle Türkçe konuşanların hata yaptığı `th`, kısa/uzun ünlü, sessiz harf ve vurgu içeren kelimelerde yapılır.

**Çıkış kriteri:** IPA 320/320; required metadata eksik satır 0; audit'te metadata kaynaklı hata 0.

### Faz C — Kelime ve anlam temizliği (1 gün)

Yinelenen Türkçe karşılıklar anlam düzeyinde ayrıştırılır. A1 dışı ya da işlevsiz satırlar belirlenir; boşalan kapasite gerçek A1 fiili, edatı veya kalıbıyla doldurulur. Bu aşama kelime sayısının yapay olarak artmasını engeller.

**Çıkış kriteri:** Her öğenin `senseId` değeri benzersizdir; iki öğe aynı Türkçe anlamı taşıyorsa bağlam notu farkı açıklar; A2 ile tekrar eden üç kelime için spiral karar kaydı vardır (`neighbor`, `question`, `soil`).

### Faz D — 45 kalıp batch'i (2 gün)

Sekiz konuya dağıtılmış 45 kalıp eklenir. Öncelik günlük rutin, yön tarif etme, yiyecek siparişi, temel eylem, duygu/sağlık akışındadır. Her kalıp tek sözcüklü soru ile karıştırılmaz ve kendi audio/IPA bilgisini alır.

Önerilen dağılım: Kimlik 5, rutin 7, ev/şehir 7, yemek/alışveriş 7, temel eylemler 8, tanımlama 4, doğa/hava 3, sağlık/duygular 4.

**Çıkış kriteri:** Gerçek multiword target >=45; her konuda en az üç kalıp; hiçbiri yalnızca örnek cümlede gizli değildir.

### Faz E — Örnek ve distractor yeniden yazımı (2 gün)

320 mevcut satırın örnekleri hedef sense, kısa uzunluk, doğal söz dizimi ve konu amacı açısından tekrar denetlenir. Yapay, fazla uzun veya hedef anlamı göstermeyen örnekler değiştirilir. Her öğenin iki yanlış seçeneği aynı türden gerçek öğrenen karışıklığıyla hazırlanır.

Örnek dönüşümler:

| Zayıf odak | Yeni odak |
|---|---|
| `breakfast` yalnızca “kahvaltı” | `have breakfast` kalıbı, “I have breakfast at seven.” |
| `home` ve `house` ikisi de “ev” | `go home` ve `a house with a garden` ile işlev ayrımı |
| `rain` tek satır | `rain.n.weather`: “The rain is cold.”; `rain.v.weather`: “It rains in winter.” |
| `open` yalnızca “açık” | Sıfat anlamı A1'de `The shop is open.`; fiil anlamı gerekirse ayrı sense |

**Çıkış kriteri:** Template tespiti 0; target-in-example hatası 0; her distractor doğru yanıttan ve birbirinden farklı; her örnek A1 okunabilirlik kontrolünü geçer.

### Faz F — Ölçme akışı ve cihaz doğrulaması (1–2 gün)

Meaning-match korunur, fakat konu checkpoint'ine en az dört bağlam seçimi ve iki kalıp tamamlama eklenir. Seviye sınavı sekiz konudan kota almaya devam eder; soru dağılımı kelime/kalıp/bağlam olarak raporlanır. S23 FE üzerinde A1 sıfır ilerleme, yarım ünite, checkpoint, tekrar ve seviye sınavı yolları çalıştırılır.

**Çıkış kriteri:** Uygulamada A1 erişimi bozulmaz; yeni phrase satırları görünür; checkpoint ve sınav sekiz konuyu kapsar; cihaz smoke senaryoları geçer.

## 7. Batch sırası

| Batch | Kapsam | Öğrenci sonucu | Yayın kapısı |
|---|---|---|---|
| A1-01 | İnsanlar/Kimlik + Günlük Rutinler | Kendini tanıtma ve günlük rutin anlatma | 80 mevcut/yenilenmiş satır + 12 kalıp |
| A1-02 | Ev/Şehir + Yemek/Alışveriş | Yer sorma, tarif alma, sipariş verme | 80 satır + 14 kalıp |
| A1-03 | Temel Eylemler + Tanımlamalar | Basit tercih, ihtiyaç ve tarif | 80 satır + 12 kalıp |
| A1-04 | Doğa/Hava + Sağlık/Duygular | Hava, durum ve temel his anlatma | 80 satır + 7 kalıp |
| A1-05 | Tüm seviye ölçme ve spiral tekrar | Öğrenileni geri çağırma | Checkpoint/sınav dağılımı + cihaz doğrulaması |

Bir batch bitmiş sayılmaz; yalnızca soru dosyası derlenince değil, audit hatası sıfır olduğunda, editoryal kayıtlar girildiğinde ve cihazda test edildiğinde biter.

## 8. Kabul metriği ve puan hedefi

| Boyut | Başlangıç | İlk yayın hedefi | Nasıl doğrulanır |
|---|---:|---:|---|
| Anlam doğruluğu | 21/25 | 24/25 | Sense tablosu + çeviri review |
| Bağlam | 21/25 | 23/25 | Örnek audit + template 0 |
| Distractor/ölçme | 12/15 | 14/15 | Tür uyumu, karıştırılabilirlik kaydı |
| CEFR/spiral | 12/15 | 13/15 | A1–A2 tekrar matrisi |
| Telaffuz/metadata | 4/10 | 9/10 | IPA 100%, metadata 100% |
| Kalıp çeşitliliği | 9/10 | 10/10 | >=45 phrase/collocation |
| **Toplam** | **79/100** | **93/100 teorik üst sınır; 88+ yayın eşiği** | Tüm kalite kapıları |

93, planın bütün editoryal kabul koşulları sağlanırsa erişilebilecek teorik puandır. İlk yayın için daha gerçekçi ve zorunlu eşik 88'dir; kullanıcı verisiyle test edilmemiş bir içerik 95+ diye sunulmayacaktır.

## 9. Riskler ve kararlar

- **“320 kelimeyi bozmayalım” riski:** Her satırı korumak kalite hedefi değildir. İşlevsiz ya da aynı anlamı tekrar eden satır, doğal bir kalıp için yer açmak üzere çıkarılabilir.
- **IPA doğruluğu:** Otomatik dönüştürüm kullanılacaksa editör spot kontrolü zorunludur. IPA üretildi diye sesletim onaylanmış kabul edilmez.
- **A1 cümlelerini zorlaştırma:** Örnek cümlede hedef kelime dışındaki kelimeler A1 çekirdeğinden seçilir. Yeni cümle, yeni gizli ders yaratmaz.
- **Yanlış onay görünümü:** Eski satırlara topluca `approved` yazılmaz. Onay, batch audit'i ve insan review kaydıyla satır bazında verilir.

## 10. Bitmiş tanımı

A1 düzeltmesi şu koşullar birlikte sağlanınca tamamlanmış kabul edilir:

1. Her mevcut veya yeni satırda A1 CEFR, `senseId`, tür, register, IPA, doğal örnek, çeviri, hint, kaynak, reviewer ve tarih vardır.
2. Sekiz canonical konu ve sıra korunur; kaynakta legacy topic kalıntısı yoktur.
3. En az 45 gerçek kalıp vardır ve her biri ayrı öğrenme öğesidir.
4. Otomatik editoryal audit: hata 0, tekrar eden örnek şablonu 0, target örnekte eksik 0, metadata eksiği 0.
5. A1 checkpoint ve seviye sınavı kelime tanımanın yanında bağlam ve kalıp kullanımını ölçer.
6. Typecheck, test paketi ve S23 FE A1 cihaz smoke senaryosu geçer.
7. Hedef puan 88 veya üzeridir; puan, içerik değişikliğinden sonra aynı rubrikle tekrar hesaplanır.

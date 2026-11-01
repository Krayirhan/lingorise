# LingoRise — Kelime Kalitesi: Acımasız Editoryal Denetim

Tarih: 11 Eylül 2026  
Kapsam: Çalışma zamanındaki `allQuestions` kataloğundaki A1–C2 düzeylerinde bulunan 1.010 öğe.  
Satır bazlı sonuç: [29-kelime-bazli-denetim.csv](29-kelime-bazli-denetim.csv)

## Hüküm

Katalog teknik olarak çalışır; öğretim malzemesi olarak eşit kalitede değildir. A1 ve A2, geliştirilerek kullanılabilecek bir çekirdektir. B1–C2 ise kelime listesi olarak başlangıç niteliğinde, fakat üst seviye öğretim ürünü olarak yayın standardının altındadır. Bu seviyelerdeki sayı eşiğini geçmek, kelimelerin CEFR için yeterli biçimde öğretildiğini göstermiyor.

Güncel editoryal puan: **59 / 100**.

Bu puan sözlükte kelimenin var olup olmadığını değil, öğrencinin kelimeyi doğru anlam, doğru bağlam, doğru seviye ve yeterli ayırt etme ile öğrenip öğrenemeyeceğini değerlendirir.

| Seviye | Öğeler | Acımasız puan | Yayın kararı | Ana neden |
|---|---:|---:|---|---|
| A1 | 320 | **79 / 100** | Revizyonla yayınlanabilir | Çoğu örnek cümle özgün; IPA çok eksik, kalıp/collocation kapsamı yok denecek kadar az. |
| A2 | 254 | **72 / 100** | Revizyonla yayınlanabilir | Temel set işlevsel fakat B1 ile çok sayıda gereksiz tekrar, IPA eksikliği ve sınırlı phrase kapsamı var. |
| B1 | 120 | **44 / 100** | Yayınlama uygun değil | Dört konu var ama 120/120 öğe şablon bağlam ve otomatik distractor kullanıyor. Aynı seviyede 3 kelime yineleniyor. |
| B2 | 108 | **39 / 100** | Yayınlama uygun değil | Soyut/argümantasyon kelimeleri iyi yönde; bağlam öğretmiyor, tek sözcük ağırlığı çok yüksek, bütün distractorlar otomatik. |
| C1 | 108 | **32 / 100** | Yayınlama uygun değil | Her kelime aynı “report uses …” cümlesine zorlanmış. C1'in register, collocation ve argüman üretimi karşılanmıyor. |
| C2 | 100 | **29 / 100** | Yayınlama uygun değil | En yüksek risk. Tek sunum şablonu ve C2 için çok sığ phrase/üslup kapsamı var; kritik çeviri düzeltildi. |

`Yayınlama` kararı, mevcut haliyle öğrenciye üst seviye öğretim vaadi verilmemesi gerektiğini ifade eder; kod tarafında seviyeyi kapatmak değil, editoryal revizyon bitene dek "beta içerik" olarak açıkça etiketlemek daha doğru olur.

## Puanlama yöntemi

Her satır CSV'de 0–100 otomatik risk puanı alır. Bu skor insan editör kararının yerine geçmez; denetim sırasını belirler.

- 5 puan: IPA/phonetic alanı eksik.
- 12 puan: aynı seviyede aynı İngilizce öğe yinelenmiş.
- 5 puan: aynı seviyede aynı Türkçe anlam tekrar edilmiş.
- 8 puan: başka CEFR seviyesinde de aynı öğe bulunuyor. Tekrar bilinçli bir spiral ise içerik notuyla korunabilir; şu an gerekçe yok.
- 25 puan: B1–C2'de şablon bağlam ve otomatik yanlış seçenek üretimi.
- 20 puan: anlamı yanlış ya da kullanımını tehlikeli derecede daraltan manuel örnek.

Bu mekanik puan tek başına “kelime doğru” anlamına gelmez. Her satırın gerçek editoryal onayı için anlam, doğal örnek, register, collocation, distractor ve CEFR gerekçesi insan tarafından onaylanmalıdır.

## Ölçülebilir bulgular

| Kontrol | A1 | A2 | B1 | B2 | C1 | C2 |
|---|---:|---:|---:|---:|---:|---:|
| Toplam öğe | 320 | 254 | 120 | 108 | 108 | 100 |
| IPA bulunan öğe | 7 | 5 | 0 | 0 | 0 | 0 |
| Çok sözcüklü kalıp | 0 | 5 | 0 | 0 | 0 | 1 |
| Seviye içi yinelenen İngilizce kelime | 0 | 0 | 3 | 0 | 1 | 2 |
| Şablon bağlam / otomatik distractor | 0 | 0 | 120 | 108 | 108 | 100 |

Seviyeler arası tekrar ayrıca yüksektir. A2→B1'de seyahat ve iş kelimelerinin önemli kısmı aynen tekrar ediyor: `journey`, `deadline`, `reservation`, `destination`, `departure`, `arrival`, `delay`, `itinerary`, `accommodation`, `budget`, `refund` ve diğerleri. B2→C1/C2 hattında `framework`, `evidence`, `ethical`, `consensus`, `objective`, `methodology`, `criterion`, `nuance`, `rhetoric` gibi ileri öğeler tekrar edilmiş. Spiral tekrar olabilir, fakat bu katalogda tekrarın amacı, yeni anlamı veya yeni collocation hedefi tanımlanmıyor.

## En ağır içerik kusurları

### B1–C2 bağlam kalitesi

- **B1:** Her konu tek bir cümle iskeletine zorlanıyor. `During the project meeting, we discussed collaborate.` dilbilgisel/doğal değildir. Fiil, isim ve sıfat aynı slotta kullanılamaz.
- **B2:** `The lecture examined {word} in detail.` veya `The professional message addressed {word} clearly.` bütün kelime türleri için doğal değildir. Türkçe karşılık da "… ifadesi profesyonel ve akademik B2 bağlamında kullanılır" türünde bilgi vermeyen genel cümledir.
- **C1:** 108 öğenin hepsi `The report uses {word} in its central analysis.` yapısına bağlanır. Bu, örneğin `subtle`, `irony`, `empathy` ve `scrutinize` için öğretici cümle değildir.
- **C2:** 100 öğenin hepsi uzman sunumu şablonuna bağlanır. C2'de gerekecek retorik, yazılı akademik dil, müzakere, edebî nüans ve alanlar arası register farkı görünmez.

### Kritik veya çok dar çeviriler

| Kelime | Şimdiki anlam | Karar | Düzeltme yönü |
|---|---|---|---|
| `extrapolate` (C2) | dışa vurmak | **Yanlış** | “eldeki veriden çıkarım yapmak / öngörüde bulunmak”; `express` ile karıştırılmış. |
| `remote` (B1) | ıssız | Fazla dar | “uzak, uzak konumda”; bağlama göre ıssız ayrı anlam olarak verilmeli. |
| `derive` (C1) | türetmek | Fazla dar | “türetmek” yanında “sonuç çıkarmak” kullanımı ayrı örneklenmeli. |
| `inquiry` (B2) | sorgu | Fazla dar | Profesyonel iletişimde “soru / bilgi talebi / başvuru” kullanımı gösterilmeli. |
| `provision` (C2) | tedarik | Çok anlamlı | “tedarik”, “sağlama”, sözleşmede “hüküm” anlamları ayrılmalı. |
| `moderate` (C2) | ılımlılaştırmak | Register riski | Fiil/sıfat kullanımı ayrı verilmeli; “azaltmak, yönetmek, ılımlı olmak” bağlama göre ayrıştırılmalı. |

Bu liste tüm hataların değil, doğrudan öğrenciyi yanlış yola sokabilecek yüksek öncelikli örneklerin listesidir. Tam satır listesi CSV'dedir.

## Seviye bazında ne tutulur, ne atılır

### A1 — 79/100

Tutulacak: temel kelime kapsamı, özgün örnek cümlelerin büyük bölümü, sözcük türü dağılımı.  
Düzeltilecek: 313 öğede IPA yok; yalnızca tek sözcük öğretimi var; aynı Türkçe anlama bağlanan öğeler ayrıştırılmalı; A1'de temel chunks (`have breakfast`, `go home`, `in front of`) eklenmeli.

### A2 — 72/100

Tutulacak: seyahat, iş, hizmet ve sosyal yaşam için yararlı çekirdek.  
Düzeltilecek: B1'e taşınması gereken tekrarlar ayıklanmalı veya yeni kullanım amacıyla spiral paket yapılmalı. Phrase sayısı 5'te kalmamalı. IPA ve telaffuz materyali tamamlanmalı.

### B1 — 43/100

Tutulacak: konu seçimi (`iş`, `seyahat`, `medya`, `karar`) doğru yön.  
Yeniden yazılacak: 120 örnek, 240 distractor, tüm hint/context note. `outcome`, `volunteer`, `opportunity` seviye içindeki tekrarlardan biri kaldırılmalı veya başka anlam/part of speech olarak açıkça ayrılmalı.

### B2 — 38/100

Tutulacak: argümantasyon ve profesyonel iletişim çekirdeği.  
Yeniden yazılacak: her öğeye doğal cümle ve gerçek seçenekler; aynı kelimelerin C1'e geçiş gerekçesi; akademik fiiller için collocation (`draw a conclusion`, `support a claim`, `raise an objection`) setleri.

### C1 — 31/100

Tutulacak: akademik analiz, nüans ve eleştirel analiz konu şeması.  
Yeniden yazılacak: 108/108 örnek; özellikle fiilleri gerçek tamlayıcılarıyla ver (`derive a conclusion`, `scrutinize evidence`, `acknowledge a limitation`). `objective` seviye içi tekrarını kaldır veya isim/sıfat kullanımını ayrı etiketle.

### C2 — 24/100

Tutulacak: kesin ifade ve uzmanlık söylemi ayrımı.  
Yeniden yazılacak: 100/100 örnek/distractor. `extrapolate` hemen düzeltilmeli. `differentiate` ve `tentative` aynı seviyede tekrar ediyor. C2'nin asıl ihtiyacı tekil jargon değil, register dönüşümü, hedge, concessive phrase, retorik strateji ve alan-spesifik collocation'lardır.

## Zorunlu revizyon sırası

1. `extrapolate` ve tabloda bulunan anlam kusurlarını düzelt; yanlış içeriği anında yayından çek.
2. B1’i pilot seviyeye çevir: 120 kelimenin her biri için benzersiz cümle, çeviri, iki editoryal distractor ve kullanım notu yaz.
3. B1 kalite kapısı geçmeden B2–C2'ye kelime ekleme. Önce aynı üretim hatasının tekrarını kes.
4. A1/A2’ye IPA + en az 15–20 yüksek frekanslı phrase/collocation ekle.
5. Her kelimeye `cefr`, `senseId`, `editorialStatus`, `reviewedAt`, `reviewer`, `source` alanı koy; aynı biçimle tekrarın bilinçli mi kazara mı olduğunu belirle.
6. CSV'deki yüksek/kritik satırları tek tek kapatıp editoryal onay kaydı olmadan `published` durumuna alma.

## Son karar

Bugünkü katalog “uygulama çalışıyor” standardını karşılıyor, “A1–C2 boyunca kaliteli İngilizce öğretiyor” standardını karşılamıyor. A1/A2 revizyon havuzudur. B1–C2 ise editoryal yeniden yazım bitene kadar ürün iddiası olarak kullanılmamalıdır.

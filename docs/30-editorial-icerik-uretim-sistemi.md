# LingoRise — Editoryal İçerik Üretim Sistemi

Tarih: 11 Eylül 2026  
Amaç: Kelime sayısını artırmak yerine, her öğrenme öğesini doğru anlam, doğal bağlam, CEFR hedefi ve ölçülebilir kalite ile üretmek.

## Temel karar

Bir satırın uygulamada görünmesi ile editoryal olarak onaylanmış olması farklıdır.

- `published`: Teknik olarak katalogda bulunur ve uygulama açılabilir.
- `editorialStatus: needs_review`: Öğrenci akışında mevcut olabilir, fakat kalite raporunda onaylı sayılmaz.
- `editorialStatus: approved`: Yalnızca zorunlu schema, otomatik kalite kapısı ve insan incelemesinden geçen satır.
- `editorialStatus: rejected`: Yanlış anlam, doğal olmayan örnek veya seviye dışı olduğu için yayından çıkarılacak satır.

Bu ayrım, B1–C2'nin tekrar “100 soru var, o halde bitti” diye kabul edilmesini engeller.

## Her öğenin zorunlu sözleşmesi

Yeni içerik `src/content/editorialQuality.ts` içindeki `createEditorialQuestion()` üzerinden yazılır. Aşağıdakilerin tamamı olmadan satır oluşturulamaz:

| Alan | Neden zorunlu |
|---|---|
| `senseId` | Aynı yazılışa sahip farklı anlamları ayırır. Örn. `report.n.document` / `report.v.inform`. |
| `cefr` | Kelimenin hedef seviyesini açıkça sabitler. |
| `learningItemKind` | `word`, `phrase`, `collocation` veya `grammar_pattern` ayrımı yapar. |
| `register` | Neutral, informal, formal, academic, professional veya literary kullanımını açıklar. |
| IPA + pronunciation | Telaffuzu yalnızca metne bırakmaz. |
| Benzersiz İngilizce örnek + doğal Türkçe çeviri | Kelimenin gerçek kullanımını öğretir. |
| `contextNote` ve `hint` | Anlam farkını ve öğrenme bağlamını açıklar. |
| İki editoryal distractor | Öğrencinin ezberle değil anlam ayrımıyla cevap vermesini sağlar. |
| `reviewer`, `reviewedAt`, `source` | Onayın ve sözlük/derlem kaynağının izini tutar. |

## Kalite kapısı

`auditEditorialQuestions()` şu durumlarda yayın onayını reddeder:

1. Anlam, hedef seviye, sense, register, IPA veya editoryal kaynak eksikse.
2. Örnek cümle hedef kelimeyi içermiyorsa.
3. Türkçe örnek genel bir “bu ifade şu bağlamda kullanılır” metniyse.
4. Doğru seçenek yoksa, iki distractor birbirinin aynısıysa veya distractor doğru anlama eşitse.
5. Üç veya daha fazla öğe, hedef kelime çıkarıldığında aynı cümle iskeletine sahipse.
6. Satır `approved` değilse.

Bu kapı semantik doğruluğu tamamen otomatik kanıtlamaz. İnsan editörün görevi özellikle çok anlamlılık, doğal collocation, ton ve CEFR uygunluğudur.

## Üretim akışı

```text
Seviye hedefi
  → konu ve iletişim amacı
  → unit / lesson hedefi
  → sense listesi
  → kelime + phrase + collocation seçimi
  → doğal örnek ve çeviri
  → distractor tasarımı
  → otomatik kalite kapısı
  → editör incelemesi
  → approved katalog
  → cihaz smoke + öğrenme verisi incelemesi
```

## Distractor kuralı

Her soruda iki yanlış seçenek şunlardan biri olmalı:

- aynı sözcük türünde yakın ama yanlış anlam;
- aynı konu içinde gerçekçi karıştırılabilecek kelime;
- Türkçede benzer alanı çağrıştıran fakat cümle bağlamında yanlış karşılık.

Rastgele sıradaki iki anlam kullanılmaz. Doğru cevabın biçimsel ipucu vermemesi gerekir; örneğin tek uzun ifade veya tek fiilimsi seçenek olmamalı.

## Örnek: B2 satırı

```ts
createEditorialQuestion({
  id: "b2-argumentation-consolidate",
  level: "B2", cefr: "B2",
  senseId: "consolidate.v.combine",
  learningItemKind: "word", register: "professional",
  word: "consolidate", meaning: "birleştirmek",
  exampleSentence: "The team consolidated the survey findings before presenting its recommendation.",
  exampleTranslation: "Ekip, önerisini sunmadan önce anket bulgularını birleştirdi.",
  wrongOptions: ["ertelemek", "itiraz etmek"],
  // topic, unit, lesson, IPA, kaynak ve editör alanları da zorunludur.
});
```

Bu örnek hedef kelimeyi doğal bir fiil tamlayıcısıyla verir: `consolidate findings`. Aynı fiil daha sonra başka anlamıyla değil, aynı sense için farklı üretim göreviyle tekrar edilebilir.

## Seviye revizyon planı

| Faz | Kapsam | Çıkış kriteri |
|---|---|---|
| 1 | B1 İş ve İş Birliği, 30 öğe | 30 benzersiz örnek, 60 editoryal distractor, IPA, review kaydı; template sayısı 0. |
| 2 | B1 kalan 90 öğe | Tüm B1 quality gate geçer; seviye içi tekrarlar gerekçeli sense ayrımı taşır. |
| 3 | A1/A2 onarımı | IPA tamamlanır; minimum phrase/collocation hedefi tutar; gereksiz cross-level tekrarlar kaldırılır. |
| 4 | B2 | Argümantasyon, akademik ve profesyonel collocation kümeleri quality gate'ten geçer. |
| 5 | C1 | Nüans/register ve kritik analiz için doğal metin bağlamları tamamlanır. |
| 6 | C2 | Çok anlamlı uzmanlık dili, hedge, retorik ve alan bazlı söylem tamamlanır. |

## Çalışma ritmi

Bir editoryal batch **30 öğedir**. Her batch için teslim paketi:

1. Kaynak dosyadaki 30 schema-geçerli öğe.
2. Otomatik audit sonucu: hata 0, template 0.
3. Çeviri/CEFR denetim tablosu.
4. En az 10 soruluk cihaz smoke.
5. Bir hafta sonra cevap doğruluğu, hint kullanımı ve yanlış seçenek dağılımı telemetry incelemesi.

Bu ritim B1'i önce gerçekten kaliteli hâle getirir; aynı şablon hatasını B2–C2'ye tekrar yaymaz.

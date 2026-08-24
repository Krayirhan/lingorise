# Birim 10 — Oyun Çeşitliliği ve İçerik Kalitesi

**Puan (mevcut durum):** 5/10 · **Öncelik:** P2 — içerikle paralel yürür

## Problem

SM-2 ne kadar iyi kalibre edilirse edilsin, kullanıcı hep aynı formatı görüyor:

- **Tek oyun modu**: `MEANING_MATCH` dışında hiçbir mod içerik taşımıyor. `PICK_THE_WORD` ve `QUICK_REVIEW` tipte tanımlı (`src/types/content.ts`) ama içerikleri yok.
- **Deterministik çeldiriciler**: `a1.ts` içindeki üretim mantığı (`generatedA1Questions`), her kelime için hep aynı 2 çeldiriciyi kullanıyor — havuzdaki sonraki/önceki kelimeler. Oturumlar arası varyasyon yok, kalıp ezberlenebilir.
- **Zorluk ölçeklemesi yok**: Tüm sorular `xp: 10, difficulty: 1`. C2 kelimesiyle A1 kelimesi aynı XP veriyor.

## Kapsam

### 10.1 — Çeldiricileri rastgeleleştir (P1, düşük efor, yüksek etki)

`a1.ts`'teki çeldirici üretim mantığını değiştir: her oturumda (veya her soru gösteriminde) aynı kelime için **farklı** yanlış seçenekler seçilsin, sabit "sonraki 2 kelime" yerine havuzdan rastgele örnekleme yapılsın.

```typescript
// Şu anki (deterministik):
const wrongOptions = Array.from(new Set(
  [...pool.slice(index + 1), ...pool.slice(0, index)]
    .map((candidate) => candidate.meaningTr)
    .filter((meaning) => meaning !== entry.meaningTr)
)).slice(0, 2);

// Öneri: sunum zamanında rastgele seç, üretim zamanında değil
function pickDistractors(entry, pool, count = 2) {
  const candidates = pool.filter(c => c.meaningTr !== entry.meaningTr);
  return shuffle(candidates).slice(0, count).map(c => c.meaningTr);
}
```

Bu değişiklik, çeldiricileri **soru üretimi zamanında sabitlemek yerine soru gösterimi zamanında** seçmeyi gerektirir — mevcut mimaride sorular statik olarak üretiliyor (`a1Questions` sabit dizi), bu yüzden ya çeldirici seçimi `PracticeScreen`/`usePracticeSession` seviyesine taşınmalı ya da her soru gösteriminde `wrongOptions` alanı dinamik hesaplanmalı.

### 10.2 — Zorluk ölçeklemesi ekle (P2)

`difficulty` alanını gerçek bir değere bağla:
- Kelime uzunluğu, kullanım sıklığı (frekans listelerinden), veya seviyeye göre kademeli artan bir formül.
- `xp` ödülünü `difficulty`ye orantılı yap: `xp = baseXp * difficultyMultiplier`.

Bu, Birim 1'deki içerik üretimiyle birlikte yapılmalı — her yeni kelime eklenirken zorluk etiketlenmeli.

### 10.3 — İkinci oyun modu: Pick the Word (P2)

`PICK_THE_WORD` modu için içerik üret: kullanıcıya Türkçe anlam gösterilip İngilizce kelimeyi seçmesi istenen ters format. Bu, `MEANING_MATCH`'in tersine çevrilmiş hali — mevcut kelime verisinden **kod değişikliği olmadan** türetilebilir (aynı `word`/`meaning` çiftini ters göster).

**Düşük efor, orta etki**: Yeni içerik üretmeye gerek yok, mevcut veriyi farklı bir arayüzle sunmak yeterli. Bu, Birim 1'den önce bile yapılabilir bir "hızlı kazanım".

### 10.4 — Üçüncü oyun modu: Quick Review (P3, uzun vadeli)

Hızlı, düşük bilişsel yüklü bir tekrar formatı (örn. kelimeyi göster, "biliyorum/bilmiyorum" ikili seçimi) — özellikle yüksek tekrar borcu olan kullanıcılar için Birim 6'daki "önce borcunu öde" akışını daha az yorucu hale getirebilir.

## Definition of Done

- [ ] Çeldiriciler her oturumda farklılaşıyor
- [ ] `difficulty` ve `xp` gerçek bir formüle bağlandı
- [ ] Pick the Word modu en az A1 için çalışıyor
- [ ] (P3) Quick Review modu değerlendirildi

## Bağımlılıklar

- **10.1** bağımsız, hemen yapılabilir.
- **10.2, 10.3** Birim 1 ile paralel yürür — içerik üretim pipeline'ı genişlerken zorluk/mod verisi de eklenmeli.

# Birim 1 — İçerik Genişletme

**Puan (mevcut durum):** 2/10 · **Öncelik:** P0 — her şeyin önkoşulu

## Problem

Terfi sistemi, bölüm yapısı, SM-2, mastery — hepsi doğru kurulmuş, ama **A2'de 5 kelime var**. B1'de 5, B2'de 4, C1'de 4, C2'de 3. Sistem bir uçağı mükemmel pilotluyor ama pistin sonu yok.

Ayrıca A1'in kendi içinde de bir sorun var: 322 kelimenin **315'inin** örnek cümlesi otomatik üretim şablonu:

```
"Learn and use the word 'x' in a simple sentence."
"'x' kelimesini basit bir cümlede öğren ve kullan."
```

Bu, kelimeyi bağlamsız ezberletiyor — tam olarak iyi bir dil öğrenme uygulamasının yapmaması gereken şey.

## Neden her şeyin önkoşulu

- Parametre doğrulaması (#2) gerçek kullanıcı verisiyle çalışır; gerçek kullanıcı, çalışacak içerik olmadan sistemde kalmaz.
- Terfi kutlaması (#4 Sprint) A2 100 kelimeyi geçmeden hiç tetiklenmiyor — kod hazır, sahne boş.
- Telemetri (#3) anlamlı sinyal üretmesi için haftalarca gerçek kullanım gerekir; içerik yoksa kullanım da yok.

## Kapsam

### 1.1 — A2 seviyesini 250+ kelimeye çıkar (P0, ~1-2 hafta)

- `src/content/questions/a2.ts` dosyasındaki yapıyı `a1.ts`'teki `A1_CORE_VOCABULARY` desenine göre genişlet.
- Hedef: 250-300 kelime, A1'dekiyle aynı konu dağılımı (people, daily_life, home_city, food, nature, health_emotions, core_verbs, descriptions) + A2'ye özgü 2-3 yeni konu (work_career, travel, technology gibi).
- **Kritik: örnek cümleleri şablondan üretmeyin.** Her kelime için gerçek, bağlamsal bir cümle yazın veya bir LLM ile üretip **elle gözden geçirin** — otomatik üretimin A1'de yarattığı sorunu tekrarlamayın.
- `isLevelReady("A2")` eşiği (`LEVEL_READY_MIN_QUESTIONS = 100`, bkz. `src/content/questions/index.ts`) 250 kelimede rahatça geçilir; terfi akışı kod değişikliği olmadan açılır.

### 1.2 — A1'in 315 şablon cümlesini gerçek cümlelerle değiştir (P1, ~1 hafta)

- `src/content/vocabulary/a1CoreVocabulary.ts` içindeki `generatedA1Questions` üretim mantığını (`a1.ts:163` civarı) hedef al.
- Her kelime için: 1 doğal İngilizce örnek cümle + doğru Türkçe çevirisi.
- Toplu üretim + manuel QA önerilir: 315 cümleyi tek tek elle yazmak yerine LLM ile parti parti üretip her partiyi bir konuşmacı/editör gözünden geçirmek.
- **Kabul kriteri:** `validateQuestionDatabase()` içindeki `hasLearningMetadata` kontrolü zaten `exampleSentence` ve `exampleTranslation` alanlarının dolu olmasını zorunlu kılıyor — şablon metni bu kontrolü geçiyor çünkü teknik olarak "dolu". Yeni bir kontrol ekleyin: `exampleSentence` metni `"Learn and use the word"` içeriyorsa testi düşürsün (bkz. `tests/testSuite.ts` madde 1).

### 1.3 — B1'i 200+ kelimeye çıkar (P1, A2 bitince başlar)

- Aynı süreç, B1 için. A2 stabilize olduktan sonra başlanmalı — pipeline'ı A2'de test edip B1'de tekrarlamak, ikisini aynı anda yapmaktan daha az riskli.

### 1.4 — B2/C1/C2 (P2, uzun vadeli)

- Bu seviyeler ilk yayın için zorunlu değil. `isLevelReady` kapısı sayesinde "Yakında" olarak kalabilirler, kullanıcı deneyimini bozmazlar.
- Sıra: B2 → C1 → C2, her biri 150-200 kelime hedefiyle.

## İçerik üretim süreci önerisi

1. **Konu listesi çıkar** (CEFR kelime listelerinden referans alınabilir — Oxford 3000/5000 gibi kamuya açık CEFR uyumlu listeler).
2. **LLM ile taslak üret**: kelime, anlam, çeldiriciler, örnek cümle, telaffuz ipucu — `a1CoreVocabulary.ts`'teki `VocabularyEntry` şemasına uygun.
3. **İnsan gözden geçirmesi zorunlu**: özellikle çeldiricilerin gerçekten yanıltıcı ama makul olduğundan, örnek cümlelerin doğal Türkçe/İngilizce olduğundan emin olun.
4. **`validateQuestionDatabase()` her partiden sonra çalıştırılmalı** — yinelenen ID, eksik alan, şablon metin kontrolü.

## Definition of Done

- [ ] A2 ≥ 250 kelime, `isLevelReady("A2") === true`
- [ ] A2'nin hiçbir örnek cümlesi şablon metin değil
- [ ] A1'in 315 şablon cümlesi gerçek cümlelerle değiştirildi
- [ ] `validateQuestionDatabase()` şablon metin tespiti ile güncellendi ve geçiyor
- [ ] B1 ≥ 200 kelime (P1 tamamlanma kriteri, opsiyonel ilk yayın için)

## Bağımlılıklar

- Hiçbiri — bu birim herhangi bir zamanda başlayabilir, kod tarafından bağımsız.
- **Bloke ettiği:** Birim 2 (Çok Günlü Doğrulama), Birim 4 (Parametre Doğrulaması), terfi akışının gerçek kullanımı.

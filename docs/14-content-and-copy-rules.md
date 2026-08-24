# LingoRise İçerik ve Metin Kuralları

## Arayüz metinleri

- Kullanıcıya görünen hiçbir yeni metin doğrudan ekran içine yazılmaz.
- Ana dil ve global varsayılan dil İngilizcedir.
- Her arayüz metni sabit bir anahtarla çağrılır: `t("home.todayQuest")`.
- Metin anahtarları ekran adına göre gruplanır: `onboarding.*`, `home.*`, `game.*`, `result.*`.
- Marka adı her zaman `LingoRise` olarak kalır.

## Öğrenme içerikleri

Her soru en az şu alanlara sahip olur:

```ts
type Question = {
  id: string;
  type: "meaning_match" | "multiple_choice_sentence";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  skill: "vocabulary";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
};
```

Kurallar:

- Tek ve açık bir doğru cevap bulunur.
- Distractor seçenekler doğal ve aynı kategoriye ait olur.
- Açıklama kısa, doğru ve öğrenmeye yardımcı olur.
- İçerik seviyesi, kelime zorluğu kadar cümle yapısına göre de belirlenir.
- Her içerik benzersiz `id` taşır.
- İçerik değişince mevcut id değiştirilmez; versiyonlama uygulanır.

## İçerik yayın kontrolü

Yeni soru eklenmeden önce dil doğruluğu, CEFR seviyesi, tek doğru cevap, doğal kullanım ve mobil ekranda okunabilirlik kontrol edilir.

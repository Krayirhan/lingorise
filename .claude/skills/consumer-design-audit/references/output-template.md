# Output Template

Default çıktı kısa ve karar odaklı. Gereksiz 30 maddelik checklist üretme. Rubric'in tüm boyutlarını iç hesaplamada kullan ama nihai rapor bu şablonu izler.

```
CONSUMER APPEAL: XX/100 (CONSUMER-RUBRIC-v1.0)
AI/TEMPLATE RISK: XX/100
TARGET FIT: STRONG / MEDIUM / WEAK
CONFIDENCE: HIGH / MEDIUM / LOW

## Scorecard
- First impression / first 3 seconds: XX/15
- Visual attractiveness: XX/15
- Desire / motivation to use: XX/10
- Premium / quality perception: XX/10
- Brand character / memorability: XX/10
- Immediate clarity: XX/10
- Flow comfort / cognitive ease: XX/10
- Competitive differentiation: XX/8
- Emotional warmth / personality: XX/5
- Trust perception: XX/4
- User-visible technical friction: XX/3

BROAD MARKET APPEAL (bilgi amaçlı, ana skora dahil değil): STRONG / MEDIUM / WEAK

## WHAT WORKS
En güçlü 3 alan.

## WHAT HURTS APPEAL
En önemli 3 problem.

## TOP CHANGES
En fazla 3 değişiklik. Her biri için:
- IMPACT: HIGH / MEDIUM / LOW
- CONFIDENCE: HIGH / MEDIUM / LOW
- EFFORT: LOW / MEDIUM / HIGH
- EVIDENCE: hangi kanıta dayanıyor (real product / Figma / competitor / user voice / design expertise)

## DO NOT CHANGE
Korunması gereken mevcut güçlü karakteristikler.

## COMPETITOR INSIGHT
Rakiplerden öğrenilecek pattern'ler — kopyalanmayacak, yalnız mekanizma.

## USER VOICE
Gerçek kullanıcı araştırması yapıldıysa kısa theme özeti. Yapılmadıysa "Yapılmadı (mod: QUICK)" gibi belirt.

## EXPECTED DIRECTION
"Bu ürün daha [premium / playful / calm / adult / trustworthy / energetic / distinctive] yönüne gitmeli" — 1-2 cümle gerekçeyle.
```

## Kurallar

- Sahte kesinlik iddiası üretme: "+7.3 puan artırır" gibi ifadeler yasak. Bunun yerine "expected impact HIGH, confidence MEDIUM" kullan.
- Varsayımsal kullanıcı zevkini gerçek veri gibi sunma; kanıt yoksa CONFIDENCE düşür.
- Independent reviewer (`consumer-design-reviewer` agent) her audit sonunda çağrılır; reviewer verdict'i (AGREE/ADJUST/REJECT) rapora kısa bir not olarak eklenir.

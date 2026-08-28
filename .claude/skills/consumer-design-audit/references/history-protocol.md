# History Protocol

Bu dosya yalnız bir DEEP audit kaydedilecekse (veya STANDARD'da kullanıcı "kaydet/record/baseline" derse) okunur. QUICK/STANDARD ekrana-çıktı akışında bu dosyayı yükleme — token hygiene.

## Save policy (mod bazlı)

- **QUICK** — kayıt yok. Hiçbir koşulda dosya/artifact üretme.
- **STANDARD** — varsayılan kayıt yok. Kullanıcı açıkça "record", "kaydet", "baseline oluştur" derse bu protokolü uygula.
- **DEEP** — varsayılan **otomatik kayıt**. Kullanıcı "kaydetme", "read-only", "sadece göster" gibi açık bir talimat verirse kayıt yapma.
- Audit tamamlanmadıysa (emulator bulunamadı, evidence eksik, kullanıcı iptal etti, akış yarım kaldı) **hiçbir koşulda run oluşturma** — ne QUICK/STANDARD ne DEEP'te.

## Klasör yapısı

```
.audit/consumer/
.audit/consumer/RUN_REGISTRY.md
.audit/consumer/CURRENT_CONSUMER_STATE.md
.audit/consumer/runs/CONSUMER-NNN-<TYPE>/SUMMARY.md
```

`<TYPE>` ∈ `BASELINE` (ilk kayıtlı DEEP run) | `REAUDIT` (sonraki her DEEP run).

## Run numarası ve tip kararı

1. `.audit/consumer/runs/` altında hiç run yoksa → yeni run `CONSUMER-001-BASELINE`.
2. Zaten bir baseline (veya reaudit) varsa → yeni run `CONSUMER-NNN-REAUDIT`, `NNN` mevcut en yüksek run numarasından bir fazlası (monoton artan, asla tekrar kullanılmaz veya boşluk bırakılmaz geriye dönük doldurulmaz).
3. Run numarasını öğrenmek için önce `RUN_REGISTRY.md`'yi oku (tüm eski `SUMMARY.md` dosyalarını açmaya gerek yok).

## Immutability

- Tamamlanmış bir run klasörü (`CONSUMER-NNN-*/SUMMARY.md`) yazıldıktan sonra **bir daha düzenlenmez**. Hata veya eksiklik fark edilirse eski dosyayı rewrite etme — yeni bir run veya kısa bir düzeltme notu oluştur ve eski run'a açıkça referans ver (örn. "CONSUMER-001-BASELINE § X notu: ... — bkz. CONSUMER-002-REAUDIT için düzeltme").
- Güncellenebilir tek dosyalar: `CURRENT_CONSUMER_STATE.md` (her başarılı DEEP audit sonrası) ve `RUN_REGISTRY.md` (yeni satır eklenerek).

## Rubric version mismatch

Yeni audit farklı bir rubric versiyonuyla yapıldıysa (`CONSUMER-RUBRIC-v1.1`, `v2.0` vb.), önceki run'larla **kör sayısal karşılaştırma yapma**. `RUN_REGISTRY.md`'ye rubric versiyonunu ayrı bir sütunda işaretle ve SUMMARY.md'de "Rubric version mismatch — sayısal delta karşılaştırılamaz, yalnız nitel yön karşılaştırması yapılabilir" notunu ekle.

## Revision doğruluğu

Her SUMMARY.md'nin "Audit Identity" bölümünde gerçek durumu yaz:

- Çalışma ağacı temiz ve HEAD'e denk geliyorsa: `Revision: <commit-hash>` (committed).
- Çalışma ağacında commit edilmemiş değişiklik varsa: `Revision: working tree on top of <commit-hash> (dirty)` ve hangi dosyaların ilgisiz/uncommitted olduğunu kısaca not et.
- Asla değerlendirilenden farklı bir revizyonu "sertifika" gibi sunma (never certify a different revision than evaluated).

## SUMMARY.md şablonu (DEEP run)

```markdown
# CONSUMER-NNN-<TYPE>

## Audit Identity
- Run ID:
- Date/time:
- Revision:
- Mode: DEEP
- Scope:
- Rubric version:
- Consumer Appeal:
- AI/Template Risk:
- Target Fit:
- Confidence:

## Evidence
Kullanılan/kullanılmayan kanıt türleri: REAL PRODUCT, FIGMA, COMPETITOR, USER VOICE, INFERENCE — hangileri kullanıldı, hangileri N/A.

## Screens Observed
Yalnız GERÇEKTEN gözlemlenen ekranlar. Görülmeyeni görüldü diye yazma.

## Full Scorecard
CONSUMER-RUBRIC-v1.0 tüm boyutlar.

## Score Loss Ledger
100 → current score. Her boyut için: score, max, lost, reasons, evidence, confidence, affected screens. Matematik doğrulanmalı (Σlost = 100 − score).

## Screen-by-Screen Assessment
Gözlemlenen her core ekran için diagnostic not/derece — sahte kesinlik iddiası yok, doğrudan sayısal rubric puanı değil, niteliksel değerlendirme.

## Findings
CD-NNN sıralı. Her biri: title, affected screens, evidence, root cause, affected rubric dimensions, impact, confidence, effort, status (OPEN/CLOSED). Önceki run'da OPEN olan bir finding kapandıysa burada delta belirt (örn. "CD-001: OPEN → CLOSED").

## What Works / What Hurts Appeal / Change Impact Map / Top Changes / Do Not Change / Competitor Insights / User Voice / AI-Template Risk Analysis

## Strongest Screen / Weakest Screen / Biggest Cross-Screen Inconsistency

## Path to 80 / Path to 85 / Path to 90
Garanti puan artışı YOK. "Bu bulgular çözülürse expected impact HIGH/MEDIUM, confidence ... — kesin puan taahhüdü değildir" formatı kullan.

## Why Not Higher / Why Not Lower

## Independent Reviewer Verdict

## Known Limitations

## Reaudit Criteria
```

## CURRENT_CONSUMER_STATE.md şablonu

Kısa, yaşayan bir state dosyası — her başarılı DEEP audit sonrası güncellenir, SUMMARY.md'ler asla güncellenmez:

```markdown
Current Run:
Current Consumer Appeal:
AI/Template Risk:
Rubric:
Target Fit:
Confidence:

Delta from previous run:
Delta from baseline:

Open high-impact findings:
- CD-NNN: ...

Top opportunities:
1.
2.
3.

Protected strengths:
- ...

Last audited revision:
Last audit date:
```

Yalnız güncel açık (OPEN) finding'ler burada listelenir; kapanmış finding geçmişi burada tutulmaz (SUMMARY.md'lerde kalır).

## RUN_REGISTRY.md şablonu

```markdown
| Run | Date | Revision | Type | Rubric | Appeal | AI Risk | Delta | Verdict |
|---|---|---|---|---|---|---|---|---|
| CONSUMER-001-BASELINE | ... | abc123 (dirty) | BASELINE | v1.0 | 70 | 18 | — | RECORDED |
```

`Verdict` sütunu: `RECORDED` (baseline), `IMPROVED` / `REGRESSED` / `FLAT` (reaudit, önceki run'a göre), veya `RUBRIC MISMATCH` (versiyon değiştiyse sayısal delta yok).

## Token hygiene

- Bir reaudit başlarken önce yalnız `RUN_REGISTRY.md` + `CURRENT_CONSUMER_STATE.md` oku — bunlar delta karşılaştırması için yeterli.
- Önceki `SUMMARY.md` dosyalarını yalnız belirli bir finding'in tam geçmişini doğrulamak gerektiğinde aç; varsayılan olarak tüm eski run'ları tarama.
- SKILL.md bu protokolü inline barındırmaz — yalnız bu dosyaya pointer verir.

# Project Audit Framework — Kullanım Rehberi

Bu paket, bir yazılım projesini **önce anlamak**, ardından **yalnızca o projenin amacı, risk seviyesi ve teknik yapısı için gerçekten gerekli alanlarda** değerlendirmek için tasarlanmıştır.

Amaç; her projeye aynı kontrol listesini zorla uygulayan, gereksiz enterprise kriterleri yüzünden puan kıran veya LLM'in "genel best practice" ezberleriyle skor ürettiği denetimleri engellemektir.

## Ana akış

```text
DISCOVER
   ↓
UNDERSTAND PURPOSE
   ↓
CLASSIFY RISK / SCOPE
   ↓
BUILD CONTEXTUAL RUBRIC
   ↓
LOCK RUBRIC
   ↓
COLLECT EVIDENCE
   ↓
AUDIT + SCORE
   ↓
FINDINGS
   ↓
ACTIONS
   ↓
OPTIONAL FIX
   ↓
REAUDIT
   ↓
DELTA + REGRESSION CHECK
   ↓
CERTIFY
```

## Klasörler

- `AUDIT_MASTER.md`: Her çalışmanın giriş noktası.
- `engine/`: Değişmeyen denetim kuralları ve protokoller.
- `state/`: Projeye özel güncel profil, rubric lock, finding/action kayıtları.
- `templates/`: Yeni audit run çıktıları için şablonlar.
- `runs/`: Her audit'in immutable geçmişi.
- `prompts/`: Hazır çalıştırma komutları.

## İlk kullanım

Paketi projenin kök dizinine `.audit` adıyla kopyalayın:

```text
project-root/
├── src/
├── ...
└── .audit/
```

Ardından coding agent / AI denetçisine şu komutu verin:

```text
Read .audit/AUDIT_MASTER.md and all mandatory engine documents it references.
MODE: BASELINE
Perform a complete evidence-first contextual audit of this repository.
Do not modify project source files.
```

## Tekrar puanlama

```text
Read .audit/AUDIT_MASTER.md.
MODE: REAUDIT
Use the currently locked rubric.
Compare against the latest valid baseline/re-audit run.
Revalidate changed areas and all mandatory global gates.
Produce a delta report and detect regressions.
Do not modify source files.
```

## Aksiyon üretme

```text
Read .audit/AUDIT_MASTER.md.
MODE: PLAN
Use the latest valid audit findings.
Produce prioritized, testable actions only.
Do not modify source files.
```

## Seçili aksiyonları uygulatma

```text
Read .audit/AUDIT_MASTER.md.
MODE: FIX
APPROVED_ACTIONS: ACT-DATA-001, ACT-TEST-003
Apply only these actions.
Do not opportunistically refactor unrelated code.
Run the required verification for each action.
```

## Güvenlik prensibi

Bu framework'ün temel kuralı **Secret Zero Exposure** yaklaşımıdır:

- Secret değerleri audit raporuna yazılmaz.
- `.env` gibi dosyalar varsayılan olarak içerik dökümü amacıyla açılmaz.
- `env`, `printenv`, `set`, `cat .env` gibi toplu secret sızdırabilecek komutlar yasaktır.
- Gerekirse yalnızca secret anahtar adları / dosya varlığı / redacted scanner sonucu incelenir.
- Bir aracın secret değerini stdout'a yazma ihtimali varsa o araç güvenli/redacted mod olmadan çalıştırılmaz.

## Puanlama felsefesi

**Projenin amacı > generic best practice.**

Örnek: offline Android not uygulamasında Kubernetes, API rate limiting veya distributed tracing yok diye puan düşmez. Bunlar `N/A` olur ve skor denominator'ına girmez.

Rubric ilk baseline audit sırasında oluşturulur ve sonrasında kilitlenir. Proje amacı/risk profili değişmedikçe re-audit sırasında ağırlıklar değiştirilmez.

## Önerilen çalışma disiplini

1. `BASELINE` ile ilk gerçek durumu dondur.
2. `PLAN` ile aksiyonları çıkar.
3. P0/P1 aksiyonlarını seç.
4. `FIX` ile sadece onaylı action ID'lerini uygulat.
5. `REAUDIT` ile aynı rubric üzerinden tekrar puanlat.
6. Delta ve regression raporunu incele.
7. Release aşamasında `CERTIFY` çalıştır.

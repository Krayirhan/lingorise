# Project Audit Framework — Install

1. Bu arşivi projenizin kök dizinine çıkarın.
2. `.audit/` klasörü proje içinde kalmalıdır.
3. İlk kullanım için `.audit/prompts/BASELINE.md` içeriğini coding agentınıza verin.
4. Sistem ayrıntıları için `.audit/README_TR.md` ve `.audit/AUDIT_MASTER.md` dosyalarını okuyun.

Önerilen yapı:

```text
project-root/
├── source files...
└── .audit/
    ├── AUDIT_MASTER.md
    ├── engine/
    ├── state/
    ├── templates/
    ├── runs/
    └── prompts/
```

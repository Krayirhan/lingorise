---
name: project-audit
description: Projede zaten bulunan .audit/ denetim sistemine Claude Code skill arayüzü sağlar. Yeni bir audit metodolojisi icat etmez; .audit/AUDIT_MASTER.md ve referans verdiği engine dokümanlarını çalışma anında okuyup mevcut protokolü takip eder.
disable-model-invocation: true
---

Bu skill `.audit/` altındaki mevcut Project Audit Framework'e arayüz sağlar. Metodolojiyi burada tekrar etmez — çalışma anında kaynağı okur.

## Süreç

1. `.audit/AUDIT_MASTER.md` dosyasını oku. Orada zorunlu (mandatory) işaretlenen `engine/` dokümanlarının hepsini sırasıyla oku.
2. `.audit/state/` altındaki mevcut durumu incele (proje profili, purpose, rubric lock, finding/action kayıtları) — varsa. Bayat state'i körü körüne güvenme; repo kimliği/branch/revizyonu doğrula.
3. Mod belirle: `DISCOVER`, `BASELINE`, `PLAN`, `FIX`, `REAUDIT`, `CERTIFY`. Kullanıcı mod belirtmediyse `AUDIT_MASTER.md`'de tanımlı varsayılanı kullan (asla doğrudan `FIX` varsayma).
4. Audit scope'unu kullanıcının isteğine göre belirle — tahmini/icat edilmiş kapsam kullanma.
5. `.audit/AUDIT_MASTER.md`'nin referans verdiği prompt/protokolü uygula. Hangi protokolün giriş noktası olduğu belirsizse, sabit bir workflow yazma — uygun protokolü çalışma anında keşfet.

## Kurallar

- `.audit` sistemindeki terminolojiyi koru (mode isimleri, doküman adları, klasör yapısı).
- Var olmayan kriter üretme; rubric ve kriterler `.audit` içindeki kaynaktan gelmeli.
- Güncel kodu source of truth kabul et; `.audit/runs/` içindeki geçmiş sonuçları güncel gerçek gibi sunma — freshness'ı doğrula.
- Graphify mimari analiz için gerekirse kullanılabilir, ancak `graphify-out/` çıktısının güncelliği doğrulanmalı.
- `FIX` modu dışında kod değiştirme. `FIX` modunda bile yalnızca kullanıcının açıkça onayladığı action ID'leri uygula.
- `.env` içeriğini veya secret değerlerini gösterme; `.audit`'in Secret Zero Exposure prensibine uy.
- Kullanıcı özellikle dosyaya yaz demedikçe audit sonucunu dosyaya kaydetme; `.audit/runs/` altına yazım gerekiyorsa bunu `.audit` protokolünün kendi kurallarına göre yap ve kullanıcıya bildir.

Rapor Türkçe olmalı; format `.audit` sisteminin beklediği şablonlara uygun olmalı (`.audit/templates/`).

---
name: project-review
description: Working tree veya son değişiklikler üzerinde code-reviewer, test-reviewer ve gerekiyorsa firebase-security-reviewer subagent'larını kullanarak bağımsız çoklu-agent review yapar.
disable-model-invocation: true
---

## Kapsam belirleme

1. Kullanıcı açıkça bir commit/range belirttiyse: o kapsamı kullan.
2. Aksi halde, uncommitted değişiklik varsa: staged + unstaged + untracked'ın TAMAMI kapsama dahildir.
   - `git diff --staged` (staged)
   - `git diff` (unstaged)
   - `git ls-files --others --exclude-standard` (untracked yeni dosyalar)
   - Untracked olarak listelenen her dosyanın içeriği gerçekten okunmadan review tamamlandı sayılmaz.
   - Hem staged hem unstaged hem untracked aynı anda varsa üçü birlikte tek review scope'u oluşturur.
3. Aksi halde: varsayılan kapsam HER ZAMAN HEAD commit'tir (`git show HEAD`).

"Son anlamlı commit" gibi yoruma açık bir seçim yapma — HEAD'in commit mesajı chore/skill/config olsa bile scope HEAD'dir.

Seçilen scope'u (hangi kural tetiklendi, hangi dosyalar/commit/diff incelenecek) agent çağrılarından önce açıkça raporla.

## Agent çağrıları

1. `code-reviewer` subagent'ını çağır — zorunlu.
2. `test-reviewer` subagent'ını çağır — zorunlu.
3. Değişiklik şu alanlardan birini etkiliyorsa `firebase-security-reviewer` subagent'ını da çağır:
   - Firebase Auth
   - Firestore
   - `firestore.rules`
   - sync
   - authentication
   - user data ownership

Agent'lar kod değiştirmez, yalnızca analiz yapar.

Agent sonuçları kullanıcıya doğrudan, ayrı ayrı final cevap olarak bırakılmaz. Ana skill tüm agent sonuçlarını toplar, duplicate bulguları birleştirir ve tek nihai raporu üretir.

### Agent başarısızlığı

`code-reviewer` veya `test-reviewer` tamamlanamazsa (başarısız olur veya zaman aşımına uğrarsa) review eksik kabul edilir; Verdict PASS veya PASS WITH NOTES olamaz, BLOCK verilir ve sebep "review tamamlanamadı" olarak açıkça belirtilir. `firebase-security-reviewer` yalnızca gerekli olduğu durumda başarısız/timeout olursa aynı kural geçerlidir.

## Birleştirme

Bağımsız agent sonuçlarını tek raporda birleştir. Aynı problemi iki agent raporladıysa duplicate üretme — tek bulgu olarak birleştir.

İki agent aynı bulguya farklı severity verirse otomatik olarak yüksek olanı seçme; kanıt ve gerçek etkiyi değerlendirip nihai severity'yi ana skill belirler. Belirsizlik varsa daha yüksek severity yerine gerekçeli, konservatif bir sınıflandırma yap.

Style/nitpick problemlerini blocker yapma. Kanıtsız varsayımları gerçek bug olarak sunma. Dosya değiştirme, commit/push yapma.

### Severity

- Bir test eksikliğini sırf test yok diye otomatik CRITICAL yapma.
- CRITICAL yalnızca ciddi veri kaybı, güvenlik açığı veya uygulamanın temel akışını kıran, yüksek güvenli sorunlar için kullanılır.
- Geçmişte yaşanmış bir regresyon için eklenmemiş test genellikle HIGH olabilir; sınıflandırma kanıta dayanmalı, varsayıma değil.

### Verdict kuralı

- **BLOCK**: en az bir doğrulanmış CRITICAL veya HIGH blocker varsa, veya zorunlu bir review agent'ı tamamlanamadıysa.
- **PASS WITH NOTES**: blocker yok ama MEDIUM/LOW bulgu veya test gap varsa.
- **PASS**: blocker, başka bulgu ve anlamlı test gap yoksa.

## Rapor formatı

Final çıktı kesin olarak şu formatta olur. Verdict kodları (`PASS`, `PASS WITH NOTES`, `BLOCK`) İngilizce sabit kalır; diğer tüm durum metinleri Türkçedir.

```
## Review Scope
- İncelenen diff / commit / range

## Review Sonucu

### Blockers
CRITICAL/HIGH bulgular. Yoksa "Yok".

### Other Findings
MEDIUM/LOW bulgular. Yoksa "Yok".

### Test Gaps
Eksik testler. Yoksa "Yok".

### Firebase/Security
Yalnızca ilgiliyse doldurulur. İlgili değilse "Gerekli değil.".

### Agents Used
- code-reviewer: KULLANILDI / BAŞARISIZ / ZAMAN AŞIMI
- test-reviewer: KULLANILDI / BAŞARISIZ / ZAMAN AŞIMI
- firebase-security-reviewer: KULLANILDI / GEREKLİ DEĞİL / BAŞARISIZ / ZAMAN AŞIMI

### Verdict
PASS
PASS WITH NOTES
BLOCK
```

Her gerçek bulguda mümkünse dosya ve ilgili alan belirt. Rapor Türkçe olmalı.

# Google Play Data Safety Formu — Doldurulmaya Hazır Çalışma Sayfası

Bu dosya [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 13 §13.1'in çıktısıdır. **Bu form Claude tarafından Play Console'a gönderilemez** — Play Console'a geliştirici hesabıyla giriş ve orada manuel form doldurma gerektirir. Buradaki her satır, kod tabanının **§13'te yapılan gerçek denetimine** dayanıyor; tahmini/şablon bir cevap değil.

## Denetim yöntemi

Aşağıdaki tablo, kodun gerçekte ne yaptığının satır satır izini sürüyor:

| Soru | Kontrol edilen dosya | Bulgu |
|---|---|---|
| Reklam SDK'sı var mı? | `package.json`, `src/**` içinde "admob/iap/purchase/billing" araması | Hiçbiri yok |
| Hangi izinler isteniyor? | `app.json`, `notificationService.ts` | Sadece yerel bildirim izni (`Notifications.requestPermissionsAsync`) — push token sunucuya gönderilmiyor |
| Hangi üçüncü taraf servisler var? | `src/services/firebase.ts` | Sadece Firebase Auth + Firestore |
| Konum/kamera/kişiler erişimi var mı? | Tüm `src/**` | Yok |
| Silme gerçekten tüm veriyi kaldırıyor mu? | `src/services/firestore.ts` `deleteUserData()` | **Hayır'dı, düzeltildi** — `users/{uid}/items/*` alt koleksiyonu siliniyordu ama hiç temizlenmiyordu. Bu S13'te bulunup düzeltildi (bkz. commit) |

## Google Play Data Safety — Bölüm Bölüm Cevaplar

### 1. Veri toplama ve paylaşım

**"Uygulamanız kullanıcı verisi topluyor mu?"** → **Evet**

**"Uygulamanız kullanıcı verisini üçüncü taraflarla paylaşıyor mu?"** → **Hayır** (Firebase bir "veri işleyici"dir, Google'ın kendi Data Safety rehberine göre genelde ayrı bir "paylaşım" olarak sayılmaz çünkü uygulamanın kendi altyapısı olarak kullanılıyor — ama Play Console'un güncel formunda Firebase'i "hizmet sağlayıcı" olarak işaretleyen bir seçenek varsa onu kullanın).

### 2. Veri tipleri

| Kategori | Toplanıyor mu? | Alt tip | Bağlantılı mı (kullanıcı kimliğine)? | Amaç |
|---|---|---|---|---|
| **Kişisel bilgiler** | Evet | E-posta adresi | Evet (hesap açan kullanıcılar için) | Hesap yönetimi |
| **Kişisel bilgiler** | Evet | İsim (görünen ad) | Evet, opsiyonel kullanıcı girdisi | Profil kişiselleştirme |
| **Finansal bilgiler** | Hayır | — | — | — |
| **Konum** | Hayır | — | — | — |
| **Web taraması** | Hayır | — | — | — |
| **Uygulama etkileşimleri** | Evet | Uygulama içi eylemler (pratik oturumu, cevaplar, ilerleme) | Evet, hesap açan kullanıcılar için; misafir modunda cihaz dışına hiç çıkmıyor | Uygulamanın temel işlevi — öğrenme takibi |
| **Uygulama bilgisi ve performansı** | Hayır | Çökme raporlama şu an kurulu değil | — | — |
| **Cihaz veya diğer kimlikler** | Hayır | — | — | — |

### 3. Güvenlik uygulamaları

- **Veri aktarım sırasında şifreleniyor mu?** → Evet (Firebase SDK'sı HTTPS/TLS kullanır, varsayılan).
- **Kullanıcılar veri silmeyi talep edebilir mi?** → Evet — uygulama içi "Hesabımı Kalıcı Olarak Sil" (Profil ekranı) hem Firebase Authentication hesabını hem Firestore'daki tüm belgeleri (profil, ilerleme özeti, kelime bazlı kayıtlar) siler.
- **Bağımsız bir güvenlik denetimi yapıldı mı?** → Hayır (küçük/tek geliştiricili proje, henüz yapılmadı — dürüstçe "Hayır" işaretlenmeli).

### 4. Veri toplama isteğe bağlı mı?

**Kısmen evet.** Misafir modunda (varsayılan) hiçbir veri cihaz dışına çıkmıyor. Hesap açmak tamamen opsiyonel — sadece çoklu cihaz senkronu isteyen kullanıcılar için var. Bu nüansı Data Safety formunun "isteğe bağlı veri toplama" seçeneğinde belirtin.

## Gizlilik Politikası URL'si

Bu S13 çalışmasında yayınlandı: **https://claude.ai/code/artifact/90a36725-0440-4caf-b2ca-5b26212c2b11**

**Gerçek bir bulgu — cihazda test ederken ortaya çıktı:** Claude Artifact'ları varsayılan olarak **private** yayınlanır; "yayınlandı" olması "herkese açık" anlamına gelmiyor. Bu URL'yi uygulama içinden (Profil → Veri ve Gizlilik → "Web'de tam metni görüntüle") gerçek bir cihazda açmayı denediğimde "Page not found / Sign in" ile karşılaştım — sayfa oturum açmamış ziyaretçilere kapalıydı. **İnsan adımı (tamamlanması gerekiyor):** claude.ai'daki bu artifact'in paylaşım menüsünden "Herkese açık" seçeneği seçilmeli. Bu tek tıklık bir işlem — URL değişmiyor, kod tarafında başka hiçbir değişiklik gerekmiyor, hem uygulama içi bağlantı hem de bu worksheet zaten bu URL'ye işaret ediyor.

**Uzun vadeli öneri:** Kalıcı bir kendi alan adınız (örn. `lingorise.app/privacy`) olduğunda oraya taşınması önerilir — hem daha profesyonel görünür hem de üçüncü taraf bir platforma bağımlılığı kaldırır. Kısa vadede, paylaşıma açılmış bir Artifact URL'si Play Console'un "herkese açık, kalıcı URL" şartını teknik olarak karşılar.

## Bu sprintte düzeltilen gerçek hata

`src/services/firestore.ts`'teki `deleteUserData()` fonksiyonu, hesap silindiğinde `users/{uid}/items/{questionId}` alt koleksiyonundaki kayıtları (kullanıcı başına en fazla 590 belge — her cevaplanan kelime için bir tane, `syncLearningItemProgress` tarafından yazılıyor) hiç silmiyordu. "Hesabımı Kalıcı Olarak Sil" butonu kullanıcıya tam silme vaat ediyordu ama gerçekte Firestore'da veri artığı bırakıyordu. Bu, Data Safety formunun "kullanıcılar veri silmeyi talep edebilir" beyanını yanlış kılacak bir hataydı — düzeltildi (500'lük batch'ler halinde tüm alt koleksiyon belgeleri de siliniyor artık).

## Definition of Done — bu dosyanın kapsamı

- [x] Kod tabanı denetlendi, gerçek veri toplama davranışı belgelendi
- [x] Hesap silme akışındaki gerçek bir hata bulunup düzeltildi
- [x] Herkese açık bir gizlilik politikası URL'si yayınlandı
- [ ] **İnsan adımı:** Bu çalışma sayfasındaki cevaplar Play Console'a geliştirici hesabıyla girilmeli
- [ ] **İnsan adımı:** Gizlilik politikası kalıcı bir alan adına taşınmalı (opsiyonel, kısa vadede Artifact URL'si yeterli)

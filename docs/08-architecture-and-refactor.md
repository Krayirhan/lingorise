# Mimari ve Clean Code Kuralları

**Güncelleme:** 5 Ekim 2026

Bu belge ekran, fonksiyon ve modül büyüklüğü için ekip içi review ilkelerini tanımlar. Katmanların gerçek konumu ve import yönleri [Clean Architecture güncel referansında](CLEAN_ARCHITECTURE.md), doğrulama durumu [verification kaydında](CLEAN_ARCHITECTURE_VERIFICATION.md) tutulur.

## Dosya ve fonksiyon review ilkeleri

- Bir ekranın sunumu, domain kararı veya persistence detayıyla aynı modülde birikmemeli; ekran use case'i çağırıp sonucu sunmalıdır.
- Bir modülün birden fazla bağımsız değişim nedeni varsa sorumlulukları ayırın. Satır sayısı tek başına bölme gerekçesi değildir; büyük içerik katalogları alan/veri sahipliği anlaşılır olduğu sürece tek dosyada kalabilir.
- 250 satırı aşan uygulama modülleri, 120 satırı aşan fonksiyonlar review sırasında sorumluluk, karar yoğunluğu, tekrar ve testlenebilirlik açısından incelenmelidir. Bu değerler alarm eşiğidir, otomatik ihlal tanımı değildir.
- Hook'lar React yaşam döngüsü ve UI aboneliğini yönetir; uzun iş akışlarını application use case'lerine devreder.
- React state updater içinde I/O başlatmayın. Yan etkileri açık async akışlarında yürütün.
- İsimler iş niyetini açıklamalı; testler kaynak kod dizilimini değil görünür davranışları ve önemli veri sözleşmelerini doğrulamalıdır.
- Kullanıcıya görünen metinler i18n kaynaklarında; ortak görünüm değerleri theme katmanında; öğrenme kuralları domain katmanında tutulmalıdır.

## Güncel kod ölçümü

5 Ekim 2026 güncel taramasında `src/` içinde 246 TypeScript/TSX dosyası bulundu. İçerik/çeviri verileri dışında `AppNavigator.tsx` (251 satır) tek 250 satır üstü dosyadır. İçerik verisi satır sayısı God File metriğine dahil edilmez.

AST satır taramasında 120 satırdan uzun 13 fonksiyon/callback bulundu. Güncel tam liste ve boyutlar [doğrulama kaydındadır](CLEAN_ARCHITECTURE_VERIFICATION.md); öncelikli review adayları:

| Fonksiyon | Satır | İlk inceleme sorusu |
|---|---:|---|
| `AppNavigator` | 222 | Route seçimi ile callback/ekran prop bağlantıları daha küçük kompozisyonlara ayrılabilir mi? |
| `PracticeHubScreen` | 200 | Hero, seçenekler ve oturum başlatma sunumu ayrı bileşenlere ait mi? |
| `createProgressController` | 199 | Hydration, snapshot ve yan etki koordinasyonu farklı use case'lere bölünmeli mi? |
| `getMainRoute` | 172 | Route koşulları küçük, isimlendirilmiş karar fonksiyonlarıyla daha anlaşılır olur mu? |

Bu liste otomatik refactor talimatı değildir. Her aday davranış testleri korunarak, değişim nedeni gerçekten ayrışıyorsa bölünmelidir.

## Refactor güvenlik kuralları

1. Kullanıcı çalışma ağacındaki değişiklikleri koruyun; alakasız formatlama veya içerik düzenlemesi eklemeyin.
2. Önce mevcut test/typecheck durumunu kaydedin; her davranış refactor'unda ilgili testleri çalıştırın.
3. Persistence anahtarları, Firestore yolları, yedek zarfı, sync sonuç ayrımları ve yayın politikalarını açıkça onaylanan değişiklik olmadan değiştirmeyin.
4. Başarısız veya ortam nedeniyle çalışmayan kontrolleri başarı gibi raporlamayın.
5. Bir refactor tamamlandığında mimari ve doğrulama belgelerini güncel sonuçlarla eşitleyin; eski logları yalnızca tarihsel kanıt olarak saklayın.

## Tamamlanma işaretleri

- Domain/application SDK yüklemeden test edilebilir.
- UI platform veri adaptörlerine doğrudan bağlanmaz.
- Import sınırları ve döngüler CI'da denetlenir; bilinmeyen kaynak klasörü serbest geçiş kapısı olamaz.
- Büyük işlevler uygun sorumluluk sınırlarıyla bölünmüştür veya cohesive oldukları gerekçeyle tutulmuştur.
- Davranış paketi ve platform doğrulamalarının son durumu açıkça kaydedilmiştir.

Domain/application ayrımı, SDK izolasyon testleri ve açık AST katman denetimi karşılanıyor. `AppBootstrap`'taki başlangıç katalog yükleme/zaman aşımı koordinasyonu ve uzun presentation/progress işlevleri ölçülü takip işidir; satır eşiği tek başına refactor zorunluluğu oluşturmaz. Güncel test sonucu ve puanlar [doğrulama kaydında](CLEAN_ARCHITECTURE_VERIFICATION.md) tutulur.

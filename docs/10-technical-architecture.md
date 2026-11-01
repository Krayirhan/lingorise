# LingoRise Teknik Mimari

**Güncelleme:** 5 Ekim 2026

## Teknoloji ve çalışma zamanı

LingoRise, Expo + React Native + TypeScript uygulamasıdır. Android ve iOS istemcileri aynı `src/` kod tabanını kullanır. Android application id ve iOS bundle id `com.lingterra.app` olarak yapılandırılmıştır.

Runtime mimarisinde Firebase Auth/Firestore uzak adaptörleri, AsyncStorage yerel adaptörü ve Expo bildirim/ses/paylaşım adaptörleri bulunur. Uygulama, içerik ve öğrenme akışlarının bir bölümünü bundled veriyle çevrimdışı sürdürebilir; tam remote/cache/bundled katalog sırası mimari referansta açıklanır.

## Katmanlar

- **Domain:** platformdan bağımsız modeller, öğrenme/ilerleme kuralları ve editorial politikaları.
- **Application:** kullanım senaryoları ile SDK'sız repository/gateway/clock/telemetry portları.
- **Infrastructure:** Firebase, AsyncStorage ve Expo servis adaptörleri.
- **Presentation:** ekran, feature, hook ve React state bağlantıları.
- **Composition:** uygulama örneğini ve adaptörleri bağlayan `src/app/AppBootstrap.tsx`.

Güncel bağımlılık grafiği, kurallar ve kalan düşük öncelikli iyileştirme [Clean Architecture referansında](CLEAN_ARCHITECTURE.md) tutulur. Doğrulama sonuçları [ayrı kayıtta](CLEAN_ARCHITECTURE_VERIFICATION.md) güncellenir.

## Mimari kalite kapısı

CI typecheck, mimari AST kontrolü, application regression testleri ve tam test paketini çalıştırır; ayrıca Firestore rules ve Android derleme/cihaz smoke işleri için ayrı job'lar tanımlıdır. Bir job'un workflow'da tanımlı olması, her yerel doğrulamada geçtiği anlamına gelmez. Son çalıştırma durumu verification belgesinde belirtilir.

Domain ve application kodu React/Firebase/AsyncStorage olmadan test edilir. Presentation, infrastructure adaptörlerini doğrudan import etmez. Mimari checker bilinmeyen source root'ları hata sayar ve katman kurallarıyla import çevrimlerini CI'da kontrol eder.

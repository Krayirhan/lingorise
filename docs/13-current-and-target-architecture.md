# Güncel ve Hedef Mimari

**Son güncelleme:** 5 Ekim 2026

Bu dosya mimari belgeler içindeki kısa Türkçe giriş ve yönlendirme sayfasıdır. Kanonik katman şeması, bağımlılık kuralları ve güncel boşluklar tek yerde tutulur:

- [Clean Architecture güncel referansı](CLEAN_ARCHITECTURE.md)
- [Doğrulama sonuçları, açık engeller ve puanlama](CLEAN_ARCHITECTURE_VERIFICATION.md)

## Güncel ürün/platform özeti

- Expo, React Native ve TypeScript kullanılır.
- Android ve iOS uygulama kimliği `com.lingterra.app` olarak tanımlıdır.
- Uygulama; onboarding, home, practice, progress, profile ve auth akışlarını içerir.
- İlerleme, öğrenme kuralları, hesap, katalog, senkronizasyon ve editorial kontroller domain/application/infrastructure katmanlarına ayrılmıştır.
- Yerel ve uzak persistence, Firebase, AsyncStorage ve platform servis adaptörleri üzerinden yürütülür.

## Bugünkü mimari kararı

Yeni işlevler Clean Architecture referansındaki yönlere uymalıdır: domain saf kalır; application kullanım senaryolarını ve portları sahiplenir; infrastructure portları platform SDK'larıyla uygular; presentation application arayüzünü çağırır; composition root bağımlılıkları bağlar.

`src/app/AppBootstrap.tsx` composition root olarak adaptörleri bağlar; giriş sonrası merge/refresh application use case'ine taşınmıştır ve AST checker bilinmeyen klasörleri reddeder. Bootstrap'ta başlangıç katalog yükleme/zaman aşımı ve navigator hazırlığı için kalan React yaşam döngüsü koordinasyonu takip edilecek iyileştirmedir.

## Eski MVP notu

22 Ağustos 2026 tarihli ilk mimari taslakta geçen “storage/backend henüz yok”, yalnızca A1 ve `App.tsx` odaklı ekran akışı gibi bilgiler tarihsel başlangıç durumuydu. Güncel kod yapısını veya runtime durumunu tanımlamaz; güncel bilgi için üstteki kanonik belgelere bakın.

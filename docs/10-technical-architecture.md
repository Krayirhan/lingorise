# LingoRise Teknik Mimari

## MVP teknoloji kararı

LingoRise MVP için **Expo + React Native + TypeScript** kullanılır. Bu seçim, Android ve iOS için tek bir uygulama kodu, hızlı cihaz üzerinde deneme ve Expo'nun ses/yerel depolama ekosistemine erişim sağlar. MVP'de backend yerine yerel, tip güvenli içerik verisi kullanılır.

## Katmanlar

- UI: React Native ekranları ve erişilebilir bileşenler
- Domain: seviye, soru, cevap, XP ve streak kuralları
- Content: A1 içerikleriyle başlayan TypeScript/JSON veri kümeleri
- Persistence: MVP sonrası `AsyncStorage`; hesap/senkronizasyon daha sonra backend ile

## MVP dışı bırakılanlar

Kimlik doğrulama, sosyal özellikler, ligler, ödeme, uzaktan içerik CMS'i ve gerçek ses servisi MVP'ye dahil değildir.

## Kalite hedefleri

TypeScript strict kontrolü, temel cevap akışı testi, küçük ve modüler ekranlar, çevrimdışı çalışabilecek içerik yapısı.

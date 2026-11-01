# LingoRise — S5 Ekran, Dil ve Erişilebilirlik Kanıtı

Tarih: 8 Eylül 2026  
Durum: Uygulama kapsamı tamamlandı.

## Kapatılan alanlar

- Türkçe ve İngilizce sözlük anahtarları birebir eşleşiyor; eksik veya fazladan anahtar yok.
- Ana butonlar minimum 52px, ikincil butonlar minimum 44px dokunma yüksekliğine sahip.
- Kritik etkileşimlerde `accessibilityRole`, `accessibilityLabel` ve gerekli `accessibilityState` kullanılıyor.
- Onboarding radio/switch akışları, sınav geri bildirimi, modal uyarıları ve alt navigasyon erişilebilirlik rollerini taşıyor.
- Sistem `reduceMotion` tercihi ve uygulama tercihi animasyonlarda uygulanıyor; modal, feedback, skeleton ve rozet akışları hareketi azaltabiliyor.
- TR/EN tarih, seviye, streak, rozet ve hata metinleri locale üzerinden üretiliyor.
- Ses ve hareket tercihleri practice, feedback ve modal bileşenlerine aktarılıyor.

## Kanıt

- `npm run typecheck` başarılı.
- `npm test` **433 başarılı / 0 başarısız**.
- Testlerde localization parity, touch target, accessibility scanner ve reduceMotion kontrolleri mevcut.

## Devredilen fiziksel kanıt

TalkBack, büyük yazı ölçeği, düşük güçlü cihaz ve farklı ekran yoğunlukları fiziksel cihaz doğrulamasında S6 kapsamındadır.


# LingoRise Güncel Durum ve Hedef Mimari

Bu dosya, LingoRise için proje içindeki ana teknik referanstır. Yeni bir karar alındığında bu doküman ve ilgili alt dokümanlar güncellenir.

## Güncel durum — 22 Ağustos 2026

- Platform: Expo + React Native + TypeScript
- Çalışan hedef: Android emülatörü ve Expo development build
- Paket adı: `com.lingorise.app`
- Uygulama adı: **LingoRise**
- Çalışan ekranlar: 3 adımlı onboarding, seviye seçimi, ana sayfa, Meaning Match ve Pick the Word
- Çalışan sistemler: seviye seçimi, XP, streak görünümü, soru ilerlemesi, doğru/yanlış geri bildirimi, oyun ekranı geri dönüşü
- İçerik: A1 örnekleri `src/content/questions/a1.ts` altında; ekran akışı `App.tsx` üzerinden çalışıyor
- Tema: `src/theme/colors.ts` içinde görsel token sistemi başlatıldı; eski isimler geçiş için alias olarak korunuyor
- Kalıcılık: henüz yok; uygulama yeniden başlatıldığında onboarding durumu korunmaz
- Backend/hesap: yok
- Sentence Builder: MVP'den çıkarıldı ve kullanıcıya gösterilmiyor

## Hedef mimari

```text
src/
  screens/       ekran kompozisyonları
  components/    tekrar kullanılabilir UI parçaları
  content/       seviyeler, sorular ve öğrenme içerikleri
  i18n/          arayüz çevirileri
  domain/        XP, streak, cevap değerlendirme ve ilerleme kuralları
  services/      storage, content ve ileride API erişimi
  theme/         renk, tipografi, spacing ve ortak stiller
  types/         ortak TypeScript modelleri
```

## Geçiş sırası

1. `App.tsx` içindeki kalan ekran metinlerini `src/i18n/en.ts` dosyasına taşı.
2. Seviyeleri `src/content/levels.ts` dosyasına taşı. **Tamamlandı.**
3. Soruları `src/content/questions/a1.ts` dosyasına taşı. **Tamamlandı.**
4. Onboarding, home ve game ekranlarını `src/screens/` altına böl.
5. XP, streak ve cevap kontrolünü `src/domain/` altına taşı.
6. Onboarding ve kullanıcı ilerlemesini `AsyncStorage` ile kalıcı yap.
7. İçerik hacmi büyüdüğünde API/CMS katmanına geç; UI sözleşmesini değiştirme.

## Mimari sınırlar

- Ekran bileşeni soru doğrulama veya XP hesabı yapmaz.
- İçerik dosyası renk, padding veya React Native bileşeni içermez.
- Çeviri dosyası öğrenme sorusu içermez.
- Domain katmanı React Native'e bağımlı olmaz.
- API'ye geçişte ekranlar doğrudan fetch çağrısı yapmaz; `services/` kullanılır.

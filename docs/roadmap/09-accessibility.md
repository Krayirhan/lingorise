# Birim 9 — Erişilebilirlik Doğrulaması

**Puan (mevcut durum):** 4/10 · **Öncelik:** P1 — yayın öncesi zorunlu

## Problem

Sprint 0-5 boyunca `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` özellikleri eklendi ve dokunma hedefleri 44×44pt'ye çıkarıldı (Sprint 1 madde #3.3). Ama:

- **TalkBack ile hiç test edilmedi.** Gerçek ekran okuyucu deneyimi bilinmiyor.
- Yeni eklenen modaller (`LevelPromotionModal`, `LevelSwitcherModal`, `QuestHistoryModal`) ekran okuyucuda nasıl duyuruluyor, odak sırası doğru mu — hiç doğrulanmadı.
- Renk kontrastı hesaplamaları (Sprint 3'te yapılan WCAG AA hesabı) sadece matematiksel olarak doğrulandı, gerçek cihazda büyütülmüş yazı tipi / yüksek kontrast modu ile test edilmedi.
- `reduceMotion` kullanıcı ayarı var (`userData.reduceMotion`) ama hangi animasyonların bu ayara saygı gösterdiği sistematik olarak taranmadı.

## Kapsam

### 9.1 — TalkBack ile tam akış testi (P1)

Gerçek bir Android cihazda TalkBack açık şekilde şu akışları test et:
- Onboarding baştan sona
- Ana ekran → pratik başlatma → soru cevaplama → sonuç ekranı
- Seviye seçici modalı açma, seçim yapma, kapatma
- Terfi kutlaması modalının duyurulması (görünür olduğu anda otomatik okunuyor mu?)
- Görev geçmişi modalı

Her akışta şunlar kontrol edilmeli:
- Her interaktif öğe TalkBack ile odaklanabiliyor mu?
- Etiketler anlamlı mı, yoksa "Button" gibi genel mi okunuyor?
- Modal açıldığında odak modalın içine giriyor mu (odak tuzağı doğru mu)?
- Modal kapandığında odak, modalı açan öğeye geri dönüyor mu?

### 9.2 — Dinamik yazı tipi boyutu testi (P1)

Android ayarlarından yazı tipi boyutunu maksimuma çıkarıp:
- Metinlerin kesilip kesilmediğini kontrol et.
- Butonların taşan metinle bozulup bozulmadığını kontrol et (özellikle `LevelSwitcherModal`'daki satırlar, `GardenHeroCard`'daki chip'ler).
- `numberOfLines` sınırlaması olan yerlerde (örn. konuşma balonu, Sprint 1'de düzeltilmişti) hâlâ okunabilir mi.

### 9.3 — Renk kontrastı gerçek cihaz doğrulaması (P2)

Sprint 3'teki matematiksel WCAG AA hesaplamaları (ana kart üzerindeki metin/buton kontrastları) bir kontrast ölçüm aracıyla (örn. Android Accessibility Scanner) gerçek ekranda doğrulanmalı — hesaplama ile gerçek render arasında (özellikle yarı saydam katmanlar, gölgeler) fark olabilir.

**Araç önerisi:** Google'ın [Accessibility Scanner](https://play.google.com/store/apps/details?id=com.google.android.apps.accessibility.auditor) uygulaması, ekranı tarayıp kontrast/dokunma hedefi sorunlarını otomatik raporlar.

### 9.4 — `reduceMotion` kapsamını tara (P2)

`userData.reduceMotion` ayarının hangi bileşenlerde kontrol edildiğini tara (`grep -rn "reduceMotion"`), Sprint 3-5'te eklenen yeni bileşenlerin (terfi kutlaması, seviye seçici) bu ayara saygı gösterip göstermediğini doğrula. Terfi kutlaması özellikle önemli — büyük bir modal, muhtemelen giriş animasyonu var, `reduceMotion` açıkken bu animasyon basitleşmeli.

### 9.5 — Otomatik erişilebilirlik testi CI'a ekle (P2, uzun vadeli)

`react-native-testing-library` ile temel erişilebilirlik kontrolleri (her `Pressable`'ın `accessibilityLabel`'ı var mı, minimum dokunma hedefi karşılanıyor mu) CI pipeline'ına eklenebilir — bu, gelecekteki regresyonları otomatik yakalar.

## Definition of Done

- [ ] TalkBack ile 5 ana akış test edildi, bulgular giderildi
- [ ] Dinamik yazı tipi maksimumda test edildi, kesilme/taşma sorunları giderildi
- [ ] Accessibility Scanner taraması yapıldı, kritik bulgular kapatıldı
- [ ] `reduceMotion` kapsamı yeni bileşenleri (Sprint 3-5) içerecek şekilde genişletildi
- [ ] (Opsiyonel) CI'da temel erişilebilirlik kontrolü kurulu

## Bağımlılıklar

- Yok — bağımsız, diğer birimlerden etkilenmez. Yayın öncesi zorunlu kontrol listesine (`12-launch-readiness-checklist.md`) girer.

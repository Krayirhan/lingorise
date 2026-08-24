# Birim 4 — Çok Günlü Doğrulama Altyapısı

**Puan (mevcut durum):** 3/10 · **Öncelik:** P0 — içerikten hemen sonra

## Problem

Bu sistemin bel kemiği olan davranışların **hiçbiri gerçek cihazda, gerçek zaman geçişiyle görülmedi**:

- Mastery'ye geçiş (3. gün doğru bilme → `distinctCorrectDays: 2`)
- Bahçenin gerçekten büyümesi (25, 75, 150, 275 eşiklerinin aşılması)
- Terfi kutlamasının tetiklenmesi (%80 mastery)
- Günlük devir (rollover) zincirinin arka arkaya, birden fazla gün boyunca doğru çalışması
- SM-2'nin uzun aralıklarının (21, 50, 125 gün) doğru hesaplanıp doğru zamanda tekrar sorulması

Hepsi **birim testiyle** doğrulandı — ki birim testleri benim yazdığım senaryoyu doğrular, gerçek kullanım örüntüsünü değil. Emülatör `adb root` production image olduğu için sistem saatini değiştirmeye izin vermiyor, dolayısıyla manuel cihaz testi bu konuda kör.

## Neden içerikten hemen sonra

İçerik gelmeden test edilecek gerçek bir seviye yok. Ama içerik gelir gelmez **ilk şey bu olmalı** — çünkü Birim 2 (Parametre Doğrulaması) ve Birim 3 (SRS v2) tamamen bu doğrulamanın güvenilir olmasına dayanıyor.

## Kapsam

### 4.1 — Dev/debug zaman kaydırma aracı (P0)

Uygulamaya, sadece `__DEV__` modunda aktif olan bir "zamanı ileri al" aracı ekle. Bu, `Date.now()` çağrılarını gerçek sistem saatinden değil, ayarlanabilir bir ofsetten okuyacak.

**Yaklaşım:**
```typescript
// src/utils/clock.ts (yeni dosya)
let devTimeOffsetMs = 0;

export function now(): number {
  return Date.now() + devTimeOffsetMs;
}

export function advanceDevClock(days: number): void {
  if (!__DEV__) return;
  devTimeOffsetMs += days * 24 * 60 * 60 * 1000;
}
```

Sonra kod tabanındaki tüm `Date.now()` çağrıları (`recordLearningOutcome`, `applyDailyRollover`, `scheduleNextReview`, `getDueReviewItems` vb.) bu merkezi `now()` fonksiyonuna geçirilmeli. Bu aynı zamanda **test edilebilirliği de artırır** — testler artık gerçek `Date.now()`'a bağımlı olmadan zaman simüle edebilir.

**Arayüz:** Profil ekranında, sadece dev build'de görünen "Zamanı 1 gün ilerlet" / "7 gün ilerlet" butonları.

### 4.2 — Otomatik çok günlü senaryo testi (P1)

`tests/testSuite.ts` zaten `applyDailyRollover`'ı doğrudan çağırarak "sahte gün" simüle ediyor (bkz. madde 19). Bunu genişlet:

- **7 günlük simülasyon**: Her gün 10-20 soru cevapla (karışık doğru/yanlış), `applyDailyRollover` çağır, her gün sonunda mastery/bahçe/görev durumunu kontrol et.
- **30 günlük simülasyon**: Gerçekçi bir kullanıcı örüntüsü (bazı günler atlanmış, bazı günler yoğun) simüle edip SM-2 aralıklarının makul bir dağılıma yol açtığını doğrula.

Bu, cihaz testinin yapamadığı ölçekte doğrulama sağlar — ama **gerçek kullanıcı davranışının yerini tutmaz**, sadece "kodun kendi mantığıyla tutarlı olduğunu" kanıtlar.

### 4.3 — Manuel QA için cihaz saati değiştirme prosedürü (P1, alternatif/tamamlayıcı)

Emülatör yerine **fiziksel bir Android cihazda** (kullanıcı erişimi varsa) sistem saati manuel değiştirilip gerçek uygulama davranışı gözlemlenebilir. Bu, 4.1'deki dev aracına göre daha "gerçek" ama daha yavaş bir doğrulama yoludur. İkisi birbirini tamamlar:
- Dev aracı → hızlı, tekrarlanabilir, geliştirme sırasında
- Gerçek cihaz saati → yayın öncesi son kontrol, gerçek OS/AsyncStorage davranışıyla

### 4.4 — Beta/staged rollout ile gerçek çok günlü veri (P1, Birim 5 ile birlikte)

En güvenilir doğrulama: küçük bir beta kullanıcı grubuna erken erişim verip Birim 5'teki telemetri ile gerçek çok günlü davranışı izlemek. Bu, hem 4.1 hem 4.2'nin ötesinde — **gerçek insanların gerçek unutma eğrisi**.

## Definition of Done

- [ ] Dev zaman kaydırma aracı çalışıyor, tüm `Date.now()` çağrıları merkezi `now()` üzerinden geçiyor
- [ ] En az bir 7 günlük ve bir 30 günlük otomatik simülasyon testi yazıldı
- [ ] Mastery geçişi, bahçe büyümesi, terfi kutlaması dev aracıyla gerçek cihazda gözlemlendi (ekran görüntüsüyle belgelenmiş)
- [ ] Beta grubu en az 2 hafta çok günlü gerçek kullanım verisi üretti

## Bağımlılıklar

- **Gerektirir:** Birim 1 (test edilecek gerçek içerik).
- **Bloke ettiği:** Birim 2 (Parametre Doğrulaması), Birim 3 (SRS v2) — ikisi de bu altyapı olmadan güvenilir şekilde ilerleyemez.

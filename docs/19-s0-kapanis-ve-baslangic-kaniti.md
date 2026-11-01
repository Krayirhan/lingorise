# LingoRise — S0 Kapanış ve Başlangıç Kanıtı

Tarih: 8 Eylül 2026  
Kaynak revizyonu: `b82a280546d9a2d5dd41781b842929df190e579a`  
Kapsam: S0 kararları, P0 yeniden üretim listesi, platform matrisi ve başlangıç envanteri.

## S0 kararı

S0 tamamlandı. Uygulama çalışmasına başlanacak kapsam ve kanıt sınırları aşağıdaki şekilde sabitlendi:

1. Öncelik sırası: veri kaybı/hesap karışması → yanlış XP veya sınav sonucu → oturum kurtarma → senkron/silme → erişilebilirlik ve yayın.
2. Yerel otomatik testler ürün davranışı için ilk kapıdır; cihaz, canlı Firebase ve mağaza kanıtı ayrıca doğrulanmadan “yayına hazır” kabul edilmez.
3. S1 çekirdek uygulaması tamamlanmıştır; S2’den itibaren hesap sahipliği, migration ve restart akışları bu sözleşmeyi koruyacaktır.
4. B1–C2 içerik genişletmesi çekirdek veri/öğrenme güvenilirliği kapanmadan başlatılmayacaktır.

## P0 yeniden üretim listesi

S0 taramasında yeni, doğrulanmış bir P0 arızası bulunmadı. Aşağıdaki senaryolar P0 kapısı olarak korunur ve her sprintte yeniden çalıştırılır:

| Kimlik | Senaryo | Beklenen sonuç | Mevcut kanıt |
|---|---|---|---|
| P0-01 | Aynı cevap iki kez gönderilir veya ekran hızlıca iki kez tıklanır | Tek puanlama ve tek XP etkisi | S1 submitted guard + 430 test |
| P0-02 | Cevap sonrası uygulama öldürülür ve yeniden açılır | Seçili/gönderilmiş cevap restore edilir, tekrar skorlanmaz | ActiveSession şeması + test |
| P0-03 | Eski katalogla kaydedilmiş oturum yeni katalogla açılır | Eski oturum güvenle restore edilmez | catalogVersion guard |
| P0-04 | İki cihaz aynı hesabı farklı ilerlemeyle açar | XP, sınav geçişi ve öğrenme kayıtları gerilemez | merge regression suite |
| P0-05 | Senkron hatasından sonra yeniden deneme yapılır | Hata görünür kalır; veri yokmuş gibi kör overwrite yapılmaz | remote-state decision tests |
| P0-06 | Hesap silme/reset akışı yarıda kesilir | Kullanıcı yanlış hesaba taşınmaz; silme sonucu belirsizse açıkça gösterilir | S3/S8 için açık takip |

P0-01–P0-03 için yerel kanıt vardır. P0-04–P0-06 için otomatik merge/karar testleri vardır; gerçek iki cihaz, canlı servis ve release artifact kanıtı S3/S6/S8 kapsamındadır.

## Desteklenen platform matrisi

| Platform | Geliştirme hedefi | S0 kararı | Doğrulama durumu |
|---|---|---|---|
| Android | Expo 56 / React Native 0.85.3, `minSdkVersion` Gradle root config’inden, package `com.lingorise.app` | Birincil hedef | Statik yapılandırma ve typecheck mevcut; fiziksel cihaz kanıtı S6’da |
| Android release | versionName `0.1.0`, versionCode `5`, EAS preview/production profilleri | Release adayı yolu açık | Temiz cihaz ve artifact doğrulaması S6/S8’de |
| iOS | Expo config’te bundle identifier mevcut | Koşullu hedef | Bu çalışma alanında iOS cihaz/CI kanıtı yok |
| Web | Expo web script’i mevcut | Geliştirici kolaylığı | Mobil ürün kabul kapısı olarak sayılmaz |

S0’da destek matrisi tanımlanmıştır; cihaz üzerinde “destekleniyor” iddiası S6 doğrulamasından önce yapılmayacaktır.

## Başlangıç envanteri

- Kaynak HEAD: `b82a280`.
- Çalışma kopyasında kullanıcı değişiklikleri korunuyor; S0 kapanışı bunları silmedi veya geri almadı.
- Expo uygulaması: `0.1.0`; Android versionCode `5`; iOS bundle identifier `com.lingorise.app`.
- İçerik kataloğu: `CONTENT_VERSION = 1.2.0`; testlerde 590 soru ve 6 seviye doğrulanıyor.
- Komutlar: `npm run typecheck`, `npm test`, `npm run test:rules`, `npm run test:e2e:smoke`, `npm run build:android:preview`, `npm run build:android:production`.
- Yerel son doğrulama: `npm run typecheck` başarılı; `npm test` **430 başarılı / 0 başarısız**.
- Tam çalıştırılmamış veya bu kapanışta kanıtlanmamış kontroller: fiziksel Android cihazı, iOS cihazı, Maestro smoke, Firestore emulator/rules ve temiz release artifact kurulumu.

## S0 çıkış kriteri

Davranış kararları yazılı, P0 takip senaryoları yeniden üretilebilir, platform sınırları açık ve mevcut kod/test envanteri kayıtlıdır. S1 tamamlanmış çekirdek kanıtıyla birlikte S2’ye geçiş yapılabilir.


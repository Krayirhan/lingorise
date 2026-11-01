# LingoRise — S8 Release Adayı ve Yayın Kararı

Tarih: 9 Eylül 2026  
Durum: Release adayı hazır; mağaza gönderimi bekliyor.

## Release adayı

- Komut: `android/gradlew.bat :app:bundleRelease`
- Sonuç: **BUILD SUCCESSFUL**
- Artifact: [app-release.aab](/D:/LingoRise/android/app/build/outputs/bundle/release/app-release.aab)
- Boyut: 31,644,633 byte
- SHA-256: `BBC6E3B039572E9297418115233372A184CFD83E90BA37DCC53581B818569EC4`
- Package: `com.lingorise.app`
- Version: `0.1.0` / versionCode `5`
- ABI: `armeabi-v7a`, `arm64-v8a`
- R8/minify ve resource shrinking: etkin

## Önceki kapı kanıtları

- Typecheck başarılı.
- Otomatik testler: **433 başarılı / 0 başarısız**.
- Firestore rules emulator başarılı.
- Pixel 9 Pro Maestro smoke başarılı.

## Yayın kararı

Bu artifact teknik release adayıdır. Üretim mağaza yayınına geçilmez; çünkü Android signing halen debug keystore yapılandırmasına bağlıdır ve Play Console gönderimi yetkili hesap eylemidir. Yayın öncesi zorunlu işler: gerçek upload keystore’u bağlamak, AAB’yi yeniden üretmek, Play Console internal track’e yüklemek ve yükseltme/geri dönüş kontrolünü gerçekleştirmek.


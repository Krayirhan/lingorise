# LingoRise — Madde Bazlı Uygulama Denetimi

Denetim tarihi: 23 Ağustos 2026  
Kanıt seviyesi: kaynak kod, TypeScript typecheck ve 44/44 birim assertion. Firebase/cihaz/production E2E çalıştırılmadığı için `K` veya `D` olarak işaretlenen maddeler üretimde doğrulanmış sayılmaz.

Durumlar: `T` kodda tamam · `K` kısmi · `E` eksik · `D` kod var, canlı ortamda doğrulanmamış.

## 1. Açılış ve onboarding

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Hoş geldin ekranı | T | `WelcomeStep` |
| Uygulamanın ne işe yaradığını anlatma | T | Hoş geldin başlık/metni |
| Seviye seçimi: A1–C2 | T | `LevelStep`, `levels` |
| Onboarding’i atlayabilme | T | Her iki ilk adımda skip |
| Onboarding tamamlandı bilgisini localde saklama | T | `onboardingCompleted`, AsyncStorage |
| Günlük hedef seçimi | K | UI seçimi var; `UserData`ya yazılmıyor |
| Bildirim izni isteme | E | Sadece Switch; izin/paket yok |
| Hesap açmadan devam et mesajı | T | `ReadyStep` metni |
| Verilerin cihazda tutulduğunu açıklama | T | `ReadyStep` ve profil metni |

## 2. Hesap sistemi

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Firebase Email/Password kayıt | D | `register()` Firebase çağrısı; canlı test yok |
| Firebase giriş | D | `login()` Firebase çağrısı; canlı test yok |
| Çıkış yapma | D | `logout()` / profil butonu |
| Misafir olarak devam etme | T | Auth ekranı ve `enableGuestMode()` |
| Misafir verilerini AsyncStorage’da saklama | T | `storage.ts` |
| Giriş yapan kullanıcıyı Firebase’e bağlama | D | `onAuthStateChanged` |
| Misafir verilerini hesap açınca Firebase’e aktarma | D | `mergeAndSyncUserData()` |
| Aynı e-posta ile tekrar girişte verileri birleştirme | D | XP/streak/set merge kodu |
| Şifre sıfırlama | D | `sendPasswordResetEmail` |
| Hesap silme | K | Kod var; Firebase recent-login koşulu ele alınmıyor |
| E-posta doğrulama | D | `sendEmailVerification` |
| Auth hatalarını Türkçe ve anlaşılır gösterme | T | `authErrors.ts`, testli |
| Firebase Auth persistence uyarısını çözme | K | RN AsyncStorage persistence kodu var; cihazda doğrulanmadı |

## 3. Global uygulama çatısı

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Global topbar | T | `GlobalTopBar` |
| Global bottom navbar | T | `GlobalBottomNav` |
| Topbar’ın ana ekranlarda ortak kullanımı | T | `GlobalAppLayout` |
| Navbar’ın yalnız ana ekranlarda gösterimi | T | Navigator shell |
| Onboarding’de navbar göstermeme | T | Shell dışında |
| Auth ekranında navbar göstermeme | T | Shell dışında |
| Kelime pratik ekranında navbar göstermeme | T | Shell dışında |
| Safe-area ve status-bar | T | `GlobalAppLayout`, ekranlar |
| Ortak yatay boşluklar | K | Çoğu 20px; tek merkezi layout tokenı yok |
| Pratik başlığı/topbar çakışması | T | Pratik shell dışında |
| Geri butonları yalnız gerektiğinde | K | Bazı ekran prop/handler’ları artık kullanılmıyor |

## 4. Ana sayfa — Bahçe

| Madde | Durum | Kanıt / Not |
|---|---|---|
| LingoRise topbar | T | `GlobalTopBar` |
| Streak göstergesi | T | Topbar/view model |
| Seviye seçici | T | Topbar → onboarding level adımı |
| Dil seçici | T | Topbar locale toggle |
| Bahçe durumu | T | Garden kartları/view model |
| Günün pratiği kartı | T | `DailyQuestCard` |
| XP ilerleme çubuğu | T | Garden progress |
| Kelime bilgisi ilerlemesi | T | `useHomeViewModel` |
| Günlük görevler | T | `dailyQuests` |
| Günün kelimesi | T | `RecommendedWordCard` |
| Rozetler | T | `BadgesCard` |
| Kelime detay modalı | T | `WordDetailModal` |
| Kelimenin sesini dinleme | T | `expo-speech` |
| Kelimeye özel pratik başlatma | T | `startPractice([matchQ])` |
| Hataları tekrar etme | T | due review → `startReview` |
| Ana sayfa verilerini gerçekten yenileme | K | Sadece local yükle + tekrar cloud write |
| Expo reload / veri yenilemeyi ayırma | T | refresh yalnız `userProgress.refresh` |
| Günlük görev geçmişi | E | Tarihçede görev geçmişi tutulmuyor |
| Tamamlanan görevleri görünür yapma | T | `completed` durumuna göre kart |
| Boş durum ekranları | K | Bazı kartlar; tüm veri kaynakları için değil |
| Bahçe seviye atlama animasyonu | E | Yok |
| Daha fazla bahçe görseli / bitki aşaması | K | 5 aşama verisi var; görsel çeşit az |

## 5. Pratik ana sayfası

| Madde | Durum | Kanıt / Not |
|---|---|---|
| “Bugün ne çalışmak istersin?” başlığı | T | `PracticeHubScreen` |
| Seviye, XP, streak, tekrar sayısı | T | Hub stat pill’leri |
| Önerilen pratik kartı | T | Hero card |
| Günün pratiğini başlatma | T | `startPractice()` |
| Hataları tekrar et kartı | T | Review card |
| Kelime bilgisi kartı | T | Vocab card |
| Alt navbar | T | Global shell |
| Global topbar | T | Global shell |
| Öneriyi gerçek kullanıcı durumuna göre hesaplama | T | `useHomeViewModel` |
| Hata yoksa hata kartı bilgisi | T | Empty review state |
| Çözülmemiş kelime yoksa tekrar akışı | T | `startPractice` fallback |
| Süre ve XP değerlerini doğru gösterme | K | Kartta sabit “2 dk/+40 XP”; gerçek hesapla bağlı değil |
| Kilitli içerik nedenleri | K | Dinleme “yakında” metni; genel kilit sistemi yok |
| “Bugün tamamlandı” durumu | T | daily quest state |
| Günlük hedef ilerlemesi | K | Görev ilerlemesi var; seçilen dakika hedefi yok |
| Pratik geçmişi | E | Hub’da gösterilmiyor |
| Tür ikon/renk standardı | T | Ionicon/kart stili |
| Ortak kart butonu component’i | K | `PrimaryButton` var; hub CTA’ları tekrar yazılmış |

## 6. Kelime pratik ekranı

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Kelime sorusu | T | `WordPrompt` |
| Cevap seçenekleri | T | `AnswerList` |
| Cevap kontrolü | T | `usePracticeSession` |
| Doğru/yanlış geri bildirimi | T | `FeedbackCard` |
| XP ödülü | T | `applyPracticeAnswer` |
| Sonraki soruya geçiş | T | `nextQuestion` |
| Tekrar deneme | T | `resetQuestionState` |
| Daha sonra hatırlatma | T | Bookmark → review queue |
| Sesli telaffuz | T | `expo-speech` |
| Oturum özeti | T | `SessionSummaryCard` |
| Günlük pratik ve tekrar modu | T | PRACTICE/REVIEW |
| Gerçek spaced repetition tarihi ile seçim | T | `nextReviewAt` / due filter |
| Tekrar sıklığını iyileştirme | K | Basitleştirilmiş 2s/1g/3g model |
| İlerleme göstergesi | T | `PracticeHeader` |
| Çıkış onay modalı | T | Android/web confirm |
| Seçili cevap state’i | T | `AnswerList` |
| Klavye ve erişilebilirlik | K | Label/hit area var; klavye navigasyonu yok |
| Hızlı geri bildirim animasyonları | T | Animated/vibration |
| Oturum yarıda kalırsa devam | E | Oturum state’i persist edilmiyor |
| Detaylı sonuç ekranı | K | Özet var; soru bazlı sonuç/inceleme yok |
| Yanlış cevapta kısa açıklama | K | Doğru cevap görünür; pedagojik açıklama veride yok |

## 7. Kelime içerik sistemi

| Madde | Durum | Kanıt / Not |
|---|---|---|
| A1–C2 seviye modeli | T | `LevelCode`, altı dosya |
| Yerel soru içeriği | T | `src/content/questions` |
| Kelime, anlam, konu ve seçenekler | T | Question tipi/veri |
| Soru verisi doğrulama | T | `validateQuestionDatabase`, testli |
| Kelimeye göre soru bulma | T | `findQuestionByWord` |
| Seviyeye göre filtreleme | T | `getQuestionsByLevel` |
| Konuya göre filtreleme | T | `getQuestionsByTopic` |
| Kelime örnek cümlesi | K | Alan bazı sorularda var; zorunlu doğrulama değil |
| Kelime türü | T | `partOfSpeech` |
| Telaffuz metni | T | `pronunciation` |
| İngilizce ses dosyaları | E | TTS var; ses dosyası yok |
| Kelime görseli | E | İçerik görsel alanı/asset yok |
| Kelime favorileme | E | Bookmark review queue’dur, favori değildir |
| Kelime arama | T | Notebook modal / `searchQuestions` |
| Kelime defteri | T | `WordNotebookModal` |
| A2–C2 içeriklerinin tamamlanması | E | Toplam sadece 28 soru |
| Firestore’dan içerik yönetimi | K | Seed/yazım kodu var; uygulama local catalog okur |
| İçerik versiyonlama | T | `CONTENT_VERSION` |
| Eksik/hatalı içerik kontrol paneli | E | Sadece CLI tarzı test; panel yok |

## 8. İlerleme ekranı

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Genel XP | T | Hero stats |
| Streak | T | Hero stats |
| Bahçe ilerlemesi | T | Stage bilgisi |
| Toplam çözülen soru | T | `solvedQuestionIds` |
| Seviyelere göre ilerleme | T | Navigator hesaplaması |
| Konu dağılımı | T | Gerçek solved-topic sayımı |
| Seviye ustalık kartları | T | `LevelMasteryCard` |
| Haftalık grafik | T | `WeeklyActivityCard` |
| Günlük çalışma süresi | E | Süre tutulmuyor |
| Doğru cevap oranı | E | Tarihçe correct tutuyor ama ekranda oran yok |
| En çok hata yapılan kelimeler | E | Queue var; rapor/kart yok |
| Son 7 gün aktivitesi | T | History’den grafik |
| Seviye bazlı kelime ilerlemesi | T | Level mastery |
| Placeholder alanlarını kaldırma | K | Sıfır konu için sabit örnek başlıklar var |
| Gerçek veriden hesaplanan istatistikler | K | Çoğu gerçek; bazı boş-state/sabit metinler var |
| İlerleme animasyonları | E | Yok |

## 9. Profil ekranı

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Profil istatistikleri | T | `ProfileStatsCard` |
| XP ve streak | T | Profile stats |
| Seviye değiştirme | T | Onboarding level step |
| Dil değiştirme | T | `LanguageSettingsCard` |
| Rozet listesi | T | `BadgesCard` |
| Hesap oluşturma/giriş kartı | T | Account card |
| Çıkış altyapısı | D | Firebase `signOut`; canlı test yok |
| Kullanıcı adı düzenleme | E | Kayıtta var; düzenleme yok |
| Avatar seçimi | E | Yok |
| Şifre değiştirme | E | Reset var, change password yok |
| Şifre sıfırlama | D | Firebase çağrısı var |
| Hesap silme | K | Kod var; reauth/uzak alt veriler eksik olabilir |
| Verileri dışa aktarma | K | JSON modal, dosya/paylaşım yok |
| Yerel verileri temizleme | K | AsyncStorage temizleniyor; React state refresh bağlanmamış |
| Firebase senkronizasyon durumu | K | Sadece `auth.currentUser` kontrolü |
| Gizlilik ve kullanım şartları | T | Modal metni |
| Hakkında ekranı | K | Kart metni, ayrı ekran yok |
| Bildirim ayarları | E | State-only Switch |
| Ses/animasyon ayarları | K | State-only Switch |

## 10. Veri ve Firebase

| Madde | Durum | Kanıt / Not |
|---|---|---|
| AsyncStorage kurulumu | T | Bağımlılık ve storage service |
| İlerlemeyi localde saklama | T | `saveUserData` |
| Misafir modu | T | Guest mode key |
| Streak saklama | T | `UserData` |
| XP saklama | T | `UserData` |
| Çözülen soruları saklama | T | `solvedQuestionIds` |
| Hata kuyruğunu saklama | T | `reviewQueue` |
| Rozetleri saklama | T | `unlockedBadges` |
| Local veri migration sistemi | T | v1 → v2 |
| Bozuk veri kurtarma | K | Default fallback; bozuk değer ayrıntılı temizlenmiyor |
| Local veri sıfırlama | T | clear/reset fonksiyonları |
| Versiyon numarası | T | `STORAGE_VERSION`, `CONTENT_VERSION` |
| Firestore database oluşturuldu | D | Config/rules var; konsol kanıtı yok |
| users yapısı | D | Kod/rules mevcut |
| users/{uid}/progress/main | D | sync kodu |
| levels altyapısı | D | seed kodu/rules |
| questions altyapısı | D | seed kodu/rules |
| Günlük görev koleksiyonu | K | Reference var, yazma/okuma/rule yok |
| Gerçek katalog seed işlemini çalıştırma | E | Script var; çalıştırma kanıtı yok |
| Firestore’da levels kayıtları | D | Seed hazırlıyor; uzak doğrulama yok |
| Firestore’da questions kayıtları | D | Seed hazırlıyor; uzak doğrulama yok |
| Kullanıcı kayıtları gerçekten yazılıyor | D | Kod var; entegrasyon kanıtı yok |
| Misafirden hesaba aktarım | D | Kod var; entegrasyon kanıtı yok |
| Firestore offline cache | E | Açık konfigürasyon/test yok |
| Kullanıcı bazlı güvenlik kuralları | T | `firestore.rules` users/progress |
| Yalnız sahibin verisini okuyabilmesi | T | uid eşitlik kuralı |
| İçeriğin public salt-okunur olması | T | question/levels rules |
| Admin yazma sınırı | K | Client write false; Admin SDK varsayımı |
| Firebase App Check | E | Yok |
| Firestore index kontrolü | E | `firestore.indexes.json` yok |
| Firebase kullanım/limit takibi | E | Yok |

## 11. Navigasyon

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Bahçe ekranı | T | `HomeScreen` |
| Pratik ekranı | T | `PracticeScreen` |
| İlerleme ekranı | T | `ProgressScreen` |
| Profil ekranı | T | `ProfileScreen` |
| Pratik hub ekranı | T | `PracticeHubScreen` |
| Oyun ekranı | T | `PracticeScreen`; `GameScreen` re-export |
| Onboarding | T | `OnboardingScreen` |
| Auth ekranı | T | `AuthScreen` |
| Global navigasyon shell’i | T | `AppNavigator`/layout |
| Ekran geçiş animasyonları | E | Yok |
| Android geri tuşu | K | Practice/progress var; tüm akışlar kapsanmıyor |
| Pratikten çıkışta onay | T | `Alert`/confirm |
| Onboarding’den geri dönüş | K | UI geri var; Android hardware yönetişimi yok |
| Auth ekranından geri dönüş | T | `onBack` |
| Deep link altyapısı | E | Yok |

## 12. Tasarım sistemi

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Krem arka plan | T | `C.canvas` |
| Bordeaux ana renk | T | tokens |
| Altın aksiyon rengi | T | `C.reward` |
| Yeşil başarı rengi | T | success tokens |
| Yuvarlatılmış kart sistemi | T | radius tokens |
| Büyük başlıklar | T | ekran stilleri |
| Alt navbar | T | GlobalBottomNav |
| Renkleri token üzerinden kullanma | K | Çoğu token; hard-coded renkler de var |
| Topbar standardı | T | GlobalTopBar |
| Buton yükseklikleri | K | Primary 52, bazı CTA 38/40/44/46 |
| Kart paddingleri | K | Çoğu 16/20, tam standardizasyon yok |
| Border/shadow standardı | K | Tekrar eden manuel değerler |
| Disabled/loading/pressed/error state | T | Primary/Auth/Answer states |
| Tipografi hiyerarşisi | T | Ekran stilleri |
| Küçük ekran uyumluluğu | K | Scroll/max width var; cihaz testi yok |
| Tablet uyumluluğu | K | maxWidth var; layout test yok |
| Kontrast/erişilebilirlik kontrolü | K | Etiketler var; ölçümlü audit yok |
| İkon boyutu standardı | K | Değerler manuel değişiyor |
| Metin taşma kontrolü | K | Scroll/flex var; test yok |
| Loading skeleton ekranları | E | Spinner var, skeleton yok |
| Toast/snackbar | T | `ToastContext` |

## 13. Hata yönetimi

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Error boundary | T | `ErrorBoundary` |
| Firebase auth hata yakalama | T | AuthScreen + map |
| Geliştirici hata ekranı | K | Boundary fallback var; ayrı dev ekranı yok |
| INTERNAL ASSERTION FAILED Auth çözümü | K | persistence fallback var; kök hata testi yok |
| Firebase bağlantı kopması mesajı | K | Auth mapping; Firestore için kullanıcı mesajı yok |
| Offline çalışma mesajı | E | Yok |
| Firestore yazma hatası retry | E | Yok |
| Boş soru havuzu hatası | K | Fallback var; kullanıcı mesajı yok |
| Bozuk local data temizleme | K | Default fallback var |
| Teknik hatayı kullanıcıya göstermeme | K | Auth iyi; bazı profil alert’leri `e.message` gösteriyor |
| Merkezi logger | K | `logger.ts` var ama yaygın kullanılmıyor |
| Production debug loglarını kapatma | K | debug/info kapalı; warn/error açık |

## 14. Ses ve erişilebilirlik

| Madde | Durum | Kanıt / Not |
|---|---|---|
| Kelime telaffuzu | T | `expo-speech` |
| Ses butonu | T | `WordPrompt` |
| Ses yükleniyor durumu | T | `isSpeaking`/pulse |
| Ses oynatma hatası | T | `audioError` |
| Sessiz mod davranışı | E | Uygulama ayarı sisteme bağlı değil |
| Reduce motion desteği | T | `AccessibilityInfo` |
| Screen reader etiketleri | K | Çok sayıda label; tam audit yok |
| Dokunma alanlarını büyütme | K | Bazı hitSlop/minHeight; tüm kontroller değil |
| Renk dışında doğru/yanlış göstergesi | T | Metin/icon/feedback |
| Büyük yazı desteği | K | RN sistem font scaling varsayılan; test yok |
| Kontrast modu | E | Yok |

## 15. Test listesi

| Madde | Durum | Kanıt / Not |
|---|---|---|
| TypeScript typecheck | T | `npm run typecheck` geçti |
| Soru verisi testleri | T | 28 soru validation geçti |
| XP hesaplama testleri | T | Garden/quest assertion’ları |
| Streak testleri | K | Aynı gün testi var; sınır durumları yok |
| Spaced repetition testleri | T | 1./2./3. tekrar testli |
| Auth kayıt testi | E | Firebase emulator/canlı test yok |
| Auth giriş testi | E | Yok |
| Misafir modu testi | K | Serialization var; gerçek AsyncStorage akışı yok |
| Misafirden hesaba geçiş testi | K | Manuel merge simülasyonu; servis çağrısı yok |
| Firestore sync testi | E | Yok |
| Yeniden açılınca local veri testi | E | Yok |
| Android geri tuşu testi | E | Yok |
| Küçük ekran testi | E | Yok |
| Offline testi | E | Yok |
| Firebase hata testi | K | Sadece auth hata metni map’i |
| Expo Go temiz kurulum testi | E | Yok |
| Production build testi | E | Yok |

## Doğrulama çıktısı

```text
npm run typecheck  → başarı
npm test           → 44 passed, 0 failed
```

Bu rapor, mevcut kaynak ağacının denetimidir; Firebase Console, gerçek Android cihazı ve App Store/Play production build kanıtı sunmaz.

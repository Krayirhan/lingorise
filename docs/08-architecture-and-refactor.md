# LingoRise Mimari Kuralları ve Refactor Planı

## 1. Mevcut durum denetimi

Graphify code-only taraması 38 kod dosyasında 235 node ve 415 edge çıkardı. En yoğun düğümler:

- `App.tsx`: uygulama akışı, onboarding/home/game routing, kullanıcı state'i, XP/streak/review işlemleri ve içerik seçimi aynı yerde.
- `src/screens/GameScreen.tsx`: oyun state'i, cevap değerlendirme, seslendirme, ipucu, tekrar kuyruğu, animasyonlar, erişilebilirlik ve yaklaşık 300 satırlık JSX/stil aynı dosyada.
- `src/screens/HomeScreen.tsx`: ekran sunumu ile bahçe özeti, görev kartları ve ilerleme hesaplarının bir kısmı aynı dosyada.
- `src/content/questions/index.ts`: tüm seviye içeriklerini tek export noktasında topluyor; içerik büyüdükçe katalog sorumluluğu artacak.
- `src/i18n/en.ts`: İngilizce ve Türkçe tüm ürün metinlerini tek dosyada tutuyor; bu MVP için kabul edilebilir, ancak ekran kopyası büyüdükçe domain bazlı ayrıştırılmalı.

Tespit edilen import cycle yok. Bu iyi bir başlangıç noktasıdır.

## 2. Hedef mimari

```text
App.tsx
  ├─ app/AppNavigator.tsx          ekran geçişi
  ├─ app/AppBootstrap.tsx          storage yükleme ve başlangıç
  ├─ state/useUserProgress.ts      XP, streak, review, görevler
  └─ state/usePracticeSession.ts   aktif oyun oturumu

screens/
  ├─ OnboardingScreen.tsx          ekran kompozisyonu
  ├─ HomeScreen.tsx                ekran kompozisyonu
  └─ PracticeScreen.tsx             oyun ekranı kompozisyonu

features/
  ├─ home/components/              GardenHero, SkillProgress, QuestCard
  ├─ practice/components/          PracticeHeader, WordPrompt, AnswerList, FeedbackCard
  ├─ practice/hooks/               usePracticeQuestion, useSpeech, usePracticeFeedback
  └─ onboarding/components/        WelcomeStep, GoalStep, LevelStep

domain/
  ├─ content/                      question modelleri ve katalog erişimi
  ├─ gamification/                 XP, bahçe aşaması, rozetler
  ├─ review/                       spaced repetition ve review queue
  └─ localization/                 locale modelleri ve metin erişimi

shared/
  ├─ components/                  PrimaryButton, AppHeader, AnswerOption
  ├─ hooks/                        useReducedMotion, useMounted
  ├─ theme/                        renk, spacing, typography, radius
  └─ utils/                        formatters ve küçük saf yardımcılar
```

## 3. Sorumluluk sınırları

### App.tsx

Sadece bootstrap, navigator ve feature state hook'larını birleştirir. Aşağıdakiler App.tsx'ten çıkarılmalıdır:

- tek tek soru seçme algoritmaları
- XP/streak/review mutation detayları
- ekran içi JSX
- localization fallback'leri

### Practice feature

Oyun türü büyüyebileceği için `Meaning Match` davranışı ekran isminden ayrılmalıdır. `PracticeSession` soru, seçim, sonuç ve ilerleme durumunu taşır; ekran sadece bunu görüntüler.

### Domain katmanı

Domain servisleri React veya React Native import edemez. Saf TypeScript fonksiyonları olarak kalır ve test edilebilir olur.

### UI katmanı

Component'ler gamification veya storage servisine doğrudan erişemez. Veriyi props veya feature hook'undan alır.

## 4. Refactor sırası

Refactor tek seferde büyük dosya değişimi olarak yapılmayacaktır. Her adımda typecheck ve test çalıştırılacaktır.

1. `App.tsx` içinden kullanıcı ilerleme state'ini `src/state/useUserProgress.ts` içine taşımak.
2. `GameScreen.tsx` içinden ses işlevini `src/features/practice/hooks/useSpeech.ts` içine taşımak.
3. `GameScreen.tsx` içinden cevap/feedback state'ini `usePracticeSession.ts` içine taşımak.
4. Oyun JSX'ini `features/practice/components` altında beş küçük bileşene bölmek.
5. `HomeScreen.tsx` içindeki kartları feature component'lerine ayırmak.
6. Navigation kararlarını `AppNavigator.tsx` içine almak.
7. Localization dosyasını `localization/onboarding.ts`, `home.ts`, `practice.ts`, `system.ts` olarak ayırmak.
8. Her aşamada eski public prop sözleşmesini koruyarak ekranları kırmadan ilerlemek.

## 5. God file kabul kriterleri

- Ekran dosyası hedefi: 250 satırın altında.
- Tek component hedefi: 120 satırın altında.
- Bir dosyada tek ana sorumluluk.
- UI component'lerinde storage/service import'u yok.
- Domain servislerinde React import'u yok.
- Yeni özellik eklemek mevcut ekran dosyasına 50 satırdan fazla eklememeli.
- Her state hook'u kendi davranışını ve testini taşımalı.

## 6. Korunacak davranışlar

- Türkçe ve İngilizce key parity.
- Meaning Match akışı ve yanlış cevap tekrar kuyruğu.
- XP, streak, rozet ve bahçe ilerlemesi.
- Onboarding seviyesinin kalıcı saklanması.
- Sistem TTS kullanımı.
- Android emülatöründe mevcut güvenli alan ve geri tuşu davranışı.

## 7. Refactor dışında tutulacaklar

Bu aşamada yeni oyun modu, backend, arkadaş sistemi, ligler veya yeni görsel özellik eklenmeyecek. Amaç mevcut MVP davranışını koruyarak kod sahipliğini ve test edilebilirliği iyileştirmektir.

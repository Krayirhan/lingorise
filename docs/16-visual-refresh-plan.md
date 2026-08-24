# LingoRise Görsel Yenileme Planı

## Karar

LingoRise için yön: **enerjik, güven veren ve yetişkin kullanıcıya uygun oyunlaştırılmış öğrenme**.

Mevcut mor marka rengi korunur; ancak arayüz yalnızca mor-lacivert olmaktan çıkarılır. Sarı ödül/XP, yeşil başarı ve mercan dikkat rengi olarak kullanılır.

## Görsel hedef

Kullanıcı uygulamayı açtığında şunu hissetmeli:

> “Birkaç dakikada ilerleme kaydedebilirim ve bu sıkıcı bir ders değil.”

Çocukça çizgi film estetiğinden, soğuk kurumsal dashboard görünümünden ve aşırı boş ekranlardan kaçınılır.

## Renk sistemi

### Temel token'lar

| Token | Renk | Kullanım |
|---|---|---|
| `canvas` | `#F8F7FF` | Ana arka plan |
| `surface` | `#FFFFFF` | Kartlar ve paneller |
| `ink` | `#17213A` | Başlık ve ana metin |
| `muted` | `#667085` | Yardımcı metin |
| `primary` | `#6C63FF` | Ana aksiyon ve ilerleme |
| `primarySoft` | `#EAE8FF` | Seçili/arka plan durumu |
| `reward` | `#FFC857` | XP, ödül ve rozet |
| `success` | `#35C98B` | Doğru cevap ve tamamlandı |
| `attention` | `#FF7A6B` | Hata ve dikkat |
| `streak` | `#FFB84D` | Seri göstergesi |

### Kullanım kuralları

- Bir ekranda birincil renk + en fazla iki vurgu rengi kullanılır.
- Kırmızı yalnızca hata için kullanılır; marka rengi yapılmaz.
- Metin kontrastı erişilebilirlik kontrolünden geçer.
- Renk tek başına anlam taşımaz; ikon veya metinle desteklenir.

## Tipografi

- Büyük başlıklar: güçlü, yuvarlak ve kısa.
- Gövde metni: rahat okunur, 15-17px aralığı.
- Yardımcı etiketler: küçük harf aralığı yüksek, ancak aşırı kullanılmaz.
- Bir ekranda en fazla üç yazı ağırlığı kullanılır.
- Başlıklar kısa tutulur; iki satırı aşan metinler yeniden yazılır.

## Bileşen sistemi

### AppHeader

Logo, streak ve seviye/profil pill’i içerir. Ekranlar arasında aynı hizada kalır.

### QuestCard

Günlük görevin adı, tahmini süre, adım sayısı, ilerleme çubuğu ve tek aksiyon içerir.

### XPCard

XP değeri, sonraki seviyeye ilerleme ve ödül görseli içerir. Mor arka plan + sarı ödül vurgusu kullanır.

### LevelCard

Seviye kodu, seviye adı, kısa açıklama, seçili durumu ve sağ ok içerir. Seçili kart mor çerçeve ve yumuşak mor arka plan alır.

### AnswerOption

Varsayılan, pressed, selected, correct ve incorrect durumları ayrı tasarlanır. Cevap sonrası açıklama alanı görünür.

### PrimaryButton

Ekranda tek ana buton bulunur. Disabled durumu belirgin ama erişilebilir kalır.

## Ekran planı

### Onboarding

1. Karşılama ve ürün vaadi
2. Günlük hedef seçimi
3. Seviye seçimi

Her adımda ilerleme noktaları ve tek ana aksiyon bulunur. İllüstrasyon alanı boşluğu azaltır.

### Ana sayfa

Öncelik sırası:

1. Kullanıcı bağlamı: selamlama, streak, seviye
2. Bugünün ana görevi
3. XP/ilerleme özeti
4. Diğer pratik modları

Ana sayfada ilk bakışta yalnızca bir ana görev öne çıkarılmalıdır.

### Oyun ekranı

Üstte geri, ilerleme ve soru sayacı. Ortada soru. Altta cevap seçenekleri ve açıklama. Gereksiz dekoratif alan kullanılmaz.

### Sonuç ekranı

Skor, kazanılan XP, doğru cevap oranı ve bir sonraki aksiyon görünür. Kullanıcı ya ana sayfaya döner ya hatalarını tekrar eder.

## Hareket sistemi

MVP'de yalnızca küçük ve işlevsel animasyonlar:

- Kart seçilince hafif scale feedback
- Doğru cevapta kısa success pulse
- XP artışında sayı animasyonu
- İlerleme çubuğunda yumuşak geçiş
- Ekranlar arası sade slide/fade

Animasyonlar öğrenme hızını veya erişilebilirliği engellemez.

## Uygulama sırası

1. Theme token'larını güncelle.
2. Ortak `AppHeader`, `PrimaryButton`, `QuestCard`, `LevelCard`, `AnswerOption` bileşenlerini çıkar.
3. Onboarding'i yeni renk ve illüstrasyon alanıyla yenile.
4. Ana sayfayı günlük görev merkezli düzenle.
5. Oyun ve sonuç ekranlarında durum tasarımlarını uygula.
6. Küçük animasyonları ekle.
7. Android emülatörde küçük/orta/büyük ekran kontrolü yap.
8. Kontrast, taşma, dokunma alanı ve geri dönüş akışını test et.

## Başarı kriterleri

- Kullanıcı 3 saniye içinde ana görevi bulur.
- Seviye seçimi ve seviye değiştirme akışı nettir.
- Ana sayfa boş veya kurumsal dashboard gibi görünmez.
- Doğru/yanlış cevap durumu ilk bakışta anlaşılır.
- Her ana ekranda birincil aksiyon bellidir.
- UI metinleri ve öğrenme içeriği `App.tsx` içine geri dönmez.

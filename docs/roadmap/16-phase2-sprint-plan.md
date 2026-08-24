# Faz 2 Sprint Planı — Birim 13-20'nin Sprint'lere Dağılımı

Bu dosya, [15-phase2-roadmap.md](15-phase2-roadmap.md)'deki 8 birimin (13-20) somut sprint'lere dağılımını tutar — `13-sprint-plan.md`'nin S0-S12'yi ele aldığı gibi, bu da S13'ten başlar. **S13 tamamlandı**, kalan sprintler henüz yürütülmedi.

## Neden bu sırayla

Faz 2A (S13-S15) hiçbir gerçek kullanıcı verisi gerektirmiyor — sadece araç kurulumu (ikinci cihaz, Google hesabı) ve insan kararı (hukuki inceleme) istiyor, bu yüzden hemen art arda yürütülebilir. Faz 2B (S16+) yayına çıkmış olmayı ve ardından haftalar süren bir takvim beklemeyi gerektiriyor — bu yüzden kod sprint'i olarak değil, bir *süreç* olarak planlandı.

## Sprint Planı

### S13 — Mağaza ve Hukuki Uygunluk

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 13 §13.1 | Google Play Data Safety formu — toplanan veri, paylaşım beyanı |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 13 §13.2 | Gizlilik politikasını herkese açık bir URL'de yayınla |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 13 §13.3 | Hesap silme akışını mağaza politikası diliyle çapraz kontrol et |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 13 §13.4 | Satın alma/reklam beyanlarını doğrula |

**4 kalem · bağımsız, hemen başlanabilir, tek gerçek yayın engelleyicisi aday**

## S13 — Tamamlandı (kanıtlı)

| Kaynak | Kalem | Kanıt |
|---|---|---|
| Birim 13 §13.1 | Data Safety formu çalışma sayfası | [17-data-safety-worksheet.md](17-data-safety-worksheet.md) — kod denetimine dayalı, Play Console'un tüm kategorilerine cevap hazır. **İnsan adımı kalan kısım:** Play Console'a geliştirici hesabıyla girilmesi — Claude'un erişimi yok |
| Birim 13 §13.2 | Gizlilik politikası içeriği yazılıp yayınlandı, uygulamadan bağlandı | https://claude.ai/code/artifact/90a36725-0440-4caf-b2ca-5b26212c2b11 — kodun gerçek davranışına dayalı, mağazanın zorunlu tuttuğu bölümleri (veri saklama, çocuk gizliliği, üçüncü taraf detayı) içeriyor. **Cihazda test ederken gerçek bir bulgu ortaya çıktı**: Claude Artifact'ları varsayılan private — "yayınlandı" "herkese açık" anlamına gelmiyor. Uygulama içi linki tıklayıp "Page not found / Sign in" ile karşılaştım. **Açık kalan insan adımı:** artifact'in paylaşım menüsünden "Herkese açık" seçilmeli (tek tıklık, URL değişmiyor) |
| Birim 13 §13.3 | Hesap silme akışı denetlendi | **Gerçek bir hata bulundu ve düzeltildi**: `deleteUserData()` hesap silindiğinde `users/{uid}/items/*` alt koleksiyonunu (kullanıcı başına en fazla 590 belge) hiç silmiyordu — "Hesabımı Kalıcı Olarak Sil" tam silme vaat edip vermiyordu. 500'lük batch'ler halinde tüm alt koleksiyonu da silecek şekilde düzeltildi |
| Birim 13 §13.4 | Reklam/IAP beyanı doğrulandı | `package.json` ve `src/**` içinde admob/iap/purchase/billing araması — hiçbiri yok. Data Safety formunda "hayır" olarak işaretlenebilir |

**Ek olarak:** Uygulama içi Gizlilik modaline ("Profil → Veri ve Gizlilik") gerçek yayınlanan URL'ye giden bir "Web'de tam metni görüntüle" bağlantısı eklendi — uygulama içi ve herkese açık metin artık aynı kaynağa işaret ediyor.

**Testler: 235 (değişmedi — bu sprint mağaza/hukuki denetim ve bir veri-silme hata düzeltmesiydi, yeni domain mantığı eklemedi).** TypeScript: temiz. Release APK cihazda derlendi ve test edildi.

**Açık kalan, insan gerektiren adımlar:** (1) Artifact'ın paylaşım menüsünden "Herkese açık" yapılması — kullanıcı bu seçeneği seçti, tek tıklık bir işlem olarak bekliyor; (2) Data Safety formunun Play Console'a girilmesi; (3) gizlilik politikasının nihai olarak kendi alan adına taşınması (opsiyonel).

### S14 — Gerçek Çoklu Cihaz Senkron Testi

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 14 §14.1 | İkinci emülatör/cihaz kurulumu, aynı hesapla giriş |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 14 §14.2 | Cihaz A offline pratik, Cihaz B online farklı pratik |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 14 §14.3 | Cihaz A'yı online yap, canlı senkronu gözlemle |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 14 §14.4 | Aynı kelimede çakışma — serverSyncedAt tie-break'i canlı doğrula |

**4 kalem · ikinci bir emülatör/cihaz kurulumuna bağımlı, S13 ile paralel yürütülebilir**

### S15 — Erişilebilirlik Tarayıcı + Dev Ortam Onarımı

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 15 §15.1-15.4 | Accessibility Scanner kurulumu, tam ekran taraması, bulgu kapatma |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 16 §16.1-16.3 | Debug+Metro bağlantı sorununun kök nedeni, onarımı, DevClockCard'ın interaktif doğrulanması |

**7 kalem · Birim 15 bir Google hesabına, Birim 16 sadece zamana bağımlı — ikisi de S13-S14 ile paralel yürütülebilir**

---

**Faz 2A burada biter.** S13-S15 tamamlandığında yayın için "Koşullu Hazır" durumu "Hazır"a döner — üç birim de kod değişikliği değil, doğrulama/kurulum/karar işiydi.

---

### S16 — Gerçek Analitik Altyapısı

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 17 §17.1 | Native analitik SDK'sı kur (Firebase Analytics native ya da PostHog/Amplitude alternatifi) |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 17 §17.2 | `telemetry.ts`'in `emit()`'ini gerçek sink'e bağla |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 17 §17.3 | Temel retention/funnel dashboard'u kur |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 17 §17.4 | `migration_applied` verisini bir hafta biriktirmeye başla |

**4 kalem · yayına çıkmış olmayı gerektirir — Faz 2B'nin ilk ve tek "kod sprint'i"**

### S17 — Veri Birikim Süreci (kod sprint'i değil, takvim adımı)

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 18 (adım 1-2) | Yayına çık, S16'nın dashboard'unu izlemeye başla, 2-4 hafta bekle |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 19 (adım 1) | Aynı süre boyunca `inferredQuality` dağılımını gözlemle |

**Kod içermez · bu sprint'in "tamamlanması" bir PR değil, bir tarih**

### S18 — Parametre Kalibrasyonu + SM-2 Kararı

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 18 (adım 3-5) | `14-parameter-calibration-log.md`'yi gerçek veriyle doldur, tek parametre değiştir, gerekçesiyle logla |
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 19 (adım 2-4) | Sinyal anlamlıysa SM-2 v2'yi aç (küçük yüzde veya tek kollu), ya da ikili modeli resmen yeterli bulup kapat |

**2 birim, veriye dayalı karar · her ikisi de "değişiklik yapmamak" da dahil geçerli bir sonuçla bitebilir**

### Sürekli — Migration Kod Temizliği

| Kaynak | Kalem |
|---|---|
| [15-phase2-roadmap.md](15-phase2-roadmap.md) Birim 20 §20.1-20.2 | Telemetri sıfır göç gösterince eski kodu sil, kalanı izole fonksiyonlara ayır |

**Sabit bir sprint'e bağlı değil · aylar süren telemetri birikimi + düşük öncelik**

## Öncelik sırası

1. **S13** — tek başına yayını bloklayabilecek tek kalem, kod gerektirmiyor.
2. **S15** — mağaza politikaları bunu talep edebilir.
3. **S14** — düşük olasılıklı ama yüksek etkili bir veri kaybı riskini kapatıyor.
4. **S16** — yayına çıkar çıkmaz başlanmalı, S17'nin önkoşulu.
5. **S17-S18** — kendi doğal takviminde, zorlanamaz.
6. **Sürekli** — arka planda, aylar içinde kendiliğinden olgunlaşır.

## Kapsama doğrulaması

| Dosya | Sprint |
|---|---|
| 15-phase2-roadmap.md Birim 13 | S13 |
| 15-phase2-roadmap.md Birim 14 | S14 |
| 15-phase2-roadmap.md Birim 15 | S15 |
| 15-phase2-roadmap.md Birim 16 | S15 |
| 15-phase2-roadmap.md Birim 17 | S16 |
| 15-phase2-roadmap.md Birim 18 | S17-S18 |
| 15-phase2-roadmap.md Birim 19 | S17-S18 |
| 15-phase2-roadmap.md Birim 20 | Sürekli |

Faz 2'nin 8 biriminin tamamı en az bir sprint'e eşlendi — atlanan kalem yok.

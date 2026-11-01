# E1 — B1/B2 İçerik Genişletme Gap Raporu

Tarih: 11 Eylül 2026  
Durum: **Blokajlı; içerik üretimi ve uzman incelemesi bekliyor.**

## Ölçülen mevcut durum

| Seviye | Mevcut soru | Hazır olma eşiği | Eksik |
|---|---:|---:|---:|
| B1 | 5 | 100 | 95 |
| B2 | 4 | 100 | 96 |

Toplam **191 yeni, doğrulanmış soru** gereklidir. Her iki seviye de mevcut durumda 60 soruluk gerçek sınavı güvenilir biçimde desteklemez.

## E1 kabul kriterleri

- Her seviye için en az 100 özgün soru.
- Her soruda doğru cevap, en az iki anlamca ayrışan çeldirici, örnek cümle, Türkçe çeviri, bağlam notu, telaffuz ve ipucu.
- Duplicate ID, duplicate word, doğru cevabın option listesinde bulunması ve metadata bütünlüğü otomatik kontrolden geçer.
- Kolay/orta/zor dağılımı 60 soruluk sınavı destekler.
- İngilizce kaynak anlamı ve Türkçe karşılık yetkin bir içerik incelemesinden geçer.
- Katalog version bump, remote seed, bundled fallback ve cihaz smoke tekrar çalıştırılır.

## Neden otomatik doldurulmadı?

Eksik 191 kaydı şablon veya A1/A2 kelimelerini kopyalayarak üretmek B1/B2 yeterlilik iddiasını sahteleştirir; yanlış çeldiriciler ve hatalı çeviriler öğrenme modelini bozar. Bu sprintin içerik üretimi, kelime listesi ve dil incelemesi olmadan tamamlanmış sayılamaz.

## İlerleme sırası

1. B1/B2 hedef konu ve kelime listelerini onayla.
2. Her seviye için 20–25 kelimelik içerik paketleri üret.
3. Her paketi yapı, anlam ve dil açısından incele.
4. Paketleri kataloğa ekleyip testleri çalıştır.
5. 100/100 eşiği ve 60 soruluk sınav dağılımı geçince E1’i kapat.


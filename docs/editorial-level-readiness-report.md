# Editorial Level Readiness Report

Generated: 2026-09-13T14:12:18.122Z  
Rubric: 2026.09.p1

> [!IMPORTANT]
> Bu rapor otomatik envanter/audit sonucudur. `humanApproved` değeri gerçek review kanıtı olmadan 1 olamaz; otomatik test geçmesi editoryal onay değildir.
> Üç ana kalite metriği bağımsız olarak değerlendirilir ve tek bir başarı oranında birleştirilmez:
> 1. **Field Coverage:** 23 zorunlu alanın doluluk ve geçerlilik oranı.
> 2. **Automatic Structural Pass:** P0 kritik şema hatası içermeyen öğelerin oranı.
> 3. **Editorially Verified:** 4 uzman rolünün onayını taşıyan doğrulanmış insan kanıtı oranı.

---

## 1. Temel Seviye Envanteri ve Üç Ayrık Metrik

| Seviye | Toplam Öğe | Field Coverage | Automatic Structural Pass | Editorially Verified | Audit Hata | Audit Uyarı | İnsan Onayı | Bekleyen |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 365 | 100% | 100% | 0% | 0 | 365 | 0 | 365 |
| A2 | 304 | 100% | 100% | 0% | 0 | 304 | 0 | 304 |
| B1 | 120 | 100% | 100% | 0% | 0 | 120 | 0 | 120 |
| B2 | 108 | 95% | 100% | 0% | 0 | 108 | 0 | 108 |
| C1 | 108 | 96% | 100% | 0% | 0 | 108 | 0 | 108 |
| C2 | 100 | 100% | 100% | 0% | 0 | 100 | 0 | 100 |

Toplam: **1105** öğe; insan onayı bulunan **0**, bekleyen **1105**.

---

## 2. Kapsam ve Pedagojik Alan Dağılımı

| Seviye | Örnek Cümle | Türkçe Çeviri | Sense ID | IPA (Toplam) | IPA Doğrulanmış | IPA Bekleyen | Collocation | Production | Target-Enforced Prod. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 365/365 (100%) | 365/365 (100%) | 365/365 (100%) | 365/365 (100%) | 365/365 (100%) | 0/365 (0%) | 365/365 (100%) | 365/365 (100%) | 365/365 (100%) |
| A2 | 304/304 (100%) | 304/304 (100%) | 304/304 (100%) | 304/304 (100%) | 304/304 (100%) | 0/304 (0%) | 304/304 (100%) | 304/304 (100%) | 304/304 (100%) |
| B1 | 120/120 (100%) | 120/120 (100%) | 120/120 (100%) | 120/120 (100%) | 120/120 (100%) | 0/120 (0%) | 120/120 (100%) | 120/120 (100%) | 120/120 (100%) |
| B2 | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) | 0/108 (0%) | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) |
| C1 | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) | 0/108 (0%) | 108/108 (100%) | 108/108 (100%) | 108/108 (100%) |
| C2 | 100/100 (100%) | 100/100 (100%) | 100/100 (100%) | 100/100 (100%) | 100/100 (100%) | 0/100 (0%) | 100/100 (100%) | 100/100 (100%) | 100/100 (100%) |

---

## 3. Sözcük Türü (POS) Dağılımı

| Seviye | Noun (İsim) | Verb (Fiil) | Adjective (Sıfat) | Adverb (Zarf) | Phrase (Öbek) |
|---|---:|---:|---:|---:|---:|
| A1 | 180 | 40 | 86 | 7 | 52 |
| A2 | 180 | 31 | 42 | 1 | 50 |
| B1 | 72 | 32 | 16 | 0 | 0 |
| B2 | 52 | 35 | 21 | 0 | 0 |
| C1 | 56 | 25 | 27 | 0 | 0 |
| C2 | 48 | 33 | 19 | 0 | 0 |

---

## 4. Editoryal Bulgu ve Öncelik Dağılımı (P0–P3)

| Seviye | P0 (Yayın Engelleyici) | P1 (Ciddi Düzeltme) | P2 (Pedagojik İyileştirme) | P3 (Küçük Stil) | Distractor Uygunluğu | Tekrarlanan Şablon (Ex/Tr) |
|---|---:|---:|---:|---:|---:|---:|
| A1 | 0 | 0 | 0 | 0 | 365/365 (100%) | 0 / 0 |
| A2 | 0 | 0 | 0 | 0 | 304/304 (100%) | 0 / 0 |
| B1 | 0 | 0 | 0 | 0 | 120/120 (100%) | 0 / 0 |
| B2 | 0 | 187 | 0 | 0 | 108/108 (100%) | 0 / 0 |
| C1 | 0 | 145 | 0 | 0 | 108/108 (100%) | 0 / 0 |
| C2 | 0 | 0 | 0 | 0 | 100/100 (100%) | 0 / 0 |

---

## 5. Seviye Bazlı Editoryal Eylem Planı

| Seviye | Editoryal Kontrol Kapsamı |
|---|---|
| A1 | Temel sözcük türü, doğal örnek/çeviri, sense ayrımı, gerçek öğrenen distractorları; phrase/collocation kapsamı ve kısa üretim görevleri. |
| A2 | Eksik productionPrompt/collocation alanlarını tamamla; çok anlamlı kelimelerde sense kontrolü; doğal çeviri ve A2 zorluk doğrulaması. |
| B1 | 120 öğenin tamamında İngilizce kullanım, Türkçe anlam, IPA, CEFR ve bağlam editör incelemesi; ardından final karar. |
| B2 | 108 öğenin tamamında akademik/profesyonel register, gerekçeli üretim görevi, nüanslı çeviri ve CEFR sınırı kontrolü. |
| C1 | 108 öğenin tamamında kanıt/eleştirel analiz bağlamı, register, hassas anlam ayrımı ve üretim rubriği kontrolü. |
| C2 | 100 öğenin tamamında uzmanlık söylemi, doğal native kullanım, hassas sense/register ayrımı; otomatik audit temiz olsa da insan onayı bekliyor. |

---

## 6. Zorunlu 4 Rol İş Akışı ve İnsan Onayı

1. **English usage editor:** hedef sözcük türü, doğal sözdizimi, örnek cümle, collocation, IPA ve register.
2. **Turkish translation editor:** anlamın doğru sense'e bağlanması, doğal Türkçe çeviri ve seçeneklerin ayırt edilebilirliği.
3. **CEFR/curriculum expert:** seviye, topic/unit ilerlemesi, zorluk ve üretim kriteri.
4. **Final decider:** audit 0, dört rolün kanıtı, local/Firestore bütünlüğü ve yayın kararı.
5. **Evidence write:** her rol için reviewerId, reviewId, reviewedAt, rubricVersion ve decision kaydı.

---

## 7. Yayın Kapısı ve Güvenlik Güvencesi

Bir öğe ancak `status=published`, `editorialStatus=approved`, dört rolün doğrulanabilir kaydı, audit hata sayısı 0 ve local/Firestore içerik bütünlüğü sağlandığında yayınlanabilir. Bu rapor yapay insan onayı üretmez; reviewer rolü atanıp kararlar girilene kadar tüm seviyeler insan incelemesine kilitli kalmalıdır.

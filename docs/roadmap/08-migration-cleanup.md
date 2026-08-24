# Birim 8 — Migration Temizliği

**Puan (mevcut durum):** 5/10 · **Öncelik:** P2 — teknik borç, birikmeden toparlanmalı

## Problem

`src/services/storage.ts` artık üç ayrı göç mantığı taşıyor, hepsi Sprint 0-2 sırasında eklendi:

1. **`isLegacyQuestSet`** — eski `target: 2` görev yapısını tespit edip yeniden üretiyor (Sprint 0).
2. **`migrateLearningProgress`** — eski `solvedQuestionIds` listesini ve eski `reviewQueue`'yu yeni `learningProgress` yapısına döküyor, ayrıca göçü 7 güne yayıyor (Sprint 1-2).
3. **`isSeededDemoProfile`** — en eski demo profilini tespit edip temizliyor (proje başından beri var).

Her biri kendi bağlamında makul gerekçeyle eklendi. Ama üst üste bindikçe:
- `normalizeUserData` fonksiyonu okunması zor bir dallanma yığınına dönüşüyor.
- Her yeni şema değişikliği, üç eski varsayımla aynı anda çakışma riski taşıyor.
- Gerçek kullanıcı verisiyle hiç test edilmedi — sadece elle yazılan test senaryolarıyla (`tests/testSuite.ts` madde 16, 25).

## Kapsam

### 8.1 — Migration versiyonlama sistemi kur (P1)

Şu an göçler "eğer eski alan varsa" şeklinde koşullu kontrol ediliyor — versiyon numarası yok. Bunun yerine:

```typescript
interface StoredUserData {
  schemaVersion: number;  // yeni alan
  // ... diğer alanlar
}

const CURRENT_SCHEMA_VERSION = 3;

function migrate(data: any): UserData {
  let version = data.schemaVersion || 0;
  if (version < 1) data = migrateV0ToV1(data);  // eski dailyQuests
  if (version < 2) data = migrateV1ToV2(data);  // reviewQueue → learningProgress
  if (version < 3) data = migrateV2ToV3(data);  // gelecekteki değişiklik
  return { ...data, schemaVersion: CURRENT_SCHEMA_VERSION };
}
```

Bu, her göçü **tek seferlik, izole bir fonksiyon** haline getirir. Yeni bir şema değişikliği geldiğinde sadece yeni bir `migrateVNToVN+1` eklenir, mevcut mantığa dokunulmaz.

### 8.2 — Eski göç kodunu izole et (P2)

`isLegacyQuestSet` ve mevcut `migrateLearningProgress`'i 8.1'deki versiyonlu yapıya taşı. Bu refactor, **davranışı değiştirmemeli** — sadece organizasyonu iyileştirmeli. Mevcut testlerin (madde 16, 25, 28-31) hepsi aynı sonuçları vermeli.

### 8.3 — Göç telemetrisi ekle (Birim 5'e bağımlı, P2)

Hangi kullanıcıların hangi göç yolundan geçtiğini ölçmek için event ekle: `migration_applied` (`from_version`, `to_version`, `had_legacy_review_queue`, `had_legacy_quest_set`). Bu, göçün gerçek kullanıcı tabanında ne kadar yaygın olduğunu ve hatasız çalışıp çalışmadığını gösterir.

### 8.4 — Eski göç yollarını temizleme planı (P3, uzun vadeli)

Bir noktada (örn. yayından 6 ay sonra, telemetri "artık kimse eski şemadan gelmiyor" derse) `migrateV0ToV1` ve `migrateV1ToV2` fonksiyonları güvenle silinebilir. Bu bir **son tarih değil, bir koşul**: telemetri verisi göçün artık tetiklenmediğini göstermeden silinmemeli.

## Definition of Done

- [ ] `schemaVersion` alanı eklendi, tüm göçler versiyonlu fonksiyonlara ayrıldı
- [ ] Mevcut testler (16, 25, 28-31) refactor sonrası hâlâ geçiyor
- [ ] Göç telemetrisi eklendi (Birim 5 hazır olduğunda)
- [ ] Eski göç kodunun ne zaman silinebileceğine dair bir karar kriteri belgelendi

## Bağımlılıklar

- **Faydalanır:** Birim 5 (Telemetri) — 8.3 için gerekli ama zorunlu değil.
- **Bağımsız çalışabilir:** 8.1 ve 8.2 herhangi bir zamanda yapılabilir.

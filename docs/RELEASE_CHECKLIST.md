# Release Checklist & Gates

## 1. Release Karar Özeti (Release Gates)

```text
AUTOMATED_TESTS:           PASS
EDITORIAL_READINESS:       NOT_READY (0/1105 human approved)
HUMAN_REVIEW_EVIDENCE:     0/1105
LOCAL_FIRESTORE_INTEGRITY: NOT_VERIFIED
RELEASE_DECISION:          BLOCKED
```

> **Önemli Kural:** Teknik testlerin geçmesi editoryal olarak hazır olmak anlamına gelmez. 4 editoryal rolün (`english_usage_editor`, `turkish_translation_editor`, `cefr_curriculum_expert`, `final_decider`) doğrulanabilir kanıtı olmadan hiçbir seviye canlıya açılamaz.

---

## 2. Otomatik Mühendislik Kapıları (Automated Gates)

- [x] `npm run typecheck` succeeds
- [x] `npm test` succeeds (core unit & domain tests)
- [x] `npm run test:rules` succeeds (Firestore security rules)
- [x] Maestro smoke flow succeeds on Android device/emulator
- [ ] Firebase Auth register/login/delete flow verified in test project
- [ ] Notification permission and tap routing verified on physical device
- [ ] Android production AAB built through EAS
- [ ] iOS IPA built through EAS with Apple signing credentials
- [ ] Production Firebase rules and indexes deployment verified

---

## 3. Sprint & Editoryal Kalite Kapıları (Editorial Gates — Plan 36)

- [x] **S0:** Baseline manifest kaydedildi (`docs/36-baseline-manifest.json` — Hash: `3ee594b37a9d921c115fc037dc8f7900fd56a5fac967180213e4133c0fbe4717`).
- [x] **S1:** Reviewer rolü, yetki ve Firestore rules emulator testi tamamlandı.
- [x] **S2:** Kalite audit ve 23 alanlık rubric şeması sabitlendi.
- [x] **S3:** C2 (100/100) şablonlardan arındırıldı ve tam yeniden yazıldı (Section 63 testleri PASS).
- [x] **S4:** A1 (365/365) collocation, distractor rotasyonu ve hedef-enforced üretim tamamlandı (Section 64 testleri PASS).
- [x] **S5:** A2 (304/304) A1→A2 ilerleme matrisi ve işlevsel üretim tamamlandı (Section 65 testleri PASS).
- [x] **S6:** B1 (120/120) hedef-zorunlu bağlamlı üretim ve duplicate temizliği tamamlandı (Section 66 testleri PASS).
- [x] **S7:** B2 (108/108) gerekçeli ve register-duyarlı üretim tamamlandı (Section 67 testleri PASS).
- [x] **S8:** C1 (108/108) kanıt, sentez ve nüans üretimi tamamlandı (Section 68 testleri PASS).
- [x] **S9:** Practice, checkpoint ve level exam üretim (production) ölçümüne bağlandı (Section 69 testleri PASS).
- [ ] **S10:** 4 aşamalı insan review kanıtı (1.105 öğe kuyrukta hazır, `humanApproved: 0/1105`, yetkili insan editörlerin imza oturumları bekleniyor).
- [ ] **S11:** Local bundle ve Firestore content hash'i birebir eşitlendi (S10 tamamlanmadan Firestore'a seed yapılması yasak).
- [ ] **S11:** Seed dry-run ve integrity snapshot doğrulandı.
- [ ] **S12:** Kademeli seviye açılışı ve rollback versiyonu hazırlandı.

---

## 4. Seviye Açılış Durum Tablosu

| Seviye | Öğe Sayısı | Editoryal İnceleme Durumu | Canlıya Açık mı? |
|---|---|---|---|
| **A1** | 365 | 0/365 Onaylı | 🔒 KAPALI (S0 Kilitli) |
| **A2** | 304 | 0/304 Onaylı | 🔒 KAPALI (S0 Kilitli) |
| **B1** | 120 | 0/120 Onaylı | 🔒 KAPALI (S0 Kilitli) |
| **B2** | 108 | 0/108 Onaylı | 🔒 KAPALI (S0 Kilitli) |
| **C1** | 108 | 0/108 Onaylı | 🔒 KAPALI (S0 Kilitli) |
| **C2** | 100 | 0/100 Onaylı (P0 Şablon Revizyonu) | 🔒 KAPALI (S0 Kilitli) |

# Editorial Reviewer Role & Review Operation (Sprint S1)

## 1. Rolün Amacı ve Kapsamı
`EDITORIAL_REVIEWER`, LingoRise içerik kataloğunun (A1–C2, 1.105 soru) doğrulanabilir, hesap verebilir insan uzmanlar tarafından onaylanmasını sağlayan Firestore ve yetki modeli rolüdür.
Otomatik kontrollerin (`npm test`, `automaticAudit`) geçmesi içeriklerin yayınlanması için gerekli fakat yeterli değildir; her bir öğrenme öğesi 4 farklı editoryal uzman rolü tarafından bağımsız olarak incelenip imzalanmadıkça yayınlanamaz (`BLOCKED`).

## 2. Dört Editoryal Rol
Her katalog öğesi için aşağıdaki 4 ayrı rolün bağımsız incelemesi zorunludur:

1. **`english_usage_editor`**: İngilizce doğallığı, söz dizimi, POS uyumu, IPA telaffuz doğruluğu, collocation varlığı ve register (günlük/resmî/akademik) uygunluğu.
2. **`turkish_translation_editor`**: Türkçe anlam sadakati, bağlamsal karşılık doğruluğu ve çeldirici seçeneklerin kalitesi/anlam ayırt ediciliği.
3. **`cefr_curriculum_expert`**: CEFR seviye hedefine uygunluk (A1–C2 pedagojik ilerleme), konu kazanımı ve üretim (production prompt) zorunluluğu.
4. **`final_decider`**: Önceki 3 rolün tamamlandığını, rubric'in eksiksiz doldurulduğunu ve kataloğun integrity bütünlüğünü teyit eden nihai yayın karar mercii.

## 3. İnceleme Kararları
Her rol aşağıdaki kararlardan birini verir:
- `approved`: Rubric'in tüm kriterleri karşılandı, sorun yok.
- `revision_required`: İçerikte düzeltilmesi gereken pedagojik veya dilbilgisel eksiklik var. Öğe üretim kuyruğuna geri döner.
- `rejected`: İçerik CEFR/müfredat standartlarına uymuyor ve reddedildi.

## 4. Yetki Modeli (Permissions)
- `review.read`: Editoryal kuyruğu ve kayıtları okuma yetkisi.
- `review.write`: Atanmış seviye ve rolde karar oluşturma yetkisi.
- `review.final_decide`: Yalnızca `final_decider` rolü için gerekli üst düzey onay yetkisi.

## 5. Reviewer Provisioning Prosedürü (Trusted Admin Only)
Reviewer profilleri **asla client uygulaması üzerinden oluşturulamaz veya değiştirilemez**.
Kullanıcılar kendilerini reviewer yapamaz (`match /editorialReviewers/{uid} { allow write: if false; }`).

Reviewer tanımlama yalnızca trusted administrator tarafından Firebase Admin SDK veya Google Cloud Console üzerinden gerçekleştirilir:

```typescript
// Server-side / Admin Script Örneği (Admin SDK):
import * as admin from "firebase-admin";

async function provisionEditorialReviewer(uid: string, profile: {
  displayName: string;
  reviewerRoles: ("english_usage_editor" | "turkish_translation_editor" | "cefr_curriculum_expert" | "final_decider")[];
  permissions: ("review.read" | "review.write" | "review.final_decide")[];
  assignedLevels: ("A1" | "A2" | "B1" | "B2" | "C1" | "C2")[];
}) {
  await admin.firestore().doc(`editorialReviewers/${uid}`).set({
    uid,
    displayName: profile.displayName,
    role: "EDITORIAL_REVIEWER",
    reviewerRoles: profile.reviewerRoles,
    permissions: profile.permissions,
    assignedLevels: profile.assignedLevels,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

## 6. Örnek Reviewer Profile Şeması (`editorialReviewers/{uid}`)
```json
{
  "uid": "usr_selin_kaya_01",
  "displayName": "Dr. Selin Kaya",
  "role": "EDITORIAL_REVIEWER",
  "reviewerRoles": ["english_usage_editor"],
  "permissions": ["review.read", "review.write"],
  "assignedLevels": ["A1", "A2", "B1"],
  "active": true,
  "createdAt": "2026-09-12T10:00:00.000Z",
  "updatedAt": "2026-09-12T10:00:00.000Z"
}
```

## 7. Örnek Review Submission Şeması (`editorialReviews/{reviewId}`)
```json
{
  "reviewId": "rev_a1_001_usage_1726142400",
  "reviewerId": "usr_selin_kaya_01",
  "reviewerRole": "english_usage_editor",
  "questionId": "a1-mm-01",
  "level": "A1",
  "rubricVersion": "2026.09.p1",
  "decision": "approved",
  "notes": "Kelime kullanımı, IPA ve örnek cümle bağlamı A1 için kusursuz.",
  "reviewedAt": "2026-09-12T11:00:00.000Z",
  "createdAt": "2026-09-12T11:00:00.000Z",
  "createdByUid": "usr_selin_kaya_01"
}
```

## 8. Firestore Güvenlik Kuralları ve Değişmezlik (Immutability)
1. **`editorialReviewers/{uid}`**:
   - `read`: Sadece profili olan kullanıcının kendisi okuyabilir (`auth.uid == uid`).
   - `write`: Tamamen kapalıdır (`allow write: if false;`). İstemciden profil oluşturma veya yetki yükseltme imkansızdır.
2. **`editorialReviews/{reviewId}`**:
   - `read`: Yalnızca aktif `EDITORIAL_REVIEWER` profiline sahip kullanıcılar okuyabilir.
   - `create`: Yalnızca aktif, ilgili seviyeye (`assignedLevels`) ve role (`reviewerRoles`) atanmış reviewer oluşturabilir.
   - `reviewerId == auth.uid` zorunludur (başkasının adına karar yazılamaz).
   - `final_decider` rolü için `review.final_decide` yetkisi şarttır.
   - `update` ve `delete`: **Tamamen kapalıdır** (`allow update, delete: if false;`). Her karar değişmez (immutable) bir denetim kaydıdır. Düzeltme gerektiğinde yeni bir `reviewId` ile yeni bir kayıt oluşturulur.

## 9. İnsan Onayı ile Otomatik Audit Ayrımı
- **Otomatik Audit (`auditEditorialQuestions`)**: Sentaks, kelime uzunluğu, şablon tekrarı, çeldirici sayısı ve POS uyumu gibi biçimsel şartları test eder. Hızlıdır ancak anlamsal incelikleri, kültürel çeviri nüanslarını ve pedagojik uygunluğu denetleyemez.
- **İnsan Onayı (`EditorialReviewRecord`)**: Gerçek uzmanların kimlik ve zaman damgasıyla imzaladığı değerlendirmedir.
- **Kesin Kural**: Otomatik testlerin 591/591 geçmesi, editoryal olarak `approved` anlamına gelmez. Gerçek 4-rol insan imzası bulunmayan hiçbir öğe (`humanApproved: 0/1105`) yayın durumuna (`published`) geçirilemez.
- Generic ID'ler (`ai`, `codex`, `system`, `queue`, `remediation`, `lingorise editorial qa`) insan imzası olarak kesinlikle reddedilir.

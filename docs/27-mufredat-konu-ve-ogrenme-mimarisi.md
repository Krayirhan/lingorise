# LingoRise — Müfredat, Konu ve Öğrenme Mimarisi

Tarih: 11 Eylül 2026  
Durum: Uygulandı — müfredat sözleşmesi v2.0.0

## Amaç

LingoRise kelime listesi gösteren bir uygulama değil, A1–C2 boyunca konu bazlı ilerleyen bir öğrenme ürünü olmalıdır. Her kelime, soru, tekrar, konu ilerlemesi ve seviye sınavı aynı müfredat sözleşmesine dayanır.

## Uygulanan temel altyapı

- `src/content/curriculum.ts`, A1 ve A2 için sıralı canonical konu haritasını; B1–C2 için de içerik üretiminde kullanılacak konu sözleşmesini tanımlar.
- Katalog yüklenirken A1/A2 soruları eski serbest `topic` etiketlerinden `topicId`, `unitId` ve `lessonId` alanlarına migration edilir. Bu işlem bundled ve uzaktan gelen katalog için aynıdır.
- Bir ünite tek bir canonical konudan en fazla 15 öğe, bir ders en fazla 10 öğe içerir. Günlük pratik, sıradaki tamamlanmamış semantic üniteden seçilir.
- Pratik merkezi sıradaki dersin konu başlığını, öğrenme amacını ve kalan yeni kelime sayısını gösterir; kullanıcı doğrudan bu dersten başlar.
- İlerleme ekranı ham etiket saymak yerine seçili seviyedeki tüm konuları gösterir. Her konu `locked`, `available`, `in_progress`, `assessment_due`, `completed` veya `mastered` durumundadır.
- Konunun tüm öğeleri görüldüğünde 10 soruluk konu kontrolü açılır. %80 başarı, sonucu kalıcı olarak kaydeder ve sıradaki konuyu açar; bu oturum günlük görevleri ilerletmez ve cevap tekrarına izin vermez.
- A1/A2 kalite kapısı, her canonical konunun öğe sayısını, ünite/ders dağılımını ve zorunlu öğretim metadatasını denetler.
- Katalog sürümü `2.0.0` oldu. Eski pozisyon-bazlı üniteye ait yarım oturumlar güvenle yeniden oluşturulur.

### Uygulama sınırı

A1 (320), A2 (254), B1 (120), B2 (108), C1 (108) ve C2 (100) içerikleri hazırdır. Tüm seviyeler aynı semantic konu, ünite, ders ve checkpoint sözleşmesini kullanır.

### A1/A2 kalite denetimi — 11 Eylül 2026

| Seviye | Konu | Öğeler | Ünite | Ders | Eksik öğretim metadatası |
|---|---|---:|---:|---:|---:|
| A1 | İnsanlar ve Kimlik | 40 | 3 | 4 | 0 |
| A1 | Günlük Rutinler | 41 | 3 | 5 | 0 |
| A1 | Ev ve Şehir | 41 | 3 | 5 | 0 |
| A1 | Yemek ve Alışveriş | 39 | 3 | 4 | 0 |
| A1 | Temel Eylemler | 40 | 3 | 4 | 0 |
| A1 | Tanımlamalar | 41 | 3 | 5 | 0 |
| A1 | Doğa ve Hava | 39 | 3 | 4 | 0 |
| A1 | Sağlık ve Duygular | 39 | 3 | 4 | 0 |
| A2 | İş ve Kariyer | 37 | 3 | 4 | 0 |
| A2 | Seyahat ve Ulaşım | 36 | 3 | 4 | 0 |
| A2 | Teknoloji ve Medya | 36 | 3 | 4 | 0 |
| A2 | Para ve Hizmetler | 36 | 3 | 4 | 0 |
| A2 | Görüşler ve Duygular | 37 | 3 | 4 | 0 |
| A2 | Çevre ve Hava | 37 | 3 | 4 | 0 |
| A2 | Sosyal Yaşam | 35 | 3 | 4 | 0 |

## Mevcut durum

| Seviye | Soru | Durum |
|---|---:|---|
| A1 | 320 | İçerik miktarı yeterli; topic değerleri karma ve üniteler soru sırasından türetiliyor. |
| A2 | 254 | İçerik miktarı yeterli; konu blokları daha düzenli fakat ilk sınıf müfredat varlığı yok. |
| B1 | 120 | Dört canonical konu, her biri 30 öğe; uygulandı. |
| B2 | 108 | Üç canonical konu, her biri 36 öğe; uygulandı. |
| C1 | 108 | Üç canonical konu, her biri 36 öğe; uygulandı. |
| C2 | 100 | İki canonical konu, her biri 50 öğe; uygulandı. |

Mevcut `topic: string` etiketi arama ve basit istatistik için işe yarar. Konu sırası, kilit açma, öğrenme hedefi, başarı ölçümü veya sınav kapsamını tanımlamaz. `unitId` ise çoğunlukla sıralı 30 kelimelik dilimdir; pedagojik bir ünite değildir.

## Hedef hiyerarşi

```text
Seviye (A1–C2)
  └── Öğrenme rotası
        └── Konu
              └── Ünite
                    └── Ders
                          └── Öğrenme hedefi
                                └── Kelime / kalıp / dil yapısı
                                      └── Alıştırma ve tekrar kaydı
```

### Kavramların sorumluluğu

| Katman | Sorumluluk | Örnek |
|---|---|---|
| Seviye | CEFR kapsamı ve seviye sınavı | A2 |
| Konu | Anlamlı günlük/akademik alan | Travel |
| Ünite | Konunun küçük öğrenme paketi | Airport & planning |
| Ders | 8–15 yeni öğelik oturum | Booking a hotel |
| Hedef | Öğrencinin yapabildiği şey | Otel rezervasyonu yapabilmek |
| Öğrenme öğesi | Kelime, kalıp, collocation veya yapı | reservation / make a reservation |

## Temel kararlar

1. Konu kimliği kullanıcıya görünen metin değildir. Kodda sabit canonical ID kullanılır; Türkçe ve İngilizce başlıklar i18n’den gelir.
2. Her soru yalnızca bir ana konuya bağlanır. İsteğe bağlı `tags` alanı ikincil ilişkiler için kullanılır.
3. Ünite, soru sırasından hesaplanmaz. Katalogta açıkça tanımlanır ve sürümlenir.
4. Günlük practice, yalnızca sıradaki ünitenin yeni öğelerini verir; gerekli tekrarlar üniteden bağımsız olarak önceliklidir.
5. Konu ilerlemesi sadece “doğru cevap sayısı” değildir. Görülen öğe, güvenilir hatırlama, doğruluk ve mini değerlendirme birlikte değerlendirilir.
6. Seviye sınavı konu dağılımını korur. Bir konudan aşırı soru gelerek geçiş mümkün olmaz.
7. B1–C2, A1/A2 modeli oturmadan içerik olarak genişletilmez.

## Önerilen teknik sözleşme

```ts
type TopicId = string;
type UnitId = string;
type LessonId = string;

interface CurriculumTopic {
  id: TopicId;
  level: LevelCode;
  order: number;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  prerequisiteTopicIds: TopicId[];
  unitIds: UnitId[];
  unlockRule: {
    type: "previous_topic_complete" | "level_start" | "diagnostic";
    minimumProgress?: number;
  };
}

interface CurriculumUnit {
  id: UnitId;
  topicId: TopicId;
  order: number;
  titleKey: string;
  objectiveKeys: string[];
  lessonIds: LessonId[];
  assessmentQuestionIds: string[];
}

interface CurriculumLesson {
  id: LessonId;
  unitId: UnitId;
  order: number;
  titleKey: string;
  learningItemIds: string[];
  requiredItemCount: number;
}

interface LearningItem {
  id: string;
  level: LevelCode;
  topicId: TopicId;
  unitId: UnitId;
  lessonId: LessonId;
  type: "word" | "phrase" | "collocation" | "grammar_pattern";
  cefr: LevelCode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}
```

`MeaningMatchQuestion` içinde de `topicId`, `unitId`, `lessonId`, `learningItemId`, `contentVersion`, `order` ve `status` zorunlu olmalıdır. Eski `topic` alanı migration döneminde uyumluluk için tutulur, sonra kaldırılır.

## Kullanıcı ilerleme sözleşmesi

```ts
interface TopicProgress {
  topicId: TopicId;
  state: "locked" | "available" | "in_progress" | "completed" | "mastered";
  startedAt?: number;
  completedAt?: number;
  seenItemIds: string[];
  reliableItemIds: string[];
  assessment: {
    attempts: number;
    bestScore: number;
    passed: boolean;
  };
}
```

Önerilen durum geçişi:

```text
locked → available → in_progress → assessment_due → completed → mastered
```

- `available`: Ön koşullar karşılandı.
- `in_progress`: Konudan en az bir ders başladı.
- `assessment_due`: Tüm derslerin zorunlu öğeleri görüldü; konu kontrolü bekliyor.
- `completed`: Tüm derslerin zorunlu öğeleri görüldü ve konu mini değerlendirmesi geçildi.
- `mastered`: Konu öğelerinin hedef oranı farklı günlerde güvenilir biçimde hatırlandı.

## A1 müfredat rotası

| Sıra | Konu ID | Kullanıcı amacı | Önerilen ünite sayısı |
|---:|---|---|---:|
| 1 | `a1.people_identity` | Kendini ve yakın çevresini anlatmak | 3 |
| 2 | `a1.daily_routines` | Günlük rutinlerden söz etmek | 3 |
| 3 | `a1.home_city` | Ev, şehir ve konum tarif etmek | 3 |
| 4 | `a1.food_shopping` | Temel ihtiyaç istemek ve alışveriş yapmak | 3 |
| 5 | `a1.core_actions` | Temel eylemleri kullanmak | 3 |
| 6 | `a1.descriptions` | İnsanları ve nesneleri tarif etmek | 3 |
| 7 | `a1.nature_weather` | Doğa ve basit hava durumundan söz etmek | 2 |
| 8 | `a1.health_feelings` | Temel sağlık ve duyguları ifade etmek | 2 |

A1 için hedef: konu başına 30–45 öğrenme öğesi, ünite başına 10–15 öğe. Mevcut 320 soru yeniden eşlenerek kullanılabilir; önce 7 eski serbest topic etiketi normalize edilir.

## A2 müfredat rotası

| Sıra | Konu ID | Kullanıcı amacı | Önerilen ünite sayısı |
|---:|---|---|---:|
| 1 | `a2.work_career` | İş, görev, başvuru ve plan anlatmak | 3 |
| 2 | `a2.travel_mobility` | Yolculuk planlamak ve sorun çözmek | 3 |
| 3 | `a2.technology_media` | Dijital araç ve iletişim kullanmak | 3 |
| 4 | `a2.money_services` | Para, alışveriş ve hizmet işlemleri yapmak | 3 |
| 5 | `a2.opinions_emotions` | Görüş, tercih ve duyguları gerekçelendirmek | 3 |
| 6 | `a2.environment_weather` | Çevre ve değişen hava koşullarından söz etmek | 3 |
| 7 | `a2.social_life` | Davet, plan ve sosyal ilişkileri yönetmek | 3 |

A2’de mevcut konu blokları iyi başlangıçtır. Yapılması gereken, bu blokları canonical ID’ye bağlamak ve her birini açık ünite/ders yapısına ayırmaktır.

## B1–C2 genişleme çerçevesi

| Seviye | Ana yön | Konu örnekleri |
|---|---|---|
| B1 | Bağımsız günlük iletişim | Eğitim, iş yaşamı, sağlık, kültür, toplum, seyahat sorunları |
| B2 | Görüş savunma ve soyut düşünme | Medya, çevre, bilim, ekonomi, ilişki yönetimi, tartışma |
| C1 | Akademik/profesyonel akıcılık | Araştırma, liderlik, politika, etik, teknoloji etkileri |
| C2 | İnce anlam ve üst düzey üretim | Retorik, edebiyat, uzmanlık alanı, register, nüans |

Her yeni seviye, en az 6–8 konu, konu başına 3 ünite ve ünite başına 2–3 dersle başlamalıdır. Kelime hedefi konu hedefinden türemeli; rastgele kelime sayısı hedefi belirlememelidir.

## Öğrenme akışı

```text
Onboarding → başlangıç seviyesi → sıradaki açık konu
→ sıradaki dersin yeni öğeleri → gerekli tekrarlar
→ ünite kontrolü → sonraki ünite
→ konu değerlendirmesi → sonraki konu
→ seviye sınavı → seviye geçişi
```

Günlük oturum sıralaması:

1. Due review varsa önce kısa tekrar.
2. Sıradaki dersin 8–15 yeni öğesi.
3. Oturum sonunda kısa geri çağırma kontrolü.
4. Ünite tamamlandıysa ünite kartı ve sonraki hedef.
5. Konu tamamlandıysa mini değerlendirme.

## Ekran davranışları

| Ekran | Yeni davranış |
|---|---|
| Home | Sıradaki konu, sıradaki ders, konu yüzdesi ve tek net CTA gösterir. |
| Practice hub | Serbest pratik yanında “müfredata devam et” eylemi sunar. |
| Progress | Her konu için görülen / güvenilir / toplam öğe ve assessment sonucu gösterir. |
| Word notebook | Kelimenin level → konu → ünite → ders bağlamını gösterir. |
| Exam | Konu dağılımı ve zayıf konu geri bildirimi gösterir. |

## Migration planı

1. `curriculum/` altında topic, unit ve lesson katalogları oluşturulur.
2. A1/A2 sorularına canonical `topicId`, `unitId`, `lessonId` eklenir.
3. Eski serbest topic değerleri tabloyla canonical ID’ye migrate edilir.
4. `UserData` içine `topicProgress` eklenir; eski solved/learning kayıtlarından ilk durum üretilir.
5. Günlük session builder, soru sırası yerine curriculum state tüketir.
6. Progress ve Home ekranları yeni modeli kullanır.
7. Katalog schema validation ve migration fixture testleri eklenir.
8. A1/A2 cihaz smoke geçtikten sonra B1/B2 içerik üretimine başlanır.

## Başarı ölçütleri

- Her aktif soru geçerli bir `topicId`, `unitId`, `lessonId` taşır.
- Bir kullanıcı her zaman neden o kelimeyi gördüğünü anlayabilir.
- Bir konu tamamlanınca sonraki konu deterministik açılır.
- İçerik sırası değişse bile kullanıcı ilerlemesi anlamsal olarak bozulmaz.
- Exam, konu kapsamını dengeli temsil eder.
- Remote katalog, bundled fallback ve aktif oturum aynı curriculum sürümünü kullanır.

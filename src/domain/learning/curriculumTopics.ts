import { CurriculumTopic } from "./curriculumTypes";

export const A1_TOPICS: CurriculumTopic[] = [
  { id: "a1.people_identity", level: "A1", order: 1, titleTr: "İnsanlar ve Kimlik", titleEn: "People & Identity", objectiveTr: "Kendini ve yakın çevreni anlat.", objectiveEn: "Talk about yourself and people close to you.", icon: "people-outline", legacyTopics: ["people"] },
  { id: "a1.daily_routines", level: "A1", order: 2, titleTr: "Günlük Rutinler", titleEn: "Daily Routines", objectiveTr: "Günlük yaşamından söz et.", objectiveEn: "Talk about everyday routines.", icon: "calendar-outline", legacyTopics: ["daily_life", "Günlük Yaşam", "Zaman & Gün"] },
  { id: "a1.home_city", level: "A1", order: 3, titleTr: "Ev ve Şehir", titleEn: "Home & City", objectiveTr: "Evini, şehrini ve konumları tarif et.", objectiveEn: "Describe your home, city and locations.", icon: "home-outline", legacyTopics: ["home_city", "Ev & Bahçe"] },
  { id: "a1.food_shopping", level: "A1", order: 4, titleTr: "Yemek ve Alışveriş", titleEn: "Food & Shopping", objectiveTr: "Temel ihtiyaçlarını söyle ve alışveriş yap.", objectiveEn: "Express basic needs and shop.", icon: "cart-outline", legacyTopics: ["food"] },
  { id: "a1.core_actions", level: "A1", order: 5, titleTr: "Temel Eylemler", titleEn: "Core Actions", objectiveTr: "Sık kullanılan eylemleri kur.", objectiveEn: "Use common everyday actions.", icon: "walk-outline", legacyTopics: ["core_verbs"] },
  { id: "a1.descriptions", level: "A1", order: 6, titleTr: "Tanımlamalar", titleEn: "Descriptions", objectiveTr: "İnsanları ve nesneleri tarif et.", objectiveEn: "Describe people and objects.", icon: "color-palette-outline", legacyTopics: ["descriptions", "Sıfatlar"] },
  { id: "a1.nature_weather", level: "A1", order: 7, titleTr: "Doğa ve Hava", titleEn: "Nature & Weather", objectiveTr: "Doğa ve basit hava durumundan söz et.", objectiveEn: "Talk about nature and simple weather.", icon: "leaf-outline", legacyTopics: ["nature", "Bahçe & Doğa", "Renkler & Doğa"] },
  { id: "a1.health_feelings", level: "A1", order: 8, titleTr: "Sağlık ve Duygular", titleEn: "Health & Feelings", objectiveTr: "Temel sağlık durumunu ve duygularını anlat.", objectiveEn: "Express basic health and feelings.", icon: "heart-outline", legacyTopics: ["health_emotions", "Duygular"] },
];

export const A2_TOPICS: CurriculumTopic[] = [
  { id: "a2.work_career", level: "A2", order: 1, titleTr: "İş ve Kariyer", titleEn: "Work & Career", objectiveTr: "İş, görev ve planlardan söz et.", objectiveEn: "Talk about work, tasks and plans.", icon: "briefcase-outline", legacyTopics: ["İş & Kariyer"] },
  { id: "a2.travel_mobility", level: "A2", order: 2, titleTr: "Seyahat ve Ulaşım", titleEn: "Travel & Mobility", objectiveTr: "Yolculuk planla ve sorun çöz.", objectiveEn: "Plan travel and solve travel problems.", icon: "airplane-outline", legacyTopics: ["Seyahat", "Seyahat & Keşif"] },
  { id: "a2.technology_media", level: "A2", order: 3, titleTr: "Teknoloji ve Medya", titleEn: "Technology & Media", objectiveTr: "Dijital araçları ve iletişimi anlat.", objectiveEn: "Describe digital tools and communication.", icon: "phone-portrait-outline", legacyTopics: ["Teknoloji"] },
  { id: "a2.money_services", level: "A2", order: 4, titleTr: "Para ve Hizmetler", titleEn: "Money & Services", objectiveTr: "Alışveriş, fiyat ve hizmet işlemlerini yönet.", objectiveEn: "Handle shopping, prices and services.", icon: "card-outline", legacyTopics: ["Alışveriş & Para"] },
  { id: "a2.opinions_emotions", level: "A2", order: 5, titleTr: "Görüşler ve Duygular", titleEn: "Opinions & Feelings", objectiveTr: "Görüşünü ve tercihini gerekçelendir.", objectiveEn: "Explain opinions and preferences.", icon: "chatbubbles-outline", legacyTopics: ["Duygular & Görüşler", "Sıfatlar & Duygular"] },
  { id: "a2.environment_weather", level: "A2", order: 6, titleTr: "Çevre ve Hava", titleEn: "Environment & Weather", objectiveTr: "Çevre ve değişen hava koşullarından söz et.", objectiveEn: "Talk about the environment and changing weather.", icon: "partly-sunny-outline", legacyTopics: ["Çevre & Hava Durumu", "Çevre & Yaşam", "Doğa & Çevre", "Doğa & Bitkiler"] },
  { id: "a2.social_life", level: "A2", order: 7, titleTr: "Sosyal Yaşam", titleEn: "Social Life", objectiveTr: "Davet, plan ve ilişkileri yönet.", objectiveEn: "Manage invitations, plans and relationships.", icon: "people-outline", legacyTopics: ["Sosyal Yaşam"] },
];

// These topic maps establish the same stable contract for the upper CEFR
// levels before their full catalogues ship. They deliberately have no legacy
// labels yet: authoring a B1–C2 item must choose one of these ids instead of
// creating another free-form topic string.
export const B1_TOPICS: CurriculumTopic[] = [
  { id: "b1.workplace_collaboration", level: "B1", order: 1, titleTr: "İş ve İş Birliği", titleEn: "Work & Collaboration", objectiveTr: "İş hayatındaki durumları açıkla ve birlikte çözüm üret.", objectiveEn: "Explain workplace situations and collaborate on solutions.", icon: "people-outline", legacyTopics: ["İş ve İş Birliği", "Karakter & Güç"] },
  { id: "b1.travel_experiences", level: "B1", order: 2, titleTr: "Deneyimler ve Seyahat", titleEn: "Experiences & Travel", objectiveTr: "Geçmiş deneyimlerini ayrıntılandır.", objectiveEn: "Describe past experiences in detail.", icon: "map-outline", legacyTopics: ["Deneyimler ve Seyahat", "Tarım & Üretim"] },
  { id: "b1.media_society", level: "B1", order: 3, titleTr: "Medya ve Toplum", titleEn: "Media & Society", objectiveTr: "Güncel konular hakkında görüş bildir.", objectiveEn: "Express an opinion on current topics.", icon: "newspaper-outline", legacyTopics: ["Medya ve Toplum", "Çevre & Koruma"] },
  { id: "b1.goals_decisions", level: "B1", order: 4, titleTr: "Hedefler ve Kararlar", titleEn: "Goals & Decisions", objectiveTr: "Planlarını gerekçelendir ve kararlarını savun.", objectiveEn: "Justify plans and decisions.", icon: "flag-outline", legacyTopics: ["Hedefler ve Kararlar", "Gelişim & Başarı"] },
];

export const B2_TOPICS: CurriculumTopic[] = [
  { id: "b2.abstract_discussion", level: "B2", order: 1, titleTr: "Soyut Konular", titleEn: "Abstract Discussion", objectiveTr: "Karmaşık fikirleri yapılandırarak tartış.", objectiveEn: "Discuss complex ideas in a structured way.", icon: "bulb-outline", legacyTopics: ["Soyut Konular"] },
  { id: "b2.argumentation", level: "B2", order: 2, titleTr: "Tartışma ve İkna", titleEn: "Argumentation", objectiveTr: "Kanıt kullanarak görüşünü savun.", objectiveEn: "Defend a viewpoint with evidence.", icon: "chatbubbles-outline", legacyTopics: ["Tartışma ve İkna"] },
  { id: "b2.professional_communication", level: "B2", order: 3, titleTr: "Profesyonel İletişim", titleEn: "Professional Communication", objectiveTr: "Resmî ve yarı resmî iletişimi yönet.", objectiveEn: "Handle formal and semi-formal communication.", icon: "briefcase-outline", legacyTopics: ["Profesyonel İletişim"] },
];

export const C1_TOPICS: CurriculumTopic[] = [
  { id: "c1.academic_professional", level: "C1", order: 1, titleTr: "Akademik ve Profesyonel Dil", titleEn: "Academic & Professional Language", objectiveTr: "Karmaşık metinleri üret ve yorumla.", objectiveEn: "Produce and interpret complex texts.", icon: "school-outline", legacyTopics: ["Akademik ve Profesyonel Dil"] },
  { id: "c1.nuance_register", level: "C1", order: 2, titleTr: "Nüans ve Üslup", titleEn: "Nuance & Register", objectiveTr: "Bağlama uygun üslup ve nüans seç.", objectiveEn: "Choose register and nuance for the context.", icon: "color-wand-outline", legacyTopics: ["Nüans ve Üslup"] },
  { id: "c1.critical_analysis", level: "C1", order: 3, titleTr: "Eleştirel Analiz", titleEn: "Critical Analysis", objectiveTr: "Farklı görüşleri karşılaştır ve sentezle.", objectiveEn: "Compare and synthesize competing viewpoints.", icon: "analytics-outline", legacyTopics: ["Eleştirel Analiz"] },
];

export const C2_TOPICS: CurriculumTopic[] = [
  { id: "c2.precision_expression", level: "C2", order: 1, titleTr: "Kesin ve Esnek Anlatım", titleEn: "Precise Expression", objectiveTr: "Her bağlamda kesin ve doğal anlatım kur.", objectiveEn: "Express yourself precisely and naturally in any context.", icon: "create-outline", legacyTopics: ["Kesin ve Esnek Anlatım"] },
  { id: "c2.specialist_discourse", level: "C2", order: 2, titleTr: "Uzmanlık Söylemi", titleEn: "Specialist Discourse", objectiveTr: "Uzmanlık alanındaki karmaşık söylemi yönet.", objectiveEn: "Handle complex specialist discourse.", icon: "library-outline", legacyTopics: ["Uzmanlık Söylemi"] },
];


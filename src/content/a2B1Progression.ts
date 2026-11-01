/**
 * A deliberate A2 → B1 hand-off. Repeated headwords are not allowed to pass
 * into B1 as an unexamined duplicate: each must receive a new sense,
 * collocation, or productive use before B1 can be released.
 */
export interface A2B1ProgressionEntry {
  word: string;
  a2PurposeTr: string;
  b1RequiredUseTr: string;
  releaseAction: "rewrite_before_release";
}

export const A2_B1_PROGRESSION: readonly A2B1ProgressionEntry[] = [
  { word: "budget", a2PurposeTr: "alışveriş veya seyahat bütçesini söylemek", b1RequiredUseTr: "bir proje bütçesini gerekçelendirmek", releaseAction: "rewrite_before_release" },
  { word: "resource", a2PurposeTr: "doğal kaynakları adlandırmak", b1RequiredUseTr: "sınırlı kaynağı çözüm planında tartışmak", releaseAction: "rewrite_before_release" },
  { word: "responsibility", a2PurposeTr: "iş görevi ve sorumluluğu tanımak", b1RequiredUseTr: "rol ve sonuç sorumluluğunu açıklamak", releaseAction: "rewrite_before_release" },
  { word: "compromise", a2PurposeTr: "sosyal planda uzlaşmak", b1RequiredUseTr: "anlaşmazlıkta uzlaşı önerisi sunmak", releaseAction: "rewrite_before_release" },
  { word: "deadline", a2PurposeTr: "son teslim tarihini anlamak", b1RequiredUseTr: "gecikme riski ve teslim planı açıklamak", releaseAction: "rewrite_before_release" },
  { word: "training", a2PurposeTr: "iş eğitimi hakkında konuşmak", b1RequiredUseTr: "eğitimin beceriye etkisini değerlendirmek", releaseAction: "rewrite_before_release" },
  { word: "itinerary", a2PurposeTr: "seyahat planını okumak", b1RequiredUseTr: "güzergâh değişikliğini gerekçelendirmek", releaseAction: "rewrite_before_release" },
  { word: "accommodation", a2PurposeTr: "konaklama türünü seçmek", b1RequiredUseTr: "konaklama sorununu çözmek", releaseAction: "rewrite_before_release" },
  { word: "delay", a2PurposeTr: "ulaşım gecikmesini bildirmek", b1RequiredUseTr: "gecikmenin sonuçlarını açıklamak", releaseAction: "rewrite_before_release" },
  { word: "refund", a2PurposeTr: "geri ödeme istemek", b1RequiredUseTr: "şikâyet ve iade talebi yazmak", releaseAction: "rewrite_before_release" },
  { word: "reservation", a2PurposeTr: "rezervasyon yapmak", b1RequiredUseTr: "rezervasyon hatasını müzakere etmek", releaseAction: "rewrite_before_release" },
  { word: "departure", a2PurposeTr: "hareket saatini anlamak", b1RequiredUseTr: "bağlantı kaçırma durumunu anlatmak", releaseAction: "rewrite_before_release" },
  { word: "arrival", a2PurposeTr: "varış bilgisini anlamak", b1RequiredUseTr: "varış değişikliğini bildirmek", releaseAction: "rewrite_before_release" },
  { word: "destination", a2PurposeTr: "gidilecek yeri belirtmek", b1RequiredUseTr: "rota tercihini savunmak", releaseAction: "rewrite_before_release" },
  { word: "explore", a2PurposeTr: "yeni bir yeri gezmek", b1RequiredUseTr: "deneyim ve keşif tercihlerini anlatmak", releaseAction: "rewrite_before_release" },
  { word: "custom", a2PurposeTr: "yerel âdeti tanımak", b1RequiredUseTr: "kültürel farkı karşılaştırmak", releaseAction: "rewrite_before_release" },
  { word: "volunteer", a2PurposeTr: "gönüllü kişiyi tanımak", b1RequiredUseTr: "gönüllü çalışmanın etkisini tartışmak", releaseAction: "rewrite_before_release" },
  { word: "journey", a2PurposeTr: "yolculuğu adlandırmak", b1RequiredUseTr: "yolculuk deneyimini ayrıntılandırmak", releaseAction: "rewrite_before_release" },
  { word: "adventure", a2PurposeTr: "macerayı adlandırmak", b1RequiredUseTr: "beklenmedik deneyimi anlatmak", releaseAction: "rewrite_before_release" },
  { word: "souvenir", a2PurposeTr: "hatıra eşyasını tanımak", b1RequiredUseTr: "bir anının önemini açıklamak", releaseAction: "rewrite_before_release" },
  { word: "hospitality", a2PurposeTr: "misafirperverliği tanımak", b1RequiredUseTr: "hizmet deneyimini değerlendirmek", releaseAction: "rewrite_before_release" },
  { word: "community", a2PurposeTr: "topluluğu adlandırmak", b1RequiredUseTr: "topluluk projesine ilişkin görüş bildirmek", releaseAction: "rewrite_before_release" },
] as const;

export function getA2B1Progression(word: string): A2B1ProgressionEntry | undefined {
  return A2_B1_PROGRESSION.find((entry) => entry.word === word.toLocaleLowerCase("en"));
}

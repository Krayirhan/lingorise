import { Copy } from "../../i18n/en";

type TopicCopyKey = keyof Copy["home"];

const TOPIC_COPY_KEY: Record<string, TopicCopyKey> = {
  people: "topicPeople",
  daily_life: "topicDailyLife",
  home_city: "topicHomeCity",
  food: "topicFood",
  nature: "topicNature",
  health_emotions: "topicHealthEmotions",
  core_verbs: "topicCoreVerbs",
  descriptions: "topicDescriptions",
};

// Raw topic keys (e.g. "core_verbs") come straight from content data and
// must never be shown to users as-is; always resolve through this map.
export function getTopicLabel(copy: Copy, topic?: string): string {
  if (!topic) return copy.home?.partOfSpeechNoun || "Kelime";

  const copyKey = TOPIC_COPY_KEY[topic];
  const label = copyKey ? copy.home?.[copyKey] : undefined;
  if (label) return label;

  return topic
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

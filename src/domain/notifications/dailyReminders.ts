import { Locale } from "../models/locale";

export const DAILY_REMINDER_PREFIX = "lingterra-daily-reminder-";

export function isOwnedDailyReminder(item: { identifier: string; content: { title?: string | null; body?: string | null } }): boolean {
  return item.identifier.startsWith(DAILY_REMINDER_PREFIX) ||
    (item.content.title === "Bahçen seni bekliyor 🌱" && item.content.body === "Bugünkü kısa pratiğinle serini koru.");
}

const messages: Record<Locale, Array<{ title: string; body: string }>> = {
  tr: [
    { title: "Küçük bir adım 🌱", body: "Birkaç yeni kelimeyle İngilizceni büyütmeye ne dersin?" },
    { title: "Bugün ne öğreneceksin? ✨", body: "Kısa bir pratik için kelimelerin seni bekliyor." },
    { title: "Kendine birkaç dakika ayır 📖", body: "Her yeni kelime, anlatmak istediklerine biraz daha yaklaştırır." },
    { title: "Bir kelimeyle başla 🍃", body: "Küçük tekrarlar zamanla büyük bir alışkanlığa dönüşür." },
    { title: "Öğrenme yolculuğun devam ediyor 🌿", body: "Bugün öğrendiklerine yeni kelimeler ekleyebilirsin." },
    { title: "Bir mola, birkaç kelime ☕", body: "Kendine kısa bir İngilizce molası vermeye ne dersin?" },
    { title: "Bahçene uğra 🌼", body: "Kısa bir pratikle kelime bahçeni büyütmeye devam et." },
  ],
  en: [
    { title: "A small step 🌱", body: "How about growing your English with a few new words?" },
    { title: "What will you learn today? ✨", body: "Your words are ready for a short practice." },
    { title: "Take a few minutes 📖", body: "Every new word brings you closer to saying what you mean." },
    { title: "Start with one word 🍃", body: "Small moments of practice can grow into a lasting habit." },
    { title: "Your learning journey continues 🌿", body: "Add a few more words to what you already know." },
    { title: "A break and a few words ☕", body: "How about a short English break?" },
    { title: "Visit your garden 🌼", body: "Keep your word garden growing with a little practice." },
  ],
};

/** Weekly triggers use 1 for Sunday and 7 for Saturday. */
export function dailyReminderMessages(locale: Locale) {
  return messages[locale].map((message, index) => ({ ...message, weekday: index + 1, identifier: `${DAILY_REMINDER_PREFIX}${index + 1}` }));
}

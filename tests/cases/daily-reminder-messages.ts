import { dailyReminderMessages, DAILY_REMINDER_PREFIX, isOwnedDailyReminder } from "../../src/domain/notifications/dailyReminders";
import { assert } from "../support/assertions";

for (const locale of ["tr", "en"] as const) {
  const messages = dailyReminderMessages(locale);
  assert(messages.length === 7 && new Set(messages.map(m => m.weekday)).size === 7 && messages.every(m => m.weekday >= 1 && m.weekday <= 7), `${locale}: one reminder for each weekday`);
  assert(messages.every(m => m.title && m.body && m.identifier.startsWith(DAILY_REMINDER_PREFIX)), `${locale}: every reminder has readable text and an owned identifier`);
  assert(new Set(messages.map(m => m.body)).size === 7, `${locale}: reminder text varies across the week`);
}
assert(isOwnedDailyReminder({ identifier: "legacy-id", content: { title: "Bahçen seni bekliyor 🌱", body: "Bugünkü kısa pratiğinle serini koru." } }), "Legacy daily reminder can be replaced without duplicates");
assert(!isOwnedDailyReminder({ identifier: "other-feature", content: { title: "Başka bildirim", body: "Güncelleme" } }), "Unrelated notifications are not cancelled");

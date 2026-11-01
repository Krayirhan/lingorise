import { buildWeekStrip } from "../../src/features/home/weekStripModel";
import { assert } from "../support/assertions";

const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// 2026-10-31 is a Saturday.
const saturday = buildWeekStrip("2026-10-31", ["2026-10-26", "2026-10-31", "2026-10-19"], labels);
assert(
  saturday.map((day) => day.date).join(",") === "2026-10-26,2026-10-27,2026-10-28,2026-10-29,2026-10-30,2026-10-31,2026-11-01",
  "Week strip runs Monday to Sunday around today, crossing a month boundary"
);
assert(
  saturday.filter((day) => day.isToday).map((day) => day.label).join() === "Cmt",
  "Week strip marks exactly today"
);
assert(
  saturday.filter((day) => day.isActive).map((day) => day.date).join() === "2026-10-26,2026-10-31",
  "Week strip marks practised days in this week and ignores earlier weeks"
);

const sunday = buildWeekStrip("2026-11-01", [], labels);
assert(
  sunday[0].date === "2026-10-26" && sunday[6].isToday,
  "On a Sunday the strip still starts on the preceding Monday"
);

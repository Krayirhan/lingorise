import { buildActivityHeatmap } from "../../src/features/progress/activityHeatmapModel";
import { assert } from "../support/assertions";

// 2026-10-31 is a Saturday.
const weeks = buildActivityHeatmap("2026-10-31", [
  { date: "2026-10-31", answers: 4 },
  { date: "2026-10-30", answers: 12 },
  { date: "2026-10-30", answers: 10 },
  { date: "2026-08-01", answers: 30 },
], 12);

assert(weeks.length === 12 && weeks.every((week) => week.days.length === 7), "Activity heatmap has 12 weeks of 7 days");
assert(weeks[11].days[0].date === "2026-10-26" && weeks[11].days[6].date === "2026-11-01", "Last heatmap week is the Monday–Sunday week of today");
assert(weeks[0].days[0].date === "2026-08-10", "First heatmap week starts eleven weeks before the current Monday");

const lastWeek = weeks[11].days;
assert(lastWeek[5].isToday && lastWeek[5].intensity === 1, "Today with a few answers is the lightest active shade");
assert(lastWeek[4].intensity === 3, "Answers on the same day add up (12 + 10 = darkest shade)");
assert(lastWeek[6].isFuture && lastWeek[6].intensity === 0, "Days after today are marked future and empty");
assert(weeks.flatMap((week) => week.days).every((day) => day.date !== "2026-08-01"), "Practice older than the window is left out");

const monthStarts = weeks.filter((week) => week.monthStart !== null).map((week) => week.monthStart);
assert(monthStarts.join(",") === "8,9,10", "Weeks holding the 1st of September, October and November are labelled");

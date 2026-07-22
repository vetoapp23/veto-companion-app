/**
 * Lightweight unit checks for visit reminder scheduling (no test runner required).
 * Run: npx tsx scripts/test-visit-reminders.ts
 */
import {
  buildPlanFromSchedule,
  resolveMaintenanceDueDate,
} from "../src/lib/reminderSchedule";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`OK: ${msg}`);
}

const schedule = [
  { label: "1ère dose", offset_days: 0 },
  { label: "Rappel 1", offset_days: 28 },
  { label: "Rappel 2", offset_days: 56 },
];

const plan = buildPlanFromSchedule("2026-07-22", schedule);
assert(plan.length === 3, "3 doses from schedule");
assert(plan[0].date === "2026-07-22", `J0 is 2026-07-22 got ${plan[0].date}`);
assert(plan[1].date === "2026-08-19", `J+28 is 2026-08-19 got ${plan[1].date}`);
assert(plan[2].date === "2026-09-16", `J+56 is 2026-09-16 got ${plan[2].date}`);

const next = resolveMaintenanceDueDate("2026-07-22", plan, 365);
assert(next === "2026-08-19", `next due is first future dose got ${next}`);

const afterLast = resolveMaintenanceDueDate("2026-09-16", plan, 365);
assert(afterLast === "2027-09-16", `after last dose uses duration_days: ${afterLast}`);

const maintOnly = resolveMaintenanceDueDate("2026-07-22", [], 365);
assert(maintOnly === "2027-07-22", `exactly +365 days: ${maintOnly}`);

console.log("\nAll reminder scheduling checks passed.");

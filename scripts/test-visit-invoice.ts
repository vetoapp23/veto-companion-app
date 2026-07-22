/**
 * Smoke tests for visit invoice line math (Phase E / D billing).
 * Run: npx tsx scripts/test-visit-invoice.ts
 *
 * Pure math only (no Supabase import).
 */

type LineIn = {
  status: string;
  amount: number | null;
  service_label: string;
  service_code?: string;
  reference_type?: string | null;
  reference_id?: string | null;
};

function buildBillableLines(
  services: LineIn[],
  billingMode: "forfait" | "per_head" | null | undefined,
  headCount: number | null | undefined
) {
  const qtyBase =
    billingMode === "per_head" && headCount && headCount > 0 ? headCount : 1;
  return services
    .filter((s) => s.status === "done" && Number(s.amount) > 0)
    .map((s, i) => {
      const unit = Number(s.amount) || 0;
      return {
        label: s.service_label,
        quantity: qtyBase,
        unit_price: unit,
        amount: unit * qtyBase,
        sort_order: i,
      };
    });
}

function sumLines(lines: { amount: number }[]) {
  return lines.reduce((sum, l) => sum + Number(l.amount || 0), 0);
}

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

const done: LineIn[] = [
  { amount: 50, status: "done", service_label: "Vaccin lot" },
  { amount: 100, status: "done", service_label: "Visite" },
  { amount: 80, status: "planned", service_label: "Skip" },
];

const forfait = buildBillableLines(done, "forfait", 20);
assert(forfait.length === 2, "forfait: 2 lignes done");
assert(sumLines(forfait) === 150, "forfait total 150");

const perHead = buildBillableLines(done, "per_head", 20);
assert(perHead.length === 2, "per_head: 2 lignes");
assert(perHead[0].quantity === 20, "per_head qty 20");
assert(sumLines(perHead) === 3000, "per_head 50*20 + 100*20 = 3000");

const companion = buildBillableLines(done, null, null);
assert(sumLines(companion) === 150, "companion = forfait");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll visit invoice tests passed.");

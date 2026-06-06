// Seed demo users for each subscription plan (idempotent).
// Public endpoint used only during the testing phase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEMO_PASSWORD = "DemoVetpro2026!";

const DEMOS: Array<{
  plan: "free" | "pro" | "pro_plus" | "duo" | "clinic";
  email: string;
  fullName: string;
  clinic: string;
  storageMb: number;
}> = [
  { plan: "free",     email: "demo-free@vetpro.test",     fullName: "Démo Découverte", clinic: "Clinique Démo Découverte", storageMb: 200 },
  { plan: "pro",      email: "demo-pro@vetpro.test",      fullName: "Démo Pro",        clinic: "Clinique Démo Pro",        storageMb: 2048 },
  { plan: "pro_plus", email: "demo-pro-plus@vetpro.test", fullName: "Démo Pro Plus",   clinic: "Clinique Démo Pro Plus",   storageMb: 3072 },
  { plan: "duo",      email: "demo-duo@vetpro.test",      fullName: "Démo Duo",        clinic: "Clinique Démo Duo",        storageMb: 5120 },
  { plan: "clinic",   email: "demo-clinic@vetpro.test",   fullName: "Démo Clinique",   clinic: "Clinique Démo Clinique",   storageMb: 15360 },
];

const FIRST_NAMES = ["Sophie", "Karim", "Amine", "Leila", "Yassine", "Fatima", "Hicham", "Nadia", "Omar", "Salma", "Mehdi", "Hajar"];
const LAST_NAMES = ["El Amrani", "Benali", "Tazi", "Idrissi", "Cherkaoui", "Bennani", "Alaoui", "Lahlou", "Saidi", "Berrada"];
const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda"];
const SPECIES = ["chien", "chat", "lapin", "oiseau"];
const BREEDS: Record<string, string[]> = {
  chien: ["Labrador", "Berger Allemand", "Bulldog", "Beagle", "Caniche"],
  chat: ["Persan", "Siamois", "Européen", "Maine Coon"],
  lapin: ["Nain", "Bélier"],
  oiseau: ["Canari", "Perruche"],
};
const PET_NAMES = ["Rex", "Luna", "Max", "Bella", "Simba", "Nala", "Rocky", "Mia", "Charlie", "Daisy", "Zorro", "Princesse"];
const VAX = ["CHPPi", "Rage", "Leucose", "Typhus"];
const ANTIPARA = [{ name: "Frontline", ai: "Fipronil" }, { name: "Bravecto", ai: "Fluralaner" }, { name: "Milbemax", ai: "Milbémycine" }];
const STOCK = [
  { name: "Amoxicilline 500mg", category: "medicament", unit: "comprimé", qty: 200, min: 50, cost: 1.2, price: 3 },
  { name: "Seringues 5ml", category: "consommable", unit: "unité", qty: 500, min: 100, cost: 0.3, price: 1 },
  { name: "Vaccin CHPPi", category: "vaccin", unit: "dose", qty: 50, min: 10, cost: 15, price: 35 },
  { name: "Frontline Spot-on", category: "antiparasitaire", unit: "pipette", qty: 80, min: 20, cost: 8, price: 20 },
  { name: "Compresses stériles", category: "consommable", unit: "boîte", qty: 40, min: 10, cost: 4, price: 10 },
];

const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

async function seedOrgData(admin: any, orgId: string, userId: string) {
  // Skip if already seeded
  const { count } = await admin.from("clients").select("id", { count: "exact", head: true }).eq("organization_id", orgId);
  if ((count ?? 0) > 0) return { skipped: true };

  // Stock
  await admin.from("stock_items").insert(
    STOCK.map((s) => ({
      organization_id: orgId,
      name: s.name, category: s.category, unit: s.unit,
      current_quantity: s.qty, minimum_quantity: s.min,
      unit_cost: s.cost, selling_price: s.price,
    }))
  );

  // 8 clients with 1-2 animals each
  const clientsPayload = Array.from({ length: 8 }).map(() => {
    const fn = rand(FIRST_NAMES), ln = rand(LAST_NAMES);
    return {
      organization_id: orgId, user_id: userId,
      first_name: fn, last_name: ln,
      email: `${fn}.${ln}@demo.test`.toLowerCase().replace(/\s/g, ""),
      phone: `+2126${randInt(10000000, 99999999)}`,
      mobile_phone: `+2126${randInt(10000000, 99999999)}`,
      address: `${randInt(1, 200)} Rue Démo`,
      city: rand(CITIES),
      client_type: "particulier",
    };
  });
  const { data: clients } = await admin.from("clients").insert(clientsPayload).select("id");
  if (!clients) return { skipped: false, error: "clients insert failed" };

  const animalsPayload: any[] = [];
  for (const c of clients) {
    const n = randInt(1, 2);
    for (let i = 0; i < n; i++) {
      const sp = rand(SPECIES);
      animalsPayload.push({
        organization_id: orgId, user_id: userId, client_id: c.id,
        name: rand(PET_NAMES), species: sp, breed: rand(BREEDS[sp]),
        sex: rand(["mâle", "femelle"]),
        weight: randInt(2, 35),
        birth_date: daysAgo(randInt(180, 3000)).toISOString().slice(0, 10),
        sterilized: Math.random() > 0.5,
      });
    }
  }
  const { data: animals, error: animErr } = await admin.from("animals").insert(animalsPayload).select("id, client_id");
  if (animErr || !animals) return { skipped: false, error: "animals: " + (animErr?.message ?? "no data") };

  // Consultations (1-3 per animal)
  const consPayload: any[] = [];
  for (const a of animals) {
    const n = randInt(1, 3);
    for (let i = 0; i < n; i++) {
      consPayload.push({
        organization_id: orgId, animal_id: a.id, client_id: a.client_id,
        consultation_date: daysAgo(randInt(1, 200)).toISOString(),
        consultation_type: rand(["générale", "vaccination", "urgence", "suivi"]),
        symptoms: rand(["Fatigue, perte d'appétit", "Boiterie patte avant", "Vomissements", "Démangeaisons"]),
        diagnosis: rand(["Infection légère", "Otite externe", "Gastrite", "Dermatite allergique"]),
        treatment: rand(["Antibiotique 7j", "Anti-inflammatoire", "Régime + probiotique", "Shampoing thérapeutique"]),
        weight: randInt(2, 35),
        temperature: 37 + Math.random() * 2,
        status: "completed",
      });
    }
  }
  await admin.from("consultations").insert(consPayload);

  // Vaccinations
  const vaxPayload = animals.map((a) => ({
    organization_id: orgId, animal_id: a.id,
    vaccine_name: rand(VAX),
    vaccine_type: "annuel",
    vaccination_date: daysAgo(randInt(30, 300)).toISOString().slice(0, 10),
    next_due_date: daysAgo(-randInt(30, 300)).toISOString().slice(0, 10),
    administered_by: "Dr Démo",
    manufacturer: rand(["Boehringer", "MSD", "Virbac"]),
    batch_number: `LOT-${randInt(1000, 9999)}`,
  }));
  await admin.from("vaccinations").insert(vaxPayload);

  // Antiparasites
  const antiPayload = animals.map((a) => {
    const p = rand(ANTIPARA);
    return {
      organization_id: orgId, animal_id: a.id,
      product_name: p.name, active_ingredient: p.ai,
      parasite_type: rand(["puces", "tiques", "vers"]),
      administration_route: "topique",
      dosage: "1 pipette",
      treatment_date: daysAgo(randInt(10, 90)).toISOString().slice(0, 10),
      next_treatment_date: daysAgo(-randInt(10, 80)).toISOString().slice(0, 10),
      administered_by: "Dr Démo",
    };
  });
  await admin.from("antiparasitics").insert(antiPayload);

  // Appointments (upcoming)
  const apptPayload = clients.slice(0, 5).map((c, i) => {
    const animal = animals.find((a) => a.client_id === c.id);
    const d = new Date(); d.setDate(d.getDate() + i + 1); d.setHours(9 + i, 0, 0, 0);
    return {
      organization_id: orgId, client_id: c.id, animal_id: animal?.id ?? null,
      appointment_date: d.toISOString(),
      appointment_type: rand(["consultation", "vaccination", "controle"]),
      status: "scheduled",
      duration_minutes: 30,
    };
  });
  await admin.from("appointments").insert(apptPayload);

  return { skipped: false, clients: clients.length, animals: animals.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const results: any[] = [];

  for (const d of DEMOS) {
    try {
      let userId: string | null = null;
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());
      if (existing) {
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD, email_confirm: true });
      } else {
        const { data: created, error: cErr } = await admin.auth.admin.createUser({
          email: d.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: d.fullName },
        });
        if (cErr) throw cErr;
        userId = created.user!.id;
      }

      const { data: profile } = await admin.from("user_profiles").select("organization_id").eq("id", userId).maybeSingle();
      let orgId: string | null = profile?.organization_id ?? null;

      if (!orgId) {
        const code = "DEMO" + d.plan.toUpperCase().slice(0, 4);
        const { data: org, error: oErr } = await admin
          .from("organizations")
          .insert({ name: d.clinic, code, address: "Demo", phone: "+212600000000" })
          .select("id")
          .single();
        if (oErr) throw oErr;
        orgId = org.id;

        const { error: pErr } = await admin.from("user_profiles").insert({
          id: userId,
          email: d.email,
          username: d.email.split("@")[0],
          full_name: d.fullName,
          role: "admin",
          status: "approved",
          organization_id: orgId,
        });
        if (pErr) throw pErr;
      } else {
        await admin.from("user_profiles").update({ status: "approved", role: "admin" }).eq("id", userId);
      }

      const { data: sub } = await admin
        .from("organization_subscriptions")
        .select("id")
        .eq("organization_id", orgId)
        .maybeSingle();

      const subPayload = {
        organization_id: orgId,
        plan_code: d.plan,
        storage_quota_mb: d.storageMb,
        status: "active",
        current_period_start: new Date().toISOString(),
      };

      if (sub) {
        await admin.from("organization_subscriptions").update(subPayload).eq("id", sub.id);
      } else {
        await admin.from("organization_subscriptions").insert(subPayload);
      }

      const seedRes = await seedOrgData(admin, orgId!, userId!);

      results.push({ plan: d.plan, email: d.email, userId, orgId, ok: true, seed: seedRes });
    } catch (e: any) {
      results.push({ plan: d.plan, email: d.email, ok: false, error: e?.message ?? String(e) });
    }
  }

  return new Response(JSON.stringify({ password: DEMO_PASSWORD, results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

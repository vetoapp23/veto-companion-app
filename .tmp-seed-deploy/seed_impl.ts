// Seed demo users for each subscription plan (idempotent + force reset).
// Requires DEMO_SEED_ENABLED=true and header x-demo-seed-secret === DEMO_SEED_SECRET.
// Body: { "force": true } clears clinical data then re-seeds.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-demo-seed-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEMO_PASSWORD = Deno.env.get("DEMO_PASSWORD") ?? "DemoVetpro2026!";

/** Temporary one-shot ops token (remove after reseed). */
const TEMP_RESEED_TOKEN = "vetocrm-reseed-2026-08-07";

const DEMOS: Array<{
  plan: "free" | "pro" | "pro_plus" | "duo" | "clinic";
  email: string;
  fullName: string;
  clinic: string;
  storageMb: number;
}> = [
  { plan: "free", email: "demo-free@vetpro.test", fullName: "Démo Découverte", clinic: "Clinique Démo Découverte", storageMb: 100 },
  { plan: "pro", email: "demo-pro@vetpro.test", fullName: "Démo Pro", clinic: "Clinique Démo Pro", storageMb: 2048 },
  { plan: "pro_plus", email: "demo-pro-plus@vetpro.test", fullName: "Démo Pro Plus", clinic: "Clinique Démo Pro Plus", storageMb: 3072 },
  { plan: "duo", email: "demo-duo@vetpro.test", fullName: "Démo Duo", clinic: "Clinique Démo Duo", storageMb: 5120 },
  { plan: "clinic", email: "demo-clinic@vetpro.test", fullName: "Démo Clinique", clinic: "Clinique Démo Clinique", storageMb: 15360 },
];

/** Real pet photos (Unsplash/Pixabay) + real veterinary radiographs (Wikimedia Commons). */
const IMG = {
  dogLab: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=640&q=80",
  dogShepherd: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=640&q=80",
  dogBeagle: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=640&q=80",
  dogBulldog: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=640&q=80",
  dogPoodle: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=640&q=80",
  catEuro: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=640&q=80",
  catOrange: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=640&q=80",
  catSiamese: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=640&q=80",
  rabbit: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=640&q=80",
  horse: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=640&q=80",
  // Real dog hip / pelvis radiographs
  xrayPelvis: "https://upload.wikimedia.org/wikipedia/commons/0/05/Bilateral_hip_dysplasia.JPG",
  xrayPelvisLat: "https://upload.wikimedia.org/wikipedia/commons/0/08/Golden_Doodle_hip_xray_side_view.jpg",
  xrayPelvisVd: "https://upload.wikimedia.org/wikipedia/commons/5/56/Golden_Doodle_dog_hip_xray_posterior_view.jpg",
};

/** Compact SVG “rapport d’analyse” as data URL (credible lab attachment). */
function labReportSvg(title: string, rows: Array<[string, string, string]>): string {
  const lines = rows
    .map(
      ([k, v, r], i) =>
        `<text x="24" y="${90 + i * 22}" font-size="13" fill="#1e293b">${k}</text>` +
        `<text x="220" y="${90 + i * 22}" font-size="13" fill="#0f766e" font-weight="600">${v}</text>` +
        `<text x="340" y="${90 + i * 22}" font-size="12" fill="#64748b">${r}</text>`,
    )
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="${120 + rows.length * 22}" viewBox="0 0 480 ${120 + rows.length * 22}">` +
    `<rect width="100%" height="100%" fill="#f8fafc"/>` +
    `<rect x="0" y="0" width="480" height="48" fill="#0f766e"/>` +
    `<text x="24" y="30" font-family="Segoe UI,Arial,sans-serif" font-size="16" fill="#fff" font-weight="700">${title}</text>` +
    `<text x="24" y="68" font-size="11" fill="#64748b">Laboratoire clinique — rapport automatisé (démo)</text>` +
    lines +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Clinical / imaging placeholder sheets (scan-ready). */
function clinicalSheetSvg(title: string, subtitle: string, accent = "#0f766e"): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b1220"/><stop offset="1" stop-color="#1e293b"/></linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>` +
    `<rect x="24" y="24" width="592" height="372" rx="12" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>` +
    `<circle cx="320" cy="190" r="88" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35"/>` +
    `<path d="M240 210 C280 140,360 140,400 210" fill="none" stroke="#94a3b8" stroke-width="8" opacity="0.55"/>` +
    `<text x="40" y="58" font-family="Segoe UI,Arial,sans-serif" font-size="20" fill="#e2e8f0" font-weight="700">${title}</text>` +
    `<text x="40" y="86" font-size="13" fill="#94a3b8">${subtitle}</text>` +
    `<text x="40" y="370" font-size="11" fill="#64748b">Cliché clinique — dossier démo VetoCrm</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const CLINICAL = {
  ear: clinicalSheetSvg("Otoscopie — oreille droite", "Conduit érythémateux, sécrétions brunâtres", "#f59e0b"),
  skin: clinicalSheetSvg("Dermatologie — face ventrale", "Érythème + excoriations — dermatite atopique", "#ef4444"),
  wound: clinicalSheetSvg("Plaie chirurgicale — MPG", "Parage + drainage — J0 post-op", "#22c55e"),
  thorax: clinicalSheetSvg("Radiographie thorax (schéma)", "Face + profil — lecture clinique démo", "#38bdf8"),
  ultrasound: clinicalSheetSvg("Échographie abdominale", "Coupe sagittale — estomac / foie", "#a78bfa"),
  leg: clinicalSheetSvg("Radiographie membre", "2 incidences — soft tissue swelling", "#94a3b8"),
};

const STOCK = [
  { name: "Amoxicilline 500mg", category: "medicament", unit: "comprimé", qty: 200, min: 50, cost: 1.2, price: 3, description: "Antibiotique large spectre" },
  { name: "Clavaseptin 250 mg", category: "medicament", unit: "comprimé", qty: 80, min: 20, cost: 1.8, price: 4.5, description: "Amoxicilline + acide clavulanique" },
  { name: "Metacam 1.5 mg/ml", category: "medicament", unit: "flacon", qty: 25, min: 5, cost: 18, price: 38, description: "Méloxicam AINS oral" },
  { name: "Cerenia 16 mg", category: "medicament", unit: "comprimé", qty: 60, min: 15, cost: 3.5, price: 8.5, description: "Maropitant antiémétique" },
  { name: "Prednisolone 5 mg", category: "medicament", unit: "comprimé", qty: 150, min: 40, cost: 0.25, price: 0.8, description: "Corticostéroïde" },
  { name: "Metronidazole 250 mg", category: "medicament", unit: "comprimé", qty: 100, min: 25, cost: 0.55, price: 1.6, description: "Antiprotozoaire / diarrhée" },
  { name: "Aurizon", category: "medicament", unit: "flacon", qty: 30, min: 8, cost: 8.5, price: 19, description: "Otite externe" },
  { name: "Milbemax Chien", category: "antiparasitaire", unit: "comprimé", qty: 60, min: 15, cost: 4.5, price: 12, description: "Vermifuge chien" },
  { name: "Milbemax Chat", category: "antiparasitaire", unit: "comprimé", qty: 70, min: 15, cost: 3.8, price: 10.5, description: "Vermifuge chat" },
  { name: "Bravecto 500 mg", category: "antiparasitaire", unit: "comprimé", qty: 40, min: 10, cost: 18, price: 42, description: "Fluralaner 12 semaines" },
  { name: "Frontline Spot-on", category: "antiparasitaire", unit: "pipette", qty: 80, min: 20, cost: 8, price: 20, description: "Fipronil puces/tiques" },
  { name: "Fortiflora Canin", category: "supplement", unit: "sachet", qty: 80, min: 20, cost: 1.2, price: 3, description: "Probiotique chien" },
  { name: "Vaccin CHPPi", category: "vaccin", unit: "dose", qty: 50, min: 10, cost: 15, price: 35, description: "Vaccin polyvalent chien" },
  { name: "Vaccin Rage", category: "vaccin", unit: "dose", qty: 40, min: 10, cost: 12, price: 30, description: "Rage" },
  { name: "Seringues 5ml", category: "consommable", unit: "unité", qty: 500, min: 100, cost: 0.3, price: 1, description: null },
  { name: "Compresses stériles", category: "consommable", unit: "boîte", qty: 40, min: 10, cost: 4, price: 10, description: null },
];

type Admin = ReturnType<typeof createClient>;

type CaseAnimal = {
  key: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  weight: number;
  birthDaysAgo: number;
  sterilized: boolean;
  photo: string;
  color?: string;
  notes?: string;
  microchip?: string;
};

type CaseClient = {
  first: string;
  last: string;
  city: string;
  phone: string;
  animals: CaseAnimal[];
};

/** Shared curated clinic roster — sliced per plan. */
const CLINIC_ROSTER: CaseClient[] = [
  {
    first: "Sophie",
    last: "El Amrani",
    city: "Casablanca",
    phone: "+212661100001",
    animals: [
      {
        key: "rex",
        name: "Rex",
        species: "chien",
        breed: "Labrador Retriever",
        sex: "Mâle",
        weight: 32.5,
        birthDaysAgo: 1600,
        sterilized: true,
        photo: IMG.dogLab,
        color: "Noir",
        notes: "Allergie alimentaire (poulet). Sportif.",
        microchip: "250268712345678",
      },
      {
        key: "luna",
        name: "Luna",
        species: "chat",
        breed: "Européen",
        sex: "Femelle",
        weight: 4.2,
        birthDaysAgo: 900,
        sterilized: true,
        photo: IMG.catEuro,
        color: "Tigré",
        notes: "Indoor. Sensible urinaire.",
        microchip: "250268712345679",
      },
    ],
  },
  {
    first: "Karim",
    last: "Benali",
    city: "Rabat",
    phone: "+212661100002",
    animals: [
      {
        key: "max",
        name: "Max",
        species: "chien",
        breed: "Berger Allemand",
        sex: "Mâle",
        weight: 34.0,
        birthDaysAgo: 2100,
        sterilized: false,
        photo: IMG.dogShepherd,
        color: "Fauve",
        notes: "Dysplasie hanche suspectée — suivi radio.",
        microchip: "250268712345680",
      },
    ],
  },
  {
    first: "Leila",
    last: "Tazi",
    city: "Marrakech",
    phone: "+212661100003",
    animals: [
      {
        key: "simba",
        name: "Simba",
        species: "chat",
        breed: "Européen",
        sex: "Mâle",
        weight: 5.1,
        birthDaysAgo: 1200,
        sterilized: true,
        photo: IMG.catOrange,
        color: "Roux",
        notes: "Otites récidivantes.",
      },
      {
        key: "nino",
        name: "Nino",
        species: "lapin",
        breed: "Nain",
        sex: "Mâle",
        weight: 1.4,
        birthDaysAgo: 400,
        sterilized: false,
        photo: IMG.rabbit,
        color: "Blanc",
      },
    ],
  },
  {
    first: "Yassine",
    last: "Idrissi",
    city: "Tanger",
    phone: "+212661100004",
    animals: [
      {
        key: "bella",
        name: "Bella",
        species: "chien",
        breed: "Beagle",
        sex: "Femelle",
        weight: 12.8,
        birthDaysAgo: 1100,
        sterilized: true,
        photo: IMG.dogBeagle,
        color: "Tricolore",
        notes: "Obésité légère — régime.",
        microchip: "250268712345681",
      },
    ],
  },
  {
    first: "Fatima",
    last: "Cherkaoui",
    city: "Fès",
    phone: "+212661100005",
    animals: [
      {
        key: "mila",
        name: "Mila",
        species: "chat",
        breed: "Siamois",
        sex: "Femelle",
        weight: 3.6,
        birthDaysAgo: 700,
        sterilized: true,
        photo: IMG.catSiamese,
        color: "Lilac point",
      },
    ],
  },
  {
    first: "Hicham",
    last: "Bennani",
    city: "Agadir",
    phone: "+212661100006",
    animals: [
      {
        key: "rocky",
        name: "Rocky",
        species: "chien",
        breed: "Bulldog Anglais",
        sex: "Mâle",
        weight: 24.0,
        birthDaysAgo: 1400,
        sterilized: true,
        photo: IMG.dogBulldog,
        color: "Blanc/fauve",
        notes: "Respiration bruyante — surveillance BOAS.",
        microchip: "250268712345682",
      },
    ],
  },
  {
    first: "Nadia",
    last: "Alaoui",
    city: "Meknès",
    phone: "+212661100007",
    animals: [
      {
        key: "daisy",
        name: "Daisy",
        species: "chien",
        breed: "Caniche",
        sex: "Femelle",
        weight: 7.5,
        birthDaysAgo: 800,
        sterilized: true,
        photo: IMG.dogPoodle,
        color: "Apricot",
      },
      {
        key: "kiwi",
        name: "Kiwi",
        species: "chat",
        breed: "Européen",
        sex: "Femelle",
        weight: 3.9,
        birthDaysAgo: 500,
        sterilized: false,
        photo: IMG.catEuro,
      },
    ],
  },
  {
    first: "Omar",
    last: "Lahlou",
    city: "Oujda",
    phone: "+212661100008",
    animals: [
      {
        key: "zeus",
        name: "Zeus",
        species: "chien",
        breed: "Berger Allemand",
        sex: "Mâle",
        weight: 36.2,
        birthDaysAgo: 2500,
        sterilized: false,
        photo: IMG.dogShepherd,
        notes: "Chien de garde — suivi annuel.",
        microchip: "250268712345683",
      },
    ],
  },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isoDaysAgo(n: number) {
  return daysAgo(n).toISOString();
}

function dateDaysAgo(n: number) {
  return daysAgo(n).toISOString().slice(0, 10);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function rosterForPlan(plan: string): CaseClient[] {
  switch (plan) {
    case "free":
      return CLINIC_ROSTER.slice(0, 4); // ≤10 animals
    case "pro":
      return CLINIC_ROSTER.slice(0, 5);
    case "pro_plus":
      return CLINIC_ROSTER.slice(0, 6);
    case "duo":
      return CLINIC_ROSTER.slice(0, 7);
    default:
      return CLINIC_ROSTER;
  }
}

async function clearOrgClinicalData(admin: Admin, orgId: string) {
  await admin.from("visit_services").delete().eq("organization_id", orgId);
  await admin.from("visits").delete().eq("organization_id", orgId);

  const { data: rxIds } = await admin.from("prescriptions").select("id").eq("organization_id", orgId);
  if (rxIds?.length) {
    await admin
      .from("prescription_medications")
      .delete()
      .in(
        "prescription_id",
        rxIds.map((p) => p.id),
      );
  }
  await admin.from("prescriptions").delete().eq("organization_id", orgId);
  await admin.from("consultations").delete().eq("organization_id", orgId);
  await admin.from("vaccinations").delete().eq("organization_id", orgId);
  await admin.from("antiparasitics").delete().eq("organization_id", orgId);
  await admin.from("appointments").delete().eq("organization_id", orgId);

  // Farms: delete children via farm ids when org column missing on some tables
  const { data: farmRows } = await admin.from("farms").select("id").eq("organization_id", orgId);
  const farmIds = (farmRows ?? []).map((f) => f.id);
  if (farmIds.length) {
    await admin.from("farm_batch_health_events").delete().in("farm_id", farmIds);
    await admin.from("farm_interventions").delete().in("farm_id", farmIds);
    await admin.from("farm_batches").delete().in("farm_id", farmIds);
    await admin.from("farm_infrastructures").delete().in("farm_id", farmIds);
  }
  await admin.from("farms").delete().eq("organization_id", orgId);
  await admin.from("animals").delete().eq("organization_id", orgId);
  await admin.from("clients").delete().eq("organization_id", orgId);
  await admin.from("stock_items").delete().eq("organization_id", orgId);
}

async function seedOrgData(
  admin: Admin,
  orgId: string,
  userId: string,
  plan: string,
  force: boolean,
) {
  const { count } = await admin
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if ((count ?? 0) > 0 && !force) return { skipped: true };
  if ((count ?? 0) > 0 && force) await clearOrgClinicalData(admin, orgId);

  await admin.from("stock_items").insert(
    STOCK.map((s) => ({
      organization_id: orgId,
      user_id: userId,
      name: s.name,
      category: s.category,
      unit: s.unit,
      description: s.description,
      current_quantity: s.qty,
      minimum_quantity: s.min,
      unit_cost: s.cost,
      selling_price: s.price,
      requires_prescription: s.category === "medicament",
      active: true,
    })),
  );

  const roster = rosterForPlan(plan);
  const clientsPayload = roster.map((c) => ({
    organization_id: orgId,
    user_id: userId,
    first_name: c.first,
    last_name: c.last,
    email: `${c.first}.${c.last}@demo.test`.toLowerCase().replace(/\s/g, ""),
    phone: c.phone,
    mobile_phone: c.phone,
    address: `${12 + Math.floor(Math.random() * 80)} Avenue Hassan II`,
    city: c.city,
    client_type: "particulier",
  }));

  const { data: clients, error: cErr } = await admin
    .from("clients")
    .insert(clientsPayload)
    .select("id, first_name, last_name");
  if (cErr || !clients) return { skipped: false, error: "clients: " + (cErr?.message ?? "none") };

  const animalKeyToId: Record<string, { id: string; client_id: string }> = {};
  const animalsPayload: Record<string, unknown>[] = [];
  const animalKeys: string[] = [];

  for (let i = 0; i < roster.length; i++) {
    const c = roster[i];
    const clientId = clients[i].id;
    for (const a of c.animals) {
      animalKeys.push(a.key);
      animalsPayload.push({
        organization_id: orgId,
        user_id: userId,
        client_id: clientId,
        name: a.name,
        species: a.species,
        breed: a.breed,
        sex: a.sex,
        weight: a.weight,
        birth_date: dateDaysAgo(a.birthDaysAgo),
        sterilized: a.sterilized,
        sterilization_date: a.sterilized ? dateDaysAgo(Math.min(a.birthDaysAgo - 180, 400)) : null,
        photo_url: a.photo,
        color: a.color ?? null,
        notes: a.notes ?? null,
        microchip_number: a.microchip ?? null,
        status: "vivant",
      });
    }
  }

  const { data: animals, error: aErr } = await admin
    .from("animals")
    .insert(animalsPayload)
    .select("id, client_id, name");
  if (aErr || !animals) return { skipped: false, error: "animals: " + (aErr?.message ?? "none") };

  animals.forEach((row, idx) => {
    animalKeyToId[animalKeys[idx]] = { id: row.id, client_id: row.client_id };
  });

  const get = (key: string) => animalKeyToId[key];

  // —— Consultations cliniques avec photos ——
  const consRows: Record<string, unknown>[] = [];
  const pushCons = (row: Record<string, unknown>) => consRows.push(row);

  if (get("rex")) {
    pushCons({
      organization_id: orgId,
      animal_id: get("rex")!.id,
      client_id: get("rex")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(45),
      consultation_type: "générale",
      symptoms: "Prurit intense, lésions cutanées ventrales, léchage compulsif",
      diagnosis: "Dermatite atopique — poussée allergique",
      treatment: "Prednisolone 5 jours dégressifs + shampooing thérapeutique + régime hypoallergénique",
      notes: "Photos des lésions avant traitement. Éviter le poulet.",
      weight: 32.5,
      temperature: 38.6,
      heart_rate: 92,
      respiratory_rate: 24,
      photos: [CLINICAL.skin],
      status: "completed",
      cost: 180,
    });
    pushCons({
      organization_id: orgId,
      animal_id: get("rex")!.id,
      client_id: get("rex")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(12),
      consultation_type: "suivi",
      symptoms: "Amélioration nette du prurit",
      diagnosis: "Dermatite atopique — évolution favorable",
      treatment: "Maintien régime + antiparasitaire externe à jour",
      weight: 32.0,
      temperature: 38.4,
      photos: [],
      status: "completed",
      cost: 100,
    });
  }

  if (get("luna")) {
    pushCons({
      organization_id: orgId,
      animal_id: get("luna")!.id,
      client_id: get("luna")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(30),
      consultation_type: "urgence",
      symptoms: "Dysurie, pollakiurie, vocalises en bac",
      diagnosis: "Cystite idiopathique féline (suspicion)",
      treatment: "Antispasmodique, hydratation, litière supplémentaire, contrôle analyse urinaire",
      notes: "Stress environnemental évoqué. Suivi 7 jours.",
      weight: 4.2,
      temperature: 39.1,
      photos: [],
      status: "completed",
      cost: 220,
      follow_up_date: dateDaysAgo(23),
    });
  }

  if (get("simba")) {
    pushCons({
      organization_id: orgId,
      animal_id: get("simba")!.id,
      client_id: get("simba")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(18),
      consultation_type: "générale",
      symptoms: "Secouements de tête, odeur forte oreille droite",
      diagnosis: "Otite externe bilatérale (prédominance droite)",
      treatment: "Aurizon 1 application 2×/j pendant 7 jours + nettoyage",
      notes: "Cliché otoscopique / aspect du conduit.",
      weight: 5.1,
      temperature: 38.7,
      photos: [CLINICAL.ear],
      status: "completed",
      cost: 160,
    });
  }

  if (get("rocky")) {
    pushCons({
      organization_id: orgId,
      animal_id: get("rocky")!.id,
      client_id: get("rocky")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(60),
      consultation_type: "chirurgie",
      symptoms: "Plaie de morsure infectée membre postérieur gauche",
      diagnosis: "Plaie contaminée — parage chirurgical et drainage",
      treatment: "Chirurgical : parage, lavage, suture partielle, ATB 10j, AINS 5j",
      notes: "Compte-rendu opératoire. Photos pré-op et pansement.",
      weight: 24.0,
      temperature: 39.3,
      photos: [CLINICAL.wound],
      status: "completed",
      cost: 950,
    });
    pushCons({
      organization_id: orgId,
      animal_id: get("rocky")!.id,
      client_id: get("rocky")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(50),
      consultation_type: "suivi",
      symptoms: "Contrôle cicatrisation J10",
      diagnosis: "Bonne évolution — retrait partiel des points",
      treatment: "Pansement léger, fin ATB",
      weight: 23.8,
      photos: [],
      status: "completed",
      cost: 80,
    });
  }

  if (get("bella")) {
    pushCons({
      organization_id: orgId,
      animal_id: get("bella")!.id,
      client_id: get("bella")!.client_id,
      veterinarian_id: userId,
      consultation_date: isoDaysAgo(8),
      consultation_type: "générale",
      symptoms: "Surpoids, intolérance à l’effort légère",
      diagnosis: "Surpoids BCS 7/9 — conseil nutritionnel",
      treatment: "Ration calculée, croquettes light, contrôle poids 4 semaines",
      weight: 12.8,
      temperature: 38.5,
      status: "completed",
      cost: 120,
    });
  }

  const { data: insertedCons } = await admin.from("consultations").insert(consRows).select("id, animal_id, consultation_type");

  // —— Visits : radio, écho, labo, chirurgie ——
  type VisitSpec = {
    animalKey: string;
    daysAgo: number;
    reason: string;
    services: Array<{
      code: string;
      label: string;
      amount: number;
      details?: Record<string, unknown>;
      attachments?: string[];
      notes?: string;
      linkConsultationType?: string;
    }>;
  };

  const visitSpecs: VisitSpec[] = [];

  if (get("max")) {
    visitSpecs.push({
      animalKey: "max",
      daysAgo: 22,
      reason: "Boiterie postérieure — bilan radiographique hanches",
      services: [
        {
          code: "consultation",
          label: "Consultation",
          amount: 150,
          notes: "Boiterie intermittent postérieur gauche, douleur à l’extension de hanche",
        },
        {
          code: "radiography",
          label: "Radiographie",
          amount: 350,
          details: {
            region: "Bassin / hanches (VD étendu)",
            technique: "Radiographie numérique, 2 incidences",
            findings:
              "Dysplasie coxo-fémorale bilatérale modérée (Norberg ↓). Pas de fracture. Recommandation : gestion poids, AINS à la demande, contrôle annuel.",
          },
          attachments: [IMG.xrayPelvis, IMG.xrayPelvisVd],
          notes: "Clichés bassin — dysplasie (VD + latéral)",
        },
      ],
    });
  }

  if (get("rex") && plan !== "free") {
    visitSpecs.push({
      animalKey: "rex",
      daysAgo: 35,
      reason: "Toux chronique — radio thorax",
      services: [
        {
          code: "radiography",
          label: "Radiographie",
          amount: 300,
          details: {
            region: "Thorax (face + profil)",
            technique: "Radiographie numérique",
            findings:
              "Trame bronchique marquée, pas d’épanchement. Compatible avec bronchite chronique. Contrôle clinique sous traitement.",
          },
          attachments: [CLINICAL.thorax, IMG.xrayPelvisLat],
        },
      ],
    });
  }

  if (get("luna")) {
    const cbc = labReportSvg("NFS + Biochimie — Luna", [
      ["Hématocrite", "38 %", "37–55"],
      ["Leucocytes", "11.2 G/L", "5.5–19"],
      ["Créatinine", "14 mg/L", "5–18"],
      ["Urée", "0.42 g/L", "0.2–0.5"],
      ["ALAT", "52 U/L", "<80"],
      ["Protéines tot.", "68 g/L", "54–78"],
    ]);
    visitSpecs.push({
      animalKey: "luna",
      daysAgo: 28,
      reason: "Bilan urinaire / biochimie post-cystite",
      services: [
        {
          code: "lab",
          label: "Analyses",
          amount: 280,
          details: {
            tests: "NFS, biochimie rénale/hépatique, bandelette urinaire + densitomètre",
            results:
              "Biochimie dans les normes. Urines : densité 1.045, sang traces, leucocytes +, pH 6.5 — compatible cystite en résolution.",
            lab_ref: `LAB-DEMO-${plan.toUpperCase()}-001`,
          },
          attachments: [cbc],
          notes: "Rapport laboratoire joint",
        },
      ],
    });
  }

  if (get("bella") && ["pro_plus", "duo", "clinic"].includes(plan)) {
    const biochem = labReportSvg("Biochimie — Bella", [
      ["Glycémie", "0.95 g/L", "0.7–1.2"],
      ["Cholestérol", "2.8 g/L", "1.2–3.0"],
      ["Triglycérides", "1.1 g/L", "<1.5"],
      ["ALAT", "48 U/L", "<80"],
      ["Phosph. alk.", "90 U/L", "<150"],
    ]);
    visitSpecs.push({
      animalKey: "bella",
      daysAgo: 9,
      reason: "Bilan métabolique — suivi poids",
      services: [
        {
          code: "lab",
          label: "Analyses",
          amount: 220,
          details: {
            tests: "Glycémie, lipidique, hépatique",
            results: "Bilan rassurant. Cholestérol haut de normale — poursuivre ration light.",
            lab_ref: `LAB-DEMO-${plan.toUpperCase()}-002`,
          },
          attachments: [biochem],
        },
      ],
    });
  }

  if (get("rocky")) {
    visitSpecs.push({
      animalKey: "rocky",
      daysAgo: 60,
      reason: "Intervention chirurgicale — parage plaie",
      services: [
        {
          code: "surgery",
          label: "Chirurgie",
          amount: 800,
          notes:
            "AG isoflurane. Parage large, lavage NaCl, drainage pénrose, suture partielle. Analgésie multimodale.",
          linkConsultationType: "chirurgie",
        },
        {
          code: "radiography",
          label: "Radiographie",
          amount: 250,
          details: {
            region: "Membre postérieur gauche",
            technique: "2 incidences",
            findings: "Pas de corps étranger osseux. Soft tissue swelling. Fractures absentes.",
          },
          attachments: [CLINICAL.leg, IMG.xrayPelvisLat],
        },
      ],
    });
  }

  if (get("mila") && ["duo", "clinic"].includes(plan)) {
    visitSpecs.push({
      animalKey: "mila",
      daysAgo: 14,
      reason: "Échographie abdominale — vomissements intermittents",
      services: [
        {
          code: "ultrasound",
          label: "Échographie",
          amount: 400,
          details: {
            region: "Abdomen complet",
            technique: "Échographie haute fréquence",
            findings:
              "Estomac : contenu mixte sans corps étranger. Intestin : péristaltisme normal. Reins / foie : aspect normal. Pas d’épanchement.",
          },
          attachments: [CLINICAL.ultrasound],
        },
      ],
    });
  }

  if (get("zeus") && plan === "clinic") {
    visitSpecs.push({
      animalKey: "zeus",
      daysAgo: 5,
      reason: "Contrôle annuel + radio thorax check-up sénior",
      services: [
        {
          code: "checkup",
          label: "Contrôle",
          amount: 120,
          notes: "Auscultation normale, dentition tartre modéré",
        },
        {
          code: "radiography",
          label: "Radiographie",
          amount: 300,
          details: {
            region: "Thorax",
            technique: "Face + profil",
            findings: "Silhouette cardiaque dans les normes. Pas d’anomalie pulmonaire notable.",
          },
          attachments: [CLINICAL.thorax],
        },
      ],
    });
  }

  let visitsCreated = 0;
  for (const vs of visitSpecs) {
    const animal = get(vs.animalKey);
    if (!animal) continue;

    const { data: visit, error: vErr } = await admin
      .from("visits")
      .insert({
        organization_id: orgId,
        client_id: animal.client_id,
        animal_id: animal.id,
        veterinarian_id: userId,
        visit_date: isoDaysAgo(vs.daysAgo),
        status: "completed",
        reason: vs.reason,
        notes: "Dossier démo — visite complète",
        total_amount: vs.services.reduce((s, x) => s + x.amount, 0),
        invoiced: false,
        context: "companion",
      })
      .select("id")
      .single();
    if (vErr || !visit) continue;
    visitsCreated++;

    let sort = 0;
    for (const svc of vs.services) {
      let reference_type: string | null = null;
      let reference_id: string | null = null;

      // Sync imaging/lab/surgery into consultations
      if (svc.code === "radiography" || svc.code === "ultrasound" || svc.code === "lab") {
        const isImaging = svc.code !== "lab";
        const { data: cons } = await admin
          .from("consultations")
          .insert({
            organization_id: orgId,
            animal_id: animal.id,
            client_id: animal.client_id,
            veterinarian_id: userId,
            visit_id: visit.id,
            consultation_date: isoDaysAgo(vs.daysAgo),
            consultation_type: svc.label,
            symptoms: isImaging
              ? [
                  svc.details?.region && `Région : ${svc.details.region}`,
                  svc.details?.technique && `Technique : ${svc.details.technique}`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : svc.details?.tests
              ? `Analyses : ${svc.details.tests}`
              : null,
            diagnosis: isImaging
              ? (svc.details?.findings as string) ?? null
              : (svc.details?.results as string) ?? null,
            notes: isImaging
              ? `Visite · ${svc.label}`
              : [`Réf. labo : ${svc.details?.lab_ref ?? ""}`, `Visite · ${svc.label}`]
                  .filter(Boolean)
                  .join("\n"),
            photos: svc.attachments ?? [],
            status: "completed",
            cost: svc.amount,
          })
          .select("id")
          .single();
        if (cons) {
          reference_type = "consultation";
          reference_id = cons.id;
        }
      } else if (svc.code === "surgery" && svc.linkConsultationType && insertedCons) {
        const linked = insertedCons.find(
          (c) => c.animal_id === animal.id && c.consultation_type === svc.linkConsultationType,
        );
        if (linked) {
          reference_type = "consultation";
          reference_id = linked.id;
          await admin.from("consultations").update({ visit_id: visit.id }).eq("id", linked.id);
        }
      }

      await admin.from("visit_services").insert({
        visit_id: visit.id,
        organization_id: orgId,
        service_code: svc.code,
        service_label: svc.label,
        status: "done",
        amount: svc.amount,
        notes: svc.notes ?? null,
        sort_order: sort++,
        attachments: svc.attachments ?? [],
        details: svc.details ?? {},
        reference_type,
        reference_id,
      });
    }
  }

  // —— Vaccinations / antiparasitaires ——
  const vaxPayload = animals.map((a, i) => ({
    organization_id: orgId,
    animal_id: a.id,
    vaccine_name: a.name && String(a.name).length ? (i % 2 === 0 ? "CHPPi" : "Rage") : "CHPPi",
    vaccine_type: "annuel",
    vaccination_date: dateDaysAgo(60 + i * 7),
    next_due_date: dateDaysAgo(-(300 - i * 10)),
    administered_by: "Dr Démo",
    manufacturer: i % 2 === 0 ? "Boehringer" : "MSD",
    batch_number: `LOT-DEMO-${1000 + i}`,
  }));
  await admin.from("vaccinations").insert(vaxPayload);

  const antiPayload = animals.map((a, i) => ({
    organization_id: orgId,
    animal_id: a.id,
    product_name: i % 2 === 0 ? "Bravecto" : "Frontline Spot-on",
    active_ingredient: i % 2 === 0 ? "Fluralaner" : "Fipronil",
    parasite_type: "puces/tiques",
    administration_route: i % 2 === 0 ? "orale" : "topique",
    dosage: i % 2 === 0 ? "1 comprimé" : "1 pipette",
    treatment_date: dateDaysAgo(20 + i),
    next_treatment_date: dateDaysAgo(-(70 - i)),
    administered_by: "Dr Démo",
  }));
  await admin.from("antiparasitics").insert(antiPayload);

  // —— Ordonnances liées aux consultations ——
  if (insertedCons?.length) {
    const derm = insertedCons.find((c) => c.consultation_type === "générale");
    const target = derm || insertedCons[0];
    const animal = animals.find((a) => a.id === target.animal_id);
    if (animal) {
      const { data: rx } = await admin
        .from("prescriptions")
        .insert({
          organization_id: orgId,
          consultation_id: target.id,
          animal_id: animal.id,
          client_id: animal.client_id,
          veterinarian_id: userId,
          prescription_date: dateDaysAgo(45),
          diagnosis: "Dermatite atopique",
          notes: "Ordonnance démo",
          status: "active",
          valid_until: dateDaysAgo(15),
        })
        .select("id")
        .single();
      if (rx) {
        await admin.from("prescription_medications").insert([
          {
            prescription_id: rx.id,
            medication_name: "Prednisolone 5 mg",
            dosage: "1 cp",
            frequency: "1×/j matin",
            duration: "5 jours dégressifs",
            instructions: "Avec nourriture",
            quantity: 5,
          },
          {
            prescription_id: rx.id,
            medication_name: "Fortiflora Canin",
            dosage: "1 sachet",
            frequency: "1×/j",
            duration: "14 jours",
            instructions: "Sur les croquettes",
            quantity: 14,
          },
        ]);
      }
    }
  }

  // —— RDV futurs ——
  const apptPayload = clients.slice(0, Math.min(5, clients.length)).map((c, i) => {
    const animal = animals.find((a) => a.client_id === c.id);
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    d.setHours(9 + (i % 6), i % 2 === 0 ? 0 : 30, 0, 0);
    return {
      organization_id: orgId,
      client_id: c.id,
      animal_id: animal?.id ?? null,
      appointment_date: d.toISOString(),
      appointment_type: ["consultation", "vaccination", "controle", "chirurgie", "checkup"][i % 5],
      status: "scheduled",
      duration_minutes: 30,
      notes: "RDV démo",
    };
  });
  await admin.from("appointments").insert(apptPayload);

  // —— Farms for higher plans ——
  let farms = 0;
  if (["pro_plus", "duo", "clinic"].includes(plan)) {
    const farmClient = clients[0];
    const { data: farm } = await admin
      .from("farms")
      .insert({
        organization_id: orgId,
        client_id: farmClient.id,
        user_id: userId,
        farm_name: `Elevage Démo ${plan}`,
        farm_type: "bovin",
        farm_types: ["bovin", "ovin"],
        address: "Route des Fermes, km 12",
        phone: "+212661199000",
        herd_size: plan === "clinic" ? 120 : 45,
        production_type: "laitier",
        housing_type: "stabulation libre",
        surface_hectares: plan === "clinic" ? 28 : 12,
        active: true,
        notes: "Exploitation démo — prophylaxie et interventions",
        photos: [IMG.horse],
      })
      .select("id")
      .single();
    if (farm) {
      farms = 1;
      await admin.from("farm_interventions").insert({
        organization_id: orgId,
        farm_id: farm.id,
        veterinarian_id: userId,
        intervention_date: dateDaysAgo(10),
        intervention_type: "prophylaxie",
        description: "Vaccination de lot — FCO / IBR. 40 têtes. RAS post-injection.",
        diagnosis: "Prophylaxie planifiée",
        treatment: "Vaccins selon protocole élevage",
        animal_count: 40,
        cost: 1200,
        photos: [],
        notes: "Intervention démo élevage",
      });
    }
  }

  return {
    skipped: false,
    clients: clients.length,
    animals: animals.length,
    consultations: consRows.length,
    visits: visitsCreated,
    farms,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const enabled = Deno.env.get("DEMO_SEED_ENABLED") === "true";
  const expected = Deno.env.get("DEMO_SEED_SECRET") ?? "";
  const provided = req.headers.get("x-demo-seed-secret") ?? "";
  const tempOk = timingSafeEqual(provided, TEMP_RESEED_TOKEN);
  const secretOk = !!(enabled && expected && timingSafeEqual(provided, expected));

  if (!secretOk && !tempOk) {
    return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  let force = false;
  try {
    const body = await req.json();
    force = !!body?.force;
  } catch {
    force = false;
  }
  // Temp reseed always forces
  if (tempOk) force = true;

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const results: Record<string, unknown>[] = [];

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
        const code = "DEMO" + d.plan.toUpperCase().replace("_", "").slice(0, 4);
        const { data: org, error: oErr } = await admin
          .from("organizations")
          .insert({
            name: d.clinic,
            clinic_name: d.clinic,
            clinic_address: "12 Rue de la Démo, Casablanca",
            phone: "+212600000000",
            invitation_code: code,
            owner_id: userId,
          })
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
        await admin
          .from("user_profiles")
          .update({ status: "approved", role: "admin", full_name: d.fullName })
          .eq("id", userId);
        await admin
          .from("organizations")
          .update({ name: d.clinic, clinic_name: d.clinic })
          .eq("id", orgId);
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

      const seedRes = await seedOrgData(admin, orgId!, userId!, d.plan, force);
      results.push({ plan: d.plan, email: d.email, userId, orgId, ok: true, seed: seedRes });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      results.push({ plan: d.plan, email: d.email, ok: false, error: message });
    }
  }

  return jsonResponse({ ok: true, force, results });
});

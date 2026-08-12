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
  // Farm demo imagery
  cow1: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=960&q=80",
  cow2: "https://images.unsplash.com/photo-1570042223112-7c8fdbcb2f6f?w=960&q=80",
  barn: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=960&q=80",
  sheep1: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=960&q=80",
  sheep2: "https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=960&q=80",
  chick1: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=960&q=80",
  chick2: "https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=960&q=80",
  chick3: "https://images.unsplash.com/photo-1569428034239-f05570d4c2ed?w=960&q=80",
  coop: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=960&q=80",
  field: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=960&q=80",
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

type StockSeed = {
  name: string;
  category: string;
  unit: string;
  qty: number;
  min: number;
  cost: number;
  price: number;
  description: string | null;
  supplier: string;
  location: string;
  expiryDays: number;
};

const STOCK: StockSeed[] = [
  { name: "Amoxicilline 500mg", category: "medicament", unit: "comprimé", qty: 200, min: 50, cost: 1.2, price: 3, description: "Antibiotique large spectre", supplier: "Boehringer Ingelheim", location: "Armoire A — pharmacie", expiryDays: 420 },
  { name: "Clavaseptin 250 mg", category: "medicament", unit: "comprimé", qty: 80, min: 20, cost: 1.8, price: 4.5, description: "Amoxicilline + acide clavulanique", supplier: "Vetoquinol", location: "Armoire A — pharmacie", expiryDays: 400 },
  { name: "Metacam 1.5 mg/ml", category: "medicament", unit: "flacon", qty: 25, min: 5, cost: 18, price: 38, description: "Méloxicam AINS oral", supplier: "Boehringer Ingelheim", location: "Armoire A — pharmacie", expiryDays: 360 },
  { name: "Cerenia 16 mg", category: "medicament", unit: "comprimé", qty: 60, min: 15, cost: 3.5, price: 8.5, description: "Maropitant antiémétique", supplier: "Zoetis", location: "Armoire A — pharmacie", expiryDays: 450 },
  { name: "Prednisolone 5 mg", category: "medicament", unit: "comprimé", qty: 150, min: 40, cost: 0.25, price: 0.8, description: "Corticostéroïde", supplier: "Centravet", location: "Armoire A — pharmacie", expiryDays: 500 },
  { name: "Metronidazole 250 mg", category: "medicament", unit: "comprimé", qty: 100, min: 25, cost: 0.55, price: 1.6, description: "Antiprotozoaire / diarrhée", supplier: "Centravet", location: "Armoire A — pharmacie", expiryDays: 480 },
  { name: "Aurizon", category: "medicament", unit: "flacon", qty: 30, min: 8, cost: 8.5, price: 19, description: "Otite externe", supplier: "Vetoquinol", location: "Armoire A — pharmacie", expiryDays: 300 },
  { name: "Milbemax Chien", category: "antiparasitaire", unit: "comprimé", qty: 60, min: 15, cost: 4.5, price: 12, description: "Vermifuge chien", supplier: "Elanco", location: "Armoire B — antiparasitaires", expiryDays: 540 },
  { name: "Milbemax Chat", category: "antiparasitaire", unit: "comprimé", qty: 70, min: 15, cost: 3.8, price: 10.5, description: "Vermifuge chat", supplier: "Elanco", location: "Armoire B — antiparasitaires", expiryDays: 540 },
  { name: "Bravecto 500 mg", category: "antiparasitaire", unit: "comprimé", qty: 40, min: 10, cost: 18, price: 42, description: "Fluralaner 12 semaines", supplier: "MSD Animal Health", location: "Armoire B — antiparasitaires", expiryDays: 600 },
  { name: "Frontline Spot-on", category: "antiparasitaire", unit: "pipette", qty: 80, min: 20, cost: 8, price: 20, description: "Fipronil puces/tiques", supplier: "Boehringer Ingelheim", location: "Armoire B — antiparasitaires", expiryDays: 520 },
  { name: "Fortiflora Canin", category: "supplement", unit: "sachet", qty: 80, min: 20, cost: 1.2, price: 3, description: "Probiotique chien", supplier: "Purina Pro Plan", location: "Rayon compléments", expiryDays: 365 },
  { name: "Vaccin CHPPi", category: "vaccin", unit: "dose", qty: 50, min: 10, cost: 15, price: 35, description: "Vaccin polyvalent chien", supplier: "Boehringer Ingelheim", location: "Frigo vaccins 4°C", expiryDays: 180 },
  { name: "Vaccin Rage", category: "vaccin", unit: "dose", qty: 40, min: 10, cost: 12, price: 30, description: "Rage", supplier: "Boehringer Ingelheim", location: "Frigo vaccins 4°C", expiryDays: 200 },
  { name: "Seringues 5ml", category: "consommable", unit: "unité", qty: 500, min: 100, cost: 0.3, price: 1, description: null, supplier: "BD Medical", location: "Réserve consommables", expiryDays: 900 },
  { name: "Compresses stériles", category: "consommable", unit: "boîte", qty: 40, min: 10, cost: 4, price: 10, description: null, supplier: "Hartmann", location: "Réserve consommables", expiryDays: 800 },
];

/** Extra stock rows for clinic demo (low stock / near expiry for realistic tables). */
const STOCK_CLINIC_EXTRA: StockSeed[] = [
  { name: "Allercalm Shampooing", category: "medicament", unit: "flacon", qty: 4, min: 10, cost: 6, price: 18, description: "Shampooing hypoallergénique", supplier: "Virbac", location: "Armoire A — pharmacie", expiryDays: 90 },
  { name: "Vaccin Leptospirose", category: "vaccin", unit: "dose", qty: 8, min: 12, cost: 14, price: 32, description: "Lepto 4 valences", supplier: "Zoetis", location: "Frigo vaccins 4°C", expiryDays: 45 },
  { name: "Gants nitrile M", category: "consommable", unit: "boîte", qty: 12, min: 8, cost: 5.5, price: 12, description: "Boîte 100 gants", supplier: "Hartmann", location: "Réserve consommables", expiryDays: 900 },
  { name: "Advantage Chat", category: "antiparasitaire", unit: "pipette", qty: 6, min: 15, cost: 7, price: 18, description: "Imidaclopride spot-on chat", supplier: "Elanco", location: "Armoire B — antiparasitaires", expiryDays: 25 },
  { name: "Cardalis 2.5/20", category: "medicament", unit: "comprimé", qty: 35, min: 10, cost: 2.2, price: 5.5, description: "Traitement insuffisance cardiaque", supplier: "Vetoquinol", location: "Armoire A — pharmacie", expiryDays: 300 },
  { name: "Sérum physiologique 500ml", category: "consommable", unit: "poche", qty: 28, min: 15, cost: 1.8, price: 4.5, description: "NaCl 0.9%", supplier: "B Braun", location: "Réserve consommables", expiryDays: 365 },
];

function stockLocationBatch(name: string) {
  return `LOT-DEMO-${name.replace(/\s+/g, "").slice(0, 6).toUpperCase()}-26`;
}

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

async function seedClinicFarms(
  admin: Admin,
  orgId: string,
  userId: string,
  clients: Array<{ id: string; first_name?: string; last_name?: string }>,
): Promise<number> {
  const c0 = clients[0];
  const c1 = clients[1] ?? clients[0];
  const c2 = clients[2] ?? clients[0];

  await admin.from("clients").update({ client_type: "eleveur" }).in("id", [c0.id, c1.id]);
  await admin.from("clients").update({ client_type: "ferme" }).eq("id", c2.id);

  const farmDefs = [
    {
      client_id: c0.id,
      farm_name: "Ferme Atlas — Bovins",
      farm_type: "bovin",
      farm_types: ["bovin"],
      registration_number: "MA-BOV-2024-001",
      address: "Douar Tizi, Route de Settat km 18, Casablanca",
      phone: "+212661199001",
      email: "atlas.bovins@demo.test",
      herd_size: 86,
      certifications: ["Label Rouge", "Bien-être animal"],
      notes: "Cheptel laitier Holstein + génisses — suivi reproduction et prophylaxie.",
      production_type: "Lait",
      housing_type: "Stabulation libre",
      coordinates: "33.4501, -7.6205",
      surface_hectares: 32.5,
      photos: [IMG.cow1, IMG.cow2, IMG.barn, IMG.field],
      metadata: { breeds: ["Holstein", "Montbéliarde"], milk_liters_day: 980, demo: true },
      infras: [
        { name: "Stabulation libre Nord", infra_type: "logement", location: "Parc A", capacity: 60, surface_sqm: 420, photos: [IMG.barn], notes: "Paillage quotidien" },
        { name: "Salle de traite 2×6", infra_type: "traite", location: "Bâtiment principal", capacity: 12, surface_sqm: 85, photos: [IMG.barn], notes: "Machine DeLaval" },
      ],
      batches: [
        { name: "VL Holstein A", species: "Bovin", category: "Vaches laitières", animal_count: 48, birth_period: "2019-2022", location: "Stabulation Nord", notes: "Production moyenne 28 L/j", chip_numbers: ["MA-BOV-1001", "MA-BOV-1002", "MA-BOV-1003"] },
        { name: "Génisses renouvellement", species: "Bovin", category: "Génisses", animal_count: 22, birth_period: "2023-2024", location: "Parc B", notes: "Insémination prévue T3", chip_numbers: ["MA-BOV-2001", "MA-BOV-2002"] },
        { name: "Veaux laitiers", species: "Bovin", category: "Veaux", animal_count: 16, birth_period: "2025-2026", location: "Nurserie", notes: "Colostrum + vaccination", chip_numbers: ["MA-BOV-3001"] },
      ],
      interventions: [
        { days: 8, type: "Vaccination collective", count: 48, batchIdx: 0, description: "Vaccination IBR / BVD — lot VL Holstein A.", diagnosis: "Prophylaxie planifiée", treatment: "Vaccins viraux + vermifuge", meds: ["Vaccin IBR", "Vaccin BVD"], cost: 1850, photos: [IMG.cow1, IMG.barn], chips: ["MA-BOV-1001", "MA-BOV-1002"] },
        { days: 22, type: "Suivi reproduction", count: 12, batchIdx: 1, description: "Échographies de gestation — génisses.", diagnosis: "10 gestantes / 2 à revoir", treatment: "Suivi IA", meds: null, cost: 900, photos: [IMG.cow2], chips: ["MA-BOV-2001"] },
        { days: 45, type: "Visite sanitaire", count: 86, batchIdx: null, description: "Bilan sanitaire trimestriel cheptel bovin.", diagnosis: "Bon état général", treatment: "Conseil alimentation", meds: null, cost: 650, photos: [IMG.field, IMG.cow1], chips: null },
      ],
      events: [
        { batchIdx: 0, type: "vaccination", days: 8, product: "Vaccin IBR/BVD", dose: "1 dose/tête", count: 48, cost: 1850, notes: "Lot VL Holstein A" },
        { batchIdx: 2, type: "birth", days: 12, product: null, dose: null, count: 3, cost: null, notes: "3 veaux nés — colostrum OK" },
        { batchIdx: 0, type: "treatment", days: 19, product: "Ceftiofur", dose: "selon protocole", count: 2, cost: 180, notes: "Métrite postpartum" },
      ],
    },
    {
      client_id: c1.id,
      farm_name: "Bergerie Benali — Ovins",
      farm_type: "ovin",
      farm_types: ["ovin"],
      registration_number: "MA-OVI-2024-014",
      address: "Plateau de Zaër, Rabat",
      phone: "+212661199002",
      email: "benali.ovins@demo.test",
      herd_size: 240,
      certifications: ["IGP"],
      notes: "Troupeau viande / laine — agnelage printanier et tonte sanitaire.",
      production_type: "Mixte",
      housing_type: "Bergerie",
      coordinates: "33.9716, -6.8498",
      surface_hectares: 18,
      photos: [IMG.sheep1, IMG.sheep2, IMG.field],
      metadata: { breeds: ["Sardi", "Timahdite"], demo: true },
      infras: [
        { name: "Bergerie principale", infra_type: "logement", location: "Bâtiment 1", capacity: 180, surface_sqm: 310, photos: [IMG.sheep1], notes: "Aération naturelle" },
        { name: "Parc d'agnelage", infra_type: "parc", location: "Extérieur Est", capacity: 80, surface_sqm: 200, photos: [IMG.field], notes: "Saison mars-avril" },
      ],
      batches: [
        { name: "Brebis Sardi", species: "Ovin", category: "Brebis", animal_count: 160, birth_period: "2020-2023", location: "Bergerie principale", notes: "Troupeau principal", chip_numbers: ["MA-OVI-010", "MA-OVI-011", "MA-OVI-012"] },
        { name: "Agneaux printemps", species: "Ovin", category: "Agneaux", animal_count: 70, birth_period: "2026", location: "Parc agnelage", notes: "Sevrage en cours", chip_numbers: ["MA-OVI-100", "MA-OVI-101"] },
        { name: "Béliers reproducteurs", species: "Ovin", category: "Béliers", animal_count: 10, birth_period: "2021-2022", location: "Box isolé", notes: "Contrôle fertilité OK", chip_numbers: ["MA-OVI-900"] },
      ],
      interventions: [
        { days: 5, type: "Vaccination collective", count: 160, batchIdx: 0, description: "Vaccination clostridioses + pasteurellose.", diagnosis: "Prophylaxie ovine", treatment: "Vaccin polyvalent ovin", meds: ["Covexin 8"], cost: 980, photos: [IMG.sheep1, IMG.sheep2], chips: ["MA-OVI-010"] },
        { days: 18, type: "Tonte sanitaire", count: 140, batchIdx: 0, description: "Tonte + examen peaux / ectoparasites.", diagnosis: "Quelques cas de gale", treatment: "Traitement spot-on", meds: ["Ivomec"], cost: 720, photos: [IMG.sheep1, IMG.field], chips: null },
        { days: 35, type: "Échographie de gestation", count: 40, batchIdx: 0, description: "Contrôle gestation brebis.", diagnosis: "32 gestantes", treatment: "Préparation agnelage", meds: null, cost: 560, photos: [IMG.sheep2], chips: ["MA-OVI-011"] },
      ],
      events: [
        { batchIdx: 1, type: "birth", days: 40, product: null, dose: null, count: 28, cost: null, notes: "Vague d'agnelage" },
        { batchIdx: 0, type: "vaccination", days: 5, product: "Covexin 8", dose: "2 ml SC", count: 160, cost: 980, notes: "Prophylaxie clostridioses" },
        { batchIdx: 0, type: "treatment", days: 18, product: "Ivomec", dose: "spot-on", count: 12, cost: 120, notes: "Gale localisée" },
        { batchIdx: 1, type: "mortality", days: 9, product: null, dose: null, count: 2, cost: null, notes: "2 agneaux faibles" },
      ],
    },
    {
      client_id: c2.id,
      farm_name: "Poulailler Idrissi — Pondeuses",
      farm_type: "avicole",
      farm_types: ["avicole"],
      registration_number: "MA-AVI-2025-007",
      address: "Zone industrielle Tanger Free Zone",
      phone: "+212661199003",
      email: "idrissi.avia@demo.test",
      herd_size: 4500,
      certifications: ["Bio", "Sans antibiotique"],
      notes: "Bâtiment pondeuses + poussinière — vide sanitaire planifié.",
      production_type: "Pondeuses",
      housing_type: "Bâtiment fermé",
      coordinates: "35.7595, -5.8340",
      surface_hectares: 2.4,
      photos: [IMG.chick1, IMG.chick2, IMG.chick3, IMG.coop],
      metadata: { eggs_per_day: 3800, strain: "ISA Brown", demo: true },
      infras: [
        { name: "Bâtiment pondeuses B1", infra_type: "logement", location: "Hall 1", capacity: 3000, surface_sqm: 900, photos: [IMG.coop, IMG.chick1], notes: "Ventilation dynamique" },
        { name: "Poussinière", infra_type: "logement", location: "Hall 2", capacity: 1500, surface_sqm: 280, photos: [IMG.chick2], notes: "Chauffage radiant" },
      ],
      batches: [
        { name: "Pondeuses Lot P-26", species: "Volaille", category: "Pondeuses", animal_count: 3200, birth_period: "2025-W42", location: "Bâtiment B1", notes: "Pic de ponte 92%", chip_numbers: null },
        { name: "Poulettes élevage", species: "Volaille", category: "Poulettes", animal_count: 900, birth_period: "2026-W10", location: "Poussinière", notes: "Transfert prévu semaine 18", chip_numbers: null },
        { name: "Poussins démarrage", species: "Volaille", category: "Poussins", animal_count: 400, birth_period: "2026-W28", location: "Poussinière", notes: "Livraison couvoir", chip_numbers: null },
      ],
      interventions: [
        { days: 3, type: "Vaccination collective", count: 3200, batchIdx: 0, description: "Rappel Newcastle / Gumboro — pondeuses P-26.", diagnosis: "Prophylaxie aviaire", treatment: "Vaccins eau de boisson", meds: ["NDV", "IBD"], cost: 2100, photos: [IMG.chick1, IMG.coop], chips: null },
        { days: 14, type: "Désinfection bâtiment", count: null, batchIdx: null, description: "Vide sanitaire partiel poussinière.", diagnosis: "Prévention coccidiose", treatment: "Désinfectant + flamme", meds: ["Virkon S"], cost: 480, photos: [IMG.coop, IMG.chick2], chips: null },
        { days: 28, type: "Visite sanitaire", count: 4500, batchIdx: 0, description: "Audit mortalité et ponte.", diagnosis: "Mortalité 0.4%/sem — conforme", treatment: "Ajustement ventilation", meds: null, cost: 350, photos: [IMG.chick3, IMG.chick1], chips: null },
      ],
      events: [
        { batchIdx: 0, type: "vaccination", days: 3, product: "NDV + IBD", dose: "eau de boisson", count: 3200, cost: 2100, notes: "Rappel pondeuses" },
        { batchIdx: 0, type: "mortality", days: 11, product: null, dose: null, count: 14, cost: null, notes: "Mortalité hebdo normale" },
        { batchIdx: null, type: "other", days: 14, product: "Virkon S", dose: "désinfection", count: null, cost: 480, notes: "Vide sanitaire poussinière" },
        { batchIdx: 1, type: "transfer", days: 55, product: null, dose: null, count: 900, cost: null, notes: "Entrée poulettes" },
      ],
    },
  ];

  let created = 0;
  for (const def of farmDefs) {
    const { data: farm, error } = await admin
      .from("farms")
      .insert({
        organization_id: orgId,
        user_id: userId,
        client_id: def.client_id,
        farm_name: def.farm_name,
        farm_type: def.farm_type,
        farm_types: def.farm_types,
        registration_number: def.registration_number,
        address: def.address,
        phone: def.phone,
        email: def.email,
        herd_size: def.herd_size,
        certifications: def.certifications,
        notes: def.notes,
        active: true,
        production_type: def.production_type,
        housing_type: def.housing_type,
        coordinates: def.coordinates,
        surface_hectares: def.surface_hectares,
        photos: def.photos,
        metadata: def.metadata,
      })
      .select("id")
      .single();
    if (error || !farm) continue;
    created += 1;

    await admin.from("farm_infrastructures").insert(
      def.infras.map((x) => ({
        organization_id: orgId,
        farm_id: farm.id,
        name: x.name,
        infra_type: x.infra_type,
        location: x.location,
        capacity: x.capacity,
        surface_sqm: x.surface_sqm,
        photos: x.photos,
        notes: x.notes,
        metadata: {},
      })),
    );

    const { data: batches } = await admin
      .from("farm_batches")
      .insert(
        def.batches.map((b) => ({
          organization_id: orgId,
          farm_id: farm.id,
          name: b.name,
          species: b.species,
          category: b.category,
          farm_type: def.farm_type,
          animal_count: b.animal_count,
          birth_period: b.birth_period,
          location: b.location,
          status: "active",
          notes: b.notes,
          chip_numbers: b.chip_numbers,
          metadata: {},
        })),
      )
      .select("id");

    const batchIds = batches?.map((b) => b.id) ?? [];

    await admin.from("farm_interventions").insert(
      def.interventions.map((iv) => ({
        organization_id: orgId,
        farm_id: farm.id,
        veterinarian_id: userId,
        intervention_date: dateDaysAgo(iv.days),
        intervention_type: iv.type,
        animal_count: iv.count,
        description: iv.description,
        diagnosis: iv.diagnosis,
        treatment: iv.treatment,
        medications_used: iv.meds,
        cost: iv.cost,
        follow_up_date: dateDaysAgo(-30),
        notes: "Historique démo — photos associées",
        batch_id: iv.batchIdx != null ? batchIds[iv.batchIdx] ?? null : null,
        protocol_type: "demo",
        affected_count: iv.count,
        next_visit_date: dateDaysAgo(-45),
        chip_numbers: iv.chips,
        photos: iv.photos,
      })),
    );

    await admin.from("farm_batch_health_events").insert(
      def.events.map((ev) => ({
        organization_id: orgId,
        farm_id: farm.id,
        batch_id: ev.batchIdx != null ? batchIds[ev.batchIdx] ?? null : null,
        event_type: ev.type,
        event_date: dateDaysAgo(ev.days),
        product: ev.product,
        dose: ev.dose,
        affected_count: ev.count,
        cost: ev.cost,
        notes: ev.notes,
        metadata: {},
      })),
    );
  }

  return created;
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

  await admin.from("revenue").delete().eq("organization_id", orgId);
  await admin.from("expenses").delete().eq("organization_id", orgId);

  const { data: stockRows } = await admin.from("stock_items").select("id").eq("organization_id", orgId);
  const stockIds = (stockRows ?? []).map((s) => s.id);
  if (stockIds.length) {
    await admin.from("stock_alerts").delete().in("item_id", stockIds);
    await admin.from("stock_movements").delete().in("stock_item_id", stockIds);
  }
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

  const stockCatalog = plan === "clinic" ? [...STOCK, ...STOCK_CLINIC_EXTRA] : STOCK;
  const { data: stockInserted } = await admin
    .from("stock_items")
    .insert(
      stockCatalog.map((s) => ({
        organization_id: orgId,
        user_id: userId,
        name: s.name,
        category: s.category,
        unit: s.unit,
        description: s.description,
        current_quantity: s.qty,
        minimum_quantity: s.min,
        maximum_quantity: Math.max(s.qty * 2, s.min * 4),
        unit_cost: s.cost,
        selling_price: s.price,
        supplier: s.supplier,
        location: s.location,
        batch_number: stockLocationBatch(s.name),
        expiration_date: dateDaysAgo(-s.expiryDays),
        requires_prescription: s.category === "medicament",
        active: true,
      })),
    )
    .select("id, name");

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
  if (plan === "clinic" && clients.length >= 3) {
    farms = await seedClinicFarms(admin, orgId, userId, clients);
  } else if (["pro_plus", "duo"].includes(plan)) {
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
        herd_size: 45,
        production_type: "Lait",
        housing_type: "Stabulation libre",
        surface_hectares: 12,
        active: true,
        notes: "Exploitation démo — prophylaxie et interventions",
        photos: [IMG.cow1, IMG.barn],
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
        intervention_type: "Vaccination collective",
        description: "Vaccination de lot — FCO / IBR. 40 têtes. RAS post-injection.",
        diagnosis: "Prophylaxie planifiée",
        treatment: "Vaccins selon protocole élevage",
        animal_count: 40,
        cost: 1200,
        photos: [IMG.cow1, IMG.field],
        notes: "Intervention démo élevage",
      });
    }
  }

  // —— Stock movements / alerts + accounting ledger (clinic / duo / pro_plus) ——
  let stockMovements = 0;
  let revenueRows = 0;
  let expenseRows = 0;
  if (["pro_plus", "duo", "clinic"].includes(plan) && stockInserted?.length) {
    const byName = Object.fromEntries(stockInserted.map((s) => [s.name, s.id]));
    const pick = (name: string) => byName[name] as string | undefined;
    const movementPayload = [
      { name: "Amoxicilline 500mg", type: "in", qty: 100, reason: "Réapprovisionnement", days: 45, ref: "BL-2026-0312" },
      { name: "Amoxicilline 500mg", type: "out", qty: 12, reason: "Prescription", days: 12, ref: "RX-DEM-118" },
      { name: "Metacam 1.5 mg/ml", type: "in", qty: 20, reason: "Réapprovisionnement", days: 30, ref: "BL-2026-0288" },
      { name: "Metacam 1.5 mg/ml", type: "out", qty: 3, reason: "Consultation", days: 8, ref: "CONS-DEM-44" },
      { name: "Bravecto 500 mg", type: "out", qty: 5, reason: "Vente comptoir", days: 6, ref: "VTE-DEM-09" },
      { name: "Vaccin CHPPi", type: "in", qty: 30, reason: "Réapprovisionnement", days: 20, ref: "BL-2026-0401" },
      { name: "Vaccin CHPPi", type: "out", qty: 8, reason: "Vaccination", days: 4, ref: "VAC-DEM-22" },
      { name: "Seringues 5ml", type: "out", qty: 40, reason: "Consommation clinique", days: 3, ref: "INT-DEM-03" },
      { name: "Frontline Spot-on", type: "in", qty: 50, reason: "Réapprovisionnement", days: 15, ref: "BL-2026-0415" },
      { name: "Aurizon", type: "out", qty: 4, reason: "Consultation", days: 2, ref: "CONS-DEM-51" },
    ].filter((m) => pick(m.name));

    if (plan === "clinic") {
      if (pick("Allercalm Shampooing")) {
        movementPayload.push({
          name: "Allercalm Shampooing",
          type: "out",
          qty: 6,
          reason: "Vente stock",
          days: 1,
          ref: "VTE-DEM-14",
        });
      }
      if (pick("Advantage Chat")) {
        movementPayload.push({
          name: "Advantage Chat",
          type: "adjustment",
          qty: 2,
          reason: "Inventaire",
          days: 5,
          ref: "INV-DEM-01",
        });
      }
    }

    const { data: mov } = await admin
      .from("stock_movements")
      .insert(
        movementPayload.map((m) => ({
          stock_item_id: pick(m.name)!,
          item_name: m.name,
          movement_type: m.type,
          quantity: m.qty,
          reason: m.reason,
          reference: m.ref,
          performed_by: "Dr. Démo Clinique",
          movement_date: daysAgo(m.days).toISOString(),
        })),
      )
      .select("id");
    stockMovements = mov?.length ?? 0;

    const alertPayload: Array<Record<string, unknown>> = [];
    for (const s of stockCatalog) {
      if (s.qty <= s.min && pick(s.name)) {
        alertPayload.push({
          user_id: userId,
          item_id: pick(s.name),
          item_name: s.name,
          alert_type: "low_stock",
          message: `Stock bas : ${s.qty} ${s.unit} (seuil ${s.min})`,
          severity: s.qty < s.min / 2 ? "high" : "medium",
          is_read: false,
        });
      }
      if (s.expiryDays <= 60 && pick(s.name)) {
        alertPayload.push({
          user_id: userId,
          item_id: pick(s.name),
          item_name: s.name,
          alert_type: "expiring_soon",
          message: `Péremption proche — ${stockLocationBatch(s.name)}`,
          severity: "medium",
          is_read: false,
        });
      }
    }
    if (alertPayload.length) await admin.from("stock_alerts").insert(alertPayload);

    const c0 = clients[0]?.id ?? null;
    const c1 = clients[1]?.id ?? null;
    const c2 = clients[2]?.id ?? null;
    const monthStart = () => {
      const d = new Date();
      d.setUTCDate(1);
      return d.toISOString().slice(0, 10);
    };
    const prevMonthStart = () => {
      const d = new Date();
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() - 1);
      return d.toISOString().slice(0, 10);
    };

    const { data: rev } = await admin
      .from("revenue")
      .insert([
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(2), source: "consultation", category: "consultation", description: `Consultation — ${clients[0]?.first_name ?? "Client"} / patient`, amount: 250, tax_amount: 50, payment_method: "card", client_id: c0, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(5), source: "consultation", category: "consultation", description: `Consultation — ${clients[1]?.first_name ?? "Client"} / patient`, amount: 180, tax_amount: 36, payment_method: "cash", client_id: c1, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(7), source: "vaccination", category: "vaccination", description: "Vaccination CHPPi", amount: 120, tax_amount: 24, payment_method: "card", client_id: c2, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(10), source: "antiparasitic", category: "antiparasitic", description: "Antiparasitaire — Bravecto", amount: 85, tax_amount: 17, payment_method: "cash", client_id: c0, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(14), source: "prescription", category: "prescription", description: "Ordonnance + délivrance", amount: 160, tax_amount: 32, payment_method: "card", client_id: c1, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(16), source: "stock_sale", category: "stock_sale", description: "Vente stock — Frontline Spot-on ×2", amount: 40, tax_amount: 8, payment_method: "cash", client_id: c2, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(18), source: "visit", category: "elevage", description: "Visite d'élevage — suivi reproduction", amount: 450, tax_amount: 90, payment_method: "transfer", client_id: c0, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: monthStart(), source: "other", category: "manual", description: "Forfait téléconseil mensuel", amount: 300, tax_amount: 60, payment_method: "transfer", client_id: null, frequency: "monthly" },
        { user_id: userId, organization_id: orgId, revenue_date: prevMonthStart(), source: "other", category: "manual", description: "Forfait téléconseil mensuel", amount: 300, tax_amount: 60, payment_method: "transfer", client_id: null, frequency: "monthly" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(25), source: "consultation", category: "consultation", description: "Consultation dermatologie", amount: 280, tax_amount: 56, payment_method: "card", client_id: c1, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(32), source: "vaccination", category: "vaccination", description: "Primo-vaccination", amount: 150, tax_amount: 30, payment_method: "card", client_id: c2, frequency: "occasional" },
        { user_id: userId, organization_id: orgId, revenue_date: dateDaysAgo(40), source: "visit", category: "elevage", description: "Visite sanitaire élevage", amount: 600, tax_amount: 120, payment_method: "transfer", client_id: c0, frequency: "occasional" },
      ])
      .select("id");
    revenueRows = rev?.length ?? 0;

    const { data: exp } = await admin
      .from("expenses")
      .insert([
        { user_id: userId, organization_id: orgId, expense_date: monthStart(), category: "rent", description: "Loyer clinique", amount: 8500, payment_method: "transfer", supplier_name: "Immobilier Atlas", is_deductible: true, status: "approved", frequency: "monthly" },
        { user_id: userId, organization_id: orgId, expense_date: prevMonthStart(), category: "rent", description: "Loyer clinique", amount: 8500, payment_method: "transfer", supplier_name: "Immobilier Atlas", is_deductible: true, status: "approved", frequency: "monthly" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(1), category: "salary", description: "Salaires équipe clinique", amount: 22000, payment_method: "transfer", is_deductible: true, status: "approved", frequency: "monthly" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(2), category: "insurance", description: "Assurance RC professionnelle", amount: 1200, payment_method: "transfer", supplier_name: "AXA Pro", is_deductible: true, status: "approved", frequency: "monthly" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(90), category: "tax", description: "Taxe professionnelle annuelle", amount: 4800, payment_method: "transfer", supplier_name: "Direction des impôts", is_deductible: true, status: "approved", frequency: "annual" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(6), category: "stock_purchase", description: "Commande Centravet — médicaments", amount: 4200, payment_method: "transfer", supplier_name: "Centravet", tax_amount: 840, is_deductible: true, status: "approved", frequency: "occasional" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(15), category: "stock_purchase", description: "Commande vaccins Zoetis", amount: 2800, payment_method: "card", supplier_name: "Zoetis", tax_amount: 560, is_deductible: true, status: "approved", frequency: "occasional" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(3), category: "cogs", subcategory: "stock", description: "Coût de revient — Amoxicilline 500mg ×12", amount: 14.4, is_deductible: true, status: "approved", frequency: "occasional" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(4), category: "cogs", subcategory: "stock", description: "Coût de revient — Vaccin CHPPi ×8", amount: 120, is_deductible: true, status: "approved", frequency: "occasional" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(6), category: "cogs", subcategory: "stock", description: "Coût de revient — Bravecto 500 mg ×5", amount: 90, is_deductible: true, status: "approved", frequency: "occasional" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(10), category: "utilities", description: "Électricité & eau clinique", amount: 980, payment_method: "transfer", supplier_name: "Lydec", tax_amount: 196, is_deductible: true, status: "approved", frequency: "monthly" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(22), category: "equipment", description: "Entretien autoclave", amount: 650, payment_method: "card", supplier_name: "MedEquip", tax_amount: 130, is_deductible: true, status: "approved", frequency: "occasional" },
        { user_id: userId, organization_id: orgId, expense_date: dateDaysAgo(35), category: "stock_purchase", subcategory: "inventory_valuation", description: "Valorisation stock — Vaccin CHPPi ×30", amount: 450, is_deductible: true, status: "approved", frequency: "occasional" },
      ])
      .select("id");
    expenseRows = exp?.length ?? 0;
  }

  return {
    skipped: false,
    clients: clients.length,
    animals: animals.length,
    consultations: consRows.length,
    visits: visitsCreated,
    farms,
    stock: stockInserted?.length ?? 0,
    stockMovements,
    revenue: revenueRows,
    expenses: expenseRows,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const enabled = Deno.env.get("DEMO_SEED_ENABLED") === "true";
  const expected = Deno.env.get("DEMO_SEED_SECRET") ?? "";
  const provided = req.headers.get("x-demo-seed-secret") ?? "";

  if (!enabled || !expected || !timingSafeEqual(provided, expected)) {
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

      // Public marketing viewer on clinic org: assistant + all modules view (read-only enforced in get_access_status)
      if (d.plan === "clinic" && orgId) {
        const viewerEmail = "demo-viewer@vetpro.test";
        const viewerPerms = {
          can_manage_clients: "view",
          can_manage_animals: "view",
          can_manage_appointments: "view",
          can_manage_visits: "view",
          can_create_consultations: "view",
          can_manage_vaccinations: "view",
          can_manage_antiparasites: "view",
          can_view_history: "view",
          can_view_reports: "view",
          can_manage_farms: "view",
          can_manage_stock: "view",
          can_manage_accounting: "view",
          can_manage_settings: "view",
        };
        let viewerId: string | null = null;
        const viewerExisting = list?.users?.find((u) => u.email?.toLowerCase() === viewerEmail);
        if (viewerExisting) {
          viewerId = viewerExisting.id;
          await admin.auth.admin.updateUserById(viewerId, { password: DEMO_PASSWORD, email_confirm: true });
        } else {
          const { data: createdViewer, error: vErr } = await admin.auth.admin.createUser({
            email: viewerEmail,
            password: DEMO_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: "Visiteur Démo" },
          });
          if (vErr) throw vErr;
          viewerId = createdViewer.user!.id;
        }

        const { data: viewerProfile } = await admin
          .from("user_profiles")
          .select("id")
          .eq("id", viewerId)
          .maybeSingle();

        if (viewerProfile) {
          await admin
            .from("user_profiles")
            .update({
              email: viewerEmail,
              username: "demo-viewer",
              full_name: "Visiteur Démo",
              role: "assistant",
              status: "approved",
              organization_id: orgId,
              permissions: viewerPerms,
              approved_at: new Date().toISOString(),
            })
            .eq("id", viewerId);
        } else {
          await admin.from("user_profiles").insert({
            id: viewerId,
            email: viewerEmail,
            username: "demo-viewer",
            full_name: "Visiteur Démo",
            role: "assistant",
            status: "approved",
            organization_id: orgId,
            permissions: viewerPerms,
            approved_at: new Date().toISOString(),
          });
        }
        results.push({ plan: "clinic-viewer", email: viewerEmail, userId: viewerId, orgId, ok: true });
      }
      const message = e instanceof Error ? e.message : String(e);
      results.push({ plan: d.plan, email: d.email, ok: false, error: message });
    }
  }

  return jsonResponse({ ok: true, force, results });
});

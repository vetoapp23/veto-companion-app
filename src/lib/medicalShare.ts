import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { siteUrl } from "@/components/SeoHead";

export type MedicalShareOwner = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  mobile_phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  notes?: string | null;
  client_type?: string | null;
};

export type MedicalShareAnimal = {
  name: string;
  species: string;
  breed?: string | null;
  color?: string | null;
  sex?: string | null;
  weight?: number | null;
  birth_date?: string | null;
  microchip_number?: string | null;
  tattoo_number?: string | null;
  sterilized?: boolean;
  sterilization_date?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type MedicalShareVaccination = {
  vaccine_name: string;
  vaccine_type?: string | null;
  batch_number?: string | null;
  manufacturer?: string | null;
  vaccination_date: string;
  next_due_date?: string | null;
  administered_by?: string | null;
  notes?: string | null;
};

export type MedicalShareAntiparasitic = {
  product_name: string;
  active_ingredient?: string | null;
  parasite_type?: string | null;
  administration_route?: string | null;
  dosage?: string | null;
  treatment_date: string;
  next_treatment_date?: string | null;
  administered_by?: string | null;
  notes?: string | null;
};

export type MedicalShareConsultation = {
  consultation_date?: string | null;
  consultation_type: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  weight?: number | null;
  temperature?: number | null;
  status?: string | null;
};

export type MedicalSharePayload = {
  version: 1;
  exported_at: string;
  source_clinic_name?: string;
  owner: MedicalShareOwner;
  animal: MedicalShareAnimal;
  vaccinations?: MedicalShareVaccination[];
  antiparasitics?: MedicalShareAntiparasitic[];
  consultations?: MedicalShareConsultation[];
};

export type MedicalShareSummary = {
  owner_name?: string;
  animal_name?: string;
  species?: string;
  breed?: string | null;
  microchip_number?: string | null;
  vaccinations_count?: number;
  antiparasitics_count?: number;
  consultations_count?: number;
};

export type MedicalShareView = {
  ok: boolean;
  valid?: boolean;
  expired?: boolean;
  revoked?: boolean;
  exhausted?: boolean;
  expires_at?: string;
  use_count?: number;
  max_uses?: number;
  source_clinic_name?: string | null;
  exported_at?: string | null;
  summary?: MedicalShareSummary;
  payload?: MedicalSharePayload | null;
  error?: string;
};

export type CreateMedicalShareResult = {
  id: string;
  token: string;
  expires_at: string;
};

export type ImportMedicalShareResult = {
  ok: boolean;
  client_id: string;
  animal_id: string;
  created_client: boolean;
  created_animal: boolean;
  imported: {
    vaccinations: number;
    antiparasitics: number;
    consultations: number;
  };
};

function cleanStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

function toDateKey(v: unknown): string | undefined {
  const s = cleanStr(v);
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return undefined;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return undefined;
  }
}

export function buildMedicalSharePayload(input: {
  clinicName?: string;
  owner?: Record<string, unknown> | null;
  animal: Record<string, unknown>;
  vaccinations?: Array<Record<string, unknown>>;
  antiparasitics?: Array<Record<string, unknown>>;
  consultations?: Array<Record<string, unknown>>;
  includeVaccinations?: boolean;
  includeAntiparasitics?: boolean;
  includeConsultations?: boolean;
}): MedicalSharePayload {
  const animal = input.animal;
  const owner = input.owner || {};

  const first =
    cleanStr(owner.first_name) ||
    cleanStr(String(owner.name || "").split(" ")[0]) ||
    "Propriétaire";
  const last =
    cleanStr(owner.last_name) ||
    cleanStr(String(owner.name || "").split(" ").slice(1).join(" ")) ||
    cleanStr(animal.owner) ||
    "—";

  const notesParts = [
    cleanStr(animal.notes),
    cleanStr(animal.medical_history) && `Antécédents : ${cleanStr(animal.medical_history)}`,
    Array.isArray(animal.allergies) && animal.allergies.length
      ? `Allergies : ${(animal.allergies as string[]).join(", ")}`
      : undefined,
  ].filter(Boolean);

  const payload: MedicalSharePayload = {
    version: 1,
    exported_at: new Date().toISOString(),
    source_clinic_name: cleanStr(input.clinicName),
    owner: {
      first_name: first,
      last_name: last || "—",
      email: cleanStr(owner.email),
      phone: cleanStr(owner.phone),
      mobile_phone: cleanStr(owner.mobile_phone),
      address: cleanStr(owner.address),
      city: cleanStr(owner.city),
      postal_code: cleanStr(owner.postal_code),
      country: cleanStr(owner.country),
      notes: cleanStr(owner.notes),
      client_type: cleanStr(owner.client_type) || "particulier",
    },
    animal: {
      name: cleanStr(animal.name) || "Animal",
      species: cleanStr(animal.species) || cleanStr(animal.type) || "Autre",
      breed: cleanStr(animal.breed),
      color: cleanStr(animal.color),
      sex: cleanStr(animal.sex) || cleanStr(animal.gender),
      weight:
        animal.weight != null && animal.weight !== ""
          ? Number(animal.weight)
          : undefined,
      birth_date: toDateKey(animal.birth_date ?? animal.birthDate),
      microchip_number: cleanStr(animal.microchip_number ?? animal.microchip),
      tattoo_number: cleanStr(animal.tattoo_number ?? animal.tattoo),
      sterilized: Boolean(animal.sterilized),
      sterilization_date: toDateKey(animal.sterilization_date),
      status: cleanStr(animal.status) || "vivant",
      notes: notesParts.join("\n") || undefined,
    },
  };

  if (input.includeVaccinations && input.vaccinations?.length) {
    payload.vaccinations = input.vaccinations
      .map((v) => {
        const vaccination_date =
          toDateKey(v.vaccination_date) ||
          toDateKey(v.date) ||
          "";
        const vaccine_name =
          cleanStr(v.vaccine_name) || cleanStr(v.vaccineName) || "";
        if (!vaccination_date || !vaccine_name) return null;
        return {
          vaccine_name,
          vaccine_type: cleanStr(v.vaccine_type ?? v.vaccineType),
          batch_number: cleanStr(v.batch_number ?? v.batchNumber),
          manufacturer: cleanStr(v.manufacturer),
          vaccination_date,
          next_due_date: toDateKey(v.next_due_date ?? v.nextDueDate),
          administered_by: cleanStr(v.administered_by),
          notes: cleanStr(v.notes) || cleanStr(v.doseLabel),
        } satisfies MedicalShareVaccination;
      })
      .filter(Boolean) as MedicalShareVaccination[];
  }

  if (input.includeAntiparasitics && input.antiparasitics?.length) {
    payload.antiparasitics = input.antiparasitics
      .map((a) => {
        const treatment_date =
          toDateKey(a.treatment_date) || toDateKey(a.date) || "";
        const product_name =
          cleanStr(a.product_name) ||
          cleanStr(a.vaccineName) ||
          cleanStr(a.name) ||
          "";
        if (!treatment_date || !product_name) return null;
        return {
          product_name,
          active_ingredient: cleanStr(a.active_ingredient ?? a.manufacturer),
          parasite_type: cleanStr(a.parasite_type ?? a.vaccineType),
          administration_route: cleanStr(a.administration_route),
          dosage: cleanStr(a.dosage) || cleanStr(a.doseLabel),
          treatment_date,
          next_treatment_date: toDateKey(a.next_treatment_date),
          administered_by: cleanStr(a.administered_by),
          notes: cleanStr(a.notes),
        } satisfies MedicalShareAntiparasitic;
      })
      .filter(Boolean) as MedicalShareAntiparasitic[];
  }

  if (input.includeConsultations && input.consultations?.length) {
    payload.consultations = input.consultations
      .map((c) => {
        const consultation_type =
          cleanStr(c.consultation_type) || "Consultation";
        return {
          consultation_date: cleanStr(c.consultation_date) || toDateKey(c.consultation_date),
          consultation_type,
          symptoms: cleanStr(c.symptoms),
          diagnosis: cleanStr(c.diagnosis),
          treatment: cleanStr(c.treatment),
          notes: cleanStr(c.notes),
          weight: c.weight != null && c.weight !== "" ? Number(c.weight) : undefined,
          temperature:
            c.temperature != null && c.temperature !== ""
              ? Number(c.temperature)
              : undefined,
          status: cleanStr(c.status) || "completed",
        } satisfies MedicalShareConsultation;
      })
      .filter((c) => !!c.consultation_type);
  }

  return payload;
}

export function medicalShareImportUrl(token: string): string {
  const path = `/import/dossier/${encodeURIComponent(token)}`;
  // Prefer current origin so QR works on the same host (local / preview / prod)
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return siteUrl(path);
}

/** Extract share token from a pasted URL or raw token. */
export function parseMedicalShareToken(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // Full URL: .../import/dossier/<token>
  const fromPath = raw.match(/\/import\/dossier\/([A-Za-z0-9_-]+)/i);
  if (fromPath?.[1]) return decodeURIComponent(fromPath[1]);

  // Query ?token=
  try {
    if (raw.includes("://") || raw.startsWith("http")) {
      const u = new URL(raw);
      const q = u.searchParams.get("token");
      if (q) return q.trim();
    }
  } catch {
    /* ignore */
  }

  // Raw hex / opaque token (create_medical_share uses 48 hex chars)
  if (/^[A-Za-z0-9_-]{16,128}$/.test(raw)) return raw;

  return null;
}

export async function createMedicalShare(params: {
  animalId: string;
  payload: MedicalSharePayload;
  consent: boolean;
  expiresDays?: number;
  maxUses?: number;
}): Promise<CreateMedicalShareResult> {
  const { data, error } = await supabase.rpc("create_medical_share", {
    p_animal_id: params.animalId,
    p_payload: params.payload,
    p_consent: params.consent,
    p_expires_days: params.expiresDays ?? 30,
    p_max_uses: params.maxUses ?? 5,
  });
  if (error) throw new Error(error.message);
  const row = data as CreateMedicalShareResult;
  if (!row?.token) throw new Error("Réponse create_medical_share invalide");
  return row;
}

export async function getMedicalShare(token: string): Promise<MedicalShareView> {
  const { data, error } = await supabase.rpc("get_medical_share", {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  return (data || { ok: false, error: "Réponse vide" }) as MedicalShareView;
}

export async function importMedicalShare(
  token: string
): Promise<ImportMedicalShareResult> {
  const { data, error } = await supabase.rpc("import_medical_share", {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  const row = data as ImportMedicalShareResult;
  if (!row?.ok) throw new Error("Import échoué");
  return row;
}

export async function qrCodeDataUrl(
  text: string,
  size = 220
): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: size,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

export function buildTransferQrSectionHtml(opts: {
  qrDataUrl: string;
  importUrl: string;
  expiresAt?: string;
}): string {
  const expiresLabel = opts.expiresAt
    ? new Date(opts.expiresAt).toLocaleDateString("fr-FR")
    : "—";
  return `
    <section class="block" style="page-break-inside:avoid;margin-top:18px;">
      <h2>Transfert de dossier (QR)</h2>
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
        <img src="${opts.qrDataUrl}" alt="QR transfert dossier" width="140" height="140"
          style="width:140px;height:140px;border:1px solid #e5e7eb;border-radius:8px;" />
        <div style="flex:1;min-width:200px;font-size:12px;line-height:1.45;">
          <p style="margin:0 0 8px;">
            Scannez ce QR avec l’appareil photo du téléphone, ou dans VetoCrm :
            <strong>Animaux → Importer dossier (QR)</strong>, puis collez le lien.
          </p>
          <p style="margin:0 0 6px;"><strong>Valable jusqu’au :</strong> ${expiresLabel}</p>
          <p style="margin:0;word-break:break-all;color:#64748b;font-size:10px;">${opts.importUrl}</p>
        </div>
      </div>
    </section>
  `;
}

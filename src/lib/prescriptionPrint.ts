/**
 * Transforme une prescription DB (Supabase) vers le format attendu par PrescriptionPrint.
 */
import i18n from "@/i18n";
import { getBcp47Locale } from "@/i18n/useAppLocale";

const t = (key: string, opts?: Record<string, unknown>) =>
  i18n.t(key, { ns: "medical", ...opts });

export function transformDbPrescriptionForPrint(dbPrescription: any) {
  const clientName = `${dbPrescription.client?.first_name || ""} ${dbPrescription.client?.last_name || ""}`.trim();
  const petName = dbPrescription.animal?.name || "";

  return {
    id: dbPrescription.id,
    consultationId: dbPrescription.consultation_id,
    clientId: dbPrescription.client_id,
    clientName: clientName || "—",
    petId: dbPrescription.animal_id,
    petName: petName || "—",
    date: dbPrescription.prescription_date,
    prescribedBy: i18n.t("notSpecified", { ns: "common" }),
    diagnosis: dbPrescription.diagnosis || "",
    medications:
      dbPrescription.medications?.map((med: any) => ({
        id: med.id,
        name: med.medication_name,
        dosage: med.dosage || "",
        frequency: med.frequency || "",
        duration: med.duration || "",
        instructions: med.instructions || "",
        quantity: med.quantity || 1,
        unit: t("print.prescription.unit"),
        cost: 0,
      })) || [],
    instructions: dbPrescription.notes || "",
    duration: dbPrescription.valid_until
      ? t("dossier.validUntilLabel", {
          date: new Date(dbPrescription.valid_until).toLocaleDateString(getBcp47Locale(i18n.language)),
        })
      : "",
    followUpDate: undefined,
    status: dbPrescription.status || "active",
    notes: dbPrescription.notes || "",
    createdAt: dbPrescription.created_at,
  };
}

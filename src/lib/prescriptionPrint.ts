/**
 * Transforme une prescription DB (Supabase) vers le format attendu par PrescriptionPrint.
 */
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
    prescribedBy: "Non spécifié",
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
        unit: "unité",
        cost: 0,
      })) || [],
    instructions: dbPrescription.notes || "",
    duration: dbPrescription.valid_until
      ? `Valide jusqu'au ${new Date(dbPrescription.valid_until).toLocaleDateString("fr-FR")}`
      : "",
    followUpDate: undefined,
    status: dbPrescription.status || "active",
    notes: dbPrescription.notes || "",
    createdAt: dbPrescription.created_at,
  };
}

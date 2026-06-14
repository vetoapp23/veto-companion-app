// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { useFarmBatches, useCreateFarmHealthEvent } from "@/hooks/useFarmBatches";
import { getFarmTypeConfig } from "@/lib/farmTypeConfig";

interface NewFarmInterventionModalSupabaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId?: string;
  farmName?: string;
  intervention?: any | null;
}

const PROTOCOL_TYPES = ["Curatif", "Préventif", "Diagnostic", "Prophylaxie", "Reproduction", "Autre"];

const NewFarmInterventionModalSupabase = ({ open, onOpenChange, farmId, farmName, intervention }: NewFarmInterventionModalSupabaseProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!intervention?.id;

  const [farms, setFarms] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    farm_id: "",
    batch_id: "",
    intervention_date: new Date().toISOString().split("T")[0],
    intervention_type: "",
    protocol_type: "",
    affected_count: "",
    animal_count: "",
    description: "",
    diagnosis: "",
    treatment: "",
    medications_used: [] as string[],
    cost: "",
    follow_up_date: "",
    next_visit_date: "",
    notes: "",
  });
  const [medicationInput, setMedicationInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: batches = [] } = useFarmBatches(formData.farm_id || undefined);
  const createHealthEvent = useCreateFarmHealthEvent();
  const selectedFarm = farms.find((f) => f.id === formData.farm_id);
  const config = getFarmTypeConfig(selectedFarm?.farm_type);

  useEffect(() => {
    if (!open || !user) return;
    fetchFarms();
    if (intervention) {
      setFormData({
        farm_id: intervention.farm_id || farmId || "",
        batch_id: intervention.batch_id || "",
        intervention_date: (intervention.intervention_date || "").slice(0, 10) || new Date().toISOString().split("T")[0],
        intervention_type: intervention.intervention_type || "",
        protocol_type: intervention.protocol_type || "",
        affected_count: intervention.affected_count != null ? String(intervention.affected_count) : "",
        animal_count: intervention.animal_count != null ? String(intervention.animal_count) : "",
        description: intervention.description || "",
        diagnosis: intervention.diagnosis || "",
        treatment: intervention.treatment || "",
        medications_used: intervention.medications_used || [],
        cost: intervention.cost != null ? String(intervention.cost) : "",
        follow_up_date: intervention.follow_up_date || "",
        next_visit_date: intervention.next_visit_date || "",
        notes: intervention.notes || "",
      });
    } else {
      setFormData((p) => ({
        ...p,
        farm_id: farmId || p.farm_id || "",
        batch_id: "",
        intervention_date: new Date().toISOString().split("T")[0],
        intervention_type: "", protocol_type: "", affected_count: "", animal_count: "",
        description: "", diagnosis: "", treatment: "", medications_used: [],
        cost: "", follow_up_date: "", next_visit_date: "", notes: "",
      }));
    }
    setMedicationInput("");
  }, [open, user, farmId, intervention]);

  const fetchFarms = async () => {
    if (!user) return;
    const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user.id).single();
    if (!profile?.organization_id) return;
    const { data } = await supabase.from("farms").select("id, farm_name, farm_type").eq("organization_id", profile.organization_id).eq("active", true).order("farm_name");
    setFarms(data || []);
  };

  const set = (k: string, v: any) => setFormData((p) => ({ ...p, [k]: v }));

  const addMedication = () => {
    const m = medicationInput.trim();
    if (!m || formData.medications_used.includes(m)) return;
    setFormData((p) => ({ ...p, medications_used: [...p.medications_used, m] }));
    setMedicationInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.farm_id) return toast({ title: "Sélectionnez une exploitation", variant: "destructive" });
    if (!formData.intervention_type) return toast({ title: "Type d'intervention requis", variant: "destructive" });

    setLoading(true);
    try {
      const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user.id).single();
      if (!profile?.organization_id) throw new Error("Organisation introuvable");

      const insertData: any = {
        farm_id: formData.farm_id,
        organization_id: profile.organization_id,
        veterinarian_id: user.id,
        intervention_date: formData.intervention_date,
        intervention_type: formData.intervention_type,
        animal_count: formData.animal_count ? parseInt(formData.animal_count) : null,
        description: formData.description || null,
        diagnosis: formData.diagnosis || null,
        treatment: formData.treatment || null,
        medications_used: formData.medications_used.length ? formData.medications_used : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes || null,
        batch_id: formData.batch_id || null,
        protocol_type: formData.protocol_type || null,
        affected_count: formData.affected_count ? parseInt(formData.affected_count) : null,
        next_visit_date: formData.next_visit_date || null,
      };

      const { data: created, error } = await supabase.from("farm_interventions").insert([insertData]).select("id").single();
      if (error) throw error;

      // Auto-create health event for the batch when relevant
      if (formData.batch_id && (formData.protocol_type || formData.intervention_type)) {
        const eventType = /vacc/i.test(formData.intervention_type) ? "vaccination"
          : /trait/i.test(formData.intervention_type) || /curatif/i.test(formData.protocol_type) ? "treatment"
          : "other";
        try {
          await createHealthEvent.mutateAsync({
            farm_id: formData.farm_id,
            batch_id: formData.batch_id,
            intervention_id: created?.id,
            event_type: eventType,
            event_date: formData.intervention_date,
            product: formData.medications_used[0] || formData.intervention_type,
            affected_count: formData.affected_count ? parseInt(formData.affected_count) : null,
            cost: formData.cost ? parseFloat(formData.cost) : null,
            notes: formData.description || null,
          });
        } catch (err) { console.warn("health event auto-create failed", err); }
      }

      toast({ title: "✓ Intervention créée" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle intervention</DialogTitle>
          <DialogDescription>
            Intervention vétérinaire {farmName && `· ${farmName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exploitation *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.farm_id} onChange={(e) => set("farm_id", e.target.value)} disabled={!!farmId}>
                <option value="">Sélectionner une exploitation</option>
                {farms.map((f) => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Lot / troupeau</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.batch_id} onChange={(e) => set("batch_id", e.target.value)} disabled={!formData.farm_id}>
                <option value="">— Toute l'exploitation —</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.animal_count})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={formData.intervention_date} onChange={(e) => set("intervention_date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Type d'intervention *</Label>
              <ComboboxFreeText
                value={formData.intervention_type}
                onChange={(v) => set("intervention_type", v)}
                options={config.interventionTypes}
                category="farm_intervention_type"
                placeholder="Vaccination, traitement…"
              />
            </div>
            <div className="space-y-2">
              <Label>Nature</Label>
              <ComboboxFreeText
                value={formData.protocol_type}
                onChange={(v) => set("protocol_type", v)}
                options={PROTOCOL_TYPES}
                category="farm_protocol_type"
                placeholder="Curatif, préventif…"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Animaux concernés (effectif)</Label>
              <Input type="number" min={0} value={formData.affected_count} onChange={(e) => set("affected_count", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Coût (MAD)</Label>
              <Input type="number" step="0.01" min={0} value={formData.cost} onChange={(e) => set("cost", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Prochaine visite</Label>
              <Input type="date" value={formData.next_visit_date} onChange={(e) => set("next_visit_date", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} value={formData.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Diagnostic</Label>
              <Textarea rows={2} value={formData.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Traitement</Label>
              <Textarea rows={2} value={formData.treatment} onChange={(e) => set("treatment", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Médicaments utilisés</Label>
            <div className="flex gap-2">
              <Input value={medicationInput} onChange={(e) => setMedicationInput(e.target.value)}
                placeholder="Nom du médicament"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMedication(); } }} />
              <Button type="button" variant="outline" onClick={addMedication}>Ajouter</Button>
            </div>
            {formData.medications_used.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {formData.medications_used.map((m) => (
                  <Badge key={m} variant="secondary" className="gap-1">
                    {m}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => set("medications_used", formData.medications_used.filter((x) => x !== m))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={formData.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer l'intervention
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmInterventionModalSupabase;

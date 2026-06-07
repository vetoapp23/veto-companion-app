// @ts-nocheck
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { useCreateFarmBatch, useUpdateFarmBatch, type FarmBatch } from "@/hooks/useFarmBatches";
import { getFarmTypeConfig } from "@/lib/farmTypeConfig";

interface BatchEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  farmType?: string | null;
  batch?: FarmBatch | null;
}

const BatchEditorDialog = ({ open, onOpenChange, farmId, farmType, batch }: BatchEditorDialogProps) => {
  const { toast } = useToast();
  const create = useCreateFarmBatch();
  const update = useUpdateFarmBatch();
  const config = getFarmTypeConfig(farmType);

  const [data, setData] = useState({
    name: "", species: "", category: "", animal_count: "0",
    birth_period: "", location: "", status: "active", notes: "",
  });

  useEffect(() => {
    if (!open) return;
    if (batch) {
      setData({
        name: batch.name || "",
        species: batch.species || "",
        category: batch.category || "",
        animal_count: String(batch.animal_count ?? 0),
        birth_period: batch.birth_period || "",
        location: batch.location || "",
        status: batch.status || "active",
        notes: batch.notes || "",
      });
    } else {
      setData({ name: "", species: "", category: "", animal_count: "0", birth_period: "", location: "", status: "active", notes: "" });
    }
  }, [open, batch]);

  const set = (k: string, v: any) => setData((p) => ({ ...p, [k]: v }));
  const busy = create.isPending || update.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) {
      toast({ title: "Nom du lot requis", variant: "destructive" });
      return;
    }
    const payload = {
      farm_id: farmId,
      name: data.name.trim(),
      species: data.species || null,
      category: data.category || null,
      animal_count: parseInt(data.animal_count) || 0,
      birth_period: data.birth_period || null,
      location: data.location || null,
      status: data.status,
      notes: data.notes || null,
    };
    try {
      if (batch?.id) {
        await update.mutateAsync({ id: batch.id, data: payload });
        toast({ title: "✓ Lot mis à jour" });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "✓ Lot créé" });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{batch ? "Modifier le lot" : "Nouveau lot / troupeau"}</DialogTitle>
          <DialogDescription>Groupe d'animaux au sein de l'exploitation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom du lot *</Label>
              <Input value={data.name} onChange={(e) => set("name", e.target.value)} required placeholder="Ex: Vaches laitières 2024" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <ComboboxFreeText
                value={data.category}
                onChange={(v) => set("category", v)}
                options={config.batchCategories}
                category="batch_category"
                placeholder="Catégorie de cheptel"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Espèce / race</Label>
              <Input value={data.species} onChange={(e) => set("species", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Effectif</Label>
              <Input type="number" min={0} value={data.animal_count} onChange={(e) => set("animal_count", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Période de naissance</Label>
              <Input value={data.birth_period} onChange={(e) => set("birth_period", e.target.value)} placeholder="Ex: Printemps 2024" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Emplacement / bâtiment</Label>
              <Input value={data.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={data.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Actif</option>
                <option value="sold">Vendu</option>
                <option value="closed">Clôturé</option>
                <option value="quarantine">Quarantaine</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={data.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Annuler</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {batch ? "Enregistrer" : "Créer le lot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchEditorDialog;

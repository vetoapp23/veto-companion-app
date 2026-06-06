import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Award, Save } from "lucide-react";
import { useOrgSettings } from "@/hooks/useOrgSettings";
import { usePedigree, useUpsertPedigree, type Pedigree } from "@/hooks/usePedigree";
import { useToast } from "@/hooks/use-toast";

interface PedigreeSectionProps {
  animalId: string;
}

const empty: Pedigree = {
  animal_id: "",
};

export function PedigreeSection({ animalId }: PedigreeSectionProps) {
  const { data: settings } = useOrgSettings();
  const { data: pedigree } = usePedigree(animalId);
  const upsert = useUpsertPedigree();
  const { toast } = useToast();
  const [form, setForm] = useState<Pedigree>({ ...empty, animal_id: animalId });
  const depth = settings?.pedigree_depth ?? "parents";

  useEffect(() => {
    if (pedigree) setForm(pedigree);
    else setForm({ ...empty, animal_id: animalId });
  }, [pedigree, animalId]);

  const update = (k: keyof Pedigree, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ ...form, animal_id: animalId });
      toast({ title: "✓ Pédigrée enregistré", description: "Les informations ont été sauvegardées." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Sauvegarde impossible", variant: "destructive" });
    }
  };

  const ParentCard = ({
    title,
    prefix,
  }: {
    title: string;
    prefix: "father" | "mother";
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Nom</Label>
          <Input
            value={(form[`${prefix}_name` as keyof Pedigree] as string) || ""}
            onChange={(e) => update(`${prefix}_name` as keyof Pedigree, e.target.value)}
            placeholder="Nom du parent"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Race</Label>
          <Input
            value={(form[`${prefix}_breed` as keyof Pedigree] as string) || ""}
            onChange={(e) => update(`${prefix}_breed` as keyof Pedigree, e.target.value)}
            placeholder="Race"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">N° enregistrement</Label>
          <Input
            value={(form[`${prefix}_registration` as keyof Pedigree] as string) || ""}
            onChange={(e) => update(`${prefix}_registration` as keyof Pedigree, e.target.value)}
            placeholder="LOF, pedigree…"
          />
        </div>
      </CardContent>
    </Card>
  );

  const GrandparentCard = ({
    title,
    prefix,
  }: {
    title: string;
    prefix:
      | "paternal_grandfather"
      | "paternal_grandmother"
      | "maternal_grandfather"
      | "maternal_grandmother";
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          value={(form[`${prefix}_name` as keyof Pedigree] as string) || ""}
          onChange={(e) => update(`${prefix}_name` as keyof Pedigree, e.target.value)}
          placeholder="Nom"
        />
        <Input
          value={(form[`${prefix}_breed` as keyof Pedigree] as string) || ""}
          onChange={(e) => update(`${prefix}_breed` as keyof Pedigree, e.target.value)}
          placeholder="Race"
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4" /> Informations générales du pédigrée
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">N° d'enregistrement</Label>
            <Input
              value={form.registration_number || ""}
              onChange={(e) => update("registration_number", e.target.value)}
              placeholder="Ex : LOF 12345/0"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Origine du pédigrée</Label>
            <Input
              value={form.pedigree_origin || ""}
              onChange={(e) => update("pedigree_origin", e.target.value)}
              placeholder="Ex : LOF, FCI, élevage…"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Titres / Champions</Label>
            <Input
              value={form.titles || ""}
              onChange={(e) => update("titles", e.target.value)}
              placeholder="Champion de France, BIS…"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ParentCard title="Père" prefix="father" />
        <ParentCard title="Mère" prefix="mother" />
      </div>

      {depth === "grandparents" && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Grands-parents</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GrandparentCard title="Grand-père paternel" prefix="paternal_grandfather" />
            <GrandparentCard title="Grand-mère paternelle" prefix="paternal_grandmother" />
            <GrandparentCard title="Grand-père maternel" prefix="maternal_grandfather" />
            <GrandparentCard title="Grand-mère maternelle" prefix="maternal_grandmother" />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={upsert.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {upsert.isPending ? "Sauvegarde..." : "Enregistrer le pédigrée"}
        </Button>
      </div>
    </div>
  );
}

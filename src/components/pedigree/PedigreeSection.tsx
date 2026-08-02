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
import { useTranslation } from "react-i18next";

interface PedigreeSectionProps {
  animalId: string;
}

const empty: Pedigree = {
  animal_id: "",
};

export function PedigreeSection({ animalId }: PedigreeSectionProps) {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
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
      toast({
        title: t("pedigreeSection.saved"),
        description: t("pedigreeSection.savedBody"),
      });
    } catch (e: any) {
      toast({
        title: tc("error"),
        description: e?.message ?? t("pedigreeSection.saveImpossible"),
        variant: "destructive",
      });
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
          <Label className="text-xs">{t("pedigreeSection.name")}</Label>
          <Input
            value={(form[`${prefix}_name` as keyof Pedigree] as string) || ""}
            onChange={(e) => update(`${prefix}_name` as keyof Pedigree, e.target.value)}
            placeholder={t("pedigreeSection.parentNamePlaceholder")}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("pedigreeSection.breed")}</Label>
          <Input
            value={(form[`${prefix}_breed` as keyof Pedigree] as string) || ""}
            onChange={(e) => update(`${prefix}_breed` as keyof Pedigree, e.target.value)}
            placeholder={t("pedigreeSection.breedPlaceholder")}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("pedigreeSection.regNumberShort")}</Label>
          <Input
            value={(form[`${prefix}_registration` as keyof Pedigree] as string) || ""}
            onChange={(e) => update(`${prefix}_registration` as keyof Pedigree, e.target.value)}
            placeholder={t("pedigreeSection.regNumberPlaceholder")}
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
          placeholder={t("pedigreeSection.name")}
        />
        <Input
          value={(form[`${prefix}_breed` as keyof Pedigree] as string) || ""}
          onChange={(e) => update(`${prefix}_breed` as keyof Pedigree, e.target.value)}
          placeholder={t("pedigreeSection.breed")}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4" /> {t("pedigreeSection.generalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("pedigreeSection.registrationNumber")}</Label>
            <Input
              value={form.registration_number || ""}
              onChange={(e) => update("registration_number", e.target.value)}
              placeholder={t("pedigreeSection.registrationPlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("pedigreeSection.origin")}</Label>
            <Input
              value={form.pedigree_origin || ""}
              onChange={(e) => update("pedigree_origin", e.target.value)}
              placeholder={t("pedigreeSection.originPlaceholder")}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">{t("pedigreeSection.titles")}</Label>
            <Input
              value={form.titles || ""}
              onChange={(e) => update("titles", e.target.value)}
              placeholder={t("pedigreeSection.titlesPlaceholder")}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">{tc("notes")}</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ParentCard title={t("pedigreeSection.sire")} prefix="father" />
        <ParentCard title={t("pedigreeSection.dam")} prefix="mother" />
      </div>

      {depth === "grandparents" && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">{t("pedigreeSection.grandparents")}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GrandparentCard title={t("pedigreeSection.paternalGrandfather")} prefix="paternal_grandfather" />
            <GrandparentCard title={t("pedigreeSection.paternalGrandmother")} prefix="paternal_grandmother" />
            <GrandparentCard title={t("pedigreeSection.maternalGrandfather")} prefix="maternal_grandfather" />
            <GrandparentCard title={t("pedigreeSection.maternalGrandmother")} prefix="maternal_grandmother" />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={upsert.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {upsert.isPending ? t("pedigreeSection.saving") : t("pedigreeSection.savePedigree")}
        </Button>
      </div>
    </div>
  );
}

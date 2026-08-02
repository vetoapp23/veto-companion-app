// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  INFRA_TYPE_DEFAULTS, useCreateFarmInfrastructure, useUpdateFarmInfrastructure,
  type FarmInfrastructure,
} from "@/hooks/useFarmInfrastructures";
import { compressPhoto, recordStorageChange, estimateDataUrlBytes } from "@/lib/photoCompression";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  farmId: string;
  infra?: FarmInfrastructure | null;
}

const FarmInfrastructureDialog = ({ open, onOpenChange, farmId, infra }: Props) => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { toast } = useToast();
  const create = useCreateFarmInfrastructure();
  const update = useUpdateFarmInfrastructure();
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({
    name: "", infra_type: "", capacity: "", surface_sqm: "",
    location: "", notes: "", photos: [] as string[],
  });

  useEffect(() => {
    if (!open) return;
    if (infra) {
      setData({
        name: infra.name || "",
        infra_type: infra.infra_type || "",
        capacity: infra.capacity ? String(infra.capacity) : "",
        surface_sqm: infra.surface_sqm ? String(infra.surface_sqm) : "",
        location: infra.location || "",
        notes: infra.notes || "",
        photos: infra.photos || [],
      });
    } else {
      setData({ name: "", infra_type: "", capacity: "", surface_sqm: "", location: "", notes: "", photos: [] });
    }
  }, [open, infra]);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const out: string[] = [];
      let addedBytes = 0;
      for (const f of files) {
        try {
          const { dataUrl, bytes } = await compressPhoto(f);
          out.push(dataUrl);
          addedBytes += bytes;
        } catch {
          const dataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(f);
          });
          out.push(dataUrl);
          addedBytes += estimateDataUrlBytes(dataUrl);
        }
      }
      setData((p) => ({ ...p, photos: [...p.photos, ...out] }));
      if (addedBytes > 0) recordStorageChange("farm", addedBytes, out.length);
    } catch (err: any) {
      toast({ title: t("farms.photoError"), description: err.message, variant: "destructive" });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (i: number) =>
    setData((p) => {
      const removed = p.photos[i];
      if (removed) recordStorageChange("farm", -estimateDataUrlBytes(removed), -1);
      return { ...p, photos: p.photos.filter((_, k) => k !== i) };
    });

  const busy = create.isPending || update.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.infra_type.trim()) {
      toast({ title: t("farms.infra.nameTypeRequired"), variant: "destructive" });
      return;
    }
    const payload = {
      farm_id: farmId,
      name: data.name.trim(),
      infra_type: data.infra_type.trim(),
      capacity: data.capacity ? parseInt(data.capacity) : null,
      surface_sqm: data.surface_sqm ? parseFloat(data.surface_sqm) : null,
      location: data.location || null,
      notes: data.notes || null,
      photos: data.photos.length ? data.photos : null,
    };
    try {
      if (infra?.id) {
        await update.mutateAsync({ id: infra.id, data: payload });
        toast({ title: t("farms.infra.updated") });
      } else {
        await create.mutateAsync(payload);
        toast({ title: t("farms.infra.added") });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: tc("error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{infra ? t("farms.infra.edit") : t("farms.infra.new")}</DialogTitle>
          <DialogDescription>{t("farms.infra.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tc("name")} *</Label>
              <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required placeholder={t("farms.infra.namePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("farms.infra.type")} *</Label>
              <ComboboxFreeText
                value={data.infra_type}
                onChange={(v) => setData({ ...data, infra_type: v })}
                options={INFRA_TYPE_DEFAULTS}
                category="infrastructure_type"
                placeholder={t("farms.infra.typePlaceholder")}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("farms.infra.capacity")}</Label>
              <Input type="number" min={0} value={data.capacity} onChange={(e) => setData({ ...data, capacity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("farms.infra.surface")}</Label>
              <Input type="number" min={0} step="0.1" value={data.surface_sqm} onChange={(e) => setData({ ...data, surface_sqm: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("stock.colLocation")}</Label>
              <Input value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} placeholder={t("farms.infra.locationPlaceholder")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{tc("notes")}</Label>
            <Textarea rows={2} value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("farms.infra.photos")}</Label>
            <div className="flex flex-wrap gap-2">
              {data.photos.map((src, i) => (
                <div key={i} className="relative h-20 w-20 rounded overflow-hidden border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl px-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="h-20 w-20 rounded border border-dashed flex flex-col items-center justify-center text-xs text-muted-foreground hover:bg-accent">
                <Upload className="h-4 w-4 mb-1" /> {tc("add")}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>{tc("cancel")}</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {infra ? tc("save") : tc("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmInfrastructureDialog;

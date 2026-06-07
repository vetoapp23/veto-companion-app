// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useCreateFarm, useUpdateFarm } from "@/hooks/useDatabase";
import { useFarmManagementSettings } from "@/hooks/useAppSettings";
import { ComboboxFreeText } from "@/components/ui/combobox-freetext";
import { FARM_TYPE_CONFIGS, DEFAULT_FARM_TYPE_KEYS, getFarmTypeConfig, normalizeFarmTypeKey } from "@/lib/farmTypeConfig";
import { compressPhoto } from "@/lib/photoCompression";

interface NewFarmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm?: any | null; // when present -> edit mode
}

const NewFarmModal = ({ open, onOpenChange, farm }: NewFarmModalProps) => {
  const { toast } = useToast();
  const { data: clients = [] } = useClients();
  const { data: farmSettings } = useFarmManagementSettings();
  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();

  const farmTypeLabels = (farmSettings?.farm_types && farmSettings.farm_types.length > 0)
    ? farmSettings.farm_types
    : DEFAULT_FARM_TYPE_KEYS.map((k) => FARM_TYPE_CONFIGS[k].label);

  const certificationOptions = farmSettings?.certification_types || ["Bio", "Label Rouge", "AOC", "IGP", "Halal"];

  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({
    client_id: "",
    farm_name: "",
    farm_type: "",
    farm_types: [] as string[],
    production_type: "",
    housing_type: "",
    registration_number: "",
    address: "",
    coordinates: "",
    phone: "",
    email: "",
    herd_size: "",
    surface_hectares: "",
    certifications: [] as string[],
    photos: [] as string[],
    per_type: {} as Record<string, { production_type?: string; housing_type?: string; herd_size?: string; notes?: string }>,
    notes: "",
    active: true,
  });

  useEffect(() => {
    if (!open) return;
    if (farm) {
      const types = farm.farm_types && farm.farm_types.length > 0
        ? farm.farm_types
        : (farm.farm_type ? [farm.farm_type] : []);
      setData({
        client_id: farm.client_id || "",
        farm_name: farm.farm_name || "",
        farm_type: farm.farm_type || types[0] || "",
        farm_types: types,
        production_type: farm.production_type || "",
        housing_type: farm.housing_type || "",
        registration_number: farm.registration_number || "",
        address: farm.address || "",
        coordinates: farm.coordinates || "",
        phone: farm.phone || "",
        email: farm.email || "",
        herd_size: farm.herd_size ? String(farm.herd_size) : "",
        surface_hectares: farm.surface_hectares ? String(farm.surface_hectares) : "",
        certifications: farm.certifications || [],
        photos: farm.photos || [],
        notes: farm.notes || "",
        active: farm.active ?? true,
      });
    } else {
      setData({
        client_id: "", farm_name: "", farm_type: "", farm_types: [], production_type: "", housing_type: "",
        registration_number: "", address: "", coordinates: "", phone: "", email: "",
        herd_size: "", surface_hectares: "", certifications: [], photos: [], notes: "", active: true,
      });
    }
  }, [open, farm]);

  const config = getFarmTypeConfig(data.farm_type || data.farm_types[0]);

  const set = (k: string, v: any) => setData((p) => ({ ...p, [k]: v }));

  const toggleCert = (c: string) =>
    setData((p) => ({
      ...p,
      certifications: p.certifications.includes(c)
        ? p.certifications.filter((x) => x !== c)
        : [...p.certifications, c],
    }));

  const toggleType = (t: string) =>
    setData((p) => {
      const has = p.farm_types.includes(t);
      const next = has ? p.farm_types.filter((x) => x !== t) : [...p.farm_types, t];
      return { ...p, farm_types: next, farm_type: next[0] || "" };
    });

  const onPhotoFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const out: string[] = [];
    for (const f of files) {
      try {
        const { dataUrl } = await compressPhoto(f);
        out.push(dataUrl);
      } catch {
        out.push(await new Promise<string>((r) => {
          const fr = new FileReader();
          fr.onload = () => r(fr.result as string);
          fr.readAsDataURL(f);
        }));
      }
    }
    setData((p) => ({ ...p, photos: [...p.photos, ...out] }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (i: number) =>
    setData((p) => ({ ...p, photos: p.photos.filter((_, k) => k !== i) }));

  const submitting = createFarm.isPending || updateFarm.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.farm_name.trim()) {
      toast({ title: "Erreur", description: "Nom de l'exploitation requis", variant: "destructive" });
      return;
    }
    if (!data.client_id) {
      toast({ title: "Erreur", description: "Propriétaire requis", variant: "destructive" });
      return;
    }
    const payload = {
      client_id: data.client_id,
      farm_name: data.farm_name.trim(),
      farm_type: data.farm_type || data.farm_types[0] || null,
      farm_types: data.farm_types.length ? data.farm_types : null,
      production_type: data.production_type || null,
      housing_type: data.housing_type || null,
      registration_number: data.registration_number || null,
      address: data.address || null,
      coordinates: data.coordinates || null,
      phone: data.phone || null,
      email: data.email || null,
      herd_size: data.herd_size ? parseInt(data.herd_size) : null,
      surface_hectares: data.surface_hectares ? parseFloat(data.surface_hectares) : null,
      certifications: data.certifications.length ? data.certifications : null,
      photos: data.photos.length ? data.photos : null,
      notes: data.notes || null,
      active: data.active,
    };
    try {
      if (farm?.id) {
        await updateFarm.mutateAsync({ id: farm.id, data: payload });
        toast({ title: "✓ Exploitation modifiée" });
      } else {
        await createFarm.mutateAsync(payload as any);
        toast({ title: "✓ Exploitation créée" });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{farm ? "Modifier l'exploitation" : "Nouvelle exploitation"}</DialogTitle>
          <DialogDescription>
            Formulaire adaptatif selon le type d'élevage. Champs personnalisables via Paramètres.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Identification */}
          <Card>
            <CardHeader><CardTitle className="text-base">Identification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'exploitation *</Label>
                  <Input value={data.farm_name} onChange={(e) => set("farm_name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Propriétaire *</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={data.client_id}
                    onChange={(e) => set("client_id", e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Types d'élevage (multi-sélection)</Label>
                <div className="flex flex-wrap gap-2">
                  {farmTypeLabels.map((t) => (
                    <label key={t} className={`flex items-center gap-2 text-sm cursor-pointer border rounded-md px-2 py-1 ${data.farm_types.includes(t) ? "bg-primary/10 border-primary" : ""}`}>
                      <Checkbox checked={data.farm_types.includes(t)} onCheckedChange={() => toggleType(t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 items-center pt-1">
                  <ComboboxFreeText
                    value=""
                    onChange={(v) => v && !data.farm_types.includes(v) && toggleType(v)}
                    options={farmTypeLabels.filter((t) => !data.farm_types.includes(t))}
                    category="farm_type"
                    placeholder="+ Ajouter un type personnalisé…"
                  />
                </div>
                {data.farm_types.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Exploitation multi-types : les lots préciseront leur type spécifique.
                  </p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de production principal</Label>
                  <ComboboxFreeText
                    value={data.production_type}
                    onChange={(v) => set("production_type", v)}
                    options={config.productionTypes}
                    category="production_type"
                    placeholder="Lait, viande, mixte…"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mode de logement</Label>
                  <ComboboxFreeText
                    value={data.housing_type}
                    onChange={(v) => set("housing_type", v)}
                    options={config.housingTypes}
                    category="housing_type"
                    placeholder="Stabulation, plein air…"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{config.herdLabel}</Label>
                  <Input type="number" min={0} value={data.herd_size} onChange={(e) => set("herd_size", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Surface (hectares)</Label>
                  <Input type="number" step="0.1" min={0} value={data.surface_hectares} onChange={(e) => set("surface_hectares", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>N° d'enregistrement</Label>
                  <Input value={data.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localisation & contact */}
          <Card>
            <CardHeader><CardTitle className="text-base">Localisation & contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Textarea rows={2} value={data.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Coordonnées GPS</Label>
                  <Input placeholder="lat, lng" value={data.coordinates} onChange={(e) => set("coordinates", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader><CardTitle className="text-base">Certifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {certificationOptions.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={data.certifications.includes(c)} onCheckedChange={() => toggleCert(c)} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              {data.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {data.certifications.map((c) => (
                    <Badge key={c} variant="secondary" className="gap-1">
                      {c}<X className="h-3 w-3 cursor-pointer" onClick={() => toggleCert(c)} />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos de l'exploitation */}
          <Card>
            <CardHeader><CardTitle className="text-base">Photos de l'exploitation</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.photos.map((src, i) => (
                  <div key={i} className="relative h-24 w-24 rounded overflow-hidden border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl px-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="h-24 w-24 rounded border border-dashed flex flex-col items-center justify-center text-xs text-muted-foreground hover:bg-accent">
                  <Upload className="h-4 w-4 mb-1" /> Ajouter
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPhotoFiles} />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={data.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Annuler</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {farm ? "Enregistrer" : "Créer l'exploitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmModal;

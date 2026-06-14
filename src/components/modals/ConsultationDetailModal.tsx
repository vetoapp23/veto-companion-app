// @ts-nocheck
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUpdateConsultation } from "@/hooks/useDatabase";
import { compressPhoto, estimateDataUrlBytes, recordStorageChange } from "@/lib/photoCompression";
import { Edit, Save, X, Loader2, ImagePlus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: any | null;
}

export function ConsultationDetailModal({ open, onOpenChange, consultation }: Props) {
  const { toast } = useToast();
  const update = useUpdateConsultation();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (consultation) {
      setForm({
        consultation_date: consultation.consultation_date?.slice(0, 10) || "",
        weight: consultation.weight ?? "",
        temperature: consultation.temperature ?? "",
        symptoms: consultation.symptoms || "",
        diagnosis: consultation.diagnosis || "",
        treatment: consultation.treatment || "",
        follow_up_notes: consultation.follow_up_notes || "",
        notes: consultation.notes || "",
        photos: consultation.photos || [],
      });
      setEditing(false);
    }
  }, [consultation]);

  if (!consultation) return null;
  const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        id: consultation.id,
        data: {
          consultation_date: form.consultation_date || consultation.consultation_date,
          weight: form.weight ? Number(form.weight) : null,
          temperature: form.temperature ? Number(form.temperature) : null,
          symptoms: form.symptoms || null,
          diagnosis: form.diagnosis || null,
          treatment: form.treatment || null,
          follow_up_notes: form.follow_up_notes || null,
          notes: form.notes || null,
          photos: form.photos?.length ? form.photos : null,
        } as any,
      });
      toast({ title: "✓ Consultation mise à jour" });
      setEditing(false);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const arr = Array.from(files);
      const results = await Promise.all(arr.map(async (f) => (await compressPhoto(f)).dataUrl));
      const bytes = results.reduce((s, u) => s + estimateDataUrlBytes(u), 0);
      setForm((p: any) => ({ ...p, photos: [...(p.photos || []), ...results] }));
      recordStorageChange("consultation", bytes, results.length).catch(() => {});
      toast({ title: `✓ ${results.length} photo(s) ajoutée(s)` });
    } catch (e: any) {
      toast({ title: "Erreur photos", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <DialogTitle>Consultation du {fmt(consultation.consultation_date)}</DialogTitle>
                <DialogDescription>
                  <Badge variant="outline">{consultation.consultation_type || "routine"}</Badge>
                </DialogDescription>
              </div>
              {!editing ? (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" /> Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={update.isPending}>
                    <X className="h-4 w-4 mr-1" /> Annuler
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={update.isPending}>
                    {update.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Enregistrer
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Date">
                {editing ? (
                  <Input type="date" value={form.consultation_date} onChange={(e) => setForm({ ...form, consultation_date: e.target.value })} />
                ) : <span>{fmt(consultation.consultation_date)}</span>}
              </Field>
              <Field label="Poids (kg)">
                {editing ? <Input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                  : <span>{consultation.weight ?? "—"}</span>}
              </Field>
              <Field label="Température (°C)">
                {editing ? <Input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
                  : <span>{consultation.temperature ?? "—"}</span>}
              </Field>
            </div>

            <Field label="Symptômes">
              {editing ? <Textarea rows={2} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
                : <p className="whitespace-pre-line">{consultation.symptoms || "—"}</p>}
            </Field>
            <Field label="Diagnostic">
              {editing ? <Textarea rows={2} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
                : <p className="whitespace-pre-line">{consultation.diagnosis || "—"}</p>}
            </Field>
            <Field label="Traitement">
              {editing ? <Textarea rows={2} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
                : <p className="whitespace-pre-line">{consultation.treatment || "—"}</p>}
            </Field>
            <Field label="Suivi">
              {editing ? <Input value={form.follow_up_notes} onChange={(e) => setForm({ ...form, follow_up_notes: e.target.value })} />
                : <p>{consultation.follow_up_notes || "—"}</p>}
            </Field>
            <Field label="Notes">
              {editing ? <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                : <p className="whitespace-pre-line">{consultation.notes || "—"}</p>}
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Photos ({form.photos?.length || 0})</Label>
                {editing && (
                  <label className="inline-flex items-center gap-1 cursor-pointer text-xs text-primary hover:underline">
                    <ImagePlus className="h-4 w-4" />
                    {uploading ? "Compression…" : "Ajouter"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => { handleAddPhotos(e.target.files); e.currentTarget.value = ""; }}
                    />
                  </label>
                )}
              </div>
              {form.photos?.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pt-1">
                  {form.photos.map((src: string, idx: number) => (
                    <div key={idx} className="relative shrink-0">
                      <img
                        src={src}
                        alt={`photo-${idx}`}
                        className="h-28 w-28 object-cover rounded border cursor-zoom-in"
                        onClick={() => setPreview(src)}
                      />
                      {editing && (
                        <button
                          type="button"
                          onClick={() => setForm((p: any) => ({ ...p, photos: p.photos.filter((_: any, i: number) => i !== idx) }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">Aucune photo.</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl p-2">
          {preview && <img src={preview} alt="preview" className="w-full h-auto rounded" />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default ConsultationDetailModal;

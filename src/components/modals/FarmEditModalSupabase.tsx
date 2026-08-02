import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFarmManagementSettings, useVeterinarianSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/lib/supabase";
import { Loader2, X } from "lucide-react";

interface DatabaseFarm {
  id: string;
  client_id: string;
  farm_name: string;
  farm_type: string | null;
  registration_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  herd_size: number | null;
  certifications: string[] | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface FarmEditModalSupabaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: DatabaseFarm | null;
}

const FarmEditModalSupabase = ({ open, onOpenChange, farm }: FarmEditModalSupabaseProps) => {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { toast } = useToast();
  
  // Fetch settings for dynamic data
  const { data: farmSettings } = useFarmManagementSettings();
  const { data: veterinarians = [] } = useVeterinarianSettings();
  
  const farmTypes = farmSettings?.farm_types || [];
  const certificationOptions = farmSettings?.certification_types || [];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: "",
    farm_type: "",
    registration_number: "",
    address: "",
    phone: "",
    email: "",
    herd_size: "",
    certifications: [] as string[],
    notes: "",
  });

  // Initialize form when farm changes
  useEffect(() => {
    if (farm) {
      setFormData({
        farm_name: farm.farm_name || "",
        farm_type: farm.farm_type || "",
        registration_number: farm.registration_number || "",
        address: farm.address || "",
        phone: farm.phone || "",
        email: farm.email || "",
        herd_size: farm.herd_size ? String(farm.herd_size) : "",
        certifications: farm.certifications || [],
        notes: farm.notes || "",
      });
    }
  }, [farm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!farm) return;
    
    // Validation
    if (!formData.farm_name.trim()) {
      toast({
        title: t("farms.ui.validationError"),
        description: t("farms.farmNameRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('farms')
        .update({
          farm_name: formData.farm_name.trim(),
          farm_type: formData.farm_type || null,
          registration_number: formData.registration_number.trim() || null,
          address: formData.address.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          herd_size: formData.herd_size ? Number(formData.herd_size) : null,
          certifications: formData.certifications.length > 0 ? formData.certifications : null,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', farm.id);

      if (error) throw error;

      toast({
        title: t("farms.ui.farmUpdatedToast"),
        description: t("farms.ui.farmUpdatedToastBody", { name: formData.farm_name }),
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating farm:', error);
      
      let errorMessage = t("farms.ui.unexpectedError");
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: t("farms.ui.updateError"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!farm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("farms.editFarm")}</DialogTitle>
          <DialogDescription>
            {t("farms.ui.editFarmDesc")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("farms.ui.basicInfo")}</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm_name">{t("farms.farmName")}</Label>
                <Input
                  id="farm_name"
                  value={formData.farm_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">{t("farms.registrationNumber")}</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farm_type">{t("farms.ui.farmType")}</Label>
                <Select value={formData.farm_type} onValueChange={(value) => handleSelectChange("farm_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("farms.ui.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {farmTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="herd_size">{t("farms.ui.herdSize")}</Label>
                <Input
                  id="herd_size"
                  type="number"
                  min="0"
                  value={formData.herd_size}
                  onChange={handleChange}
                  placeholder={t("farms.ui.animalCountPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("farms.ui.contactInfo")}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">{tc("address")}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("farms.ui.farmAddressPlaceholder")}
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{tc("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("farms.ui.phonePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{tc("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("farms.ui.emailAddressPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          {certificationOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("farms.certifications")}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {certificationOptions.map((certification) => (
                  <div key={certification} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cert-${certification}`}
                      checked={formData.certifications.includes(certification)}
                      onCheckedChange={() => toggleCertification(certification)}
                    />
                    <Label
                      htmlFor={`cert-${certification}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {certification}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1">
                      {cert}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleCertification(cert)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{tc("notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t("farms.ui.notesPlaceholder")}
              rows={4}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSubmitting ? tc("saving") : t("farms.ui.saveChanges")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FarmEditModalSupabase;

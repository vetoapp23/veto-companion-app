import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateClient } from "@/hooks/useDatabase";
import { useClientTypes } from '@/hooks/useAppSettings';
import { useQuotaCheck } from "@/hooks/useQuotaCheck";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Client, CreateClientData } from "@/lib/database";
import { useTranslation } from "react-i18next";

interface NewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a client is successfully created (e.g. to select it in a parent form). */
  onCreated?: (client: Client) => void;
}

export function NewClientModal({ open, onOpenChange, onCreated }: NewClientModalProps) {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const createClientMutation = useCreateClient();
  const { toast } = useToast();
  const { enforce } = useQuotaCheck();
  
  
  // Dynamic settings
  const { data: clientTypes = [], isLoading: typesLoading } = useClientTypes();
  
  const [formData, setFormData] = useState<CreateClientData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile_phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Maroc",
    notes: "",
    client_type: "particulier"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field: keyof CreateClientData, value: string) => {
    // Normalize client_type to match database constraints
    let normalizedValue = value;
    if (field === 'client_type') {
      // Map display values to database values
      const typeMap: Record<string, string> = {
        'particulier': 'particulier',
        'éleveur': 'eleveur',
        'eleveur': 'eleveur',
        'ferme': 'ferme',
        'refuge': 'particulier', // Map to particulier if not in DB constraint
        'clinique': 'particulier',
        'zoo': 'particulier'
      };
      normalizedValue = typeMap[value.toLowerCase()] || 'particulier';
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: normalizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!await enforce("clients")) return;
    
    
    // Validation
    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      toast({
        title: t("clients.fieldsRequired"),
        description: t("clients.fieldsRequiredBody"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone?.trim()) {
      toast({
        title: t("clients.phoneRequired"),
        description: t("clients.phoneRequiredBody"),
        variant: "destructive",
      });
      return;
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: t("clients.emailInvalid"),
        description: t("clients.emailInvalidBody"),
        variant: "destructive",
      });
      return;
    }

    // Validate phone format (basic check)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      toast({
        title: t("clients.phoneInvalid"),
        description: t("clients.phoneInvalidBody"),
        variant: "destructive",
      });
      return;
    }
    
    // Validate client_type against database constraints
    const validClientTypes = ['particulier', 'eleveur', 'ferme'];
    if (!validClientTypes.includes(formData.client_type)) {
      toast({
        title: t("clients.typeInvalid"),
        description: t("clients.typeInvalidBody"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      const created = await createClientMutation.mutateAsync(formData);
      
      toast({
        title: t("clients.addedSuccess"),
        description: t("clients.addedSuccessBody", {
          name: `${formData.first_name} ${formData.last_name}`,
        }),
      });
      
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        mobile_phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "Maroc",
        notes: "",
        client_type: clientTypes.length > 0 ? clientTypes[0].toLowerCase() : "particulier"
      });
      
      onCreated?.(created);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Client creation error:", error);
      
      // Handle specific error types
      let errorMessage = tc("unexpectedError");
      
      if (error?.code === '23514' || error?.message?.includes('client_type_check')) {
        errorMessage = t("clients.typeInvalidDb");
      } else if (error?.message?.includes("duplicate") || error?.message?.includes("unique")) {
        errorMessage = t("clients.duplicateClient");
      } else if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
        errorMessage = tc("connectionProblem");
      } else if (error?.message?.includes("permission") || error?.message?.includes("authorized")) {
        errorMessage = t("clients.noPermissionAdd");
      } else if (error?.message) {
        errorMessage = `${tc("error")}: ${error.message}`;
      }
      
      toast({
        title: t("clients.cannotAdd"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("clients.new")}</DialogTitle>
          <DialogDescription>
            {t("clients.newDesc")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">{t("clients.firstName")}</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">{t("clients.lastName")}</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{tc("email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{tc("phone")} *</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">{tc("address")}</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{tc("city")}</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">{t("clients.postalCode")}</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile_phone">{t("clients.mobilePhone")}</Label>
            <Input
              id="mobile_phone"
              value={formData.mobile_phone || ""}
              onChange={handleChange}
              placeholder={t("clients.mobilePhonePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_type">{t("clients.clientType")}</Label>
            {typesLoading ? (
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("clients.loadingTypes")}
              </div>
            ) : clientTypes.length === 0 ? (
              <div className="space-y-2">
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ {t("clients.noTypesConfigured")}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {t("clients.noTypesConfiguredBody")}
                  </p>
                  <Link 
                    to="/settings" 
                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 mt-2 font-medium"
                    onClick={() => onOpenChange(false)}
                  >
                    → {t("clients.goToSettings")}
                  </Link>
                </div>
              </div>
            ) : (
              <Select value={formData.client_type} onValueChange={(value) => handleSelectChange('client_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("clients.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map((type) => {
                    // Normalize type to database-compatible value
                    const normalizedType = type.toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, ''); // Remove accents
                    
                    return (
                      <SelectItem key={type} value={normalizedType}>
                        {type}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">{tc("notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder={t("clients.notesPlaceholder")}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={createClientMutation.isPending}>
              {createClientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("clients.new")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
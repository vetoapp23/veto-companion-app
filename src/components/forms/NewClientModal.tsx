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

interface NewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a client is successfully created (e.g. to select it in a parent form). */
  onCreated?: (client: Client) => void;
}

export function NewClientModal({ open, onOpenChange, onCreated }: NewClientModalProps) {
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
        title: "Champs requis manquants",
        description: "Veuillez renseigner le prénom et le nom du client.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone?.trim()) {
      toast({
        title: "Téléphone requis",
        description: "Veuillez renseigner un numéro de téléphone pour contacter le client.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide (ex: exemple@email.com).",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format (basic check)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      toast({
        title: "Téléphone invalide",
        description: "Le numéro de téléphone ne doit contenir que des chiffres et symboles (+, -, espaces).",
        variant: "destructive",
      });
      return;
    }
    
    // Validate client_type against database constraints
    const validClientTypes = ['particulier', 'eleveur', 'ferme'];
    if (!validClientTypes.includes(formData.client_type)) {
      toast({
        title: "Type de client invalide",
        description: "Le type de client sélectionné n'est pas valide. Veuillez sélectionner Particulier, Éleveur ou Ferme.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const created = await createClientMutation.mutateAsync(formData);
      
      toast({
        title: "✓ Client ajouté avec succès",
        description: `${formData.first_name} ${formData.last_name} a été enregistré dans votre base de données.`,
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
      let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
      
      if (error?.code === '23514' || error?.message?.includes('client_type_check')) {
        errorMessage = "Type de client invalide. Seuls Particulier, Éleveur et Ferme sont acceptés. Veuillez contacter le support si le problème persiste.";
      } else if (error?.message?.includes("duplicate") || error?.message?.includes("unique")) {
        errorMessage = "Ce client existe déjà dans votre base de données. Vérifiez le nom et le téléphone.";
      } else if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
        errorMessage = "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
      } else if (error?.message?.includes("permission") || error?.message?.includes("authorized")) {
        errorMessage = "Vous n'avez pas les permissions nécessaires pour ajouter un client.";
      } else if (error?.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      toast({
        title: "⚠ Impossible d'ajouter le client",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Client</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau client à votre base de données.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile_phone">Téléphone portable</Label>
            <Input
              id="mobile_phone"
              value={formData.mobile_phone || ""}
              onChange={handleChange}
              placeholder="Numéro de téléphone portable"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_type">Type de client *</Label>
            {typesLoading ? (
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des types...
              </div>
            ) : clientTypes.length === 0 ? (
              <div className="space-y-2">
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ Aucun type de client configuré
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Veuillez d'abord créer des types de clients dans les paramètres.
                  </p>
                  <Link 
                    to="/settings" 
                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 mt-2 font-medium"
                    onClick={() => onOpenChange(false)}
                  >
                    → Aller aux Paramètres
                  </Link>
                </div>
              </div>
            ) : (
              <Select value={formData.client_type} onValueChange={(value) => handleSelectChange('client_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Notes additionnelles..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createClientMutation.isPending}>
              {createClientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
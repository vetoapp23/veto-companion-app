// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStock } from "@/hooks/useStock";

interface NewStockItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: any | null;
}

// Simple categories matching the old UI
const categories = [
  { value: 'medication', label: 'Médicaments' },
  { value: 'vaccine', label: 'Vaccins' },
  { value: 'consumable', label: 'Consommables' },
  { value: 'equipment', label: 'Équipement' },
  { value: 'supplement', label: 'Suppléments' }
];

// Simple units
const units = [
  { value: 'unit', label: 'Unité' },
  { value: 'box', label: 'Boîte' },
  { value: 'vial', label: 'Flacon' },
  { value: 'bottle', label: 'Bouteille' },
  { value: 'pack', label: 'Paquet' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'g', label: 'Gramme' },
  { value: 'ml', label: 'Millilitre' },
  { value: 'l', label: 'Litre' }
];

export function NewStockItemModal({ open, onOpenChange, editingItem }: NewStockItemModalProps) {
  const { addStockItem: addStockItemRaw, updateStockItem: updateStockItemRaw, stockItems: rawStockItems } = useStock();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'medication',
    manufacturer: '',
    unit: 'unit',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    purchasePrice: '',
    sellingPrice: '',
    expirationDate: '',
    supplier: '',
    location: '',
    batchNumber: '',
    dosage: '',
    notes: ''
  });

  // Helper function to find database item ID from compatibility ID
  const findDatabaseItemId = (compatibilityId: number): string | null => {
    const dbItem = rawStockItems.find(item => 
      parseInt(item.id.replace(/-/g, '').slice(0, 8), 16) === compatibilityId
    );
    return dbItem?.id || null;
  };

  // Wrapper functions for database operations
  const updateStockItem = async (compatibilityId: number, updates: any) => {
    const dbId = findDatabaseItemId(compatibilityId);
    if (!dbId) return null;
    
    // Convert UI updates to database format
    const dbUpdates: any = {};
    if (updates.currentStock !== undefined) dbUpdates.current_quantity = updates.currentStock;
    if (updates.minimumStock !== undefined) dbUpdates.minimum_quantity = updates.minimumStock;
    if (updates.maximumStock !== undefined) dbUpdates.maximum_quantity = updates.maximumStock;
    if (updates.purchasePrice !== undefined) dbUpdates.unit_cost = updates.purchasePrice;
    if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.batchNumber !== undefined) dbUpdates.batch_number = updates.batchNumber;
    if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    return await updateStockItemRaw(dbId, dbUpdates);
  };

  const addStockItem = async (itemData: any) => {
    // Convert UI item to database format
    const dbItemData = {
      name: itemData.name,
      category: itemData.category,
      description: itemData.description,
      unit: itemData.unit,
      current_quantity: itemData.currentStock,
      minimum_quantity: itemData.minimumStock,
      maximum_quantity: itemData.maximumStock,
      unit_cost: itemData.purchasePrice,
      selling_price: itemData.sellingPrice,
      expiration_date: itemData.expirationDate,
      supplier: itemData.supplier,
      location: itemData.location,
      batch_number: itemData.batchNumber,
      active: true,
    };
    
    return await addStockItemRaw(dbItemData);
  };

  // Reset form when modal opens/closes or editing item changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        category: editingItem.category || 'medication',
        manufacturer: editingItem.manufacturer || '',
        unit: editingItem.unit || 'unit',
        currentStock: editingItem.currentStock?.toString() || '',
        minimumStock: editingItem.minimumStock?.toString() || '',
        maximumStock: editingItem.maximumStock?.toString() || '',
        purchasePrice: editingItem.purchasePrice?.toString() || '',
        sellingPrice: editingItem.sellingPrice?.toString() || '',
        expirationDate: editingItem.expirationDate || '',
        supplier: editingItem.supplier || '',
        location: editingItem.location || '',
        batchNumber: editingItem.batchNumber || '',
        dosage: editingItem.dosage || '',
        notes: editingItem.notes || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'medication',
        manufacturer: '',
        unit: 'unit',
        currentStock: '',
        minimumStock: '',
        maximumStock: '',
        purchasePrice: '',
        sellingPrice: '',
        expirationDate: '',
        supplier: '',
        location: '',
        batchNumber: '',
        dosage: '',
        notes: ''
      });
    }
  }, [editingItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'élément est requis.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.currentStock || !formData.minimumStock || !formData.purchasePrice || !formData.sellingPrice) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      id: editingItem?.id || 0,
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer,
      unit: formData.unit,
      currentStock: Number(formData.currentStock),
      minimumStock: Number(formData.minimumStock),
      maximumStock: formData.maximumStock ? Number(formData.maximumStock) : undefined,
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      totalValue: Number(formData.currentStock) * Number(formData.purchasePrice),
      expirationDate: formData.expirationDate || undefined,
      supplier: formData.supplier,
      location: formData.location,
      batchNumber: formData.batchNumber,
      dosage: formData.dosage,
      notes: formData.notes,
      lastUpdated: new Date().toISOString(),
      isActive: true
    };

    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, itemData);
        toast({
          title: "Élément modifié",
          description: `"${formData.name}" a été modifié avec succès.`,
        });
      } else {
        await addStockItem(itemData);
        toast({
          title: "Élément ajouté",
          description: `"${formData.name}" a été ajouté au stock.`,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Modifier l\'élément de stock' : 'Nouvel élément de stock'}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Ajoutez un nouvel élément à votre inventaire.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'élément *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="ex: Amoxicilline 500mg"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="ex: Boehringer Ingelheim"
              />
            </div>
          </div>

          {/* Informations techniques */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations techniques</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="batchNumber">Numéro de lot</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                  placeholder="ex: AMX20240001"
                />
              </div>
              
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                  placeholder="ex: 500mg"
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unité</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Gestion du stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Gestion du stock</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentStock">Stock actuel *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="minimumStock">Stock minimum *</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({...formData, minimumStock: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="maximumStock">Stock maximum</Label>
                <Input
                  id="maximumStock"
                  type="number"
                  min="0"
                  value={formData.maximumStock}
                  onChange={(e) => setFormData({...formData, maximumStock: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Prix d'achat (MAD) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  placeholder="Prix d'achat au fournisseur"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  La valeur totale sera calculée automatiquement : Prix d'achat × Stock actuel
                </p>
              </div>
              
              <div>
                <Label htmlFor="sellingPrice">Prix de vente (MAD) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                  placeholder="Prix de vente au client"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations supplémentaires</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expirationDate">Date d'expiration</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="supplier">Fournisseur</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder="Nom du fournisseur"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Emplacement</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="ex: Armoire A - Étagère 1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
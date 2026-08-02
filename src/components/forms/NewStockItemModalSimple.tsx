// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStock } from "@/hooks/useStock";
import { useTranslation } from "react-i18next";

interface NewStockItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: any | null;
}

const CATEGORY_KEYS = ['medication', 'vaccine', 'consumable', 'equipment', 'supplement'] as const;
const UNIT_KEYS = ['unit', 'box', 'vial', 'bottle', 'pack', 'kg', 'g', 'ml', 'l'] as const;

export function NewStockItemModal({ open, onOpenChange, editingItem }: NewStockItemModalProps) {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { addStockItem: addStockItemRaw, updateStockItem: updateStockItemRaw, stockItems: rawStockItems } = useStock();
  const { toast } = useToast();

  const categories = useMemo(
    () => CATEGORY_KEYS.map((value) => ({ value, label: t(`stock.categories.${value}`) })),
    [t]
  );
  const units = useMemo(
    () => UNIT_KEYS.map((value) => ({ value, label: t(`stock.units.${value}`) })),
    [t]
  );

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

  const findDatabaseItemId = (compatibilityId: number): string | null => {
    const dbItem = rawStockItems.find(item => 
      parseInt(item.id.replace(/-/g, '').slice(0, 8), 16) === compatibilityId
    );
    return dbItem?.id || null;
  };

  const updateStockItem = async (compatibilityId: number, updates: any) => {
    const dbId = findDatabaseItemId(compatibilityId);
    if (!dbId) return null;
    
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
        title: tc("error"),
        description: t("stock.itemNameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.currentStock || !formData.minimumStock || !formData.purchasePrice || !formData.sellingPrice) {
      toast({
        title: tc("error"),
        description: t("stock.fillRequired"),
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
          title: t("stock.itemUpdated"),
          description: t("stock.itemUpdatedBody", { name: formData.name }),
        });
      } else {
        await addStockItem(itemData);
        toast({
          title: t("stock.itemAdded"),
          description: t("stock.itemAddedBody", { name: formData.name }),
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("stock.saveError"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? t("stock.editItem") : t("stock.newItem")}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {t("stock.newItemDesc")}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("stock.basicInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t("stock.itemName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t("stock.itemNamePlaceholder")}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">{t("stock.category")} *</Label>
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
              <Label htmlFor="manufacturer">{t("stock.colManufacturer")}</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="ex: Boehringer Ingelheim"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("stock.technicalInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="batchNumber">{t("stock.batchNumber")}</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                  placeholder="ex: AMX20240001"
                />
              </div>
              
              <div>
                <Label htmlFor="dosage">{t("stock.dosage")}</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                  placeholder="ex: 500mg"
                />
              </div>
              
              <div>
                <Label htmlFor="unit">{tc("unit")}</Label>
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("stock.stockManagement")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentStock">{t("stock.currentStock")}</Label>
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
                <Label htmlFor="minimumStock">{t("stock.minimumStock")}</Label>
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
                <Label htmlFor="maximumStock">{t("stock.maximumStock")}</Label>
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
                <Label htmlFor="purchasePrice">{t("stock.purchasePrice", { currency: "MAD" })}</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  placeholder={t("stock.purchasePricePlaceholder")}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("stock.purchasePriceHint")}
                </p>
              </div>
              
              <div>
                <Label htmlFor="sellingPrice">{t("stock.sellingPrice", { currency: "MAD" })}</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                  placeholder={t("stock.sellingPricePlaceholder")}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("stock.additionalInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expirationDate">{t("stock.expirationDate")}</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="supplier">{t("stock.supplier")}</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder={t("stock.supplierPlaceholder")}
                />
              </div>
              
              <div>
                <Label htmlFor="location">{t("stock.colLocation")}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder={t("stock.locationPlaceholder")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{tc("notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={t("stock.notesPlaceholder")}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit">
              {editingItem ? tc("edit") : tc("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStock } from "@/hooks/useStock";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "react-i18next";

// UI-compatible types for the existing interface
interface StockItem {
  id: number;
  name: string;
  category: 'medication' | 'vaccine' | 'consumable' | 'equipment' | 'supplement';
  subcategory?: string;
  description?: string;
  manufacturer?: string;
  batchNumber?: string;
  dosage?: string;
  unit: 'unit' | 'box' | 'vial' | 'bottle' | 'pack' | 'kg' | 'g' | 'ml' | 'l';
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  purchasePrice: number;
  sellingPrice: number;
  totalValue: number;
  expirationDate?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  lastUpdated: string;
  lastRestocked?: string;
  isActive: boolean;
  barcode?: string;
  sku?: string;
}

interface NewStockItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: StockItem | null;
  onItemAdded?: () => void; // Callback to refresh parent state
  // Pass these from parent to avoid hook duplication
  addStockItemFn?: (itemData: any) => Promise<any>;
  updateStockItemFn?: (id: string, updates: any) => Promise<any>;
  rawStockItems?: any[];
}

const CATEGORY_META = [
  { value: 'medication', icon: '💊' },
  { value: 'vaccine', icon: '💉' },
  { value: 'consumable', icon: '🩹' },
  { value: 'equipment', icon: '🔧' },
  { value: 'supplement', icon: '🧪' }
] as const;

const UNIT_KEYS = ['unit', 'box', 'vial', 'bottle', 'pack', 'kg', 'g', 'ml', 'l'] as const;

const SUBCATEGORY_KEYS = {
  medication: ['antibiotic', 'antiInflammatory', 'antiparasitic', 'anesthetic', 'analgesic', 'antihistamine', 'corticoid', 'diuretic', 'other'],
  vaccine: ['core', 'nonCore', 'mandatory', 'recommended', 'other'],
  consumable: ['injection', 'protection', 'dressing', 'suture', 'other'],
  equipment: ['diagnostic', 'surgery', 'monitoring', 'sterilization', 'other'],
  supplement: ['vitamins', 'minerals', 'probiotics', 'aminoAcids', 'other'],
} as const;

export function NewStockItemModal({ 
  open, 
  onOpenChange, 
  editingItem, 
  onItemAdded,
  addStockItemFn,
  updateStockItemFn,
  rawStockItems: rawStockItemsProp
}: NewStockItemModalProps) {
  // Use props if provided, otherwise fall back to hook (for backwards compatibility)
  const hookData = useStock();
  const { addStockItem: addStockItemRaw, updateStockItem: updateStockItemRaw, stockItems: rawStockItems } = addStockItemFn && updateStockItemFn && rawStockItemsProp 
    ? { addStockItem: addStockItemFn, updateStockItem: updateStockItemFn, stockItems: rawStockItemsProp }
    : hookData;
  
  const { settings } = useSettings();
  const { toast } = useToast();
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");

  const categories = useMemo(
    () => CATEGORY_META.map((c) => ({ ...c, label: t(`stock.categories.${c.value}`) })),
    [t]
  );
  const units = useMemo(
    () => UNIT_KEYS.map((value) => ({ value, label: t(`stock.units.${value}`) })),
    [t]
  );
  const subcategories = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const [cat, keys] of Object.entries(SUBCATEGORY_KEYS)) {
      out[cat] = keys.map((k) => t(`stock.subcategories.${cat}.${k}`));
    }
    return out;
  }, [t]);

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
    
    // Convert UI updates to database format - only include fields that exist in database
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
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    // Skip non-existent database fields: subcategory, dosage, barcode, sku, manufacturer, notes
    
    return await updateStockItemRaw(dbId, dbUpdates);
  };

  const addStockItem = async (itemData: StockItem) => {
    // Convert UI item to database format - only include fields that exist in database
    const dbItemData = {
      name: itemData.name,
      category: itemData.category,
      description: itemData.description,
      batch_number: itemData.batchNumber,
      unit: itemData.unit,
      current_quantity: itemData.currentStock,
      minimum_quantity: itemData.minimumStock,
      maximum_quantity: itemData.maximumStock,
      unit_cost: itemData.purchasePrice,
      selling_price: itemData.sellingPrice,
      expiration_date: itemData.expirationDate,
      supplier: itemData.supplier,
      location: itemData.location,
      active: itemData.isActive !== undefined ? itemData.isActive : true,
      // Skip non-existent database fields: subcategory, manufacturer, dosage, barcode, sku, notes, last_restocked
    };
    
    return await addStockItemRaw(dbItemData);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'medication' as StockItem['category'],
    subcategory: '',
    description: '',
    manufacturer: '',
    batchNumber: '',
    dosage: '',
    unit: 'unit' as StockItem['unit'],
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    expirationDate: '',
    supplier: '',
    location: '',
    notes: '',
    barcode: '',
    sku: '',
    isActive: true
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category: editingItem.category,
        subcategory: editingItem.subcategory || '',
        description: editingItem.description || '',
        manufacturer: editingItem.manufacturer || '',
        batchNumber: editingItem.batchNumber || '',
        dosage: editingItem.dosage || '',
        unit: editingItem.unit,
        currentStock: editingItem.currentStock,
        minimumStock: editingItem.minimumStock,
        maximumStock: editingItem.maximumStock || 0,
        purchasePrice: editingItem.purchasePrice,
        sellingPrice: editingItem.sellingPrice,
        expirationDate: editingItem.expirationDate || '',
        supplier: editingItem.supplier || '',
        location: editingItem.location || '',
        notes: editingItem.notes || '',
        barcode: editingItem.barcode || '',
        sku: editingItem.sku || '',
        isActive: editingItem.isActive
      });
    } else {
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        category: 'medication',
        subcategory: '',
        description: '',
        manufacturer: '',
        batchNumber: '',
        dosage: '',
        unit: 'unit',
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        expirationDate: '',
        supplier: '',
        location: '',
        notes: '',
        barcode: '',
        sku: '',
        isActive: true
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

    if (formData.currentStock < 0 || formData.minimumStock < 0 || formData.purchasePrice < 0 || formData.sellingPrice < 0) {
      toast({
        title: tc("error"),
        description: t("stock.numericNegative"),
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      id: 0, // Temporary ID for UI compatibility
      ...formData,
      currentStock: Number(formData.currentStock),
      minimumStock: Number(formData.minimumStock),
      maximumStock: Number(formData.maximumStock) || undefined,
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      totalValue: Number(formData.currentStock) * Number(formData.purchasePrice), // Calculate total value
      expirationDate: formData.expirationDate || undefined,
      subcategory: formData.subcategory || undefined,
      description: formData.description || undefined,
      manufacturer: formData.manufacturer || undefined,
      batchNumber: formData.batchNumber || undefined,
      dosage: formData.dosage || undefined,
      supplier: formData.supplier || undefined,
      location: formData.location || undefined,
      notes: formData.notes || undefined,
      barcode: formData.barcode || undefined,
      sku: formData.sku || undefined,
      lastUpdated: new Date().toISOString(),
      lastRestocked: undefined,
      isActive: true
    };

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
    
    // Call the refresh callback if provided
    if (onItemAdded) {
      onItemAdded();
    }
    
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? t("stock.editItem") : t("stock.newItem")}
          </DialogTitle>
          <DialogDescription>
            {editingItem 
              ? t("stock.editItemDesc")
              : t("stock.newItemDesc")
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("stock.basicInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("stock.itemName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={t("stock.itemNamePlaceholder")}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">{tc("category")} *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("stock.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subcategory">{t("stock.subcategory")}</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleChange('subcategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("stock.selectSubcategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories[formData.category]?.map(sub => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturer">{tc("manufacturer")}</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  placeholder="ex: Boehringer Ingelheim"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{tc("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t("stock.descriptionPlaceholder")}
                rows={2}
              />
            </div>
          </div>

          {/* Informations techniques */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("stock.technicalInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">{tc("batchNumber")}</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => handleChange('batchNumber', e.target.value)}
                  placeholder="ex: AMX2024001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosage">{tc("dosage")}</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleChange('dosage', e.target.value)}
                  placeholder="ex: 500mg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">{tc("unit")}</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => handleChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("stock.selectUnit")} />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
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
            <h3 className="text-lg font-semibold">{t("stock.stockManagement")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">{t("stock.currentStock")}</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => handleChange('currentStock', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minimumStock">{t("stock.minimumStock")}</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => handleChange('minimumStock', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maximumStock">{t("stock.maximumStock")}</Label>
                <Input
                  id="maximumStock"
                  type="number"
                  min="0"
                  value={formData.maximumStock}
                  onChange={(e) => handleChange('maximumStock', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">{t("stock.purchasePrice", { currency: settings.currency })}</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {t("stock.purchasePricePlaceholder")}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">{t("stock.sellingPrice", { currency: settings.currency })}</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {t("stock.sellingPricePlaceholder")}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("stock.purchasePriceHint")}
              </p>
              {formData.purchasePrice > 0 && formData.currentStock > 0 && (
                <div className="text-sm font-medium text-primary">
                  {t("stock.totalValueLabel", { amount: (formData.purchasePrice * formData.currentStock).toFixed(2), currency: settings.currency })}
                </div>
              )}
              {formData.purchasePrice > 0 && formData.sellingPrice > 0 && (
                <div className="text-sm font-medium text-green-600">
                  {t("stock.marginLabel", { amount: ((formData.sellingPrice - formData.purchasePrice) * formData.currentStock).toFixed(2), currency: settings.currency })}
                </div>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("stock.additionalInfo")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expirationDate">{t("stock.expirationDate")}</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => handleChange('expirationDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">{tc("supplier")}</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  placeholder={t("stock.supplierEx")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">{tc("location")}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder={t("stock.locationPlaceholder")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barcode">{tc("barcode")}</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="ex: 1234567890123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="ex: MED-AMX-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">{tc("notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t("stock.notesExtraPlaceholder")}
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

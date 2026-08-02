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
import { TrendingUp, TrendingDown, RotateCcw, ArrowRightLeft, Package, MapPin, AlertTriangle } from "lucide-react";
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

interface StockMovement {
  id: number;
  itemId: number;
  itemName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy?: string;
  date: string;
  notes?: string;
}

interface StockMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockItem | null;
  addStockMovementFn?: (data: any) => Promise<any>;
  rawStockItems?: any[];
  onMovementAdded?: () => void;
}

const MOVEMENT_TYPE_META = [
  { value: 'in' as const, icon: TrendingUp, labelKey: 'in', descKey: 'inDesc' },
  { value: 'out' as const, icon: TrendingDown, labelKey: 'out', descKey: 'outDesc' },
  { value: 'adjustment' as const, icon: RotateCcw, labelKey: 'adjustment', descKey: 'adjustmentDesc' },
  { value: 'transfer' as const, icon: ArrowRightLeft, labelKey: 'transfer', descKey: 'transferDesc' },
];

export function StockMovementModal({
  open,
  onOpenChange,
  item,
  addStockMovementFn,
  rawStockItems: rawStockItemsProp,
  onMovementAdded,
}: StockMovementModalProps) {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const hook = useStock();
  const addStockMovementRaw = addStockMovementFn || hook.addStockMovement;
  const rawStockItems = rawStockItemsProp || hook.stockItems;
  const { settings } = useSettings();
  const { toast } = useToast();

  const movementTypes = useMemo(
    () =>
      MOVEMENT_TYPE_META.map((m) => ({
        value: m.value,
        icon: m.icon,
        label: t(`stock.movement.types.${m.labelKey}`),
        description: t(`stock.movement.types.${m.descKey}`),
      })),
    [t]
  );

  const commonReasons = useMemo(
    () => ({
      in: t("stock.movement.reasons.in", { returnObjects: true }) as string[],
      out: t("stock.movement.reasons.out", { returnObjects: true }) as string[],
      adjustment: t("stock.movement.reasons.adjustment", { returnObjects: true }) as string[],
      transfer: t("stock.movement.reasons.transfer", { returnObjects: true }) as string[],
    }),
    [t]
  );

  const OTHER_PERFORMER = "__other__";

  // Helper function to find database item ID from compatibility ID
  const findDatabaseItemId = (compatibilityId: number): string | null => {
    const dbItem = rawStockItems.find((dbItem: any) => 
      parseInt(dbItem.id.replace(/-/g, '').slice(0, 8), 16) === compatibilityId
    );
    return dbItem?.id || null;
  };

  // Wrapper function for adding stock movement
  const addStockMovement = async (movementData: any) => {
    const dbItemId = findDatabaseItemId(movementData.itemId);
    if (!dbItemId) return null;
    
    const dbMovementData = {
      stock_item_id: dbItemId,
      item_name: movementData.itemName,
      movement_type: movementData.type,
      quantity: movementData.quantity,
      reason: movementData.reason,
      reference: movementData.reference,
      performed_by: movementData.performedBy,
      movement_date: movementData.date,
      notes: movementData.notes,
    };
    
    return await addStockMovementRaw(dbMovementData);
  };
  
  const [formData, setFormData] = useState({
    type: 'out' as StockMovement['type'],
    quantity: 0,
    reason: '',
    reference: '',
    performedBy: '',
    notes: ''
  });
  const [customPerformedBy, setCustomPerformedBy] = useState('');

  // Réinitialiser le formulaire quand l'item change
  useEffect(() => {
    if (item) {
      setFormData({
        type: 'out',
        quantity: 0,
        reason: '',
        reference: '',
        performedBy: '',
        notes: ''
      });
      setCustomPerformedBy('');
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    
    if (formData.quantity <= 0) {
      toast({
        title: tc("error"),
        description: t("stock.movement.qtyPositive"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast({
        title: tc("error"),
        description: t("stock.movement.reasonRequired"),
        variant: "destructive",
      });
      return;
    }

    // Calculer le nouveau stock (pour validation seulement)
    let newStock = item.currentStock;
    if (formData.type === 'in') {
      newStock += formData.quantity;
    } else if (formData.type === 'out') {
      if (formData.quantity > item.currentStock) {
        toast({
          title: tc("error"),
          description: t("stock.movement.insufficient", { count: item.currentStock }),
          variant: "destructive",
        });
        return;
      }
      newStock -= formData.quantity;
    } else if (formData.type === 'adjustment') {
      newStock = formData.quantity;
    }

    const performedByValue = formData.performedBy === OTHER_PERFORMER ? customPerformedBy : formData.performedBy;
    
    const movementData = {
      itemId: item.id,
      itemName: item.name,
      type: formData.type,
      quantity: formData.quantity,
      reason: formData.reason,
      reference: formData.reference || undefined,
      performedBy: performedByValue || undefined,
      date: new Date().toISOString(),
      notes: formData.notes || undefined
    };

    const result = await addStockMovement(movementData);
    if (!result) return;
    onMovementAdded?.();
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentStockAfterMovement = () => {
    if (!item) return 0;
    
    let newStock = item.currentStock;
    if (formData.type === 'in') {
      newStock += formData.quantity;
    } else if (formData.type === 'out') {
      newStock -= formData.quantity;
    } else if (formData.type === 'adjustment') {
      newStock = formData.quantity;
    }
    
    return Math.max(0, newStock);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("stock.movement.title")}
          </DialogTitle>
          <DialogDescription>
            {t("stock.movement.description", { name: item.name })}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {t("stock.movement.itemConcerned")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.currentStock")}</div>
                <div className="font-semibold text-lg">{item.currentStock} {item.unit}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.minimumStock")}</div>
                <div className="font-semibold text-lg">{item.minimumStock} {item.unit}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.location")}</div>
                <div className="font-semibold text-lg flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.location || t("stock.movement.notDefined")}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.purchasePrice")}</div>
                <div className="font-semibold text-lg text-blue-600">{item.purchasePrice.toFixed(2)} {settings.currency}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.sellingPrice")}</div>
                <div className="font-semibold text-lg text-green-600">{item.sellingPrice.toFixed(2)} {settings.currency}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.totalValue")}</div>
                <div className="font-semibold text-lg text-purple-600">{item.totalValue.toFixed(2)} {settings.currency}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">{t("stock.movement.type")}</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t("stock.movement.typePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-base font-medium">{t("stock.movement.quantity")}</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                    className="flex-1 h-12 text-lg"
                    required
                  />
                  <div className="bg-muted px-3 py-2 rounded-md text-sm font-medium">
                    {item.unit}
                  </div>
                </div>
                
                {formData.quantity > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">{t("stock.movement.stockAfter")}</div>
                    <div className={`text-lg font-semibold ${
                      getCurrentStockAfterMovement() <= item.minimumStock ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {getCurrentStockAfterMovement()} {item.unit}
                    </div>
                    {getCurrentStockAfterMovement() <= item.minimumStock && (
                      <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {t("stock.movement.lowStock")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-base font-medium">{t("stock.movement.reason")}</Label>
                <Select 
                  value={formData.reason} 
                  onValueChange={(value) => handleChange('reason', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t("stock.movement.reasonPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(commonReasons[formData.type] || []).map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-base font-medium">{t("stock.movement.reference")}</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder={t("stock.movement.referencePlaceholder")}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="performedBy" className="text-base font-medium">{t("stock.movement.performedBy")}</Label>
                <Select 
                  value={formData.performedBy} 
                  onValueChange={(value) => handleChange('performedBy', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t("stock.movement.selectVet")} />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.veterinarians
                      .filter(vet => vet.isActive)
                      .map(vet => (
                        <SelectItem key={vet.id} value={vet.name}>
                          {vet.name}
                        </SelectItem>
                      ))}
                    <SelectItem value={OTHER_PERFORMER}>{t("stock.movement.otherManual")}</SelectItem>
                  </SelectContent>
                </Select>
                {formData.performedBy === OTHER_PERFORMER && (
                  <Input
                    placeholder={t("stock.movement.responsibleName")}
                    value={customPerformedBy}
                    onChange={(e) => setCustomPerformedBy(e.target.value)}
                    className="h-10 mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium">{tc("notes")}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder={t("stock.movement.notesPlaceholder")}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-12 px-6"
            >
              {tc("cancel")}
            </Button>
            <Button 
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("stock.movement.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


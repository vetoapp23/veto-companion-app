// @ts-nocheck
import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStock } from '@/hooks/useStock';
import { useToast } from '@/hooks/use-toast';
import { calcStockMargin, recordStockMovement } from '@/lib/stockMovements';
import { 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  Bell,
  Calendar,
  MapPin,
  DollarSign,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { AppPageHeader } from '@/components/AppPageHeader';
import { useWriteAccess } from '@/components/RoleGuard';
import { useTranslation } from 'react-i18next';
import { format, isWithinInterval, startOfDay, endOfDay, addDays, isSameDay } from 'date-fns';
import { useAppLocale } from '@/i18n/useAppLocale';
import { NewStockItemModal } from '@/components/forms/NewStockItemModal';
import { StockMovementModal } from '@/components/forms/StockMovementModal';

// Interface pour compatibilité avec l'ancienne UI
interface StockItem {
  id: number;
  name: string;
  category: 'medication' | 'vaccine' | 'consumable' | 'equipment' | 'supplement';
  subcategory?: string;
  manufacturer?: string;
  batchNumber?: string;
  dosage?: string;
  unit: string;
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
  barcode?: string;
  sku?: string;
  lastUpdated?: string;
  isActive: boolean;
}

// Catégories de stock avec leurs couleurs (clés EN + alias FR issus des seeds / DB)
const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
  medication: { label: 'Médicaments', color: 'bg-blue-100 text-blue-800', icon: '💊' },
  medicament: { label: 'Médicaments', color: 'bg-blue-100 text-blue-800', icon: '💊' },
  vaccine: { label: 'Vaccins', color: 'bg-green-100 text-green-800', icon: '💉' },
  vaccin: { label: 'Vaccins', color: 'bg-green-100 text-green-800', icon: '💉' },
  consumable: { label: 'Consommables', color: 'bg-orange-100 text-orange-800', icon: '🩹' },
  consommable: { label: 'Consommables', color: 'bg-orange-100 text-orange-800', icon: '🩹' },
  equipment: { label: 'Équipement', color: 'bg-purple-100 text-purple-800', icon: '🔧' },
  equipement: { label: 'Équipement', color: 'bg-purple-100 text-purple-800', icon: '🔧' },
  supplement: { label: 'Suppléments', color: 'bg-yellow-100 text-yellow-800', icon: '🧪' },
  supplementaire: { label: 'Suppléments', color: 'bg-yellow-100 text-yellow-800', icon: '🧪' },
  antiparasitaire: { label: 'Antiparasitaires', color: 'bg-teal-100 text-teal-800', icon: '🐛' },
};

const defaultCategoryConfig = { label: 'Autre', color: 'bg-gray-100 text-gray-800', icon: '📦' };

/** Clés canoniques affichées dans les filtres / formulaires */
const canonicalCategories = ['medication', 'vaccine', 'consumable', 'equipment', 'supplement', 'antiparasitaire'] as const;

const getCategoryConfig = (category?: string | null) =>
  (category && categoryConfig[category]) || defaultCategoryConfig;

/** Normalise les alias FR/EN vers une clé canonique pour le filtre */
const normalizeCategory = (category?: string | null): string => {
  if (!category) return '';
  const map: Record<string, string> = {
    medicament: 'medication',
    vaccin: 'vaccine',
    consommable: 'consumable',
    equipement: 'equipment',
    supplementaire: 'supplement',
  };
  return map[category] || category;
};

// Unités disponibles
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

export default function Stock() {
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { dateFns } = useAppLocale();
  const { 
    stockItems: rawStockItems,
    loading,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    addStockMovement,
    compatibleStockMovements,
    fetchStockItems,
    fetchStockMovements,
  } = useStock();
  const { toast } = useToast();
  const { canWrite, guardWrite } = useWriteAccess("can_manage_stock");
  const categoryLabel = (category?: string | null) => {
    const key = normalizeCategory(category);
    return t(`stock.categories.${key}`, {
      defaultValue: getCategoryConfig(category).label,
    });
  };
  const unitLabel = (unit: string) =>
    t(`stock.units.${unit}`, {
      defaultValue: units.find((entry) => entry.value === unit)?.label || unit,
    });
  
  // State for forcing refresh
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Convert database items to old UI format
  const stockItems: StockItem[] = useMemo(() => {
    console.log('🔄 Recalculating stockItems, raw count:', rawStockItems.length);
    return rawStockItems.map(item => ({
      id: parseInt(item.id.replace(/-/g, '').slice(0, 8), 16), // Convert UUID to number for compatibility
      name: item.name,
      category: item.category as any,
      subcategory: '', // Not in database
      manufacturer: item.supplier || '', // Use supplier as manufacturer
      batchNumber: item.batch_number || '',
      dosage: '', // Not in database
      unit: item.unit,
      currentStock: Number(item.current_quantity) || 0,
      minimumStock: Number(item.minimum_quantity) || 0,
      maximumStock: Number(item.maximum_quantity) || 0,
      purchasePrice: Number(item.unit_cost) || 0,
      sellingPrice: Number(item.selling_price) || 0,
      totalValue: (Number(item.current_quantity) || 0) * (Number(item.unit_cost) || 0),
      expirationDate: item.expiration_date,
      supplier: item.supplier || '',
      location: item.location || '',
      notes: item.description || '',
      barcode: '', // Not in database
      sku: '', // Not in database
      lastUpdated: item.updated_at,
      isActive: item.active || true
    }));
  }, [rawStockItems, refreshKey]);

  // Mouvements de stock depuis Supabase
  const stockMovements = compatibleStockMovements || [];
  
  // États pour les modales
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // États pour la recherche et filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // États pour l'édition inline
  const [editingField, setEditingField] = useState<{ id: number; field: string } | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalItems = stockItems.length;
    const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = stockItems.filter(item => item.currentStock <= item.minimumStock).length;
    const expiredItems = stockItems.filter(item => 
      item.expirationDate && new Date(item.expirationDate) < new Date()
    ).length;
    const expiringSoonItems = stockItems.filter(item => 
      item.expirationDate && 
      new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
      new Date(item.expirationDate) > new Date()
    ).length;

    return {
      totalItems,
      totalValue,
      lowStockItems,
      expiredItems,
      expiringSoonItems
    };
  }, [stockItems]);

  // Force refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    void fetchStockItems();
    void fetchStockMovements();
  };

  // Filtrer et trier les éléments
  const filteredItems = useMemo(() => {
    let filtered = stockItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" ||
        normalizeCategory(item.category) === filterCategory ||
        item.category === filterCategory;
      
      let matchesStatus = true;
      if (filterStatus === "low_stock") {
        matchesStatus = item.currentStock <= item.minimumStock;
      } else if (filterStatus === "expired") {
        matchesStatus = item.expirationDate && new Date(item.expirationDate) < new Date();
      } else if (filterStatus === "expiring_soon") {
        matchesStatus = item.expirationDate && 
          new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
          new Date(item.expirationDate) > new Date();
      } else if (filterStatus === "active") {
        matchesStatus = item.isActive;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Trier
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "currentStock":
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case "totalValue":
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case "expirationDate":
          aValue = a.expirationDate || "9999-12-31";
          bValue = b.expirationDate || "9999-12-31";
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [stockItems, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  // Helper function to find database item by UI ID
  const findDatabaseItem = (uiId: number) => {
    return rawStockItems.find(item => 
      parseInt(item.id.replace(/-/g, '').slice(0, 8), 16) === uiId
    );
  };

  // Gestion de l'édition inline
  const handleFieldSave = async (itemId: number, field: string, value: string) => {
    if (!guardWrite()) return;
    const dbItem = findDatabaseItem(itemId);
    if (!dbItem) return;

    try {
      if (field === "currentStock") {
        const newQty = parseInt(value) || 0;
        await recordStockMovement({
          stock_item_id: dbItem.id,
          item_name: dbItem.name,
          movement_type: "adjustment",
          quantity: newQty,
          reason: "Correction inventaire (édition rapide)",
          absoluteAdjustment: true,
        });
        await Promise.all([fetchStockItems?.(), fetchStockMovements?.()]);
      } else {
        const updates: any = {};
        switch (field) {
          case "minimumStock":
            updates.minimum_quantity = parseInt(value) || 0;
            break;
          case "purchasePrice":
            updates.unit_cost = parseFloat(value) || 0;
            break;
          case "sellingPrice":
            updates.selling_price = parseFloat(value) || 0;
            break;
          case "location":
            updates.location = value;
            break;
          case "notes":
            updates.description = value;
            break;
        }
        await updateStockItem(dbItem.id, updates);
      }

      setEditingField(null);
      toast({
        title: t("stock.updated"),
        description: t("stock.updatedBody"),
      });
    } catch (err: any) {
      toast({
        title: tc("error"),
        description: err?.message || t("stock.cannotUpdate"),
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: StockItem) => {
    if (!guardWrite()) return;
    // Pass the UI-formatted item, not the database item
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = (open: boolean) => {
    setShowEditModal(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handleDeleteItem = async (item: StockItem) => {
    if (!guardWrite()) return;
    const dbItem = findDatabaseItem(item.id);
    if (!dbItem) return;

    if (confirm(t("stock.deleteConfirm", { name: item.name }))) {
      await deleteStockItem(dbItem.id);
      toast({
        title: t("stock.deleted"),
        description: t("stock.deletedBody", { name: item.name }),
      });
    }
  };

  const handleMovement = (item: StockItem) => {
    if (!guardWrite()) return;
    setSelectedItem(item);
    setShowMovementModal(true);
  };

  // Export / import CSV (UTF-8 + BOM pour Excel Windows)
  const downloadCsvFile = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const csvEscape = (value: string | number) => {
    const str = String(value ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const stockCsvHeaders = {
    name: t("stock.csvHeaders.name"),
    category: t("stock.csvHeaders.category"),
    manufacturer: t("stock.csvHeaders.manufacturer"),
    batchNumber: t("stock.batchNumber"),
    dosage: t("stock.dosage"),
    unit: t("stock.units.unit"),
    stock: t("stock.csvHeaders.stock"),
    minimumStock: t("stock.minimumStock"),
    purchasePrice: t("stock.csvHeaders.purchasePrice"),
    sellingPrice: t("stock.csvHeaders.sellingPrice"),
    expiration: t("stock.csvHeaders.expiration"),
    supplier: t("stock.supplier"),
    location: t("stock.csvHeaders.location"),
    notes: tc("notes"),
  };
  const STOCK_CSV_HEADERS = [
    stockCsvHeaders.name,
    stockCsvHeaders.category,
    'Sous-catégorie',
    stockCsvHeaders.manufacturer,
    stockCsvHeaders.batchNumber,
    stockCsvHeaders.dosage,
    stockCsvHeaders.unit,
    stockCsvHeaders.stock,
    stockCsvHeaders.minimumStock,
    stockCsvHeaders.purchasePrice,
    stockCsvHeaders.sellingPrice,
    stockCsvHeaders.expiration,
    stockCsvHeaders.supplier,
    stockCsvHeaders.location,
    stockCsvHeaders.notes,
    'Code-barres',
    'SKU',
  ];

  // Fonction pour exporter en Excel
  const exportToExcel = () => {
    const csvContent = [
      STOCK_CSV_HEADERS.map(csvEscape).join(','),
      ...stockItems.map(item =>
        [
          item.name,
          item.category,
          item.subcategory || '',
          item.manufacturer || '',
          item.batchNumber || '',
          item.dosage || '',
          item.unit,
          item.currentStock,
          item.minimumStock,
          item.purchasePrice,
          item.sellingPrice,
          item.expirationDate || '',
          item.supplier || '',
          item.location || '',
          item.notes || '',
          item.barcode || '',
          item.sku || '',
        ].map(csvEscape).join(',')
      ),
    ].join('\n');

    downloadCsvFile(`stock_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
    
    toast({
      title: t("stock.exportSuccess"),
      description: t("stock.exportSuccessBody"),
    });
  };

  // Fonction pour importer depuis Excel/CSV
  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!guardWrite()) {
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = (e.target?.result as string).replace(/^\uFEFF/, '');
        const lines = csv.split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
        
        // Vérifier les en-têtes requis
        const requiredHeaders = [
          stockCsvHeaders.name,
          stockCsvHeaders.category,
          stockCsvHeaders.unit,
          stockCsvHeaders.stock,
          stockCsvHeaders.minimumStock,
          stockCsvHeaders.purchasePrice,
          stockCsvHeaders.sellingPrice,
        ];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          toast({
            title: t("stock.importError"),
            description: t("stock.importMissingHeaders", { headers: missingHeaders.join(', ') }),
            variant: "destructive"
          });
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            const row: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Validation des données
            if (!row[stockCsvHeaders.name] || !row[stockCsvHeaders.category] || !row[stockCsvHeaders.unit]) {
              errorCount++;
              continue;
            }

            // Vérifier si la catégorie est valide
            const validCategories = Object.keys(categoryConfig);
            if (!validCategories.includes(row[stockCsvHeaders.category])) {
              errorCount++;
              continue;
            }

            const newItem = {
              name: row[stockCsvHeaders.name],
              category: row[stockCsvHeaders.category] as any,
              description: row[stockCsvHeaders.notes] || '',
              unit: row[stockCsvHeaders.unit] as any,
              current_quantity: parseInt(row[stockCsvHeaders.stock]) || 0,
              minimum_quantity: parseInt(row[stockCsvHeaders.minimumStock]) || 0,
              maximum_quantity: 0,
              unit_cost: parseFloat(row[stockCsvHeaders.purchasePrice]) || 0,
              selling_price: parseFloat(row[stockCsvHeaders.sellingPrice]) || 0,
              expiration_date: row[stockCsvHeaders.expiration] || null,
              supplier: row[stockCsvHeaders.supplier] || '',
              location: row[stockCsvHeaders.location] || '',
              batch_number: row[stockCsvHeaders.batchNumber] || '',
              active: true
            };

            await addStockItem(newItem);
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Erreur ligne ${i + 1}:`, error);
          }
        }

        toast({
          title: t("stock.importDone"),
          description: t("stock.importDoneBody", {
            success: successCount,
            errors: errorCount > 0 ? t("stock.importErrorsSuffix", { count: errorCount }) : "",
          }),
        });

      } catch (error) {
        toast({
          title: t("stock.importError"),
          description: t("stock.importReadError"),
          variant: "destructive"
        });
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // Fonction pour télécharger le gabarit
  const downloadTemplate = () => {
    const templateContent = [
      STOCK_CSV_HEADERS.map(csvEscape).join(','),
      [
        'Amoxicilline 500mg', 'medication', 'Antibiotique', 'Boehringer Ingelheim', 'AMX2024001', '500mg', 'box',
        '15', '5', '20.00', '25.50', '2025-12-31', 'Pharmacie Vétérinaire Centrale', 'Armoire A - Étagère 1',
        'Stockage à température ambiante', '1234567890123', 'MED-AMX-500',
      ].map(csvEscape).join(','),
      [
        'Vaccin DHPP', 'vaccine', 'Vaccin combiné', 'Merial', 'VAC2024001', '1ml', 'vial',
        '25', '10', '45.00', '55.00', '2025-06-30', 'VetoPharma', 'Réfrigérateur - Étagère 1',
        'Conservation entre 2-8°C', '9876543210987', 'VAC-DHPP-001',
      ].map(csvEscape).join(','),
      [
        'Seringues 5ml', 'consumable', 'Matériel médical', 'BD', 'SYR2024001', '5ml', 'unit',
        '100', '20', '0.50', '0.75', '', 'MedSupply', 'Armoire B - Étagère 2',
        'Usage unique', '5556667778889', 'CON-SYR-5ML',
      ].map(csvEscape).join(','),
    ].join('\n');

    downloadCsvFile('gabarit_import_stock.csv', templateContent);
    
    toast({
      title: t("stock.templateDownloaded"),
      description: t("stock.templateDownloadedBody"),
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{tc("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <AppPageHeader
        icon={Package}
        title={t("stock.title")}
        description={t("stock.description")}
        actions={
          <>
            <Button
              variant="outline"
              onClick={exportToExcel}
              className="gap-1 sm:gap-2 text-xs sm:text-sm rounded-full px-2.5 sm:px-3"
              size="sm"
              aria-label={t("stock.exportCsv")}
            >
              <Download className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="hidden sm:inline">{t("stock.exportCsv")}</span>
            </Button>
            {canWrite && (
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={importFromExcel}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="import-file"
                />
                <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm rounded-full px-2.5 sm:px-3" size="sm" asChild>
                  <label htmlFor="import-file" className="cursor-pointer" aria-label={t("stock.importCsv")}>
                    <Upload className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span className="hidden sm:inline">{t("stock.importCsv")}</span>
                  </label>
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="gap-1 sm:gap-2 text-xs sm:text-sm rounded-full px-2.5 sm:px-3"
              size="sm"
              aria-label={t("stock.template")}
            >
              <FileSpreadsheet className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="hidden sm:inline">{t("stock.template")}</span>
            </Button>
            {canWrite && (
              <Button
                className="gap-1 sm:gap-2 text-xs sm:text-sm rounded-full"
                size="sm"
                onClick={() => setShowNewItemModal(true)}
              >
                <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="text-xs sm:text-sm">{t("stock.new")}</span>
              </Button>
            )}
          </>
        }
      />

      {/* Statistiques */}
      <div className="app-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("stock.kpi.totalItems")}</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Package className="h-6 sm:h-8 w-6 sm:w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("stock.kpi.totalValue")}</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalValue.toFixed(2)} MAD</p>
              </div>
              <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("stock.kpi.lowStock")}</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("stock.badges.expired")}</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.expiredItems}</p>
              </div>
              <XCircle className="h-6 sm:h-8 w-6 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("stock.kpi.expiring")}</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.expiringSoonItems}</p>
              </div>
              <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 sm:h-5 w-4 sm:w-5" />
            {t("stock.searchAndFilter")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-0 w-full sm:min-w-[300px]">
              <Input
                placeholder={t("stock.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("stock.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("stock.filters.allCategories")}</SelectItem>
                {canonicalCategories.map((key) => {
                  const config = categoryConfig[key];
                  return (
                    <SelectItem key={key} value={key}>
                      {config.icon} {categoryLabel(key)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("stock.statusFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("stock.filters.allStatuses")}</SelectItem>
                <SelectItem value="active">{tc("active")}</SelectItem>
                <SelectItem value="low_stock">{t("stock.filters.lowStock")}</SelectItem>
                <SelectItem value="expired">{t("stock.badges.expired")}</SelectItem>
                <SelectItem value="expiring_soon">{t("stock.filters.expiringSoon")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("stock.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("stock.colName")}</SelectItem>
                <SelectItem value="currentStock">{t("stock.colStock")}</SelectItem>
                <SelectItem value="totalValue">{t("stock.colTotalValue")}</SelectItem>
                <SelectItem value="expirationDate">{t("stock.colExpiration")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              size="sm"
              className="w-full sm:w-auto"
            >
              {sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section d'aide pour l'import */}
  
      {/* Tableau de stock */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t("stock.inventoryCount", { count: filteredItems.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">{t("stock.colName")}</TableHead>
                  <TableHead className="min-w-[120px]">{t("stock.colCategory")}</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">{t("stock.colManufacturer")}</TableHead>
                  <TableHead className="min-w-[100px]">{t("stock.colStock")}</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">{t("stock.colPurchasePrice")}</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">{t("stock.colSellingPrice")}</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">{t("stock.colTotalValue")}</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">{t("stock.colExpiration")}</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">{t("stock.colLocation")}</TableHead>
                  <TableHead className="min-w-[120px]">{tc("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isLowStock = item.currentStock <= item.minimumStock;
                  const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
                  const isExpiringSoon = item.expirationDate && 
                    new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                    new Date(item.expirationDate) > new Date();
                  const cat = getCategoryConfig(item.category);
                  
                  return (
                    <TableRow key={item.id} className={!item.isActive ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm sm:text-base">{item.name}</div>
                          {item.batchNumber && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {t("stock.batchLabel")}: {item.batchNumber}
                            </div>
                          )}
                          {item.dosage && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {item.dosage}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${cat.color} text-xs sm:text-sm`}>
                          {cat.icon} {categoryLabel(item.category)}
                        </Badge>
                        {item.subcategory && (
                          <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {item.subcategory}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">{item.manufacturer || '-'}</div>
                          {item.supplier && (
                            <div className="text-xs text-muted-foreground">
                              {item.supplier}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`font-medium text-sm sm:text-base ${isLowStock ? 'text-orange-600' : ''}`}>
                            {item.currentStock} {unitLabel(item.unit)}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Min: {item.minimumStock}
                          </div>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                {t("stock.badges.lowStock")}
                              </Badge>
                            )}
                            {item.lastUpdated && new Date(item.lastUpdated).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                Mis à jour
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {editingField?.id === item.id && editingField.field === 'purchasePrice' ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            onBlur={() => handleFieldSave(item.id, 'purchasePrice', fieldValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleFieldSave(item.id, 'purchasePrice', fieldValue);
                              }
                            }}
                            autoFocus
                            className="w-16 sm:w-20"
                          />
                        ) : (
                          <div
                            className={`p-1 rounded text-sm ${canWrite ? "cursor-pointer hover:bg-muted" : ""}`}
                            onClick={() => {
                              if (!canWrite) return;
                              setEditingField({ id: item.id, field: 'purchasePrice' });
                              setFieldValue(item.purchasePrice.toString());
                            }}
                          >
                            {item.purchasePrice.toFixed(2)} MAD
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {editingField?.id === item.id && editingField.field === 'sellingPrice' ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            onBlur={() => handleFieldSave(item.id, 'sellingPrice', fieldValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleFieldSave(item.id, 'sellingPrice', fieldValue);
                              }
                            }}
                            autoFocus
                            className="w-16 sm:w-20"
                          />
                        ) : (
                          <div
                            className={`p-1 rounded ${canWrite ? "cursor-pointer hover:bg-muted" : ""}`}
                            onClick={() => {
                              if (!canWrite) return;
                              setEditingField({ id: item.id, field: 'sellingPrice' });
                              setFieldValue(item.sellingPrice.toString());
                            }}
                          >
                            <div className="font-medium text-sm">{item.sellingPrice.toFixed(2)} MAD</div>
                            {(() => {
                              const { unit, pct } = calcStockMargin(item.purchasePrice, item.sellingPrice);
                              return (
                                <div className={`text-xs ${unit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  Marge: {unit.toFixed(2)} MAD ({pct.toFixed(0)}%)
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        <div className="font-medium text-sm">
                          {item.totalValue.toFixed(2)} MAD
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        {item.expirationDate ? (
                          <div className="space-y-1">
                            <div className={`text-xs sm:text-sm ${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-yellow-600 font-medium' : ''}`}>
                              {format(new Date(item.expirationDate), 'dd/MM/yyyy', { locale: dateFns })}
                            </div>
                            {isExpired && (
                              <Badge variant="destructive" className="text-xs">
                                {t("stock.badges.expired")}
                              </Badge>
                            )}
                            {isExpiringSoon && !isExpired && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                {t("stock.badges.expiringSoon")}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="hidden lg:table-cell">
                        {editingField?.id === item.id && editingField.field === 'location' ? (
                          <Input
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            onBlur={() => handleFieldSave(item.id, 'location', fieldValue)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleFieldSave(item.id, 'location', fieldValue);
                              }
                            }}
                            autoFocus
                            className="w-24 sm:w-32"
                          />
                        ) : (
                          <div
                            className={`p-1 rounded flex items-center gap-1 text-xs sm:text-sm ${canWrite ? "cursor-pointer hover:bg-muted" : ""}`}
                            onClick={() => {
                              if (!canWrite) return;
                              setEditingField({ id: item.id, field: 'location' });
                              setFieldValue(item.location || '');
                            }}
                          >
                            <MapPin className="h-3 w-3" />
                            {item.location || 'Non défini'}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          {canWrite && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMovement(item)}
                                className="p-1 sm:p-2"
                              >
                                <TrendingUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item)}
                                className="p-1 sm:p-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item)}
                                className="p-1 sm:p-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">{t("stock.empty")}</p>
              <p className="text-xs sm:text-sm">{t("stock.emptyFilterHint")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-4 sm:h-5 w-4 sm:w-5" />
            {t("stock.movementHistory")} ({stockMovements.length})
          </CardTitle>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Derniers mouvements de stock (prescriptions, achats, ajustements)
          </div>
        </CardHeader>
        <CardContent>
          {stockMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">{t("stock.emptyMovementHistory")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stockMovements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 20) // Afficher les 20 derniers mouvements
                .map((movement) => {
                  const movementTypeConfig = {
                    in: { label: t("stock.movement.types.in"), color: 'text-green-600', icon: '↗️' },
                    out: { 
                      label: movement.reason === 'Prescription médicale' ? t("consultations.prescription.title") : t("stock.movement.types.out"),
                      color: movement.reason === 'Prescription médicale' ? 'text-orange-600' : 'text-red-600',
                      icon: movement.reason === 'Prescription médicale' ? '💊' : '↘️' 
                    },
                    adjustment: { label: t("stock.movement.types.adjustment"), color: 'text-blue-600', icon: '⚖️' },
                    transfer: { label: t("stock.movement.types.transfer"), color: 'text-purple-600', icon: '↔️' }
                  };
                  
                  const config = movementTypeConfig[movement.type as keyof typeof movementTypeConfig]
                    ?? { label: movement.type || t("stock.movement.title"), color: 'text-gray-600', icon: '📦' };
                  
                  return (
                    <div key={movement.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 gap-2 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-xl sm:text-2xl">{config.icon}</div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{movement.itemName}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {movement.reason} • {movement.performedBy || tc("notSpecified")}
                          </div>
                          {movement.reference && (
                            <div className="text-xs text-muted-foreground">
                              Référence: {movement.reference}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right sm:text-left">
                        <div className={`font-semibold text-sm sm:text-base ${config.color}`}>
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{movement.quantity}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: dateFns })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {stockMovements.length > 20 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    Voir tous les mouvements ({stockMovements.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <NewStockItemModal 
        open={showNewItemModal}
        onOpenChange={setShowNewItemModal}
        onItemAdded={handleRefresh}
        addStockItemFn={addStockItem}
        updateStockItemFn={updateStockItem}
        rawStockItems={rawStockItems}
      />
      
      <NewStockItemModal 
        open={showEditModal}
        onOpenChange={handleCloseEditModal}
        editingItem={editingItem}
        onItemAdded={handleRefresh}
        addStockItemFn={addStockItem}
        updateStockItemFn={updateStockItem}
        rawStockItems={rawStockItems}
      />
      
      <StockMovementModal
        open={showMovementModal}
        onOpenChange={setShowMovementModal}
        item={selectedItem}
        addStockMovementFn={addStockMovement}
        rawStockItems={rawStockItems}
        onMovementAdded={handleRefresh}
      />
    </div>
  );
}
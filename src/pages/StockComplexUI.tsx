import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStock } from '@/hooks/useStock';
import { useToast } from '@/hooks/use-toast';
import { 
  Package,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  MapPin,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { NewStockItemModal } from '@/components/forms/NewStockItemModal';

// Catégories de stock
const categoryConfig = {
  medication: { label: 'Médicaments', color: 'bg-blue-100 text-blue-800', icon: '💊' },
  vaccine: { label: 'Vaccins', color: 'bg-green-100 text-green-800', icon: '💉' },
  consumable: { label: 'Consommables', color: 'bg-orange-100 text-orange-800', icon: '🩹' },
  equipment: { label: 'Équipement', color: 'bg-purple-100 text-purple-800', icon: '🔧' },
  supplement: { label: 'Suppléments', color: 'bg-yellow-100 text-yellow-800', icon: '🧪' }
};
  supplement: { label: 'Suppléments', color: 'bg-yellow-100 text-yellow-800', icon: '🧪' }
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
  const { 
    stockItems: rawStockItems,
    compatibleStockItems: stockItems, 
    compatibleStockAlerts: stockAlerts, 
    compatibleStockMovements: stockMovements, 
    addStockItem: addStockItemRaw, 
    updateStockItem: updateStockItemRaw, 
    deleteStockItem: deleteStockItemRaw, 
    addStockMovement, 
    generateStockAlerts,
    loading 
  } = useStock();
  const { settings } = useSettings();
  const { toast } = useToast();

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
    if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock;
    if (updates.minimumStock !== undefined) dbUpdates.minimum_stock = updates.minimumStock;
    if (updates.maximumStock !== undefined) dbUpdates.maximum_stock = updates.maximumStock;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.manufacturer !== undefined) dbUpdates.manufacturer = updates.manufacturer;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.batchNumber !== undefined) dbUpdates.batch_number = updates.batchNumber;
    if (updates.expirationDate !== undefined) dbUpdates.expiration_date = updates.expirationDate;
    
    return await updateStockItemRaw(dbId, dbUpdates);
  };

  const deleteStockItem = async (compatibilityId: number) => {
    const dbId = findDatabaseItemId(compatibilityId);
    if (!dbId) return false;
    return await deleteStockItemRaw(dbId);
  };

  const addStockItem = async (itemData: StockItem) => {
    // Convert UI item to database format
    const dbItemData = {
      name: itemData.name,
      category: itemData.category,
      subcategory: itemData.subcategory,
      description: itemData.description,
      manufacturer: itemData.manufacturer,
      batch_number: itemData.batchNumber,
      dosage: itemData.dosage,
      unit: itemData.unit,
      current_stock: itemData.currentStock,
      minimum_stock: itemData.minimumStock,
      maximum_stock: itemData.maximumStock,
      purchase_price: itemData.purchasePrice,
      selling_price: itemData.sellingPrice,
      expiration_date: itemData.expirationDate,
      supplier: itemData.supplier,
      location: itemData.location,
      notes: itemData.notes,
      last_restocked: itemData.lastRestocked,
      is_active: itemData.isActive,
      barcode: itemData.barcode,
      sku: itemData.sku,
    };
    
    return await addStockItemRaw(dbItemData);
  };
  
  // Debug pour vérifier les mises à jour
  React.useEffect(() => {
    console.log('Stock mis à jour:', {
      items: stockItems.length,
      movements: stockMovements.length,
      lastMovement: stockMovements[stockMovements.length - 1]
    });
  }, [stockItems, stockMovements]);
  
  // États pour les modales
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  
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

  // Filtrer et trier les éléments
  const filteredItems = useMemo(() => {
    let filtered = stockItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      
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

  // Gestion de l'édition inline
  const handleFieldSave = (itemId: number, field: string, value: string) => {
    const updates: Partial<StockItem> = {};
    
    switch (field) {
      case "currentStock":
        updates.currentStock = parseInt(value) || 0;
        break;
      case "minimumStock":
        updates.minimumStock = parseInt(value) || 0;
        break;
      case "purchasePrice":
        updates.purchasePrice = parseFloat(value) || 0;
        break;
      case "sellingPrice":
        updates.sellingPrice = parseFloat(value) || 0;
        break;
      case "location":
        updates.location = value;
        break;
      case "notes":
        updates.notes = value;
        break;
    }
    
    updateStockItem(itemId, updates);
    setEditingField(null);
    
    toast({
      title: "Stock mis à jour",
      description: "L'élément de stock a été mis à jour avec succès.",
    });
  };

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = (open: boolean) => {
    setShowEditModal(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (item: StockItem) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" du stock ?`)) {
      deleteStockItem(item.id);
      toast({
        title: "Élément supprimé",
        description: `"${item.name}" a été supprimé du stock.`,
      });
    }
  };

  const handleMovement = (item: StockItem) => {
    setSelectedItem(item);
    setShowMovementModal(true);
  };

  // Fonction pour exporter en Excel
  const exportToExcel = () => {
    const csvContent = [
      // En-têtes
      ['Nom', 'Catégorie', 'Sous-catégorie', 'Fabricant', 'Numéro de lot', 'Dosage', 'Unité', 'Stock actuel', 'Stock minimum', 'Prix d\'achat', 'Prix de vente', 'Date d\'expiration', 'Fournisseur', 'Emplacement', 'Notes', 'Code-barres', 'SKU'].join(','),
      // Données
      ...stockItems.map(item => [
        `"${item.name}"`,
        `"${item.category}"`,
        `"${item.subcategory || ''}"`,
        `"${item.manufacturer || ''}"`,
        `"${item.batchNumber || ''}"`,
        `"${item.dosage || ''}"`,
        `"${item.unit}"`,
        item.currentStock,
        item.minimumStock,
        item.purchasePrice,
        item.sellingPrice,
        `"${item.expirationDate || ''}"`,
        `"${item.supplier || ''}"`,
        `"${item.location || ''}"`,
        `"${item.notes || ''}"`,
        `"${item.barcode || ''}"`,
        `"${item.sku || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé avec succès.",
    });
  };

  // Fonction pour importer depuis Excel/CSV
  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        // Vérifier les en-têtes requis
        const requiredHeaders = ['Nom', 'Catégorie', 'Unité', 'Stock actuel', 'Stock minimum', 'Prix d\'achat', 'Prix de vente'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          toast({
            title: "Erreur d'import",
            description: `En-têtes manquants: ${missingHeaders.join(', ')}`,
            variant: "destructive"
          });
          return;
        }

        const importedItems: StockItem[] = [];
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
            if (!row['Nom'] || !row['Catégorie'] || !row['Unité']) {
              errorCount++;
              continue;
            }

            // Vérifier si la catégorie est valide
            const validCategories = Object.keys(categoryConfig);
            if (!validCategories.includes(row['Catégorie'])) {
              errorCount++;
              continue;
            }

            const newItem: StockItem = {
              id: Date.now() + i, // ID temporaire
              name: row['Nom'],
              category: row['Catégorie'] as any,
              subcategory: row['Sous-catégorie'] || '',
              manufacturer: row['Fabricant'] || '',
              batchNumber: row['Numéro de lot'] || '',
              dosage: row['Dosage'] || '',
              unit: row['Unité'] as any,
              currentStock: parseInt(row['Stock actuel']) || 0,
              minimumStock: parseInt(row['Stock minimum']) || 0,
              purchasePrice: parseFloat(row['Prix d\'achat']) || 0,
              sellingPrice: parseFloat(row['Prix de vente']) || 0,
              totalValue: (parseInt(row['Stock actuel']) || 0) * (parseFloat(row['Prix d\'achat']) || 0),
              expirationDate: row['Date d\'expiration'] || undefined,
              supplier: row['Fournisseur'] || '',
              location: row['Emplacement'] || '',
              notes: row['Notes'] || '',
              barcode: row['Code-barres'] || '',
              sku: row['SKU'] || '',
              lastUpdated: new Date().toISOString(),
              isActive: true
            };

            importedItems.push(newItem);
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Erreur ligne ${i + 1}:`, error);
          }
        }

        // Ajouter les éléments importés au stock existant
        if (importedItems.length > 0) {
          importedItems.forEach(item => {
            addStockItem(item);
          });
        }

        toast({
          title: "Import terminé",
          description: `${successCount} éléments importés avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : ''}.`,
        });

      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Impossible de lire le fichier CSV.",
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
      // En-têtes
      ['Nom', 'Catégorie', 'Sous-catégorie', 'Fabricant', 'Numéro de lot', 'Dosage', 'Unité', 'Stock actuel', 'Stock minimum', 'Prix d\'achat', 'Prix de vente', 'Date d\'expiration', 'Fournisseur', 'Emplacement', 'Notes', 'Code-barres', 'SKU'].join(','),
      // Exemples
      ['Amoxicilline 500mg', 'medication', 'Antibiotique', 'Boehringer Ingelheim', 'AMX2024001', '500mg', 'box', '15', '5', '20.00', '25.50', '2025-12-31', 'Pharmacie Vétérinaire Centrale', 'Armoire A - Étagère 1', 'Stockage à température ambiante', '1234567890123', 'MED-AMX-500'].join(','),
      ['Vaccin DHPP', 'vaccine', 'Vaccin combiné', 'Merial', 'VAC2024001', '1ml', 'vial', '25', '10', '45.00', '55.00', '2025-06-30', 'VetoPharma', 'Réfrigérateur - Étagère 1', 'Conservation entre 2-8°C', '9876543210987', 'VAC-DHPP-001'].join(','),
      ['Seringues 5ml', 'consumable', 'Matériel médical', 'BD', 'SYR2024001', '5ml', 'unit', '100', '20', '0.50', '0.75', '', 'MedSupply', 'Armoire B - Étagère 2', 'Usage unique', '5556667778889', 'CON-SYR-5ML'].join(',')
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gabarit_import_stock.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Gabarit téléchargé",
      description: "Le fichier gabarit a été téléchargé avec succès.",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Gestion de Stock
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre inventaire de médicaments, vaccins et consommables
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={importFromExcel}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-file"
            />
            <Button 
              variant="outline" 
              className="gap-2"
              asChild
            >
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Importer CSV
              </label>
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Gabarit
          </Button>
          <Button 
            className="gap-2 medical-glow"
            onClick={() => setShowNewItemModal(true)}
          >
            <Plus className="h-4 w-4" />
            Nouvel Élément
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Éléments</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valeur Totale</p>
                <p className="text-2xl font-bold">{stats.totalValue.toFixed(2)} {settings.currency}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Bas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expirés</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiredItems}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expirent Bientôt</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoonItems}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Rechercher et filtrer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <Input 
                placeholder="Rechercher par nom, fabricant, lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="low_stock">Stock bas</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
                <SelectItem value="expiring_soon">Expirent bientôt</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="currentStock">Stock actuel</SelectItem>
                <SelectItem value="totalValue">Valeur totale</SelectItem>
                <SelectItem value="expirationDate">Date d'expiration</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section d'aide pour l'import */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Import en masse</h3>
              <p className="text-sm text-blue-700">
                Utilisez le bouton "Gabarit" pour télécharger un fichier CSV avec le format correct. 
                Les données importées seront ajoutées au stock existant.
              </p>
              <div className="text-xs text-blue-600">
                <strong>Catégories valides :</strong> medication, vaccine, consumable, equipment, supplement
              </div>
              <div className="text-xs text-blue-600">
                <strong>Unités valides :</strong> box, vial, unit, ml, mg, g, kg, l, pack, tube, sachet
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau de stock */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire ({filteredItems.length} éléments)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Fabricant</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Prix d'achat</TableHead>
                  <TableHead>Prix de vente</TableHead>
                  <TableHead>Valeur totale</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isLowStock = item.currentStock <= item.minimumStock;
                  const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
                  const isExpiringSoon = item.expirationDate && 
                    new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                    new Date(item.expirationDate) > new Date();
                  
                  return (
                    <TableRow key={item.id} className={!item.isActive ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.name}</div>
                          {item.batchNumber && (
                            <div className="text-sm text-muted-foreground">
                              Lot: {item.batchNumber}
                            </div>
                          )}
                          {item.dosage && (
                            <div className="text-sm text-muted-foreground">
                              {item.dosage}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={categoryConfig[item.category].color}>
                          {categoryConfig[item.category].icon} {categoryConfig[item.category].label}
                        </Badge>
                        {item.subcategory && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.subcategory}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div>{item.manufacturer || '-'}</div>
                          {item.supplier && (
                            <div className="text-sm text-muted-foreground">
                              {item.supplier}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`font-medium ${isLowStock ? 'text-orange-600' : ''}`}>
                            {item.currentStock} {units.find(u => u.value === item.unit)?.label || item.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Min: {item.minimumStock}
                          </div>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                Stock bas
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
                      
                      <TableCell>
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
                            className="w-20"
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-muted p-1 rounded"
                            onClick={() => {
                              setEditingField({ id: item.id, field: 'purchasePrice' });
                              setFieldValue(item.purchasePrice.toString());
                            }}
                          >
                            {item.purchasePrice.toFixed(2)} {settings.currency}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
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
                            className="w-20"
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-muted p-1 rounded"
                            onClick={() => {
                              setEditingField({ id: item.id, field: 'sellingPrice' });
                              setFieldValue(item.sellingPrice.toString());
                            }}
                          >
                            <div className="font-medium">{item.sellingPrice.toFixed(2)} {settings.currency}</div>
                            <div className="text-xs text-green-600">
                              Marge: {((item.sellingPrice - item.purchasePrice) * item.currentStock).toFixed(2)} {settings.currency}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          {item.totalValue.toFixed(2)} {settings.currency}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {item.expirationDate ? (
                          <div className="space-y-1">
                            <div className={`text-sm ${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-yellow-600 font-medium' : ''}`}>
                              {format(new Date(item.expirationDate), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                            {isExpired && (
                              <Badge variant="destructive" className="text-xs">
                                Expiré
                              </Badge>
                            )}
                            {isExpiringSoon && !isExpired && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Expire bientôt
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
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
                            className="w-32"
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-muted p-1 rounded flex items-center gap-1"
                            onClick={() => {
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
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMovement(item)}
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élément trouvé</p>
              <p className="text-sm">Ajustez vos filtres ou ajoutez de nouveaux éléments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des Mouvements ({stockMovements.length})
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Derniers mouvements de stock (prescriptions, achats, ajustements)
          </div>
        </CardHeader>
        <CardContent>
          {stockMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun mouvement de stock enregistré</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stockMovements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 20) // Afficher les 20 derniers mouvements
                .map((movement) => {
                  const movementTypeConfig = {
                    in: { label: 'Entrée', color: 'text-green-600', icon: '↗️' },
                    out: { 
                      label: movement.reason === 'Prescription médicale' ? 'Prescription' : 'Sortie', 
                      color: movement.reason === 'Prescription médicale' ? 'text-orange-600' : 'text-red-600', 
                      icon: movement.reason === 'Prescription médicale' ? '💊' : '↘️' 
                    },
                    adjustment: { label: 'Ajustement', color: 'text-blue-600', icon: '⚖️' },
                    transfer: { label: 'Transfert', color: 'text-purple-600', icon: '↔️' }
                  };
                  
                  const config = movementTypeConfig[movement.type];
                  
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{config.icon}</div>
                        <div>
                          <div className="font-medium">{movement.itemName}</div>
                          <div className="text-sm text-muted-foreground">
                            {movement.reason} • {movement.performedBy || 'Non spécifié'}
                          </div>
                          {movement.reference && (
                            <div className="text-xs text-muted-foreground">
                              Référence: {movement.reference}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${config.color}`}>
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{movement.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {stockMovements.length > 20 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
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
      />
      
      <NewStockItemModal 
        open={showEditModal}
        onOpenChange={handleCloseEditModal}
        editingItem={editingItem}
      />
      
      <StockMovementModal
        open={showMovementModal}
        onOpenChange={setShowMovementModal}
        item={selectedItem}
      />
    </div>
  );
}

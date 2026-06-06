// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Filter,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface StockItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  unit_cost: number;
  selling_price: number;
  supplier: string;
  batch_number: string;
  expiration_date: string;
  location: string;
  requires_prescription: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  stock_item_id: string;
  movement_type: string;
  quantity: number;
  reason: string;
  notes: string;
  movement_date: string;
  stock_item?: {
    name: string;
  };
}

const StockManagement: React.FC = () => {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: 'unit',
    current_quantity: 0,
    minimum_quantity: 0,
    maximum_quantity: 0,
    unit_cost: 0,
    selling_price: 0,
    supplier: '',
    batch_number: '',
    expiration_date: '',
    location: '',
    requires_prescription: false,
    active: true
  });

  const [movementData, setMovementData] = useState({
    stock_item_id: '',
    movement_type: '',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const categories = [
    'Médicaments',
    'Vaccins',
    'Antiparasitaires',
    'Matériel médical',
    'Consommables',
    'Nourriture',
    'Supplements',
    'Autre'
  ];

  const movementTypes = [
    { value: 'purchase', label: 'Achat', color: 'bg-green-100 text-green-800' },
    { value: 'sale', label: 'Vente', color: 'bg-blue-100 text-blue-800' },
    { value: 'usage', label: 'Utilisation', color: 'bg-orange-100 text-orange-800' },
    { value: 'adjustment_in', label: 'Ajustement +', color: 'bg-green-100 text-green-800' },
    { value: 'adjustment_out', label: 'Ajustement -', color: 'bg-red-100 text-red-800' },
    { value: 'expired', label: 'Périmé', color: 'bg-gray-100 text-gray-800' },
    { value: 'lost', label: 'Perdu', color: 'bg-red-100 text-red-800' },
    { value: 'return', label: 'Retour', color: 'bg-purple-100 text-purple-800' }
  ];

  const units = [
    'unit', 'kg', 'g', 'l', 'ml', 'boîte', 'flacon', 'ampoule', 'comprimé', 'dose'
  ];

  const getCurrentOrganizationId = async () => {
    if (!user?.id) throw new Error('User not authenticated');

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (error || !profile?.organization_id) {
      throw new Error('User profile or organization not found');
    }

    return profile.organization_id;
  };

  useEffect(() => {
    if (user) {
      fetchStockItems();
      fetchStockMovements();
    }
  }, [user]);

  const fetchStockItems = async () => {
    try {
      const organizationId = await getCurrentOrganizationId();

      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'inventaire.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const organizationId = await getCurrentOrganizationId();

      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          stock_item:stock_items(name)
        `)
        .eq('organization_id', organizationId)
        .order('movement_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setStockMovements(data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const organizationId = await getCurrentOrganizationId();

      const itemData = {
        ...formData,
        current_quantity: parseInt(formData.current_quantity.toString()) || 0,
        minimum_quantity: parseInt(formData.minimum_quantity.toString()) || 0,
        maximum_quantity: parseInt(formData.maximum_quantity.toString()) || 0,
        unit_cost: parseFloat(formData.unit_cost.toString()) || 0,
        selling_price: parseFloat(formData.selling_price.toString()) || 0,
        user_id: user?.id,
        organization_id: organizationId
      };

      if (editingItem) {
        const { error } = await supabase
          .from('stock_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: 'Article mis à jour avec succès.',
        });
      } else {
        const { error } = await supabase
          .from('stock_items')
          .insert([itemData]);

        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: 'Article créé avec succès.',
        });
      }

      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchStockItems();
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'article.',
        variant: 'destructive',
      });
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const organizationId = await getCurrentOrganizationId();

      const { error } = await supabase
        .from('stock_movements')
        .insert([{
          ...movementData,
          quantity: parseInt(movementData.quantity.toString()) || 0,
          organization_id: organizationId,
          performed_by: user?.id
        }]);

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Mouvement de stock enregistré.',
      });

      setShowMovementForm(false);
      resetMovementForm();
      fetchStockItems();
      fetchStockMovements();
    } catch (error) {
      console.error('Error saving stock movement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le mouvement.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      current_quantity: item.current_quantity,
      minimum_quantity: item.minimum_quantity,
      maximum_quantity: item.maximum_quantity || 0,
      unit_cost: item.unit_cost || 0,
      selling_price: item.selling_price || 0,
      supplier: item.supplier || '',
      batch_number: item.batch_number || '',
      expiration_date: item.expiration_date || '',
      location: item.location || '',
      requires_prescription: item.requires_prescription,
      active: item.active
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const { error } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Article supprimé avec succès.',
      });
      
      fetchStockItems();
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'article.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: 'unit',
      current_quantity: 0,
      minimum_quantity: 0,
      maximum_quantity: 0,
      unit_cost: 0,
      selling_price: 0,
      supplier: '',
      batch_number: '',
      expiration_date: '',
      location: '',
      requires_prescription: false,
      active: true
    });
  };

  const resetMovementForm = () => {
    setMovementData({
      stock_item_id: '',
      movement_type: '',
      quantity: 0,
      reason: '',
      notes: ''
    });
  };

  const getStockStatus = (item: StockItem) => {
    if (item.current_quantity === 0) {
      return { status: 'Rupture de stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (item.current_quantity <= item.minimum_quantity) {
      return { status: 'Stock faible', color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown };
    } else {
      return { status: 'En stock', color: 'bg-green-100 text-green-800', icon: TrendingUp };
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = stockItems.filter(item => 
    item.current_quantity <= item.minimum_quantity && item.active
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Stocks</h1>
      </div>

      {lowStockItems.length > 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{lowStockItems.length} article(s)</strong> en stock faible ou en rupture.
            <div className="mt-2">
              {lowStockItems.slice(0, 3).map(item => (
                <span key={item.id} className="inline-block mr-2 mb-1">
                  <Badge variant="destructive">{item.name}: {item.current_quantity}</Badge>
                </span>
              ))}
              {lowStockItems.length > 3 && <span>...</span>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowMovementForm(true)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Mouvement
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Article
              </Button>
            </div>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingItem ? 'Modifier l\'Article' : 'Nouvel Article'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="unit">Unité</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="current_quantity">Quantité actuelle</Label>
                      <Input
                        id="current_quantity"
                        type="number"
                        min="0"
                        value={formData.current_quantity}
                        onChange={(e) => setFormData({ ...formData, current_quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="minimum_quantity">Seuil minimum</Label>
                      <Input
                        id="minimum_quantity"
                        type="number"
                        min="0"
                        value={formData.minimum_quantity}
                        onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit_cost">Coût unitaire (DH)</Label>
                      <Input
                        id="unit_cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unit_cost}
                        onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="selling_price">Prix de vente (DH)</Label>
                      <Input
                        id="selling_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="supplier">Fournisseur</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="batch_number">Numéro de lot</Label>
                      <Input
                        id="batch_number"
                        value={formData.batch_number}
                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="expiration_date">Date d'expiration</Label>
                      <Input
                        id="expiration_date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Emplacement</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requires_prescription"
                      checked={formData.requires_prescription}
                      onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                    />
                    <Label htmlFor="requires_prescription">Nécessite une prescription</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingItem ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {showMovementForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Mouvement de Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMovementSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock_item_id">Article *</Label>
                      <Select value={movementData.stock_item_id} onValueChange={(value) => setMovementData({ ...movementData, stock_item_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un article" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockItems.filter(item => item.active).map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} (Stock: {item.current_quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="movement_type">Type de mouvement *</Label>
                      <Select value={movementData.movement_type} onValueChange={(value) => setMovementData({ ...movementData, movement_type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent>
                          {movementTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantité *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={movementData.quantity}
                        onChange={(e) => setMovementData({ ...movementData, quantity: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Raison</Label>
                      <Input
                        id="reason"
                        value={movementData.reason}
                        onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={movementData.notes}
                      onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowMovementForm(false); resetMovementForm(); }}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              const StatusIcon = stockStatus.icon;
              
              return (
                <Card key={item.id} className={`${!item.active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {item.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{item.current_quantity}</span>
                        <span className="text-sm text-muted-foreground">{item.unit}</span>
                      </div>
                      
                      <Badge className={stockStatus.color} variant="secondary">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {stockStatus.status}
                      </Badge>
                      
                      <div className="text-xs space-y-1">
                        <p><strong>Seuil min:</strong> {item.minimum_quantity}</p>
                        {item.unit_cost > 0 && (
                          <p><strong>Coût:</strong> {item.unit_cost} DH</p>
                        )}
                        {item.selling_price > 0 && (
                          <p><strong>Prix:</strong> {item.selling_price} DH</p>
                        )}
                        {item.supplier && (
                          <p><strong>Fournisseur:</strong> {item.supplier}</p>
                        )}
                        {item.expiration_date && (
                          <p><strong>Expiration:</strong> {new Date(item.expiration_date).toLocaleDateString()}</p>
                        )}
                        {item.location && (
                          <p><strong>Emplacement:</strong> {item.location}</p>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Aucun article trouvé</p>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Essayez de modifier vos critères de recherche.'
                    : 'Commencez par ajouter votre premier article.'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un article
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Historique des Mouvements</h2>
            <Button onClick={() => setShowMovementForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Mouvement
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Date</th>
                      <th className="p-4">Article</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Quantité</th>
                      <th className="p-4">Raison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map((movement) => {
                      const movementType = movementTypes.find(t => t.value === movement.movement_type);
                      return (
                        <tr key={movement.id} className="border-b">
                          <td className="p-4">
                            {new Date(movement.movement_date).toLocaleDateString()}
                          </td>
                          <td className="p-4">{movement.stock_item?.name}</td>
                          <td className="p-4">
                            {movementType && (
                              <Badge className={movementType.color} variant="secondary">
                                {movementType.label}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={movement.movement_type.includes('out') || movement.movement_type === 'sale' || movement.movement_type === 'usage' ? 'text-red-600' : 'text-green-600'}>
                              {movement.movement_type.includes('out') || movement.movement_type === 'sale' || movement.movement_type === 'usage' ? '-' : '+'}
                              {movement.quantity}
                            </span>
                          </td>
                          <td className="p-4">{movement.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <h2 className="text-lg font-semibold">Alertes de Stock</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockItems.map((item) => {
              const stockStatus = getStockStatus(item);
              const StatusIcon = stockStatus.icon;
              
              return (
                <Card key={item.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-red-500" />
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{item.current_quantity}</p>
                        <p className="text-xs text-muted-foreground">Seuil: {item.minimum_quantity}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge className={stockStatus.color} variant="secondary">
                        {stockStatus.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {lowStockItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium mb-2">Aucune alerte de stock</p>
                <p className="text-muted-foreground">
                  Tous vos articles sont à un niveau de stock satisfaisant.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockManagement;
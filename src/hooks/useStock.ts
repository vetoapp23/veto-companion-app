// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Database types that map to existing Supabase schema
export interface DatabaseStockItem {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity?: number;
  unit_cost?: number;
  selling_price?: number;
  supplier?: string;
  batch_number?: string;
  expiration_date?: string;
  location?: string;
  requires_prescription?: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  supplier_id?: string;
}

export interface DatabaseStockMovement {
  id: string;
  stock_item_id: string;
  item_name: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  performed_by?: string;
  movement_date: string;
  notes?: string;
  created_at: string;
}

export interface DatabaseStockAlert {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  alert_type: 'low_stock' | 'expired' | 'expiring_soon';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
}

export interface DatabaseSupplier {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  active: boolean; // Note: column is 'active' not 'is_active'
  created_at: string;
  updated_at: string;
}

// Convert database item to frontend format (compatibility with existing UI)
export const convertDatabaseStockItem = (dbItem: DatabaseStockItem): any => {
  return {
    id: parseInt(dbItem.id.replace(/-/g, '').slice(0, 8), 16), // Convert UUID to number for compatibility
    name: dbItem.name,
    category: dbItem.category,
    description: dbItem.description,
    unit: dbItem.unit,
    currentStock: dbItem.current_quantity,
    minimumStock: dbItem.minimum_quantity,
    maximumStock: dbItem.maximum_quantity,
    purchasePrice: dbItem.unit_cost || 0,
    sellingPrice: dbItem.selling_price || 0,
    totalValue: (dbItem.current_quantity || 0) * (dbItem.unit_cost || 0),
    expirationDate: dbItem.expiration_date,
    supplier: dbItem.supplier,
    location: dbItem.location,
    lastUpdated: dbItem.updated_at,
    isActive: dbItem.active,
    batchNumber: dbItem.batch_number,
    manufacturer: dbItem.supplier, // Use supplier as manufacturer for compatibility
  };
};

export const useStock = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stockItems, setStockItems] = useState<DatabaseStockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<DatabaseStockMovement[]>([]);
  const [stockAlerts, setStockAlerts] = useState<DatabaseStockAlert[]>([]);
  const [suppliers, setSuppliers] = useState<DatabaseSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock items
  const fetchStockItems = async () => {
    if (!user) return;
    
    try {
      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error fetching user profile:', profileError);
        setError('User profile or organization not found');
        return;
      }

      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      console.log('✅ Stock items loaded for organization:', profile.organization_id, 'Count:', data?.length);
      setStockItems(data || []);
    } catch (err: any) {
      console.error('Error fetching stock items:', err);
      setError(err.message);
    }
  };

  // Fetch stock movements
  const fetchStockMovements = async () => {
    if (!user) return;
    
    try {
      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          stock_items!inner(organization_id)
        `)
        .eq('stock_items.organization_id', profile.organization_id)
        .order('movement_date', { ascending: false });

      if (error) throw error;
      console.log('✅ Stock movements loaded for organization:', profile.organization_id, 'Count:', data?.length);
      setStockMovements(data || []);
    } catch (err: any) {
      console.error('Error fetching stock movements:', err);
      setError(err.message);
    }
  };

  // Fetch stock alerts
  const fetchStockAlerts = async () => {
    // DISABLED: stock_alerts is a VIEW without user_id or organization_id columns
    // The view needs to be recreated to include these columns from the underlying tables
    // For now, just return empty array to avoid errors
    console.log('⚠️ Stock alerts fetching disabled - view structure incompatible');
    setStockAlerts([]);
    return;
    
    /* 
    if (!user) return;
    
    try {
      // NOTE: stock_alerts is a VIEW, not a table with organization_id
      // For now, we'll skip fetching alerts or fetch by user_id
      // TODO: Recreate the view to include organization_id from stock_items
      
      const { data, error } = await supabase
        .from('stock_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('✅ Stock alerts loaded (by user_id):', 'Count:', data?.length);
      setStockAlerts(data || []);
    } catch (err: any) {
      console.error('Error fetching stock alerts:', err);
      setError(err.message);
    }
    */
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    if (!user) return;
    
    try {
      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      console.log('✅ Suppliers loaded for organization:', profile.organization_id, 'Count:', data?.length);
      setSuppliers(data || []);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(err.message);
    }
  };

  // Add new stock item
  const addStockItem = async (itemData: Omit<DatabaseStockItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User profile or organization not found');
      }

      const newItem = {
        ...itemData,
        user_id: user.id,
        organization_id: profile.organization_id
      };

      const { data, error } = await supabase
        .from('stock_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      // Immediately update local state for instant UI update
      setStockItems(prev => {
        const updated = [...prev, data];
        console.log('✅ Added item to state, new count:', updated.length);
        return updated;
      });
      
      toast({
        title: "Succès",
        description: "Article ajouté au stock",
      });

      return data;
    } catch (err: any) {
      console.error('Error adding stock item:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update stock item
  const updateStockItem = async (id: string, updates: Partial<DatabaseStockItem>) => {
    if (!user) return null;

    try {
      // Get user's organization_id for security check
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User profile or organization not found');
      }

      const { data, error } = await supabase
        .from('stock_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organization_id', profile.organization_id)
        .select()
        .single();

      if (error) throw error;

      // Immediately update local state for instant UI update
      setStockItems(prev => {
        const updated = prev.map(item => item.id === id ? data : item);
        console.log('✅ Updated item in state, found:', updated.some(i => i.id === id));
        return updated;
      });
      
      toast({
        title: "Succès",
        description: "Article mis à jour",
      });

      return data;
    } catch (err: any) {
      console.error('Error updating stock item:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete stock item (soft delete)
  const deleteStockItem = async (id: string) => {
    if (!user) return false;

    try {
      // Get user's organization_id for security check
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User profile or organization not found');
      }

      const { error } = await supabase
        .from('stock_items')
        .update({ active: false })
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      // Immediately update local state for instant UI update
      setStockItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Succès",
        description: "Article supprimé du stock",
      });

      return true;
    } catch (err: any) {
      console.error('Error deleting stock item:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
      return false;
    }
  };

  // Add stock movement
  const addStockMovement = async (movementData: Omit<DatabaseStockMovement, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([movementData])
        .select()
        .single();

      if (error) throw error;

      // Immediately update local state for movements
      setStockMovements(prev => [data, ...prev]);
      
      // Refresh items to get updated quantities (database trigger updates these)
      await fetchStockItems();
      
      toast({
        title: "Succès",
        description: "Mouvement de stock enregistré",
      });

      return data;
    } catch (err: any) {
      console.error('Error adding stock movement:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le mouvement",
        variant: "destructive",
      });
      return null;
    }
  };

  // Generate stock alerts
  const generateStockAlerts = async () => {
    // DISABLED: Database function 'generate_stock_alerts' doesn't exist
    // This feature needs to be implemented with a proper database function
    console.log('⚠️ Stock alerts generation disabled - function not implemented');
    return;
    
    /* 
    if (!user) return;

    try {
      const { error } = await supabase.rpc('generate_stock_alerts');
      
      if (error) throw error;

      await fetchStockAlerts(); // Refresh alerts
      
    } catch (err: any) {
      console.error('Error generating stock alerts:', err);
      // Don't show error toast for this as it's automatic
    }
    */
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchStockAlerts(); // Refresh alerts
    } catch (err: any) {
      console.error('Error marking alert as read:', err);
    }
  };

  // Add supplier
  const addSupplier = async (supplierData: Omit<DatabaseSupplier, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // Get user's organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('User profile or organization not found');
      }

      const newSupplier = {
        ...supplierData,
        user_id: user.id,
        organization_id: profile.organization_id,
      };

      const { data, error } = await supabase
        .from('suppliers')
        .insert([newSupplier])
        .select()
        .single();

      if (error) throw error;

      await fetchSuppliers(); // Refresh list
      
      toast({
        title: "Succès",
        description: "Fournisseur ajouté",
      });

      return data;
    } catch (err: any) {
      console.error('Error adding supplier:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fournisseur",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get compatible stock items for existing UI
  const getCompatibleStockItems = () => {
    return stockItems.map(convertDatabaseStockItem);
  };

  // Get stock alerts (compatible format)
  const getStockAlerts = () => {
    return stockAlerts.map(alert => ({
      id: parseInt(alert.id.replace(/-/g, '').slice(0, 8), 16),
      itemId: parseInt(alert.item_id.replace(/-/g, '').slice(0, 8), 16),
      itemName: alert.item_name,
      type: alert.alert_type,
      message: alert.message,
      severity: alert.severity,
      createdAt: alert.created_at,
      isRead: alert.is_read,
    }));
  };

  // Get stock movements (compatible format)
  const getStockMovements = () => {
    return stockMovements.map(movement => ({
      id: parseInt(movement.id.replace(/-/g, '').slice(0, 8), 16),
      itemId: parseInt(movement.stock_item_id.replace(/-/g, '').slice(0, 8), 16),
      itemName: movement.item_name,
      type: movement.movement_type,
      quantity: movement.quantity,
      reason: movement.reason,
      reference: movement.reference,
      performedBy: movement.performed_by,
      date: movement.movement_date,
      notes: movement.notes,
    }));
  };

  // Load all data on mount
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchStockItems(),
        fetchStockMovements(),
        // fetchStockAlerts(), // DISABLED - view structure incompatible
        fetchSuppliers(),
      ]).finally(() => {
        setLoading(false);
      });
      
      // Stock alerts generation disabled - function not implemented in database
      // generateStockAlerts();
      
      // Set empty alerts array since fetching is disabled
      setStockAlerts([]);
    }
  }, [user]);

  return {
    // Raw database data
    stockItems,
    stockMovements,
    stockAlerts,
    suppliers,
    loading,
    error,
    
    // Compatible data for existing UI
    compatibleStockItems: getCompatibleStockItems(),
    compatibleStockAlerts: getStockAlerts(),
    compatibleStockMovements: getStockMovements(),
    
    // CRUD operations
    addStockItem,
    updateStockItem,
    deleteStockItem,
    addStockMovement,
    addSupplier,
    
    // Utility functions
    generateStockAlerts,
    markAlertAsRead,
    
    // Refresh functions
    fetchStockItems,
    fetchStockMovements,
    fetchStockAlerts,
    fetchSuppliers,
  };
};
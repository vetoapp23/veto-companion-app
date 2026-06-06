// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Database types
export interface DatabaseRevenue {
  id: string;
  user_id: string;
  revenue_date: string;
  source: string;
  category?: string;
  description: string;
  amount: number;
  tax_amount?: number;
  payment_method?: string;
  reference_id?: string;
  reference_type?: string;
  client_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExpense {
  id: string;
  user_id: string;
  expense_date: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  payment_method?: string;
  supplier_name?: string;
  receipt_number?: string;
  tax_amount?: number;
  is_deductible: boolean;
  notes?: string;
  attachment_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface DatabaseInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  status: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabasePayment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  user_id: string;
  created_at: string;
}

export const useAccounting = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [revenues, setRevenues] = useState<DatabaseRevenue[]>([]);
  const [expenses, setExpenses] = useState<DatabaseExpense[]>([]);
  const [invoices, setInvoices] = useState<DatabaseInvoice[]>([]);
  const [payments, setPayments] = useState<DatabasePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch revenues
  const fetchRevenues = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select('*')
        .eq('user_id', user.id)
        .order('revenue_date', { ascending: false });

      if (error) throw error;
      setRevenues(data || []);
    } catch (err: any) {
      console.error('Error fetching revenues:', err);
      setError(err.message);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message);
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchRevenues(),
        fetchExpenses(),
        fetchInvoices(),
        fetchPayments()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  // Add revenue
  const addRevenue = async (revenueData: Omit<DatabaseRevenue, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const newRevenue = {
        ...revenueData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('revenue')
        .insert([newRevenue])
        .select()
        .single();

      if (error) throw error;

      await fetchRevenues();
      
      toast({
        title: "Succès",
        description: "Recette ajoutée",
      });

      return data;
    } catch (err: any) {
      console.error('Error adding revenue:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recette",
        variant: "destructive",
      });
      return null;
    }
  };

  // Add expense
  const addExpense = async (expenseData: Omit<DatabaseExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const newExpense = {
        ...expenseData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();

      if (error) throw error;

      await fetchExpenses();
      
      toast({
        title: "Succès",
        description: "Charge ajoutée",
      });

      return data;
    } catch (err: any) {
      console.error('Error adding expense:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la charge",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update revenue
  const updateRevenue = async (id: string, updates: Partial<DatabaseRevenue>) => {
    try {
      const { error } = await supabase
        .from('revenue')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchRevenues();
      
      toast({
        title: "Succès",
        description: "Recette modifiée",
      });
    } catch (err: any) {
      console.error('Error updating revenue:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la recette",
        variant: "destructive",
      });
    }
  };

  // Update expense
  const updateExpense = async (id: string, updates: Partial<DatabaseExpense>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchExpenses();
      
      toast({
        title: "Succès",
        description: "Charge modifiée",
      });
    } catch (err: any) {
      console.error('Error updating expense:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la charge",
        variant: "destructive",
      });
    }
  };

  // Delete revenue
  const deleteRevenue = async (id: string) => {
    try {
      const { error } = await supabase
        .from('revenue')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchRevenues();
      
      toast({
        title: "Succès",
        description: "Recette supprimée",
      });
    } catch (err: any) {
      console.error('Error deleting revenue:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recette",
        variant: "destructive",
      });
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchExpenses();
      
      toast({
        title: "Succès",
        description: "Charge supprimée",
      });
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la charge",
        variant: "destructive",
      });
    }
  };

  return {
    revenues,
    expenses,
    invoices,
    payments,
    loading,
    error,
    addRevenue,
    addExpense,
    updateRevenue,
    updateExpense,
    deleteRevenue,
    deleteExpense,
    refreshAll: () => {
      fetchRevenues();
      fetchExpenses();
      fetchInvoices();
      fetchPayments();
    }
  };
};
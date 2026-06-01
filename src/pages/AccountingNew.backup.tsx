import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  Calendar,
  FileText,
  Euro,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface FinancialDashboard {
  current_month_revenue: number;
  current_month_expenses: number;
  current_month_profit: number;
  outstanding_invoices_amount: number;
  outstanding_invoices_count: number;
  paid_invoices_amount: number;
  paid_invoices_count: number;
}

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  subcategory: string;
  description: string;
  amount: number;
  payment_method: string;
  supplier_name: string;
  receipt_number: string;
  tax_amount: number;
  is_deductible: boolean;
  notes: string;
  status: string;
  created_at: string;
}

interface Revenue {
  id: string;
  revenue_date: string;
  source: string;
  category: string;
  description: string;
  amount: number;
  tax_amount: number;
  payment_method: string;
  client_id: string;
  notes: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: string;
  payment_date: string;
  client?: {
    first_name: string;
    last_name: string;
  };
}

const Accounting: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: '',
    subcategory: '',
    description: '',
    amount: 0,
    payment_method: '',
    supplier_name: '',
    receipt_number: '',
    tax_amount: 0,
    is_deductible: true,
    notes: ''
  });

  const [revenueForm, setRevenueForm] = useState({
    revenue_date: new Date().toISOString().split('T')[0],
    source: '',
    category: '',
    description: '',
    amount: 0,
    tax_amount: 0,
    payment_method: '',
    notes: ''
  });

  const expenseCategories = [
    'Formation',
    'Matériel médical',
    'Médicaments',
    'Loyer',
    'Électricité',
    'Eau',
    'Téléphone/Internet',
    'Assurance',
    'Carburant',
    'Déplacements',
    'Marketing',
    'Comptabilité',
    'Maintenance',
    'Fournitures bureau',
    'Autre'
  ];

  const paymentMethods = [
    'espèces',
    'chèque',
    'virement',
    'carte_bancaire',
    'prélèvement',
    'autre'
  ];

  const revenueSource = [
    'consultation',
    'vaccination',
    'chirurgie',
    'hospitalisation',
    'analyses',
    'vente_produits',
    'formation',
    'autre'
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchExpenses();
      fetchRevenue();
      fetchInvoices();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_dashboard')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setDashboard(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .select('*')
        .eq('user_id', user?.id)
        .order('revenue_date', { ascending: false });

      if (error) throw error;
      setRevenue(data || []);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(first_name, last_name)
        `)
        .eq('user_id', user?.id)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseForm,
          amount: parseFloat(expenseForm.amount.toString()) || 0,
          tax_amount: parseFloat(expenseForm.tax_amount.toString()) || 0,
          user_id: user?.id
        }]);

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Dépense enregistrée avec succès.',
      });

      setShowExpenseForm(false);
      resetExpenseForm();
      fetchExpenses();
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la dépense.',
        variant: 'destructive',
      });
    }
  };

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('revenue')
        .insert([{
          ...revenueForm,
          amount: parseFloat(revenueForm.amount.toString()) || 0,
          tax_amount: parseFloat(revenueForm.tax_amount.toString()) || 0,
          user_id: user?.id
        }]);

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Recette enregistrée avec succès.',
      });

      setShowRevenueForm(false);
      resetRevenueForm();
      fetchRevenue();
      fetchDashboardData();
    } catch (error) {
      console.error('Error saving revenue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la recette.',
        variant: 'destructive',
      });
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      subcategory: '',
      description: '',
      amount: 0,
      payment_method: '',
      supplier_name: '',
      receipt_number: '',
      tax_amount: 0,
      is_deductible: true,
      notes: ''
    });
  };

  const resetRevenueForm = () => {
    setRevenueForm({
      revenue_date: new Date().toISOString().split('T')[0],
      source: '',
      category: '',
      description: '',
      amount: 0,
      tax_amount: 0,
      payment_method: '',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'paid': { color: 'bg-green-100 text-green-800', label: 'Payée' },
      'unpaid': { color: 'bg-red-100 text-red-800', label: 'Impayée' },
      'partially_paid': { color: 'bg-yellow-100 text-yellow-800', label: 'Partiellement payée' },
      'overdue': { color: 'bg-red-100 text-red-800', label: 'En retard' }
    };
    
    const badge = badges[status as keyof typeof badges] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={badge.color} variant="secondary">{badge.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comptabilité</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          <TabsTrigger value="revenue">Recettes</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recettes ce mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboard?.current_month_revenue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses ce mois</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboard?.current_month_expenses || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bénéfice ce mois</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(dashboard?.current_month_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboard?.current_month_profit || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(dashboard?.outstanding_invoices_amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboard?.outstanding_invoices_count || 0} facture(s)
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Dépenses récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {new Date(expense.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-red-600">
                        -{formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune dépense enregistrée
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Recettes récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenue.slice(0, 5).map((rev) => (
                    <div key={rev.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{rev.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {rev.source} • {new Date(rev.revenue_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-green-600">
                        +{formatCurrency(rev.amount)}
                      </span>
                    </div>
                  ))}
                  {revenue.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune recette enregistrée
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Gestion des Dépenses</h2>
            <Button onClick={() => setShowExpenseForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Dépense
            </Button>
          </div>

          {showExpenseForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Dépense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expense_date">Date *</Label>
                      <Input
                        id="expense_date"
                        type="date"
                        value={expenseForm.expense_date}
                        onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Montant (DH) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_method">Mode de paiement</Label>
                      <Select value={expenseForm.payment_method} onValueChange={(value) => setExpenseForm({ ...expenseForm, payment_method: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="supplier_name">Fournisseur</Label>
                      <Input
                        id="supplier_name"
                        value={expenseForm.supplier_name}
                        onChange={(e) => setExpenseForm({ ...expenseForm, supplier_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="receipt_number">N° reçu/facture</Label>
                      <Input
                        id="receipt_number"
                        value={expenseForm.receipt_number}
                        onChange={(e) => setExpenseForm({ ...expenseForm, receipt_number: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tax_amount">TVA (DH)</Label>
                      <Input
                        id="tax_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={expenseForm.tax_amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, tax_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_deductible"
                      checked={expenseForm.is_deductible}
                      onChange={(e) => setExpenseForm({ ...expenseForm, is_deductible: e.target.checked })}
                    />
                    <Label htmlFor="is_deductible">Déductible fiscalement</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowExpenseForm(false); resetExpenseForm(); }}>
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

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Catégorie</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Fournisseur</th>
                      <th className="p-4">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b">
                        <td className="p-4">{new Date(expense.expense_date).toLocaleDateString()}</td>
                        <td className="p-4">{expense.description}</td>
                        <td className="p-4">{expense.category}</td>
                        <td className="p-4 font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="p-4">{expense.supplier_name}</td>
                        <td className="p-4">{expense.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Gestion des Recettes</h2>
            <Button onClick={() => setShowRevenueForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Recette
            </Button>
          </div>

          {showRevenueForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Recette</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRevenueSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="revenue_date">Date *</Label>
                      <Input
                        id="revenue_date"
                        type="date"
                        value={revenueForm.revenue_date}
                        onChange={(e) => setRevenueForm({ ...revenueForm, revenue_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="source">Source *</Label>
                      <Select value={revenueForm.source} onValueChange={(value) => setRevenueForm({ ...revenueForm, source: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la source" />
                        </SelectTrigger>
                        <SelectContent>
                          {revenueSource.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Montant (DH) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={revenueForm.amount}
                        onChange={(e) => setRevenueForm({ ...revenueForm, amount: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_method">Mode de paiement</Label>
                      <Select value={revenueForm.payment_method} onValueChange={(value) => setRevenueForm({ ...revenueForm, payment_method: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tax_amount">TVA (DH)</Label>
                      <Input
                        id="tax_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={revenueForm.tax_amount}
                        onChange={(e) => setRevenueForm({ ...revenueForm, tax_amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      value={revenueForm.description}
                      onChange={(e) => setRevenueForm({ ...revenueForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={revenueForm.notes}
                      onChange={(e) => setRevenueForm({ ...revenueForm, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowRevenueForm(false); resetRevenueForm(); }}>
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

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue.map((rev) => (
                      <tr key={rev.id} className="border-b">
                        <td className="p-4">{new Date(rev.revenue_date).toLocaleDateString()}</td>
                        <td className="p-4">{rev.description}</td>
                        <td className="p-4">{rev.source}</td>
                        <td className="p-4 font-semibold text-green-600">
                          {formatCurrency(rev.amount)}
                        </td>
                        <td className="p-4">{rev.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Factures</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4">N° Facture</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Échéance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="p-4 font-medium">{invoice.invoice_number}</td>
                        <td className="p-4">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                        <td className="p-4">
                          {invoice.client && `${invoice.client.first_name} ${invoice.client.last_name}`}
                        </td>
                        <td className="p-4 font-semibold">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="p-4">
                          {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Rapports Financiers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition des Dépenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Graphique des dépenses par catégorie (à implémenter)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Évolution Mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Graphique de l'évolution recettes vs dépenses (à implémenter)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Déclaration TVA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Résumé pour déclaration TVA (à implémenter)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analyse de Rentabilité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analyse détaillée de la rentabilité (à implémenter)</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
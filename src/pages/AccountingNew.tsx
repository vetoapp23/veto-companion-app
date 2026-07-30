// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccounting } from '@/hooks/useAccounting';
import { useSettings } from '@/contexts/SettingsContext';
import { useAccountingTemplates, type AccountingTemplate } from '@/hooks/useAccountingTemplates';
import { useToast } from '@/hooks/use-toast';
import { formatSourceLabel } from '@/lib/accountingLedger';
import { markInvoicePaid } from '@/lib/visitInvoice';
import { 
  Calculator, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Edit,
  Trash2,
  FileText,
  Lightbulb,
  X,
  Receipt,
  Wallet,
  CheckCircle2,
  Clock3,
  RefreshCw
} from 'lucide-react';
import { AppPageHeader } from '@/components/AppPageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// UI-compatible AccountingEntry interface
export interface AccountingEntry {
  id: string;
  /** valuation = entrée stock (inventaire), hors CA / hors charges P&L */
  type: 'revenue' | 'expense' | 'valuation';
  category: 'automatic' | 'manual';
  frequency: 'monthly' | 'annual' | 'occasional';
  description: string;
  amount: number;
  date: string;
  reference?: string;
  source?: string;
  sourceId?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

function isStockValuationExpense(exp: { category?: string; subcategory?: string | null }) {
  return (
    exp.category === 'stock_purchase' ||
    exp.category === 'stock_valuation' ||
    exp.subcategory === 'inventory_valuation'
  );
}

const Accounting: React.FC = () => {
  const { 
    revenues,
    expenses,
    invoices,
    payments,
    loading,
    addRevenue, 
    addExpense,
    updateRevenue,
    updateExpense,
    deleteRevenue,
    deleteExpense,
    refreshAll,
    fetchInvoices,
  } = useAccounting();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  // Convert database entries to UI format
  const accountingEntries: AccountingEntry[] = useMemo(() => {
    const revenueEntries = revenues.map(rev => {
      const isAuto = !!(rev.reference_id || ['visit', 'prescription', 'stock_sale', 'consultation', 'vaccination', 'antiparasitic'].includes(rev.source));
      return {
        id: rev.id,
        type: 'revenue' as const,
        category: (isAuto ? 'automatic' : 'manual') as 'automatic' | 'manual',
        frequency: 'occasional' as const,
        description: rev.description,
        amount: Number(rev.amount) || 0,
        date: rev.revenue_date,
        reference: rev.reference_id || undefined,
        source: rev.source || 'other',
        sourceId: rev.reference_id,
        notes: rev.notes || undefined,
        createdAt: rev.created_at,
        createdBy: rev.user_id
      };
    });

    const expenseEntries = expenses.map(exp => {
      const isValuation = isStockValuationExpense(exp);
      const isAuto = !!(
        exp.receipt_number?.startsWith('SM-') ||
        ['stock_purchase', 'stock_valuation', 'cogs'].includes(exp.category)
      );
      return {
        id: exp.id,
        type: (isValuation ? 'valuation' : 'expense') as 'expense' | 'valuation',
        category: (isAuto ? 'automatic' : 'manual') as 'automatic' | 'manual',
        frequency: 'occasional' as const,
        description: exp.description,
        amount: Number(exp.amount) || 0,
        date: exp.expense_date,
        reference: exp.receipt_number || undefined,
        source: exp.category || 'other',
        sourceId: undefined,
        notes: exp.notes || undefined,
        createdAt: exp.created_at,
        createdBy: exp.user_id
      };
    });

    return [...revenueEntries, ...expenseEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [revenues, expenses]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { grouped: templateGroups, addTemplate, updateTemplate, deleteTemplate } = useAccountingTemplates();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<AccountingTemplate | null>(null);

  // Formulaire pour la configuration des suggestions
  const [suggestionFormData, setSuggestionFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'revenue' | 'expense',
    frequency: 'monthly' as 'monthly' | 'annual' | 'occasional',
    source: 'other' as any
  });

  // Formulaire pour ajouter/modifier une entrée
  const [formData, setFormData] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    frequency: 'occasional' as 'monthly' | 'annual' | 'occasional',
    description: '',
    amount: '',
    date: '',
    source: 'other' as any,
    notes: ''
  });

  // Initialiser les dates
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
  }, []);

  // Generate summary from accounting entries
  const generateAccountingSummary = useMemo(() => {
    if (!startDate || !endDate) return null;
    
    const filteredByDate = accountingEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });

    const revenues = filteredByDate.filter(e => e.type === 'revenue');
    const expensesFiltered = filteredByDate.filter(e => e.type === 'expense');
    const valuations = filteredByDate.filter(e => e.type === 'valuation');

    // CA = recettes (prix de vente total des ventes, pas la marge)
    const totalRevenue = revenues.reduce((sum, e) => sum + e.amount, 0);
    // Charges P&L hors valorisation stock (l'entrée stock n'est pas une charge)
    const totalExpenses = expensesFiltered.reduce((sum, e) => sum + e.amount, 0);
    const stockValuation = valuations.reduce((sum, e) => sum + e.amount, 0);

    // Calculate revenue breakdown
    const sumBy = (list: AccountingEntry[], pred: (e: AccountingEntry) => boolean) =>
      list.filter(pred).reduce((sum, e) => sum + e.amount, 0);

    const revenueBreakdown = {
      visits: sumBy(revenues, e => e.source === 'visit' || e.source === 'visite' || e.source === 'elevage'),
      consultations: sumBy(revenues, e => e.source === 'consultation'),
      vaccinations: sumBy(revenues, e => e.source === 'vaccination'),
      antiparasitics: sumBy(revenues, e => e.source === 'antiparasitic'),
      prescriptions: sumBy(revenues, e => e.source === 'prescription'),
      stockSales: sumBy(revenues, e => e.source === 'stock_sale'),
      manualEntries: sumBy(revenues, e => !e.source || e.source === 'other' || e.source === 'manual'),
    };

    // Calculate expense breakdown (COGS = coût à la vente ; stockPurchases = valorisation hors P&L)
    const expenseBreakdown = {
      stockPurchases: stockValuation,
      cogs: sumBy(expensesFiltered, e => e.source === 'cogs'),
      salaries: sumBy(expensesFiltered, e => e.source === 'salary'),
      rent: sumBy(expensesFiltered, e => e.source === 'rent'),
      taxes: sumBy(expensesFiltered, e => e.source === 'tax'),
      insurance: sumBy(expensesFiltered, e => e.source === 'insurance'),
      other: sumBy(expensesFiltered, e => !['stock_purchase', 'stock_valuation', 'cogs', 'salary', 'rent', 'tax', 'insurance'].includes(e.source || '')),
    };

    const grossMargin = totalRevenue - expenseBreakdown.cogs;

    return {
      totalRevenue,
      totalExpenses,
      stockValuation,
      netIncome: totalRevenue - totalExpenses,
      grossMargin,
      entriesCount: filteredByDate.length,
      revenueBreakdown,
      expenseBreakdown
    };
  }, [accountingEntries, startDate, endDate]);

  const invoiceStats = useMemo(() => {
    const inPeriod = (d?: string) => {
      if (!startDate || !endDate || !d) return true;
      const x = new Date(d);
      return x >= new Date(startDate) && x <= new Date(endDate);
    };
    const list = invoices.filter((inv: any) => inPeriod(inv.invoice_date));
    const outstanding = list.filter((inv: any) => inv.status === 'issued' || inv.status === 'draft');
    const paid = list.filter((inv: any) => inv.status === 'paid');
    const outstandingAmount = outstanding.reduce((s: number, inv: any) => s + (Number(inv.total_amount) || 0), 0);
    const paidAmount = paid.reduce((s: number, inv: any) => s + (Number(inv.total_amount) || 0), 0);
    const paymentsInPeriod = payments.filter((p: any) => inPeriod(p.payment_date));
    const cashIn = paymentsInPeriod.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
    return {
      count: list.length,
      outstandingCount: outstanding.length,
      outstandingAmount,
      paidAmount,
      cashIn,
    };
  }, [invoices, payments, startDate, endDate]);

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    try {
      setMarkingPaidId(invoiceId);
      await markInvoicePaid(invoiceId, 'cash');
      await fetchInvoices();
      refreshAll();
      toast({ title: 'Facture marquée payée' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'Paiement impossible', variant: 'destructive' });
    } finally {
      setMarkingPaidId(null);
    }
  };

  // Calculer le résumé quand les dates changent
  useEffect(() => {
    if (startDate && endDate) {
      setSummary(generateAccountingSummary);
    }
  }, [startDate, endDate, generateAccountingSummary]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case 'day':
        const today = format(now, 'yyyy-MM-dd');
        setStartDate(today);
        setEndDate(today);
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        setStartDate(format(startOfQuarter, 'yyyy-MM-dd'));
        setEndDate(format(endOfQuarter, 'yyyy-MM-dd'));
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        setStartDate(format(startOfYear, 'yyyy-MM-dd'));
        setEndDate(format(endOfYear, 'yyyy-MM-dd'));
        break;
    }
  };

  const handleAddEntry = async () => {
    if (!formData.description || !formData.amount || !formData.date) return;

    if (editingEntry) {
      // Update existing entry
      if (editingEntry.type === 'revenue') {
        await updateRevenue(editingEntry.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          revenue_date: formData.date,
          source: formData.source,
          notes: formData.notes
        });
      } else {
        await updateExpense(editingEntry.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          expense_date: formData.date,
          category: formData.source,
          notes: formData.notes
        });
      }
      setEditingEntry(null);
    } else {
      // Add new entry
      if (formData.type === 'revenue') {
        await addRevenue({
          revenue_date: formData.date,
          source: formData.source,
          description: formData.description,
          amount: parseFloat(formData.amount),
          notes: formData.notes
        });
      } else {
        await addExpense({
          expense_date: formData.date,
          category: formData.source,
          description: formData.description,
          amount: parseFloat(formData.amount),
          status: 'approved',
          is_deductible: true,
          notes: formData.notes
        });
      }
    }

    // Reset form
    setFormData({
      type: 'revenue',
      frequency: 'occasional',
      description: '',
      amount: '',
      date: '',
      source: 'other',
      notes: ''
    });
    setIsAddEntryModalOpen(false);
  };

  const handleEditEntry = (entry: AccountingEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      frequency: entry.frequency,
      description: entry.description,
      amount: entry.amount.toString(),
      date: entry.date,
      source: entry.source || 'other',
      notes: entry.notes || ''
    });
    setIsAddEntryModalOpen(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      const entry = accountingEntries.find(e => e.id === entryId);
      if (entry) {
        if (entry.type === 'revenue') {
          await deleteRevenue(entryId);
        } else {
          await deleteExpense(entryId);
        }
      }
    }
  };

  const handleApplySuggestion = (suggestion: AccountingTemplate) => {
    setFormData({
      ...formData,
      type: suggestion.type,
      frequency: suggestion.frequency || 'occasional',
      description: suggestion.description,
      amount: suggestion.amount.toString(),
      source: suggestion.source,
      date: formData.date || format(new Date(), 'yyyy-MM-dd')
    });
    setShowSuggestions(false);
  };

  const handleAddSuggestion = async () => {
    if (!suggestionFormData.description || !suggestionFormData.amount) return;

    if (editingSuggestion) {
      await updateTemplate(editingSuggestion.id, {
        description: suggestionFormData.description,
        amount: parseFloat(suggestionFormData.amount),
        type: suggestionFormData.type,
        frequency: suggestionFormData.frequency,
        source: suggestionFormData.source,
      });
      setEditingSuggestion(null);
    } else {
      await addTemplate({
        description: suggestionFormData.description,
        amount: parseFloat(suggestionFormData.amount),
        type: suggestionFormData.type,
        frequency: suggestionFormData.frequency,
        source: suggestionFormData.source,
      });
    }

    // Reset form
    setSuggestionFormData({
      description: '',
      amount: '',
      type: 'expense',
      frequency: 'monthly',
      source: 'other'
    });
    setIsConfigModalOpen(false);
  };

  const handleEditSuggestion = (suggestion: AccountingTemplate) => {
    setEditingSuggestion(suggestion);
    setSuggestionFormData({
      description: suggestion.description,
      amount: suggestion.amount.toString(),
      type: suggestion.type,
      frequency: suggestion.frequency,
      source: suggestion.source
    });
    setIsConfigModalOpen(true);
  };

  const handleDeleteSuggestion = async (suggestion: AccountingTemplate) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette suggestion ?')) {
      await deleteTemplate(suggestion.id);
    }
  };

  const filteredEntries = accountingEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${settings.currency}`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'visit':
      case 'visite':
      case 'elevage': return '🏥';
      case 'consultation': return '🩺';
      case 'vaccination': return '💉';
      case 'antiparasitic': return '💊';
      case 'prescription': return '📋';
      case 'stock_sale': return '🛒';
      case 'stock_purchase': return '📦';
      case 'cogs': return '📉';
      case 'salary': return '👥';
      case 'rent': return '🏢';
      case 'tax': return '📊';
      case 'insurance': return '🛡️';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <AppPageHeader
          className="flex-1"
          icon={Calculator}
          title="Comptabilité"
          description="CA, charges, factures et stock synchronisés en temps réel"
        />
        <div className="flex gap-2 lg:pt-4">
          <Button variant="outline" className="rounded-full" onClick={() => refreshAll()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full"
                onClick={() => { setEditingEntry(null); setFormData({ type: 'revenue', frequency: 'occasional', description: '', amount: '', date: '', source: 'other', notes: '' }); }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Modifier l\'entrée comptable' : 'Ajouter une entrée comptable'}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Modifiez les informations de cette entrée.' : 'Ajoutez une nouvelle recette ou charge manuelle.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Suggestions prédéfinies */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <Label className="text-sm font-medium">Suggestions prédéfinies</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                    >
                      {showSuggestions ? <X className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {showSuggestions && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Charges mensuelles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {templateGroups.monthly.map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm">{suggestion.description}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Charges annuelles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {templateGroups.annual.map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm">{suggestion.description}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Charges occasionnelles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {templateGroups.occasional.map((suggestion) => (
                            <Button
                              key={suggestion.id}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm">{suggestion.description}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'revenue' | 'expense') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Recette</SelectItem>
                        <SelectItem value="expense">Charge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency">Fréquence</Label>
                    <Select value={formData.frequency} onValueChange={(value: 'monthly' | 'annual' | 'occasional') => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                        <SelectItem value="occasional">Occasionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Salaire employé, Loyer, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant ({settings.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visit">Visite / prestations</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="antiparasitic">Antiparasitaire</SelectItem>
                      <SelectItem value="prescription">Ordonnance / Rx</SelectItem>
                      <SelectItem value="stock_sale">Vente stock</SelectItem>
                      <SelectItem value="stock_purchase">Achat stock</SelectItem>
                      <SelectItem value="cogs">Coût de revient</SelectItem>
                      <SelectItem value="salary">Salaire</SelectItem>
                      <SelectItem value="rent">Loyer</SelectItem>
                      <SelectItem value="tax">Impôts</SelectItem>
                      <SelectItem value="insurance">Assurance</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEntry}>
                    {editingEntry ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('day')}
                size="sm"
              >
                Ce jour
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('month')}
                size="sm"
              >
                Ce mois
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('quarter')}
                size="sm"
              >
                Ce trimestre
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('year')}
                size="sm"
              >
                Cette année
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Label htmlFor="startDate">Du</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Label htmlFor="endDate">Au</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Prix de vente total (pas la marge)
              </p>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <div>Visites / prestations: {formatCurrency(summary.revenueBreakdown.visits)}</div>
                <div>Ordonnances / Rx: {formatCurrency(summary.revenueBreakdown.prescriptions)}</div>
                <div>Ventes stock: {formatCurrency(summary.revenueBreakdown.stockSales)}</div>
                <div>Consult. / vacc. / anti.: {formatCurrency(
                  summary.revenueBreakdown.consultations +
                  summary.revenueBreakdown.vaccinations +
                  summary.revenueBreakdown.antiparasitics
                )}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Charges</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <div>COGS (coût à la vente): {formatCurrency(summary.expenseBreakdown.cogs)}</div>
                <div className="text-blue-600">Valorisation stock (hors CA): {formatCurrency(summary.stockValuation)}</div>
                <div>Salaires: {formatCurrency(summary.expenseBreakdown.salaries)}</div>
                <div>Loyer / impôts / autres: {formatCurrency(
                  summary.expenseBreakdown.rent +
                  summary.expenseBreakdown.taxes +
                  summary.expenseBreakdown.insurance +
                  summary.expenseBreakdown.other
                )}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résultat net</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netIncome)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <div>Marge brute (CA − COGS): {formatCurrency(summary.grossMargin)}</div>
                <div>{summary.entriesCount} écriture(s) sur la période</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Factures & encaissements</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(invoiceStats.outstandingAmount)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <div>{invoiceStats.outstandingCount} facture(s) en attente</div>
                <div>Payé: {formatCurrency(invoiceStats.paidAmount)}</div>
                <div>Encaissements (cash): {formatCurrency(invoiceStats.cashIn)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="entries">Journal</TabsTrigger>
          <TabsTrigger value="invoices">Factures ({invoices.length})</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Journal comptable
              </CardTitle>
              <CardDescription>
                Écritures automatiques (visites, stock, ordonnances) et manuelles
              </CardDescription>
            </CardHeader>
            <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const typeLabel =
                  entry.type === 'revenue'
                    ? 'Recette'
                    : entry.type === 'valuation'
                      ? 'Valorisation'
                      : 'Charge';
                const typeBadgeClass =
                  entry.type === 'revenue'
                    ? 'bg-green-600 hover:bg-green-600'
                    : entry.type === 'valuation'
                      ? 'bg-blue-600 hover:bg-blue-600'
                      : '';
                const amountClass =
                  entry.type === 'revenue'
                    ? 'text-green-600'
                    : entry.type === 'valuation'
                      ? 'text-blue-600'
                      : 'text-red-600';
                const amountPrefix =
                  entry.type === 'revenue' ? '+' : entry.type === 'valuation' ? '' : '-';

                return (
                <TableRow key={`${entry.type}-${entry.id}`}>
                  <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.type === 'expense' ? 'destructive' : 'default'}
                      className={typeBadgeClass || undefined}
                    >
                      {typeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="truncate font-medium">{entry.description}</div>
                    {entry.notes && <div className="text-xs text-muted-foreground truncate">{entry.notes}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{getSourceIcon(entry.source || 'other')}</span>
                      <span>{formatSourceLabel(entry.source)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {entry.category === 'automatic' ? 'Auto' : 'Manuel'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${amountClass}`}>
                    {amountPrefix}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell>
                    {entry.category === 'manual' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune entrée comptable pour cette période
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Factures
              </CardTitle>
              <CardDescription>
                Factures générées depuis les visites / prestations — statut et encaissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Aucune facture pour le moment.</p>
                  <p className="text-sm">Facturez une visite depuis l&apos;espace Visites pour alimenter ce tableau.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N°</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv: any) => {
                      const clientName = inv.client
                        ? `${inv.client.first_name || ''} ${inv.client.last_name || ''}`.trim()
                        : '—';
                      const status = inv.status || 'issued';
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                          <TableCell>
                            {inv.invoice_date
                              ? format(new Date(inv.invoice_date), 'dd/MM/yyyy', { locale: fr })
                              : '—'}
                          </TableCell>
                          <TableCell>{clientName || '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={status === 'paid' ? 'default' : status === 'cancelled' ? 'destructive' : 'outline'}
                              className="gap-1"
                            >
                              {status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                              {status === 'paid' ? 'Payée' : status === 'issued' ? 'Émise' : status === 'draft' ? 'Brouillon' : status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(Number(inv.total_amount) || 0)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inv.payment_date
                              ? `${format(new Date(inv.payment_date), 'dd/MM/yyyy', { locale: fr })}${inv.payment_method ? ` · ${inv.payment_method}` : ''}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {(status === 'issued' || status === 'draft') && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={markingPaidId === inv.id}
                                onClick={() => handleMarkInvoicePaid(inv.id)}
                              >
                                Marquer payée
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Configuration des Suggestions
              </CardTitle>
              <CardDescription>
                Configurez les suggestions prédéfinies pour faciliter la saisie des charges et recettes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Suggestions Mensuelles</h3>
                <Button onClick={() => { setEditingSuggestion(null); setSuggestionFormData({ description: '', amount: '', type: 'expense', frequency: 'monthly', source: 'other' }); setIsConfigModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <div className="grid gap-3">
                {templateGroups.monthly.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.description}</span>
                      <span className="text-sm text-muted-foreground">{suggestion.amount} {settings.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSuggestion(suggestion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestion(suggestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Suggestions Annuelles</h3>
                <Button onClick={() => { setEditingSuggestion(null); setSuggestionFormData({ description: '', amount: '', type: 'expense', frequency: 'annual', source: 'other' }); setIsConfigModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <div className="grid gap-3">
                {templateGroups.annual.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.description}</span>
                      <span className="text-sm text-muted-foreground">{suggestion.amount} {settings.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSuggestion(suggestion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestion(suggestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Suggestions Occasionnelles</h3>
                <Button onClick={() => { setEditingSuggestion(null); setSuggestionFormData({ description: '', amount: '', type: 'expense', frequency: 'occasional', source: 'other' }); setIsConfigModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <div className="grid gap-3">
                {templateGroups.occasional.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.description}</span>
                      <span className="text-sm text-muted-foreground">{suggestion.amount} {settings.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSuggestion(suggestion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestion(suggestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal pour configurer les suggestions */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSuggestion ? 'Modifier la suggestion' : 'Ajouter une suggestion'}
            </DialogTitle>
            <DialogDescription>
              {editingSuggestion ? 'Modifiez les informations de cette suggestion.' : 'Ajoutez une nouvelle suggestion prédéfinie.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestion-type">Type</Label>
                <Select value={suggestionFormData.type} onValueChange={(value: 'revenue' | 'expense') => setSuggestionFormData({ ...suggestionFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Recette</SelectItem>
                    <SelectItem value="expense">Charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="suggestion-frequency">Fréquence</Label>
                <Select value={suggestionFormData.frequency} onValueChange={(value: 'monthly' | 'annual' | 'occasional') => setSuggestionFormData({ ...suggestionFormData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="annual">Annuel</SelectItem>
                    <SelectItem value="occasional">Occasionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="suggestion-description">Description</Label>
              <Input
                id="suggestion-description"
                value={suggestionFormData.description}
                onChange={(e) => setSuggestionFormData({ ...suggestionFormData, description: e.target.value })}
                placeholder="Ex: Salaire employé, Loyer, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestion-amount">Montant ({settings.currency})</Label>
                <Input
                  id="suggestion-amount"
                  type="number"
                  step="0.01"
                  value={suggestionFormData.amount}
                  onChange={(e) => setSuggestionFormData({ ...suggestionFormData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="suggestion-source">Source</Label>
                <Select value={suggestionFormData.source} onValueChange={(value) => setSuggestionFormData({ ...suggestionFormData, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visit">Visite / prestations</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="antiparasitic">Antiparasitaire</SelectItem>
                    <SelectItem value="prescription">Ordonnance / Rx</SelectItem>
                    <SelectItem value="stock_sale">Vente stock</SelectItem>
                    <SelectItem value="stock_purchase">Achat stock</SelectItem>
                    <SelectItem value="cogs">Coût de revient</SelectItem>
                    <SelectItem value="salary">Salaire</SelectItem>
                    <SelectItem value="rent">Loyer</SelectItem>
                    <SelectItem value="tax">Impôts</SelectItem>
                    <SelectItem value="insurance">Assurance</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddSuggestion}>
                {editingSuggestion ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounting;
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
import { Switch } from '@/components/ui/switch';
import { useAccounting } from '@/hooks/useAccounting';
import { useSettings } from '@/contexts/SettingsContext';
import { useAccountingTemplates, type AccountingTemplate } from '@/hooks/useAccountingTemplates';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatSourceLabel } from '@/lib/accountingLedger';
import { markInvoicePaid } from '@/lib/visitInvoice';
import {
  buildDateFromDay,
  materializeRecurringTemplates,
  resolveTemplateValidityWindow,
} from '@/lib/accountingRecurring';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { todayLocalKey } from '@/lib/dateLocal';
import { useAppLocale } from '@/i18n/useAppLocale';
import { PrintAccountingReportModal } from '@/components/modals/PrintAccountingReportModal';
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
  RefreshCw,
  Download,
} from 'lucide-react';
import { AppPageHeader } from '@/components/AppPageHeader';
import { useTranslation } from 'react-i18next';
import { useWriteAccess } from '@/components/RoleGuard';

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
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");
  const { dateFns } = useAppLocale();
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
  const { user } = useAuth();
  const { canWrite, guardWrite } = useWriteAccess("can_manage_accounting");
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  // Convert database entries to UI format
  const accountingEntries: AccountingEntry[] = useMemo(() => {
    const revenueEntries = revenues.map(rev => {
      const isAuto = !!(rev.reference_id || ['visit', 'prescription', 'stock_sale', 'consultation', 'vaccination', 'antiparasitic'].includes(rev.source));
      return {
        id: rev.id,
        type: 'revenue' as const,
        category: (isAuto ? 'automatic' : 'manual') as 'automatic' | 'manual',
        frequency: (rev.frequency as AccountingEntry['frequency']) || 'occasional',
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
        exp.receipt_number?.startsWith('REC-TPL-') ||
        ['stock_purchase', 'stock_valuation', 'cogs'].includes(exp.category)
      );
      return {
        id: exp.id,
        type: (isValuation ? 'valuation' : 'expense') as 'expense' | 'valuation',
        category: (isAuto ? 'automatic' : 'manual') as 'automatic' | 'manual',
        frequency: (exp.frequency as AccountingEntry['frequency']) || 'occasional',
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
  const { grouped: templateGroups, templates, addTemplate, updateTemplate, deleteTemplate } = useAccountingTemplates();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<AccountingTemplate | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Formulaire pour la configuration des suggestions
  const [suggestionFormData, setSuggestionFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'revenue' | 'expense',
    frequency: 'monthly' as 'monthly' | 'annual' | 'occasional',
    source: 'other' as any,
    day: '' as string,
    recurrenceMonth: '1' as string,
    startDate: todayLocalKey(),
    endDate: '' as string,
    enabled: false,
  });

  const emptySuggestionForm = (frequency: 'monthly' | 'annual' | 'occasional' = 'monthly') => ({
    description: '',
    amount: '',
    type: 'expense' as 'revenue' | 'expense',
    frequency,
    source: 'other' as any,
    day: '',
    recurrenceMonth: '1',
    startDate: todayLocalKey(),
    endDate: '',
    enabled: false,
  });

  // Formulaire pour ajouter/modifier une entrée
  const [formData, setFormData] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    frequency: 'occasional' as 'monthly' | 'annual' | 'occasional',
    description: '',
    amount: '',
    date: '',
    day: '',
    recurrenceMonth: String(new Date().getMonth() + 1),
    source: 'other' as any,
    notes: ''
  });

  const isRecurringFreq = (f: string) => f === 'monthly' || f === 'annual';

  // Initialiser les dates
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
  }, []);

  // Matérialiser les modèles récurrents actifs sur la période affichée
  useEffect(() => {
    if (!user?.id || !startDate || !endDate || !templates?.length) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
        const organizationId =
          user.organization_id ||
          user.profile?.organization_id ||
          profile?.organization_id;
        if (!organizationId || cancelled) return;

        const created = await materializeRecurringTemplates({
          templates,
          startDate,
          endDate,
          userId: user.id,
          organizationId,
        });
        if (!cancelled && created > 0) {
          refreshAll();
        }
      } catch (err) {
        console.warn('materializeRecurringTemplates failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, startDate, endDate, templates]);

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
    if (!guardWrite()) return;
    try {
      setMarkingPaidId(invoiceId);
      await markInvoicePaid(invoiceId, 'cash');
      await fetchInvoices();
      refreshAll();
      toast({ title: t('accounting.invoiceMarkedPaid') });
    } catch (e: any) {
      toast({ title: tc('error'), description: e?.message || t('accounting.paymentImpossible'), variant: 'destructive' });
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
      case 'week': {
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        setStartDate(format(startOfWeek, 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek, 'yyyy-MM-dd'));
        break;
      }
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
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
    if (!guardWrite()) return;
    if (!formData.description || !formData.amount) return;

    const recurring = isRecurringFreq(formData.frequency);
    if (!recurring && !formData.date) {
      toast({
        title: t('accounting.dateRequired'),
        description: t('accounting.dateRequiredBody'),
        variant: 'destructive',
      });
      return;
    }

    const dayNum = formData.day ? parseInt(formData.day, 10) : undefined;
    const monthNum = formData.recurrenceMonth
      ? parseInt(formData.recurrenceMonth, 10)
      : undefined;
    const entryDate = recurring
      ? buildDateFromDay(dayNum, formData.frequency, monthNum)
      : formData.date;

    if (editingEntry) {
      if (editingEntry.type === 'revenue') {
        await updateRevenue(editingEntry.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          revenue_date: entryDate,
          source: formData.source,
          notes: formData.notes,
          frequency: formData.frequency,
        });
      } else {
        await updateExpense(editingEntry.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          expense_date: entryDate,
          category: formData.source,
          notes: formData.notes,
          frequency: formData.frequency,
        });
      }
      setEditingEntry(null);
    } else if (recurring) {
      // Config récurrente : modèle auto + génération sur la période (pas de double écriture)
      const dayOfMonth = dayNum && dayNum >= 1 && dayNum <= 31 ? dayNum : 1;
      const recurrenceMonth =
        formData.frequency === 'annual'
          ? monthNum && monthNum >= 1 && monthNum <= 12
            ? monthNum
            : new Date().getMonth() + 1
          : null;

      const existingTpl = templates.find(
        (t) =>
          t.description === formData.description &&
          t.frequency === formData.frequency &&
          t.type === formData.type
      );
      if (existingTpl) {
        await updateTemplate(existingTpl.id, {
          amount: parseFloat(formData.amount),
          source: formData.source,
          day_of_month: dayOfMonth,
          recurrence_month: recurrenceMonth,
          auto_generate: true,
          is_active: true,
          start_date: existingTpl.start_date || entryDate,
          end_date: existingTpl.end_date || null,
        });
      } else {
        await addTemplate({
          type: formData.type,
          frequency: formData.frequency,
          description: formData.description,
          amount: parseFloat(formData.amount),
          source: formData.source,
          day_of_month: dayOfMonth,
          recurrence_month: recurrenceMonth,
          auto_generate: true,
          start_date: entryDate,
          end_date: null,
        });
      }

      // Forcer refresh templates puis matérialisation via effect / appel direct
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .maybeSingle();
        const organizationId =
          user?.organization_id ||
          user?.profile?.organization_id ||
          profile?.organization_id;
        if (user?.id && organizationId) {
          const { data: freshTemplates } = await supabase
            .from('accounting_templates')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);
          await materializeRecurringTemplates({
            templates: freshTemplates || [],
            startDate: startDate || entryDate.slice(0, 7) + '-01',
            endDate:
              endDate ||
              format(
                new Date(
                  new Date(entryDate).getFullYear(),
                  new Date(entryDate).getMonth() + 1,
                  0
                ),
                'yyyy-MM-dd'
              ),
            userId: user.id,
            organizationId,
          });
          refreshAll();
        }
      } catch (err) {
        console.warn('Could not materialize after recurring save', err);
      }
    } else if (formData.type === 'revenue') {
      await addRevenue({
        revenue_date: entryDate,
        source: formData.source,
        description: formData.description,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
        frequency: formData.frequency,
      });
    } else {
      await addExpense({
        expense_date: entryDate,
        category: formData.source,
        description: formData.description,
        amount: parseFloat(formData.amount),
        status: 'approved',
        is_deductible: true,
        notes: formData.notes,
        frequency: formData.frequency,
      });
    }

    setFormData({
      type: 'revenue',
      frequency: 'occasional',
      description: '',
      amount: '',
      date: '',
      day: '',
      recurrenceMonth: String(new Date().getMonth() + 1),
      source: 'other',
      notes: '',
    });
    setIsAddEntryModalOpen(false);
  };

  const handleEditEntry = (entry: AccountingEntry) => {
    if (!guardWrite()) return;
    setEditingEntry(entry);
    const d = entry.date ? new Date(`${entry.date}T00:00:00`) : new Date();
    // En édition journal : toujours une date concrète (pas seulement le jour)
    setFormData({
      type: entry.type === 'valuation' ? 'expense' : entry.type,
      frequency: 'occasional',
      description: entry.description,
      amount: entry.amount.toString(),
      date: entry.date?.slice(0, 10) || format(d, 'yyyy-MM-dd'),
      day: String(d.getDate()),
      recurrenceMonth: String(d.getMonth() + 1),
      source: entry.source || 'other',
      notes: entry.notes?.startsWith('__recurring__:') ? '' : (entry.notes || ''),
    });
    setIsAddEntryModalOpen(true);
  };

  const handleDeleteEntry = async (entry: AccountingEntry) => {
    if (!guardWrite()) return;
    const isAuto = entry.category === 'automatic';
    const msg = isAuto
      ? `Supprimer « ${entry.description} » ?\n\nÉcriture automatique : elle pourra réapparaître si la source (visite, stock, config récurrente) la régénère.`
      : `Supprimer « ${entry.description} » du journal ?`;
    if (!window.confirm(msg)) return;

    if (entry.type === 'revenue') {
      await deleteRevenue(entry.id);
    } else {
      // charge + valorisation stock
      await deleteExpense(entry.id);
    }
  };

  const handleApplySuggestion = (suggestion: AccountingTemplate) => {
    if (!guardWrite()) return;
    setFormData({
      ...formData,
      type: suggestion.type,
      frequency: suggestion.frequency || 'occasional',
      description: suggestion.description,
      amount: suggestion.amount.toString(),
      source: suggestion.source,
      date: formData.date || format(new Date(), 'yyyy-MM-dd'),
      day: suggestion.day_of_month ? String(suggestion.day_of_month) : formData.day,
      recurrenceMonth: suggestion.recurrence_month
        ? String(suggestion.recurrence_month)
        : formData.recurrenceMonth,
    });
    setShowSuggestions(false);
  };

  const handleAddSuggestion = async () => {
    if (!guardWrite()) return;
    if (!suggestionFormData.description || !suggestionFormData.amount) return;

    const dayNum = suggestionFormData.day
      ? parseInt(suggestionFormData.day, 10)
      : 1;
    const monthNum = suggestionFormData.recurrenceMonth
      ? parseInt(suggestionFormData.recurrenceMonth, 10)
      : 1;
    const recurring = isRecurringFreq(suggestionFormData.frequency);
    const enabled = !!suggestionFormData.enabled;

    if (enabled && recurring && !suggestionFormData.startDate) {
      toast({
        title: t('accounting.startDateRequired'),
        description: t('accounting.startDateRequiredBody'),
        variant: 'destructive',
      });
      return;
    }

    if (
      suggestionFormData.startDate &&
      suggestionFormData.endDate &&
      suggestionFormData.endDate < suggestionFormData.startDate
    ) {
      toast({
        title: t('accounting.invalidDates'),
        description: t('accounting.invalidDatesBody'),
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      description: suggestionFormData.description,
      amount: parseFloat(suggestionFormData.amount),
      type: suggestionFormData.type,
      frequency: suggestionFormData.frequency,
      source: suggestionFormData.source,
      day_of_month: recurring ? (dayNum >= 1 && dayNum <= 31 ? dayNum : 1) : null,
      recurrence_month:
        suggestionFormData.frequency === 'annual'
          ? monthNum >= 1 && monthNum <= 12
            ? monthNum
            : 1
          : null,
      auto_generate: enabled,
      start_date: suggestionFormData.startDate || null,
      end_date: suggestionFormData.endDate || null,
    };

    if (editingSuggestion) {
      await updateTemplate(editingSuggestion.id, payload);
      setEditingSuggestion(null);
    } else {
      await addTemplate(payload);
    }

    setSuggestionFormData(emptySuggestionForm('monthly'));
    setIsConfigModalOpen(false);
  };

  const handleEditSuggestion = (suggestion: AccountingTemplate) => {
    if (!guardWrite()) return;
    setEditingSuggestion(suggestion);
    setSuggestionFormData({
      description: suggestion.description,
      amount: suggestion.amount.toString(),
      type: suggestion.type,
      frequency: suggestion.frequency,
      source: suggestion.source,
      day: suggestion.day_of_month ? String(suggestion.day_of_month) : '',
      recurrenceMonth: suggestion.recurrence_month
        ? String(suggestion.recurrence_month)
        : '1',
      startDate: suggestion.start_date
        ? suggestion.start_date.slice(0, 10)
        : todayLocalKey(),
      endDate: suggestion.end_date ? suggestion.end_date.slice(0, 10) : '',
      enabled: !!suggestion.auto_generate,
    });
    setIsConfigModalOpen(true);
  };

  const handleToggleSuggestion = async (
    suggestion: AccountingTemplate,
    enabled: boolean
  ) => {
    if (!guardWrite()) return;
    const start =
      suggestion.start_date?.slice(0, 10) || todayLocalKey();
    await updateTemplate(
      suggestion.id,
      {
        auto_generate: enabled,
        start_date: enabled ? start : suggestion.start_date || start,
        end_date: suggestion.end_date || null,
      },
      { silent: true }
    );
    toast({
      title: enabled ? t('accounting.suggestionEnabled') : t('accounting.suggestionDisabled'),
      description: enabled
        ? t('accounting.suggestionEnabledBody')
        : t('accounting.suggestionDisabledBody'),
    });
  };

  const handleDeleteSuggestion = async (suggestion: AccountingTemplate) => {
    if (!guardWrite()) return;
    if (window.confirm(t('accounting.deleteSuggestionConfirm'))) {
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
          title={t("accounting.title")}
          description={t("accounting.description")}
        />
        <div className="flex flex-wrap gap-2 lg:pt-4">
          <Button variant="outline" className="rounded-full" onClick={() => refreshAll()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {tc("refresh")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setIsExportModalOpen(true)}
            disabled={!startDate || !endDate}
          >
            <Download className="h-4 w-4 mr-2" />
            {tc("export")} PDF
          </Button>
          {canWrite && (
          <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full"
                onClick={() => { setEditingEntry(null); setFormData({ type: 'revenue', frequency: 'occasional', description: '', amount: '', date: '', day: '', recurrenceMonth: String(new Date().getMonth() + 1), source: 'other', notes: '' }); }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("accounting.newEntry")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? tc("edit") : t("accounting.newEntry")}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry
                    ? 'Modifiez les informations de cette entrée.'
                    : 'Occasionnel = une fois. Mensuel / annuel = configuration reprise automatiquement sur les périodes suivantes (jour optionnel).'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Suggestions prédéfinies */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <Label className="text-sm font-medium">{t("accounting.suggestions.title")}</Label>
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
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("accounting.frequencies.monthly")}</h4>
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
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("accounting.frequencies.yearly")}</h4>
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
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{t("accounting.suggestions.title")}</h4>
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
                    <Label htmlFor="type">{t("accounting.form.type")}</Label>
                    <Select value={formData.type} onValueChange={(value: 'revenue' | 'expense') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">{t("accounting.revenue")}</SelectItem>
                        <SelectItem value="expense">{t("accounting.expenses")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency">{t("accounting.suggestions.frequency")}</Label>
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
                    <Label htmlFor="description">{t("accounting.form.description")}</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("accounting.form.descriptionPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">{t("accounting.form.amount")} ({settings.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  {isRecurringFreq(formData.frequency) ? (
                    <div>
                      <Label htmlFor="day">{tc("day")} ({tc("optional")})</Label>
                      <Input
                        id="day"
                        type="number"
                        min={1}
                        max={31}
                        value={formData.day}
                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                        placeholder="Ex: 5"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Vide = 1er du mois. L’écriture est reprise chaque période.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="date">{t("accounting.form.date")}</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {formData.frequency === 'annual' && (
                  <div>
                    <Label htmlFor="recurrenceMonth">{tc("month")}</Label>
                    <Select
                      value={formData.recurrenceMonth}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recurrenceMonth: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
                        ].map((label, i) => (
                          <SelectItem key={label} value={String(i + 1)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="source">{t("accounting.form.source")}</Label>
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
                      <SelectItem value="cogs">{t("accounting.form.categoryCogs")}</SelectItem>
                      <SelectItem value="salary">Salaire</SelectItem>
                      <SelectItem value="rent">Loyer</SelectItem>
                      <SelectItem value="tax">{t("accounting.form.categoryTax")}</SelectItem>
                      <SelectItem value="insurance">Assurance</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">{t("accounting.form.notes")} ({tc("optional")})</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t("accounting.form.notesPlaceholder")}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>
                    {tc("cancel")}
                  </Button>
                  <Button onClick={handleAddEntry}>
                    {editingEntry ? tc("edit") : tc("add")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("accounting.periods.custom")}
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
                {t("accounting.periods.today")}
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('week')}
                size="sm"
              >
                {t("accounting.periods.week")}
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('month')}
                size="sm"
              >
                {t("accounting.periods.month")}
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('year')}
                size="sm"
              >
                {t("accounting.periods.year")}
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Label htmlFor="startDate">{tc("from")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Label htmlFor="endDate">{tc("to")}</Label>
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
              <CardTitle className="text-sm font-medium">{t("accounting.totalRevenue")}</CardTitle>
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
              <CardTitle className="text-sm font-medium">{t("accounting.totalExpenses")}</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                <div>{t("accounting.kpi.cogs")}: {formatCurrency(summary.expenseBreakdown.cogs)}</div>
                <div className="text-blue-600">Valorisation stock (hors CA): {formatCurrency(summary.stockValuation)}</div>
                <div>Salaires: {formatCurrency(summary.expenseBreakdown.salaries)}</div>
                <div>{t("accounting.kpi.rentTaxOther")}: {formatCurrency(
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
              <CardTitle className="text-sm font-medium">{t("accounting.netResult")}</CardTitle>
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
                <div>{t("accounting.kpi.paid")}: {formatCurrency(invoiceStats.paidAmount)}</div>
                <div>Encaissements (cash): {formatCurrency(invoiceStats.cashIn)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="entries">{t("accounting.journal.title")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("accounting.invoices")} ({invoices.length})</TabsTrigger>
          <TabsTrigger value="configuration">{t("accounting.suggestions.title")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("accounting.journal.title")}
              </CardTitle>
              <CardDescription>
                Écritures automatiques et manuelles — vous pouvez modifier ou supprimer chaque ligne
              </CardDescription>
            </CardHeader>
            <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("accounting.journal.date")}</TableHead>
                <TableHead>{t("accounting.form.type")}</TableHead>
                <TableHead>{t("accounting.journal.description")}</TableHead>
                <TableHead>{t("accounting.journal.source")}</TableHead>
                <TableHead>{t("accounting.form.category")}</TableHead>
                <TableHead>{t("accounting.form.amount")}</TableHead>
                <TableHead>{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const typeLabel =
                  entry.type === 'revenue'
                    ? t("accounting.revenue")
                    : entry.type === 'valuation'
                      ? t("accounting.form.category")
                      : t("accounting.expenses");
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
                  <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: dateFns })}</TableCell>
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
                      {entry.category === 'automatic' ? tc("enabled") : t("accounting.sources.manual")}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${amountClass}`}>
                    {amountPrefix}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canWrite && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            title={tc("edit")}
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title={tc("delete")}
                            onClick={() => handleDeleteEntry(entry)}
                          >
                            <Trash2 className="h-4 w-4" />
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
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("accounting.emptyJournal")}
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
                {t("accounting.invoices")}
              </CardTitle>
              <CardDescription>
                Factures générées depuis les visites / prestations — statut et encaissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>{t("accounting.emptyInvoices")}</p>
                  <p className="text-sm">Facturez une visite depuis l&apos;espace Visites pour alimenter ce tableau.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("accounting.invoice.number")}</TableHead>
                      <TableHead>{t("accounting.invoice.date")}</TableHead>
                      <TableHead>{t("accounting.invoice.client")}</TableHead>
                      <TableHead>{t("accounting.invoice.status")}</TableHead>
                      <TableHead>{t("accounting.invoice.total")}</TableHead>
                      <TableHead>{tc("paid")}</TableHead>
                      <TableHead>{tc("actions")}</TableHead>
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
                              ? format(new Date(inv.invoice_date), 'dd/MM/yyyy', { locale: dateFns })
                              : '—'}
                          </TableCell>
                          <TableCell>{clientName || '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={status === 'paid' ? 'default' : status === 'cancelled' ? 'destructive' : 'outline'}
                              className="gap-1"
                            >
                              {status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                              {status === 'paid' ? tc("paid") : status === 'issued' ? tc("issued") : status === 'draft' ? tc("draft") : status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(Number(inv.total_amount) || 0)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inv.payment_date
                              ? `${format(new Date(inv.payment_date), 'dd/MM/yyyy', { locale: dateFns })}${inv.payment_method ? ` · ${inv.payment_method}` : ''}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {canWrite && (status === 'issued' || status === 'draft') && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={markingPaidId === inv.id}
                                onClick={() => handleMarkInvoicePaid(inv.id)}
                              >
                                {tc("paid")}
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
                {t("accounting.suggestions.title")}
              </CardTitle>
              <CardDescription>
                Activez une suggestion pour la générer automatiquement dans le journal.
                Date de fin optionnelle (sinon 12 mois / une fois par an).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Activez une suggestion pour l’inclure automatiquement dans le journal.
                {t("accounting.suggestions.noEndDateHint", { months: 12 })}
              </p>

              {(['monthly', 'annual', 'occasional'] as const).map((freq) => {
                const titles = {
                  monthly: 'Suggestions Mensuelles',
                  annual: 'Suggestions Annuelles',
                  occasional: 'Suggestions Occasionnelles',
                };
                const list = templateGroups[freq];
                return (
                  <div key={freq} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{titles[freq]}</h3>
                      {canWrite && (
                        <Button
                          onClick={() => {
                            setEditingSuggestion(null);
                            setSuggestionFormData(emptySuggestionForm(freq));
                            setIsConfigModalOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3">
                      {list.length === 0 && (
                        <p className="text-sm text-muted-foreground">{t("accounting.suggestions.empty")}</p>
                      )}
                      {list.map((suggestion) => {
                        const enabled = !!suggestion.auto_generate;
                        const window =
                          isRecurringFreq(suggestion.frequency) && enabled
                            ? resolveTemplateValidityWindow(suggestion)
                            : null;
                        return (
                          <div
                            key={suggestion.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">
                                  {suggestion.description}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                                <Badge variant={enabled ? 'default' : 'secondary'}>
                                  {enabled ? tc("active") : tc("inactive")}
                                </Badge>
                              </div>
                              {isRecurringFreq(suggestion.frequency) && (
                                <p className="text-xs text-muted-foreground">
                                  Jour {suggestion.day_of_month || 1}
                                  {suggestion.frequency === 'annual' &&
                                    suggestion.recurrence_month
                                    ? ` · mois ${suggestion.recurrence_month}`
                                    : ''}
                                  {window
                                    ? ` · du ${window.start} au ${window.end}`
                                    : suggestion.start_date
                                      ? ` · début ${suggestion.start_date.slice(0, 10)}`
                                      : ''}
                                  {!suggestion.end_date && enabled
                                    ? suggestion.frequency === 'monthly'
                                      ? ' (12 mois par défaut)'
                                      : ' (1 an / une fois par défaut)'
                                    : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {canWrite && isRecurringFreq(suggestion.frequency) && (
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={enabled}
                                    onCheckedChange={(v) =>
                                      handleToggleSuggestion(suggestion, v)
                                    }
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    Compta
                                  </span>
                                </div>
                              )}
                              {canWrite && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditSuggestion(suggestion)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSuggestion(suggestion)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal pour configurer les suggestions */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSuggestion ? t("accounting.suggestions.edit") : t("accounting.suggestions.add")}
            </DialogTitle>
            <DialogDescription>
              {editingSuggestion ? t("accounting.suggestions.editDesc") : t("accounting.suggestions.addDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestion-type">{t("accounting.form.type")}</Label>
                <Select value={suggestionFormData.type} onValueChange={(value: 'revenue' | 'expense') => setSuggestionFormData({ ...suggestionFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">{t("accounting.form.revenueOption")}</SelectItem>
                    <SelectItem value="expense">{t("accounting.form.expenseOption")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="suggestion-frequency">{t("accounting.suggestions.frequency")}</Label>
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
              <Label htmlFor="suggestion-description">{t("accounting.form.description")}</Label>
              <Input
                id="suggestion-description"
                value={suggestionFormData.description}
                onChange={(e) => setSuggestionFormData({ ...suggestionFormData, description: e.target.value })}
                placeholder={t("accounting.form.descriptionPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestion-amount">{t("accounting.form.amount")} ({settings.currency})</Label>
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
                <Label htmlFor="suggestion-source">{t("accounting.form.source")}</Label>
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
                    <SelectItem value="cogs">{t("accounting.form.categoryCogs")}</SelectItem>
                    <SelectItem value="salary">Salaire</SelectItem>
                    <SelectItem value="rent">Loyer</SelectItem>
                    <SelectItem value="tax">{t("accounting.form.categoryTax")}</SelectItem>
                    <SelectItem value="insurance">Assurance</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isRecurringFreq(suggestionFormData.frequency) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="suggestion-day">{tc("day")} ({tc("optional")})</Label>
                  <Input
                    id="suggestion-day"
                    type="number"
                    min={1}
                    max={31}
                    value={suggestionFormData.day}
                    onChange={(e) =>
                      setSuggestionFormData({ ...suggestionFormData, day: e.target.value })
                    }
                    placeholder="Ex: 5"
                  />
                </div>
                {suggestionFormData.frequency === 'annual' && (
                  <div>
                    <Label htmlFor="suggestion-month">{tc("month")}</Label>
                    <Select
                      value={suggestionFormData.recurrenceMonth}
                      onValueChange={(value) =>
                        setSuggestionFormData({
                          ...suggestionFormData,
                          recurrenceMonth: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Janvier','Février','Mars','Avril','Mai','Juin',
                          'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
                        ].map((label, i) => (
                          <SelectItem key={label} value={String(i + 1)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {isRecurringFreq(suggestionFormData.frequency) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="suggestion-start">{tc("from")}</Label>
                  <Input
                    id="suggestion-start"
                    type="date"
                    value={suggestionFormData.startDate}
                    onChange={(e) =>
                      setSuggestionFormData({
                        ...suggestionFormData,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="suggestion-end">{tc("to")} ({tc("optional")})</Label>
                  <Input
                    id="suggestion-end"
                    type="date"
                    value={suggestionFormData.endDate}
                    onChange={(e) =>
                      setSuggestionFormData({
                        ...suggestionFormData,
                        endDate: e.target.value,
                      })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Vide = {suggestionFormData.frequency === 'monthly'
                      ? '12 mois'
                      : 'une fois sur l’année'} à partir du début
                  </p>
                </div>
              </div>
            )}

            {isRecurringFreq(suggestionFormData.frequency) && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="suggestion-enabled">{t("accounting.suggestions.enabled")}</Label>
                  <p className="text-xs text-muted-foreground">
                    Une fois activée, l’écriture est générée selon la fréquence.
                  </p>
                </div>
                <Switch
                  id="suggestion-enabled"
                  checked={suggestionFormData.enabled}
                  onCheckedChange={(v) =>
                    setSuggestionFormData({ ...suggestionFormData, enabled: v })
                  }
                />
              </div>
            )}

            {isRecurringFreq(suggestionFormData.frequency) && (
              <p className="text-xs text-muted-foreground">
                {t("accounting.suggestions.activeHint")}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                {tc("cancel")}
              </Button>
              <Button onClick={handleAddSuggestion}>
                {editingSuggestion ? tc("edit") : tc("add")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PrintAccountingReportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        entries={filteredEntries}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
};

export default Accounting;
// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export type TemplateType = 'revenue' | 'expense';
export type TemplateFrequency = 'monthly' | 'annual' | 'occasional';

export interface AccountingTemplate {
  id: string;
  user_id: string;
  type: TemplateType;
  frequency: TemplateFrequency;
  description: string;
  amount: number;
  source: string;
  is_active: boolean;
  /** Jour du mois (1-31) pour mensuel / annuel — optionnel */
  day_of_month?: number | null;
  /** Mois (1-12) pour fréquence annuelle */
  recurrence_month?: number | null;
  /** Activé = généré dans le journal / CA */
  auto_generate?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertTemplateInput {
  id?: string;
  type: TemplateType;
  frequency: TemplateFrequency;
  description: string;
  amount: number;
  source: string;
  is_active?: boolean;
  day_of_month?: number | null;
  recurrence_month?: number | null;
  auto_generate?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

const DEFAULT_TEMPLATES: Omit<AccountingTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { type: 'expense', frequency: 'monthly', description: 'Salaire Secrétaire', amount: 3000, source: 'salary', is_active: true, day_of_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'monthly', description: 'CNSS Secrétaire', amount: 700, source: 'insurance', is_active: true, day_of_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'monthly', description: 'CNSS Vétérinaire', amount: 1500, source: 'insurance', is_active: true, day_of_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'monthly', description: 'Loyer', amount: 3000, source: 'rent', is_active: true, day_of_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'monthly', description: 'Eau et Électricité', amount: 300, source: 'other', is_active: true, day_of_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'annual', description: 'Impôts', amount: 3000, source: 'tax', is_active: true, day_of_month: 1, recurrence_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'annual', description: "Cotisation Ordre des Vétérinaires", amount: 1200, source: 'other', is_active: true, day_of_month: 1, recurrence_month: 1, auto_generate: false },
  { type: 'expense', frequency: 'occasional', description: 'Maintenance Équipement', amount: 500, source: 'other', is_active: true, auto_generate: false },
  { type: 'expense', frequency: 'occasional', description: 'Formation Professionnelle', amount: 800, source: 'other', is_active: true, auto_generate: false },
  { type: 'expense', frequency: 'occasional', description: 'Achat Matériel', amount: 1200, source: 'other', is_active: true, auto_generate: false },
];

export const useAccountingTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('app');
  const { t: tc } = useTranslation('common');
  const [templates, setTemplates] = useState<AccountingTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Tous les modèles (actifs ou non) pour pouvoir activer/désactiver
      const { data, error } = await supabase
        .from('accounting_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('frequency', { ascending: true })
        .order('description', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (e: any) {
      setError(e.message);
      console.error('fetchTemplates error', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const seedIfEmpty = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error: countErr } = await supabase
        .from('accounting_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (countErr) throw countErr;
      if ((count || 0) > 0) {
        await fetchTemplates();
        return;
      }

      const rows = DEFAULT_TEMPLATES.map((t) => ({ ...t, user_id: user.id }));
      const { error: insertErr } = await supabase
        .from('accounting_templates')
        .insert(rows);
      if (insertErr) throw insertErr;
      await fetchTemplates();
    } catch (e: any) {
      console.error('seedIfEmpty error', e);
    }
  }, [user, fetchTemplates]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      await seedIfEmpty();
      await fetchTemplates();
    })();
  }, [user, seedIfEmpty, fetchTemplates]);

  const addTemplate = async (input: UpsertTemplateInput) => {
    if (!user) return null;
    try {
      const payload = {
        type: input.type,
        frequency: input.frequency,
        description: input.description,
        amount: input.amount,
        source: input.source,
        is_active: input.is_active ?? true,
        day_of_month: input.day_of_month ?? null,
        recurrence_month: input.recurrence_month ?? null,
        auto_generate: input.auto_generate ?? false,
        start_date: input.start_date || null,
        end_date: input.end_date || null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('accounting_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('description', input.description)
        .eq('frequency', input.frequency)
        .eq('type', input.type)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('accounting_templates')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        await fetchTemplates();
        toast({ title: tc('success'), description: t('accounting.templates.configUpdated') });
        return data as AccountingTemplate;
      }

      const { data, error } = await supabase
        .from('accounting_templates')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      await fetchTemplates();
      toast({ title: tc('success'), description: t('accounting.templates.configSaved') });
      return data as AccountingTemplate;
    } catch (e: any) {
      console.error('addTemplate error', e);
      const msg =
        e?.code === '23505'
          ? t('accounting.templates.configExists')
          : e?.message || t('accounting.templates.cannotSaveConfig');
      toast({ title: tc('error'), description: msg, variant: 'destructive' });
      return null;
    }
  };

  const updateTemplate = async (id: string, input: Partial<UpsertTemplateInput>, opts?: { silent?: boolean }) => {
    try {
      const { error } = await supabase
        .from('accounting_templates')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchTemplates();
      if (!opts?.silent) {
        toast({ title: tc('success'), description: t('accounting.templates.suggestionUpdated') });
      }
    } catch (e: any) {
      toast({ title: tc('error'), description: t('accounting.templates.cannotUpdateSuggestion'), variant: 'destructive' });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounting_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchTemplates();
      toast({ title: tc('success'), description: t('accounting.templates.suggestionDeleted') });
    } catch (e: any) {
      toast({ title: tc('error'), description: t('accounting.templates.cannotDeleteSuggestion'), variant: 'destructive' });
    }
  };

  const grouped = useMemo(() => {
    const result: Record<TemplateFrequency, AccountingTemplate[]> = {
      monthly: [],
      annual: [],
      occasional: [],
    };
    for (const t of templates) {
      result[t.frequency].push(t);
    }
    return result;
  }, [templates]);

  return {
    templates,
    grouped,
    loading,
    error,
    fetchTemplates,
    seedIfEmpty,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

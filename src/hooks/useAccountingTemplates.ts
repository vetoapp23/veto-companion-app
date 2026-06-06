// @ts-nocheck
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
}

// Default seed values copied from current UI suggestions
const DEFAULT_TEMPLATES: Omit<AccountingTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  // monthly
  { type: 'expense', frequency: 'monthly', description: 'Salaire Secrétaire', amount: 3000, source: 'salary', is_active: true },
  { type: 'expense', frequency: 'monthly', description: 'CNSS Secrétaire', amount: 700, source: 'insurance', is_active: true },
  { type: 'expense', frequency: 'monthly', description: 'CNSS Vétérinaire', amount: 1500, source: 'insurance', is_active: true },
  { type: 'expense', frequency: 'monthly', description: 'Loyer', amount: 3000, source: 'rent', is_active: true },
  { type: 'expense', frequency: 'monthly', description: 'Eau et Électricité', amount: 300, source: 'other', is_active: true },
  // annual
  { type: 'expense', frequency: 'annual', description: 'Impôts', amount: 3000, source: 'tax', is_active: true },
  { type: 'expense', frequency: 'annual', description: "Cotisation Ordre des Vétérinaires", amount: 1200, source: 'other', is_active: true },
  // occasional
  { type: 'expense', frequency: 'occasional', description: 'Maintenance Équipement', amount: 500, source: 'other', is_active: true },
  { type: 'expense', frequency: 'occasional', description: 'Formation Professionnelle', amount: 800, source: 'other', is_active: true },
  { type: 'expense', frequency: 'occasional', description: 'Achat Matériel', amount: 1200, source: 'other', is_active: true },
];

export const useAccountingTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AccountingTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounting_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
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
        // Still perform a safety upsert in case of partial seed
        const rows = DEFAULT_TEMPLATES.map(t => ({ ...t, user_id: user.id }));
        await supabase
          .from('accounting_templates')
          .upsert(rows, { onConflict: 'user_id,description,frequency,type', ignoreDuplicates: true });
        await fetchTemplates();
        return; // already had templates
      }

      const rows = DEFAULT_TEMPLATES.map(t => ({ ...t, user_id: user.id }));
      const { error: insertErr } = await supabase
        .from('accounting_templates')
        .upsert(rows, { onConflict: 'user_id,description,frequency,type', ignoreDuplicates: true });
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
      const payload = { ...input, is_active: input.is_active ?? true, user_id: user.id } as any;
      const { data, error } = await supabase
        .from('accounting_templates')
        .upsert([payload], { onConflict: 'user_id,description,frequency,type', ignoreDuplicates: true })
        .select()
        .single();
      if (error) throw error;
      await fetchTemplates();
      toast({ title: 'Succès', description: 'Suggestion ajoutée' });
      return data as AccountingTemplate;
    } catch (e: any) {
      const msg = e?.code === '23505' ? 'Cette suggestion existe déjà' : 'Impossible d\'ajouter la suggestion';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
      return null;
    }
  };

  const updateTemplate = async (id: string, input: Partial<UpsertTemplateInput>) => {
    try {
      const { error } = await supabase
        .from('accounting_templates')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchTemplates();
      toast({ title: 'Succès', description: 'Suggestion modifiée' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: 'Impossible de modifier la suggestion', variant: 'destructive' });
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
      toast({ title: 'Succès', description: 'Suggestion supprimée' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer la suggestion', variant: 'destructive' });
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
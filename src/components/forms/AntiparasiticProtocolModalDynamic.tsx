import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useCreateAntiparasiticProtocol, useUpdateAntiparasiticProtocol } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { useAnimalSpecies, useParasiteTypes } from '@/hooks/useAppSettings';
import { Shield, Loader2 } from 'lucide-react';
import type { AntiparasiticProtocol, BoosterScheduleEntry } from '@/lib/database';
import BoosterScheduleEditor from './BoosterScheduleEditor';
import { ComboboxFreeText } from '@/components/ui/combobox-freetext';
import { useTranslation } from 'react-i18next';

const DEFAULT_ROUTES_ANTIPARASITIC = ['spot_on', 'oral', 'injection', 'spray', 'collier', 'shampoing'];

interface AntiparasiticProtocolModalDynamicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProtocol?: AntiparasiticProtocol;
}

export default function AntiparasiticProtocolModalDynamic({ 
  open, 
  onOpenChange, 
  editingProtocol 
}: AntiparasiticProtocolModalDynamicProps) {
  const { t } = useTranslation("medical");
  const { t: tc } = useTranslation("common");
  const createProtocol = useCreateAntiparasiticProtocol();
  const updateProtocol = useUpdateAntiparasiticProtocol();
  const { toast } = useToast();

  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: parasiteTypes = [], isLoading: typesLoading } = useParasiteTypes();

  const [formData, setFormData] = useState({
    species: '',
    parasiteType: '',
    productName: '',
    activeIngredient: '',
    administrationRoute: '',
    dosageRecommendation: '',
    frequencyDays: '',
    ageRecommendation: '',
    weightRange: '',
    seasonRecommendation: '',
    notes: '',
    active: true,
  });
  const [boosterSchedule, setBoosterSchedule] = useState<BoosterScheduleEntry[]>([
    { label: t("forms.firstTreatmentLabel"), offset_days: 0 },
  ]);

  useEffect(() => {
    if (editingProtocol) {
      setFormData({
        species: editingProtocol.species,
        parasiteType: editingProtocol.parasite_type,
        productName: editingProtocol.product_name,
        activeIngredient: editingProtocol.active_ingredient || '',
        administrationRoute: editingProtocol.administration_route || '',
        dosageRecommendation: editingProtocol.dosage_per_kg || '',
        frequencyDays: '',
        ageRecommendation: editingProtocol.age_restriction || '',
        weightRange: '',
        seasonRecommendation: '',
        notes: editingProtocol.notes || '',
        active: editingProtocol.active,
      });
      if (editingProtocol.booster_schedule && editingProtocol.booster_schedule.length > 0) {
        setBoosterSchedule(editingProtocol.booster_schedule);
      }
    }
  }, [editingProtocol]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      species: '',
      parasiteType: '',
      productName: '',
      activeIngredient: '',
      administrationRoute: '',
      dosageRecommendation: '',
      frequencyDays: '',
      ageRecommendation: '',
      weightRange: '',
      seasonRecommendation: '',
      notes: '',
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.species || !formData.parasiteType || !formData.productName) {
      toast({
        title: tc("error"),
        description: t("alerts.fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    try {
      const protocolData = {
        species: formData.species,
        parasite_type: formData.parasiteType,
        product_name: formData.productName,
        active_ingredient: formData.activeIngredient || undefined,
        administration_route: formData.administrationRoute || undefined,
        dosage_per_kg: formData.dosageRecommendation || undefined,
        frequency: formData.frequencyDays
          ? t("forms.frequencyDaysSuffix", { count: formData.frequencyDays })
          : undefined,
        age_restriction: formData.ageRecommendation || undefined,
        notes: [
          formData.notes,
          formData.weightRange ? t("forms.weightNote", { range: formData.weightRange }) : '',
          formData.seasonRecommendation
            ? t("forms.seasonNote", { season: formData.seasonRecommendation })
            : '',
        ].filter(Boolean).join(' | ') || undefined,
        active: formData.active,
        booster_schedule: boosterSchedule
          .filter(b => b.label.trim())
          .sort((a, b) => a.offset_days - b.offset_days),
      };

      if (editingProtocol) {
        await updateProtocol.mutateAsync({
          id: editingProtocol.id,
          updates: protocolData
        });
        toast({
          title: tc("success"),
          description: t("alerts.antiparasiticProtocolUpdated"),
        });
      } else {
        await createProtocol.mutateAsync(protocolData);
        toast({
          title: tc("success"),
          description: t("alerts.antiparasiticProtocolCreated"),
        });
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du protocole:', error);
      toast({
        title: tc("error"),
        description: error?.message || t("alerts.saveProtocolError"),
        variant: "destructive",
      });
    }
  };

  const isLoading = createProtocol.isPending || updateProtocol.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {editingProtocol ? t("forms.editProtocol") : t("forms.newAntiparasiticProtocol")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="species">{t("forms.speciesRequired")}</Label>
              <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("forms.selectSpecies")} />
                </SelectTrigger>
                <SelectContent>
                  {animalSpecies.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parasiteType">{t("forms.parasiteTypeRequired")}</Label>
              <ComboboxFreeText
                value={formData.parasiteType}
                onChange={(v) => handleInputChange('parasiteType', v)}
                options={parasiteTypes}
                category="parasite_type"
                placeholder={t("forms.selectOrCreate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">{t("forms.productNameRequired")}</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder={t("forms.productNameEx")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activeIngredient">{t("forms.activeIngredient")}</Label>
              <Input
                id="activeIngredient"
                value={formData.activeIngredient}
                onChange={(e) => handleInputChange('activeIngredient', e.target.value)}
                placeholder={t("forms.activeIngredientEx")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="administrationRoute">{t("forms.administrationRoute")}</Label>
              <ComboboxFreeText
                value={formData.administrationRoute}
                onChange={(v) => handleInputChange('administrationRoute', v)}
                options={DEFAULT_ROUTES_ANTIPARASITIC}
                category="administration_route"
                placeholder={t("forms.selectOrCreate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosageRecommendation">{t("forms.dosageRecommendation")}</Label>
              <Input
                id="dosageRecommendation"
                value={formData.dosageRecommendation}
                onChange={(e) => handleInputChange('dosageRecommendation', e.target.value)}
                placeholder={t("forms.dosageRecommendationEx")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencyDays">{t("forms.frequencyDays")}</Label>
              <Input
                id="frequencyDays"
                type="number"
                value={formData.frequencyDays}
                onChange={(e) => handleInputChange('frequencyDays', e.target.value)}
                placeholder={t("forms.frequencyDaysEx")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRecommendation">{t("forms.ageRecommendation")}</Label>
              <Input
                id="ageRecommendation"
                value={formData.ageRecommendation}
                onChange={(e) => handleInputChange('ageRecommendation', e.target.value)}
                placeholder={t("forms.ageRecommendationEx")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightRange">{t("forms.weightRange")}</Label>
              <Input
                id="weightRange"
                value={formData.weightRange}
                onChange={(e) => handleInputChange('weightRange', e.target.value)}
                placeholder={t("forms.weightRangeEx")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonRecommendation">{t("forms.seasonRecommendation")}</Label>
              <Select value={formData.seasonRecommendation} onValueChange={(value) => handleInputChange('seasonRecommendation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("forms.selectSeason")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toute_annee">{t("forms.seasonAllYear")}</SelectItem>
                  <SelectItem value="printemps_ete">{t("forms.seasonSpringSummer")}</SelectItem>
                  <SelectItem value="automne_hiver">{t("forms.seasonAutumnWinter")}</SelectItem>
                  <SelectItem value="printemps">{t("forms.seasonSpring")}</SelectItem>
                  <SelectItem value="ete">{t("forms.seasonSummer")}</SelectItem>
                  <SelectItem value="automne">{t("forms.seasonAutumn")}</SelectItem>
                  <SelectItem value="hiver">{t("forms.seasonWinter")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{tc("notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t("forms.protocolNotesPlaceholder")}
              rows={3}
            />
          </div>

          <BoosterScheduleEditor
            value={boosterSchedule}
            onChange={setBoosterSchedule}
            title={t("forms.treatmentSchedule")}
            description={t("forms.treatmentScheduleDesc")}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange('active', checked)}
            />
            <Label htmlFor="active">{t("forms.protocolActive")}</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProtocol ? tc("edit") : tc("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Settings, Save, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useAppSettings,
  useAppSettingsByCategory,
  useUpdateAppSetting,
  useDeleteAppSetting,
  useInitializeDefaultSettings,
  DEFAULT_SETTINGS
} from "@/hooks/useAppSettings";

interface SettingsValue {
  category: string;
  key: string;
  value: any;
  description?: string;
  isEditing?: boolean;
}

const SETTING_CATEGORIES = [
  { key: 'animals', label: 'Animaux', description: 'Configuration des espèces, races et couleurs' },
  { key: 'clients', label: 'Clients', description: 'Types de clients et paramètres associés' },
  { key: 'consultations', label: 'Consultations', description: 'Types de consultations disponibles' },
  { key: 'appointments', label: 'Rendez-vous', description: 'Types de rendez-vous et configurations' },
  { key: 'medications', label: 'Médicaments', description: 'Catégories de médicaments' },
  { key: 'vaccinations', label: 'Vaccinations', description: 'Types de vaccinations disponibles' },
  { key: 'parasites', label: 'Parasites', description: 'Types de parasites et traitements' },
  { key: 'farms', label: 'Fermes', description: 'Types de fermes et configurations' },
  { key: 'payments', label: 'Paiements', description: 'Méthodes de paiement acceptées' },
];

export const SettingsManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('animals');
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', description: '', value: '' });

  const { toast } = useToast();
  const { data: categorySettings, isLoading } = useAppSettingsByCategory(selectedCategory);
  const updateSettingMutation = useUpdateAppSetting();
  const deleteSettingMutation = useDeleteAppSetting();
  const { initializeDefaults, isLoading: isInitializing } = useInitializeDefaultSettings();

  useEffect(() => {
    if (categorySettings) {
      const initialValues: Record<string, any> = {};
      categorySettings.forEach(setting => {
        initialValues[setting.setting_key] = setting.setting_value;
      });
      setEditingValues(initialValues);
    }
  }, [categorySettings]);

  const handleInitializeDefaults = async () => {
    try {
      await initializeDefaults();
      toast({
        title: "Paramètres initialisés",
        description: "Les paramètres par défaut ont été chargés avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser les paramètres par défaut",
        variant: "destructive"
      });
    }
  };

  const handleSaveSetting = async (key: string) => {
    try {
      const value = editingValues[key];
      await updateSettingMutation.mutateAsync({
        category: selectedCategory,
        key,
        value,
        description: `Configuration ${key} pour ${selectedCategory}`
      });

      toast({
        title: "Paramètre sauvegardé",
        description: `Le paramètre ${key} a été mis à jour`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le paramètre ${key} ?`)) {
      return;
    }

    try {
      await deleteSettingMutation.mutateAsync({
        category: selectedCategory,
        key
      });

      toast({
        title: "Paramètre supprimé",
        description: `Le paramètre ${key} a été supprimé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paramètre",
        variant: "destructive"
      });
    }
  };

  const handleAddValue = async (key: string, newValue: string) => {
    if (!newValue.trim()) return;

    const currentValue = editingValues[key] || [];
    const updatedValue = Array.isArray(currentValue) 
      ? [...currentValue, newValue.trim()]
      : [currentValue, newValue.trim()];

    setEditingValues(prev => ({
      ...prev,
      [key]: updatedValue
    }));

    // Auto-save after adding value
    try {
      await updateSettingMutation.mutateAsync({
        category: selectedCategory,
        key,
        value: updatedValue,
        description: `Configuration ${key} pour ${selectedCategory}`
      });

      toast({
        title: "✓ Valeur ajoutée",
        description: `La valeur a été ajoutée et sauvegardée`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la valeur",
        variant: "destructive"
      });
    }
  };

  const handleRemoveValue = async (key: string, valueToRemove: string) => {
    const currentValue = editingValues[key] || [];
    const updatedValue = Array.isArray(currentValue)
      ? currentValue.filter(v => v !== valueToRemove)
      : [];

    setEditingValues(prev => ({
      ...prev,
      [key]: updatedValue
    }));

    // Auto-save after removing value
    try {
      await updateSettingMutation.mutateAsync({
        category: selectedCategory,
        key,
        value: updatedValue,
        description: `Configuration ${key} pour ${selectedCategory}`
      });

      toast({
        title: "✓ Valeur supprimée",
        description: `La valeur a été supprimée et les changements sauvegardés`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les changements",
        variant: "destructive"
      });
    }
  };

  const handleAddNewSetting = async () => {
    if (!newSetting.key.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du paramètre est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      const value = newSetting.value.includes(',') 
        ? newSetting.value.split(',').map(v => v.trim())
        : newSetting.value;

      await updateSettingMutation.mutateAsync({
        category: selectedCategory,
        key: newSetting.key,
        value,
        description: newSetting.description || `Paramètre personnalisé ${newSetting.key}`
      });

      setShowAddDialog(false);
      setNewSetting({ key: '', description: '', value: '' });
      
      toast({
        title: "Paramètre ajouté",
        description: `Le paramètre ${newSetting.key} a été créé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le paramètre",
        variant: "destructive"
      });
    }
  };

  const renderValueEditor = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveValue(key, item)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une valeur..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddValue(key, (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              size="sm" 
              onClick={(e) => {
                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                handleAddValue(key, input.value);
                input.value = '';
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setEditingValues(prev => ({ ...prev, [key]: parsed }));
            } catch {
              // Invalid JSON, don't update
            }
          }}
          rows={10}
          className="font-mono text-sm"
        />
      );
    }

    return (
      <Input
        value={value || ''}
        onChange={(e) => setEditingValues(prev => ({ ...prev, [key]: e.target.value }))}
      />
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Gestion des paramètres
          </h1>
          <p className="text-muted-foreground mt-2">
            Configurez les valeurs utilisées dans toute l'application
          </p>
        </div>
        <Button onClick={handleInitializeDefaults} disabled={isInitializing}>
          {isInitializing ? "Initialisation..." : "Charger les valeurs par défaut"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Catégories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SETTING_CATEGORIES.map(category => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {SETTING_CATEGORIES.find(c => c.key === selectedCategory)?.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {SETTING_CATEGORIES.find(c => c.key === selectedCategory)?.description}
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un paramètre
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau paramètre</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key">Nom du paramètre</Label>
                      <Input
                        id="key"
                        value={newSetting.key}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="ex: types, categories..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newSetting.description}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du paramètre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Valeurs (séparées par des virgules)</Label>
                      <Textarea
                        id="value"
                        value={newSetting.value}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Valeur1, Valeur2, Valeur3..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddNewSetting} className="flex-1">
                        Créer
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {categorySettings?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun paramètre configuré pour cette catégorie.</p>
                <p className="text-sm mt-2">Cliquez sur "Charger les valeurs par défaut" pour commencer.</p>
              </div>
            ) : (
              categorySettings?.map(setting => (
                <div key={setting.setting_key} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{setting.setting_key}</h3>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveSetting(setting.setting_key)}
                        disabled={updateSettingMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSetting(setting.setting_key)}
                        disabled={deleteSettingMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Valeurs</Label>
                    {renderValueEditor(setting.setting_key, editingValues[setting.setting_key] || setting.setting_value)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
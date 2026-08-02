import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { useWriteAccess } from "@/components/RoleGuard";
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

const SETTING_CATEGORY_KEYS = [
  'animals', 'clients', 'consultations', 'appointments', 'medications',
  'vaccinations', 'parasites', 'farms', 'payments',
] as const;

export const SettingsManagement = () => {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const SETTING_CATEGORIES = useMemo(
    () => SETTING_CATEGORY_KEYS.map((key) => ({
      key,
      label: t(`management.cat.${key}`),
      description: t(`management.cat.${key}Desc`),
    })),
    [t]
  );
  const [selectedCategory, setSelectedCategory] = useState('animals');
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', description: '', value: '' });

  const { toast } = useToast();
  const { canWrite, guardWrite } = useWriteAccess("can_manage_settings");
  const { data: allSettings } = useAppSettings();
  const { data: categorySettings, isLoading } = useAppSettingsByCategory(selectedCategory);
  const updateSettingMutation = useUpdateAppSetting();
  const deleteSettingMutation = useDeleteAppSetting();
  const { initializeDefaults, isLoading: isInitializing } = useInitializeDefaultSettings();
  const autoInitRef = useRef(false);

  // Auto-load default settings on first visit if the user has none yet
  useEffect(() => {
    if (!canWrite) return;
    if (autoInitRef.current) return;
    if (allSettings && allSettings.length === 0 && !isInitializing) {
      autoInitRef.current = true;
      initializeDefaults().then(() => {
        toast({
          title: t("management.readyTitle"),
          description: t("management.readyBody"),
        });
      }).catch(() => {
        autoInitRef.current = false;
      });
    } else if (allSettings && allSettings.length > 0) {
      autoInitRef.current = true;
    }
  }, [allSettings, isInitializing, initializeDefaults, toast, canWrite]);

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
    if (!guardWrite()) return;
    if (!confirm(t("management.restoreConfirm"))) {
      return;
    }
    try {
      await initializeDefaults();
      toast({
        title: t("management.restoredTitle"),
        description: t("management.restoredBody"),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("management.restoreError"),
        variant: "destructive"
      });
    }
  };

  const handleSaveSetting = async (key: string) => {
    if (!guardWrite()) return;
    try {
      const value = editingValues[key];
      await updateSettingMutation.mutateAsync({
        category: selectedCategory,
        key,
        value,
        description: t("management.configDesc", { key, category: selectedCategory })
      });

      toast({
        title: t("management.savedTitle"),
        description: t("management.savedBody", { key }),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("management.saveError"),
        variant: "destructive"
      });
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!guardWrite()) return;
    if (!confirm(t("management.deleteConfirm", { key }))) {
      return;
    }

    try {
      await deleteSettingMutation.mutateAsync({
        category: selectedCategory,
        key
      });

      toast({
        title: t("management.deletedTitle"),
        description: t("management.deletedBody", { key }),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("management.deleteError"),
        variant: "destructive"
      });
    }
  };

  const handleAddValue = async (key: string, newValue: string) => {
    if (!guardWrite()) return;
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
        description: t("management.configDesc", { key, category: selectedCategory })
      });

      toast({
        title: t("management.valueAddedTitle"),
        description: t("management.valueAddedBody"),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("management.valueSaveError"),
        variant: "destructive"
      });
    }
  };

  const handleRemoveValue = async (key: string, valueToRemove: string) => {
    if (!guardWrite()) return;
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
        description: t("management.configDesc", { key, category: selectedCategory })
      });

      toast({
        title: t("management.valueRemovedTitle"),
        description: t("management.valueRemovedBody"),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("management.changesSaveError"),
        variant: "destructive"
      });
    }
  };

  const handleAddNewSetting = async () => {
    if (!guardWrite()) return;
    if (!newSetting.key.trim()) {
      toast({
        title: tc("error"),
        description: t("management.nameRequired"),
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
        description: newSetting.description || t("management.customDesc", { key: newSetting.key })
      });

      setShowAddDialog(false);
      setNewSetting({ key: '', description: '', value: '' });
      
      toast({
        title: t("management.addedTitle"),
        description: t("management.addedBody", { key: newSetting.key }),
      });
    } catch (error) {
      toast({
        title: tc("error"),
        description: t("management.createError"),
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
                {canWrite && (
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveValue(key, item)}
                  />
                )}
              </Badge>
            ))}
          </div>
          {canWrite && (
          <div className="flex gap-2">
            <Input
              placeholder={t("management.addValuePlaceholder")}
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
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <Textarea
          value={JSON.stringify(value, null, 2)}
          disabled={!canWrite}
          onChange={(e) => {
            if (!canWrite) return;
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
        disabled={!canWrite}
        onChange={(e) => {
          if (!canWrite) return;
          setEditingValues(prev => ({ ...prev, [key]: e.target.value }));
        }}
      />
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">{tc("loadingDots")}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            {t("management.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("management.description")}
          </p>
        </div>
        {canWrite && (
          <Button onClick={handleInitializeDefaults} disabled={isInitializing} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            {isInitializing ? t("management.restoring") : t("management.restoreDefaults")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("management.categories")}</CardTitle>
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
              {canWrite && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("management.addSetting")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("management.newSetting")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key">{t("management.settingName")}</Label>
                      <Input
                        id="key"
                        value={newSetting.key}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                        placeholder={t("management.keyPlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{tc("description")}</Label>
                      <Input
                        id="description"
                        value={newSetting.description}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={t("management.settingDescPlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">{t("management.valuesCommaSeparated")}</Label>
                      <Textarea
                        id="value"
                        value={newSetting.value}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                        placeholder={t("management.valuesExamplePlaceholder")}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddNewSetting} className="flex-1">
                        {tc("create")}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        {tc("cancel")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {categorySettings?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("management.emptyCategory")}</p>
                <p className="text-sm mt-2">{t("management.emptyCategoryHint")}</p>
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
                    {canWrite && (
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
                    )}
                  </div>
                  
                  <div>
                    <Label>{t("management.valuesLabel")}</Label>
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
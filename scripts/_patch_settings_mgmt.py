# -*- coding: utf-8 -*-
from pathlib import Path
import re
import json

base = Path(__file__).resolve().parents[1]

# Add valuesLabel to settings locales
for lang, label in [("fr", "Valeurs"), ("en", "Values"), ("es", "Valores")]:
    path = base / "src" / "i18n" / "locales" / lang / "settings.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data.setdefault("management", {})["valuesLabel"] = label
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

path = base / "src" / "components" / "SettingsManagement.tsx"
text = path.read_text(encoding="utf-8")

if "useTranslation" not in text:
    text = text.replace(
        'import { useState, useEffect, useRef } from "react";',
        'import { useState, useEffect, useRef, useMemo } from "react";\nimport { useTranslation } from "react-i18next";',
    )

old_cats = """const SETTING_CATEGORIES = [
  { key: 'animals', label: 'Animaux', description: 'Configuration des espèces, races et couleurs' },
  { key: 'clients', label: 'Clients', description: 'Types de clients et paramètres associés' },
  { key: 'consultations', label: 'Consultations', description: 'Types de consultations disponibles' },
  { key: 'appointments', label: 'Rendez-vous', description: 'Types de rendez-vous et configurations' },
  { key: 'medications', label: 'Médicaments', description: 'Catégories de médicaments' },
  { key: 'vaccinations', label: 'Vaccinations', description: 'Types de vaccinations disponibles' },
  { key: 'parasites', label: 'Parasites', description: 'Types de parasites et traitements' },
  { key: 'farms', label: 'Fermes', description: 'Types de fermes et configurations' },
  { key: 'payments', label: 'Paiements', description: 'Méthodes de paiement acceptées' },
];"""

new_cats = """const SETTING_CATEGORY_KEYS = [
  'animals', 'clients', 'consultations', 'appointments', 'medications',
  'vaccinations', 'parasites', 'farms', 'payments',
] as const;"""

if old_cats not in text:
    raise SystemExit("cats block not found")
text = text.replace(old_cats, new_cats)

needle = "export const SettingsManagement = () => {\n  const [selectedCategory, setSelectedCategory] = useState('animals');"
insert = """export const SettingsManagement = () => {
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
  const [selectedCategory, setSelectedCategory] = useState('animals');"""
if needle not in text:
    raise SystemExit("export block not found")
text = text.replace(needle, insert)

replacements = [
(
"""        toast({
          title: "Paramètres prêts",
          description: "Les valeurs par défaut ont été chargées. Vous pouvez les modifier ou les restaurer à tout moment.",
        });""",
"""        toast({
          title: t("management.readyTitle"),
          description: t("management.readyBody"),
        });""",
),
(
'if (!confirm("Restaurer toutes les valeurs par défaut ? Vos personnalisations actuelles seront écrasées."))',
'if (!confirm(t("management.restoreConfirm")))',
),
(
"""      toast({
        title: "Valeurs restaurées",
        description: "Tous les paramètres ont été réinitialisés aux valeurs par défaut",
      });""",
"""      toast({
        title: t("management.restoredTitle"),
        description: t("management.restoredBody"),
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Impossible de restaurer les paramètres par défaut",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.restoreError"),
        variant: "destructive"
      });""",
),
(
"""        description: `Configuration ${key} pour ${selectedCategory}`
      });

      toast({
        title: "Paramètre sauvegardé",
        description: `Le paramètre ${key} a été mis à jour`,
      });""",
"""        description: t("management.configDesc", { key, category: selectedCategory })
      });

      toast({
        title: t("management.savedTitle"),
        description: t("management.savedBody", { key }),
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.saveError"),
        variant: "destructive"
      });""",
),
(
"if (!confirm(`Êtes-vous sûr de vouloir supprimer le paramètre ${key} ?`))",
'if (!confirm(t("management.deleteConfirm", { key })))',
),
(
"""      toast({
        title: "Paramètre supprimé",
        description: `Le paramètre ${key} a été supprimé`,
      });""",
"""      toast({
        title: t("management.deletedTitle"),
        description: t("management.deletedBody", { key }),
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paramètre",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.deleteError"),
        variant: "destructive"
      });""",
),
(
"""        description: `Configuration ${key} pour ${selectedCategory}`
      });

      toast({
        title: "✓ Valeur ajoutée",
        description: `La valeur a été ajoutée et sauvegardée`,
      });""",
"""        description: t("management.configDesc", { key, category: selectedCategory })
      });

      toast({
        title: t("management.valueAddedTitle"),
        description: t("management.valueAddedBody"),
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la valeur",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.valueSaveError"),
        variant: "destructive"
      });""",
),
(
"""        description: `Configuration ${key} pour ${selectedCategory}`
      });

      toast({
        title: "✓ Valeur supprimée",
        description: `La valeur a été supprimée et les changements sauvegardés`,
      });""",
"""        description: t("management.configDesc", { key, category: selectedCategory })
      });

      toast({
        title: t("management.valueRemovedTitle"),
        description: t("management.valueRemovedBody"),
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les changements",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.changesSaveError"),
        variant: "destructive"
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Le nom du paramètre est obligatoire",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.nameRequired"),
        variant: "destructive"
      });""",
),
(
"description: newSetting.description || `Paramètre personnalisé ${newSetting.key}`",
'description: newSetting.description || t("management.customDesc", { key: newSetting.key })',
),
(
"""      toast({
        title: "Paramètre ajouté",
        description: `Le paramètre ${newSetting.key} a été créé`,
      });""",
"""      toast({
        title: t("management.addedTitle"),
        description: t("management.addedBody", { key: newSetting.key }),
      });""",
),
(
"""      toast({
        title: "Erreur",
        description: "Impossible de créer le paramètre",
        variant: "destructive"
      });""",
"""      toast({
        title: tc("error"),
        description: t("management.createError"),
        variant: "destructive"
      });""",
),
('placeholder="Ajouter une valeur..."', 'placeholder={t("management.addValuePlaceholder")}'),
('return <div className="flex justify-center p-8">Chargement...</div>;', 'return <div className="flex justify-center p-8">{tc("loadingDots")}</div>;'),
(
"""            Gestion des paramètres
          </h1>
          <p className="text-muted-foreground mt-2">
            Configurez les valeurs utilisées dans toute l'application
          </p>""",
"""            {t("management.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("management.description")}
          </p>""",
),
(
'{isInitializing ? "Restauration..." : "Restaurer les valeurs par défaut"}',
'{isInitializing ? t("management.restoring") : t("management.restoreDefaults")}',
),
("<CardTitle>Catégories</CardTitle>", '<CardTitle>{t("management.categories")}</CardTitle>'),
(
"""                    Ajouter un paramètre
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau paramètre</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key">Nom du paramètre</Label>""",
"""                    {t("management.addSetting")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("management.newSetting")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key">{t("management.settingName")}</Label>""",
),
('<Label htmlFor="description">Description</Label>', '<Label htmlFor="description">{tc("description")}</Label>'),
('placeholder="Description du paramètre"', 'placeholder={t("management.settingDescPlaceholder")}'),
('<Label htmlFor="value">Valeurs (séparées par des virgules)</Label>', '<Label htmlFor="value">{t("management.valuesCommaSeparated")}</Label>'),
(
"""                      <Button onClick={handleAddNewSetting} className="flex-1">
                        Créer
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Annuler
                      </Button>""",
"""                      <Button onClick={handleAddNewSetting} className="flex-1">
                        {tc("create")}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        {tc("cancel")}
                      </Button>""",
),
(
"""                <p>Aucun paramètre configuré pour cette catégorie.</p>
                <p className="text-sm mt-2">Cliquez sur "Charger les valeurs par défaut" pour commencer.</p>""",
"""                <p>{t("management.emptyCategory")}</p>
                <p className="text-sm mt-2">{t("management.emptyCategoryHint")}</p>""",
),
("<Label>Valeurs</Label>", '<Label>{t("management.valuesLabel")}</Label>'),
]

for a, b in replacements:
    if a not in text:
        print("MISSING:", repr(a[:100]))
    else:
        text = text.replace(a, b)

path.write_text(text, encoding="utf-8")
print("SettingsManagement patched")
fr = re.findall(r'["\']([^"\']*[àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ][^"\']*)["\']', text)
print("remaining accented literals count:", len(fr))
for s in fr[:20]:
    print(" -", s)

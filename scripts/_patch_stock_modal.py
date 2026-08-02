# -*- coding: utf-8 -*-
"""i18n-wire NewStockItemModal.tsx"""
from pathlib import Path
import re

path = Path(__file__).resolve().parents[1] / "src" / "components" / "forms" / "NewStockItemModal.tsx"
text = path.read_text(encoding="utf-8")

if "useTranslation" not in text:
    text = text.replace(
        'import { useSettings } from "@/contexts/SettingsContext";',
        'import { useSettings } from "@/contexts/SettingsContext";\nimport { useTranslation } from "react-i18next";\nimport { useMemo } from "react";',
    )
    # fix duplicate useState import path - already imports useState, useEffect
    text = text.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect, useMemo } from 'react';",
    )
    text = text.replace('\nimport { useMemo } from "react";', "")

old_block = """// Catégories de stock
const categories = [
  { value: 'medication', label: 'Médicaments', icon: '💊' },
  { value: 'vaccine', label: 'Vaccins', icon: '💉' },
  { value: 'consumable', label: 'Consommables', icon: '🩹' },
  { value: 'equipment', label: 'Équipement', icon: '🔧' },
  { value: 'supplement', label: 'Suppléments', icon: '🧪' }
];

// Unités disponibles
const units = [
  { value: 'unit', label: 'Unité' },
  { value: 'box', label: 'Boîte' },
  { value: 'vial', label: 'Flacon' },
  { value: 'bottle', label: 'Bouteille' },
  { value: 'pack', label: 'Paquet' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'g', label: 'Gramme' },
  { value: 'ml', label: 'Millilitre' },
  { value: 'l', label: 'Litre' }
];

// Sous-catégories par catégorie
const subcategories = {
  medication: [
    'Antibiotique', 'Anti-inflammatoire', 'Antiparasitaire', 'Anesthésique', 
    'Analgésique', 'Antihistaminique', 'Corticoïde', 'Diurétique', 'Autre'
  ],
  vaccine: [
    'Vaccin Core', 'Vaccin Non-Core', 'Vaccin Obligatoire', 'Vaccin Recommandé', 'Autre'
  ],
  consumable: [
    'Matériel d\\'injection', 'Protection', 'Pansement', 'Suture', 'Autre'
  ],
  equipment: [
    'Diagnostic', 'Chirurgie', 'Monitoring', 'Stérilisation', 'Autre'
  ],
  supplement: [
    'Vitamines', 'Minéraux', 'Probiotiques', 'Acides aminés', 'Autre'
  ]
};"""

new_block = """const CATEGORY_META = [
  { value: 'medication', icon: '💊' },
  { value: 'vaccine', icon: '💉' },
  { value: 'consumable', icon: '🩹' },
  { value: 'equipment', icon: '🔧' },
  { value: 'supplement', icon: '🧪' }
] as const;

const UNIT_KEYS = ['unit', 'box', 'vial', 'bottle', 'pack', 'kg', 'g', 'ml', 'l'] as const;

const SUBCATEGORY_KEYS = {
  medication: ['antibiotic', 'antiInflammatory', 'antiparasitic', 'anesthetic', 'analgesic', 'antihistamine', 'corticoid', 'diuretic', 'other'],
  vaccine: ['core', 'nonCore', 'mandatory', 'recommended', 'other'],
  consumable: ['injection', 'protection', 'dressing', 'suture', 'other'],
  equipment: ['diagnostic', 'surgery', 'monitoring', 'sterilization', 'other'],
  supplement: ['vitamins', 'minerals', 'probiotics', 'aminoAcids', 'other'],
} as const;"""

if old_block not in text:
    raise SystemExit("constants block not found")
text = text.replace(old_block, new_block)

# Insert translation hooks after toast
marker = """  const { settings } = useSettings();
  const { toast } = useToast();"""
hook = """  const { settings } = useSettings();
  const { toast } = useToast();
  const { t } = useTranslation("app");
  const { t: tc } = useTranslation("common");

  const categories = useMemo(
    () => CATEGORY_META.map((c) => ({ ...c, label: t(`stock.categories.${c.value}`) })),
    [t]
  );
  const units = useMemo(
    () => UNIT_KEYS.map((value) => ({ value, label: t(`stock.units.${value}`) })),
    [t]
  );
  const subcategories = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const [cat, keys] of Object.entries(SUBCATEGORY_KEYS)) {
      out[cat] = keys.map((k) => t(`stock.subcategories.${cat}.${k}`));
    }
    return out;
  }, [t]);"""
if marker not in text:
    raise SystemExit("settings/toast marker not found")
text = text.replace(marker, hook)

replacements = [
(
"""        description: "Le nom de l'élément est requis.",""",
"""        description: t("stock.itemNameRequired"),""",
),
(
"""        description: "Les valeurs numériques ne peuvent pas être négatives.",""",
"""        description: t("stock.numericNegative"),""",
),
(
"""        title: "Élément modifié",
        description: `"${formData.name}" a été modifié avec succès.`,""",
"""        title: t("stock.itemUpdated"),
        description: t("stock.itemUpdatedBody", { name: formData.name }),""",
),
(
"""        title: "Élément ajouté",
        description: `"${formData.name}" a été ajouté au stock.`,""",
"""        title: t("stock.itemAdded"),
        description: t("stock.itemAddedBody", { name: formData.name }),""",
),
(
"""            {editingItem ? 'Modifier l\\'élément de stock' : 'Nouvel élément de stock'}
          </DialogTitle>
          <DialogDescription>
            {editingItem 
              ? 'Modifiez les informations de l\\'élément de stock.'
              : 'Ajoutez un nouvel élément à votre inventaire.'
            }""",
"""            {editingItem ? t("stock.editItem") : t("stock.newItem")}
          </DialogTitle>
          <DialogDescription>
            {editingItem 
              ? t("stock.editItemDesc")
              : t("stock.newItemDesc")
            }""",
),
("<h3 className=\"text-lg font-semibold\">Informations de base</h3>", '<h3 className="text-lg font-semibold">{t("stock.basicInfo")}</h3>'),
('<Label htmlFor="name">Nom de l\'élément *</Label>', '<Label htmlFor="name">{t("stock.itemName")}</Label>'),
('placeholder="ex: Amoxicilline 500mg"', 'placeholder={t("stock.itemNamePlaceholder")}'),
('<Label htmlFor="category">Catégorie *</Label>', '<Label htmlFor="category">{tc("category")} *</Label>'),
('placeholder="Sélectionner une catégorie"', 'placeholder={t("stock.selectCategory")}'),
('<Label htmlFor="subcategory">Sous-catégorie</Label>', '<Label htmlFor="subcategory">{t("stock.subcategory")}</Label>'),
('placeholder="Sélectionner une sous-catégorie"', 'placeholder={t("stock.selectSubcategory")}'),
('<Label htmlFor="manufacturer">Fabricant</Label>', '<Label htmlFor="manufacturer">{tc("manufacturer")}</Label>'),
('<Label htmlFor="description">Description</Label>', '<Label htmlFor="description">{tc("description")}</Label>'),
('placeholder="Description détaillée de l\'élément..."', 'placeholder={t("stock.descriptionPlaceholder")}'),
("<h3 className=\"text-lg font-semibold\">Informations techniques</h3>", '<h3 className="text-lg font-semibold">{t("stock.technicalInfo")}</h3>'),
('<Label htmlFor="batchNumber">Numéro de lot</Label>', '<Label htmlFor="batchNumber">{tc("batchNumber")}</Label>'),
('<Label htmlFor="dosage">Dosage</Label>', '<Label htmlFor="dosage">{tc("dosage")}</Label>'),
('<Label htmlFor="unit">Unité</Label>', '<Label htmlFor="unit">{tc("unit")}</Label>'),
('placeholder="Sélectionner une unité"', 'placeholder={t("stock.selectUnit")}'),
("<h3 className=\"text-lg font-semibold\">Gestion du stock</h3>", '<h3 className="text-lg font-semibold">{t("stock.stockManagement")}</h3>'),
('<Label htmlFor="currentStock">Stock actuel *</Label>', '<Label htmlFor="currentStock">{t("stock.currentStock")}</Label>'),
('<Label htmlFor="minimumStock">Stock minimum *</Label>', '<Label htmlFor="minimumStock">{t("stock.minimumStock")}</Label>'),
('<Label htmlFor="maximumStock">Stock maximum</Label>', '<Label htmlFor="maximumStock">{t("stock.maximumStock")}</Label>'),
(
"""                <Label htmlFor="purchasePrice">Prix d'achat ({settings.currency}) *</Label>""",
"""                <Label htmlFor="purchasePrice">{t("stock.purchasePrice", { currency: settings.currency })}</Label>""",
),
(
"""                <p className="text-sm text-muted-foreground">
                  Prix d'achat au fournisseur
                </p>""",
"""                <p className="text-sm text-muted-foreground">
                  {t("stock.purchasePricePlaceholder")}
                </p>""",
),
(
"""                <Label htmlFor="sellingPrice">Prix de vente ({settings.currency}) *</Label>""",
"""                <Label htmlFor="sellingPrice">{t("stock.sellingPrice", { currency: settings.currency })}</Label>""",
),
(
"""                <p className="text-sm text-muted-foreground">
                  Prix de vente au client
                </p>""",
"""                <p className="text-sm text-muted-foreground">
                  {t("stock.sellingPricePlaceholder")}
                </p>""",
),
(
"""                La valeur totale sera calculée automatiquement : Prix d'achat × Stock actuel""",
"""                {t("stock.purchasePriceHint")}""",
),
(
"""                  Valeur totale : {(formData.purchasePrice * formData.currentStock).toFixed(2)} {settings.currency}""",
"""                  {t("stock.totalValueLabel", { amount: (formData.purchasePrice * formData.currentStock).toFixed(2), currency: settings.currency })}""",
),
(
"""                  Marge : {((formData.sellingPrice - formData.purchasePrice) * formData.currentStock).toFixed(2)} {settings.currency}""",
"""                  {t("stock.marginLabel", { amount: ((formData.sellingPrice - formData.purchasePrice) * formData.currentStock).toFixed(2), currency: settings.currency })}""",
),
("<h3 className=\"text-lg font-semibold\">Informations supplémentaires</h3>", '<h3 className="text-lg font-semibold">{t("stock.additionalInfo")}</h3>'),
('<Label htmlFor="expirationDate">Date d\'expiration</Label>', '<Label htmlFor="expirationDate">{t("stock.expirationDate")}</Label>'),
('<Label htmlFor="supplier">Fournisseur</Label>', '<Label htmlFor="supplier">{tc("supplier")}</Label>'),
('placeholder="ex: Pharmacie Vétérinaire Centrale"', 'placeholder={t("stock.supplierEx")}'),
('<Label htmlFor="location">Emplacement</Label>', '<Label htmlFor="location">{tc("location")}</Label>'),
('placeholder="ex: Armoire A - Étagère 1"', 'placeholder={t("stock.locationPlaceholder")}'),
('<Label htmlFor="barcode">Code-barres</Label>', '<Label htmlFor="barcode">{tc("barcode")}</Label>'),
('<Label htmlFor="notes">Notes</Label>', '<Label htmlFor="notes">{tc("notes")}</Label>'),
('placeholder="Notes supplémentaires..."', 'placeholder={t("stock.notesExtraPlaceholder")}'),
(
"""            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>""",
"""            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit">
              {editingItem ? tc("edit") : tc("add")}
            </Button>""",
),
]

for a, b in replacements:
    if a not in text:
        print("MISSING:", repr(a[:120]))
    else:
        text = text.replace(a, b)

path.write_text(text, encoding="utf-8")
print("NewStockItemModal patched")
fr = re.findall(r'["\']([^"\']*[àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ][^"\']*)["\']', text)
# filter comments
print("accented literals:", len(fr))
for s in fr:
    if "Réinitialiser" in s or "Pré-remplir" in s or "Catégories" in s:
        continue
    print(" -", s)

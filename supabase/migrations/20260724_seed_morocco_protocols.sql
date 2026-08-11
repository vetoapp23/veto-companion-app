-- Protocoles vaccinaux & antiparasitaires — maladies courantes au Maroc
-- Catalogues globaux (organization_id NULL) visibles par toutes les cliniques (RLS SELECT).

-- ========== VACCINATION ==========
INSERT INTO public.vaccination_protocols (
  species, vaccine_name, vaccine_type, age_recommendation, frequency,
  duration_days, notes, active, organization_id, booster_schedule
)
SELECT * FROM (VALUES
  -- CHIEN
  (
    'Chien',
    'CHPPi (Carré / Hépatite / Parvo / Para-influenza)',
    'Vaccin combiné',
    'Dès 6–8 semaines',
    'Primo-vaccination puis rappel annuel',
    365,
    'Protocole de base chiots — Maroc. Carré, hépatite de Rubarth, parvovirose, para-influenza.',
    true,
    NULL::uuid,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"3ème dose","offset_days":42}]'::jsonb
  ),
  (
    'Chien',
    'Leptospirose',
    'Leptospira',
    'Dès 8–12 semaines (avec CHPPi)',
    'Rappel annuel (zones à risque)',
    365,
    'Endémique au Maroc (eau stagnante, rongeurs). Souvent associé au CHPPi (CHPPi-L).',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),
  (
    'Chien',
    'Rage',
    'Rage',
    'Dès 3 mois (selon AMM)',
    'Rappel annuel (obligatoire / voyages)',
    365,
    'Prioritaire au Maroc (zoonose). Certificat / identification souvent exigés.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),
  (
    'Chien',
    'Leishmaniose',
    'Leishmania',
    'Dès 6 mois (chien non infecté)',
    'Selon vaccin (souvent annuel)',
    365,
    'Très pertinente au Maroc (phlébotomes). Compléter par prévention vectorielle (collier / spot-on).',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"3ème dose","offset_days":42}]'::jsonb
  ),
  (
    'Chien',
    'Toux de chenil (Bordetella / Para-influenza)',
    'Voies respiratoires',
    'Avant pension / exposition',
    'Rappel annuel si risque',
    365,
    'Utile avant pensions, expositions, chenils.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),

  -- CHAT
  (
    'Chat',
    'RCP (Typhus / Calici / Herpès)',
    'Vaccin tricovalent',
    'Dès 8 semaines',
    'Primo puis rappel annuel',
    365,
    'Protocole de base chatons — panleucopénie, calicivirose, rhinotrachéite herpétique.',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"3ème dose","offset_days":42}]'::jsonb
  ),
  (
    'Chat',
    'Rage',
    'Rage',
    'Dès 3 mois',
    'Rappel annuel',
    365,
    'Recommandée au Maroc, surtout chats sortants / voyages.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),
  (
    'Chat',
    'Leucémie féline (FeLV)',
    'FeLV',
    'Dès 8–9 semaines (statut FeLV négatif)',
    'Rappel annuel si risque',
    365,
    'Chats d''extérieur / multi-chats. Tester FeLV avant primo-vaccination.',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),

  -- LAPIN
  (
    'Lapin',
    'Myxomatose',
    'Myxoma virus',
    'Dès 4–6 semaines',
    'Rappel annuel (ou selon AMM)',
    365,
    'Courante chez lapins d''agrément et élevages. Vecteurs : moustiques / puces.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),
  (
    'Lapin',
    'VHD / RHD (maladie hémorragique)',
    'Calicivirus',
    'Dès 4–10 semaines selon vaccin',
    'Rappel annuel',
    365,
    'Souvent combiné myxomatose (vaccin bivalent). Forms RHDV1/RHDV2 selon produit.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),

  -- OISEAU / VOLAILLE
  (
    'Oiseau',
    'Maladie de Newcastle',
    'Paramyxovirus',
    'Selon espèce / âge',
    'Selon protocole élevage',
    90,
    'Très importante en aviculture au Maroc. Adapter au type (ponte / chair / cage).',
    true,
    NULL,
    '[{"label":"1ère vaccination","offset_days":0},{"label":"Rappel","offset_days":21},{"label":"Rappel 2","offset_days":56}]'::jsonb
  ),
  (
    'Oiseau',
    'Variole aviaire',
    'Poxvirus',
    'Selon saison / risque',
    'Selon protocole',
    365,
    'Présente en climat méditerranéen. Vaccination cutanée / aile selon produit.',
    true,
    NULL,
    '[{"label":"Vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),

  -- BOVIN
  (
    'Bovin',
    'Fièvre aphteuse',
    'FMD',
    'Selon campagne ONSSA / âge',
    'Campagnes nationales / rappels',
    180,
    'Priorité sanitaire nationale au Maroc (ONSSA). Suivre calendrier officiel.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel","offset_days":180}]'::jsonb
  ),
  (
    'Bovin',
    'Dermatose nodulaire contagieuse (LSD)',
    'Capripoxvirus',
    'Selon risque / campagne',
    'Selon campagne',
    365,
    'Maladie émergente / régionale — surveiller consignes sanitaires Maroc.',
    true,
    NULL,
    '[{"label":"Vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),
  (
    'Bovin',
    'Pasteurellose / septicémie hémorragique',
    'Pasteurella',
    'Jeunes / zones à risque',
    'Selon protocole élevage',
    180,
    'Respiratoire / septicémique — élevages bovins.',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"Rappel","offset_days":21},{"label":"Rappel 6 mois","offset_days":180}]'::jsonb
  ),
  (
    'Bovin',
    'Charbon symptomatique',
    'Clostridium chauvoei',
    'Jeunes bovins zones endémiques',
    'Annuel si risque',
    365,
    'Zones à risque (pâturages).',
    true,
    NULL,
    '[{"label":"Vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),

  -- OVIN
  (
    'Ovin',
    'PPR (peste des petits ruminants)',
    'PPRV',
    'Selon campagne / âge',
    'Campagnes nationales',
    365,
    'Endémique Afrique du Nord / Maroc — priorité petits ruminants.',
    true,
    NULL,
    '[{"label":"Vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),
  (
    'Ovin',
    'Clavelée (variole ovine)',
    'Capripoxvirus',
    'Selon risque',
    'Selon campagne',
    365,
    'Maladie classique des ovins en zone méditerranéenne.',
    true,
    NULL,
    '[{"label":"Vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),
  (
    'Ovin',
    'Entérotoxémie',
    'Clostridies',
    'Agneaux / adultes',
    '2 doses puis rappel annuel',
    365,
    'Très fréquente en élevage ovin (changements alimentaires).',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),
  (
    'Ovin',
    'Fièvre aphteuse',
    'FMD',
    'Selon campagne ONSSA',
    'Campagnes nationales',
    180,
    'Suivre calendrier officiel Maroc.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel","offset_days":180}]'::jsonb
  ),

  -- CAPRIN
  (
    'Caprin',
    'PPR (peste des petits ruminants)',
    'PPRV',
    'Selon campagne',
    'Campagnes nationales',
    365,
    'Priorité sanitaire caprins au Maroc.',
    true,
    NULL,
    '[{"label":"Vaccination","offset_days":0},{"label":"Rappel","offset_days":365}]'::jsonb
  ),
  (
    'Caprin',
    'Entérotoxémie',
    'Clostridies',
    'Chevreaux / adultes',
    '2 doses puis annuel',
    365,
    'Fréquente en élevage caprin.',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":21},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),
  (
    'Caprin',
    'Fièvre aphteuse',
    'FMD',
    'Selon campagne ONSSA',
    'Campagnes nationales',
    180,
    'Suivre consignes officielles.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel","offset_days":180}]'::jsonb
  ),

  -- CHEVAL
  (
    'Cheval',
    'Tétanos',
    'Clostridium tetani',
    'Poulains dès 4–6 mois',
    'Rappel annuel / blessures',
    365,
    'Essentiel pour équidés (sol / blessures).',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":28},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  ),
  (
    'Cheval',
    'Grippe équine',
    'Influenza',
    'Selon réglementation courses / déplacement',
    'Tous les 6–12 mois',
    180,
    'Important pour chevaux de sport / déplacement.',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":28},{"label":"Rappel","offset_days":180}]'::jsonb
  ),
  (
    'Cheval',
    'Rhinopneumonie (herpèsvirus)',
    'EHV',
    'Selon statut / juments',
    'Selon protocole',
    180,
    'Respiratoire / avortements — élevages et haras.',
    true,
    NULL,
    '[{"label":"1ère dose","offset_days":0},{"label":"2ème dose","offset_days":28},{"label":"Rappel","offset_days":180}]'::jsonb
  ),
  (
    'Cheval',
    'Rage',
    'Rage',
    'Selon risque / réglementation',
    'Annuel',
    365,
    'Zones / contacts à risque au Maroc.',
    true,
    NULL,
    '[{"label":"Primo-vaccination","offset_days":0},{"label":"Rappel annuel","offset_days":365}]'::jsonb
  )
) AS v(
  species, vaccine_name, vaccine_type, age_recommendation, frequency,
  duration_days, notes, active, organization_id, booster_schedule
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.vaccination_protocols p
  WHERE p.organization_id IS NULL
    AND lower(p.species) = lower(v.species)
    AND lower(p.vaccine_name) = lower(v.vaccine_name)
);

-- ========== ANTIPARASITAIRES ==========
INSERT INTO public.antiparasitic_protocols (
  user_id, organization_id, species, parasite_type, product_name,
  active_ingredient, administration_route, dosage_per_kg, frequency,
  age_restriction, notes, active, booster_schedule
)
SELECT
  NULL,
  NULL,
  v.species,
  v.parasite_type,
  v.product_name,
  v.active_ingredient,
  v.administration_route,
  v.dosage_per_kg,
  v.frequency,
  v.age_restriction,
  v.notes,
  true,
  v.booster_schedule
FROM (VALUES
  (
    'Chien',
    'Vers intestinaux',
    'Vermifuge large spectre (chiens)',
    'Praziquantel + pyrantel / fébantel (selon produit)',
    'oral',
    'Selon poids / AMM',
    'Chiots mensuel puis 3–4×/an',
    'Selon AMM produit',
    'Ascarides, ankylostomes, ténias — très courant au Maroc.',
    '[{"label":"1er traitement","offset_days":0},{"label":"Rappel 1","offset_days":14},{"label":"Rappel 2","offset_days":28},{"label":"Entretien","offset_days":90}]'::jsonb
  ),
  (
    'Chien',
    'Puces / tiques',
    'Protection externe puces-tiques',
    'Fipronil / fluralaner / afoxolaner / perméthrine (selon produit)',
    'spot_on',
    'Selon poids',
    'Mensuel ou selon durée produit',
    'Attention colliers / chat (perméthrine)',
    'Saison chaude / zones rurales Maroc — tiques et puces fréquentes.',
    '[{"label":"1er traitement","offset_days":0},{"label":"Rappel","offset_days":28}]'::jsonb
  ),
  (
    'Chien',
    'Leishmaniose (prévention vectorielle)',
    'Répulsif phlébotomes',
    'Deltaméthrine / fluméthrine (collier) ou spot-on adapté',
    'collier',
    'Selon produit',
    'Continue en saison des phlébotomes',
    'Complément à la vaccination leishmaniose',
    'Prévention essentielle au Maroc (phlébotomes).',
    '[{"label":"Pose / application","offset_days":0},{"label":"Renouvellement","offset_days":210}]'::jsonb
  ),
  (
    'Chat',
    'Vers intestinaux',
    'Vermifuge chats',
    'Praziquantel + pyrantel (selon produit)',
    'oral',
    'Selon poids',
    'Chatons mensuel puis 3–4×/an',
    'Selon AMM',
    'Vermifugation de routine — chats d''intérieur/extérieur.',
    '[{"label":"1er traitement","offset_days":0},{"label":"Rappel 1","offset_days":14},{"label":"Entretien","offset_days":90}]'::jsonb
  ),
  (
    'Chat',
    'Puces / tiques',
    'Protection externe chats',
    'Fipronil / fluralaner / imidaclopride (produits chat)',
    'spot_on',
    'Selon poids',
    'Mensuel ou selon produit',
    'Jamais de produit chien (perméthrine)',
    'Puces très fréquentes ; éviter produits toxiques pour le chat.',
    '[{"label":"1er traitement","offset_days":0},{"label":"Rappel","offset_days":28}]'::jsonb
  ),
  (
    'Lapin',
    'Coccidies / parasites internes',
    'Anticoccidien / vermifuge lapin',
    'Selon diagnostic (toltrazuril, etc.)',
    'oral',
    'Selon produit',
    'Selon diagnostic',
    'Sous contrôle vétérinaire',
    'Coccidiose fréquente chez jeunes lapins.',
    '[{"label":"Traitement","offset_days":0},{"label":"Contrôle","offset_days":14}]'::jsonb
  ),
  (
    'Bovin',
    'Strongles / parasites internes',
    'Vermifuge bovins',
    'Ivermectine / albendazole / levamisole (selon)',
    'oral',
    'Selon poids vif',
    'Selon charge parasitiaire / saison',
    'Respect LMR / délais d''attente',
    'Parasitisme digestif courant en élevage extensif Maroc.',
    '[{"label":"Traitement","offset_days":0},{"label":"Rappel saisonnier","offset_days":90}]'::jsonb
  ),
  (
    'Bovin',
    'Tiques / ectoparasites',
    'Acaricide bovins',
    'Selon produit (amitraz, pyréthrinoïdes…)',
    'spray',
    'Selon AMM',
    'Selon infestation',
    'Respect délais d''attente lait/viande',
    'Tiques fréquentes en zones pastorales.',
    '[{"label":"Traitement","offset_days":0},{"label":"Rappel","offset_days":28}]'::jsonb
  ),
  (
    'Ovin',
    'Strongles gastro-intestinaux',
    'Vermifuge ovins',
    'Ivermectine / benzimidazoles / closantel (selon)',
    'oral',
    'Selon poids',
    'Selon saison / FEC',
    'Attention résistances — rotation',
    'Parasitisme majeur petits ruminants Maroc.',
    '[{"label":"Traitement","offset_days":0},{"label":"Rappel","offset_days":60}]'::jsonb
  ),
  (
    'Caprin',
    'Strongles gastro-intestinaux',
    'Vermifuge caprins',
    'Selon produit homologué caprin',
    'oral',
    'Selon poids',
    'Selon saison / FEC',
    'Doses souvent spécifiques chèvre',
    'Forte pression parasitaire en caprins.',
    '[{"label":"Traitement","offset_days":0},{"label":"Rappel","offset_days":60}]'::jsonb
  ),
  (
    'Cheval',
    'Strongles / ascarides',
    'Vermifuge équins',
    'Ivermectine / praziquantel / pyrantel (selon)',
    'oral',
    'Selon poids',
    '2–4×/an selon âge et pâturage',
    'Selon AMM',
    'Programme de vermifugation raisonné.',
    '[{"label":"Traitement","offset_days":0},{"label":"Rappel","offset_days":90}]'::jsonb
  )
) AS v(
  species, parasite_type, product_name, active_ingredient,
  administration_route, dosage_per_kg, frequency, age_restriction,
  notes, booster_schedule
)
WHERE NOT EXISTS (
  SELECT 1 FROM public.antiparasitic_protocols p
  WHERE p.organization_id IS NULL
    AND lower(p.species) = lower(v.species)
    AND lower(p.product_name) = lower(v.product_name)
);

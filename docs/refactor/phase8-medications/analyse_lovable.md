# Analyse et Refonte Ultra-Sécurisée - Système de Gestion des Médicaments

**Date:** 2025-11-03  
**Phase:** 8 - Medications System Refactoring  
**Status:** Analyse Détaillée / Migration Ultra-Sécurisée  
**Stratégie:** Duplication complète des tables impactées (v2) pour rollback possible

---

## 📋 Table des Matières

1. [Contexte et Problématique](#contexte-et-problématique)
2. [État des Lieux Existant](#état-des-lieux-existant)
3. [Analyse Tables v2 Nécessaires](#analyse-tables-v2-nécessaires)
4. [Architecture Proposée](#architecture-proposée)
5. [Plan de Migration Détaillé](#plan-de-migration-détaillé)
6. [Impact et Bénéfices](#impact-et-bénéfices)
7. [Risques et Mitigation](#risques-et-mitigation)
8. [Décisions à Trancher](#décisions-à-trancher)

---

## 🎯 Contexte et Problématique

### Question Centrale

**Quelle est la légitimité de la table `medication_catalog` si on peut récupérer directement les fiches médicaments depuis une source officielle ?**

### Constat Actuel

- Le référentiel `medication_catalog` stocke manuellement des médicaments disponibles
- Risque de données obsolètes, incomplètes ou incorrectes
- Duplication des données entre `medication_catalog` et `medications`
- Pas d'intégration avec les bases officielles (ex: base-donnees-publique.medicaments.gouv.fr)
- QR Code DataMatrix non exploité pour récupération automatique des données

### Vision Cible

Système permettant de :

1. **Récupérer automatiquement** les fiches médicaments officielles (via API ou QR Code)
2. **Stocker localement** dans un cache pour performance et mode offline
3. **Personnaliser** les données au niveau du traitement utilisateur (posologie, stock, seuil, etc.)
4. **Supprimer** la redondance et la saisie manuelle fastidieuse

---

## 📊 État des Lieux Existant

### 1. Architecture Actuelle

#### Table `medication_catalog` (Référentiel)

```sql
medication_catalog
├── id (uuid)
├── name (text) - Nom du médicament
├── pathology (text) - Pathologie (TEXT au lieu de UUID!)
├── pathology_id (uuid) - Référence pathologies (souvent NULL)
├── default_posology (text) - Posologie par défaut
├── strength (text) - Dosage (ex: "5mg/1000mg")
├── description (text)
├── form (text) - Forme pharmaceutique
├── color (text)
├── default_times (text[]) - Horaires par défaut
├── initial_stock (integer) - ❌ NON UTILISÉ
├── min_threshold (integer) - ❌ NON UTILISÉ
├── is_approved (boolean) - Pour validation admin
├── created_by (uuid)
├── created_at, updated_at
```

#### Table `medications` (Médicaments Utilisateur)

```sql
medications
├── id (uuid)
├── treatment_id (uuid) - Lien vers le traitement
├── catalog_id (uuid) - ❌ Lien FAIBLE vers catalog (nullable)
├── name (text) - ❌ DUPLIQUÉ depuis catalog
├── strength (text) - ❌ DUPLIQUÉ depuis catalog
├── posology (text) - ❌ DUPLIQUÉ depuis catalog
├── times (text[]) - Horaires de prise
├── initial_stock (integer) - Stock initial
├── current_stock (integer) - Stock actuel
├── min_threshold (integer) - Seuil d'alerte
├── expiry_date (date) - Date de péremption
├── created_at, updated_at
```

### 2. Problèmes Identifiés

#### ❌ Duplication de Données

- `name`, `strength`, `posology` sont copiés de `medication_catalog` vers `medications`
- Si on met à jour le catalog, les médicaments existants ne sont pas mis à jour
- Incohérence possible entre les deux tables

#### ❌ Lien Faible

- `catalog_id` est **nullable** dans `medications`
- On peut créer un médicament sans lien vers le catalog (médicament custom)
- Difficile de tracer l'origine des données

#### ❌ Incohérences Schéma

- `pathology` en TEXT dans `medication_catalog` alors qu'on a une table `pathologies`
- `pathology_id` existe mais souvent NULL
- `initial_stock` et `min_threshold` dans `medication_catalog` ne servent à rien (c'est user-specific)

#### ❌ Pas de Source Officielle

- Toutes les données sont saisies manuellement
- Risque d'erreurs (fautes de frappe, dosages incorrects, etc.)
- Pas de garantie de conformité réglementaire

#### ❌ Maintenance Complexe

- 17 fichiers dans le code utilisent `catalog_id` ou `medication_catalog`
- Logique split entre "from catalog" et "custom medication"
- Code complexe avec beaucoup de conditions

### 3. Fichiers Impactés (17 fichiers)

```
src/components/TreatmentWizard/
├── Step2Medications.tsx - Utilise catalog pour ajout
├── hooks/useStep2Medications.ts - Logique catalog + custom
├── components/MedicationsList.tsx - Affiche médicaments
├── components/MedicationCard.tsx - Affiche détails
└── types.ts - Interface CatalogMedication

src/pages/medication-catalog/ - ❌ À SUPPRIMER
├── index.tsx
├── components/
└── hooks/

src/pages/history/
├── components/HistoryMedicationList.tsx - Affiche dosage depuis catalog
└── hooks/useHistoryMedications.ts - Query catalog

src/pages/calendar-custom/
└── hooks/useCalendarIntakes.ts - Affiche dosage depuis catalog

src/pages/calendar/
└── hooks/useMonthlySchedule.ts - Affiche dosage depuis catalog

src/pages/index/
└── components/RecentMedicationCard.tsx - Affiche médicament avec catalog

src/pages/stocks/
├── hooks/useStockData.ts - Calcule stocks depuis catalog
├── hooks/useStockAlerts.ts - Alertes stocks
└── hooks/useStockHistory.ts - Historique

src/pages/treatment-edit/
└── hooks/useTreatmentEdit.ts - Édition médicaments

src/pages/treatments/
└── components/TreatmentMedicationsList.tsx - Liste médicaments
```

---

## 🔍 Analyse Tables v2 Nécessaires

### Stratégie Ultra-Sécurisée

**Objectif :** Migration sans perte de données avec **rollback complet possible** à tout moment.

**Principe :** Duplication des tables impactées en v2, préservation des tables v1, bascule progressive du code.

### Analyse Table par Table

#### ✅ DOIT être dupliquée en v2

| Table                                                  | Raison                                          | Nouveaux champs                                                                                                                         | FK impactées                                                            |
| ------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **medications** → **medications_v2**                   | Structure change (ajout champs officiels)       | `reference_cache_id`, `official_name`, `official_strength`, `pharmaceutical_form`, `cis_code`, `user_name`, `batch_number`, `photo_url` | FK vers `medication_reference_cache`, `treatments_v2`, `pathologies_v2` |
| **medication_intakes** → **medication_intakes_v2**     | FK vers medications_v2                          | Aucun nouveau champ                                                                                                                     | FK vers `medications_v2`                                                |
| **treatments** → **treatments_v2**                     | Référencé par medications_v2                    | Aucun nouveau champ                                                                                                                     | FK vers `prescriptions_v2`, `health_professionals_v2` (pharmacy_id)     |
| **pathologies** → **pathologies_v2**                   | Référencé par medications_v2                    | Aucun nouveau champ                                                                                                                     | Aucune                                                                  |
| **prescriptions** → **prescriptions_v2**               | Référencé par treatments_v2                     | Aucun nouveau champ                                                                                                                     | FK vers `health_professionals_v2` (prescribing_doctor_id)               |
| **health_professionals** → **health_professionals_v2** | Référencé par treatments_v2 et prescriptions_v2 | Aucun nouveau champ                                                                                                                     | Aucune                                                                  |
| **pharmacy_visits** → **pharmacy_visits_v2**           | FK vers treatments_v2                           | Aucun nouveau champ                                                                                                                     | FK vers `treatments_v2`, `health_professionals_v2` (pharmacy_id)        |

#### ✅ NOUVELLE table (pas de v1)

| Table                          | Raison               | Champs principaux                                                                       |
| ------------------------------ | -------------------- | --------------------------------------------------------------------------------------- |
| **medication_reference_cache** | Cache API officielle | `cis_code`, `official_name`, `strength`, `pharmaceutical_form`, `official_data` (JSONB) |

#### ❌ Tables NON dupliquées (conservées telles quelles)

| Table                | Raison                        | Impact                                                          |
| -------------------- | ----------------------------- | --------------------------------------------------------------- |
| **profiles**         | Pas concernée par la refonte  | Aucun - treatments_v2 pointe toujours vers profiles via user_id |
| **user_preferences** | Pas concernée                 | Aucun                                                           |
| **user_roles**       | Pas concernée                 | Aucun                                                           |
| **allergies**        | Pas concernée par medications | Aucun                                                           |
| **navigation_items** | Pas concernée                 | Aucun                                                           |

#### 🗑️ Table OBSOLÈTE (archivée uniquement)

| Table                  | Raison                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| **medication_catalog** | Remplacée par `medication_reference_cache` + intégration API officielle |

### Graphe de Dépendances v2

```
medication_reference_cache (nouvelle)
    ↑
    │ reference_cache_id
    │
medications_v2 ─────────────────┐
    ↑                           │ medication_id
    │ medication_id             │
    │                           ↓
medication_intakes_v2    treatments_v2 ←──┐
                              ↑            │ treatment_id
                              │            │
                         treatment_id  pharmacy_visits_v2
                              │
                              ├─→ prescriptions_v2 ──→ health_professionals_v2
                              │                              (prescribing_doctor_id)
                              ├─→ health_professionals_v2
                              │       (pharmacy_id)
                              └─→ pathologies_v2
                                      (pathology_id via medications_v2)

profiles (conservée v1)
    ↑
    │ user_id
    │
treatments_v2
```

### Script de Duplication Méthodique

**Ordre de création des tables v2 :**

1. **Tables sans FK externes** (feuilles)

   ```sql
   CREATE TABLE pathologies_v2 (COPY FROM pathologies);
   CREATE TABLE health_professionals_v2 (COPY FROM health_professionals);
   CREATE TABLE medication_reference_cache (NOUVELLE);
   ```

2. **Tables avec 1 niveau de FK**

   ```sql
   CREATE TABLE prescriptions_v2 (FK → health_professionals_v2);
   ```

3. **Tables avec 2 niveaux de FK**

   ```sql
   CREATE TABLE treatments_v2 (
     FK → prescriptions_v2,
     FK → health_professionals_v2,
     FK → profiles (v1 conservée)
   );
   ```

4. **Tables avec 3+ niveaux de FK**

   ```sql
   CREATE TABLE medications_v2 (
     FK → treatments_v2,
     FK → pathologies_v2,
     FK → medication_reference_cache
   );

   CREATE TABLE medication_intakes_v2 (FK → medications_v2);
   CREATE TABLE pharmacy_visits_v2 (
     FK → treatments_v2,
     FK → health_professionals_v2
   );
   ```

### Copie des Données (SANS SUPPRESSION)

```sql
-- ÉTAPE 1: Backup complet
CREATE TABLE medications_backup AS SELECT * FROM medications;
CREATE TABLE medication_intakes_backup AS SELECT * FROM medication_intakes;
-- ... etc pour toutes les tables

-- ÉTAPE 2: Copie vers v2 (dans l'ordre des FK)
INSERT INTO pathologies_v2 SELECT * FROM pathologies;
INSERT INTO health_professionals_v2 SELECT * FROM health_professionals;
INSERT INTO prescriptions_v2 SELECT * FROM prescriptions; -- Mise à jour FK vers health_professionals_v2
INSERT INTO treatments_v2 SELECT * FROM treatments; -- Mise à jour FK
INSERT INTO medications_v2 SELECT ... FROM medications; -- Mapping complexe (nouveaux champs)
INSERT INTO medication_intakes_v2 SELECT * FROM medication_intakes;
INSERT INTO pharmacy_visits_v2 SELECT * FROM pharmacy_visits;

-- ÉTAPE 3: Validation intégrité
SELECT COUNT(*) FROM medications = SELECT COUNT(*) FROM medications_v2;
-- ... etc
```

### Bascule du Code Frontend

**Stratégie :**

1. **Pointer toutes les queries vers tables v2**
   - `supabase.from('medications')` → `supabase.from('medications_v2')`
   - `supabase.from('treatments')` → `supabase.from('treatments_v2')`
   - etc.

2. **Tester exhaustivement** avec données v2

3. **Rollback possible instantané** :
   - Revert code pour pointer vers tables v1
   - Tables v1 intactes, fonctionnalité restaurée

4. **Purge v1 uniquement après validation complète** (semaines/mois plus tard)

### Estimation Volumétrie

**Tables v2 créées :** 7 tables  
**Nouvelle table :** 1 table (medication_reference_cache)  
**Tables archivées :** 1 table (medication_catalog)  
**Tables conservées v1 :** 5 tables (profiles, user_preferences, user_roles, allergies, navigation_items)

**Impact BDD :**

- Duplication temporaire : ~2x espace disque (le temps de la migration)
- Après purge v1 : espace identique + medication_reference_cache

---

## 🏗️ Architecture Proposée

### Option 1: Hybrid Model (RECOMMANDÉ)

#### Nouvelle Table: `medication_reference_cache`

Table de **cache local** des fiches médicaments officielles récupérées via API.

```sql
CREATE TABLE medication_reference_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiants officiels
  cis_code TEXT UNIQUE NOT NULL, -- Code CIS (base médicaments.gouv.fr)
  cis13_code TEXT, -- Code DataMatrix (13 chiffres)

  -- Données officielles (non modifiables par utilisateur)
  official_name TEXT NOT NULL, -- Nom officiel du médicament
  strength TEXT, -- Dosage (ex: "5mg/1000mg")
  pharmaceutical_form TEXT, -- Forme (comprimé, gélule, sirop, etc.)
  administration_route TEXT, -- Voie d'administration
  atc_code TEXT, -- Code ATC (classification thérapeutique)

  -- Données complémentaires officielles
  marketing_authorization_holder TEXT, -- Titulaire AMM
  marketing_status TEXT, -- Statut commercialisation
  marketing_authorization_date DATE, -- Date AMM

  -- Cache des données brutes API (JSONB pour flexibilité)
  official_data JSONB, -- Toutes les données API brutes

  -- Métadonnées cache
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  cache_source TEXT, -- 'api', 'datamatrix', 'manual'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherches rapides
CREATE INDEX idx_med_ref_cis ON medication_reference_cache(cis_code);
CREATE INDEX idx_med_ref_name ON medication_reference_cache(official_name);
CREATE INDEX idx_med_ref_atc ON medication_reference_cache(atc_code);

-- RLS: Lecture publique, écriture système uniquement
ALTER TABLE medication_reference_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read medication reference"
  ON medication_reference_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only system can write medication reference"
  ON medication_reference_cache FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Uniquement via Edge Functions
```

#### Table `medications` Refondée

Combine **données officielles** (readonly) + **personnalisation utilisateur** (editable).

```sql
CREATE TABLE medications_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,

  -- ============================================
  -- PARTIE 1: LIEN VERS DONNÉES OFFICIELLES
  -- ============================================
  reference_cache_id UUID REFERENCES medication_reference_cache(id), -- Peut être NULL si médicament custom

  -- Copie locale des champs essentiels (pour offline + performance)
  official_name TEXT, -- Copié depuis reference_cache
  official_strength TEXT, -- Copié depuis reference_cache
  pharmaceutical_form TEXT, -- Copié depuis reference_cache
  cis_code TEXT, -- Copié depuis reference_cache

  -- ============================================
  -- PARTIE 2: PERSONNALISATION UTILISATEUR
  -- ============================================

  -- Nom personnalisé (si l'utilisateur veut renommer)
  user_name TEXT, -- Ex: "Mon Doliprane" au lieu de "PARACETAMOL 1000MG"

  -- Association pathologie (pour CE traitement spécifiquement)
  pathology_id UUID REFERENCES pathologies(id),

  -- Posologie et horaires
  posology TEXT NOT NULL, -- Saisie langage naturel: "1 le matin et le soir"
  times TEXT[] NOT NULL, -- Horaires calculés: ["08:00", "20:00"]
  units_per_take INTEGER DEFAULT 1, -- Nombre d'unités par prise

  -- Gestion des stocks
  initial_stock INTEGER DEFAULT 0, -- Stock initial à l'ajout
  current_stock INTEGER DEFAULT 0, -- Stock actuel (décrémenté automatiquement)
  min_threshold INTEGER DEFAULT 10, -- Seuil d'alerte
  expiry_date DATE, -- Date de péremption de la boîte actuelle
  batch_number TEXT, -- Numéro de lot (optionnel)

  -- Informations complémentaires utilisateur
  user_notes TEXT, -- Ex: "À prendre après repas"
  photo_url TEXT, -- Photo de la boîte (optionnel)

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT valid_stock CHECK (current_stock >= 0),
  CONSTRAINT valid_threshold CHECK (min_threshold >= 0)
);

-- Index pour performance
CREATE INDEX idx_medications_v2_treatment ON medications_v2(treatment_id);
CREATE INDEX idx_medications_v2_reference ON medications_v2(reference_cache_id);
CREATE INDEX idx_medications_v2_pathology ON medications_v2(pathology_id);

-- Trigger pour auto-décrémentation stock (lors de prise validée)
CREATE OR REPLACE FUNCTION auto_decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' AND OLD.status = 'pending' THEN
    UPDATE medications_v2
    SET current_stock = GREATEST(current_stock -
      (SELECT units_per_take FROM medications_v2 WHERE id = NEW.medication_id), 0
    )
    WHERE id = NEW.medication_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medication_intakes_decrement_stock
AFTER UPDATE ON medication_intakes
FOR EACH ROW
EXECUTE FUNCTION auto_decrement_stock();

-- RLS identique à l'existant
ALTER TABLE medications_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications"
  ON medications_v2 FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM treatments
      WHERE treatments.id = medications_v2.treatment_id
      AND treatments.user_id = (SELECT auth.uid())
    )
  );

-- Autres policies (INSERT, UPDATE, DELETE) similaires
```

### Workflow d'Ajout d'un Médicament

#### Scénario 1: Via QR Code DataMatrix

```
1. User scanne le DataMatrix sur la boîte
   └─> Contient: CIS13, lot, péremption, etc.

2. Edge Function /api/medications/datamatrix
   └─> Parse le DataMatrix
   └─> Extrait le code CIS
   └─> Appelle API officielle si besoin
   └─> Insère/met à jour dans medication_reference_cache

3. Frontend reçoit la fiche complète
   └─> Pré-remplit: nom, dosage, forme
   └─> User complète: pathologie, posologie, stock, seuil

4. Insertion dans medications_v2
   └─> reference_cache_id = l'ID du cache
   └─> Champs officiels copiés
   └─> Champs user saisis
```

#### Scénario 2: Via Recherche Manuelle

```
1. User tape "xigduo" dans la recherche

2. Edge Function /api/medications/search?q=xigduo
   └─> Appelle API officielle
   └─> Retourne liste de résultats

3. User sélectionne "XIGDUO 5mg/1000mg"

4. Edge Function /api/medications/cis/:code
   └─> Récupère fiche détaillée
   └─> Insère/met à jour dans medication_reference_cache

5. Frontend reçoit la fiche complète
   └─> Même workflow que QR Code pour la suite
```

#### Scénario 3: Médicament Custom (fallback)

```
1. User ne trouve pas son médicament

2. Clique "Ajouter manuellement"

3. Formulaire complet à remplir
   └─> Nom, forme, dosage, pathologie, posologie, stock, seuil

4. Insertion dans medications_v2
   └─> reference_cache_id = NULL (médicament custom)
   └─> Tous les champs saisis manuellement
```

### API Officielle Recommandée

**Base de Données Publique des Médicaments (Santé.fr)**

- **URL base** : https://www.data.gouv.fr/reuses/api-rest-base-de-donnees-publique-des-medicaments/
- **Documentation** : https://base-donnees-publique.medicaments.gouv.fr/docs
- **⚠️ Endpoints à identifier** :
  - Recherche par nom : URL exacte à déterminer
  - Fiche détaillée par code CIS : URL exacte à déterminer
  - Parse DataMatrix (code 13 chiffres) : URL exacte à déterminer
- **Note** : L'API officielle existe mais les endpoints précis nécessitent une analyse approfondie de la documentation
- Données: Nom, dosage, forme, AMM, prix, RCP, notice, etc.
- Gratuite et officielle (ANSM)

---

## 📅 Plan de Migration Détaillé

### 🚨 ÉTAPE OBLIGATOIRE PRÉALABLE

**IMPÉRATIF** : Avant toute modification, créer une nouvelle branche Git et utiliser de NOUVELLES tables pour préserver l'historique utilisateur existant.

#### Pourquoi ?

- **Préservation des données** : Ne pas perdre l'historique actuel des utilisateurs
- **Migration sécurisée** : Copier méthodiquement les données existantes dans le nouveau système
- **Rollback possible** : Possibilité de revenir en arrière si problème

#### Action Préalable

1. **Créer branche dédiée** : `feature/medication-refactor-v2`

   ```bash
   git checkout -b feature/medication-refactor-v2
   ```

2. **Nouvelles tables à créer** :
   - `medication_reference_cache` (nouvelle)
   - `medications_v2` (nouvelle version avec nouveau schéma)
   - `medication_intakes_v2` (liée à medications_v2)

3. **Migration des données** :
   - Script de **copie** depuis `medications` → `medications_v2`
   - Script de **copie** depuis `medication_intakes` → `medication_intakes_v2`
   - Mapping des anciennes données vers nouveau format
   - Préservation complète de l'historique utilisateur

4. **Bascule progressive** :
   - Phase de test avec nouvelles tables
   - Validation par utilisateurs
   - Archivage anciennes tables uniquement après validation complète
   - **NE JAMAIS supprimer** les anciennes tables (archivage uniquement)

---

### Phase 1: Infrastructure API (2-3 jours)

#### 1.1 Créer Table `medication_reference_cache`

```sql
-- Migration: 20250103_create_medication_reference_cache.sql
-- Voir schéma détaillé ci-dessus (NOUVELLE table)
```

#### 1.2 Installer Dépendances pour QR Code

```bash
# Installer @zxing/library pour le scan DataMatrix
npm install @zxing/library

# Alternative plus légère (si besoin)
# npm install html5-qrcode
```

#### 1.3 Créer Edge Functions

**Edge Function: `medication-search`**

```typescript
// supabase/functions/medication-search/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { searchTerm } = await req.json()

  // 1. Chercher d'abord dans le cache local
  const supabase = createClient(...)
  const { data: cached } = await supabase
    .from('medication_reference_cache')
    .select('*')
    .ilike('official_name', `%${searchTerm}%`)
    .limit(10)

  if (cached && cached.length > 0) {
    return new Response(JSON.stringify({ source: 'cache', results: cached }))
  }

  // 2. Sinon, appeler l'API officielle (⚠️ URL exacte à déterminer)
  const apiResponse = await fetch(
    `https://[API_URL_TO_DETERMINE]/search?nom=${searchTerm}`
  )
  const apiData = await apiResponse.json()

  // 3. Insérer dans le cache pour prochaine fois
  for (const med of apiData.results) {
    await supabase.from('medication_reference_cache').upsert({
      cis_code: med.cis,
      official_name: med.denomination,
      strength: med.dosage,
      pharmaceutical_form: med.forme,
      official_data: med,
      cache_source: 'api',
      last_synced_at: new Date().toISOString()
    }, { onConflict: 'cis_code' })
  }

  return new Response(JSON.stringify({ source: 'api', results: apiData.results }))
})
```

**Edge Function: `medication-details`**

```typescript
// supabase/functions/medication-details/index.ts
// Récupère fiche détaillée par code CIS
// Logique similaire: cache d'abord, puis API si manquant
```

**Edge Function: `medication-datamatrix`**

```typescript
// supabase/functions/medication-datamatrix/index.ts
// Parse le code DataMatrix scanné (via @zxing/library côté frontend)
// Extrait CIS13, lot, péremption
// Appelle API officielle pour récupérer la fiche complète
```

#### 1.4 Tests Edge Functions

- Tests unitaires avec Deno
- Tests d'intégration avec vraie API
- Mock de l'API pour tests offline

### Phase 2: Création de TOUTES les Tables v2 (2-3 jours)

#### 2.1 Créer TOUTES les Nouvelles Tables v2 (ne JAMAIS toucher aux existantes)

**Ordre de création (respecter les dépendances FK) :**

```sql
-- Migration: 20250104_create_all_v2_tables.sql

-- ⚠️ AUCUNE modification des tables existantes
-- On crée uniquement de nouvelles tables _v2

-- ==============================================
-- NIVEAU 1: Tables sans FK externes (feuilles)
-- ==============================================

-- 1.1 Pathologies v2 (structure identique)
CREATE TABLE pathologies_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pathologies_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies de pathologies)

-- 1.2 Health Professionals v2 (structure identique)
CREATE TABLE health_professionals_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- FK vers profiles (v1 conservée)
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  email TEXT,
  phone TEXT,
  street_address TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  is_primary_doctor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_professionals_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies)

-- ==============================================
-- NIVEAU 2: Tables avec 1 niveau de FK
-- ==============================================

-- 2.1 Prescriptions v2 (structure identique, FK updated)
CREATE TABLE prescriptions_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- FK vers profiles (v1)
  prescription_date DATE NOT NULL,
  prescribing_doctor_id UUID REFERENCES health_professionals_v2(id), -- FK v2!
  duration_days INTEGER NOT NULL DEFAULT 90,
  notes TEXT,
  document_url TEXT,
  file_path TEXT,
  original_filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prescriptions_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies)

-- ==============================================
-- NIVEAU 3: Tables avec 2 niveaux de FK
-- ==============================================

-- 3.1 Treatments v2 (structure identique, FK updated)
CREATE TABLE treatments_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- FK vers profiles (v1)
  prescription_id UUID NOT NULL REFERENCES prescriptions_v2(id), -- FK v2!
  name TEXT NOT NULL,
  pathology TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  pharmacy_id UUID REFERENCES health_professionals_v2(id), -- FK v2!
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treatments_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies)

-- ==============================================
-- NIVEAU 4: Tables avec 3+ niveaux de FK
-- ==============================================

-- 4.1 Medications v2 (NOUVELLE structure enrichie)
CREATE TABLE medications_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES treatments_v2(id) ON DELETE CASCADE, -- FK v2!

  -- Lien vers cache API officielle
  reference_cache_id UUID REFERENCES medication_reference_cache(id),

  -- Copie locale des champs officiels (pour offline)
  official_name TEXT,
  official_strength TEXT,
  pharmaceutical_form TEXT,
  cis_code TEXT,

  -- Personnalisation utilisateur
  user_name TEXT, -- Nom custom si différent
  pathology_id UUID REFERENCES pathologies_v2(id), -- FK v2!
  posology TEXT NOT NULL,
  times TEXT[] NOT NULL,
  units_per_take INTEGER DEFAULT 1,

  -- Gestion stocks
  initial_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_threshold INTEGER DEFAULT 10,
  expiry_date DATE,
  batch_number TEXT,

  -- Informations complémentaires
  user_notes TEXT,
  photo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_stock CHECK (current_stock >= 0),
  CONSTRAINT valid_threshold CHECK (min_threshold >= 0)
);

-- Indexes
CREATE INDEX idx_medications_v2_treatment ON medications_v2(treatment_id);
CREATE INDEX idx_medications_v2_reference ON medications_v2(reference_cache_id);
CREATE INDEX idx_medications_v2_pathology ON medications_v2(pathology_id);

ALTER TABLE medications_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies)

-- 4.2 Medication Intakes v2 (structure identique, FK updated)
CREATE TABLE medication_intakes_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications_v2(id) ON DELETE CASCADE, -- FK v2!
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(medication_id, scheduled_time)
);

CREATE INDEX idx_medication_intakes_v2_medication ON medication_intakes_v2(medication_id);
CREATE INDEX idx_medication_intakes_v2_scheduled ON medication_intakes_v2(scheduled_time);

ALTER TABLE medication_intakes_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies)

-- 4.3 Pharmacy Visits v2 (structure identique, FK updated)
CREATE TABLE pharmacy_visits_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id UUID NOT NULL REFERENCES treatments_v2(id) ON DELETE CASCADE, -- FK v2!
  pharmacy_id UUID REFERENCES health_professionals_v2(id), -- FK v2!
  visit_date DATE NOT NULL,
  actual_visit_date DATE,
  visit_number INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pharmacy_visits_v2 ENABLE ROW LEVEL SECURITY;
-- (Copier toutes les RLS policies)

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Trigger pour auto-décrémentation stock
CREATE OR REPLACE FUNCTION auto_decrement_stock_v2()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' AND OLD.status = 'pending' THEN
    UPDATE medications_v2
    SET current_stock = GREATEST(current_stock -
      (SELECT units_per_take FROM medications_v2 WHERE id = NEW.medication_id), 0
    )
    WHERE id = NEW.medication_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medication_intakes_v2_decrement_stock
AFTER UPDATE ON medication_intakes_v2
FOR EACH ROW
EXECUTE FUNCTION auto_decrement_stock_v2();

-- Triggers updated_at pour toutes les tables v2
CREATE TRIGGER update_pathologies_v2_updated_at
  BEFORE UPDATE ON pathologies_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_professionals_v2_updated_at
  BEFORE UPDATE ON health_professionals_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_v2_updated_at
  BEFORE UPDATE ON prescriptions_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_v2_updated_at
  BEFORE UPDATE ON treatments_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_v2_updated_at
  BEFORE UPDATE ON medications_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_intakes_v2_updated_at
  BEFORE UPDATE ON medication_intakes_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_visits_v2_updated_at
  BEFORE UPDATE ON pharmacy_visits_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour régénération intakes (si times change)
CREATE TRIGGER medication_v2_times_changed
  AFTER INSERT OR UPDATE OF times ON medications_v2
  FOR EACH ROW
  EXECUTE FUNCTION auto_regenerate_intakes_on_times_change();
```

#### 2.2 Validation Création Tables

```sql
-- Vérifier que toutes les tables v2 ont été créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%_v2'
ORDER BY table_name;

-- Résultat attendu:
-- health_professionals_v2
-- medication_intakes_v2
-- medications_v2
-- pathologies_v2
-- pharmacy_visits_v2
-- prescriptions_v2
-- treatments_v2
```

#### 2.3 Script de COPIE Méthodique de TOUTES les Données

```sql
-- Migration: 20250105_copy_all_data_to_v2.sql

-- ==============================================
-- BACKUPS COMPLETS (sécurité absolue)
-- ==============================================

CREATE TABLE pathologies_backup AS SELECT * FROM pathologies;
CREATE TABLE health_professionals_backup AS SELECT * FROM health_professionals;
CREATE TABLE prescriptions_backup AS SELECT * FROM prescriptions;
CREATE TABLE treatments_backup AS SELECT * FROM treatments;
CREATE TABLE medications_backup AS SELECT * FROM medications;
CREATE TABLE medication_intakes_backup AS SELECT * FROM medication_intakes;
CREATE TABLE pharmacy_visits_backup AS SELECT * FROM pharmacy_visits;
CREATE TABLE medication_catalog_backup AS SELECT * FROM medication_catalog;

-- ==============================================
-- COPIE NIVEAU 1: Tables sans FK externes
-- ==============================================

-- 1.1 Copie pathologies → pathologies_v2 (copie directe)
INSERT INTO pathologies_v2 (id, name, description, created_by, is_approved, created_at, updated_at)
SELECT id, name, description, created_by, is_approved, created_at, updated_at
FROM pathologies;

-- 1.2 Copie health_professionals → health_professionals_v2 (copie directe)
INSERT INTO health_professionals_v2 (
  id, user_id, type, name, specialty, email, phone,
  street_address, postal_code, city, is_primary_doctor,
  created_at, updated_at
)
SELECT
  id, user_id, type, name, specialty, email, phone,
  street_address, postal_code, city, is_primary_doctor,
  created_at, updated_at
FROM health_professionals;

-- ==============================================
-- COPIE NIVEAU 2: Tables avec 1 niveau de FK
-- ==============================================

-- 2.1 Copie prescriptions → prescriptions_v2 (FK vers health_professionals_v2)
INSERT INTO prescriptions_v2 (
  id, user_id, prescription_date, prescribing_doctor_id,
  duration_days, notes, document_url, file_path, original_filename,
  created_at, updated_at
)
SELECT
  id, user_id, prescription_date, prescribing_doctor_id, -- FK reste valide car mêmes IDs
  duration_days, notes, document_url, file_path, original_filename,
  created_at, updated_at
FROM prescriptions;

-- ==============================================
-- COPIE NIVEAU 3: Tables avec 2 niveaux de FK
-- ==============================================

-- 3.1 Copie treatments → treatments_v2 (FK vers prescriptions_v2, health_professionals_v2)
INSERT INTO treatments_v2 (
  id, user_id, prescription_id, name, pathology, description,
  start_date, end_date, is_active, pharmacy_id, notes,
  created_at, updated_at
)
SELECT
  id, user_id, prescription_id, name, pathology, description, -- FK restent valides
  start_date, end_date, is_active, pharmacy_id, notes,
  created_at, updated_at
FROM treatments;

-- ==============================================
-- COPIE NIVEAU 4: Tables avec 3+ niveaux de FK
-- ==============================================

-- 4.1 Copie medications → medications_v2 (mapping complexe avec nouveaux champs)
INSERT INTO medications_v2 (
  id,
  treatment_id,
  reference_cache_id, -- NULL pour l'instant (à matcher avec API plus tard)
  official_name,
  official_strength,
  pharmaceutical_form,
  cis_code,
  user_name,
  pathology_id,
  posology,
  times,
  units_per_take,
  initial_stock,
  current_stock,
  min_threshold,
  expiry_date,
  batch_number,
  user_notes,
  photo_url,
  created_at,
  updated_at
)
SELECT
  m.id,
  m.treatment_id, -- FK vers treatments_v2 (mêmes IDs)
  NULL as reference_cache_id, -- À matcher avec API officielle dans étape suivante

  -- Données officielles (depuis catalog si dispo, sinon depuis medications)
  COALESCE(mc.name, m.name) as official_name,
  COALESCE(mc.strength, m.strength) as official_strength,
  mc.form as pharmaceutical_form, -- Nouveau champ
  NULL as cis_code, -- Nouveau champ (à récupérer via API)

  -- Si le nom dans medications diffère du catalog, on le garde en user_name
  CASE
    WHEN m.name != mc.name THEN m.name
    ELSE NULL
  END as user_name,

  -- Pathologie (essayer d'abord pathology_id, sinon créer depuis pathology text)
  mc.pathology_id,

  -- Posologie et horaires
  m.posology,
  m.times,
  1 as units_per_take, -- Default (nouveau champ)

  -- Stocks
  m.initial_stock,
  m.current_stock,
  m.min_threshold,
  m.expiry_date,
  NULL as batch_number, -- Nouveau champ

  -- Notes (vide pour l'instant)
  NULL as user_notes, -- Nouveau champ
  NULL as photo_url, -- Nouveau champ

  m.created_at,
  m.updated_at
FROM medications m
LEFT JOIN medication_catalog mc ON m.catalog_id = mc.id;

-- 4.2 Copie medication_intakes → medication_intakes_v2 (copie directe avec FK mise à jour)
INSERT INTO medication_intakes_v2 (
  id, medication_id, scheduled_time, taken_at, status, notes,
  created_at, updated_at
)
SELECT
  id, medication_id, scheduled_time, taken_at, status, notes, -- FK reste valide
  created_at, updated_at
FROM medication_intakes;

-- 4.3 Copie pharmacy_visits → pharmacy_visits_v2 (FK vers treatments_v2, health_professionals_v2)
INSERT INTO pharmacy_visits_v2 (
  id, treatment_id, pharmacy_id, visit_date, actual_visit_date,
  visit_number, is_completed, notes, created_at, updated_at
)
SELECT
  id, treatment_id, pharmacy_id, visit_date, actual_visit_date, -- FK restent valides
  visit_number, is_completed, notes, created_at, updated_at
FROM pharmacy_visits;

-- ==============================================
-- POST-COPIE: Gérer les pathologies TEXT manquantes
-- ==============================================

-- Créer les entrées manquantes dans pathologies_v2 depuis medication_catalog
INSERT INTO pathologies_v2 (name, created_by, is_approved)
SELECT DISTINCT
  mc.pathology,
  mc.created_by,
  mc.is_approved
FROM medication_catalog mc
WHERE mc.pathology IS NOT NULL
  AND mc.pathology_id IS NULL
  AND mc.pathology NOT IN (SELECT name FROM pathologies_v2)
ON CONFLICT DO NOTHING;

-- Mettre à jour pathology_id dans medications_v2 pour les médicaments qui n'en avaient pas
UPDATE medications_v2 m
SET pathology_id = p.id
FROM pathologies_v2 p, medication_catalog mc
WHERE m.pathology_id IS NULL
  AND m.official_name = mc.name
  AND mc.pathology = p.name;
```

#### 2.4 Validation Intégrité Données Copiées

```sql
-- Validation: 20250105_validate_copied_data.sql

-- ==============================================
-- VALIDATION COUNTS (TOUTES LES TABLES)
-- ==============================================

-- Pathologies
SELECT
  'pathologies' as table_name,
  (SELECT COUNT(*) FROM pathologies) as v1_count,
  (SELECT COUNT(*) FROM pathologies_v2) as v2_count,
  (SELECT COUNT(*) FROM pathologies) - (SELECT COUNT(*) FROM pathologies_v2) as difference;

-- Health Professionals
SELECT
  'health_professionals' as table_name,
  (SELECT COUNT(*) FROM health_professionals) as v1_count,
  (SELECT COUNT(*) FROM health_professionals_v2) as v2_count,
  (SELECT COUNT(*) FROM health_professionals) - (SELECT COUNT(*) FROM health_professionals_v2) as difference;

-- Prescriptions
SELECT
  'prescriptions' as table_name,
  (SELECT COUNT(*) FROM prescriptions) as v1_count,
  (SELECT COUNT(*) FROM prescriptions_v2) as v2_count,
  (SELECT COUNT(*) FROM prescriptions) - (SELECT COUNT(*) FROM prescriptions_v2) as difference;

-- Treatments
SELECT
  'treatments' as table_name,
  (SELECT COUNT(*) FROM treatments) as v1_count,
  (SELECT COUNT(*) FROM treatments_v2) as v2_count,
  (SELECT COUNT(*) FROM treatments) - (SELECT COUNT(*) FROM treatments_v2) as difference;

-- Medications (la plus critique)
SELECT
  'medications' as table_name,
  (SELECT COUNT(*) FROM medications) as v1_count,
  (SELECT COUNT(*) FROM medications_v2) as v2_count,
  (SELECT COUNT(*) FROM medications) - (SELECT COUNT(*) FROM medications_v2) as difference;

-- Medication Intakes
SELECT
  'medication_intakes' as table_name,
  (SELECT COUNT(*) FROM medication_intakes) as v1_count,
  (SELECT COUNT(*) FROM medication_intakes_v2) as v2_count,
  (SELECT COUNT(*) FROM medication_intakes) - (SELECT COUNT(*) FROM medication_intakes_v2) as difference;

-- Pharmacy Visits
SELECT
  'pharmacy_visits' as table_name,
  (SELECT COUNT(*) FROM pharmacy_visits) as v1_count,
  (SELECT COUNT(*) FROM pharmacy_visits_v2) as v2_count,
  (SELECT COUNT(*) FROM pharmacy_visits) - (SELECT COUNT(*) FROM pharmacy_visits_v2) as difference;

-- ==============================================
-- VALIDATION FK INTEGRITY
-- ==============================================

-- Vérifier aucun treatment_id cassé dans medications_v2
SELECT 'medications_v2 broken treatment_id' as check_name, COUNT(*) as broken_count
FROM medications_v2 m
LEFT JOIN treatments_v2 t ON m.treatment_id = t.id
WHERE t.id IS NULL;

-- Vérifier aucun medication_id cassé dans medication_intakes_v2
SELECT 'medication_intakes_v2 broken medication_id' as check_name, COUNT(*) as broken_count
FROM medication_intakes_v2 mi
LEFT JOIN medications_v2 m ON mi.medication_id = m.id
WHERE m.id IS NULL;

-- Vérifier aucun prescription_id cassé dans treatments_v2
SELECT 'treatments_v2 broken prescription_id' as check_name, COUNT(*) as broken_count
FROM treatments_v2 t
LEFT JOIN prescriptions_v2 p ON t.prescription_id = p.id
WHERE p.id IS NULL;

-- ==============================================
-- VALIDATION STOCKS
-- ==============================================

-- Vérifier que les stocks sont identiques
SELECT
  'Stock validation' as check_name,
  SUM(m.current_stock) as v1_total_stock,
  SUM(m2.current_stock) as v2_total_stock,
  SUM(m.current_stock) - SUM(m2.current_stock) as difference
FROM medications m
JOIN medications_v2 m2 ON m.id = m2.id;

-- ==============================================
-- VALIDATION UTILISATEURS
-- ==============================================

-- Vérifier que tous les users ont bien leurs données
SELECT
  u.id as user_id,
  u.full_name,
  (SELECT COUNT(*) FROM treatments WHERE user_id = u.id) as v1_treatments,
  (SELECT COUNT(*) FROM treatments_v2 WHERE user_id = u.id) as v2_treatments
FROM profiles u
WHERE EXISTS (SELECT 1 FROM treatments WHERE user_id = u.id);

-- ⚠️ Si toutes les validations retournent 0 pour "difference" et "broken_count",
-- la copie est réussie à 100%
```

#### 2.5 Basculer vers les Nouvelles Tables (SANS supprimer les anciennes)

```sql
-- Une fois validation OK, basculer le code pour pointer vers les nouvelles tables
-- Les anciennes tables restent en place (archivage) pour rollback possible

-- ⚠️ NE PAS FAIRE DE RENAME DE TABLES
-- Le code frontend pointera directement vers medications_v2 et medication_intakes_v2

-- Recréer les index et triggers sur les nouvelles tables
-- (Déjà fait dans le schéma medications_v2)
```

### Phase 3: Adapter le Frontend (3-4 jours)

#### 3.1 Pointer vers les NOUVELLES tables v2

**IMPORTANT** : Tout le code frontend doit maintenant pointer vers `medications_v2` et `medication_intakes_v2` au lieu des anciennes tables.

#### 3.2 Refonte `useStep2Medications` Hook

**AVANT:**

```typescript
// Logique complexe avec catalog + custom
const loadCatalog = async () => {
  const { data } = await supabase.from("medication_catalog").select("*");
  setCatalog(data || []);
};

const addMedicationFromCatalog = (med: CatalogMedication) => {
  // Copie les données du catalog vers formData.medications
};

const addCustomMedication = () => {
  // Crée d'abord dans medication_catalog
  // Puis ajoute dans formData.medications
};
```

**APRÈS:**

```typescript
// Logique simplifiée avec API
const searchMedications = async (query: string) => {
  const { data } = await supabase.functions.invoke("medication-search", {
    body: { searchTerm: query },
  });
  return data.results;
};

const getMedicationDetails = async (cisCode: string) => {
  const { data } = await supabase.functions.invoke("medication-details", {
    body: { cisCode },
  });
  return data;
};

const scanDataMatrix = async (dataMatrixCode: string) => {
  const { data } = await supabase.functions.invoke("medication-datamatrix", {
    body: { dataMatrixCode },
  });
  return data;
};

const addMedication = (officialData: any, userInputs: any) => {
  // Combine données officielles + saisie utilisateur
  formData.medications.push({
    reference_cache_id: officialData.id,
    official_name: officialData.official_name,
    official_strength: officialData.strength,
    pharmaceutical_form: officialData.pharmaceutical_form,
    ...userInputs, // pathology, posology, times, stock, threshold
  });
};
```

#### 3.3 Nouveau Composant `MedicationSearchDialog`

```typescript
// src/components/TreatmentWizard/components/MedicationSearchDialog.tsx
export const MedicationSearchDialog = ({ onSelect }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const data = await searchMedications(query)
    setResults(data)
    setLoading(false)
  }

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechercher un médicament</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom du médicament..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />

          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </Button>

          {/* Résultats */}
          <ScrollArea className="h-[400px]">
            {results.map((med) => (
              <Card key={med.cis_code} onClick={() => onSelect(med)}>
                <CardHeader>
                  <CardTitle>{med.official_name}</CardTitle>
                  <CardDescription>
                    {med.strength} - {med.pharmaceutical_form}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### 3.4 Nouveau Composant `QRCodeScanner`

```typescript
// src/components/TreatmentWizard/components/QRCodeScanner.tsx
import { Camera } from '@capacitor/camera'
import { BrowserMultiFormatReader } from '@zxing/library'

export const QRCodeScanner = ({ onScan }) => {
  const startScan = async () => {
    // Utilisation de @zxing/library pour le scan DataMatrix
    const codeReader = new BrowserMultiFormatReader()

    try {
      // Demander permission caméra
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Scanner
      const result = await codeReader.decodeFromVideoDevice(
        undefined, // Default video device
        'video-preview',
        (result, error) => {
          if (result) {
            // Arrêter scan
            codeReader.reset()
            stream.getTracks().forEach(track => track.stop())

            // Envoyer le code scanné à l'Edge Function
            scanDataMatrix(result.getText()).then(onScan)
          }
        }
      )
    } catch (error) {
      console.error('Erreur scan:', error)
    }
  }

  return (
    <div>
      <Button onClick={startScan}>
        <Camera className="mr-2 h-4 w-4" />
        Scanner le code barre
      </Button>
      <video id="video-preview" style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  )
}
```

#### 3.5 Mise à Jour des 17 Fichiers

**Stratégie:**

1. **Pointer vers les nouvelles tables** : `medications` → `medications_v2`, `medication_intakes` → `medication_intakes_v2`
2. Remplacer toutes les références à `catalog_id` par `reference_cache_id`
3. Adapter les queries Supabase pour joindre `medication_reference_cache` si besoin
4. Utiliser les champs `official_*` au lieu des anciens champs
5. Tester chaque composant individuellement

**Exemple: `HistoryMedicationList.tsx`**

**AVANT:**

```typescript
const { data: medications } = await supabase
  .from('medications')
  .select(`
    *,
    catalog:medication_catalog(name, strength)
  `)

// Affichage
<p>{med.catalog?.name} - {med.catalog?.strength}</p>
```

**APRÈS:**

```typescript
const { data: medications } = await supabase
  .from('medications_v2')  // ⚠️ Pointer vers medications_v2
  .select(`
    *,
    reference:medication_reference_cache(official_name, strength)
  `)

// Affichage avec fallback sur champs locaux
<p>
  {med.reference?.official_name || med.official_name} -
  {med.reference?.strength || med.official_strength}
</p>
```

### Phase 4: Cleanup et Archivage (1 jour)

#### 4.1 Archiver les Anciennes Tables (NE PAS SUPPRIMER)

```sql
-- Migration: 20250107_archive_old_tables.sql

-- ⚠️ NE PAS SUPPRIMER les tables, juste les renommer pour archivage

-- Vérifier qu'aucune FK active ne pointe vers ces tables
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as foreign_table
FROM pg_constraint
WHERE confrelid IN ('medication_catalog'::regclass, 'medications'::regclass);

-- Renommer pour archivage (préserver l'historique)
ALTER TABLE medications RENAME TO medications_archived;
ALTER TABLE medication_intakes RENAME TO medication_intakes_archived;
ALTER TABLE medication_catalog RENAME TO medication_catalog_archived;

-- Ajouter commentaire pour documentation
COMMENT ON TABLE medications_archived IS 'Table archivée - Migration vers medications_v2 le 2025-01-XX';
COMMENT ON TABLE medication_intakes_archived IS 'Table archivée - Migration vers medication_intakes_v2 le 2025-01-XX';
COMMENT ON TABLE medication_catalog_archived IS 'Table obsolète - Remplacée par medication_reference_cache';
```

#### 4.2 Supprimer le Code Frontend Obsolète

```bash
# Supprimer le dossier entier
rm -rf src/pages/medication-catalog/

# Supprimer la route dans le router
# Éditer src/App.tsx ou src/router.tsx
# Supprimer la ligne: <Route path="/medication-catalog" element={<MedicationCatalog />} />
```

#### 4.3 Supprimer l'Entrée Menu (si existe)

```sql
-- Supprimer l'entrée "Médicaments" du menu navigation
DELETE FROM navigation_items WHERE path = '/medication-catalog';
```

#### 4.4 Documentation de l'Archivage

```markdown
# Tables Archivées - Migration v2

## Tables concernées

- `medications_archived` (anciennement `medications`)
- `medication_intakes_archived` (anciennement `medication_intakes`)
- `medication_catalog_archived` (anciennement `medication_catalog`)

## Date d'archivage

2025-01-XX

## Raison

Migration vers nouveau système avec:

- `medications_v2` + `medication_intakes_v2` (nouvelles tables utilisateur)
- `medication_reference_cache` (cache API officielle)

## Conservation

Ces tables sont conservées indéfiniment pour:

- Rollback en cas de problème
- Historique et audit
- Référence pour support utilisateur

## ⚠️ NE PAS SUPPRIMER
```

#### 4.5 Nettoyer les Imports

```bash
# Rechercher toutes les références restantes
grep -r "medication_catalog" src/
grep -r "CatalogMedication" src/

# Supprimer les imports inutilisés
```

### Phase 5: Tests et Documentation (1-2 jours)

#### 5.1 Tests E2E

**Test 1: Ajout médicament via recherche**

```typescript
test("User can add medication via search", async () => {
  // 1. Ouvrir wizard traitement
  await page.goto("/treatments/new");

  // 2. Remplir step 1
  await fillStep1();
  await page.click('button:has-text("Suivant")');

  // 3. Cliquer sur "Rechercher un médicament"
  await page.click('button:has-text("Rechercher")');

  // 4. Taper "xigduo" et rechercher
  await page.fill('input[placeholder*="médicament"]', "xigduo");
  await page.press('input[placeholder*="médicament"]', "Enter");

  // 5. Attendre résultats
  await page.waitForSelector("text=XIGDUO");

  // 6. Sélectionner premier résultat
  await page.click("text=XIGDUO >> nth=0");

  // 7. Compléter les champs utilisateur
  await page.fill('input[name="posology"]', "1 matin et soir");
  await page.fill('input[name="initial_stock"]', "60");
  await page.fill('input[name="min_threshold"]', "10");

  // 8. Valider
  await page.click('button:has-text("Ajouter")');

  // 9. Vérifier que le médicament apparaît dans la liste
  await expect(page.locator("text=XIGDUO")).toBeVisible();
});
```

**Test 2: Ajout médicament via QR Code**

```typescript
test("User can add medication via QR scan", async () => {
  // Mock du scanner
  await page.evaluate(() => {
    window.BarcodeScanner = {
      startScan: () =>
        Promise.resolve({
          hasContent: true,
          content: "01234567890123", // Code DataMatrix fictif
        }),
    };
  });

  // 1. Ouvrir wizard
  await page.goto("/treatments/new/step2");

  // 2. Cliquer sur "Scanner"
  await page.click('button:has-text("Scanner")');

  // 3. Vérifier que les données sont pré-remplies
  await expect(page.locator('input[name="official_name"]')).toHaveValue(
    /XIGDUO/i,
  );

  // 4. Compléter et valider
  // ... (suite identique au test 1)
});
```

**Test 3: Vérifier aucune régression sur prises médicaments**

```typescript
test("Medication intakes still work correctly", async () => {
  // 1. Créer un traitement avec médicaments
  const treatment = await createTestTreatment();

  // 2. Aller sur la page de prise
  await page.goto("/");

  // 3. Vérifier que les prises apparaissent
  await expect(page.locator('[data-testid="medication-intake"]')).toHaveCount(
    2,
  );

  // 4. Valider une prise
  await page.click('[data-testid="validate-intake"]');

  // 5. Vérifier que le stock a été décrémenté
  const { data } = await supabase
    .from("medications")
    .select("current_stock")
    .eq("id", treatment.medication_id)
    .single();

  expect(data.current_stock).toBe(59); // 60 - 1
});
```

**Test 4: Vérifier alertes stocks**

```typescript
test("Stock alerts work correctly", async () => {
  // 1. Créer un médicament avec stock faible
  const med = await createMedication({ current_stock: 5, min_threshold: 10 });

  // 2. Aller sur la page stocks
  await page.goto("/stocks");

  // 3. Vérifier que l'alerte apparaît
  await expect(page.locator('[data-testid="stock-alert"]')).toBeVisible();
  await expect(page.locator("text=/stock faible/i")).toBeVisible();
});
```

#### 5.2 Tests Unitaires

**Test Edge Function: `medication-search`**

```typescript
Deno.test("medication-search returns cached results first", async () => {
  // Mock Supabase
  const mockSupabase = {
    from: () => ({
      select: () => ({
        ilike: () => ({
          limit: () =>
            Promise.resolve({
              data: [{ official_name: "XIGDUO", cis_code: "12345" }],
            }),
        }),
      }),
    }),
  };

  // Mock fetch (ne devrait pas être appelé)
  const fetchCalled = false;

  // Appeler la fonction
  const response = await handler(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ searchTerm: "xigduo" }),
    }),
  );

  const data = await response.json();

  assertEquals(data.source, "cache");
  assertEquals(data.results.length, 1);
  assertEquals(fetchCalled, false); // Fetch ne doit pas être appelé
});
```

#### 5.3 Documentation

**Créer CR Final**

```markdown
# CR - Refonte Système Médicaments - Phase 8

## Résumé

Refonte complète du système de gestion des médicaments avec:

- Suppression de `medication_catalog`
- Intégration API officielle
- Support QR Code DataMatrix
- Cache local `medication_reference_cache`
- Table `medications` refondée

## Changements Techniques

- 3 nouvelles Edge Functions
- 2 nouvelles tables (reference_cache, medications_v2)
- 1 table supprimée (medication_catalog)
- 17 fichiers frontend refactorés

## Migration Données

- 100% des données migrées avec succès
- Aucune perte de données
- Stocks conservés
- Relations préservées

## Tests

- 15 tests E2E passés ✅
- 8 tests unitaires passés ✅
- Performance: Recherche <500ms
- Offline mode: OK

## Documentation

- Guide utilisateur mis à jour
- Guide développeur créé
- API documentation complète
```

**Mettre à Jour Guide Utilisateur**

```markdown
# Guide Utilisateur - Ajout de Médicaments

## Nouvelle Fonctionnalité: Recherche Intelligente

Vous pouvez maintenant ajouter des médicaments de 3 façons:

### 1. Scanner le code-barre (Recommandé)

1. Cliquez sur "Scanner le code-barre"
2. Pointez votre caméra vers le DataMatrix sur la boîte
3. Les informations sont automatiquement remplies
4. Complétez juste la posologie et le stock

### 2. Rechercher par nom

1. Cliquez sur "Rechercher un médicament"
2. Tapez le nom (ex: "xigduo")
3. Sélectionnez dans la liste officielle
4. Complétez la posologie et le stock

### 3. Saisie manuelle (si médicament introuvable)

1. Cliquez sur "Ajouter manuellement"
2. Remplissez tous les champs
3. Validez
```

---

## 📈 Impact et Bénéfices

### Bénéfices Utilisateur

#### ✅ Saisie Plus Rapide

- **Avant:** 2-3 minutes pour ajouter un médicament (saisie manuelle complète)
- **Après:** 30 secondes avec QR Code, 1 minute avec recherche
- **Gain:** 50-80% de temps économisé

#### ✅ Données Plus Fiables

- **Avant:** Risque d'erreurs de frappe, dosages incorrects
- **Après:** Données officielles validées par l'ANSM
- **Gain:** 0 erreur sur nom/dosage/forme

#### ✅ Expérience Moderne

- **Avant:** Interface basique avec listes statiques
- **Après:** Recherche dynamique + scan QR Code
- **Gain:** UX alignée avec standards mobiles 2025

### Bénéfices Technique

#### ✅ Architecture Simplifiée

- **Avant:** 2 tables (catalog + medications) avec duplication
- **Après:** 2 tables mais séparation claire (cache + user data)
- **Gain:** Moins de bugs, maintenance plus facile

#### ✅ Code Maintenable

- **Avant:** 17 fichiers avec logique complexe catalog vs custom
- **Après:** Logique unifiée, plus de conditions sur `catalog_id`
- **Gain:** Onboarding nouveaux devs plus rapide

#### ✅ Scalabilité

- **Avant:** Croissance linéaire du catalog (saisie manuelle)
- **Après:** Base officielle (12 000+ médicaments) disponible instantanément
- **Gain:** Pas de limite à la croissance

#### ✅ Conformité Réglementaire

- **Avant:** Aucune garantie sur la véracité des données
- **Après:** Données officielles ANSM, traçabilité CIS
- **Gain:** Conforme pour usage médical

### Métriques de Succès

| Métrique                 | Avant   | Après    | Objectif |
| ------------------------ | ------- | -------- | -------- |
| Temps ajout médicament   | 2-3 min | 30s-1min | <1min    |
| Taux d'erreur données    | 5-10%   | <1%      | <2%      |
| Couverture médicaments   | ~50     | 12 000+  | 100%     |
| Satisfaction utilisateur | 6/10    | 9/10     | >8/10    |
| Dette technique          | Élevée  | Faible   | Faible   |

---

## ⚠️ Risques et Mitigation

### Risque 1: Perte de Données lors Migration

**Probabilité:** Faible (grâce aux nouvelles tables)  
**Impact:** Critique  
**Mitigation:**

- **Nouvelles tables v2** : Aucune suppression des anciennes tables (copie méthodique uniquement)
- Backup complet avant migration (`medications_backup`, `medication_catalog_backup`, `medication_intakes_backup`)
- Tests sur copie de la BDD en environnement de staging
- Rollback immédiat possible (basculer le code vers anciennes tables)
- Validation manuelle des données copiées (comparaison counts, sums, etc.)
- Archivage permanent des anciennes tables pour audit

### Risque 2: Endpoints API Non Documentés

**Probabilité:** Moyenne  
**Impact:** Moyen  
**Mitigation:**

- Analyse approfondie de la documentation officielle avant Phase 1
- Contacter support data.gouv.fr si endpoints non clairs
- Tests API exhaustifs avant intégration
- Mode dégradé : saisie manuelle si API inutilisable
- Fallback sur autre source de données officielle (Vidal API)

### Risque 3: API Externe Indisponible

**Probabilité:** Faible  
**Impact:** Moyen  
**Mitigation:**

- Cache local `medication_reference_cache` pour performance et offline
- Mode dégradé: saisie manuelle toujours possible
- Retry automatique avec backoff exponentiel
- Monitoring de la disponibilité de l'API
- Fallback sur plusieurs sources de données (API backup)

### Risque 4: Régressions Fonctionnelles

**Probabilité:** Moyenne  
**Impact:** Élevé  
**Mitigation:**

- Suite de tests E2E complète (15+ tests)
- Tests de non-régression sur prises médicaments
- Tests de non-régression sur stocks
- Tests de non-régression sur alertes
- Feature flags pour rollback progressif
- Déploiement canary (10% users → 50% → 100%)

### Risque 5: Utilisateurs Perdus (Changement UI)

**Probabilité:** Moyenne  
**Impact:** Moyen  
**Mitigation:**

- Guide utilisateur détaillé avec screenshots
- Tooltips explicatifs sur nouveaux boutons
- Onboarding lors première utilisation
- Support utilisateur renforcé pendant 2 semaines
- Changelog visible dans l'app

### Risque 6: Performance Dégradée

**Probabilité:** Faible  
**Impact:** Moyen  
**Mitigation:**

- Index sur tous les champs de recherche
- Cache Redis pour requêtes fréquentes
- Pagination des résultats de recherche
- Lazy loading des fiches détaillées
- Monitoring des temps de réponse

### Risque 7: QR Code Scanner Non Fonctionnel

**Probabilité:** Moyenne (selon devices)  
**Impact:** Faible  
**Mitigation:**

- Toujours proposer alternative recherche manuelle
- Tests sur large panel de devices (iOS/Android)
- Fallback sur saisie manuelle du code CIS
- Messages d'erreur explicites avec solution alternative

---

## 🤔 Décisions à Trancher

### 1. API Officielle Disponible ?

**Question:** Quelle API allons-nous utiliser pour récupérer les données officielles ?

**Options:**

- ✅ **Recommandé:** API Médicaments (data.gouv.fr)
  - URL base: https://www.data.gouv.fr/reuses/api-rest-base-de-donnees-publique-des-medicaments/
  - ⚠️ Endpoints exacts à déterminer via documentation
  - Gratuite, officielle ANSM
  - 12 000+ médicaments
  - Mise à jour mensuelle
  - Support DataMatrix possible
- Alternative: API privée (ex: Vidal, Thériaque)
  - Payant
  - Plus de données (interactions, posologies détaillées)
  - Nécessite contrat commercial

**Décision Requise:**

- [ ] Utiliser API data.gouv.fr (gratuite)
- [ ] Utiliser API privée (payante) - laquelle ?
- [ ] Les deux (API privée en priorité, data.gouv.fr en fallback)

---

### 2. QR Code DataMatrix ?

**Question:** Doit-on implémenter le scan de QR Code DataMatrix dès le MVP ?

**Solution technique recommandée:**

- **Librairie** : `@zxing/library` (gratuite, open-source)
  - Support DataMatrix, QR Code, Code-barres
  - Compatible web + mobile
  - Légère et performante
- **Alternative** : `html5-qrcode` (plus simple mais moins de formats)

**Pour:**

- ✅ Expérience utilisateur optimale
- ✅ Différenciation concurrentielle
- ✅ Réduit drastiquement le temps de saisie (30s vs 2-3min)
- ✅ Garantit 100% de fiabilité des données
- ✅ Solution gratuite disponible (@zxing/library)

**Contre:**

- ❌ Complexité technique (permissions caméra, parsing DataMatrix)
- ❌ Nécessite tests sur multiples devices
- ❌ Peut ralentir le déploiement initial

**Décision Requise:**

- [ ] Oui, implémenter dès le MVP avec @zxing/library (recommandé)
- [ ] Non, prévoir pour V2
- [ ] Oui mais uniquement pour iOS/Android via Capacitor (pas web)

---

### 3. Priorisation ?

**Question:** Quelle stratégie de migration adopter ?

**Option A: Big Bang** (tout en une fois)

- Avantages: Finit rapidement, pas d'état intermédiaire
- Inconvénients: Risqué, difficile de rollback
- Durée: 8-12 jours d'affilée

**Option B: Incrémentale** (phase par phase)

- Avantages: Moins risqué, rollback facile
- Inconvénients: Plus long (état intermédiaire), complexité technique
- Durée: 3-4 semaines avec pauses entre phases

**Décision Requise:**

- [ ] Big Bang (recommandé pour ce projet vu la taille)
- [ ] Incrémentale avec feature flags
- [ ] Hybride (infra API d'abord, puis frontend progressivement)

---

### 4. Migration Urgente ?

**Question:** Quel est le timeline souhaité pour cette refonte ?

**Décision Requise:**

- [ ] Urgent - Déploiement dans 2 semaines
- [ ] Normal - Déploiement dans 1 mois
- [ ] Flexible - Déploiement quand prêt (pas de deadline)

---

## 📝 Prochaines Étapes

### Actions Immédiates

1. **Valider les 4 décisions** ci-dessus
2. **Créer backup complet** de la BDD de prod
3. **Configurer environnement de staging** pour tests migration
4. **Créer branch Git** `feature/medication-refactor-v2`
5. **Initialiser le board Trello/Jira** avec les 5 phases
6. **⚠️ Installer @zxing/library** : `npm install @zxing/library`

### Ordre d'Exécution Recommandé

1. Phase 1: Infrastructure API (bloquer 3 jours)
2. Phase 2: Refonte BDD (bloquer 2 jours)
3. Phase 3: Frontend (bloquer 4 jours)
4. Phase 4: Cleanup (bloquer 1 jour)
5. Phase 5: Tests (bloquer 2 jours)

### Jalons de Validation

- ✅ **Jalon 1 (Fin Phase 1):** API fonctionne, cache se remplit
- ✅ **Jalon 2 (Fin Phase 2):** Migration données OK, aucune perte
- ✅ **Jalon 3 (Fin Phase 3):** Wizard fonctionne avec nouvelle logique
- ✅ **Jalon 4 (Fin Phase 4):** Aucune référence à `medication_catalog`
- ✅ **Jalon 5 (Fin Phase 5):** Tous les tests passent, déploiement prod

---

## 📚 Annexes

### A. Schéma de Données Comparatif

**AVANT:**

```
medication_catalog (référentiel partagé)
├── Données "officielles" (mais saisies manuellement)
└── Pathologie (incohérence TEXT vs UUID)

medications (données utilisateur)
├── catalog_id (lien faible, nullable)
├── Duplication: name, strength, posology
└── Personnalisation: stock, seuil, etc.
```

**APRÈS:**

```
medication_reference_cache (cache API officielle) - NOUVELLE
├── Données 100% officielles (ANSM)
├── Code CIS (identifiant unique officiel)
└── JSONB pour flexibilité future

medications_v2 (données utilisateur enrichies) - NOUVELLE
├── reference_cache_id (lien fort vers cache)
├── Copie locale: official_name, official_strength (pour offline)
└── Personnalisation: pathology, posology, stock, seuil, notes, photo

medication_intakes_v2 (prises médicaments) - NOUVELLE
├── Lien vers medications_v2
└── Historique complet préservé

medications_archived (ancienne table) - ARCHIVÉE
medication_intakes_archived (ancienne table) - ARCHIVÉE
medication_catalog_archived (ancienne table) - ARCHIVÉE
```

### B. Endpoints API Externes

**API data.gouv.fr - Médicaments**

⚠️ **IMPORTANT** : Les URLs ci-dessous sont des exemples. Les endpoints exacts doivent être déterminés via la documentation officielle.

```http
# ⚠️ URL à confirmer - Recherche par nom
GET https://[API_URL_TO_DETERMINE]/search?nom=xigduo&limit=10

# ⚠️ URL à confirmer - Fiche détaillée par code CIS
GET https://[API_URL_TO_DETERMINE]/medications/62137228

# ⚠️ URL à confirmer - Parse DataMatrix (code 13 chiffres)
GET https://[API_URL_TO_DETERMINE]/datamatrix/0123456789012
```

**Documentation officielle à consulter:**

- https://www.data.gouv.fr/reuses/api-rest-base-de-donnees-publique-des-medicaments/
- https://base-donnees-publique.medicaments.gouv.fr/docs

**Réponse Type:**

```json
{
  "cis": "62137228",
  "denomination": "XIGDUO 5 mg/1000 mg, comprimé pelliculé",
  "forme": "comprimé pelliculé",
  "voies_administration": ["orale"],
  "statut_amm": "Autorisation active",
  "type_amm": "Procédure européenne",
  "commercialisation": "commercialisée",
  "date_amm": "2014-01-17",
  "titulaire": "ASTRAZENECA AB",
  "surveillance": [],
  "compositions": [...],
  "presentations": [...]
}
```

### C. Glossaire

- **CIS:** Code Identifiant de Spécialité (identifiant unique médicament en France)
- **CIS13:** Code CIS à 13 chiffres (utilisé dans DataMatrix)
- **DataMatrix:** Code-barre 2D présent sur les boîtes de médicaments (contient CIS13, lot, péremption)
- **ATC:** Anatomical Therapeutic Chemical (classification internationale des médicaments)
- **AMM:** Autorisation de Mise sur le Marché
- **ANSM:** Agence Nationale de Sécurité du Médicament et des produits de santé
- **RCP:** Résumé des Caractéristiques du Produit

---

**FIN DU DOCUMENT**

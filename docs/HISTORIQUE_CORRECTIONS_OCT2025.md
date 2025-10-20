# HISTORIQUE DES CORRECTIONS - OCTOBRE 2025

**Date** : 20 octobre 2025  
**Branche** : fix/notifications-system  
**Objectif** : Corriger le système de gestion des prises de médicaments

---

## 🎯 PROBLÈME INITIAL

**Symptôme** : "Quand je modifie l'heure du médicament dans le traitement actif, ça met le bordel dans les prises"

**Causes identifiées** :
1. **Système hybride défaillant** :
   - Passé = lu depuis `medication_intakes` (base de données)
   - Futur = généré dynamiquement depuis `medications.times`
   - **Conséquence** : Modifier `medications.times` changeait l'affichage du passé ET du futur

2. **Génération dynamique problématique** :
   - `Calendar.tsx` générait les prises à la volée
   - `useMissedIntakesDetection.tsx` générait des fausses alertes
   - `Index.tsx` affichait des données incohérentes

3. **Corruption des données historiques** :
   - 13/10 : 4 prises au lieu de 5 (doublon Xigduo, Simvastatine manquante)
   - 18-19/10 : Timestamps incorrects (19:00→20:00, 22:30→22:00)

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. **Tri des médicaments par horaire** ✅
**Fichier** : `src/pages/TreatmentEdit.tsx`  
**Solution** : Tri par premier horaire de prise, puis par nom alphabétique
```typescript
sortedMedications.sort((a, b) => {
  const comparison = a.times[0].localeCompare(b.times[0]);
  return comparison !== 0 ? comparison : a.name.localeCompare(b.name);
});
```

### 2. **Détection des prises manquées** ✅
**Fichier** : `src/hooks/useMissedIntakesDetection.tsx`  
**Problème** : Générait dynamiquement depuis `medications.times` → fausses alertes  
**Solution** : Ne lit QUE depuis `medication_intakes` avec `status='pending'`

### 3. **Page Calendrier - Approche hybride** ✅
**Fichier** : `src/pages/Calendar.tsx`  
**Solution** : Refactorisation complète de `loadDayDetails()` :
- **Jours passés** : Lit UNIQUEMENT `medication_intakes` (historique figé)
- **Aujourd'hui/Futur** : Combine `medication_intakes` (déjà pris) + `medications.times` (à venir)

### 4. **Correction des données corrompues** ✅
**Scripts SQL exécutés** :
- **18-19/10** : Correction timestamps (19:00→20:00, 22:30→22:00)
- **13/10** : Correction doublon Xigduo + ajout Simvastatine manquante

**Résultat** : 36 prises historiques complètes du 13/10 au 20/10 (5×7 + 1)

---

## 🚀 MIGRATION VERS SYSTÈME UNIFIÉ (EN COURS)

### Objectif
Supprimer le système hybride et passer à un système 100% base de données.

### Principe
- **Tout stocké** : Futur pré-généré 7 jours à l'avance dans `medication_intakes`
- **Génération automatique** : Trigger SQL `pg_cron` chaque nuit à 00:00 pour créer J+7
- **Avantage** : Modifier `medications.times` n'affecte QUE les nouveaux J+7

### Étapes
1. ✅ Nettoyage documentation + commit
2. ⏳ Créer fonction SQL de génération J+1 à J+7
3. ⏳ Peupler les 7 prochains jours (21-27/10)
4. ⏳ Refactoriser `Calendar.tsx` et `Index.tsx` (lecture pure DB)
5. ⏳ Configurer `pg_cron` pour génération quotidienne

**Estimation** : 1h15

---

## 📊 RÉSULTATS

### Avant corrections
- ❌ Historique corrompu (13/10 : 4/5 prises)
- ❌ Timestamps incorrects (décalage horaire)
- ❌ Fausses alertes de prises manquées
- ❌ Calendrier incohérent (génération dynamique)
- ❌ Modification d'horaire = corruption historique

### Après corrections
- ✅ Historique complet et cohérent (36 prises)
- ✅ Timestamps corrects (UTC+2 France)
- ✅ Alertes basées sur données réelles
- ✅ Calendrier fiable (hybride temporaire)
- ⏳ Migration système unifié en cours

---

## 📝 LEÇONS APPRISES

1. **Éviter les systèmes hybrides** : Source de complexité et d'incohérences
2. **Génération dynamique = danger** : Toujours stocker les données historiques
3. **Un changement = un impact** : Modifier `medications.times` doit être sans effet sur le passé
4. **Nettoyage régulier** : Supprimer les fichiers temporaires immédiatement
5. **Validation étape par étape** : Corriger progressivement, pas tout d'un coup

---

## 🔧 FICHIERS MODIFIÉS

### Code TypeScript
- `src/pages/TreatmentEdit.tsx` (tri médicaments)
- `src/hooks/useMissedIntakesDetection.tsx` (lecture DB pure)
- `src/pages/Calendar.tsx` (approche hybride temporaire)

### Scripts SQL
- `CORRECTION_FINALE_13OCT.sql` (correction 13/10)
- Scripts correction timestamps 18-19/10

### Documentation
- `docs/HISTORIQUE_CORRECTIONS_OCT2025.md` (ce fichier)
- `docs/notf/systeme_notif.md` (système notifications)
- `migration_sql/CR_maj_sql.md` (historique migrations)

---

**Status** : ✅ Phase 1 terminée | ⏳ Phase 2 (migration système unifié) en cours

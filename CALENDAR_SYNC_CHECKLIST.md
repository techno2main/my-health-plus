# Checklist d'implémentation - Synchronisation Calendrier

## ✅ Phase 1 : Architecture (COMPLÉTÉ)
- [x] Récupération des fichiers depuis lovable-dev
- [x] Ajout export default dans CalendarSync.tsx
- [x] Ajout route `/calendar-sync` dans App.tsx
- [x] Vérification compilation TypeScript

## ✅ Phase 2 : Installation du plugin Capacitor (COMPLÉTÉ)

### Étape 1 : Installation du plugin
```bash
npm install @ebarooni/capacitor-calendar --legacy-peer-deps
npx cap sync android
```

- [x] Exécuter `npm install @ebarooni/capacitor-calendar --legacy-peer-deps`
- [x] Exécuter `npx cap sync android`
- [x] Vérifier que le plugin est bien ajouté dans package.json

### Étape 2 : Configuration Android
Fichier: `android/app/src/main/AndroidManifest.xml`

Ajouter les permissions (normalement déjà présentes) :
```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

- [x] Vérifier les permissions dans AndroidManifest.xml
- [x] Ajouter les permissions si manquantes

### Étape 3 : Test de la page
- [x] Ouvrir l'app en dev : `npm run dev`
- [x] Naviguer vers `/calendar-sync`
- [x] Vérifier que la page s'affiche sans erreur
- [ ] Tester sur émulateur Android

## ✅ Phase 3 : Implémentation des hooks (COMPLÉTÉ)

Le hook `useNativeCalendar.ts` utilise maintenant le plugin réel.

Fichier: `src/pages/calendar-sync/hooks/useNativeCalendar.ts`

- [x] Remplacer les mocks par les vraies méthodes du plugin
- [x] Implémenter `requestPermissions()` avec `requestFullCalendarAccess()`
- [x] Implémenter `getCalendars()` avec `listCalendars()`
- [x] Implémenter `createEvent()` avec `createEvent()`
- [x] Implémenter `updateEvent()` avec `modifyEvent()`
- [x] Implémenter `deleteEvent()` avec `deleteEvent()`

## 🎯 Phase 4 : Mapping des événements (À FAIRE)

Fichier: `src/pages/calendar-sync/utils/eventMapper.ts`

- [ ] Vérifier le mapping des prises de médicaments
- [ ] Vérifier le mapping des RDV médicaux
- [ ] Vérifier le mapping des visites pharmacie
- [ ] Vérifier le mapping des renouvellements d'ordonnance
- [ ] Ajouter les couleurs par type d'événement
- [ ] Ajouter les alertes/rappels

## 🔄 Phase 5 : Synchronisation (À FAIRE)

- [ ] Implémenter la synchronisation complète depuis le 13/10
- [ ] Implémenter la synchronisation incrémentale
- [ ] Gérer les doublons (ne pas recréer si existe déjà)
- [ ] Gérer les mises à jour (si statut change)
- [ ] Gérer les suppressions (si traitement archivé)

## 🧪 Phase 6 : Tests (À FAIRE)

- [ ] Tester sur émulateur Android
- [ ] Tester sur téléphone Android réel
- [ ] Tester les permissions
- [ ] Tester la sélection de calendrier
- [ ] Tester la synchronisation complète
- [ ] Tester la synchronisation incrémentale
- [ ] Vérifier les fuseaux horaires (UTC → Paris)
- [ ] Vérifier les couleurs et icônes

## 📝 Phase 7 : Documentation (À FAIRE)

- [ ] Mettre à jour `docs/calendar_sync.md`
- [ ] Ajouter des screenshots
- [ ] Documenter les cas d'erreur
- [ ] Créer un guide utilisateur

## 🚀 Phase 8 : Déploiement (À FAIRE)

- [ ] Build de production : `npm run build`
- [ ] Sync Android : `npx cap sync android`
- [ ] Générer APK de test
- [ ] Tests sur téléphone réel
- [ ] Commit et push sur `feat/calendar-sync`
- [ ] Merge dans `dev` après validation

---

## 📌 Notes importantes

### Fuseaux horaires
- Les dates en BDD sont en UTC
- Les heures de prise sont stockées comme "09:30", "20:00" etc.
- Il faut utiliser les fonctions de `utils/dateUtils.ts` qui gèrent déjà la conversion Paris

### Filtrage des données
- Démarrer la sync depuis le 13/10/2025
- Ne synchroniser que les traitements actifs (`is_active = true`)
- Exclure les prises déjà passées et non validées (status = skipped)

### Gestion des statuts
- **Prise à l'heure** : badge vert
- **Prise en retard** : badge orange
- **Prise manquée** : badge rouge
- **RDV** : icône calendrier
- **Visite pharmacie** : icône pharmacie
- **Renouvellement** : icône document

### Plugin Capacitor Calendar
Documentation : https://github.com/capacitor-community/calendar

Méthodes principales :
- `Calendar.checkPermission()` - Vérifier permissions
- `Calendar.requestPermissions()` - Demander permissions
- `Calendar.getCalendars()` - Liste des calendriers
- `Calendar.createEvent()` - Créer événement
- `Calendar.modifyEvent()` - Modifier événement
- `Calendar.deleteEvent()` - Supprimer événement

---

**Date de création** : 30 octobre 2025
**Branche** : feat/calendar-sync
**Status** : Architecture complète, installation plugin en attente

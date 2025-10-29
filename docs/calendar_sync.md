# 📅 Guide d'implémentation - Synchronisation Calendrier Natif

## 🎯 Objectif

Synchroniser les événements de santé de l'application (prises de médicaments, RDV, visites pharmacie, renouvellements) avec le calendrier natif du téléphone (iOS/Android).

## 📋 Compte-rendu d'actions

### ✅ Phase 1 : Architecture et Structure (TERMINÉ)

- [x] Création de la structure de dossiers `src/pages/calendar-sync/`
- [x] Définition des types TypeScript (`types.ts`)
- [x] Utilitaires de gestion des dates (`utils/dateUtils.ts`)
- [x] Utilitaires de mapping d'événements (`utils/eventMapper.ts`)
- [x] Hook de gestion du calendrier natif (`hooks/useNativeCalendar.ts`)
- [x] Hook de gestion de la configuration (`hooks/useSyncConfig.ts`)
- [x] Hook principal de synchronisation (`hooks/useCalendarSync.ts`)
- [x] Composant de sélection de calendrier (`components/CalendarSelector.tsx`)
- [x] Composant d'options de synchronisation (`components/SyncOptions.tsx`)
- [x] Composant de statut de synchronisation (`components/SyncStatus.tsx`)
- [x] Composant de bannière de permissions (`components/PermissionBanner.tsx`)
- [x] Page principale de synchronisation (`CalendarSync.tsx`)
- [x] Documentation complète (`docs/calendar_sync.md`)

### 🔄 Phase 2 : Intégration Capacitor (EN COURS)

- [ ] Installation du plugin `@capacitor-community/calendar`
- [ ] Configuration des permissions iOS (Info.plist)
- [ ] Configuration des permissions Android (AndroidManifest.xml)
- [ ] Implémentation réelle des méthodes du hook `useNativeCalendar`
- [ ] Tests de permissions sur iOS
- [ ] Tests de permissions sur Android

### ⏳ Phase 3 : Implémentation de la Synchronisation (À FAIRE)

- [ ] Implémentation de la création d'événements natifs
- [ ] Implémentation de la mise à jour d'événements
- [ ] Implémentation de la suppression d'événements
- [ ] Gestion des conflits et doublons
- [ ] Système de mapping ID app ↔ ID calendrier natif
- [ ] Tests de synchronisation complète

### ⏳ Phase 4 : Synchronisation Bidirectionnelle (À FAIRE)

- [ ] Détection des modifications dans le calendrier natif
- [ ] Mise à jour des données app depuis le calendrier natif
- [ ] Gestion des suppressions bidirectionnelles
- [ ] Tests de synchronisation bidirectionnelle

### ⏳ Phase 5 : Optimisations et Tests (À FAIRE)

- [ ] Optimisation des performances (batch sync)
- [ ] Gestion des erreurs avancée
- [ ] Tests sur iOS réel
- [ ] Tests sur Android réel
- [ ] Tests de synchronisation en arrière-plan
- [ ] Documentation utilisateur finale

---

## 🔧 Guide d'implémentation en local

### Prérequis

1. **Environnement de développement Capacitor configuré**
   - Xcode installé (pour iOS)
   - Android Studio installé (pour Android)
   - Projet exporté sur GitHub et cloné localement

2. **Dépendances installées**
   ```bash
   npm install
   ```

### Étape 1 : Installation du plugin calendrier

```bash
npm install @capacitor-community/calendar
npx cap sync
```

### Étape 2 : Configuration des permissions iOS

Éditer `ios/App/App/Info.plist` et ajouter :

```xml
<key>NSCalendarsUsageDescription</key>
<string>Cette application a besoin d'accéder à votre calendrier pour synchroniser vos événements de santé (prises de médicaments, rendez-vous médicaux, etc.)</string>
<key>NSCalendarsWriteOnlyAccessUsageDescription</key>
<string>Cette application a besoin d'écrire dans votre calendrier pour créer vos événements de santé</string>
```

### Étape 3 : Configuration des permissions Android

Le fichier `android/app/src/main/AndroidManifest.xml` doit contenir :

```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

### Étape 4 : Implémentation du hook `useNativeCalendar`

Remplacer les TODO dans `src/pages/calendar-sync/hooks/useNativeCalendar.ts` :

```typescript
import { Calendar } from '@capacitor-community/calendar';

// Dans checkPermission()
const status = await Calendar.checkPermission();
setPermission({
  granted: status.read === 'granted' && status.write === 'granted',
  canRequest: status.read !== 'denied' && status.write !== 'denied'
});

// Dans requestPermission()
const result = await Calendar.requestPermission();
const granted = result.read === 'granted' && result.write === 'granted';
setPermission({ granted, canRequest: !granted });
return granted;

// Dans loadCalendars()
const { calendars } = await Calendar.listCalendars();
const mapped = calendars.map(cal => ({
  id: cal.id,
  name: cal.name,
  displayName: cal.displayName || cal.name,
  isPrimary: cal.isPrimary || false,
  allowsModifications: cal.allowsModifications !== false,
  color: cal.color
}));
setAvailableCalendars(mapped);
return mapped;

// Dans createEvent()
const result = await Calendar.createEvent({
  title: event.title,
  notes: event.description,
  startDate: event.startDate.getTime(),
  endDate: event.endDate.getTime(),
  calendarId: event.calendarId,
  location: event.location
});
return result.id;

// Dans updateEvent()
await Calendar.modifyEvent({
  id: eventId,
  title: updates.title,
  notes: updates.description,
  startDate: updates.startDate?.getTime(),
  endDate: updates.endDate?.getTime(),
  location: updates.location
});
return true;

// Dans deleteEvent()
await Calendar.deleteEvent({ id: eventId });
return true;
```

### Étape 5 : Ajouter la route dans l'application

Dans `src/App.tsx`, ajouter la route :

```typescript
import { CalendarSync } from './pages/calendar-sync/CalendarSync';

// Dans les routes
<Route path="/calendar-sync" element={<CalendarSync />} />
```

### Étape 6 : Ajouter le lien de navigation

Dans le menu de paramètres ou navigation principale :

```typescript
<Link to="/calendar-sync">
  <Calendar className="h-5 w-5" />
  Synchronisation calendrier
</Link>
```

### Étape 7 : Tests en local

1. **Build du projet**
   ```bash
   npm run build
   npx cap sync
   ```

2. **Lancer sur iOS**
   ```bash
   npx cap open ios
   ```
   Puis lancer depuis Xcode sur un simulateur ou appareil réel.

3. **Lancer sur Android**
   ```bash
   npx cap open android
   ```
   Puis lancer depuis Android Studio sur un émulateur ou appareil réel.

4. **Tester le flow complet**
   - [ ] Accéder à la page "Synchronisation calendrier"
   - [ ] Demander la permission d'accès au calendrier
   - [ ] Sélectionner un calendrier natif
   - [ ] Configurer les types d'événements à synchroniser
   - [ ] Lancer la synchronisation
   - [ ] Vérifier les événements dans le calendrier natif du téléphone
   - [ ] Vérifier les statuts (✓ à l'heure, ⚠ en retard, ✗ manquée, ⏰ à venir)

### Étape 8 : Synchronisation bidirectionnelle (Avancé)

Pour implémenter la synchronisation bidirectionnelle :

1. **Stocker les IDs de mapping**
   Créer une table Supabase `calendar_event_mappings` :
   ```sql
   CREATE TABLE calendar_event_mappings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     app_event_id TEXT NOT NULL,
     app_event_type TEXT NOT NULL,
     native_event_id TEXT NOT NULL,
     calendar_id TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Détecter les modifications**
   Utiliser `Calendar.listEventsInRange()` pour récupérer les événements du calendrier natif et comparer avec les données de l'app.

3. **Appliquer les modifications**
   Si un événement a été modifié ou supprimé dans le calendrier natif, mettre à jour l'app en conséquence.

---

## 📊 Gestion des fuseaux horaires

### Principe CRITIQUE

- **Base de données** : Toutes les dates sont stockées en UTC
- **Récupération** : Les dates sont récupérées **SANS CONVERSION**
- **Synchronisation** : Les dates UTC sont envoyées telles quelles au calendrier natif
- **Affichage** : Le calendrier natif gère lui-même la conversion vers le fuseau local

### Implémentation

```typescript
// ✅ CORRECT - Pas de conversion
const startDate = new Date(intake.scheduled_time); // UTC depuis BDD
await Calendar.createEvent({
  startDate: startDate.getTime(), // Timestamp UTC
  endDate: endDate.getTime()
});

// ❌ INCORRECT - Ne pas faire de conversion manuelle
const localDate = new Date(intake.scheduled_time);
localDate.setHours(localDate.getHours() + 1); // MAUVAIS!
```

---

## 🎨 Icônes et Statuts

### Types d'événements

- 💊 **Prise de médicament** : `✓ À l'heure` / `⚠ En retard` / `✗ Manquée` / `⏰ À venir`
- 👨‍⚕️ **RDV Médecin** : Fin de traitement
- 🏥 **Visite pharmacie** : Retrait de médicaments
- 📋 **Renouvellement ordonnance** : 7 jours avant expiration

### Calcul des statuts

```typescript
// À l'heure : pris dans les 30min après l'heure prévue
// En retard : pris > 30min après l'heure prévue
// Manquée : marqué comme "skipped" ou > 30min après sans être pris
// À venir : heure prévue dans le futur
```

---

## 🐛 Dépannage

### Problème : Permission refusée

- Vérifier que les clés sont bien dans `Info.plist` (iOS)
- Vérifier que les permissions sont dans `AndroidManifest.xml` (Android)
- Sur iOS, supprimer l'app et réinstaller pour réinitialiser les permissions
- Sur Android, aller dans Paramètres > Apps > Permissions

### Problème : Calendrier non visible

- S'assurer que le calendrier natif existe bien sur l'appareil
- Vérifier que le calendrier autorise les modifications
- Tester avec le calendrier principal de l'appareil

### Problème : Dates incorrectes

- Vérifier qu'aucune conversion de fuseau horaire n'est faite
- S'assurer que les dates en BDD sont bien en UTC
- Vérifier les timestamps (millisecondes vs secondes)

### Problème : Événements en double

- Implémenter le système de mapping ID app ↔ ID natif
- Avant de créer, vérifier si l'événement existe déjà
- Utiliser `updateEvent` au lieu de `createEvent` si l'ID existe

---

## 📚 Ressources

- [Documentation @capacitor-community/calendar](https://github.com/capacitor-community/calendar)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Calendar Framework](https://developer.apple.com/documentation/eventkit)
- [Android Calendar Provider](https://developer.android.com/guide/topics/providers/calendar-provider)

---

## 🚀 Prochaines étapes

1. **Installation du plugin** : `npm install @capacitor-community/calendar`
2. **Configuration des permissions** (iOS + Android)
3. **Implémentation des méthodes natives** dans `useNativeCalendar.ts`
4. **Tests sur appareils réels**
5. **Optimisations et synchronisation bidirectionnelle**

---

**Date de création** : 29 octobre 2025  
**Dernière mise à jour** : 29 octobre 2025  
**Version** : 1.0.0

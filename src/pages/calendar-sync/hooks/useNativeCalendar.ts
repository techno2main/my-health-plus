import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorCalendar, CalendarPermissionScope } from '@ebarooni/capacitor-calendar';
import type { NativeCalendar, CalendarPermissionStatus } from '../types';

/**
 * Hook de gestion du calendrier natif
 * Utilise @ebarooni/capacitor-calendar pour iOS et Android
 */
export const useNativeCalendar = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<CalendarPermissionStatus>({
    granted: false,
    canRequest: true
  });
  const [availableCalendars, setAvailableCalendars] = useState<NativeCalendar[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = () => {
    // Vérifier si on est sur une plateforme native
    const isNative = Capacitor.isNativePlatform();
    setIsSupported(isNative);
    
    if (isNative) {
      checkPermission();
    }
  };

  const checkPermission = async () => {
    try {
      const platform = Capacitor.getPlatform();
      
      // Sur iOS : utiliser READ_REMINDERS/WRITE_REMINDERS
      // Sur Android : utiliser READ_CALENDAR/WRITE_CALENDAR (pas de Reminders natif)
      const readScope = platform === 'ios' 
        ? CalendarPermissionScope.READ_REMINDERS 
        : CalendarPermissionScope.READ_CALENDAR;
      const writeScope = platform === 'ios'
        ? CalendarPermissionScope.WRITE_REMINDERS
        : CalendarPermissionScope.WRITE_CALENDAR;
      
      const readStatus = await CapacitorCalendar.checkPermission({
        scope: readScope
      });
      const writeStatus = await CapacitorCalendar.checkPermission({
        scope: writeScope
      });
      
      const granted = readStatus.result === 'granted' && writeStatus.result === 'granted';
      const canRequest = readStatus.result === 'prompt' || writeStatus.result === 'prompt';
      
      console.log(`[Calendar Sync] ${platform} permission status:`, { read: readStatus.result, write: writeStatus.result });
      setPermission({ granted, canRequest });
    } catch (error) {
      console.error('[Calendar Sync] Error checking permission:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[Calendar Sync] Calendar not supported on this platform');
      return false;
    }

    setLoading(true);
    try {
      const platform = Capacitor.getPlatform();
      
      // Sur iOS : demander accès aux Reminders
      // Sur Android : demander accès au Calendar
      const readScope = platform === 'ios' 
        ? CalendarPermissionScope.READ_REMINDERS 
        : CalendarPermissionScope.READ_CALENDAR;
      const writeScope = platform === 'ios'
        ? CalendarPermissionScope.WRITE_REMINDERS
        : CalendarPermissionScope.WRITE_CALENDAR;
      
      const readResult = await CapacitorCalendar.requestPermission({
        scope: readScope
      });
      const writeResult = await CapacitorCalendar.requestPermission({
        scope: writeScope
      });
      
      const granted = readResult.result === 'granted' && writeResult.result === 'granted';
      setPermission({ 
        granted, 
        canRequest: false
      });
      
      console.log(`[Calendar Sync] ${platform} permission request result:`, { read: readResult.result, write: writeResult.result });
      
      if (granted) {
        // Charger les listes de rappels ou calendriers
        await loadCalendars();
      }
      
      return granted;
    } catch (error) {
      console.error('[Calendar Sync] Error requesting permission:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadCalendars = async (): Promise<NativeCalendar[]> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Calendar Sync] Cannot load calendars without permission');
      return [];
    }

    setLoading(true);
    try {
      const platform = Capacitor.getPlatform();
      let lists: any[] = [];
      
      // iOS : charger les Reminders lists
      // Android : charger les Calendriers
      if (platform === 'ios') {
        const result = await CapacitorCalendar.getRemindersLists();
        lists = result.result;
      } else {
        const result = await CapacitorCalendar.listCalendars();
        lists = result.result;
      }
      
      const mapped: NativeCalendar[] = lists.map((list: any) => ({
        id: list.id,
        name: list.title || list.name,
        displayName: list.title || list.name,
        isPrimary: list.isDefault || list.isPrimary || false,
        allowsModifications: true,
        color: list.color || '#007AFF'
      }));
      
      console.log(`[Calendar Sync] Loaded ${platform} calendars:`, mapped.length);
      setAvailableCalendars(mapped);
      return mapped;
    } catch (error) {
      console.error('[Calendar Sync] Error loading calendars:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    calendarId: string;
    location?: string;
    color?: string;
    alerts?: number[];
  }): Promise<string | null> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Calendar Sync] Cannot create event without permission');
      return null;
    }

    try {
      const platform = Capacitor.getPlatform();
      
      // iOS : créer un Reminder
      // Android : créer un événement Calendar
      if (platform === 'ios') {
        const result = await CapacitorCalendar.createReminder({
          title: event.title,
          notes: event.description,
          dueDate: event.startDate.getTime(),
          listId: event.calendarId,
        });
        console.log('[Calendar Sync] Reminder created:', result.id);
        return result.id;
      } else {
        const result = await CapacitorCalendar.createEvent({
          title: event.title,
          startDate: event.startDate.getTime(),
          endDate: event.endDate.getTime(),
          calendarId: event.calendarId,
          location: event.location,
          isAllDay: false
        });
        console.log('[Calendar Sync] Calendar event created:', result.id);
        return result.id;
      }
    } catch (error) {
      console.error('[Calendar Sync] Error creating event:', error);
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    color?: string;
    alerts?: number[];
  }): Promise<boolean> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Calendar Sync] Cannot update event without permission');
      return false;
    }

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'ios') {
        // iOS Reminders : supprimer et recréer
        await CapacitorCalendar.deleteReminder({ id: eventId });
        
        const result = await CapacitorCalendar.createReminder({
          title: updates.title || 'Prise de médicament',
          notes: updates.description || '',
          dueDate: updates.startDate?.getTime() || Date.now(),
          listId: eventId.split('_')[0],
        });
        
        console.log('[Calendar Sync] Reminder updated (recreated):', result.id);
        return true;
      } else {
        // Android Calendar : supprimer et recréer aussi (modifyEvent pas fiable)
        await CapacitorCalendar.deleteEventsById({ ids: [eventId] });
        
        const result = await CapacitorCalendar.createEvent({
          title: updates.title || 'Prise de médicament',
          startDate: updates.startDate?.getTime() || Date.now(),
          endDate: updates.endDate?.getTime() || (Date.now() + 900000), // +15 min par défaut
          calendarId: eventId.split('_')[0],
          location: updates.location,
          isAllDay: false
        });
        
        console.log('[Calendar Sync] Calendar event updated (recreated):', result.id);
        return true;
      }
    } catch (error) {
      console.error('[Calendar Sync] Error updating event:', error);
      return false;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Calendar Sync] Cannot delete event without permission');
      return false;
    }

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'ios') {
        await CapacitorCalendar.deleteReminder({ id: eventId });
        console.log('[Calendar Sync] Reminder deleted:', eventId);
      } else {
        await CapacitorCalendar.deleteEventsById({ ids: [eventId] });
        console.log('[Calendar Sync] Calendar event deleted:', eventId);
      }
      
      return true;
    } catch (error) {
      console.error('[Calendar Sync] Error deleting event:', error);
      return false;
    }
  };

  /**
   * FONCTION DE MIGRATION
   * Supprime les anciens événements calendrier (avant migration vers rappels)
   * Utilise l'ancienne API deleteEvent pour nettoyer les événements synchronisés
   */
  const migrateCalendarEventsToReminders = async (syncedEventIds: string[]): Promise<number> => {
    if (!isSupported) {
      console.warn('[Calendar Sync] Cannot migrate on unsupported platform');
      return 0;
    }

    let deletedCount = 0;

    try {
      // Vérifier les permissions calendrier (anciennes) pour la migration
      const readCalendarStatus = await CapacitorCalendar.checkPermission({
        scope: CalendarPermissionScope.READ_CALENDAR
      });
      const writeCalendarStatus = await CapacitorCalendar.checkPermission({
        scope: CalendarPermissionScope.WRITE_CALENDAR
      });
      
      const hasCalendarPermission = 
        readCalendarStatus.result === 'granted' && 
        writeCalendarStatus.result === 'granted';

      if (!hasCalendarPermission) {
        console.warn('[Calendar Sync] No calendar permission for migration, skipping');
        return 0;
      }

      console.log(`[Calendar Sync] Starting migration: deleting ${syncedEventIds.length} calendar events`);

      // Supprimer chaque ancien événement calendrier
      for (const eventId of syncedEventIds) {
        try {
          await CapacitorCalendar.deleteEventsById({ ids: [eventId] });
          deletedCount++;
          console.log(`[Calendar Sync] Deleted old calendar event: ${eventId}`);
        } catch (error) {
          console.warn(`[Calendar Sync] Could not delete event ${eventId}:`, error);
          // Continue même si un événement échoue (peut-être déjà supprimé)
        }
      }

      console.log(`[Calendar Sync] Migration complete: ${deletedCount}/${syncedEventIds.length} events deleted`);
      return deletedCount;

    } catch (error) {
      console.error('[Calendar Sync] Error during migration:', error);
      return deletedCount;
    }
  };

  return {
    isSupported,
    permission,
    availableCalendars,
    loading,
    requestPermission,
    loadCalendars,
    createEvent,
    updateEvent,
    deleteEvent,
    migrateCalendarEventsToReminders
  };
};

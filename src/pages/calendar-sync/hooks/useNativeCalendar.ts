import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { NativeCalendar, CalendarPermissionStatus } from '../types';

/**
 * Hook de gestion du calendrier natif
 * Utilise @capacitor-community/calendar pour iOS et Android
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
      // TODO: Implémenter avec @capacitor-community/calendar
      // const status = await Calendar.checkPermission();
      // setPermission(status);
      
      // Pour l'instant, simuler
      console.log('[Calendar Sync] Checking calendar permission...');
      setPermission({ granted: false, canRequest: true });
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
      // TODO: Implémenter avec @capacitor-community/calendar
      // const result = await Calendar.requestPermission();
      // setPermission(result);
      // return result.granted;
      
      console.log('[Calendar Sync] Requesting calendar permission...');
      // Simuler pour le moment
      return false;
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
      // TODO: Implémenter avec @capacitor-community/calendar
      // const calendars = await Calendar.listCalendars();
      // const mapped = calendars.map(cal => ({
      //   id: cal.id,
      //   name: cal.name,
      //   displayName: cal.displayName,
      //   isPrimary: cal.isPrimary,
      //   allowsModifications: cal.allowsModifications,
      //   color: cal.color
      // }));
      // setAvailableCalendars(mapped);
      // return mapped;
      
      console.log('[Calendar Sync] Loading available calendars...');
      return [];
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
  }): Promise<string | null> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Calendar Sync] Cannot create event without permission');
      return null;
    }

    try {
      // TODO: Implémenter avec @capacitor-community/calendar
      // const result = await Calendar.createEvent({
      //   title: event.title,
      //   notes: event.description,
      //   startDate: event.startDate.getTime(),
      //   endDate: event.endDate.getTime(),
      //   calendarId: event.calendarId,
      //   location: event.location
      // });
      // return result.id;
      
      console.log('[Calendar Sync] Creating event:', event.title);
      return null;
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
  }): Promise<boolean> => {
    if (!isSupported || !permission.granted) {
      console.warn('[Calendar Sync] Cannot update event without permission');
      return false;
    }

    try {
      // TODO: Implémenter avec @capacitor-community/calendar
      // await Calendar.updateEvent({
      //   id: eventId,
      //   title: updates.title,
      //   notes: updates.description,
      //   startDate: updates.startDate?.getTime(),
      //   endDate: updates.endDate?.getTime(),
      //   location: updates.location
      // });
      
      console.log('[Calendar Sync] Updating event:', eventId);
      return true;
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
      // TODO: Implémenter avec @capacitor-community/calendar
      // await Calendar.deleteEvent({ id: eventId });
      
      console.log('[Calendar Sync] Deleting event:', eventId);
      return true;
    } catch (error) {
      console.error('[Calendar Sync] Error deleting event:', error);
      return false;
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
    deleteEvent
  };
};

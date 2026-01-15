import { useState, useEffect } from 'react';
import type { SyncConfig } from '../types';

const STORAGE_KEY = 'calendar_sync_config';
const CONFIG_VERSION = 2; // Incrémenter pour forcer la migration

const DEFAULT_CONFIG: SyncConfig = {
  selectedCalendarId: null,
  syncEnabled: false,
  intakes: {
    enabled: true,
    history: {
      keepHistory: true,
      deleteHistory: false,
      period: { value: 120, type: 'days' }
    },
    future: {
      syncFuture: true,
      doNotSync: false,
      period: { value: 14, type: 'days' }
    }
  },
  appointments: {
    enabled: true,
    syncDoctorVisits: true,
    syncLabVisits: true,
    syncPharmacyVisits: true,
    history: {
      keepHistory: true,
      deleteHistory: false,
      period: { value: 120, type: 'days' }
    },
    future: {
      syncFuture: true,
      doNotSync: false,
      period: { value: 120, type: 'days' }
    }
  },
  lastSyncDate: null,
  syncedEvents: {},
  version: CONFIG_VERSION
};

/**
 * Hook de gestion de la configuration de synchronisation
 * Version mise à jour avec nouvelle structure
 */
export const useSyncConfig = () => {
  const [config, setConfig] = useState<SyncConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as any;
        
        // Vérifier si migration nécessaire (version < 2 ou absente)
        const storedVersion = parsed.version || 0;
        const needsMigration = storedVersion < CONFIG_VERSION || 'syncIntakes' in parsed;
        
        if (needsMigration) {
          console.log('[Calendar Sync] Migrating config to version', CONFIG_VERSION);
          
          // Migration: Appliquer les nouvelles valeurs par défaut tout en conservant selectedCalendarId
          const migratedConfig: SyncConfig = {
            ...DEFAULT_CONFIG,
            selectedCalendarId: parsed.selectedCalendarId || null,
            lastSyncDate: parsed.lastSyncDate || null,
            syncedEvents: parsed.syncedEvents || {},
            version: CONFIG_VERSION
          };
          
          setConfig(migratedConfig);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedConfig));
        } else {
          // Config déjà à jour
          setConfig({ ...DEFAULT_CONFIG, ...parsed });
        }
      }
    } catch (error) {
      console.error('[Calendar Sync] Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: Partial<SyncConfig>) => {
    const newConfig = { ...config, ...updates, version: CONFIG_VERSION };
    setConfig(newConfig);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('[Calendar Sync] Error saving config:', error);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[Calendar Sync] Error resetting config:', error);
    }
  };

  return {
    config,
    loading,
    updateConfig,
    resetConfig
  };
};
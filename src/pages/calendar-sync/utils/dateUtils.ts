/**
 * Utilitaires de gestion des dates pour la synchronisation calendrier
 * CRITIQUE: Les dates en BDD sont en UTC, on les récupère telles quelles
 * sans conversion pour les synchroniser au calendrier natif
 */

/**
 * Récupère une date UTC depuis la BDD sans conversion
 * La date reste en UTC pour synchronisation correcte
 */
export const getUTCDateFromDB = (utcDateString: string): Date => {
  return new Date(utcDateString);
};

/**
 * Crée une date de fin (+30min par défaut pour les prises de médicaments)
 */
export const createEndDate = (startDate: Date, durationMinutes: number = 30): Date => {
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  return endDate;
};

/**
 * Filtre les événements à partir du 13/10/2025
 */
export const filterEventsFromStartDate = <T extends { scheduled_time?: string; visit_date?: string; prescription_date?: string }>(
  events: T[]
): T[] => {
  const startDate = new Date('2025-10-13T00:00:00Z');
  const now = new Date();
  
  return events.filter(event => {
    const eventDate = event.scheduled_time 
      ? new Date(event.scheduled_time)
      : event.visit_date
      ? new Date(event.visit_date)
      : event.prescription_date
      ? new Date(event.prescription_date)
      : null;
    
    if (!eventDate) return false;
    
    // Inclure uniquement les événements >= 13/10/2025 OU >= maintenant
    return eventDate >= startDate || eventDate >= now;
  });
};

/**
 * Détermine le statut d'une prise de médicament
 */
export const determineIntakeStatus = (scheduledTime: string, status: string): 'on_time' | 'late' | 'missed' | 'upcoming' => {
  const now = new Date();
  const scheduled = new Date(scheduledTime);
  const timeDiff = now.getTime() - scheduled.getTime();
  const minutesDiff = timeDiff / (1000 * 60);

  if (status === 'taken') {
    // Pris dans les 30min suivant l'heure prévue = à l'heure
    return minutesDiff <= 30 ? 'on_time' : 'late';
  }

  if (status === 'skipped') {
    return 'missed';
  }

  // Status = 'pending'
  if (scheduled > now) {
    return 'upcoming';
  }

  // En retard si > 30min après l'heure prévue
  if (minutesDiff > 30) {
    return 'late';
  }

  return 'upcoming';
};

/**
 * Formate le statut pour affichage dans le titre de l'événement
 */
export const formatStatusForTitle = (status: 'on_time' | 'late' | 'missed' | 'upcoming'): string => {
  const statusMap = {
    on_time: '✓ À l\'heure',
    late: '⚠ En retard',
    missed: '✗ Manquée',
    upcoming: '⏰ À venir'
  };
  return statusMap[status];
};

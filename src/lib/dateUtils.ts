import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Convertit une date UTC en heure française et la formate
 * Note: La base stocke en UTC, on veut afficher en heure locale française
 */
export const formatToFrenchTime = (utcDateString: string, formatPattern: string = 'HH:mm') => {
  const utcDate = parseISO(utcDateString);
  // Utiliser toLocaleString avec le timezone français
  const frenchTimeString = utcDate.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Si on veut un format personnalisé, on reconvertit
  if (formatPattern !== 'HH:mm') {
    const [hours, minutes] = frenchTimeString.split(':');
    const frenchDate = new Date();
    frenchDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return format(frenchDate, formatPattern, { locale: fr });
  }
  
  return frenchTimeString;
};

/**
 * Convertit une date UTC en heure française et la formate avec date complète
 */
export const formatToFrenchDateTime = (utcDateString: string, formatPattern: string = 'dd/MM/yyyy HH:mm') => {
  const utcDate = parseISO(utcDateString);
  return utcDate.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convertit une date française en UTC pour l'envoi à Supabase
 */
export const convertFrenchToUTC = (frenchDate: Date) => {
  return frenchDate; // Le navigateur stocke déjà en UTC
};

/**
 * Obtient la date actuelle en heure française
 */
export const getNowInFrenchTime = () => {
  return new Date(); // Le navigateur gère automatiquement
};

/**
 * Formate une date en heure française pour l'affichage
 */
export const formatFrenchDate = (date: Date, formatPattern: string = 'dd/MM/yyyy') => {
  return format(date, formatPattern, { locale: fr });
};
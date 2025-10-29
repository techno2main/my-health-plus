import type { CalendarEvent, IntakeStatus } from '../types';
import { 
  getUTCDateFromDB, 
  createEndDate, 
  determineIntakeStatus,
  formatStatusForTitle 
} from './dateUtils';

/**
 * Mappe les prises de médicaments vers des événements calendrier
 */
export const mapIntakesToEvents = (intakes: any[]): CalendarEvent[] => {
  return intakes.map(intake => {
    const startDate = getUTCDateFromDB(intake.scheduled_time);
    const endDate = createEndDate(startDate, 30);
    const status = determineIntakeStatus(intake.scheduled_time, intake.status);
    const statusText = formatStatusForTitle(status);

    const medicationName = intake.medications?.name || 'Médicament';
    const treatmentName = intake.medications?.treatments?.name || '';
    const dosage = intake.medications?.medication_catalog?.form || '';

    return {
      id: `intake_${intake.id}`,
      title: `${statusText} - ${medicationName}`,
      description: `Traitement: ${treatmentName}\nDosage: ${dosage}\nStatut: ${statusText}`,
      startDate,
      endDate,
      eventType: 'intake' as const,
      metadata: {
        appId: intake.id,
        status,
        medicationName,
        treatmentName
      }
    };
  });
};

/**
 * Mappe les visites pharmacie vers des événements calendrier
 */
export const mapPharmacyVisitsToEvents = (visits: any[]): CalendarEvent[] => {
  return visits.map(visit => {
    // visit_date est une date seule, on crée un événement toute la journée
    const visitDate = new Date(visit.visit_date + 'T09:00:00Z'); // 9h par défaut
    const endDate = createEndDate(visitDate, 60); // 1h de durée

    const pharmacyName = visit.pharmacies?.name || 'Pharmacie';
    const treatmentName = visit.treatments?.name || '';

    return {
      id: `pharmacy_${visit.id}`,
      title: `🏥 Visite pharmacie - ${pharmacyName}`,
      description: `Traitement: ${treatmentName}\nPharmacie: ${pharmacyName}\nVisite #${visit.visit_number}`,
      startDate: visitDate,
      endDate,
      location: visit.pharmacies?.address,
      eventType: 'pharmacy_visit' as const,
      metadata: {
        appId: visit.id,
        treatmentName,
        pharmacyName
      }
    };
  });
};

/**
 * Mappe les rendez-vous médecin (fin de traitement) vers des événements calendrier
 */
export const mapDoctorVisitsToEvents = (treatments: any[]): CalendarEvent[] => {
  return treatments
    .filter(t => t.end_date)
    .map(treatment => {
      const endDate = new Date(treatment.end_date + 'T14:00:00Z'); // 14h par défaut
      const appointmentEnd = createEndDate(endDate, 60); // 1h de durée

      const doctorName = treatment.prescriptions?.health_professionals?.name || 'Médecin';

      return {
        id: `doctor_${treatment.id}`,
        title: `👨‍⚕️ RDV Médecin - ${treatment.name}`,
        description: `Fin de traitement: ${treatment.name}\nMédecin: ${doctorName}\nPathologie: ${treatment.pathology || 'Non spécifiée'}`,
        startDate: endDate,
        endDate: appointmentEnd,
        eventType: 'doctor_visit' as const,
        metadata: {
          appId: treatment.id,
          treatmentName: treatment.name,
          professionalName: doctorName
        }
      };
    });
};

/**
 * Mappe les renouvellements d'ordonnance vers des événements calendrier
 */
export const mapPrescriptionRenewalsToEvents = (prescriptions: any[]): CalendarEvent[] => {
  return prescriptions.map(prescription => {
    const prescriptionDate = new Date(prescription.prescription_date);
    const renewalDate = new Date(prescriptionDate);
    renewalDate.setDate(renewalDate.getDate() + prescription.duration_days - 7); // 7 jours avant expiration
    
    const renewalEnd = createEndDate(renewalDate, 30);

    const doctorName = prescription.health_professionals?.name || 'Médecin';

    return {
      id: `renewal_${prescription.id}`,
      title: `📋 Renouvellement ordonnance`,
      description: `Médecin: ${doctorName}\nDurée: ${prescription.duration_days} jours\nPrévu 7 jours avant expiration`,
      startDate: renewalDate,
      endDate: renewalEnd,
      eventType: 'prescription_renewal' as const,
      metadata: {
        appId: prescription.id,
        professionalName: doctorName
      }
    };
  });
};

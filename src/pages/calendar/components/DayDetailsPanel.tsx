import { Card } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { getLocalDateString } from "@/lib/dateUtils";
import { IntakeDetailCard } from "./IntakeDetailCard";
import { VisitDetailCard } from "./VisitDetailCard";
import type { IntakeDetail, VisitDetail } from "../types";
import { ChevronUp, Calendar } from "lucide-react";

interface DayDetailsPanelProps {
  selectedDate: Date;
  dayDetails: IntakeDetail[];
  dayVisits: VisitDetail[];
  loading: boolean;
  treatmentStartDate: Date | null;
  nextPharmacyVisit: Date | null;
  nextDoctorVisit: Date | null;
  onScrollToCalendar?: () => void;
}

export const DayDetailsPanel = ({ selectedDate, dayDetails, dayVisits, loading, treatmentStartDate, nextPharmacyVisit, nextDoctorVisit, onScrollToCalendar }: DayDetailsPanelProps) => {
  const navigate = useNavigate();
  
  const hasAnyItem = dayDetails.length > 0 || dayVisits.length > 0;
  
  const isBeforeTreatmentStart = () => {
    if (!treatmentStartDate) return false;
    
    const selectedDateString = getLocalDateString(selectedDate);
    const treatmentStartDateString = getLocalDateString(treatmentStartDate);
    
    return selectedDateString < treatmentStartDateString;
  };

  // Vérifier si c'est aujourd'hui
  const isToday = getLocalDateString(selectedDate) === getLocalDateString(new Date());
  
  // Vérifier si c'est une date passée (antérieure à aujourd'hui)
  const isPastDate = getLocalDateString(selectedDate) < getLocalDateString(new Date());

  // Gérer le clic sur une prise
  const handleIntakeClick = (intake: IntakeDetail) => {
    if (isToday && intake.status === 'upcoming') {
      // Pour aujourd'hui : rediriger vers la page Accueil avec l'ID de la prise
      navigate(`/?intake=${intake.id}`);
    } else if (isPastDate) {
      // Pour les dates antérieures : rediriger vers l'historique
      // On pourra ajouter un filtre par médicament ultérieurement
      navigate(`/history?medication=${intake.medication}`);
    }
  };

  return (
    <Card className="p-6 surface-elevated">
      <div className="flex items-baseline gap-2 mb-4 flex-wrap">
        {isToday && <Calendar className="w-4 h-4 text-primary translate-y-0.5" />}
        <h3 className={`text-base font-semibold ${isToday ? 'text-primary' : ''}`}>
          {format(selectedDate, "d MMM yyyy", { locale: fr })}
        </h3>
        {hasAnyItem && (() => {
          const missedCount = dayDetails.filter(d => d.status === 'missed').length;
          const skippedCount = dayDetails.filter(d => d.status === 'skipped').length;
          const totalIntakes = dayDetails.length;
          const totalVisits = dayVisits.length;
          const totalProblems = missedCount + skippedCount;
          
          let statusParts: string[] = [];
          
          // Compter les prises avec les problèmes
          if (totalIntakes > 0) {
            let intakeText = `${totalIntakes} prise${totalIntakes > 1 ? 's' : ''}`;
            
            // Ajouter les problèmes directement après les prises
            if (totalProblems > 0) {
              if (missedCount > 0 && skippedCount > 0) {
                intakeText += ` (${totalProblems} manquée${totalProblems > 1 ? 's' : ''} ou sautée${totalProblems > 1 ? 's' : ''})`;
              } else if (missedCount > 0) {
                intakeText += ` (${missedCount} manquée${missedCount > 1 ? 's' : ''})`;
              } else if (skippedCount > 0) {
                intakeText += ` (${skippedCount} sautée${skippedCount > 1 ? 's' : ''})`;
              }
            }
            
            statusParts.push(intakeText);
          }
          
          // Compter les RDV
          if (totalVisits > 0) {
            statusParts.push(`${totalVisits} RDV`);
          }
          
          return (
            <span className="text-sm text-muted-foreground">
              {statusParts.join(' · ')}
            </span>
          );
        })()}
        {onScrollToCalendar && (
          <button
            onClick={onScrollToCalendar}
            className="ml-auto md:hidden text-muted-foreground hover:text-foreground transition-colors"
            title="Remonter au calendrier"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {!hasAnyItem ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucune prise ou RDV planifié
        </p>
      ) : (
        <div className="space-y-3">
          {/* RDV en premier - médecin avant pharmacie */}
          {dayVisits
            .sort((a, b) => {
              // Médecin (doctor) avant Pharmacie (pharmacy)
              if (a.type === 'doctor' && b.type === 'pharmacy') return -1;
              if (a.type === 'pharmacy' && b.type === 'doctor') return 1;
              return 0;
            })
            .map((visit) => (
              <VisitDetailCard key={visit.id} visit={visit} />
            ))}
          
          {/* Puis les prises */}
          {dayDetails.map((detail) => (
            <IntakeDetailCard 
              key={detail.id} 
              intake={detail} 
              isToday={isToday}
              isPastDate={isPastDate}
              onClick={() => handleIntakeClick(detail)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

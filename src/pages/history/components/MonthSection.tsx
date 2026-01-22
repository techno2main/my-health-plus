import { ChevronDown, ChevronRight } from "lucide-react";
import { MonthGroup } from "../hooks/useGroupedHistory";
import { DaySection } from "./DaySection";
import { StatusIcon } from "@/components/ui/status-icon";

interface MonthSectionProps {
  monthGroup: MonthGroup;
  isExpanded: boolean;
  onToggle: () => void;
  expandedDays: Set<string>;
  onToggleDay: (dateKey: string) => void;
}

export function MonthSection({
  monthGroup,
  isExpanded,
  onToggle,
  expandedDays,
  onToggleDay
}: MonthSectionProps) {
  const totalIntakes = monthGroup.days.reduce(
    (sum, day) => sum + day.intakes.length,
    0
  );
  
  const completedIntakes = monthGroup.days.reduce(
    (sum, day) => sum + day.intakes.filter(i => i.status !== 'pending').length,
    0
  );
  
  // Calcul des statistiques détaillées
  const stats = monthGroup.days.reduce(
    (acc, day) => {
      day.intakes.forEach(intake => {
        if (intake.status === 'taken' && intake.scheduledTimestamp && intake.takenAtTimestamp) {
          const scheduledTime = new Date(intake.scheduledTimestamp);
          const takenTime = new Date(intake.takenAtTimestamp);
          const delayMinutes = (takenTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
          
          if (delayMinutes <= 30) {
            acc.ontime++;
          } else {
            acc.late++;
          }
        } else if (intake.status === 'missed') {
          acc.missed++;
        } else if (intake.status === 'skipped') {
          acc.skipped++;
        }
      });
      return acc;
    },
    { ontime: 0, late: 0, missed: 0, skipped: 0 }
  );

  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-lg">{monthGroup.label}</h3>
            <p className="text-sm text-muted-foreground">
              {monthGroup.days.length} jour{monthGroup.days.length > 1 ? 's' : ''} • {completedIntakes}/{totalIntakes} prise{totalIntakes > 1 ? 's' : ''}
            </p>
            <div className="flex gap-3 text-xs mt-1.5">
              {stats.ontime > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <StatusIcon status="ontime" size="sm" showTooltip={false} />
                  <span>{stats.ontime}</span>
                </span>
              )}
              {stats.late > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <StatusIcon status="late" size="sm" showTooltip={false} />
                  <span>{stats.late}</span>
                </span>
              )}
              {stats.skipped > 0 && (
                <span className="flex items-center gap-1 text-warning">
                  <StatusIcon status="skipped" size="sm" showTooltip={false} />
                  <span>{stats.skipped}</span>
                </span>
              )}
              {stats.missed > 0 && (
                <span className="flex items-center gap-1 text-danger">
                  <StatusIcon status="missed" size="sm" showTooltip={false} />
                  <span>{stats.missed}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 pl-2">
          {monthGroup.days.map((day, dayIdx) => {
            const dateKey = day.date.toISOString();
            const isDayExpanded = expandedDays.has(dateKey);
            
            return (
              <DaySection
                key={dayIdx}
                day={day}
                isExpanded={isDayExpanded}
                onToggle={() => onToggleDay(dateKey)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

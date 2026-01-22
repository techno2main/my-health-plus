import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DayData } from '../types';

export interface MonthGroup {
  key: string;
  label: string;
  days: DayData[];
}

export function useGroupedHistory(historyData: DayData[]) {
  return useMemo(() => {
    const groups = new Map<string, DayData[]>();
    
    historyData.forEach((day) => {
      const monthKey = format(day.date, 'yyyy-MM', { locale: fr });
      const monthLabel = format(day.date, 'MMMM yyyy', { locale: fr });
      const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(day);
    });
    
    // Convert to array and sort by date descending
    const monthGroups: MonthGroup[] = Array.from(groups.entries())
      .map(([key, days]) => ({
        key,
        label: format(days[0].date, 'MMMM yyyy', { locale: fr }).replace(/^\w/, c => c.toUpperCase()),
        days: days.sort((a, b) => b.date.getTime() - a.date.getTime())
      }))
      .sort((a, b) => b.key.localeCompare(a.key));
    
    return monthGroups;
  }, [historyData]);
}

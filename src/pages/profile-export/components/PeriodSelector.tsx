import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePickerM3 } from "@/components/ui/date-picker-m3";
import { X } from "lucide-react";
import { format } from "date-fns";
import { ExportConfig } from "../types";

interface PeriodSelectorProps {
  config: ExportConfig;
  onConfigChange: (config: Partial<ExportConfig>) => void;
}

export function PeriodSelector({ config, onConfigChange }: PeriodSelectorProps) {
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onConfigChange({ startDate: `${year}-${month}-${day}` });
    } else {
      onConfigChange({ startDate: null });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onConfigChange({ endDate: `${year}-${month}-${day}` });
    } else {
      onConfigChange({ endDate: null });
    }
  };

  const clearStartDate = () => {
    onConfigChange({ startDate: null });
  };

  const clearEndDate = () => {
    onConfigChange({ endDate: null });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Période d'export</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Sélectionnez une période pour limiter les données exportées (optionnel)
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Date de début</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePickerM3
                variant="popover"
                value={config.startDate ? new Date(config.startDate) : undefined}
                onChange={handleStartDateChange}
                placeholder="Sélectionner"
              />
            </div>
            {config.startDate && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearStartDate}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date de fin</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePickerM3
                variant="popover"
                value={config.endDate ? new Date(config.endDate) : undefined}
                onChange={handleEndDateChange}
                placeholder="Sélectionner"
              />
            </div>
            {config.endDate && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearEndDate}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

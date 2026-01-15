import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TimePickerInput } from "@/components/ui/time-picker-dialog";
import { Plus, Minus, CheckCircle2 } from "lucide-react";

interface PosologyConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicationName: string;
  medicationStrength?: string;
  initialPosology?: string;
  initialTimes?: string[];
  onConfirm: (posology: string, times: string[]) => void;
}

// Détection automatique du nombre de prises
const detectTakesFromDosage = (posology: string): number => {
  const text = posology.toLowerCase().trim();
  
  const numericMatch = text.match(/(\d+)\s*(fois|x)\s*(par\s*jour|\/jour)/i);
  if (numericMatch) return parseInt(numericMatch[1]);
  
  const moments = [];
  if (/matin|matinée|lever|réveil/i.test(text)) moments.push('matin');
  if (/midi|déjeuner/i.test(text)) moments.push('midi');
  if (/après.midi|après midi|aprem|apm/i.test(text)) moments.push('apres-midi');
  if (/soir|soirée/i.test(text)) moments.push('soir');
  if (/coucher/i.test(text)) moments.push('coucher');
  
  if (moments.length > 0) return moments.length;
  if (/ et | puis | avec /i.test(text)) return text.split(/ et | puis | avec /i).length;
  
  return 1;
};

const getDefaultTimes = (numberOfTakes: number): string[] => {
  switch(numberOfTakes) {
    case 1: return ['09:30'];
    case 2: return ['09:30', '19:30'];
    case 3: return ['09:30', '12:30', '19:30'];
    case 4: return ['09:30', '12:30', '16:00', '19:30'];
    default: return Array(numberOfTakes).fill(0).map((_, i) => {
      const hour = 9 + (i * 12 / numberOfTakes);
      return `${Math.floor(hour).toString().padStart(2, '0')}:30`;
    });
  }
};

export function PosologyConfigDialog({
  open,
  onOpenChange,
  medicationName,
  medicationStrength,
  initialPosology = "",
  initialTimes = [],
  onConfirm
}: PosologyConfigDialogProps) {
  const fullMedicationName = medicationStrength 
    ? `${medicationName} ${medicationStrength}` 
    : medicationName;
  const [posology, setPosology] = useState(initialPosology);
  const [times, setTimes] = useState<string[]>(initialTimes.length > 0 ? initialTimes : ['09:30']);

  useEffect(() => {
    if (open) {
      setPosology(initialPosology);
      setTimes(initialTimes.length > 0 ? initialTimes : ['09:30']);
    }
  }, [open, initialPosology, initialTimes]);

  useEffect(() => {
    if (posology) {
      const detectedTakes = detectTakesFromDosage(posology);
      if (detectedTakes !== times.length) {
        setTimes(getDefaultTimes(detectedTakes));
      }
    }
  }, [posology]);

  const addTimeSlot = () => {
    setTimes([...times, '09:30']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleConfirm = () => {
    if (!posology.trim()) {
      return;
    }
    onConfirm(posology, times);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurer la posologie</DialogTitle>
          <DialogDescription>{fullMedicationName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badge indicateur si posologie pré-remplie */}
          {initialPosology && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400">
                Posologie pré-remplie depuis votre historique. Vous pouvez la modifier si besoin.
              </p>
            </div>
          )}

          {/* Posologie */}
          <div className="space-y-2">
            <Label htmlFor="posology">Posologie</Label>
            <Input
              id="posology"
              value={posology}
              onChange={(e) => setPosology(e.target.value)}
              placeholder="Ex: 1 comprimé matin et soir"
              className="cursor-text"
            />
            <p className="text-xs text-muted-foreground">
              Le nombre de prises sera détecté automatiquement
            </p>
          </div>

          {/* Horaires */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Horaires de prise ({times.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TimePickerInput
                    value={time}
                    onValueChange={(value) => updateTime(index, value)}
                  />
                  {times.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleConfirm} className="flex-1 gradient-primary" disabled={!posology.trim()}>
              Confirmer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

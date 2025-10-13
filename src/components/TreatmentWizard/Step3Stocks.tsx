import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TreatmentFormData } from "./types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface Step3StocksProps {
  formData: TreatmentFormData;
  setFormData: (data: TreatmentFormData) => void;
}

export function Step3Stocks({ formData, setFormData }: Step3StocksProps) {
  const [loadingStocks, setLoadingStocks] = useState(true);

  useEffect(() => {
    loadExistingStocks();
  }, [formData.medications]);

  const loadExistingStocks = async () => {
    setLoadingStocks(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer tous les médicaments actifs de l'utilisateur
      const { data: existingMedications } = await supabase
        .from("medications")
        .select(`
          name,
          current_stock,
          min_threshold,
          treatments!inner(user_id, is_active)
        `)
        .eq("treatments.user_id", user.id)
        .eq("treatments.is_active", true);

      if (existingMedications) {
        const newStocks = { ...formData.stocks };
        const updatedMedications = [...formData.medications];
        let hasChanges = false;

        formData.medications.forEach((med, index) => {
          // Chercher le médicament existant par nom
          const existing = existingMedications.find(
            (em) => em.name.toLowerCase() === med.name.toLowerCase()
          );

          if (existing) {
            // Pré-remplir avec le stock actuel existant
            if (!(index in newStocks) || newStocks[index] === 0) {
              newStocks[index] = existing.current_stock || 0;
              hasChanges = true;
            }
            // Mettre à jour le seuil d'alerte si non défini
            if (updatedMedications[index].minThreshold === 10 && existing.min_threshold) {
              updatedMedications[index].minThreshold = existing.min_threshold;
              hasChanges = true;
            }
          } else {
            // Initialiser à 0 si pas trouvé
            if (!(index in newStocks)) {
              newStocks[index] = 0;
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          setFormData({ 
            ...formData, 
            stocks: newStocks,
            medications: updatedMedications 
          });
        }
      }
    } catch (error) {
      console.error("Error loading existing stocks:", error);
    } finally {
      setLoadingStocks(false);
    }
  };

  const updateStock = (index: number, value: number) => {
    setFormData({
      ...formData,
      stocks: { ...formData.stocks, [index]: value },
    });
  };

  const hasEmptyStocks = formData.medications.some((_, index) => 
    !formData.stocks[index] || formData.stocks[index] === 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {hasEmptyStocks && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Certains médicaments ont un stock initial à 0. Veuillez renseigner les stocks disponibles.
          </AlertDescription>
        </Alert>
      )}

      {formData.medications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Aucun médicament à configurer</p>
          <p className="text-sm text-muted-foreground mt-2">
            Retournez à l'étape précédente pour ajouter des médicaments
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {formData.medications.map((med, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{med.name}</h4>
                  {med.pathology && (
                    <Badge variant="secondary" className="mt-1">
                      {med.pathology}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`stock-${index}`}>
                    Stock initial *
                    {(!formData.stocks[index] || formData.stocks[index] === 0) && (
                      <span className="text-destructive ml-1">Obligatoire</span>
                    )}
                  </Label>
                  <Input
                    id={`stock-${index}`}
                    type="number"
                    min="0"
                    value={formData.stocks[index] || 0}
                    onChange={(e) => updateStock(index, parseInt(e.target.value) || 0)}
                    className="bg-surface"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seuil d'alerte</Label>
                  <Input
                    type="number"
                    min="0"
                    value={med.minThreshold}
                    onChange={(e) => {
                      const updated = [...formData.medications];
                      updated[index].minThreshold = parseInt(e.target.value) || 0;
                      setFormData({ ...formData, medications: updated });
                    }}
                    className="bg-surface"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Consommation estimée:</span>{" "}
                  {med.takesPerDay * med.unitsPerTake} unités/jour
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Durée estimée:{" "}
                  {formData.stocks[index] 
                    ? Math.floor(formData.stocks[index] / (med.takesPerDay * med.unitsPerTake))
                    : 0}{" "}
                  jours
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

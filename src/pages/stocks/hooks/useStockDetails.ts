import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getStockStatus, calculateEstimatedDays } from "../utils/stockUtils";

export function useStockDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medication, setMedication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMedication(id);
    }
  }, [id]);

  const loadMedication = async (medicationId: string) => {
    setIsLoading(true);
    try {
      // Charger le médicament
      const { data, error } = await supabase
        .from("medications")
        .select(
          `
          *,
          medication_catalog(strength, default_posology)
        `
        )
        .eq("id", medicationId)
        .single();

      if (error) throw error;

      // Charger les prises quotidiennes pour calculer le nombre réel de prises par jour
      // On compte les prises upcoming pour aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: intakesData, error: intakesError } = await supabase
        .from("medication_intakes")
        .select("id")
        .eq("medication_id", medicationId)
        .gte("scheduled_time", today.toISOString())
        .lt("scheduled_time", tomorrow.toISOString());

      if (intakesError) {
        console.warn("Error loading intakes:", intakesError);
      }

      // Utiliser le nombre de prises réelles trouvées
      const actualTakesPerDay = intakesData && intakesData.length > 0 ? intakesData.length : 1;
      
      setMedication({ ...data, actualTakesPerDay });
    } catch (error: any) {
      toast.error("Erreur lors du chargement du médicament");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStock = medication?.current_stock || 0;
  const minThreshold = medication?.min_threshold || 10;
  const takesPerDay = medication?.actualTakesPerDay || 1;
  const unitsPerTake = medication?.units_per_take || 1;

  const status = getStockStatus(currentStock, minThreshold);
  const estimatedDays = calculateEstimatedDays(currentStock, takesPerDay, unitsPerTake);

  const handleAdjust = () => {
    navigate(`/stocks/adjust?id=${id}`);
  };

  return {
    medication,
    currentStock,
    minThreshold,
    takesPerDay,
    unitsPerTake,
    status,
    estimatedDays,
    isLoading,
    handleAdjust,
    handleBack: () => navigate("/stocks"),
  };
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook pour supprimer un médicament d'un traitement
 */
export const useMedicationDelete = () => {
  const [loading, setLoading] = useState(false);

  const deleteMedication = async (
    medicationId: string,
    medicationName: string
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // Supprimer le médicament (les prises sont supprimées automatiquement via CASCADE)
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", medicationId);

      if (error) throw error;

      toast.success(`${medicationName} supprimé du traitement`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du médicament:", error);
      toast.error("Erreur lors de la suppression");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMedication, loading };
};

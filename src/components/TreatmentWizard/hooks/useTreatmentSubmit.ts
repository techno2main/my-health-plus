import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAuthenticatedUser } from "@/lib/auth-guard";
import { TreatmentFormData } from "../types";
import {
  buildPrescriptionData,
  buildTreatmentData,
  buildMedicationsData,
  buildPharmacyVisitsData,
} from "../utils/treatmentDataBuilders";
import {
  handleAuthError,
  handleSubmitError,
  handleValidationError,
  handleSubmitSuccess,
} from "../utils/errorHandlers";

interface UseTreatmentSubmitReturn {
  loading: boolean;
  handleSubmit: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer la soumission du formulaire de traitement
 */
export const useTreatmentSubmit = (
  formData: TreatmentFormData,
  canSubmit: () => boolean
): UseTreatmentSubmitReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  /**
   * Upload du fichier prescription vers Supabase Storage
   */
  const uploadPrescriptionFile = async (
    userId: string,
    prescriptionId: string,
    file: File,
    fileName: string
  ): Promise<void> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Mettre à jour la prescription avec le fichier
    const { error: updateError } = await supabase
      .from("prescriptions")
      .update({
        file_path: filePath,
        original_filename: fileName,
      })
      .eq('id', prescriptionId);

    if (updateError) throw updateError;
  };

  /**
   * Crée ou récupère l'ID de la prescription
   */
  const ensurePrescriptionExists = async (userId: string): Promise<string> => {
    let prescriptionId = formData.prescriptionId;

    // Créer une prescription si elle n'existe pas
    if (!prescriptionId) {
      const prescriptionData = buildPrescriptionData(userId, formData);
      
      const { data: prescData, error: prescError } = await supabase
        .from("prescriptions")
        .insert(prescriptionData)
        .select()
        .single();

      if (prescError) throw prescError;
      prescriptionId = prescData.id;
    }

    // Upload du fichier si présent
    if (formData.prescriptionFile && prescriptionId) {
      await uploadPrescriptionFile(
        userId,
        prescriptionId,
        formData.prescriptionFile,
        formData.prescriptionFileName
      );
    }

    return prescriptionId;
  };

  /**
   * Soumission complète du traitement
   */
  const handleSubmit = async (): Promise<void> => {
    // Validation
    if (!canSubmit()) {
      handleValidationError(toast);
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Authentification
      const { data: user, error: authError } = await getAuthenticatedUser();
      if (authError || !user) {
        handleAuthError(toast, authError?.message);
        return;
      }

      // 2. Créer ou récupérer la prescription
      const prescriptionId = await ensurePrescriptionExists(user.id);

      // 3. Créer le traitement
      const treatmentData = buildTreatmentData(user.id, prescriptionId, formData);
      
      const { data: treatment, error: treatmentError } = await supabase
        .from("treatments")
        .insert(treatmentData)
        .select()
        .single();

      if (treatmentError) throw treatmentError;

      // 4. Créer les médicaments
      const medicationsData = buildMedicationsData(treatment.id, formData);
      
      const { error: medError } = await supabase
        .from("medications")
        .insert(medicationsData);

      if (medError) throw medError;

      // 5. Créer les visites à la pharmacie
      const visitsData = buildPharmacyVisitsData(treatment.id, formData);
      
      if (visitsData.length > 0) {
        const { error: visitsError } = await supabase
          .from("pharmacy_visits")
          .insert(visitsData);

        if (visitsError) throw visitsError;
      }

      // 6. Succès
      handleSubmitSuccess(toast);
      navigate("/");
      
    } catch (error) {
      handleSubmitError(toast, error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit,
  };
};

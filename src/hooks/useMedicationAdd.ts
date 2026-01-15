import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedMedication {
  name: string;
  strength?: string;
  form?: string;
  pathologyId?: string;
  pathologyName?: string;
  description?: string;
  source: 'ansm' | 'manual';
}

interface MedicationFormData {
  name: string;
  posology: string;
  times: string[];
  strength?: string;
  catalogId?: string;
}

export interface UseMedicationAddReturn {
  isAdding: boolean;
  handleAddMedication: (selected: SelectedMedication, formData: MedicationFormData, treatmentId: string) => Promise<boolean>;
  handleUpdateMedication: (medicationId: string, formData: MedicationFormData) => Promise<boolean>;
}

export function useMedicationAdd(): UseMedicationAddReturn {
  const [isAdding, setIsAdding] = useState(false);

  const ensureCatalogEntry = async (selected: SelectedMedication): Promise<string> => {
    // Recherche par nom + dosage pour éviter doublons DCI
    // Ex: ATORVASTATINE ACCORD 10mg et ATORVASTATINE ALMUS 10mg → même entrée
    let query = supabase
      .from("medication_catalog")
      .select("id")
      .eq("name", selected.name);
    
    // Ajouter filtre sur strength si présent
    if (selected.strength) {
      query = query.eq("strength", selected.strength);
    } else {
      query = query.is("strength", null);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      console.log(`[Catalog] Réutilisation médicament existant: ${selected.name} ${selected.strength || ''}`);
      return existing.id;
    }

    // Créer nouvelle entrée dans le catalogue (DCI + dosage uniquement)
    console.log(`[Catalog] Création nouveau médicament: ${selected.name} ${selected.strength || ''}`);
    const { data: newCatalog, error } = await supabase
      .from("medication_catalog")
      .insert({
        name: selected.name,
        strength: selected.strength,
        form: selected.form,
        pathology_id: selected.pathologyId || null,
        description: selected.description,
        is_approved: selected.source === 'ansm', // Auto-validé si ANSM
      })
      .select("id")
      .single();

    if (error) {
      // Si erreur de contrainte unique, retenter la recherche (race condition)
      if (error.code === '23505') {
        console.log(`[Catalog] Doublon détecté, récupération...`);
        const { data: retry } = await query.maybeSingle();
        if (retry) return retry.id;
      }
      throw error;
    }
    
    return newCatalog.id;
  };

  const handleAddMedication = async (
    selected: SelectedMedication,
    formData: MedicationFormData,
    treatmentId: string
  ): Promise<boolean> => {
    setIsAdding(true);
    try {
      // 1. Créer/récupérer entrée catalogue
      const catalogId = await ensureCatalogEntry(selected);

      // 2. Insérer médicament dans le traitement
      const { error } = await supabase
        .from("medications")
        .insert({
          treatment_id: treatmentId,
          catalog_id: catalogId,
          name: formData.name,
          posology: formData.posology,
          times: formData.times,
          strength: formData.strength,
          current_stock: 0,
          min_threshold: 10,
        });

      if (error) throw error;

      toast.success("Médicament ajouté avec succès");
      return true;
    } catch (error) {
      console.error("Erreur ajout médicament:", error);
      toast.error("Erreur lors de l'ajout du médicament");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateMedication = async (
    medicationId: string,
    formData: MedicationFormData
  ): Promise<boolean> => {
    setIsAdding(true);
    try {
      const updateData: any = {
        name: formData.name,
        posology: formData.posology,
        times: formData.times,
      };

      if (formData.strength) {
        updateData.strength = formData.strength;
      }

      if (formData.catalogId) {
        updateData.catalog_id = formData.catalogId;
      }

      const { error } = await supabase
        .from("medications")
        .update(updateData)
        .eq("id", medicationId);

      if (error) throw error;

      toast.success("Médicament mis à jour");
      return true;
    } catch (error) {
      console.error("Erreur mise à jour médicament:", error);
      toast.error("Erreur lors de la mise à jour");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    isAdding,
    handleAddMedication,
    handleUpdateMedication,
  };
}

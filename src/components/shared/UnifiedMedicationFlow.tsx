import { useState } from "react";
import { MedicationSearchDialog } from "./MedicationSearchDialog";
import { PosologyConfigDialog } from "./PosologyConfigDialog";
import { useMedicationAdd } from "@/hooks/useMedicationAdd";
import { toast } from "sonner";

interface UnifiedMedicationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentId: string;
  onSuccess?: () => void;
}

interface SelectedMedication {
  name: string;
  strength?: string;
  form?: string;
  pathologyId?: string;
  pathologyName?: string;
  description?: string;
  source: 'ansm' | 'manual';
}

export function UnifiedMedicationFlow({
  open,
  onOpenChange,
  treatmentId,
  onSuccess,
}: UnifiedMedicationFlowProps) {
  const [selectedMedication, setSelectedMedication] = useState<SelectedMedication | null>(null);
  const [showPosologyDialog, setShowPosologyDialog] = useState(false);
  const { handleAddMedication, isAdding } = useMedicationAdd();

  const handleMedicationSelect = (medication: SelectedMedication) => {
    setSelectedMedication(medication);
    onOpenChange(false); // Fermer dialog recherche
    setShowPosologyDialog(true); // Ouvrir dialog posologie
  };

  const handlePosologyConfirm = async (posology: string, times: string[]) => {
    if (!selectedMedication) return;

    try {
      const success = await handleAddMedication(
        selectedMedication,
        {
          name: selectedMedication.name,
          posology,
          times,
          strength: selectedMedication.strength,
        },
        treatmentId
      );

      if (success) {
        toast.success("Médicament ajouté avec succès");
        setShowPosologyDialog(false);
        setSelectedMedication(null);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Erreur ajout médicament:", error);
      toast.error("Erreur lors de l'ajout du médicament");
    }
  };

  const handlePosologyCancel = () => {
    setShowPosologyDialog(false);
    setSelectedMedication(null);
    onOpenChange(true); // Réouvrir la recherche
  };

  return (
    <>
      <MedicationSearchDialog
        open={open}
        onOpenChange={onOpenChange}
        onSelect={handleMedicationSelect}
      />

      {selectedMedication && (
        <PosologyConfigDialog
          open={showPosologyDialog}
          onOpenChange={setShowPosologyDialog}
          medicationName={selectedMedication.name}
          onConfirm={handlePosologyConfirm}
        />
      )}
    </>
  );
}

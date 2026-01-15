import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { TreatmentFormData, MedicationItem } from "./types"
import { useStep2Medications } from "./hooks/useStep2Medications"
import { MedicationsList } from "./components/MedicationsList"
import { MedicationsProvider } from "./contexts/MedicationsContext"
import { MedicationSearchDialog } from "@/components/shared/MedicationSearchDialog"
import { PosologyConfigDialog } from "@/components/shared/PosologyConfigDialog"
import { supabase } from "@/integrations/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Step2MedicationsProps {
  formData: TreatmentFormData
  setFormData: (data: TreatmentFormData) => void
}

export function Step2Medications({ formData, setFormData }: Step2MedicationsProps) {
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showPosologyDialog, setShowPosologyDialog] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<any>(null)
  const [existingPosology, setExistingPosology] = useState<string>("")
  const [existingTimes, setExistingTimes] = useState<string[]>([])
  
  const {
    updateMedication,
    updateMedicationPosology,
    removeMedication,
    updateTimeSlot,
    updateTakesPerDay,
  } = useStep2Medications(formData, setFormData, () => {})

  const handleMedicationSelect = async (medication: any) => {
    let pathologyName = medication.pathologyName;
    
    // Récupérer la posologie ET la pathologie si le médicament est déjà dans le catalogue
    if (medication.catalogId) {
      const { data: catalogMed, error: catalogError } = await supabase
        .from('medication_catalog')
        .select('pathology_id, pathologies(name)')
        .eq('id', medication.catalogId)
        .single()
      
      if (!catalogError && catalogMed?.pathologies) {
        pathologyName = (catalogMed.pathologies as any).name;
      }
      
      const { data: existingMed, error } = await supabase
        .from('medications')
        .select('posology, times')
        .eq('catalog_id', medication.catalogId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (!error && existingMed) {
        setExistingPosology(existingMed.posology || '')
        setExistingTimes(existingMed.times || [])
      } else {
        setExistingPosology('')
        setExistingTimes([])
      }
    } else {
      setExistingPosology('')
      setExistingTimes([])
    }
    
    // Mettre à jour la pathologie dans l'objet medication
    setSelectedMedication({
      ...medication,
      pathologyName: pathologyName || medication.pathologyName
    })
    setShowSearchDialog(false)
    setShowPosologyDialog(true)
  }

  const handlePosologyConfirm = (posology: string, times: string[]) => {
    if (!selectedMedication) return

    const newMed: MedicationItem = {
      name: selectedMedication.name,
      pathology: selectedMedication.pathologyName || 'Non spécifié',
      posology,
      takesPerDay: times.length,
      times,
      unitsPerTake: 1,
      minThreshold: 10,
      strength: selectedMedication.strength,
      isCustom: selectedMedication.source === 'manual',
      pendingInsertion: true,
    }

    setFormData({
      ...formData,
      medications: [...formData.medications, newMed]
    })

    setShowPosologyDialog(false)
    setSelectedMedication(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowSearchDialog(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Rechercher un médicament
      </Button>

      <MedicationsProvider
        value={{
          medications: formData.medications,
          handlers: {
            onRemove: removeMedication,
            onUpdate: updateMedication,
            onUpdatePosology: updateMedicationPosology,
            onUpdateTimeSlot: updateTimeSlot,
            onUpdateTakesPerDay: updateTakesPerDay
          }
        }}
      >
        <MedicationsList />
      </MedicationsProvider>

      <MedicationSearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        onSelect={handleMedicationSelect}
      />

      {selectedMedication && (
        <PosologyConfigDialog
          open={showPosologyDialog}
          onOpenChange={setShowPosologyDialog}
          medicationName={selectedMedication.name}
          medicationStrength={selectedMedication.strength}
          initialPosology={existingPosology}
          initialTimes={existingTimes}
          onConfirm={handlePosologyConfirm}
        />
      )}
    </div>
  )
}

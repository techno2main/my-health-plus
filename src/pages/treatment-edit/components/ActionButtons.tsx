import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Save, Trash2, X } from "lucide-react"
import { useState, useEffect } from "react"

interface ActionButtonsProps {
  onSave: () => void
  onCancel: () => void
  deleteDialogOpen: boolean
  onDeleteDialogChange: (open: boolean) => void
  onDelete: () => void
}

export const ActionButtons = ({
  onSave,
  onCancel,
  deleteDialogOpen,
  onDeleteDialogChange,
  onDelete
}: ActionButtonsProps) => {
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [confirmSaveChecked, setConfirmSaveChecked] = useState(false)

  // Reset checkbox when dialogs close
  useEffect(() => {
    if (!deleteDialogOpen) {
      setConfirmDeleteChecked(false)
    }
  }, [deleteDialogOpen])

  useEffect(() => {
    if (!saveDialogOpen) {
      setConfirmSaveChecked(false)
    }
  }, [saveDialogOpen])

  return (
    <>
      <div className="space-y-3">
        {/* Ligne 1: Enregistrer + Supprimer */}
        <div className="flex gap-3">
          <Button className="flex-1 gradient-primary" onClick={() => setSaveDialogOpen(true)}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-danger text-danger hover:bg-danger hover:text-white"
            onClick={() => onDeleteDialogChange(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
        
        {/* Ligne 2: Annuler */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
      </div>

      {/* Dialog de confirmation de sauvegarde */}
      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enregistrer les modifications</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Vous devez confirmer pour enregistrer les modifications apportées à ce traitement.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Checkbox 
              id="confirm-save" 
              checked={confirmSaveChecked}
              onCheckedChange={(checked) => setConfirmSaveChecked(checked === true)}
            />
            <Label 
              htmlFor="confirm-save" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Je confirme les modifications apportées
            </Label>
          </div>

          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="mt-0 flex-1">Annuler</AlertDialogCancel>
            <Button 
              className="flex-1 gradient-primary"
              disabled={!confirmSaveChecked}
              onClick={() => {
                onSave();
                setSaveDialogOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Le traitement actuel sera définitivement supprimé.</p>
                <p className="font-semibold text-destructive">Cette action est irréversible.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Checkbox 
              id="confirm-delete" 
              checked={confirmDeleteChecked}
              onCheckedChange={(checked) => setConfirmDeleteChecked(checked === true)}
            />
            <Label 
              htmlFor="confirm-delete" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Je confirme vouloir supprimer ce traitement
            </Label>
          </div>

          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="mt-0 flex-1">Annuler</AlertDialogCancel>
            <Button 
              variant="destructive" 
              className="flex-1"
              disabled={!confirmDeleteChecked}
              onClick={() => {
                onDelete();
                onDeleteDialogChange(false);
              }}
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

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
import { Save, Trash2 } from "lucide-react"

interface ActionButtonsProps {
  onSave: () => void
  deleteDialogOpen: boolean
  onDeleteDialogChange: (open: boolean) => void
  onDelete: () => void
}

export const ActionButtons = ({
  onSave,
  deleteDialogOpen,
  onDeleteDialogChange,
  onDelete
}: ActionButtonsProps) => {
  return (
    <>
      <div className="space-y-3">
        <Button className="w-full" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-danger text-danger hover:bg-danger hover:text-white"
          onClick={() => onDeleteDialogChange(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer le traitement
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="mt-0 flex-1">Annuler</AlertDialogCancel>
            <Button 
              variant="destructive" 
              className="flex-1"
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

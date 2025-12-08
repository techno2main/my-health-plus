import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ProfessionalDeleteAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProfessionalDeleteAlert({ open, onClose, onConfirm }: ProfessionalDeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
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
              onConfirm();
              onClose();
            }}
          >
            Supprimer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: DeleteConfirmDialogProps) {
  const [confirmChecked, setConfirmChecked] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmChecked(false);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    onConfirm();
    setConfirmChecked(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Cet élément de menu sera définitivement supprimé.</p>
              <p className="font-semibold text-destructive">Cette action est irréversible.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <Checkbox 
            id="confirm-delete" 
            checked={confirmChecked}
            onCheckedChange={(checked) => setConfirmChecked(checked === true)}
          />
          <Label 
            htmlFor="confirm-delete" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Je confirme vouloir supprimer cet élément
          </Label>
        </div>

        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="mt-0 flex-1">Annuler</AlertDialogCancel>
          <Button 
            variant="destructive" 
            className="flex-1"
            disabled={!confirmChecked}
            onClick={handleConfirm}
          >
            Supprimer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

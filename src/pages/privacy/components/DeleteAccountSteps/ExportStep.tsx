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
import { Download } from "lucide-react";

interface ExportStepProps {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
  onSkip: () => void;
}

export function ExportStep({ open, onClose, onExport, onSkip }: ExportStepProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Suppression de votre compte
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-justify">
                Avant de supprimer votre compte, il est vivement recommandé de télécharger une copie de toutes vos données médicales.
              </p>
              <div className="bg-muted p-3 rounded-lg space-y-2">
                <p className="font-semibold text-sm text-justify">Le fichier PDF contiendra :</p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-justify">
                  <li>Votre profil médical complet</li>
                  <li>L'historique de vos traitements</li>
                  <li>Vos ordonnances</li>
                  <li>L'historique des prises</li>
                  <li>L'état de vos stocks</li>
                </ul>
              </div>
              <p className="text-warning font-medium text-justify">
                ⚠️ Une fois le compte supprimé, ces données seront définitivement perdues.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={onExport}
            className="w-full"
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger mes données (recommandé)
          </Button>
          <AlertDialogCancel className="w-full m-0" onClick={onClose}>
            Annuler la suppression
          </AlertDialogCancel>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-danger"
          >
            Continuer sans télécharger
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

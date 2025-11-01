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
import { AlertTriangle } from "lucide-react";

interface WarningStepProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WarningStep({ open, onClose, onConfirm }: WarningStepProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Êtes-vous absolument certain(e) ?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="font-semibold text-justify">
                La suppression de votre compte entraînera la perte définitive de :
              </p>
              <div className="bg-danger/10 border border-danger/20 p-3 rounded-lg">
                <ul className="space-y-2 text-sm text-justify">
                  <li className="flex items-start gap-2">
                    <span className="text-danger font-bold">✗</span>
                    <span>Tous vos traitements actifs et archivés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger font-bold">✗</span>
                    <span>Toutes vos ordonnances et documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger font-bold">✗</span>
                    <span>L'historique complet de vos prises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger font-bold">✗</span>
                    <span>Vos stocks et alertes configurées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger font-bold">✗</span>
                    <span>Votre profil et préférences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-danger font-bold">✗</span>
                    <span>Toutes vos notifications programmées</span>
                  </li>
                </ul>
              </div>
              <p className="text-danger font-bold text-center">
                ⚠️ Cette action est IRRÉVERSIBLE ⚠️
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogCancel className="w-full m-0" onClick={onClose}>
            Non, conserver mon compte
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            variant="destructive"
            className="w-full"
          >
            Oui, je veux supprimer mon compte
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

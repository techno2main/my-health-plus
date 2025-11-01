import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert } from "lucide-react";

interface ConfirmationStepProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  authProvider: string | null;
  biometricEnabled: boolean;
  understood: boolean;
  onUnderstoodChange: (checked: boolean) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  isDeleting: boolean;
}

export function ConfirmationStep({
  open,
  onClose,
  onConfirm,
  authProvider,
  biometricEnabled,
  understood,
  onUnderstoodChange,
  password,
  onPasswordChange,
  isDeleting,
}: ConfirmationStepProps) {
  const canDelete = understood && (authProvider === "google" || biometricEnabled || password.length >= 6);

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-danger">
            <ShieldAlert className="h-5 w-5" />
            Confirmation finale
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="font-semibold text-justify">
                Pour confirmer la suppression définitive de votre compte, veuillez :
              </p>

              {/* Checkbox de compréhension */}
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Checkbox
                  id="understand"
                  checked={understood}
                  onCheckedChange={(checked) => onUnderstoodChange(checked as boolean)}
                  className="mt-1"
                />
                <Label
                  htmlFor="understand"
                  className="text-sm font-medium leading-relaxed cursor-pointer text-justify"
                >
                  J'ai bien compris que cette action est irréversible et que toutes mes données seront définitivement supprimées sans possibilité de récupération.
                </Label>
              </div>

              {/* Authentification */}
              {authProvider === "google" ? (
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                  <p className="text-sm text-justify">
                    ℹ️ Votre compte est lié à Google. La suppression sera effective immédiatement après confirmation.
                  </p>
                </div>
              ) : biometricEnabled ? (
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg space-y-3">
                  <p className="text-sm font-medium text-justify">
                    🔐 Authentification biométrique disponible
                  </p>
                  <p className="text-sm text-muted-foreground text-justify">
                    Vous pourrez utiliser votre empreinte digitale ou Face ID pour confirmer la suppression.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">
                    Entrez votre mot de passe actuel
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full"
                    disabled={isDeleting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 caractères requis
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogCancel className="w-full m-0" onClick={onClose} disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? "Suppression en cours..." : "Supprimer définitivement mon compte"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

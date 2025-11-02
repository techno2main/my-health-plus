import { useState } from "react";
import { ExportDialog } from "./ExportDialog";
import { ExportStep } from "./DeleteAccountSteps/ExportStep";
import { WarningStep } from "./DeleteAccountSteps/WarningStep";
import { ConfirmationStep } from "./DeleteAccountSteps/ConfirmationStep";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (password: string) => Promise<boolean>;
  authProvider: string | null;
  biometricEnabled: boolean;
}

type DeleteStep = "export" | "warning" | "confirmation" | "closed";

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  authProvider,
  biometricEnabled,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<DeleteStep>("export");
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleClose = () => {
    setStep("export");
    setUnderstood(false);
    setPassword("");
    setIsDeleting(false);
    setShowExportDialog(false);
    onOpenChange(false);
  };

  const handleExportAndContinue = () => {
    setShowExportDialog(true);
  };

  const handleExportComplete = () => {
    setShowExportDialog(false);
    setStep("warning");
  };

  const handleSkipExport = () => {
    setStep("warning");
  };

  const handleAcceptWarning = () => {
    setStep("confirmation");
  };

  const handleFinalDelete = async () => {
    if (!understood) return;

    // Cas 1: Compte Google (pas de mot de passe)
    if (authProvider === "google") {
      setIsDeleting(true);
      const success = await onConfirmDelete("");
      setIsDeleting(false);
      if (success) {
        handleClose();
      }
      return;
    }

    // Cas 2: Biométrie activée (pas de mot de passe)
    if (biometricEnabled) {
      setIsDeleting(true);
      const success = await onConfirmDelete("");
      setIsDeleting(false);
      if (success) {
        handleClose();
      }
      return;
    }

    // Cas 3: Authentification par mot de passe
    if (!password || password.length < 6) {
      return;
    }

    setIsDeleting(true);
    const success = await onConfirmDelete(password);
    setIsDeleting(false);
    
    if (success) {
      handleClose();
    }
  };

  return (
    <>
      <ExportStep
        open={open && step === "export"}
        onClose={handleClose}
        onExport={handleExportAndContinue}
        onSkip={handleSkipExport}
      />

      <WarningStep
        open={open && step === "warning"}
        onClose={handleClose}
        onConfirm={handleAcceptWarning}
      />

      <ConfirmationStep
        open={open && step === "confirmation"}
        onClose={handleClose}
        onConfirm={handleFinalDelete}
        authProvider={authProvider}
        biometricEnabled={biometricEnabled}
        understood={understood}
        onUnderstoodChange={setUnderstood}
        password={password}
        onPasswordChange={setPassword}
        isDeleting={isDeleting}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExportComplete={handleExportComplete}
      />
    </>
  );
}

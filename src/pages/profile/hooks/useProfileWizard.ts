import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

const WIZARD_COMPLETED_PREFIX = "profileWizardCompleted_";

export const useProfileWizard = () => {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  const completeWizard = useCallback(() => {
    if (user) {
      const key = `${WIZARD_COMPLETED_PREFIX}${user.id}`;
      localStorage.setItem(key, 'true');
      setShowWizard(false);
    }
  }, [user]);

  const resetWizard = useCallback(() => {
    if (user) {
      const key = `${WIZARD_COMPLETED_PREFIX}${user.id}`;
      localStorage.removeItem(key);
    }
  }, [user]);

  // Ouvrir manuellement le wizard (depuis le bouton Modifier ou un CTA)
  const openWizard = useCallback(() => {
    setShowWizard(true);
  }, []);

  const closeWizard = useCallback(() => {
    setShowWizard(false);
  }, []);

  return {
    showWizard,
    openWizard,
    closeWizard,
    completeWizard,
    resetWizard,
  };
};

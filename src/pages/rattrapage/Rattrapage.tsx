import { AppLayout } from "@/components/Layout/AppLayout";
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "./components/EmptyState";
import { ActionSummary } from "./components/ActionSummary";
import { IntakeCard } from "./components/IntakeCard";
import { RattrapageConfirmationDialog } from "./components/ConfirmationDialog";
import { useMissedIntakesDetection } from "@/hooks/useMissedIntakesDetection";
import { useRattrapageActions } from "./hooks/useRattrapageActions";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Rattrapage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { missedIntakes, totalMissed, loading } = useMissedIntakesDetection();
  const {
    actions,
    confirmDialog,
    saving,
    openConfirmDialog,
    confirmAction,
    handleCancelAll,
    handleSaveAll,
    pendingCount,
    processedCount,
    closeDialog,
  } = useRattrapageActions(missedIntakes);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-muted-foreground">Chargement...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto px-4 pb-6">
        <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
          <PageHeaderWithHelp
            title="Mise à jour des prises"
            subtitle={totalMissed === 0 ? "Aucune prise non traitée" : `${totalMissed} prise${totalMissed > 1 ? 's' : ''} non traitée${totalMissed > 1 ? 's' : ''} à mettre à jour`}
            helpText="Gérez les prises non traitées en les marquant comme prises, sautées ou en ajustant leur statut. Toutes les modifications sont regroupées pour validation."
            leftButton={
              <button
                onClick={() => navigate("/")}
                className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                title="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            }
          />
        </div>

        <div className="mt-4 space-y-6">

        {totalMissed === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ActionSummary
              totalMissed={totalMissed}
              processedCount={processedCount}
              pendingCount={pendingCount}
              onCancelAll={handleCancelAll}
              onSaveAll={handleSaveAll}
              saving={saving}
            />

            <div className="space-y-3">
              {missedIntakes.map((intake) => (
                <IntakeCard
                  key={intake.id}
                  intake={intake}
                  currentAction={actions[intake.id]}
                  onActionClick={openConfirmDialog}
                />
              ))}
            </div>

            <RattrapageConfirmationDialog
              confirmDialog={confirmDialog}
              onClose={closeDialog}
              onConfirm={confirmAction}
            />
          </>
        )}
        </div>
      </div>
    </AppLayout>
  );
}

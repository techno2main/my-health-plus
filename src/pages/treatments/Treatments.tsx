import { AppLayout } from "@/components/Layout/AppLayout"
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTreatmentsList } from "./hooks/useTreatmentsList"
import { TreatmentCard } from "./components/TreatmentCard"
import { EmptyState } from "./components/EmptyState"

const Treatments = () => {
  const navigate = useNavigate()
  const { treatments, loading, reloadTreatments } = useTreatmentsList()

  const activeTreatmentsCount = treatments.filter(t => t.is_active).length
  
  // Fonction pour gérer le pluriel
  const getSubtitle = () => {
    if (activeTreatmentsCount === 0) return "Aucun traitement actif"
    if (activeTreatmentsCount === 1) return "1 traitement actif"
    return `${activeTreatmentsCount} traitements actifs`
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-3 md:px-4 py-6">
          <p>Chargement...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-3 md:px-4 pb-6">
        <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
          <PageHeaderWithHelp 
            title="Traitement(s)" 
            subtitle={getSubtitle()}
            helpText="Gérez tous vos traitements médicamenteux : ajoutez de nouveaux traitements, modifiez les posologies, consultez l'historique et suivez vos prises quotidiennes."
            leftButton={
              <button
                onClick={() => navigate("/")}
                className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                title="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            }
            rightButton={
              <Button
                onClick={() => navigate("/treatments/new")}
                size="sm"
                className="shrink-0 h-8 w-8 p-0"
                title="Ajouter un traitement"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* Treatments List */}
        <div className="space-y-4 mt-4">
          {treatments.length === 0 ? (
            <EmptyState />
          ) : (
            treatments.map((treatment) => (
              <TreatmentCard 
                key={treatment.id} 
                treatment={treatment} 
                onTreatmentTerminated={reloadTreatments}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default Treatments

import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, ShieldAlert } from "lucide-react";
import { useMedicationCatalog } from "./hooks/useMedicationCatalog";
import { MedicationSearchBar } from "./components/MedicationSearchBar";
import { MedicationList } from "./components/MedicationList";
import { MedicationDialog } from "./components/MedicationDialog";
import { MedicationDeleteAlert } from "./components/MedicationDeleteAlert";
import { AlphabetFilter } from "./components/AlphabetFilter";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";

const MedicationCatalog = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const hasLoaded = useRef(false);
  
  const {
    medications,
    pathologies,
    loading,
    searchTerm,
    setSearchTerm,
    selectedLetter,
    setSelectedLetter,
    isAlphabetOpen,
    setIsAlphabetOpen,
    showDialog,
    closeDialog,
    showDeleteAlert,
    setShowDeleteAlert,
    editingMed,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    confirmDelete,
    handleStockClick,
    filteredMedications,
    openDialog,
    navigate,
    loadMedications,
    loadPathologies,
  } = useMedicationCatalog();

  // Charger UNE SEULE FOIS après vérification admin
  useEffect(() => {
    if (!roleLoading && isAdmin && !hasLoaded.current) {
      hasLoaded.current = true;
      console.log('[CATALOG] Chargement initial...');
      loadPathologies();
      loadMedications();
    }
  }, [roleLoading, isAdmin]);

  // Recharger quand la lettre change (mais seulement si déjà initialisé)
  useEffect(() => {
    if (hasLoaded.current && selectedLetter) {
      console.log('[CATALOG] Rechargement pour lettre:', selectedLetter);
      loadMedications();
    }
  }, [selectedLetter]);

  // Protection admin : afficher message si non-admin
  if (roleLoading) {
    return (
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Vérification des permissions...</p>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Accès restreint</h1>
          </div>
          
          <Card className="p-8 text-center space-y-4">
            <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">Accès administrateur requis</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Cette page est réservée aux administrateurs. 
              Le catalogue de médicaments est accessible lors de la création d'un traitement.
            </p>
            <Button 
              onClick={() => navigate("/treatments")} 
              className="gradient-primary"
            >
              Voir mes traitements
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/referentials")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <header className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Médicaments</h1>
              <p className="text-sm text-muted-foreground">
                {filteredMedications.length} médicament(s)
                {selectedLetter !== "ALL" && ` · Lettre ${selectedLetter}`}
              </p>
            </div>
            <Button className="gradient-primary" onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </header>
        </div>

        <AlphabetFilter 
          selectedLetter={selectedLetter} 
          onLetterChange={setSelectedLetter}
          isOpen={isAlphabetOpen}
          onToggle={() => setIsAlphabetOpen(!isAlphabetOpen)}
        />

        <MedicationSearchBar value={searchTerm} onChange={setSearchTerm} />

        <MedicationList
          medications={filteredMedications}
          loading={loading}
          onEdit={openDialog}
          onDelete={confirmDelete}
          onStockClick={handleStockClick}
        />

        <MedicationDialog
          open={showDialog}
          onOpenChange={closeDialog}
          editingMed={editingMed}
          formData={formData}
          setFormData={setFormData}
          pathologies={pathologies}
          onSubmit={handleSubmit}
          onStockClick={handleStockClick}
        />

        <MedicationDeleteAlert
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
          onConfirm={handleDelete}
        />
      </div>
    </AppLayout>
  );
};

export default MedicationCatalog;

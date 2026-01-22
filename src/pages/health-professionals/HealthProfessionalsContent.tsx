import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { filterByType, TabType, mapTypeToDb, ProfessionalType, type HealthProfessional, type HealthProfessionalFormData } from "./utils/professionalUtils";
import { useEntityCrud } from "@/hooks/generic/useEntityCrud";
import { useEntityDialog } from "@/hooks/generic/useEntityDialog";
import { ProfessionalTabs } from "./components/ProfessionalTabs";
import { ProfessionalDialog } from "./components/ProfessionalDialog";
import { ProfessionalDeleteAlert } from "./components/ProfessionalDeleteAlert";
import { FloatingAddButton } from "./components/FloatingAddButton";

export const HealthProfessionalsContent = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("medecins");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Lire le paramètre tab de l'URL au chargement
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'pharmacies' || tabParam === 'laboratoires') {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Hook générique CRUD
  const {
    items: professionals,
    isLoading,
    create: createProfessional,
    update: updateProfessional,
    deleteEntity: deleteProfessional,
  } = useEntityCrud<HealthProfessional, HealthProfessionalFormData>({
    tableName: "health_professionals",
    queryKey: ["health-professionals"],
    entityName: "Professionnel",
    orderBy: "name"
  });

  // Hook générique Dialog
  const {
    showDialog,
    editingItem,
    formData,
    setFormData,
    openDialog,
    closeDialog,
  } = useEntityDialog<HealthProfessional, HealthProfessionalFormData>({
    name: "",
    type: "doctor",
    specialty: "",
    phone: "",
    email: "",
    street_address: "",
    postal_code: "",
    city: "",
    is_primary_doctor: false,
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  const handleAdd = (type: "medecin" | "pharmacie" | "laboratoire") => {
    const dbType = mapTypeToDb(type) as ProfessionalType;
    const customFormData: HealthProfessionalFormData = { 
      name: "",
      type: dbType,
      specialty: "",
      phone: "",
      email: "",
      street_address: "",
      postal_code: "",
      city: "",
      is_primary_doctor: false,
    };
    openDialog(undefined, customFormData);
  };

  const handleEdit = (item: HealthProfessional) => {
    openDialog(item);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleSubmit = async () => {
    const success = editingItem
      ? await updateProfessional(editingItem.id, formData)
      : await createProfessional(formData);
    
    if (success) closeDialog();
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteProfessional(deletingId);
      setDeletingId(null);
    }
  };

  const filteredData = {
    medecins: filterByType(professionals, "medecins", searchTerm),
    pharmacies: filterByType(professionals, "pharmacies", searchTerm),
    laboratoires: filterByType(professionals, "laboratoires", searchTerm),
  };

  return (
    <div className="space-y-6">
      <ProfessionalTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        professionals={filteredData}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <FloatingAddButton onAdd={handleAdd} />

      <ProfessionalDialog
        open={showDialog}
        onClose={closeDialog}
        editingItem={editingItem}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
      />

      <ProfessionalDeleteAlert
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

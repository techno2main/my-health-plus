import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AllergyList } from "./components/AllergyList";
import { AllergyDialog } from "./components/AllergyDialog";
import { AllergyDeleteAlert } from "./components/AllergyDeleteAlert";
import { useEntityCrud } from "@/hooks/generic/useEntityCrud";
import { useEntityDialog } from "@/hooks/generic/useEntityDialog";
import { type Allergy, type AllergyFormData } from "./utils/allergyUtils";

export const AllergiesContent = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Hook générique CRUD
  const { 
    items: allergies, 
    isLoading, 
    create: createAllergy, 
    update: updateAllergy, 
    deleteEntity: deleteAllergy 
  } = useEntityCrud<Allergy, AllergyFormData>({
    tableName: "allergies",
    queryKey: ["allergies"],
    entityName: "Allergie",
    orderBy: "name",
    addUserId: false
  });

  // Hook générique Dialog
  const { 
    showDialog, 
    editingItem, 
    formData, 
    setFormData, 
    openDialog, 
    closeDialog 
  } = useEntityDialog<Allergy, AllergyFormData>({
    name: "",
    severity: undefined,
    description: null
  });

  const handleEdit = (item: Allergy) => {
    openDialog(item);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleSubmit = async () => {
    const success = editingItem
      ? await updateAllergy(editingItem.id, formData)
      : await createAllergy(formData);
    
    if (success) closeDialog();
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteAllergy(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={() => openDialog()}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Ajouter une allergie
      </Button>

      <AllergyList
        allergies={allergies}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AllergyDialog
        open={showDialog}
        onClose={closeDialog}
        editingItem={editingItem}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
      />

      <AllergyDeleteAlert
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PathologyList } from "./components/PathologyList";
import { PathologyDialog } from "./components/PathologyDialog";
import { PathologyDeleteAlert } from "./components/PathologyDeleteAlert";
import { useEntityCrud } from "@/hooks/generic/useEntityCrud";
import { useEntityDialog } from "@/hooks/generic/useEntityDialog";
import { type Pathology, type PathologyFormData } from "./utils/pathologyUtils";
import { toast } from "sonner";

export const PathologiesContent = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Hook générique CRUD
  const { 
    items: pathologies, 
    isLoading, 
    create: createPathology, 
    update: updatePathology, 
    deleteEntity: deletePathology 
  } = useEntityCrud<Pathology, PathologyFormData>({
    tableName: "pathologies",
    queryKey: ["pathologies"],
    entityName: "Pathologie",
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
  } = useEntityDialog<Pathology, PathologyFormData>({
    name: "",
    description: null,
    severity: ""
  });

  const handleEdit = (item: Pathology) => {
    openDialog(item);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Le nom de la pathologie est obligatoire");
      return;
    }

    const success = editingItem
      ? await updatePathology(editingItem.id, formData)
      : await createPathology(formData);
    
    if (success) closeDialog();
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deletePathology(deletingId);
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
        Ajouter une pathologie
      </Button>

      <PathologyList
        pathologies={pathologies}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => openDialog()}
      />

      <PathologyDialog
        open={showDialog}
        onClose={closeDialog}
        editingItem={editingItem}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
      />

      <PathologyDeleteAlert
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
